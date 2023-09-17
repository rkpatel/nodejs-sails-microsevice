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

    bodyParser: (function _configureBodyParser(){
      var skipper = require('skipper')();
      var rawParser = require('body-parser').raw({type: '*/*'});
      // var middlewareFn = skipper({ strict: true, maxTimeToBuffer: 10000 });
      // return middlewareFn;
      // Create and return the middleware function
      return function(req, res, next) {
        sails.log.debug(req.headers);
        if (req.headers && req.headers['stripe-signature']) {
          sails.log.info('request using raw parser middleware');
          return rawParser(req, res, next);
        }
        // Otherwise use Skipper to parse the body
        // sails.log.info('request using skipper middleware');
        return skipper(req, res, next);
      };
    })()
  },
};
