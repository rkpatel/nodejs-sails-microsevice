/* eslint-disable camelcase */
/***************************************************************************

  Controller     : User

  **************************************************
  Functions
  **************************************************

  login
  changePassword
  forgotPassword
  resetPassword

  **************************************************

***************************************************************************/


const { hashPassword, comparePassword } = require('../services/bcrypt');
const { generateToken, verify, verifyimpersonate } = require('../services/jwt');
const UserValidations = require('../validations/UserValidations');
const { tenantConnection, escapeSqlSearch } = require('../services/utils');
const moment = require('moment');
const { ACCOUNT_STATUS, RESPONSE_STATUS,LOGIN_STATUS, NOTIFICATION_ENTITIES, PORTAL_ACCESS_STATUS, ACCOUNT_CONFIG_CODE } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const env = sails.config.custom;
const { getDateUTC, formatDate } = require('../utils/common/getDateTime');
const { sendNotification } = require('../services/sendNotification');
const { assignAutoCertificate, answerDynamicQuestion, getDynamicQuestion } = require('../utils/common/apiCall');

const userLoginLogsCreate = async function (user, req, message, status)  {
  const { device_id, device_os_name, device_os_version, device_info } = req.allParams();
  const userLogs = await UserLoginLog.create({
    user_id           : user.user_id,
    thru_mobile       : device_id ? 1 : 0,
    device_id         : device_id ? device_id : '',
    device_os_name    : device_os_name ? device_os_name : '',
    device_os_version : device_os_version ? device_os_version : '',
    device_info       : device_info ? device_info : '',
    app_version       : req.headers['user-agent'],
    ip_adress         : req.ip,
    status            : status ? LOGIN_STATUS.success : LOGIN_STATUS.failure,
    login_date_time   : getDateUTC(),
    login_error       : message ? message : '',
  });
  sails.log(userLogs);
};

const accountIdData=async(accountUserDetails)=>{
  return  accountUserDetails ? parseInt(accountUserDetails.account_id) : '';
};

const userDetailsData=async(account_id,admin_account_id,email)=>{
  return account_id === admin_account_id ?  Users.findOne({ email: email }) :  Users.findOne({ email: email, portal_access: PORTAL_ACCESS_STATUS.customer });
};

const accountExistOrNotDetailsData=async(accountExistOrNot,today,res)=>{
  for (const item of accountExistOrNot) {
    if (item.subscription_status === ACCOUNT_STATUS.inactive) {
      return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
    }
    const expiry_date = moment(item.expiry_date).format('YYYY-MM-DD');
    if (expiry_date < today) {
      return res.ok(undefined, messages.ACCOUNT_EXPIRED, RESPONSE_STATUS.error);
    }
  }
};

const locJobArrCondition=async(loc_arr,job_arr,req)=>{
  if (loc_arr.length > 0) {
    await EmpLocation.createEach(loc_arr).usingConnection(req.dynamic_connection);
  }
  if (job_arr.length > 0) {
    await EmpJobType.createEach(job_arr).usingConnection(req.dynamic_connection);
  }
};

