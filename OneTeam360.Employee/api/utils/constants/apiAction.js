const { PERMISSIONS } = require('./enums');

module.exports = {

  /***************************************************************************
  *                                                                          *
  * Employee routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /employee-list'          : { 'or': [PERMISSIONS.VIEW_ALL_EMPLOYEES,PERMISSIONS.VIEW_EMPLOYEES] },
  'POST /'                       : { 'and': [PERMISSIONS.ADD_EMPLOYEE] },
  'POST /import'                 : { 'and': [PERMISSIONS.BULK_IMPORT_EMPLOYEE]},
  'DELETE /:id'                  : { 'and': [PERMISSIONS.INACTIVATE_EMPLOYEE] },
  'PUT /:id'                     : { 'and': [PERMISSIONS.EDIT_EMPLOYEE] },
  'GET /:id'                     : { 'or': [PERMISSIONS.EDIT_EMPLOYEE, PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },
  'POST /upload/profile-picture' : { 'or': [PERMISSIONS.EDIT_EMPLOYEE,PERMISSIONS.ADD_EMPLOYEE] },

  /***************************************************************************
  *                                                                          *
  * Notes routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /note'        : { 'and': [PERMISSIONS.ADD_NOTE] },
  'POST  /notes/list' : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },
  'GET  /note/graph'  : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },
  'DELETE /note/:id'  : { 'and': [PERMISSIONS.REMOVE_NOTE]},

  /***************************************************************************
  *                                                                          *
  * Certificate routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /certificate/assign' : { 'and': [PERMISSIONS.ASSIGN_CERTIFICATE] },
  'POST /certificate/add'    : { 'and': [PERMISSIONS.ADD_CERTIFICATE] },
  'POST /certificate'        : { 'and': [PERMISSIONS.ADD_CERTIFICATE] },

  'POST /certificate/list'             : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },
  // 'GET /certificate/detail'            : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] }, Internally managed permission in controller
  'PUT /certificate/edit'              : { 'or': [PERMISSIONS.EDIT_CERTIFICATE,PERMISSIONS.EDIT_ASSIGNED_CERTIFICATE] },
  'DELETE /certificate/delete'         : { 'and': [PERMISSIONS.DELETE_CERTIFICATE] },
  'GET /certificate/expirecount'       : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },
  'PUT /certificate/review'            : { 'and': [PERMISSIONS.REVIEW_CERTIFICATE] },
  'GET /certificate/expireCertificate' : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },


  /***************************************************************************
  *                                                                          *
  * Point Calculation routes                                                 *
  *                                                                          *
  ***************************************************************************/
  'POST /points/adjustment' : { 'and': [PERMISSIONS.ADJUST_POINTS] },
  'POST /points/list'       : { 'and': [PERMISSIONS.VIEW_POINTS_HISTORY] },


  /***************************************************************************
  *                                                                          *
  * Common routes                                                            *
  * Employee Interaction routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /employee-interaction'       : { 'and': [PERMISSIONS.RATE_INTERACTION] },
  'POST /employee-interaction/graph' : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },

  'POST /feedback-report/manager-report'  : { 'and': [PERMISSIONS.VIEW_MANAGER_REPORT] },
  'POST /feedback-report/location-report' : { 'and': [PERMISSIONS.VIEW_LOCATION_REPORT] },
  'POST /view-statastics'                 : { 'and': [PERMISSIONS.VIEW_FEEDBACK_STATASTICS] },
  'POST /view-statistics'                 : { 'and': [PERMISSIONS.VIEW_FEEDBACK_STATASTICS] },
  'POST  /certificate/report-list'        : { 'and': [PERMISSIONS.VIEW_CERTIFICATE_REPORT]},
  'POST  /certificate-report-list/export' : { 'and': [PERMISSIONS.EXPORT_CERTIFICATE_REPORT]}
};

