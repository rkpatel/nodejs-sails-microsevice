/***************************************************************************

isLoggedIn policy

This policy will check if api header contains Authorization header or not.
If contains then will fetch user details and pass as req.user else will send
err response to api.

Note: it is necessary to add isLoggedIn policy in order to add autorization check

***************************************************************************/

const messages = sails.config.globals.messages;
const axios = require('axios');
const { RESPONSE_STATUS, ACCOUNT_STATUS } = require('../../api/utils/constants/enums');
const { generateToken } = require('../services/jwt');
const { tenantConnection } = require('../services/utils');
const accountDatas=async(account,res,req)=>{
  if(account.length > 0){
    let user = await Users.findOne({ email: process.env.EXPOSE_API_USER_EMAIL });
    let connection = await tenantConnection(account[0].account_id);
    const empProfile = await EmployeeProfile.findOne({ user_id: user.user_id }).usingConnection(connection.connection);
    let token = await generateToken({
      id                  : user.user_id,
      employee_profile_id : empProfile.employee_profile_id,
      isLoggedIn          : true,
      tenantId            : account[0].account_id,
      tenantGuid          : account[0].account_guid
    }, process.env.JWT_LOGIN_EXPIRY);
    req.headers.authorization = `Bearer ${token}`;
  } else {
    if(req.headers['ocp-apim-subscription-key']){
      return res.unAuthorized(undefined,messages.INVALID_API_TOKEN, RESPONSE_STATUS.error);
    } else {
      return res.unAuthorized(undefined,messages.API_TOKEN_MISSING, RESPONSE_STATUS.error);
    }
  }
};

const permissionDatas=async(permissions,permissionModuleList,permissionList)=>{
  for (const index in permissions) {
    permissionModuleList.push({ name: permissions[index].permission_module_name, code: permissions[index].permission_module_code.trim(), permission_module_id: permissions[index].permission_module_id});
    permissionList.push({ name: permissions[index].permission_name, code: permissions[index].permission_code.trim(), permission_id: permissions[index].permission_id });
  }
  return {permissionModuleList,permissionList};
};

const errorResponseData=async(error,res)=>{
  if(error.response.status === 410){
    return res.inActivateUser(undefined,messages.ACCOUNT_INACTIVATE_LOGOUT, RESPONSE_STATUS.error);
  }else{
    sails.log.error('Error',error);
    return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  }
};
module.exports = async (req, res, next) => {

  if (req.headers && !req.headers.authorization && !req.headers['ocp-apim-subscription-key']) {
    return res.unAuthorized(undefined, messages.AUTH_TOKEN_MISSING, RESPONSE_STATUS.error);
  }
  if(req.headers['ocp-apim-subscription-key']) {
    let sql = `select account.account_id, account.account_guid 
    from ${process.env.DB_NAME}.account AS account
    where azure_primary_api_key = '${req.headers['ocp-apim-subscription-key']}'`;
    const rawResult = await sails.sendNativeQuery(sql);
    const account = rawResult.rows;
    await accountDatas(account,res,req);
  }
  axios.get(`${process.env.APP_BASE_URL}authentication/verifyToken`,
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

      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let connection = await  mysql.createConnection(connectionString);
      await connection.connect();

      const empProfile = await EmployeeProfile.findOne({ user_id: _user.user_id }).usingConnection(connection);
      let permissionList = [];
      let permissionModuleList = [];
      let isExposedApi;
      if(!req.headers['ocp-apim-subscription-key']){
        if(empProfile && empProfile.status === ACCOUNT_STATUS.inactive)
        {
          return res.inActivateEmployee(undefined,messages.INVALID_EMPLOYEE, RESPONSE_STATUS.error);
        }
        isExposedApi = false;
        let perm_sql = `
        Select role_permission.permission_id, permission.permission_module_id, permission.name as permission_name, permission.code as permission_code, permission_module.name as permission_module_name, permission_module.code as permission_module_code from role_permission 
          JOIN permission 
            ON permission.permission_id = role_permission.permission_id
          JOIN permission_module 
            ON permission_module.permission_module_id = permission.permission_module_id
        where role_id = ${empProfile.role_id};`;
        const rawResult = await sails.sendNativeQuery(perm_sql).usingConnection(connection);
        const permissions = rawResult.rows;
        await permissionDatas(permissions,permissionModuleList,permissionList);
      } else {
        isExposedApi = true;
        let perm_sql = `Select api_permission.api_permission_id as permission_id,api_permission.api_permission_module_id, api_permission.name as permission_name, api_permission.code as permission_code, api_permission_module.name as permission_module_name, api_permission_module.code as permission_module_code from api_permission 
          JOIN api_permission_module 
            ON api_permission_module.api_permission_module_id = api_permission.api_permission_module_id
        where api_permission_module.status = 'Active' AND api_permission.status = 'Active'`;
        const rawResult = await sails.sendNativeQuery(perm_sql).usingConnection(connection);
        const permissions = rawResult.rows;
        await permissionDatas(permissions,permissionModuleList,permissionList);
      }
      req.user = _user;
      req.token = _token;
      req.account = _account;
      req.dynamic_connection = connection;
      req.timezone = timeZone;
      req.dateTimeFormat = dateTimeFormat;
      req.dateFormat = dateFormat;
      req.permissions = permissionList;
      req.permissionModuleList=permissionModuleList;
      req.empProfile = empProfile;
      req.isExposedApi = isExposedApi;
      next();
    }else{
      return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
    }
  }).catch((error) => {
    sails.log.error(error);
    errorResponseData(error,res);
  });
};
