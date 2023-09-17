module.exports = {
  ACCOUNT_STATUS: {
    active   : 'Active',
    inactive : 'Inactive',
    invited  : 'Invited'
  },
  IMPORT_TEMP_STATUS: {
    success : 'Success',
    failure : 'Failure'
  },
  IMPORT_STATUS: {
    imported  : 'Imported',
    validated : 'Validated',
    completed : 'Completed',
    failed    : 'Failed',
    mailSent  : 'Mail Sent'
  },
  NOTIFICATION_ENTITIES: {
    CREATE_PASSWORD         : 'CREATE_PASSWORD',
    RESET_PASSWORD          : 'RESET_PASSWORD',
    ADD_NOTE                : 'ADD_NOTE',
    CRT_ABOUT_TO_EXPIRE     : 'CRT_ABOUT_TO_EXPIRE',
    EMPLOYEE_POINTS_UPDATE  : 'EMPLOYEE_POINTS_UPDATE',
    EMPLOYEE_LEVEL_UPDATE   : 'EMPLOYEE_LEVEL_UPDATE',
    COMPLETE_ALL_IMPORT     : 'COMPLETED_ALL_IMPORT',
    COMPLETE_PARTIAL_IMPORT : 'COMPLETED_PARTIAL_IMPORT',
    NOT_COMPLETE_IMPORT     : 'NOT_COMPLETE_IMPORT',
    TRIGGER_PERMISSION_NOTI : 'TRIGGER_PERMISSION_NOTI'
  },
  RESPONSE_STATUS: {
    success : 'success',
    error   : 'error',
    warning : 'warn',
    info    : 'info'
  },
  MASTERINFO_STATUS: {
    account              : 'account',
    location             : 'location',
    level                : 'level',
    jobtype              : 'jobtype',
    certificatetype      : 'certificatetype',
    role                 : 'role',
    state                : 'state',
    city                 : 'city',
    country              : 'country',
    notificationtemplate : 'notificationtemplate',
    tasktype             : 'tasktype',
    weightedTier         : 'weighted_tier',
    impactMultiplier     : 'impact_multiplier',
    notetype             : 'notetype',
    trainingCategory     : 'trainingcategory',
    training             : 'training',
    trainingGrouping     : 'trainingGrouping',
    grades               : 'grades',
    interactionFactor    : 'interaction_factor',
    questionType         : 'question_type',
    relation             : 'relation'
  },
  UPLOAD_REQ_FOR: {
    task                 : 'task',
    employee             : 'employee',
    certificate          : 'certificate',
    training_explanation : 'training_explanation',
    training_photo       : 'training_photo',
    training_video       : 'training_video',
    competition          : 'competition',
    dailyreport          : 'dailyreport',
    bulk_import_employee : 'bulk_import_employee'
  },
  JOB_TYPE_STATUS: {
    active   : 'Active',
    inactive : 'Inactive'
  },
  LOCATION_STATUS: {
    active   : 'Active',
    inactive : 'Inactive'
  },
  ACCOUNT_CONFIG_CODE: {
    training_master_photos_count             : 'training_master_photos_count',
    training_master_video_count              : 'training_master_video_count',
    tenant_db_connection_string              : 'tenant_db_connection_string',
    time_zone                                : 'time_zone',
    date_time_format                         : 'date_time_format',
    date_format                              : 'date_format',
    deduct_points_for_negative_performance   : 'deduct_points_for_negative_performance',
    threshold_score_for_points_calculation   : 'threshold_score_for_points_calculation',
    additional_points_for_points_calculation : 'additional_points_for_points_calculation',
    cron_bulk_import                         : 'cron_bulk_import',
    notification_mail_all_users              : 'notification_mail_all_users',
  },

  TRAINING_VIDEO_TYPE: {
    training_type_upload : 'Upload Video',
    training_type_link   : 'Add Link',
  },
  GRADE_STATUS: {
    active   : 'Active',
    inactive : 'Inactive',
  },
  CRON_JOB_CODE: {
    bulk_import: 'BULK_IMPORT',
  },
  ROLE_PERMISSION: {
    View_System_Management        : 'View_System_Management',
    Job_types_Management          : 'Job_types_Management',
    Location_Management           : 'Location_Management',
    Level_Management              : 'Level_Management',
    Task_Type_Management          : 'Task_Type_Management',
    Certificate_Type_Management   : 'Certificate_Type_Management',
    Note_Type_Management          : 'Note_Type_Management',
    Training_Management           : 'Training_Management',
    Training_Category_Management  : 'Training_Category_Management',
    Interaction_Factor_Management : 'Interaction_Factor_Management',
    VIEW_EMPLOYEE_PROFILE         : 'View_Employee_Profile',
    View_All_Roles                : 'View_All_Roles',
    Add_Role                      : 'Add_Role',
    Edit_Role                     : 'Edit_Role',
    Inactivate_Role               : 'Inactivate_Role',
    Dynamic_Questions_Management  : 'Dynamic_Questions_Management',
    VIEW_SKILL                    : 'View_Skill',
  },
  PORTAL_ACCESS_STATUS: {
    admin    : 'admin_portal',
    customer : 'customer_portal',
  },
  ANSWER_FORMAT: {
    text            : 'text',
    multiple_choice : 'multiple_choice'
  },
  FEEDBACK_QUESTION: {
    Manager  : 'Manager',
    Location : 'Location',
  },
  QUESTION_STATUS: {
    active   : 'Active',
    inactive : 'Inactive'
  },
  FEEDBACK_CATEGORY: {
    manager  : 'Manager',
    location : 'Location'
  }
};


