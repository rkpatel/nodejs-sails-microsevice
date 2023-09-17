module.exports = {
  STATUS: {
    active   : 'Active',
    inactive : 'Inactive',
    invited  : 'Invited',
  },
  SUBSCRIPTION_STATUS: {
    active   : 'Active',
    inactive : 'Inactive',
    canceled : 'Canceled',
  },
  PAYMENT_STATUS: {
    success   : 'Success',
    failure   : 'Failure',
    initiated : 'Initiated',
  },
  RESPONSE_STATUS: {
    success : 'success',
    error   : 'error',
    warning : 'warn',
    info    : 'info'
  },
  MASTERINFO_STATUS: {
    account: 'account'
  },
  CRON_JOB_CODE: {
    completition_completion: 'COMPETITION_COMPLETION'
  },
  ACCOUNT_CONFIG_CODE: {
    tenant_db_connection_string : 'tenant_db_connection_string',
    time_zone                   : 'time_zone',
    date_time_format            : 'date_time_format',
    date_format                 : 'date_format',
    cron_task_overDue           : 'cron_task_overDue',
    cron_competiton_completion  : 'cron_competiton_completion'
  },
  ACCOUNT_STATUS: {
    active              : 'Active',
    inactive            : 'Inactive',
    payment_pending     : 'Payment Pending',
    payment_declined    : 'Payment Declined',
    cancelled           : 'Cancelled',
    cancelled_requested : 'Cancel Requested'
  },
  NOTIFICATION_ENTITIES: {
    CREATE_PASSWORD_CUSTOMER             : 'CREATE_PASSWORD_CUSTOMER',
    PAYMENT_DECLINED_CUSTOMER            : 'PAYMENT_DECLINED_CUSTOMER',
    PAYMENT_LINK_CUSTOMER                : 'PAYMENT_LINK_CUSTOMER',
    NOTIFICATION_CUSTOMER                : 'NOTIFICATION_CUSTOMER',
    TRIGGER_ACCOUNT_CONF                 : 'TRIGGER_ACCOUNT_CONF',
    NOTIFICATION_PAYMENT_FAILED_REMINDER : 'NOTIFICATION_PAYMENT_FAILED_REMINDER'
  },
  ONBOARD_STATUS: {
    completed: 'Completed',
  },
  PORTAL_ACCESS: {
    CUSTOMER_PORTAL : 'customer_portal',
    ADMIN_PORTAL    : 'admin_portal',
  },
  PAYMENT_METHOD: {
    card: 'card'
  },
  PERMISSION: {
    MANAGE_COMPANY_ACCOUNT : 'Manage_company_account',
    MANAGE_CONFIGURATIONS  : 'Manage_configurations'
  },
  KEY_TYPE: {
    PRIMARY   : 'Primary',
    SECONDARY : 'Secondary'
  },
  API_ENABLED: {
    YES : 'Yes',
    NO  : 'No'
  }
};
