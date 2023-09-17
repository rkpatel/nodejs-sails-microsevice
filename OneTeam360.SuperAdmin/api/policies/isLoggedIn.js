/* eslint-disable no-unused-vars */
/***************************************************************************

isLoggedIn policy

This policy will check if api header contains Authorization header or not.
If contains then will fetch user details and pass as req.user else will send
err response to api.

Note: it is necessary to add isLoggedIn policy in order to add autorization check

***************************************************************************/

const { verify } = require('../services/jwt');
const { RESPONSE_STATUS, ACCOUNT_STATUS } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;

const tknPrmCondition=async(tkn_prm,res)=>{
  if ((!tkn_prm[0] || !tkn_prm[1]) || (tkn_prm[0] !== 'Bearer')) {
    return res.unAuthorized(undefined, messages.INVALID_AUTH_TOKEN);
  }
};

const notUserCondition=async(user,decodedtoken,res)=>{
  if (!user) {
    // Token already used for reset Password
    if(decodedtoken.scope === 'RESET_PASSWORD'){
      return res.ok(undefined,messages.RESET_PASSWORD_ALREADY_USED, RESPONSE_STATUS.error);
    }else if(decodedtoken.scope === 'CREATE_PASSWORD'){
      return res.ok(undefined,messages.CREATE_PASSWORD_ALREADY_USED, RESPONSE_STATUS.error);
    }
  }
};

const decodedTokenData=async(decodedtoken,req,res)=>{
  if(decodedtoken.scope === 'RESET_PASSWORD' && req && !('password' in req.body)){
    return res.ok(undefined,messages.RESET_PASSWORD_TOKEN_VALID, RESPONSE_STATUS.success);
  }
};

const checkNotUser=async(user,res,next,req)=>{
  if (!user) {
    return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  }else{
    if(user.status === ACCOUNT_STATUS.active){
      req.user = user;
      return next();
    }else{
      return res.inActivateUser(undefined,messages.USER_INACTIVATE_LOGOUT, RESPONSE_STATUS.error);
    }
  }
};

module.exports = async (req, res, next) => {
  if (!req.headers || !req.headers.authorization) {
    return res.unAuthorized(undefined, messages.AUTH_TOKEN_MISSING);
  }
  const tokenParameter = req.headers.authorization;
  const tkn_prm = tokenParameter.split(' ');
  await tknPrmCondition(tkn_prm,res);
  const tokenParam = tkn_prm[1];
  let decodedtoken;
  try{
    decodedtoken = verify(tokenParam);
  }
  catch(error){
    if(req.url === '/reset-password'){
      return res.ok(undefined,messages.RESET_PASSWORD_TOKEN_EXPIRE, RESPONSE_STATUS.error);
    }else if (req.url === '/create-password'){
      return res.ok(undefined,messages.CREATE_PASSWORD_TOKEN_EXPIRE, RESPONSE_STATUS.error);
    }else if (req.url === '/profile-detail'){
      return res.ok(undefined,messages.CREATE_PASSWORD_TOKEN_EXPIRE, RESPONSE_STATUS.error);
    }
    return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  }
  if(decodedtoken){
    if('scope' in decodedtoken && (decodedtoken.scope === 'RESET_PASSWORD' || decodedtoken.scope === 'CREATE_PASSWORD')){
      const user = await Users.findOne({
        where: {user_id: decodedtoken.id , reset_password_token: tokenParam  }
      });
      await notUserCondition(user,decodedtoken,res);

      await decodedTokenData(decodedtoken,req,res);
      req.user = user;
      req.token = decodedtoken;
      next();
    }
    else{
      const user = await Users.findOne({
        where: {user_id: decodedtoken.id}
      });
      await checkNotUser(user,res,next,req);
    }
  }else{
    return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  }
};
