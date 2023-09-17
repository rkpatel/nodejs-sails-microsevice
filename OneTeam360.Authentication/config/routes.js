/***************************************************************************

  Route Mappings
  (sails.config.routes)

  Your routes tell Sails what to do each time it receives a request.

***************************************************************************/

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Auth routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'POST /login'                  : 'UserController.login',
  // 'POST /select-tenant'   : 'UserController.selectTenant',
  'POST /change-password'        : 'UserController.changePassword',
  'POST /create-password'        : 'UserController.createPassword',
  'POST /forgot-password'        : 'UserController.forgotPassword',
  'POST /reset-password'         : 'UserController.resetPassword',
  'GET  /system-log'             : 'UserController.getSystemLog',
  'GET /profile-detail'          : 'UserController.profileDetails',
  'POST /sign-in-to-admin'       : 'UserController.SignInToAdmin',
  'POST /sign-in-to-employee'    : 'UserController.SignInToEmployee',
  'POST /sign-in-to-primaryuser' : 'UserController.SignInToPrimaryUser',
  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'GET /swagger.json' : 'CommonController.swagger',
  'GET /verifyToken'  : 'CommonController.verifyToken',
  'GET /refreshToken' : 'CommonController.refreshToken',
  'GET /health-check' : 'CommonController.healthCheck'
};
