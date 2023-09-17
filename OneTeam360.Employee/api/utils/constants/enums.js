module.exports = {
  ACCOUNT_STATUS: {
    active   : 'Active',
    inactive : 'Inactive',
    invited  : 'Invited'
  },
  CERTIFICATE_STATUS: {
    assigned : 'Assigned',
    inreview : 'InReview',
    active   : 'Active',
    rejected : 'Rejected',
    expired  : 'Expired'
  },
  CHECKIN_STATUS: {
    APPROVED      : 'Approved',
    REJECTED      : 'Rejected',
    PENDING       : 'Pending',
    CHECKEDOUT    : 'CheckedOut',
    AUTO_REJECTED : 'AutoRejected'
  },
  RESPONSE_STATUS: {
    success : 'success',
    error   : 'error',
    warning : 'warn',
    info    : 'info'
  },
  PORTAL_ACCESS_STATUS: {
    admin    : 'admin_portal',
    customer : 'customer_portal',
  },
  NOTIFICATION_ENTITIES: {
    CREATE_PASSWORD             : 'CREATE_PASSWORD',
    RESET_PASSWORD              : 'RESET_PASSWORD',
    ADD_NOTE                    : 'ADD_NOTE',
    ADD_NOTE_NOTIFY_MANAGER     : 'ADD_NOTE_NOTIFY_MANAGER',
    CRT_ABOUT_TO_EXPIRE         : 'CRT_ABOUT_TO_EXPIRE',
    EMPLOYEE_POINTS_UPDATE      : 'EMPLOYEE_POINTS_UPDATE',
    POINT_CALCULATION_FEEDBACK  : 'POINT_CALCULATION_FEEDBACK',
    EMPLOYEE_LEVEL_UPDATE       : 'EMPLOYEE_LEVEL_UPDATE',
    CERTIFICATE_APPROVED        : 'CERTIFICATE_APPROVED',
    CERTIFICATE_REJECTED        : 'CERTIFICATE_REJECTED',
    CERTIFICATE_AUTO_ASSIGN     : 'CERTIFICATE_AUTO_ASSIGN',
    CERTIFICATE_AUTO_JOB_ASSIGN : 'CERTIFICATE_AUTO_JOB_ASSIGN',
    CHECKIN_REQUEST             : 'CHECKIN_REQUEST',
    CERTIFICATE_REPORT_DIGEST   : 'CERTIFICATE_REPORT_DIGEST',
    ACCEPT_CHECKIN_REQUEST      : 'ACCEPT_CHECKIN_REQUEST',
    REJECT_CHECKIN_REQUEST      : 'REJECT_CHECKIN_REQUEST',
    FEEDBACK_REPORT_DIGEST      : 'FEEDBACK_REPORT_DIGEST'
  },
  DEFAULT_TASK_TYPE: {
    ASSIGN_CERTIFICATE : 'Add Certificate',
    REVIEW_CERTIFICATE : 'Review Certificate'
  },
  PERMISSIONS: {
    VIEW_ALL_EMPLOYEES                : 'View_All_employees -_All_locations',
    VIEW_EMPLOYEES                    : 'View_Employees',
    ADD_EMPLOYEE                      : 'Add_Employee',
    BULK_IMPORT_EMPLOYEE              : 'Bulk_Import_Employees',
    INACTIVATE_EMPLOYEE               : 'Inactivate_Employee',
    EDIT_EMPLOYEE                     : 'Edit_Employee',
    VIEW_EMPLOYEE_PROFILE             : 'View_Employee_Profile',
    VIEW_CERTIFICATE                  : 'View_Certificates',
    ADD_NOTE                          : 'Add_Note',
    REMOVE_NOTE                       : 'Remove_Note',
    ASSIGN_CERTIFICATE                : 'Assign_Certificate',
    ADD_CERTIFICATE                   : 'Add_Certificate',
    EDIT_CERTIFICATE                  : 'Edit_Certificate',
    EDIT_ASSIGNED_CERTIFICATE         : 'Edit_Assigned_Certificate',
    REVIEW_CERTIFICATE                : 'Review_Certificate',
    DELETE_CERTIFICATE                : 'Delete_Certificate',
    ADJUST_POINTS                     : 'Adjust_Point',
    VIEW_POINTS_HISTORY               : 'View_Points_History',
    RATE_INTERACTION                  : 'Rate_Interaction',
    EDIT_DATE_OF_HIRE                 : 'Edit_Date_of_Hire',
    EDIT_EMAIL_ID                     : 'Edit_Email_ID',
    VIEW_PRIVATE_NOTES                : 'View_Private_Notes',
    EDIT_TEAM_MEMBER_ID               : 'Edit_Team_Member_ID',
    RECEIVE_CERTIFICATE_REPORT_DIGEST : 'Receive_Certificate_Report_Digest',
    VIEW_ALL_LOCATIONS                : 'View_All_Locations',
    RECEIVE_WEEKLY_DIGEST             : 'Receive_Weekly_Digest',
    VIEW_NONANONYMOUS_FEEDBACK_REPORT : 'View_nonAnonymous_Feedback_Report',
    VIEW_NOTES                        : 'View_Notes',
    EXPORT_MANAGER_REPORT             : 'Export_Manager_Report',
    VIEW_MANAGER_REPORT               : 'View_Manager_Report',
    EXPORT_LOCATION_REPORT            : 'Export_Location_Report',
    VIEW_LOCATION_REPORT              : 'View_Location_Report',
    VIEW_FEEDBACK_STATASTICS          : 'View_Feedback_Statastics',
    VIEW_CERTIFICATE_REPORT           : 'View_Certificates_Report',
    EXPORT_CERTIFICATE_REPORT         : 'Export_Certificates_Report',
    REVIEW_CHECK_IN                   : 'Review_Check_in',
    REQUEST_CHECK_IN                  : 'Request_Check_in',
    VIEW_PENDING_CHECK_IN_REQUESTS    : 'View_Pending_Checkin_Requests'
  },
  ACCOUNT_CONFIG_CODE: {
    tenant_db_connection_string              : 'tenant_db_connection_string',
    time_zone                                : 'time_zone',
    date_time_format                         : 'date_time_format',
    date_format                              : 'date_format',
    deduct_points_for_negative_performance   : 'deduct_points_for_negative_performance',
    threshold_score_for_points_calculation   : 'threshold_score_for_points_calculation',
    additional_points_for_points_calculation : 'additional_points_for_points_calculation',
    cron_certificate_expire                  : 'cron_certificate_expire',
    cron_points_calculation                  : 'cron_points_calculation',
    cron_points_notification                 : 'cron_points_notification',
    deduct_points                            : 'deduct_points',
    points_for_positive_performance          : 'points_for_positive_performance',
    notification_mail_all_users              : 'notification_mail_all_users',
    checkin_points_calculation               : 'checkin_points_calculation',
    expire_certificate_days_limit            : 'expire_certificate_days_limit',
    cron_certificate_report_submission       : 'cron_certificate_report_submission',
    cron_checkin                             : 'cron_checkin',
    allow_multiple_checkin                   : 'allow_multiple_checkin',
    cron_360feedback_report_submission       : 'cron_360feedback_report_submission',
    receive_360feedback_report_on            : 'receive_360feedback_report_on'
  },
  CRON_JOB_CODE: {
    points_calculation              : 'POINTS_CALCULATION',
    points_calculation_notification : 'POINTS_CALCULATION_NOTIFICATION',
    certificate_aboutToExpire       : 'CERTIFICATE_ABOUT_TO_EXPIRE',
    CHECKIN_REQUEST                 : 'CHECKIN_REQUEST',
    monthly_certificate_expire      : 'MONTHLY_CERTIFICATE_EXPIRE',
    checkin_request                 : 'CHECKIN_REQUEST',
    checkout                        : 'CHECKOUT',
    weekly_feedback_report          : 'WEEKLY_FEEDBACK_REPORT'
  },

  ALL_GRADE: {
    EXCEED_EXPECTATION : '1',
    MEET_EXPECTATION   : '2',
    REMEDIATE          : '3'
  },

  ANSWER_FORMAT: {
    text            : 'text',
    multiple_choice : 'multiple_choice'
  },
  PERIODS: {
    LAST_WEEK      : 'LAST_WEEK',
    LAST_MONTH     : 'LAST_MONTH',
    LAST_SIX_MONTH : 'LAST_SIX_MONTH',
    LAST_YEAR      : 'LAST_YEAR',
  },

  QUESTION_STATUS: {
    active   : 'Active',
    inactive : 'Inactive'
  },

  FEEDBACK_CATEGORY: {
    manager  : 'Manager',
    location : 'Location'
  },

  UPLOAD_REQ_FOR: {
    profile_picture: 'profile_picture'
  },
};


