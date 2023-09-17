/***************************************************************************

  Route Mappings
  (sails.config.routes)

  Your routes tell Sails what to do each time it receives a request.

***************************************************************************/

module.exports.routes = {


  /***************************************************************************
  *                                                                          *
  *
  * Notification routes                                                      *
  *                                                                          *
  ***************************************************************************/
  'GET /'                : 'NotificationController.find',
  'POST /send'           : 'NotificationController.send',
  'POST /notification'   : 'NotificationController.findAll',
  'DELETE /:id'          : 'NotificationController.delete',
  'DELETE /notification' : 'NotificationController.multipleDelete',
  'PUT /read'            : 'NotificationController.readMultiple',
  'GET /get-count'       : 'NotificationController.notificationCount',
  'PUT /notification'    : 'NotificationController.updateNotificationFlag',

  /***************************************************************************
  *                                                                          *
  * Announcement routes                                                      *
  *                                                                          *
  ***************************************************************************/
  'POST /announcement'                : 'AnnouncementController.add',
  'POST /announcementList'            : 'AnnouncementController.list',
  'GET /announcement/:id'             : 'AnnouncementController.findById',
  'PUT /announcement/:id'             : 'AnnouncementController.update',
  'PUT /announcement/auto/:id'        : 'AnnouncementController.updateauto',
  'DELETE /announcement/:id'          : 'AnnouncementController.delete',
  'PUT /announcement/update-status'   : 'AnnouncementController.updateStatus',
  'POST /announcement/dashboard'      : 'AnnouncementController.dashboard',
  'POST /announcement/dashboard-list' : 'AnnouncementController.dashboardList',

  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'GET /swagger.json' : 'CommonController.swagger',
  'GET /health-check' : 'CommonController.healthCheck'

};
