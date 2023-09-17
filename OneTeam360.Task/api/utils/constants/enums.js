module.exports = {

  RESPONSE_STATUS: {
    success : 'success',
    error   : 'error',
    warning : 'warn',
    info    : 'info'
  },
  TASK_STATUS: {
    active    : 'Active',
    inactive  : 'Inactive',
    pending   : 'Pending',
    completed : 'Completed',
    overdue   : 'Overdue'
  },
  ACCOUNT_STATUS: {
    active   : 'Active',
    inactive : 'Inactive',
    invited  : 'Invited'
  },
  NOTIFICATION_ENTITIES: {
    TASK_ASSIGNED         : 'TASK_ASSIGNED',
    TASK_DELETION         : 'TASK_DELETION',
    TASK_MODIFICATION     : 'TASK_MODIFICATION',
    TASK_COMPLETED        : 'TASK_COMPLETED',
    GROUP_TASK_COMPLETED  : 'GROUP_TASK_COMPLETED',
    TASK_OVERDUE_REMINDER : 'TASK_OVERDUE_REMINDER'
  },
  ACCOUNT_CONFIG_CODE: {
    tenant_db_connection_string  : 'tenant_db_connection_string',
    time_zone                    : 'time_zone',
    date_time_format             : 'date_time_format',
    date_format                  : 'date_format',
    cron_task_overDue            : 'cron_task_overDue',
    automated_task_due_date_days : 'automated_task_due_date_days'
  },
  DEFAULT_TASK_TYPE: {
    ASSIGN_CERTIFICATE : 'Add Certificate',
    REVIEW_CERTIFICATE : 'Review Certificate'
  },
  CRON_JOB_CODE: {
    task_overdue   : 'TASK_OVERDUE',
    task_scheduled : 'TASK_SCHEDULED',
  },
  TASK_PERMISSION: {
    addTask                 : 'Add_Task',
    View_Task               : 'View_Task',
    editTask                : 'Edit_Task',
    accessTaskHistory       : 'Access_Task_History',
    deleteTask              : 'Delete_Task',
    completeTask            : 'Complete_Task',
    viewAllTasks            : 'View_All_Tasks',
    viewPrivateTask         : 'View_Private_Tasks',
    addEmployeeTask         : 'Add_Employee_Task',
    editEmployeeTask        : 'Edit_Employee_Task',
    deleteEmployeeTask      : 'Delete_Employee_Task',
    completeEmployeeTask    : 'Complete_Employee_Task',
    viewEmployeePrivateTask : 'View_Employee_Private_Tasks',
  },
  AUTOMATED_TASK_ENTITY_TYPE: {
    TRAINING: 'TRAINING'
  }
};


