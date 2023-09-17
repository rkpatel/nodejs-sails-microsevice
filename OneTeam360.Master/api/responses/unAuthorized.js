const messages = sails.config.globals.messages;
module.exports = function unAuthorized(data,message, status = '') {
  let _data = data;
  if(message === messages.ROLE_PERMISSION_REQUIRED){
    _data= {
      code: 'INVALID_PERMISSION'
    };
  }
  sails.config.globals.responseFormat.response(401,this.res,this.req,_data,message,status);
};
