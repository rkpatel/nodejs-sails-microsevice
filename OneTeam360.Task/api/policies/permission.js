/***************************************************************************

Administrator policy

This policy checks the permission from the jwt token which include the role
Note: it is necessary to add isLoggedIn policy in order this policy to work

***************************************************************************/

const messages = sails.config.globals.messages;
const apiEndPoint = require('../utils/constants/apiAction');
const { RESPONSE_STATUS, TASK_PERMISSION } = require('../utils/constants/enums');
const exposeApiEndPoint = require('../utils/constants/exposingApiAction');

const errorData = (req,res) => {
  if(req.isExposedApi){
    return res.unAuthorized(undefined,messages.PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  } else {
    return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  }
};

const permissionCodesRequiredForApiData=async(permissionCodesRequiredForApi,filterperm,res)=>{
  if(permissionCodesRequiredForApi.and.length !== filterperm.length){
    return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
  }
};

const filterPermData=async(filterperm,res)=>{
  if(filterperm.length === 0){
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
  if(actionString === 'PUT /status'){
    const { employee_profile_id } = req.allParams();
    if(req.empProfile.employee_profile_id.toString() === employee_profile_id.toString()){
      return next();
    }
  }else if(actionString === 'POST /:id'){
    const { id } = req.allParams();
    if(req.empProfile.employee_profile_id.toString() === id.toString()){
      return next();
    }
  }else if(actionString === 'POST /'){
    let { from } = req.allParams();
    let permissions = req.permissions.map(perm => perm.code);

    if(from === 'employee'){
      return permissions.includes(TASK_PERMISSION.addEmployeeTask) ? next() : res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
    }else if(from === 'task'){
      return permissions.includes(TASK_PERMISSION.addTask) ? next() : res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
    }
  }

  if(req.permissions && req.permissions.length && permissionCodesRequiredForApi !== undefined){
    if(permissionCodesRequiredForApi && permissionCodesRequiredForApi.and){
      let permissions = req.permissions.map(perm => perm.code);
      let filterperm = permissionCodesRequiredForApi.and.filter(perm => permissions.includes(perm));
      await permissionCodesRequiredForApiData(permissionCodesRequiredForApi,filterperm,res);
    }
    if(permissionCodesRequiredForApi && permissionCodesRequiredForApi.or){
      let permissions = req.permissions.map(perm => perm.code);
      let filterperm = permissionCodesRequiredForApi.or.filter(perm => permissions.includes(perm));
      let { entity_type } = req.allParams();
      if(entity_type === 'undefined' || entity_type !== 'TRAINING'){
        await filterPermData(filterperm,res);
      }
    }
    next();
  }else{
    await errorData(req,res);
  }
};


