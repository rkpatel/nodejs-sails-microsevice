/***************************************************************************

  Example usage:

  return res.inActivateUser();
  OR
  return res.inActivateUser(optionalData);

***************************************************************************/

module.exports = function inActivateUser(data,message, status = '') {
  sails.config.globals.responseFormat.response(410,this.res,this.req,data,message,status);
};