module.exports = {

  login: async (req, res) => {
    let request = req.allParams();
    if(request.itoken !== undefined && request.itoken !== null && request.itoken !== ''){
      const itoken = request.itoken;
      let portal = request.portal;
      let admin_email = '';
      let customer_email = '';
      // eslint-disable-next-line no-unused-vars
      let employee_email = '';
      if(portal === 'admin') {
        let decodedtoken = verifyimpersonate(itoken);
        admin_email = decodedtoken.admin_email;
        customer_email = decodedtoken.customer_email;
      } else if (portal === 'primaryuser') {
        let decodedtoken = verify(itoken);
        employee_email = decodedtoken.employee_user_email;
        customer_email = decodedtoken.customer_email;
      } else if (portal === 'employee') {
        let decodedtoken = verify(itoken);
        employee_email = decodedtoken.customer_email;
        customer_email = decodedtoken.employee_user_email;
      }
      const customerUser = await Users.findOne({ email: customer_email });
      const impersonteToken = customerUser.impersonation_token;

      if(itoken === impersonteToken) {
        const customerUserId = customerUser.user_id;
        await Users.update({ user_id: customerUserId }, {
          impersonation_token : '',
          last_updated_date   : getDateUTC()
        }).fetch();

        const accountUsersql = `Select account.account_guid,account.status as accountstatus,account.theme as account_theme, 
              au.account_id,u.primary_user, ac.name, asb.expiry_date,account.company_logo_url, asb.subscription_status as subscription_status,asb.payment_status as payment_status,
              MAX(case when acd.code = "date_format" then acd.value end) as 'date_format',
              MAX(case when acd.code = "date_time_format" then acd.value end) as 'date_time_format',
              MAX(case when acd.code = "time_zone" then acd.value end) as 'time_zone'
              from account_user au
              INNER JOIN account ON au.account_id = account.account_id
              INNER JOIN account_configuration ac ON au.account_id = ac.account_id
              INNER JOIN account_configuration_detail acd ON ac.account_configuration_id = acd.account_configuration_id AND acd.code IN ('${ACCOUNT_CONFIG_CODE.date_format}','${ACCOUNT_CONFIG_CODE.date_time_format}','${ACCOUNT_CONFIG_CODE.time_zone}')
              INNER JOIN account_subscription asb ON au.account_id = asb.account_id  
              INNER JOIN user u ON au.user_id = u.user_id 
              where au.user_id= ${customerUserId}
              GROUP BY acd.account_configuration_id`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(accountUsersql));
        let results = rawResult.rows;
        if(results.length === 1)
        {
          // check account is active or not
          const today = moment(Date.now()).format('YYYY-MM-DD');
          const expiry_date = moment(results[0].expiry_date).format('YYYY-MM-DD');
          if (results[0].accountstatus === ACCOUNT_STATUS.inactive) {
            userLoginLogsCreate(customerUser, req, messages.ACCOUNT_STATUS, false);
            return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
          }
          //cancel account
          if (results[0].accountstatus === ACCOUNT_STATUS.cancelled) {
            if(results[0].primary_user !== 'Yes'){
              userLoginLogsCreate(customerUser, req, messages.ACCOUNT_STATUS, false);
              return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
            }
          }
          //check to allow only primary user to login when account status is payment pending or payment declined
          if(expiry_date > today){
            if((results[0].accountstatus === ACCOUNT_STATUS.payment_pending || results[0].accountstatus === ACCOUNT_STATUS.payment_declined))
            {
              if(results[0].primary_user !== 'Yes'){
                userLoginLogsCreate(customerUser, req, messages.ACCOUNT_STATUS, false);
                return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
              }
            }

          }
          //check to allow only primary user to login when account status is payment pending or payment declined
          if (expiry_date < today) {
            if((results[0].accountstatus === ACCOUNT_STATUS.payment_pending || results[0].accountstatus === ACCOUNT_STATUS.payment_declined))
            {
              if(results[0].primary_user !== 'Yes'){
                userLoginLogsCreate(customerUser, req, messages.ACCOUNT_EXPIRED, false);
                return res.ok(undefined, messages.ACCOUNT_EXPIRED, RESPONSE_STATUS.error);
              }
            }
          }
        }
        else{
          userLoginLogsCreate(customerUser, req, messages.USER_NOT_ACTIVE, false);
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }


        let connection = await tenantConnection(results[0].account_id);
        req.dynamic_connection = connection.connection;
        const empProfile = await EmployeeProfile.findOne({ user_id: customerUser.user_id }).usingConnection(connection.connection);

        if (empProfile && empProfile.status === ACCOUNT_STATUS.inactive) {
          userLoginLogsCreate(customerUser, req, messages.ACCOUNT_STATUS, false);
          return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
        }
        let role; let role_dashboard;
        if(empProfile){
          const roleExits= await Role.findOne({ role_id: empProfile.role_id}).usingConnection(connection.connection);
          role = (roleExits.name) ? (roleExits.name) : '';
          role_dashboard = (roleExits.dashboard) ? (roleExits.dashboard): '';
          if(roleExits && roleExits.status === ACCOUNT_STATUS.inactive){

            userLoginLogsCreate(customerUser, req, messages.ACCOUNT_STATUS, false);
            return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
          }
        }
        const actionSql = await sails.sendNativeQuery(`SELECT permission.code, role.name, pm.code as permission_module FROM role_permission rp INNER JOIN permission
            ON rp.permission_id = permission.permission_id INNER JOIN role
            ON rp.role_id = role.role_id INNER JOIN permission_module as pm ON permission.permission_module_id = pm.permission_module_id where permission.status = 'Active' AND rp.role_id = ${empProfile.role_id}; 
            `).usingConnection(connection.connection);
        const action = actionSql.rows;
        let resp_permission = [];
        let permission_module = [];
        for (const permission of action) {
          resp_permission.push(permission.code);
          if(!permission_module.includes(permission.permission_module))
          {
            permission_module.push(permission.permission_module);
          }
        }

        const genToken = await generateToken({
          id                  : customerUser.user_id,
          employee_profile_id : empProfile.employee_profile_id,
          isLoggedIn          : true,
          tenantId            : results[0].account_id,
          tenantGuid          : results[0].account_guid
        }, env.JWT_LOGIN_EXPIRY);


        let _customerUser = {
          user_id             : customerUser.user_id,
          employee_profile_id : empProfile.employee_profile_id,
          role                : role,
          role_dashboard      : role_dashboard,
          email               : customerUser.email,
          first_name          : customerUser.first_name,
          last_name           : customerUser.last_name,
          phone               : customerUser.phone,
          date_of_birth       : customerUser.date_of_birth,
          profile_picture_url : customerUser.profile_picture_url
        };
        if(portal === 'admin') {
          _customerUser.admin_user = admin_email;
        } else if (portal === 'employee') {
          _customerUser.primary_user = employee_email;
        }


        let resp_accounts = [];

        if (results && results.length > 0) {
          resp_accounts = results.map(account => {
            return {
              name             : account.name,
              account_id       : account.account_id,
              account_guid     : account.account_guid,
              account_status   : account.accountstatus,
              account_theme    : account.account_theme,
              payment_status   : account.payment_status,
              company_logo_url : account.company_logo_url,
              dateTimeFormat   : account.date_time_format,
              dateFormat       : account.date_format,
              timeZone         : account.time_zone
            };
          });
        }

        await userLoginLogsCreate(customerUser, req, messages.LOGIN_SUCCESS, true);
        return res.ok({
          token                   : genToken,
          expiryTime              : process.env.JWT_EXPIRY,
          user                    : _customerUser,
          accountData             : resp_accounts.length ? resp_accounts[0] : {},
          permissions             : resp_permission,
          permissions_module      : permission_module,
          bulk_import_sample_file : `${process.env.PROFILE_PIC_CDN_URL}/master/ot360-bulk-import-sample.xlsx`
        }, messages.LOGIN_SUCCESS, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.INVALID_TOKEN, RESPONSE_STATUS.error);
      }
    } else {
      const isValidate = await UserValidations.login.validate(request);
      if (!isValidate.error) {
        const { email, password } = req.allParams();
        const accountUser = await sails.sendNativeQuery(`SELECT au.account_id FROM ${process.env.DB_NAME}.account_user AS au JOIN ${process.env.DB_NAME}.user AS u ON au.user_id = u.user_id WHERE u.email = '${email}' `);
        const accountUserDetails = accountUser.rows[0] || null;
        const account_id = (accountUserDetails) ? parseInt(accountUserDetails.account_id) : '';
        const admin_account_id = parseInt(process.env.ADMIN_ACCOUNT_ID);
        let user = {};
        // check if configure account id is match with loggedin user then allow user to login in customer portal still they have access of admin portal
        if(account_id === admin_account_id) {
          user = await Users.findOne({ email: email });
        } else {
          user = await Users.findOne({ email: email, portal_access: PORTAL_ACCESS_STATUS.customer });
        }

        if (!user) {
          return res.ok(undefined, messages.INCORRECT_CREDENTIALS, RESPONSE_STATUS.error);
        } else {
          let isPasswordMatched = await comparePassword(password, user.password);
          if (!isPasswordMatched) {
            await userLoginLogsCreate(user, req, messages.INCORRECT_CREDENTIALS, false);
            res.ok(undefined, messages.INCORRECT_CREDENTIALS, RESPONSE_STATUS.error);
          } else {
          // check user is active or not
            if (user.status === ACCOUNT_STATUS.inactive || user.status === ACCOUNT_STATUS.invited) {
              await userLoginLogsCreate(user, req, messages.ACCOUNT_STATUS, false);
              return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
            }

            const accountUsersql = `Select account.account_guid,account.status as accountstatus,account.theme as account_theme, 
              au.account_id,u.primary_user, ac.name, asb.expiry_date,account.company_logo_url, asb.subscription_status as subscription_status,asb.payment_status as payment_status,
              MAX(case when acd.code = "date_format" then acd.value end) as 'date_format',
              MAX(case when acd.code = "date_time_format" then acd.value end) as 'date_time_format',
              MAX(case when acd.code = "time_zone" then acd.value end) as 'time_zone'
              from account_user au
              INNER JOIN account ON au.account_id = account.account_id
              INNER JOIN account_configuration ac ON au.account_id = ac.account_id
              INNER JOIN account_configuration_detail acd ON ac.account_configuration_id = acd.account_configuration_id AND acd.code IN ('${ACCOUNT_CONFIG_CODE.date_format}','${ACCOUNT_CONFIG_CODE.date_time_format}','${ACCOUNT_CONFIG_CODE.time_zone}')
              INNER JOIN account_subscription asb ON au.account_id = asb.account_id  
              INNER JOIN user u ON au.user_id = u.user_id 
              where au.user_id= ${user.user_id}
              GROUP BY acd.account_configuration_id`;

            const rawResult = await sails.sendNativeQuery(escapeSqlSearch(accountUsersql));
            let results = rawResult.rows;
            if(results.length === 1)
            {
            // check account is active or not
              const today = moment(Date.now()).format('YYYY-MM-DD');
              const expiry_date = moment(results[0].expiry_date).format('YYYY-MM-DD');
              if (results[0].accountstatus === ACCOUNT_STATUS.inactive) {
                userLoginLogsCreate(user, req, messages.ACCOUNT_STATUS, false);
                return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
              }
              //cancel account
              if (results[0].accountstatus === ACCOUNT_STATUS.cancelled) {
                if(results[0].primary_user !== 'Yes'){
                  userLoginLogsCreate(user, req, messages.ACCOUNT_STATUS, false);
                  return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
                }
              }
              //check to allow only primary user to login when account status is payment pending or payment declined
              if(expiry_date > today){
                if((results[0].accountstatus === ACCOUNT_STATUS.payment_pending || results[0].accountstatus === ACCOUNT_STATUS.payment_declined))
                {
                  if(results[0].primary_user !== 'Yes'){
                    userLoginLogsCreate(user, req, messages.ACCOUNT_STATUS, false);
                    return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
                  }
                }

              }
              //check to allow only primary user to login when account status is payment pending or payment declined
              if (expiry_date < today) {
                if((results[0].accountstatus === ACCOUNT_STATUS.payment_pending || results[0].accountstatus === ACCOUNT_STATUS.payment_declined))
                {
                  if(results[0].primary_user !== 'Yes'){
                    userLoginLogsCreate(user, req, messages.ACCOUNT_EXPIRED, false);
                    return res.ok(undefined, messages.ACCOUNT_EXPIRED, RESPONSE_STATUS.error);
                  }
                }
              }
            }
            else{
              userLoginLogsCreate(user, req, messages.USER_NOT_ACTIVE, false);
              return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
            }


            let connection = await tenantConnection(results[0].account_id);
            req.dynamic_connection = connection.connection;
            const empProfile = await EmployeeProfile.findOne({ user_id: user.user_id }).usingConnection(connection.connection);

            if (empProfile && empProfile.status === ACCOUNT_STATUS.inactive) {
              userLoginLogsCreate(user, req, messages.ACCOUNT_STATUS, false);
              return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
            }
            let role; let role_dashboard;
            if(empProfile){
              const roleExits= await Role.findOne({ role_id: empProfile.role_id}).usingConnection(connection.connection);
              role = (roleExits.name) ? (roleExits.name) : '';
              role_dashboard = (roleExits.dashboard) ? (roleExits.dashboard): '';
              if(roleExits && roleExits.status === ACCOUNT_STATUS.inactive){

                userLoginLogsCreate(user, req, messages.ACCOUNT_STATUS, false);
                return res.ok(undefined, messages.ACCOUNT_STATUS, RESPONSE_STATUS.error);
              }
            }
            const actionSql = await sails.sendNativeQuery(`SELECT permission.code, role.name, pm.code as permission_module FROM role_permission rp INNER JOIN permission
            ON rp.permission_id = permission.permission_id INNER JOIN role
            ON rp.role_id = role.role_id INNER JOIN permission_module as pm ON permission.permission_module_id = pm.permission_module_id where permission.status = 'Active' AND rp.role_id = ${empProfile.role_id}; 
            `).usingConnection(connection.connection);
            const action = actionSql.rows;
            let resp_permission = [];
            let permission_module = [];
            for (const permission of action) {
              resp_permission.push(permission.code);
              if(!permission_module.includes(permission.permission_module))
              {
                permission_module.push(permission.permission_module);
              }
            }

            let token = await generateToken({
              id                  : user.user_id,
              employee_profile_id : empProfile.employee_profile_id,
              isLoggedIn          : true,
              tenantId            : results[0].account_id,
              tenantGuid          : results[0].account_guid
            }, env.JWT_LOGIN_EXPIRY);


            let _user = {
              user_id             : user.user_id,
              employee_profile_id : empProfile.employee_profile_id,
              role                : role,
              role_dashboard      : role_dashboard,
              email               : user.email,
              first_name          : user.first_name,
              last_name           : user.last_name,
              phone               : user.phone,
              date_of_birth       : user.date_of_birth,
              profile_picture_url : user.profile_picture_url
            };


            let resp_accounts = [];

            if (results && results.length > 0) {
              resp_accounts = results.map(account1 => {

                return {
                  name             : account1.name,
                  account_id       : account1.account_id,
                  account_guid     : account1.account_guid,
                  account_status   : account1.accountstatus,
                  account_theme    : account1.account_theme,
                  payment_status   : account1.payment_status,
                  company_logo_url : account1.company_logo_url,
                  dateTimeFormat   : account1.date_time_format,
                  dateFormat       : account1.date_format,
                  timeZone         : account1.time_zone
                };
              });
            }

            await userLoginLogsCreate(user, req, messages.LOGIN_SUCCESS, true);
            return res.ok({
              token                   : token,
              expiryTime              : process.env.JWT_EXPIRY,
              user                    : _user,
              accountData             : resp_accounts.length ? resp_accounts[0] : {},
              permissions             : resp_permission,
              permissions_module      : permission_module,
              bulk_import_sample_file : `${process.env.PROFILE_PIC_CDN_URL}/master/ot360-bulk-import-sample.xlsx`
            }, messages.LOGIN_SUCCESS, RESPONSE_STATUS.success);
          }
        }
      } else {
        res.ok(isValidate.error, messages.LOGIN_FAILURE, RESPONSE_STATUS.error);
      }
    }

  },
  selectTenant: async (req, res) => {
    const tenantId = req.allParams().tenantId;
    let accountUserList = [];
    const user = req.user;
    const accountUsers = await AccountUserMapping.find({ user_id: req.user.user_id, account_id: tenantId }).populate('account_id').populate('user_id');
    if (accountUsers) {
      await new Promise((resolve) => {
        setTimeout(async () => {
          accountUsers.forEach(async (datas) => {
            const response = await AccountConfiguration.findOne({ account_id: datas.account_id.account_id }).populate('account_id');
            const buffer = new Buffer(response.logo_img);
            const bufferBase64 = buffer.toString('base64');
            response.logo_img = bufferBase64;
            Object.assign(response, { tenantId: response.account_id.account_id });
            delete response.tenant_db_connection_string;
            accountUserList.push(response);
            resolve(accountUserList);
          });
        });
      });
    }
    let connection = await tenantConnection(tenantId);
    req.dynamic_connection = connection.connection;
    const action = await RolePermission.find({ role_id: user.role_id }).populate('permission_id').usingConnection(connection.connection);

    let permissionList = [];
    let permissionModuleList = [];
    for (const permission in action) {
      let permissionModule = await PermissionModule.findOne({ permission_module_id: action[permission].permission_id.permission_module_id }).usingConnection(connection.connection);
      permissionModuleList.push(permissionModule);
      permissionList.push(action[permission].permission_id);
    }
    const token = generateToken({ id: req.user.user_id, isLoggedIn: true, sessioId: req.token.sessionId, tenantId: tenantId }, env.JWT_LOGIN_EXPIRY);
    const data = {
      'key'   : req.token.sessionId,
      'value' : {
        user_id : user.user_id,
        email   : user.email,
        token   : token
      }
    };
    sails.log(data);

    return res.ok({ token: token, expiryTime: '1 day', user: user, permissionList: permissionList, permissionModuleList: permissionModuleList, Account: accountUserList, }, messages.SELECT_TENANT, RESPONSE_STATUS.success);
  },

  changePassword: async (req, res) => {
    const isValidate = await UserValidations.changePassword.validate(req.allParams());
    if (!isValidate.error) {
      const { password, newpassword, confirmpassword } = req.allParams();
      let user_id = req.user.user_id;
      const user = await Users.find({ user_id: user_id, portal_access: PORTAL_ACCESS_STATUS.customer }).limit(1);
      if (!user) {
        return res.notFound(undefined, messages.USER_NOT_FOUND);
      } else {
        let isPasswordMatched = await comparePassword(password, user[0].password);
        if (!isPasswordMatched) {
          res.ok(undefined, messages.CHANGEPASSWORD_INCORRECT_PWD);
        } else {
          if (newpassword === confirmpassword) {
            const encryptedPassword = await hashPassword(newpassword);
            await Users.update({ user_id: user_id }, {
              password          : encryptedPassword,
              last_updated_date : getDateUTC()
            }).fetch();
            return res.ok(undefined, messages.CHANGE_PASSWORD, RESPONSE_STATUS.success);
          }
        }
      }
    } else {
      res.badRequest(isValidate.error, messages.CHANGE_PASSWORD_FAILURE);
    }
  },
  createPassword: async (req, res) => {
    const isValidate = await UserValidations.createPassword.validate(req.allParams());
    if (!isValidate.error) {
      const {
        password,
        confirmpassword,
        emergency_contact_name,
        emergency_contact_relation,
        emergency_contact_number,
        date_of_birth,
        location_id,
        job_type_id,
        dynamic_questions
      } = req.allParams();
      let user_id = req.user.user_id;
      const user = await Users.find({ user_id: user_id, portal_access: PORTAL_ACCESS_STATUS.customer }).limit(1);
      if (!user) {
        return res.ok(undefined, messages.USER_NOT_FOUND, RESPONSE_STATUS.error);
      } else {
        if (password === confirmpassword) {

          const encryptedPassword = await hashPassword(password);
          let updateData = {
            password                   : encryptedPassword,
            emergency_contact_name     : emergency_contact_name,
            emergency_contact_relation : emergency_contact_relation,
            emergency_contact_number   : emergency_contact_number,
            date_of_birth              : date_of_birth,
            reset_password_token       : '',
            status                     : ACCOUNT_STATUS.active,
            last_updated_date          : getDateUTC(),
            aboard_date                : getDateUTC()
          };
          await Users.update({ user_id: user_id }, updateData).fetch();

          const accountUsersql = `Select au.account_id, account.account_guid
              from account_user au
                INNER JOIN account
                ON account.account_id = au.account_id
              where au.user_id= ${user_id}`;

          const rawResult = await sails.sendNativeQuery(escapeSqlSearch(accountUsersql));
          let results = rawResult.rows;

          let connection = await tenantConnection(results[0].account_id);
          req.dynamic_connection = connection.connection;
          const result = await EmployeeProfile.findOne({ user_id: user_id }).populate('job_type_id', { select: ['job_type_id'] }).usingConnection(connection.connection);

          const itoken = await generateToken({
            id                  : user_id,
            employee_profile_id : result.employee_profile_id,
            isLoggedIn          : true,
            tenantId            : results[0].account_id,
            tenantGuid          : results[0].account_guid
          }, '300s');

          req.headers.authorization = `Bearer ${itoken}`;
          // Remove older mapping of locations and job types.
          await EmpLocation.destroy({ employee_profile_id: result.employee_profile_id }).usingConnection(req.dynamic_connection);
          await EmpJobType.destroy({ employee_profile_id: result.employee_profile_id }).usingConnection(req.dynamic_connection);

          // Create new mapping of locations and job types.
          const loc_arr = location_id.map((location) => { return { employee_profile_id: result.employee_profile_id, location_id: location, created_by: user_id, created_date: getDateUTC() }; });
          const job_arr = job_type_id.map((job) => { return { employee_profile_id: result.employee_profile_id, job_type_id: job, created_by: user_id, created_date: getDateUTC() }; });

          await locJobArrCondition(loc_arr,job_arr,req);
          // Get job_typeid and employee profile id from results
          if(job_type_id && job_type_id.length > 0){
            sails.log('calling API for assigning all certificates to single EMployee');
            // Get All Auto Certificates Linked with jobtypes and Assign Certificates to this employees.
            await assignAutoCertificate(req, {
              employee_profile_id : result.employee_profile_id,
              job_type_ids        : job_type_id,
              from_empProfile     : false
            });
          }

          await answerDynamicQuestion(req, {
            dynamic_questions   : dynamic_questions,
            employee_profile_id : result.employee_profile_id
          });

          return res.ok(undefined, messages.CREATE_PASSWORD, RESPONSE_STATUS.success);
        }
      }
    } else {
      res.ok(isValidate.error, messages.CREATE_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  forgotPassword: async (req, res) => {
    const isValidate = await UserValidations.forgotPassword.validate(req.allParams());
    if (!isValidate.error) {
      const { email } = req.allParams();

      const accountUser = await sails.sendNativeQuery(`SELECT au.account_id FROM ${process.env.DB_NAME}.account_user AS au JOIN ${process.env.DB_NAME}.user AS u ON au.user_id = u.user_id WHERE u.email = '${email}' `);
      const accountUserDetails = accountUser.rows[0] || null;
      const account_id =await accountIdData(accountUserDetails);
      const admin_account_id = parseInt(process.env.ADMIN_ACCOUNT_ID);
      let user = {};
      // check if configure account id is match with loggedin user then allow user to login in customer portal still they have access of admin portal
      user=await userDetailsData(account_id,admin_account_id,email);

      if (!user) {
        return res.ok(undefined, messages.FORGOT_PASSWORD, RESPONSE_STATUS.success);
      } else {
        const accountUsers = await AccountUserMapping.findOne({ user_id: user.user_id }).populate('account_id').populate('user_id');
        // check user is active or not
        const account = await Account.findOne({ account_id: accountUsers.account_id.account_id });
        const accountUserList = await AccountConfiguration.findOne({ account_id: accountUsers.account_id.account_id }).populate('account_id');
        if (user.status === ACCOUNT_STATUS.inactive) {
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        let connection = await tenantConnection(account.account_id);
        req.dynamic_connection = connection.connection;
        const empProfile = await EmployeeProfile.findOne({ user_id: user.user_id }).usingConnection(connection.connection);
        if (empProfile.status === ACCOUNT_STATUS.inactive) {
          return res.ok(undefined, messages.EMPLOYEE_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        const today = moment(Date.now()).format('YYYY-MM-DD');
        const accountExistOrNot = await AccountSubscription.find({ account_id: accountUserList.account_id.account_id }).populate('account_id');

        await accountExistOrNotDetailsData(accountExistOrNot,today,res);

        if (!accountExistOrNot) {
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        const token = generateToken({ id: user.user_id, isLoggedIn: false, scope: 'RESET_PASSWORD' }, env.JWT_RESET_PASS_EXPIRY);
        const resetUrl = `${process.env.FRONTEND_BASEURL}/reset-password?token=${token}`;
        await Users.update({ user_id: user.user_id }, {
          reset_password_token : token,
          last_updated_date    : getDateUTC()
        });

        await sendNotification(req,{
          notification_entity            : NOTIFICATION_ENTITIES.RESET_PASSWORD,
          recipient_email                : email,
          recipient_first_name           : user.first_name,
          recipient_last_name            : user.last_name,
          receipient_employee_profile_id : empProfile.employee_profile_id,
          url                            : resetUrl,
          account_id                     : account.account_id,
        });

        return res.ok(undefined, messages.FORGOT_PASSWORD, RESPONSE_STATUS.success);
      }
    } else {
      return res.ok(isValidate.error, messages.FORGOT_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  resetPassword: async (req, res) => {
    const isValidate = await UserValidations.resetPassword.validate(req.allParams());
    if (!isValidate.error) {
      const { password } = req.allParams();
      let user_id = req.user.user_id;
      const encryptedPassword = await hashPassword(password);
      await Users.update({ user_id }, {
        status               : ACCOUNT_STATUS.active,
        password             : encryptedPassword,
        reset_password_token : '',
        last_updated_date    : getDateUTC()
      }).fetch();
      return res.ok(undefined, messages.RESET_PASSWORD, RESPONSE_STATUS.success);
    } else {
      return res.ok(isValidate.error, messages.RESET_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  getSystemLog: async (req, res) => {
    let user_id; let account_id; let response;
    if (req.allParams().userId && req.allParams().tenantId) {
      user_id = req.allParams().userId;
      account_id = req.allParams().tenantId;
      response = await SystemLog.find({ user_id, account_id });
    }
    else if (req.allParams().tenantId) {
      account_id = req.allParams().tenantId;
      response = await SystemLog.find({ account_id });
    }
    else if (req.allParams().userId) {
      user_id = req.allParams().userId;
      response = await SystemLog.find({ user_id });
    }
    else {
      response = await SystemLog.find();
    }
    return res.ok(response, messages.GET_LIST_ERROR);
  },

  profileDetails: async (req, res) => {
    const detail = await Users.findOne({ user_id: req.user.user_id, portal_access: PORTAL_ACCESS_STATUS.customer });
    if (detail) {

      const accountUsersql = `Select au.account_id, account.account_guid
              from account_user au
                INNER JOIN account
                ON account.account_id = au.account_id
              where au.user_id= ${req.user.user_id}`;

      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(accountUsersql));
      let results = rawResult.rows;

      let connection = await tenantConnection(results[0].account_id);
      req.dynamic_connection = connection.connection;
      const result = await EmployeeProfile.findOne({ user_id: req.user.user_id }).populate('location_id', { select: ['name'] }).populate('job_type_id', { select: ['job_type_id','name'] }).usingConnection(connection.connection);
      const itoken = await generateToken({
        id                  : req.user.user_id,
        employee_profile_id : result.employee_profile_id,
        isLoggedIn          : true,
        tenantId            : results[0].account_id,
        tenantGuid          : results[0].account_guid
      }, '300s');

      req.headers.authorization = `Bearer ${itoken}`;

      // Get dynamic question list
      let primary_user = (detail.primary_user === 'Yes') ? 'yes' : 'no';

      let dynamicQuestion = await getDynamicQuestion(req,{});
      let response = {
        user_id                    : detail.user_id,
        emergency_contact_name     : detail.emergency_contact_name,
        emergency_contact_relation : detail.emergency_contact_relation,
        emergency_contact_number   : detail.emergency_contact_number,
        date_of_birth              : formatDate(detail.date_of_birth,'YYYY-MM-DD'),
        locations                  : result.location_id,
        jobTypes                   : result.job_type_id,
        dynamicQuestions           : dynamicQuestion.data.data,
        primary_user               : primary_user
      };

      return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
    }
    else {
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
    }
  },
  verifyImpersonateToken: async (req, res) => {
    const isValidate = await UserValidations.verifyImpersonateToken.validate(req.allParams());
    if (!isValidate.error) {
      const { toekn } = req.allParams();
      let user_id = '';
      let decodedtoken = verify(toekn);
      if('scope' in decodedtoken && (decodedtoken.scope === 'IMPERSONATE')) {
        user_id = decodedtoken.id;
      }

      await Users.update({ user_id }, {
        impersonation_token : '',
        last_updated_date   : getDateUTC()
      }).fetch();
      return res.ok(undefined, messages.RESET_PASSWORD, RESPONSE_STATUS.success);
    } else {
      return res.ok(isValidate.error, messages.RESET_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  SignInToAdmin: async (req, res) => {
    const isValidate = await UserValidations.SignInToAdmin.validate(req.allParams());
    if (!isValidate.error) {
      const { admin_email, customer_email } = req.allParams();
      const customerUser = await Users.findOne({ email: customer_email});
      if (!customerUser) {
        return res.ok(undefined, messages.USER_NOT_EXISTS, RESPONSE_STATUS.success);
      } else {
        // check user is active or not
        if (customerUser.status !== ACCOUNT_STATUS.active) {
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        const user1 = await Users.findOne({ email: admin_email, portal_access: PORTAL_ACCESS_STATUS.admin });
        if (user1) {
          const token = generateToken({ admin_email: admin_email, customer_email: customer_email, scope: 'IMPERSONATE' }, process.env.JWT_IMPERSONATE_EXPIRY);
          const loginUrl = `${process.env.FRONTEND_BASEURL_ADMIN}/login/${token}`;
          await Users.update({ user_id: user1.user_id }, {
            impersonation_token : token,
            last_updated_date   : getDateUTC()
          });

          const data = {
            loginurl: loginUrl
          };

          return res.ok(data, messages.SUCCESSFULL_TOKEN, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.CUSTOMER_NOT_EXISTS, RESPONSE_STATUS.success);
        }
      }
    } else {
      return res.ok(isValidate.error, messages.FORGOT_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  SignInToEmployee: async (req, res) => {
    const isValidate = await UserValidations.SignInToEmployee.validate(req.allParams());
    if (!isValidate.error) {
      const { employee_user_email, customer_email } = req.allParams();
      const customerUser = await Users.findOne({ email: customer_email, portal_access: PORTAL_ACCESS_STATUS.customer});

      if (!customerUser) {
        return res.ok(undefined, messages.USER_NOT_EXISTS, RESPONSE_STATUS.success);
      } else {
      // check user is active or not
        if (customerUser.status !== ACCOUNT_STATUS.active) {
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        const user1 = await Users.findOne({ email: employee_user_email, portal_access: PORTAL_ACCESS_STATUS.customer});
        if (user1) {
          const token = generateToken({ employee_user_email: employee_user_email, customer_email: customer_email, scope: 'IMPERSONATE' }, process.env.JWT_IMPERSONATE_EXPIRY);
          const loginUrl = `${process.env.FRONTEND_BASEURL}/login/${token}/employee`;
          await Users.update({ user_id: user1.user_id }, {
            impersonation_token : token,
            last_updated_date   : getDateUTC()
          });

          const data = {
            loginurl: loginUrl
          };

          return res.ok(data, messages.SUCCESSFULL_TOKEN, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.CUSTOMER_NOT_EXISTS, RESPONSE_STATUS.success);
        }
      }
    } else {
      return res.ok(isValidate.error, messages.FORGOT_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  SignInToPrimaryUser: async (req, res) => {
    const isValidate = await UserValidations.SignInToEmployee.validate(req.allParams());
    if (!isValidate.error) {
      const { employee_user_email, customer_email } = req.allParams();
      const customerUser = await Users.findOne({ email: employee_user_email, portal_access: PORTAL_ACCESS_STATUS.customer});

      if (!customerUser) {
        return res.ok(undefined, messages.USER_NOT_EXISTS, RESPONSE_STATUS.success);
      } else {
      // check user is active or not
        if (customerUser.status !== ACCOUNT_STATUS.active) {
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        const user1 = await Users.findOne({ email: customer_email, portal_access: PORTAL_ACCESS_STATUS.customer});
        if (user1) {
          const token = generateToken({ employee_user_email: employee_user_email, customer_email: customer_email, scope: 'IMPERSONATE' }, process.env.JWT_IMPERSONATE_EXPIRY);
          const loginUrl = `${process.env.FRONTEND_BASEURL}/login/${token}/primaryuser`;
          await Users.update({ user_id: user1.user_id }, {
            impersonation_token : token,
            last_updated_date   : getDateUTC()
          });

          const data = {
            loginurl: loginUrl
          };

          return res.ok(data, messages.SUCCESSFULL_TOKEN, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.CUSTOMER_NOT_EXISTS, RESPONSE_STATUS.success);
        }
      }
    } else {
      return res.ok(isValidate.error, messages.FORGOT_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  }
};



