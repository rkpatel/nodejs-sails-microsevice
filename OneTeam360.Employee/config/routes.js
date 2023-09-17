/***************************************************************************

  Route Mappings
  (sails.config.routes)

  Your routes tell Sails what to do each time it receives a request.

***************************************************************************/

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'GET /permissions'  : 'CommonController.getPermission',
  'GET /swagger.json' : 'CommonController.swagger',
  'GET /locations'    : 'CommonController.locations',
  'GET /jobTypes'     : 'CommonController.jobTypes',
  'GET /health-check' : 'CommonController.healthCheck',

  /***************************************************************************
  *                                                                          *
  * Employee routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'POST /'                             : 'EmployeeController.add',
  'POST /add'                          : 'EmployeeController.add',
  'GET  /:id'                          : 'EmployeeController.findById',
  'POST /employee-list'                : 'EmployeeController.find',
  'PUT /:id'                           : 'EmployeeController.edit',
  'DELETE /:id'                        : 'EmployeeController.delete',
  'POST /deactivate/:id'               : 'EmployeeController.deactivate',
  'POST /activate/:id'                 : 'EmployeeController.activate',
  'POST /import'                       : 'EmployeeController.import',
  'POST /imageUpload'                  : 'EmployeeController.imageUpload',
  'GET /reinvite/:id'                  : 'EmployeeController.reinvite',
  'POST /filter'                       : 'EmployeeController.filter',
  'GET /getfilter/:id'                 : 'EmployeeController.getFilter',
  'GET /trigger-aboutToCheckInRequast' : 'CheckInRequestController.trigger',
  'POST /upload/profile-picture'       : 'EmployeeController.uploadProfilePicture',

  /***************************************************************************
  *                                                                          *
  * Notes routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'POST /note'        : 'NoteController.add',
  'POST  /notes/list' : 'NoteController.find',
  'GET  /note/types'  : 'NoteController.types',
  'GET  /note/graph'  : 'NoteController.graph',
  'DELETE /note/:id'  : 'NoteController.delete',

  /***************************************************************************
  *                                                                          *
  * Certificate routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'POST /certificate/assign'                : 'CertificateController.assign',
  'POST /certificate/assignmultiple'        : 'CertificateController.assignMultiple',
  'POST /certificate/assignmultipleCrts'    : 'CertificateController.assignMultipleCrts',
  'POST /certificate/add'                   : 'CertificateController.add',
  'POST /certificate'                       : 'CertificateController.uploadCertificate',
  'GET  /certificate/types'                 : 'CertificateController.findCertificateTypes',
  'POST  /certificate/list'                 : 'CertificateController.find',
  'POST  /certificate/report-list'          : 'CertificateController.findCertificates',
  'POST  /certificate/report-list-count'    : 'CertificateController.findCertificatesCount',
  'POST  /certificate-report-list/export'   : 'CertificateController.exportCertificateReportList',
  'GET  /certificate/detail'                : 'CertificateController.findById',
  'PUT  /certificate/edit'                  : 'CertificateController.edit',
  'DELETE /certificate/delete'              : 'CertificateController.delete',
  'GET /certificate/expirecount'            : 'CertificateController.alertAbouttoExpire',
  'PUT /certificate/review'                 : 'CertificateController.review',
  'GET /certificate/expireCertificate'      : 'CertificateController.ListAbouttoExpire',
  'GET  /certificate/trigger-aboutToExpire' : 'CertificateController.trigger',

  /***************************************************************************
  *                                                                          *
  * Point Calculation routes                                                 *
  *                                                                          *
  ***************************************************************************/
  'POST  /points/adjustment'          : 'PointCalculationController.pointsAdjustment',
  'POST  /points/list'                : 'PointCalculationController.find',
  'POST  /points/interaction-history' : 'PointCalculationController.findInteractionHistory',

  'GET  /points/trigger-calculation'     : 'PointCalculationController.trigger',
  'GET  /points/trigger-calculationnoti' : 'PointCalculationController.triggerNoti',

  /***************************************************************************
  *                                                                          *
  * Common routes                                                            *
  * Employee Interaction routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /employee-interaction'       : 'InteractionController.add',
  'POST /employee-interaction/graph' : 'InteractionController.graph',
  'GET /manager-dashboard2/:id'      : 'DashboardController.managerCardSecondTab',
  'GET /manager-dashboard/:id'       : 'DashboardController.managerCardFirstTab',
  'POST /employee-dashboard'         : 'DashboardController.employeeCard',

  'GET /trigger': 'EmployeeCertificateController.trigger',
  /***************************************************************************
  *                                                                          *
  * Employee-CheckIn routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'POST /employee-checkin'                       : 'EmployeeCheckInController.add',
  'GET /employee-checkin/:id'                    : 'EmployeeCheckInController.findById',
  'POST /employee-checkin/list'                  : 'EmployeeCheckInController.findListById',
  'PUT /employee-checkin/edit'                   : 'EmployeeCheckInController.edit',
  'POST /employee-checkin/pending-request-count' : 'EmployeeCheckInController.pendingRequestCount',

  'GET /trigger-checkout': 'EmployeeCheckOutCronController.triggerCheckout',


  /***************************************************************************
  *                                                                          *
  * feedback statastics routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'POST /view-statastics'                    : 'FeedbackStatasticsController.viewStatastics',
  'POST /view-statistics'                    : 'FeedbackStatasticsController.viewStatastics',
  'GET /feedback-availability'               : 'FeedbackStatasticsController.checkFeedbackAvailability',
  /***************************************************************************
  *                                                                          *
  * feedback manager report routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /feedback-report/manager-report'     : 'FeedbackReportController.findManagerFeedbackReport',
  'POST /feedback-report/manager-report-id'  : 'FeedbackReportController.findManagerFeedbackReportById',
  'POST /feedback-report/location-report-id' : 'FeedbackReportController.findLocationFeedbackReportById',
  'POST /feedback-report/location-report'    : 'FeedbackReportController.findLocationFeedbackReport',

  'POST /manager-feedback-report/export'  : 'FeedbackReportController.exportManagerFeedbackReport',
  'POST /location-feedback-report/export' : 'FeedbackReportController.exportLocationFeedbackReport',
  /***************************************************************************
  *                                                                          *
  * Employee-Feedback routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /feedback-question/active/list'   : 'EmployeeFeedbackController.findQuestionList',
  'POST /feedback-question/submit'        : 'EmployeeFeedbackController.submitFeedback',
  'GET /feedback-question/manager-list'   : 'EmployeeFeedbackController.findManager',
  'POST /feedback/location-detail'        : 'EmployeeFeedbackController.findLocationDetail',
  'GET /trigger/weekly-feedback-report'   : 'FeedbackReportController.trigger',
  'POST /feedback/pending-feedback-count' : 'EmployeeFeedbackController.pendingFeedbackCount',
  'POST /feedback/questionListByLocation' : 'EmployeeFeedbackController.findQuestionListByLocation',

};
