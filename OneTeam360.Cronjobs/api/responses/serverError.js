/***************************************************************************

  Example usage:

  return res.serverError();
  OR
  return res.serverError(optionalData);

***************************************************************************/

module.exports = function serverError(data,message,status='') {
  sails.config.globals.responseFormat.response(500,this.res,this.req,data,message,status);
};
