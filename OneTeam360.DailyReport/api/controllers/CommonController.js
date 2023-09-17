/***************************************************************************

  Controller     : Common

  **************************************************
  Functions
  **************************************************

  swagger     :   For exposing swagger.json from our project
  logger
  setCache
  getCache
  **************************************************

***************************************************************************/

const { RESPONSE_STATUS } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;

module.exports = {

  healthCheck: async (req,res) => {
    return res.ok(undefined,messages.HEALTH_OK,RESPONSE_STATUS.success);
  }

};
