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
    sails.log('Verify Token Auth => ', response.data.status);
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
      sails.log('connection string',connectionString,_user.user_id);
      const empProfile = await EmployeeProfile.findOne({ user_id: _user.user_id }).usingConnection(tenantConnection);
      if(empProfile && empProfile.status === ACCOUNT_STATUS.inactive)
      {
        return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
      }
      const action = await RolePermission.find({ role_id: empProfile.role_id }).populate('permission_id').usingConnection(tenantConnection);

      let permissionList = [];
      let permissionModuleList = [];
      for (const permission in action) {
        let permissionModule = await PermissionModule.findOne({ permission_module_id: action[permission].permission_id.permission_module_id }).usingConnection(tenantConnection);
        permissionModuleList.push(permissionModule);
        permissionList.push(action[permission].permission_id);
      }

      req.user = _user;
      req.token = _token;
      req.account = _account;
      req.dynamic_connection = tenantConnection;
      req.timezone = timeZone;
      req.dateTimeFormat = dateTimeFormat;
      req.dateFormat = dateFormat;
      req.permissions = permissionList;
      req.permissionModuleList=permissionModuleList;
      req.empProfile = empProfile;
      next();
    }else{
      return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
    }
  }).catch((error) => {
    sails.log.error('Error',error);
    return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  });
};
