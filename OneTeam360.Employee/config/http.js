/***************************************************************************

  HTTP Server Settings
  (sails.config.http)

  Configuration for the underlying HTTP server in Sails.
  (for additional recommended settings, see `config/env/production.js`)

***************************************************************************/



module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/
  trustProxy : true,
  middleware : {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/
    compress : require('compression')(),
    order    : [
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],

    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    bodyParser: (function _configureBodyParser() {
      let skipper = require('skipper');
      return skipper({ maxTimeToBuffer: 40000 });
    })()
  },
};
