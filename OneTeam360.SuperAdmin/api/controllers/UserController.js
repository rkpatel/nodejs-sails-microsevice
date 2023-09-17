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
  add
  edit
  delete
  find
  findById
  activate
  **************************************************

***************************************************************************/

const { hashPassword, comparePassword } = require('../services/bcrypt');
const { generateToken, verifyimpersonate } = require('../services/jwt');
const { commonListing,escapeSearch, escapeSqlSearch } = require('../services/utils');
const UserValidations = require('../validations/UserValidations');
const { ACCOUNT_STATUS, RESPONSE_STATUS, NOTIFICATION_ENTITIES, PORTAL_ACCESS_STATUS } = require('../utils/constants/enums');
const { getDateUTC } = require('../utils/common/getDateTime');
const { sendNotification } = require('../services/sendNotification');
const messages = sails.config.globals.messages;
const getImgUrl = function (profilePicName, isThumb = false) {
  let profile_pic_name = profilePicName;
  if (isThumb) {
    let arr = profilePicName.split('.');
    profile_pic_name = `${arr[0]}_thumbnail.${arr[1]}`;
  }
  return `${process.env.PROFILE_PIC_CDN_URL}/${process.env.CONTAINER_NAME}/${process.env.PROFILE_IMAGE_DIR_INSIDE_MASTER_CONTAINER}/${profile_pic_name}`;
};

const isPasswordMatchedData=async(user,password,res)=>{
  if(user.status === ACCOUNT_STATUS.active){
    let isPasswordMatched = await comparePassword(password, user.password);
    if (!isPasswordMatched) {
      return res.ok(undefined, messages.INCORRECT_CREDENTIALS, RESPONSE_STATUS.error);
    }
    else{
      let token = await generateToken({
        id         : user.user_id,
        isLoggedIn : true,
      }, process.env.JWT_LOGIN_EXPIRY_ADMIN);
      return res.ok({
        token      : token,
        expiryTime : process.env.JWT_LOGIN_EXPIRY_ADMIN,
        user       : user
      }, messages.LOGIN_SUCCESS, RESPONSE_STATUS.success);
    }
  }
  else{
    return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
  }
};

