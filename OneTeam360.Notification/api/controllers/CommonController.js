/***************************************************************************

  Controller     : Common

***************************************************************************/
const messages = sails.config.globals.messages;
const { RESPONSE_STATUS } = require('../utils/constants/enums');
module.exports = {

  /**
   * This controller function will called when user request for all the swagger.json
   *
   * NOTE : Here we are not using are custom global response as we have to server swagger.json file
   */
  swagger: async (_req, res) => {
    const swaggerJson = require('../../swagger/swagger.json');
    if (!swaggerJson) {
      res
          .status(404)
          .set('content-type', 'application/json')
          .send({message: 'Cannot find swagger.json, has the server generated it?'});
    }
    return res
        .status(200)
        .set('content-type', 'application/json')
        .send(swaggerJson);
  },

  logger: async (_req, res) => {
    const systemLogger = require('../../logging/systemLogger.txt');
    if (!systemLogger) {
      res
          .status(404)
          .set('content-type', 'application/json')
          .send({message: 'Cannot find systemLogger.txt'});
    }
    return res
        .status(200)
        .set('content-type', 'application/json')
        .send(swaggerJson);
  },
  healthCheck: async (req,res) => {
    return res.ok(undefined,messages.HEALTH_OK,RESPONSE_STATUS.success);
  }
};
