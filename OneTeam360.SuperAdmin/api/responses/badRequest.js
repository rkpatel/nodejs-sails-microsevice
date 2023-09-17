/***************************************************************************

  Example usage:

  return res.badRequest();
  OR
  return res.badRequest(optionalData);

***************************************************************************/

module.exports = function badRequest(data,message, status = '') {
  sails.config.globals.responseFormat.response(400,this.res,this.req,data,message, status);
};
