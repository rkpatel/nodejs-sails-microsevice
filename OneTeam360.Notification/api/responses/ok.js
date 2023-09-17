/***************************************************************************

  Example usage:

  return res.ok();
  OR
  return res.ok(optionalData);

***************************************************************************/

module.exports = function ok(data,message,status = '') {
  sails.config.globals.responseFormat.response(200,this.res,this.req,data,message,status);
};

