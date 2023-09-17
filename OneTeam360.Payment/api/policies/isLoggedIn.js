/***************************************************************************

isLoggedIn policy

This policy will check if api header contains Authorization header or not.
If contains then will fetch user details and pass as req.user else will send
err response to api.

Note: it is necessary to add isLoggedIn policy in order to add autorization check

***************************************************************************/

const { verify, verifyadmin } = require('../services/jwt');
const messages = sails.config.globals.messages;
const axios = require('axios');
const { RESPONSE_STATUS, ACCOUNT_STATUS, PORTAL_ACCESS } = require('../../api/utils/constants/enums');

const errorResponseData=async(error,res)=>{
  if(error && error.response && error.response.status === 410){
    return res.inActivateUser(undefined,messages.ACCOUNT_INACTIVATE_LOGOUT, RESPONSE_STATUS.error);
  }else{
    sails.log.error(error);
    return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  }
};

module.exports = async (req, res, next) => {
  let apiAction = req.route.path;
  // to bypass the policy for customer registration from third party application
  if(apiAction === '/customer/public/registration' || apiAction === '/subscription/public/add' || apiAction === '/subscription/public/addinstripe' || apiAction === '/subscription/public/list' || apiAction === '/subscription/public/find'
  || apiAction === '/coupon/public/list' || apiAction === '/quotes/public/findbycustomer' || apiAction === '/subscription/public/paymentintentinstripe' || apiAction === '/subscription/public/graduatedprice'
  || apiAction === '/customer/public/edit/:id' || apiAction === '/paymentmethod/public/add' || apiAction === '/paymentmethod/public/attach' || apiAction === '/paymentmethod/public/detach/:id' || apiAction === '/subscription/public/updateactivestatus'
  || apiAction === '/subscription/public/update' || apiAction === '/subscription/public/updateinstripe'  || apiAction === '/subscription/public/findcustomersubscription/:id' || apiAction === '/public/azure-add-policy-in-product' || apiAction === '/subscriptionmaster/public/listsubscription'
  || apiAction === '/public/azure-create-update-product' || apiAction === '/public/azure-get-subscription-by-product' || apiAction === '/public/azure-secret-key-list' || apiAction === '/public/azure-regenerate-secret-key' || apiAction === '/public/azure-add-api-in-product') {
    req.user = '';
    next();
  }else{
    if (!req.headers || !req.headers.authorization) {
      return res.unAuthorized(undefined, messages.AUTH_TOKEN_MISSING, RESPONSE_STATUS.error);
    }

    const tokenParameter = req.headers.authorization;
    const tkn_prm = tokenParameter.split(' ');
    if ((!tkn_prm[0] || !tkn_prm[1]) || (tkn_prm[0] !== 'Bearer')) {
      return res.unAuthorized(undefined, messages.INVALID_AUTH_TOKEN);
    }
    const tokenParam = tkn_prm[1];
    let decodedtoken;
    try{
      decodedtoken = verify(tokenParam);
    }
    catch(error) {
      sails.log(error);
      try {
        decodedtoken = verifyadmin(tokenParam);
      }
      catch(adminerror){
        sails.log(adminerror);
        return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
      }
    }
    const userDetail = await Users.findOne({ user_id: decodedtoken.id });

    let servicepath = 'authentication';
    if(userDetail.portal_access === PORTAL_ACCESS.ADMIN_PORTAL && decodedtoken && !('tenantId' in decodedtoken)){
      servicepath = 'admin';
    }

    axios.get(`${process.env.APP_BASE_URL}${servicepath}/verifyToken`,
    { headers: { Authorization: req.headers.authorization } }
    ).then(async (response) => {
      if(response.data.status === RESPONSE_STATUS.success){

        let _token = response.data.data.token;
        let _user = response.data.data.user;
        let _account = response.data.data.account;
        let connectionString = response.data.data.connectionString;
        let timeZone = response.data.data.timezone;
        let dateTimeFormat = response.data.data.dateTimeFormat;
        let dateFormat = response.data.data.dateFormat;

        if(userDetail.portal_access === PORTAL_ACCESS.ADMIN_PORTAL && decodedtoken && !('tenantId' in decodedtoken)){
          req.user = userDetail;
        } else{
          let rdi = sails.getDatastore('default');
          let mysql = rdi.driver.mysql;
          let tenantConnection = await  mysql.createConnection(connectionString);
          await tenantConnection.connect();

          const empProfile = await EmployeeProfile.findOne({ user_id: _user.user_id }).usingConnection(tenantConnection);
          let permissionList = [];
          let permissionModuleList = [] || any;
          let perm_sql = `
            Select role_permission.permission_id, permission.permission_module_id, permission.name as permission_name, permission.code as permission_code, permission_module.name as permission_module_name, permission_module.code as permission_module_code from role_permission
              JOIN permission
                ON permission.permission_id = role_permission.permission_id
              JOIN permission_module
                ON permission_module.permission_module_id = permission.permission_module_id
            where role_id = ${empProfile.role_id};`;
          const rawResult = await sails.sendNativeQuery(perm_sql).usingConnection(tenantConnection);
          const permissions = rawResult.rows;
          for (const index in permissions) {
            permissionModuleList.push({ name: permissions[index].permission_module_name, code: permissions[index].permission_module_code.trim(), permission_module_id: permissions[index].permission_module_id});
            permissionList.push({ name: permissions[index].permission_name, code: permissions[index].permission_code.trim(), permission_id: permissions[index].permission_id });
          }

          if(empProfile && empProfile.status === ACCOUNT_STATUS.inactive)
          {
            return res.inActivateEmployee(undefined,messages.INVALID_EMPLOYEE, RESPONSE_STATUS.error);
          }

          req.user = _user;
          req.account = _account;
          req.dynamic_connection = tenantConnection;
          req.timezone = timeZone;
          req.dateTimeFormat = dateTimeFormat;
          req.dateFormat = dateFormat;
          req.permissions = permissionList;
          req.empProfile = empProfile;
        }
        req.token = _token;
        next();
      }else{
        return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
      }
    }).catch((error) => {
      sails.log.error('error',error);
      errorResponseData(error,res);
    });
  }

};
