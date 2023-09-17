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
  LOGIN_STATUS: {
    success : 'Success',
    failure : 'Failure',
  },
  PORTAL_ACCESS_STATUS: {
    admin    : 'admin_portal',
    customer : 'customer_portal',
  },
  ACCOUNT_CONFIG_CODE: {
    tenant_db_connection_string : 'tenant_db_connection_string',
    time_zone                   : 'time_zone',
    date_time_format            : 'date_time_format',
    date_format                 : 'date_format'
  },
  NOTIFICATION_ENTITIES: {
    CREATE_PASSWORD_ADMIN                : 'CREATE_PASSWORD_ADMIN',
    RESET_PASSWORD_ADMIN                 : 'RESET_PASSWORD_ADMIN',
    CREATE_PASSWORD_CUSTOMER             : 'CREATE_PASSWORD_CUSTOMER',
    PAYMENT_DECLINED_CUSTOMER            : 'PAYMENT_DECLINED_CUSTOMER',
    PAYMENT_LINK_CUSTOMER                : 'PAYMENT_LINK_CUSTOMER',
    NOTIFICATION_CUSTOMER                : 'NOTIFICATION_CUSTOMER',
    NOTIFICATION_PAYMENT_FAILED_REMINDER : 'NOTIFICATION_PAYMENT_FAILED_REMINDER'
  },
  NOTIFICATION_QUEUE_ENTITIES: {
    NOTE              : 'NOTE',
    TASK              : 'TASK',
    CERTIFICATE       : 'CERTIFICATE',
    POINT_CALCULATION : 'POINT_CALCULATION',
    COMPETITON        : 'COMPETITON'
  },
  NOTIFICATION_TYPE: {
    EMAIL  : 'Email',
    MOBILE : 'Mobile',
    InApp  : 'InApp',
    SMS    : 'SMS'
  },
  NOTIFICATION_ACCOUNT_NAME  : 'OneTeam360',
  NOTIFICATION_ACCOUNT_EMAIL : 'oneteam360.qa@gmail.com'
};


