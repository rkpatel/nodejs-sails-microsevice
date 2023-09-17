/***************************************************************************

isLoggedIn policy

This policy will check if api header contains Authorization header or not.
If contains then will fetch user details and pass as req.user else will send
err response to api.

Note: it is necessary to add isLoggedIn policy in order to add autorization check

***************************************************************************/

const messages = sails.config.globals.messages;
const axios = require('axios');
const { RESPONSE_STATUS } = require('../utils/constants/enums');

module.exports =  {
  validateLogin: async (req,res) => {

    if (!req.headers || !req.headers.authorization) {
      return res.unAuthorized(undefined, messages.AUTH_TOKEN_MISSING, RESPONSE_STATUS.error);
    }
    return new Promise((resolve,reject)=>{
      axios.get(`${process.env.APP_BASE_URL}authentication/verifyToken`,
    { headers: { Authorization: req.headers.authorization } }
      ).then(async (response) => {
        if(response.data.status === RESPONSE_STATUS.success){
          let _user = response.data.data.user;
          let _account = response.data.data.account;
          let connectionString = response.data.data.connectionString;
          if(connectionString){
            let rdi = sails.getDatastore('default');
            let mysql = rdi.driver.mysql;
            let tenantConnection = await  mysql.createConnection(connectionString);
            await tenantConnection.connect();
            resolve({status: true,user: _user,account: _account, connection: tenantConnection });
          }
        }else{
          reject({status: false});
          return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
        }
      }).catch((err) => {
        reject({status: false,message: err.message});
      });
    });
  }
};
