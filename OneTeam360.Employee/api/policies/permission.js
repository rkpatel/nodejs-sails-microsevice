/***************************************************************************

Administrator policy

This policy checks the permission from the jwt token which include the role
Note: it is necessary to add isLoggedIn policy in order this policy to work

***************************************************************************/

const exposeApiEndPoint = require('../utils/constants/exposingApiAction');
const messages = sails.config.globals.messages;
const apiEndPoint = require('../utils/constants/apiAction');
const { RESPONSE_STATUS } = require('../utils/constants/enums');

module.exports = async (req, res, next) => {
  let method = req.method;
  let apiAction = req.route.path;
  let actionString =`${method} ${apiAction}`;

  /** Added Customize Condition for Current Route if User is accesing his own profile */

  if(actionString === 'GET /:id'){
    let { id } = req.params;
    if(req.empProfile.employee_profile_id.toString() === id.toString()){
      return next();
    }
  }
  else if(actionString === 'PUT /:id'){
    let { id } = req.params;
    if(req.user.user_id.toString() === id.toString()){
      return next();
    }
  }else if(actionString === 'POST /notes/list' || actionString === 'POST /certificate/list' || actionString === 'GET /certificate/expirecount' || actionString === 'POST /employee-interaction/graph' || actionString === 'GET /certificate/expireCertificate'){
    let { employee_profile_id } = req.allParams();
    if(req.empProfile.employee_profile_id.toString() === employee_profile_id.toString()){
      return next();
    }
  }
  /*************************************************** */
  let permissionCodesRequiredForApi;
  if(req.isExposedApi){
    permissionCodesRequiredForApi = exposeApiEndPoint[actionString];
  } else {
    permissionCodesRequiredForApi = apiEndPoint[actionString];
  }
  if(req.permissions && req.permissions.length){
    if(permissionCodesRequiredForApi && permissionCodesRequiredForApi.and){
      let permissions = req.permissions.map(perm => perm.code);
      let filterperm = permissionCodesRequiredForApi.and.filter(perm => permissions.includes(perm));
      if(permissionCodesRequiredForApi.and.length !== filterperm.length){
        return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
      }
    }
    if(permissionCodesRequiredForApi && permissionCodesRequiredForApi.or){
      let permissions = req.permissions.map(perm => perm.code);
      let filterperm = permissionCodesRequiredForApi.or.filter(perm => permissions.includes(perm));
      if(filterperm.length === 0){
        return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
      }
    }
    sails.log('call next');
    next();
  }else{
    return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  }
};
