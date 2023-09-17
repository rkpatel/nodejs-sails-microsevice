/***************************************************************************

Administrator policy

This policy checks the permission from the jwt token which include the role
Note: it is necessary to add isLoggedIn policy in order this policy to work

***************************************************************************/

const messages = sails.config.globals.messages;
const apiEndPoint = require('../utils/constants/apiAction');
const exposeApiEndPoint = require('../utils/constants/exposingApiAction');

const { RESPONSE_STATUS } = require('../utils/constants/enums');
const permissionCodesRequiredForApiDatas=async(permissionCodesRequiredForApi,filterperm,res)=>{
  if(permissionCodesRequiredForApi.and.length !== filterperm.length){
    return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  }
};

const filterPermData=async(filterperm,res)=>{
  if(filterperm.length === 0){
    return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  }
};
const errorData = (req,res) => {
  if(req.isExposedApi){
    return res.unAuthorized(undefined,messages.PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  } else {
    return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  }
};
module.exports = async (req, res, next) => {
  let method = req.method;
  let apiAction = req.route.path;
  let actionString =`${method} ${apiAction}`;
  let permissionCodesRequiredForApi;
  if(req.isExposedApi){
    permissionCodesRequiredForApi = exposeApiEndPoint[actionString];
  } else {
    permissionCodesRequiredForApi = apiEndPoint[actionString];
  }
  if(req.permissions && req.permissions.length && permissionCodesRequiredForApi !== undefined){
    if(permissionCodesRequiredForApi && permissionCodesRequiredForApi.and){
      let permissions = req.permissions.map(perm => perm.code);
      let filterperm = permissionCodesRequiredForApi.and.filter(perm => permissions.includes(perm));
      await permissionCodesRequiredForApiDatas(permissionCodesRequiredForApi,filterperm,res);
    }
    if(permissionCodesRequiredForApi && permissionCodesRequiredForApi.or){
      let permissions = req.permissions.map(perm => perm.code);
      let filterperm = permissionCodesRequiredForApi.or.filter(perm => permissions.includes(perm));
      await filterPermData(filterperm,res);
    }
    next();
  }else{
    await errorData(req,res);
  }
};


