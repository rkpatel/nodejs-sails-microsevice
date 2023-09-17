const { PERMISSIONS } = require('./enums');

module.exports = {
  'POST /employee-list'          : { 'and': [PERMISSIONS.VIEW_EMPLOYEES] },
  'GET /:id'                     : { 'and': [PERMISSIONS.VIEW_EMPLOYEE_PROFILE] },
  'POST /add'                    : { 'and': [PERMISSIONS.ADD_EMPLOYEE] },
  'PUT /:id'                     : { 'and': [PERMISSIONS.EDIT_EMPLOYEE] },
  'POST /upload/profile-picture' : { 'or': [PERMISSIONS.EDIT_EMPLOYEE,PERMISSIONS.ADD_EMPLOYEE] },
  'POST /import'                 : { 'and': [PERMISSIONS.BULK_IMPORT_EMPLOYEE]},
  'POST /deactivate/:id'         : { 'and': [PERMISSIONS.INACTIVATE_EMPLOYEE]},

  'POST /employee-interaction'            : { 'and': [PERMISSIONS.RATE_INTERACTION] },
  'POST  /points/adjustment'              : { 'and': [PERMISSIONS.ADJUST_POINTS] },
  'POST  /points/list'                    : { 'and': [PERMISSIONS.VIEW_POINTS_HISTORY] },
  'POST /certificate/add'                 : { 'and': [PERMISSIONS.ADD_CERTIFICATE] },
  'POST /certificate'                     : { 'and': [PERMISSIONS.ADD_CERTIFICATE] },
  // doubt
  'POST /certificate/list'                : { 'and': [PERMISSIONS.VIEW_CERTIFICATE] },
  'POST /note'                            : { 'and': [PERMISSIONS.ADD_NOTE] },
  // doubt
  'POST  /notes/list'                     : { 'and': [PERMISSIONS.VIEW_NOTES] },
  'POST /feedback-report/manager-report'  : { 'and': [PERMISSIONS.VIEW_MANAGER_REPORT] },
  'POST /manager-feedback-report/export'  : { 'and': [PERMISSIONS.EXPORT_MANAGER_REPORT] },
  'POST /feedback-report/location-report' : { 'and': [PERMISSIONS.VIEW_LOCATION_REPORT] },
  'POST /location-feedback-report/export' : { 'and': [PERMISSIONS.EXPORT_LOCATION_REPORT] },
  'POST /view-statastics'                 : { 'and': [PERMISSIONS.VIEW_FEEDBACK_STATASTICS] },
  'POST /view-statistics'                 : { 'and': [PERMISSIONS.VIEW_FEEDBACK_STATASTICS] },
  'POST  /certificate/report-list'        : { 'and': [PERMISSIONS.VIEW_CERTIFICATE_REPORT]},
  'POST  /certificate-report-list/export' : { 'and': [PERMISSIONS.EXPORT_CERTIFICATE_REPORT]},

  'POST /employee-checkin'      : { 'and': [PERMISSIONS.REQUEST_CHECK_IN]},
  'POST /employee-checkin/list' : { 'and': [PERMISSIONS.VIEW_PENDING_CHECK_IN_REQUESTS]},
  'PUT /employee-checkin/edit'  : { 'and': [PERMISSIONS.REVIEW_CHECK_IN]},
};