module.exports = {

  login: async (req, res) => {
    let request = req.allParams();
    if(request.itoken !== undefined && request.itoken !== null && request.itoken !== ''){
      const itoken = request.itoken;
      let decodedtoken = verifyimpersonate(itoken);
      const admin_email = decodedtoken.admin_email;
      const adminUser = await Users.findOne({ email: admin_email, portal_access: PORTAL_ACCESS_STATUS.admin });
      if(!adminUser)
      {
        return res.ok(undefined, messages.INCORRECT_CREDENTIALS, RESPONSE_STATUS.error);
      }
      const impersonteToken = adminUser.impersonation_token;
      if(itoken === impersonteToken) {
        const atoken = await generateToken({
          id         : adminUser.user_id,
          isLoggedIn : true,
        }, process.env.JWT_LOGIN_EXPIRY_ADMIN);
        return res.ok({
          token      : atoken,
          expiryTime : process.env.JWT_LOGIN_EXPIRY_ADMIN,
          user       : adminUser
        }, messages.LOGIN_SUCCESS, RESPONSE_STATUS.success);
      }

    } else {
      const isValidate = await UserValidations.login.validate(request);
      if (!isValidate.error) {
        const { email, password } = req.allParams();
        const user = await Users.findOne({ email, portal_access: PORTAL_ACCESS_STATUS.admin });
        if(!user)
        {
          return res.ok(undefined, messages.INCORRECT_CREDENTIALS, RESPONSE_STATUS.error);
        }
        else{
          await isPasswordMatchedData(user,password,res);
        }
      } else {
        res.ok(isValidate.error, messages.LOGIN_FAILURE, RESPONSE_STATUS.error);
      }
    }
  },
  changePassword: async (req, res) => {
    const isValidate = await UserValidations.changePassword.validate(req.allParams());
    if (!isValidate.error) {
      const { password, newpassword, confirmpassword } = req.allParams();
      let user_id = req.user.user_id;
      const user = await Users.find({ user_id: user_id }).limit(1);
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
      res.ok(isValidate.error, messages.CHANGE_PASSWORD_FAILURE);
    }
  },
  createPassword: async (req, res) => {
    const isValidate = await UserValidations.createPassword.validate(req.allParams());
    if (!isValidate.error) {
      const {
        password,
        confirmpassword
      } = req.allParams();
      let user_id = req.user.user_id;
      const user = await Users.find({ user_id: user_id }).limit(1);
      if (!user) {
        return res.ok(undefined, messages.USER_NOT_FOUND, RESPONSE_STATUS.error);
      } else {
        if (password === confirmpassword) {
          const encryptedPassword = await hashPassword(password);
          let updateData = {
            password             : encryptedPassword,
            reset_password_token : '',
            status               : ACCOUNT_STATUS.active,
            last_updated_date    : getDateUTC()
          };
          await Users.update({ user_id: user_id }, updateData).fetch();
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
      const user = await Users.findOne({ email, portal_access: PORTAL_ACCESS_STATUS.admin });
      if (!user) {
        return res.ok(undefined, messages.FORGOT_PASSWORD, RESPONSE_STATUS.success);
      } else {
      // check user is active or not
        if (user.status !== ACCOUNT_STATUS.active) {
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        const token = generateToken({ id: user.user_id, isLoggedIn: false, scope: 'RESET_PASSWORD' }, process.env.JWT_RESET_PASS_EXPIRY_ADMIN);
        const resetUrl = `${process.env.FRONTEND_BASEURL_ADMIN}/reset-password?token=${token}`;
        await Users.update({ user_id: user.user_id }, {
          reset_password_token : token,
          last_updated_date    : getDateUTC()
        });
        await sendNotification(req,{
          notification_entity  : NOTIFICATION_ENTITIES.RESET_PASSWORD_ADMIN,
          recipient_email      : email,
          recipient_first_name : user.first_name,
          recipient_last_name  : user.last_name,
          receipient_user_id   : user.user_id,
          url                  : resetUrl,
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
        password             : encryptedPassword,
        reset_password_token : '',
        last_updated_date    : getDateUTC()
      }).fetch();
      return res.ok(undefined, messages.RESET_PASSWORD, RESPONSE_STATUS.success);
    } else {
      return res.ok(isValidate.error, messages.RESET_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  add: async (req, res) => {
    let request = req.allParams();
    const isValidate = await UserValidations.Add.validate(request);
    if (!isValidate.error) {
      const {
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        profile_picture_url,
        emergency_contact_name,
        emergency_contact_relation,
        emergency_contact_number,
        emergency_contact_address,
        emergency_contact_city_id,
        emergency_contact_state_id,
        emergency_contact_country_id,
        emergency_contact_zip,
      } = req.allParams();

      const user = await Users.findOne({ email });
      if (user) {
        const accountUser = await sails.sendNativeQuery(`SELECT account_id FROM ${process.env.DB_NAME}.account_user WHERE user_id = ${user.user_id} `).usingConnection(req.dynamic_connection);
        const accountUserDetails = accountUser.rows;
        const account_id = parseInt(accountUserDetails[0].account_id);
        const admin_account_id = parseInt(process.env.ADMIN_ACCOUNT_ID);

        if(account_id === admin_account_id && user.portal_access !== PORTAL_ACCESS_STATUS.admin) {
          await Users.update({ user_id: user.user_id }, {
            portal_access: PORTAL_ACCESS_STATUS.admin,
          });
          return res.ok(undefined, messages.REGISTER_ACCESS_SUCCESS, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.USER_ALREADY_EXISTS);
        }
      }
      else {
        let image_data = '';
        let image_data_thumb = '';
        if (profile_picture_url) {
          image_data = getImgUrl(profile_picture_url, false);
          image_data_thumb = getImgUrl(profile_picture_url, true);
        }
        const newUser = await Users.create({
          first_name,
          last_name,
          email,
          phone,
          portal_access                 : PORTAL_ACCESS_STATUS.admin,
          date_of_birth,
          profile_picture_url           : image_data,
          profile_picture_thumbnail_url : image_data_thumb,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          emergency_contact_address,
          emergency_contact_country_id,
          emergency_contact_state_id,
          emergency_contact_city_id,
          emergency_contact_zip,
          created_by                    : req.user.user_id,
          status                        : ACCOUNT_STATUS.invited,
          primary_user                  : 'No',
          created_date                  : getDateUTC()
        }).fetch();

        let userId = newUser.user_id;
        const token = generateToken({ id: userId, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, process.env.JWT_CREATE_PASS_EXPIRY_ADMIN);
        const createUrl = `${process.env.FRONTEND_BASEURL_ADMIN}/create-password?token=${token}`;
        await Users.update({ user_id: userId }, {
          reset_password_token: token,
        });

        await sendNotification(req, {
          notification_entity  : NOTIFICATION_ENTITIES.CREATE_PASSWORD_ADMIN,
          recipient_email      : email,
          recipient_first_name : first_name,
          recipient_last_name  : last_name,
          recipient_phone      : phone,
          receipient_user_id   : userId,
          url                  : createUrl,
        });

        return res.ok(undefined, messages.REGISTER_SUCCESS, RESPONSE_STATUS.success);
      }

    } else {
      res.ok(isValidate.error, messages.REGISTER_FAILURE, RESPONSE_STATUS.error);
    }
  },
  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await UserValidations.Edit.validate(request);
      if (!isValidate.error) {
        const {
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          profile_picture_url,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          emergency_contact_address,
          emergency_contact_city_id,
          emergency_contact_state_id,
          emergency_contact_country_id,
          emergency_contact_zip,
        } = req.allParams();
        const user = await Users.findOne({ user_id: req.params.id });
        if (!user) {
          return res.ok(undefined, messages.USER_NOT_FOUND, RESPONSE_STATUS.error);
        }
        let image_data = '';
        let image_data_thumb = '';
        if (profile_picture_url) {
          image_data = getImgUrl(profile_picture_url, false);
          image_data_thumb = getImgUrl(profile_picture_url, true);
        }
        await Users.update({ user_id: req.params.id }, {
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          profile_picture_url           : image_data,
          profile_picture_thumbnail_url : image_data_thumb,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          emergency_contact_address,
          emergency_contact_city_id,
          emergency_contact_state_id,
          emergency_contact_country_id,
          emergency_contact_zip,
          last_updated_by               : req.user.user_id,
          last_updated_date             : getDateUTC()
        }).fetch();
        return res.ok(undefined, messages.UPDATE_SUCCESS, RESPONSE_STATUS.success);

      } else {
        res.ok(isValidate.error, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      res.ok(err.error, err.message, RESPONSE_STATUS.error);
    }
  },
  delete: async function (req, res) {
    await Users.destroy({ user_id: req.params.id, portal_access: PORTAL_ACCESS_STATUS.admin });
    return res.ok(undefined, messages.DELETE_RECORD);
  },
  find: async function (req, res) {
    let results;
    let nativePayload = [];
    const findQuery = await commonListing(req.allParams());
    let sql = `SELECT distinct user.user_id, user.email, user.first_name, user.last_name, user.date_of_birth, user.phone, user.profile_picture_url,
    user.profile_picture_thumbnail_url, user.status, user.created_date FROM user WHERE portal_access = '${PORTAL_ACCESS_STATUS.admin}' `;
    if ((findQuery.andCondition).length === 0 && (findQuery.search !== '')) {
      sql = sql + ` AND (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(findQuery.search)}%') `;
    }
    else if ((findQuery.andCondition).length > 0 && (findQuery.search !== '')) {
      if (nativePayload.length > 0) {
        sql = sql + ` AND (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(findQuery.search)}%') `;
      }
      else {
        sql = sql + ` (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(findQuery.search)}%') `;
      }
    }
    sql =  sql + ` ORDER BY ${findQuery.sort}, user.status DESC`;

    const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql));
    results = rawResult.rows;

    const countQuery = sql.split('LIMIT ');
    const paginationCount =  await sails.sendNativeQuery(escapeSqlSearch(countQuery[0]));

    let resultCount = await Users.count();
    sails.log(resultCount);
    const userList = await results.map((item)=>{
      return {
        user_id                       : item.user_id,
        email                         : item.email,
        first_name                    : item.first_name,
        last_name                     : item.last_name,
        phone                         : item.phone,
        date_of_birth                 : item.date_of_birth,
        profile_picture_url           : item.profile_picture_url,
        profile_picture_thumbnail_url : item.profile_picture_thumbnail_url,
        status                        : item.status
      };
    });
    if (((findQuery.andCondition).length > 0) || findQuery.search !== '') {
      resultCount = userList.length;
      sails.log(resultCount);
    }
    let data = {
      userList    : userList,
      totalResult : paginationCount.rows.length
    };
    return res.ok(data, messages.GET_USERS, RESPONSE_STATUS.success);

  },
  findById: async function (req, res) {
    const result = await Users.findOne({ user_id: req.params.id });
    if (result) {
      let response = {
        user_id                       : result.user_id,
        email                         : result.email,
        first_name                    : result.first_name,
        last_name                     : result.last_name,
        phone                         : result.phone,
        date_of_birth                 : result.date_of_birth,
        profile_picture_url           : result.profile_picture_url,
        profile_picture_thumbnail_url : result.profile_picture_thumbnail_url,
		  status                        : result.status
      };
      return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
    }
    else {
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
    }
  },
  activate: async function (req, res) {
    const isValidate = UserValidations.updateStatus.validate(req.allParams());
    if (!isValidate.error) {
      const result = await Users.find({ user_id: req.params.id });
      let status; let resMessage;
      if (result[0].status === ACCOUNT_STATUS.active) {
        status = ACCOUNT_STATUS.inactive;
        resMessage = messages.USER_INACTIVATE_SUCEESS;
      }
      else if (result[0].status === ACCOUNT_STATUS.inactive) {
        status = ACCOUNT_STATUS.active;
        resMessage = messages.USER_ACTIVATE_SUCEESS;
      }
      await Users.update({ user_id: req.params.id }, { status: status }).fetch();
      return res.ok(undefined, resMessage,RESPONSE_STATUS.success);
    }
    else {
      return res.ok(isValidate.error, messages.USER_ACTIVATE_FAIL,RESPONSE_STATUS.error);
    }
  },
  profileDetails: async (req, res) => {
    const detail = await Users.findOne({ user_id: req.user.user_id });
    if (detail) {
      let response = {
        user_id: detail.user_id,
      };
      return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
    }
    else {
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
    }
  },
  signInCustomer: async (req, res) => {
    const isValidate = await UserValidations.signInCustomer.validate(req.allParams());
    if (!isValidate.error) {
      const { admin_email, customer_email } = req.allParams();
      const user1 = await Users.findOne({ email: admin_email, portal_access: PORTAL_ACCESS_STATUS.admin });
      if (!user1) {
        return res.ok(undefined, messages.USER_NOT_EXISTS, RESPONSE_STATUS.error);
      } else {
      // check user is active or not
        if (user1.status !== ACCOUNT_STATUS.active) {
          return res.ok(undefined, messages.USER_NOT_ACTIVE, RESPONSE_STATUS.error);
        }
        const customerUser = await Users.findOne({ email: customer_email});
        if (customerUser) {
          const token = generateToken({ admin_email: admin_email, customer_email: customer_email, scope: 'IMPERSONATE' }, process.env.JWT_IMPERSONATE_EXPIRY);
          const loginUrl = `${process.env.FRONTEND_BASEURL}/login/${token}/admin`;
          await Users.update({ user_id: customerUser.user_id }, {
            impersonation_token : token,
            last_updated_date   : getDateUTC()
          });

          const data = {
            loginurl: loginUrl
          };

          return res.ok(data, messages.SUCCESSFULL_TOKEN, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.CUSTOMER_NOT_EXISTS, RESPONSE_STATUS.error);
        }
      }
    } else {
      return res.ok(isValidate.error, messages.FORGOT_PASSWORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  // welcome: async (req, res) =>{
  //   sails.log('Welcome User');
  //   res.ok(undefined, messages.WELCOME_USER, RESPONSE_STATUS.success);
  // }
};



