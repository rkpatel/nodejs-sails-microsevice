/***************************************************************************

  Example usage:

  return res.inActivateUser();
  OR
  return res.inActivateUser(optionalData);

***************************************************************************/

module.exports = function inActivateEmployee(data,message, status = '') {
  sails.config.globals.responseFormat.response(411,this.res,this.req,data,message,status);
};

