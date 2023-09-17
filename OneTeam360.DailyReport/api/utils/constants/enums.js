module.exports = {
  ACCOUNT_STATUS: {
    active   : 'Active',
    inactive : 'Inactive',
    invited  : 'Invited'
  },
  RESPONSE_STATUS: {
    success : 'success',
    error   : 'error',
    warning : 'warn',
    info    : 'info'
  },
  MASTERINFO_STATUS: {
    dailyReport: 'dailyReport'
  },
  NOTIFICATION_ENTITIES: {
    EMPLOYEE_REPORT_SUBMISSION: 'EMPLOYEE_REPORT_SUBMISSION'
  },
  CRON_JOB_CODE: {
    employee_report_submission: 'EMPLOYEE_REPORT_SUBMISSION'
  },
  ACCOUNT_CONFIG_CODE: {
    tenant_db_connection_string              : 'tenant_db_connection_string',
    time_zone                                : 'time_zone',
    date_time_format                         : 'date_time_format',
    date_format                              : 'date_format',
    deduct_points_for_negative_performance   : 'deduct_points_for_negative_performance',
    threshold_score_for_points_calculation   : 'threshold_score_for_points_calculation',
    additional_points_for_points_calculation : 'additional_points_for_points_calculation',
    cron_report_submission                   : 'cron_report_submission',
    cron_points_calculation                  : 'cron_points_calculation',
    cron_points_notification                 : 'cron_points_notification',
    cron_certificate_report_submission       : 'cron_certificate_report_submission',
    cron_checkin                             : 'cron_checkin',
  },
  DAILY_REPORT_PERMISSION: {
    View_Configured_Report_List : 'View_Configured_Report_List',
    Create_Report               : 'Create_Report',
    Edit_Report                 : 'Edit_Report',
    Inactivate_Report           : 'Inactivate_Report',
    Clone_Report                : 'Clone_Report',
    Receive_Daily_Report_Digest : 'Receive_Daily_Report_Digest',
    View_Assigned_Reports       : 'View_Assigned_Reports',
    Submit_Daily_Report         : 'Submit_Daily_Report',
    View_Report_History         : 'View_Report_History',
    VIEW_ALL_LOCATIONS          : 'View_All_Locations',
  }
};


