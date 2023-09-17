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

  'POST /login'            : 'UserController.login',
  'POST /user/'            : 'UserController.add',
  'GET  /user/:id'         : 'UserController.findById',
  'POST /user-list'        : 'UserController.find',
  'PUT /user/:id'          : 'UserController.edit',
  'DELETE /:id'            : 'UserController.delete',
  'POST /change-password'  : 'UserController.changePassword',
  'POST /create-password'  : 'UserController.createPassword',
  'POST /forgot-password'  : 'UserController.forgotPassword',
  'POST /reset-password'   : 'UserController.resetPassword',
  'POST /impersonate'      : 'UserController.signInCustomer',
  'GET /user/activate/:id' : 'UserController.activate',
  'GET /profile-detail'    : 'UserController.profileDetails',


  /***************************************************************************
  *                                                                          *
  *
  * Customer routes                                                      *
  *                                                                          *
  ***************************************************************************/
  'POST /customer-list'            : 'CustomerController.list',
  'POST /export-customer'          : 'CustomerController.customerExport',
  'GET /dashboard'                 : 'DashboardController.dashboardCardsDetails',
  'POST /customer-active-employee' : 'CustomerController.findcustomeractiveemployee',
  'GET /reinvite/:id'              : 'CustomerController.reinvite',
  //'GET /welcome' : 'UserController.welcome',
  /***************************************************************************
  *                                                                          *
  *
  * Notification routes                                                      *
  *                                                                          *
  ***************************************************************************/

  'POST /notification/send' : 'NotificationController.send',
  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'GET /verifyToken'        : 'CommonController.verifyToken',
  'GET /health-check'       : 'CommonController.healthCheck'

};
