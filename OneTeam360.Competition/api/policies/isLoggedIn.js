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

module.exports = async (req, res, next) => {
  if (!req.headers || !req.headers.authorization) {
    return res.unAuthorized(undefined, messages.AUTH_TOKEN_MISSING, RESPONSE_STATUS.error);
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
      let tenantConnection = await  mysql.createConnection(connectionString);
      await tenantConnection.connect();

      const empProfile = await EmployeeProfile.findOne({ user_id: _user.user_id }).usingConnection(tenantConnection);
      if(empProfile && empProfile.status === ACCOUNT_STATUS.inactive)
      {
        return res.inActivateEmployee(undefined,messages.INVALID_EMPLOYEE, RESPONSE_STATUS.error);
      }

      let permissionList = []; let permissionModuleList = [] || any;
      let perm_sql = `
        Select role_permission.permission_id, permission.permission_module_id, permission.name as permission_name, permission.code as permission_code, permission_module.name as permission_module_name, permission_module.code as permission_module_code from role_permission 
          JOIN permission 
            ON permission.permission_id = role_permission.permission_id
          JOIN permission_module 
            ON permission_module.permission_module_id = permission.permission_module_id
        where role_id = ${empProfile.role_id}`;
      const rawResult = await sails.sendNativeQuery(perm_sql).usingConnection(tenantConnection);
      const permissions = rawResult.rows;
      for (const index in permissions) {
        permissionModuleList.push({ name: permissions[index].permission_module_name, code: permissions[index].permission_module_code.trim(), permission_module_id: permissions[index].permission_module_id});
        permissionList.push({ name: permissions[index].permission_name, code: permissions[index].permission_code.trim(), permission_id: permissions[index].permission_id });
      }

      req.user = _user;
      req.token = _token;
      req.account = _account;
      req.dynamic_connection = tenantConnection;
      req.timezone = timeZone;
      req.dateTimeFormat = dateTimeFormat;
      req.dateFormat = dateFormat;
      req.permissions = permissionList;
      req.empProfile = empProfile;
      next();
    }else{
      return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
    }
  }).catch((error) => {
    return error.response.status === 410 ? res.inActivateUser(undefined,messages.ACCOUNT_INACTIVATE_LOGOUT, RESPONSE_STATUS.error) : res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  });
};
