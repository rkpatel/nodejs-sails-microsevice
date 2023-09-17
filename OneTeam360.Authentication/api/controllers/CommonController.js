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

const { generateToken } = require('../services/jwt');
const { RESPONSE_STATUS } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;

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

  verifyToken: async (req,res) => {
    let user = req.user;
    let token = req.token;
    let account = req.account;
    let connectionString = req.connectionString;
    let timezone = req.timezone;
    let dateTimeFormat = req.dateTimeFormat;
    let dateFormat = req.dateFormat;
    return res.ok({ user, token, connectionString, account, timezone, dateTimeFormat, dateFormat },'',RESPONSE_STATUS.success);
  },

  refreshToken: async (req,res) => {
    let payload = req.payload;
    let token = await generateToken({
      id                  : payload.id,
      employee_profile_id : payload.employee_profile_id,
      isLoggedIn          : payload.isLoggedIn,
      tenantId            : payload.tenantId,
      tenantGuid          : payload.tenantGuid
    }, process.env.JWT_LOGIN_EXPIRY);
    return res.ok({
      token: token
    },messages.REFRESH_TOKEN_SUCCESS,RESPONSE_STATUS.success);
  },

  healthCheck: async (req,res) => {
    return res.ok(undefined,messages.HEALTH_OK,RESPONSE_STATUS.success);
  }

};
