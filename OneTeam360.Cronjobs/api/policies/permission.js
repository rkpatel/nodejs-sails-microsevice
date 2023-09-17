/***************************************************************************

Administrator policy

This policy checks the permission from the jwt token which include the role
Note: it is necessary to add isLoggedIn policy in order this policy to work

***************************************************************************/

const messages = sails.config.globals.messages;
const apiEndPoint = require('../utils/constants/apiAction');
const { RESPONSE_STATUS } = require('../utils/constants/enums');

module.exports = async (req, res, next) => {
  let method = req.method;
  let apiAction = req.route.path;
  let actionString =`${method} ${apiAction}`;

  let permissionCodesRequiredForApi = apiEndPoint[actionString];
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
    next();
  }else{
    return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  }
};


