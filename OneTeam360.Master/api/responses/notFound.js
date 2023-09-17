/***************************************************************************

  Example usage:

  return res.notFound();
  OR
  return res.notFound(optionalData);

***************************************************************************/

module.exports = function notFound(data,message, status= '') {
  sails.config.globals.responseFormat.response(404,this.res,this.req,data,message,status);
};
