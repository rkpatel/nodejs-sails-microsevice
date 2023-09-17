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
  ANNOUNCEMENT_STATUS: {
    active    : 'Active',
    scheduled : 'Scheduled',
    inactive  : 'Inactive',
    expired   : 'Expired'
  },
  ANNOUNCEMENT_TYPE: {
    custom      : 'custom',
    birthday    : 'birthday',
    anniversary : 'anniversary',
    abroad      : 'abroad'
  },
  NOTIFICATION_ENTITIES: {
    CREATE_PASSWORD             : 'CREATE_PASSWORD',
    RESET_PASSWORD              : 'RESET_PASSWORD',
    ADD_NOTE                    : 'ADD_NOTE',
    ADD_NOTE_NOTIFY_MANAGER     : 'ADD_NOTE_NOTIFY_MANAGER',
    TASK_ASSIGNED               : 'TASK_ASSIGNED',
    TASK_DELETION               : 'TASK_DELETION',
    TASK_MODIFICATION           : 'TASK_MODIFICATION',
    TASK_COMPLETED              : 'TASK_COMPLETED',
    GROUP_TASK_COMPLETED        : 'GROUP_TASK_COMPLETED',
    TASK_OVERDUE_REMINDER       : 'TASK_OVERDUE_REMINDER',
    CRT_ABOUT_TO_EXPIRE         : 'CRT_ABOUT_TO_EXPIRE',
    EMPLOYEE_POINTS_UPDATE      : 'EMPLOYEE_POINTS_UPDATE',
    POINT_CALCULATION_FEEDBACK  : 'POINT_CALCULATION_FEEDBACK',
    EMPLOYEE_LEVEL_UPDATE       : 'EMPLOYEE_LEVEL_UPDATE',
    COMPETITION_START           : 'COMPETITION_START',
    COMPETITION_END             : 'COMPETITION_END',
    COMPETITION_START_TODAY     : 'COMPETITION_START_TODAY',
    COMPLETE_ALL_IMPORT         : 'COMPLETED_ALL_IMPORT',
    COMPLETE_PARTIAL_IMPORT     : 'COMPLETED_PARTIAL_IMPORT',
    NOT_COMPLETE_IMPORT         : 'NOT_COMPLETE_IMPORT',
    EMPLOYEE_REPORT_SUBMISSION  : 'EMPLOYEE_REPORT_SUBMISSION',
    TRIGGER_PERMISSION_NOTI     : 'TRIGGER_PERMISSION_NOTI',
    TRIGGER_ACCOUNT_CONF        : 'TRIGGER_ACCOUNT_CONF',
    CERTIFICATE_REJECTED        : 'CERTIFICATE_REJECTED',
    CERTIFICATE_APPROVED        : 'CERTIFICATE_APPROVED',
    CUSTOM_ANNOUNCEMENT         : 'CUSTOM_ANNOUNCEMENT',
    CERTIFICATE_AUTO_ASSIGN     : 'CERTIFICATE_AUTO_ASSIGN',
    CERTIFICATE_AUTO_JOB_ASSIGN : 'CERTIFICATE_AUTO_JOB_ASSIGN',
    BIRTHDAY_ANNOUNCEMENT       : 'BIRTHDAY_ANNOUNCEMENT',
    WORK_ANNIV_ANNOUNCEMENT     : 'WORK_ANNIV_ANNOUNCEMENT',
    WORK_ONBOARD_ANNOUNCEMENT   : 'WORK_ONBOARD_ANNOUNCEMENT',
    CHECKIN_REQUEST             : 'CHECKIN_REQUEST',
    CERTIFICATE_REPORT_DIGEST   : 'CERTIFICATE_REPORT_DIGEST',
    ACCEPT_CHECKIN_REQUEST      : 'ACCEPT_CHECKIN_REQUEST',
    REJECT_CHECKIN_REQUEST      : 'REJECT_CHECKIN_REQUEST',
    FEEDBACK_REPORT_DIGEST      : 'FEEDBACK_REPORT_DIGEST'
  },
  NOTIFICATION_QUEUE_ENTITIES: {
    NOTE                       : 'NOTE',
    TASK                       : 'TASK',
    CERTIFICATE                : 'CERTIFICATE',
    POINT_CALCULATION          : 'POINT_CALCULATION',
    POINT_CALCULATION_FEEDBACK : 'POINT_CALCULATION_FEEDBACK',
    COMPETITON                 : 'COMPETITON',
    REPORT                     : 'REPORT',
    ANNOUNCEMENT               : 'ANNOUNCEMENT',
    EMPLOYEE                   : 'EMPLOYEE',
    CERTIFICATE_AUTO           : 'CERTIFICATE_AUTO',
    CERTIFICATE_DIGEST         : 'CERTIFICATE_DIGEST',
    LOCATION                   : 'LOCATION',
    FEEDBACK_DIGEST            : 'FEEDBACK_DIGEST'
  },
  NOTIFICATION_TYPE: {
    EMAIL  : 'Email',
    MOBILE : 'Mobile',
    InApp  : 'InApp',
    SMS    : 'SMS'
  },
  ACCOUNT_CONFIG_CODE: {
    tenant_db_connection_string : 'tenant_db_connection_string',
    time_zone                   : 'time_zone',
    date_time_format            : 'date_time_format',
    date_format                 : 'date_format',
    notification_mail_all_users : 'notification_mail_all_users',
    cron_announcement           : 'cron_announcement',
    cron_announcement_on        : 'cron_announcement_on',
    note_notification_roles     : 'note_notification_roles'
  },
  PERMISSIONS: {
    VIEW_CONFIGURED_ANNOUNCEMENT : 'View_Configured_Announcement',
    CREATE_ANNOUNCEMENT          : 'Create_Announcement',
    EDIT_ANNOUNCEMENT            : 'Edit_Announcement',
    INACTIVE_ANNOUNCEMENT        : 'Inactive_Announcement',
    VIEW_ALL_LOCATIONS           : 'View_All_Locations',
  },
  CRON_JOB_CODE: {
    announcement_trigger: 'ANNOUNCEMENT_TRIGGER',
  },
  PORTAL_ACCESS_STATUS: {
    admin    : 'admin_portal',
    customer : 'customer_portal',
  },
  NOTIFICATIONQUEUE_STATUS: {
    pending    : 'Pending',
    inprogress : 'InProgress',
    completed  : 'Completed'
  },
};
