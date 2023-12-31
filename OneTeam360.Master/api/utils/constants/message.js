
module.exports = {
  SERVER_ERROR                           : 'something went wrong',
  DATABASE_QUERY_ERROR                   : 'Error in Databse query usage',
  USER_ALREADY_EXISTS                    : 'User already exists',
  UPLOAD_BULK_IMPORT                     : 'File uploaded successfully. We will send you an email notification once the import completes',
  INVALID_LOCATIONS                      : 'Please enter valid Location.(The location name should be exactly same as configured in system management)',
  INVALID_JOBTYPES                       : 'Please enter valid Job Type.(The job type name should be exactly same as configured in system management)',
  INVALID_ROLES                          : 'Please enter valid Role.(The role name should be exactly same as configured in system management)',
  INVALID_COUNTRY                        : 'Please enter valid country of emergency contact',
  INVALID_STATE                          : 'Please enter valid state of emergency contact',
  INVALID_CITY                           : 'Please enter valid city of emergency contact',
  IMPORT_BULK_SUCCESS                    : 'Team member(s) imported successfully. User will be sent welcome emails shortly',
  IMPORT_BULK_ERROR                      : 'Team member(s) import failed',
  INVALID_DATE_BIRTH                     : 'Please enter valid Date Of Birth.(The date format should be same as configuration made by your organization)',
  INVALID_DATE_JOINING                   : 'Please enter valid Date of Joining.(The date format should be same as configuration made by your organization)',
  DATABASE_CONNECTION_FAILURE            : 'Error in Connecting with Database',
  GET_RECORD                             : 'Record(s) fetched successfully',
  DATA_NOT_FOUND                         : 'No matching record found',
  PARAMETER_MISSING                      : 'Id parameter missing',
  INVALID_PARAMETER                      : 'Invalid parameter',
  GET_FAILURE                            : 'record get failed',
  DELETE_CACHE                           : 'cache deleted',
  REFRESH_CACHE                          : 'Cache refreshed',
  ADMIN_ACCESS_REQUIRED                  : 'Valid access required',
  AUTH_TOKEN_MISSING                     : 'authorization header is missing',
  INVALID_AUTH_TOKEN                     : 'invalid authorization header',
  INVALID_API_TOKEN                      : 'invalid Api token',
  INVALID_TOKEN                          : 'invalid token',
  INVALID_FILE_TYPE_TASK                 : 'invalid file type, only png/jpeg files are allowed',
  INVALID_FILE_TYPE                      : 'invalid file type',
  FILE_SIZE_LIMIT_EXCEEDED               : 'maximum file size exceeded, max allowed size is STR_TO_BE_REPLACEMB',
  ADD_TASK_TYPE_SUCCESS                  : 'Task Type added successfully',
  ADD_TASK_TYPE_FAILURE                  : 'Task Type add failed',
  UPDATE_TASK_TYPE_SUCCESS               : 'Task Type updated successfully',
  UPDATE_TASK_TYPE_FAILURE               : 'Task Type update failed',
  TASK_TYPE_ALREADY_EXISTS               : 'This task type already exists. Please try with different name',
  TASK_TYPE_ACTIVATE_SUCEESS             : 'Task Type activated successfully',
  TASK_TYPE_INACTIVATE_SUCEESS           : 'Task Type inactivated successfully',
  TASK_TYPE_ACTIVATE_FAIL                : 'Task Type inactivated failed',
  LOCATION_ALREADY_EXISTS                : 'This location already exists. Please try with different name',
  ADD_LOCATION_SUCCESS                   : 'Location added successfully',
  ADD_LOCATION_FAILED                    : 'Location add failed',
  UPDATE_LOCATION_SUCCESS                : 'Location updated successfully',
  UPDATE_LOCATION_FAILURE                : 'Location update failed',
  LOCATION_ACTIVATED                     : 'Location activated successfully',
  LOCATION_INACTIVATED                   : 'Location inactivated successfully',
  LOCATION_ASSOCIATED_MSG                : 'The location cannot be inactivated as it is associated with (STR_TO_BE_REPLACE) number of team members',
  LOCATION_STATUS_UPDATE_FAIL            : 'Location status update failed',
  JOB_TYPE_ADDED_SUCCESS                 : 'Job Type added successfully',
  JOB_TYPE_ALREADY_EXISTS                : 'This job type already exists. Please try with different name',
  JOB_TYPE_ADD_FAIL                      : 'Job Type not added',
  JOB_TYPE_UPDATE_SUCCESS                : 'Job Type updated successfully',
  JOB_TYPE_UPDATE_FAIL                   : 'Job Type not updated',
  JOB_TYPE_ACTIVATED                     : 'Job Type activated successfully',
  JOB_TYPE_INACTIVATED                   : 'Job Type inactivated successfully',
  JOB_TYPE_STATUS_UPDATE_FAIL            : 'Job Type status not updated',
  JOB_TYPE_NOT_FOUND                     : 'Job Type not found',
  JOBT_TYPE_ASSOCIATED_MSG               : 'The job type cannot be inactivated as it is associated with (STR_TO_BE_REPLACE) number of team members',
  NOTE_TYPE_ALREADY_EXISTS               : 'This notes type already exists. Please try with different name',
  ADD_NOTE_TYPE_SUCCESS                  : 'Note Type added successfully',
  ADD_NOTE_TYPE_FAILURE                  : 'Note Type add failed',
  UPDATE_NOTE_TYPE_SUCCESS               : 'Note Type updated successfully',
  UPDATE_NOTE_TYPE_FAILURE               : 'Note Type update failed',
  DEFAULT_NOTE_TYPE_NOT_ACTIVATED        : 'Default note type cannot be inactivated',
  NOTE_TYPE_ACTIVATE_SUCEESS             : 'Note Type activated successfully',
  NOTE_TYPE_INACTIVATE_SUCEESS           : 'Note Type inactivated successfully',
  NOTE_TYPE_ACTIVATE_FAIL                : 'Note Type activate failed',
  MAX_FILE_UPLOAD_ERR_MSG                : 'You can upload maximum STR_TO_BE_REPLACE files at once',
  TRAINING_CATEGORY_ALREADY_EXISTS       : 'This skill category already exists. Please try with different name',
  TRAINING_CATEGORY_ADD_SUCCESS          : 'Skill Category added successfully',
  TRAINING_CATEGORY_ADD_FAIL             : 'Skill Category add failed',
  TRAINING_CATEGORY_UPDATE_SUCCESS       : 'Skill Category updated successfully',
  TRAINING_CATEGORY_UPDATE_FAIL          : 'Skill Category update failed',
  TRAINING_CATEGORY_ACTIVATE_SUCEESS     : 'Skill Category activated successfully',
  TRAINING_CATEGORY_INACTIVATE_SUCEESS   : 'Skill Category inactivated successfully',
  TRAINING_CATEGORY_ACTIVATE_FAIL        : 'Skill Category activate failed',
  TRAINING_CATEGORY_NOT_FOUND            : 'Skill Category not found',
  TRAINING_CATEGORY_ASSOCIATED_MSG       : 'The skill category cannot be inactivated as it is associated with STR_TO_BE_REPLACE trainings',
  TRAINING_CATEGORY_STATUS_UPDATE_FAIL   : 'Skill Category status not updated',
  TRAINING_ALREADY_EXISTS                : 'This skill already exists. Please try with different name',
  TRAINING_ADD_SUCCESS                   : 'Skill added successfully',
  TRAINING_ADD_FAIL                      : 'Skill add failed',
  TRAINING_UPDATE_SUCCESS                : 'Skill updated successfully',
  TRAINING_UPDATE_FAIL                   : 'Skill update failed',
  TRAINING_ACTIVATE_SUCEESS              : 'Skill activated successfully',
  TRAINING_INACTIVATE_SUCEESS            : 'Skill inactivated successfully',
  TRAINING_ACTIVATE_FAIL                 : 'Skill activate failed',
  TRAINING_NOT_FOUND                     : 'Skill not found',
  TRAINING_PHOTO_COUNT_EXCEED            : 'Only (STR_TO_BE_REPLACE) photos are allowed per skill',
  TRAINING_VIDEO_COUNT_EXCEED            : 'Only (STR_TO_BE_REPLACE) videos are allowed per skill',
  RESOURCE_DELETE_FAIL                   : 'Reference delete fail',
  PHOTO_DELETE_SUCCESS                   : 'Photo Reference deleted successfully',
  VIDEO_DELETE_SUCCESS                   : 'Video Reference deleted successfully',
  PHOTO_ADD_SUCCESS                      : 'Photo reference added successfully',
  VIDEO_ADD_SUCCESS                      : 'Video reference added successfully',
  VIDEO_UPDATE_SUCCESS                   : 'Video reference updated successfully',
  PHOTO_UPDATE_SUCCESS                   : 'Photo reference updated successfully',
  CERTIFICATE_TYPE_ADDED_SUCCESS         : 'Certificate Type added successfully',
  CERTIFICATE_TYPE_ALREADY_EXISTS        : 'This certificate type already exists. Please try with different name',
  CERTIFICATE_TYPE_ADD_FAIL              : 'Certificate Type not added',
  CERTIFICATE_TYPE_UPDATE_SUCCESS        : 'Certificate Type updated successfully',
  CERTIFICATE_TYPE_UPDATE_FAIL           : 'Certificate Type not updated',
  CERTIFICATE_TYPE_ACTIVATED             : 'Certificate Type activated successfully',
  CERTIFICATE_TYPE_INACTIVATED           : 'Certificate Type inactivated successfully',
  CERTIFICATE_TYPE_STATUS_UPDATE_FAIL    : 'Certificate Type status not updated',
  CERTIFICATE_TYPE_NOT_FOUND             : 'Certificate Type not found',
  CERTIFICATE_TYPE_ASSOCIATED_MSG        : 'The certificate type cannot be inactivated as it is associated with (STR_TO_BE_REPLACE) number of team members',
  INTERACTIONFACTOR_ADD_SUCCESS          : 'Interaction factor added successfully',
  INTERACTIONFACTOR_ALREADY_EXISTS       : 'This interaction factor already exists. Please try with different name',
  INTERACTIONFACTOR_ADD_FAIL             : 'Interaction factor added fail',
  INTERACTIONFACTOR_INACTIVATE_SUCEESS   : 'Interaction factor inactivated successfully',
  INTERACTIONFACTOR_ACTIVATE_SUCEESS     : 'Interaction factor activated successfully',
  INTERACTIONFACTOR_ACTIVATE_FAIL        : 'Interaction factor activa/inactivate fail',
  INTERACTIONFACTOR_UPDATE_FAIL          : 'Interaction factor update fail',
  INTERACTIONFACTOR_UPDATE_SUCCESS       : 'Interaction factor updated successfully',
  ADD_LEVEL_SUCCESS                      : 'Level added successfully',
  LEVEL_ALREADY_EXISTS                   : 'This level already exists. Please try with different name',
  ADD_LEVEL_FAILED                       : 'Level add fail',
  UPDATE_LEVEL_SUCCESS                   : 'Level updated successfully',
  UPDATE_LEVEL_FAILURE                   : 'Level update failed',
  LEVEL_ACTIVATED                        : 'Level activated successfully',
  LEVEL_INACTIVATED                      : 'Level inactivated successfully',
  LEVEL_STATUS_UPDATE_FAIL               : 'Level status not updated',
  LEVEL_POINTS_RANGE                     : 'You cannot enter same value in points range',
  ROLE_ACTIVATED                         : 'Role activated successfully',
  ROLE_INACTIVATED                       : 'Role inactivated successfully',
  ROLE_ASSOCIATED_MSG                    : 'The role cannot be inactivated as it is associated with (STR_TO_BE_REPLACE) team members',
  ROLE_NOT_FOUND                         : 'Role not found',
  ROLE_STATUS_UPDATE_FAIL                : 'Role update failed',
  ROLE_ALREADY_EXISTS                    : 'This Role already exists. Please try with different name',
  ADD_ROLE_SUCCESS                       : 'Role created successfully',
  UPDATE_ROLE_SUCCESS                    : 'Role updated successfully',
  UPDATE_ROLE_FAILED                     : 'Role update fail',
  CLONE_ROLE_SUCCESS                     : 'Role cloned successfully',
  ROLE_PERMISSION_REQUIRED               : 'Valid Role and Permission Required',
  ACCOUNT_INACTIVATE_LOGOUT              : 'You are no longer associated with OneTeam360 customer portal',
  INVALID_EMPLOYEE                       : 'You no longer have access to your company\'s OneTeam360 workspace. Please contact your administrator if you believe this is a mistake',
  EXCEED_EMPLOYEE                        : 'You cannot add more team members as you have exceeded your license limit. Please update it to add more team members.',
  TEAM_MEMBER_ID_EXISTS                  : 'This team member ID already exists. Please try with different ID.',
  ADD_OPTION_SUCCESS                     : 'This option is added successfully',
  DYNAMIC_QUESTION_ALREADY_EXISTS        : 'This question already exists. Please try with different name.',
  ADD_DYNAMIC_QUESTION_SUCCESS           : 'Question added successfully.',
  ADD_DYNAMIC_QUESTION_FAILURE           : 'Question created fail',
  DYNAMIC_QUESTION_INACTIVED             : 'Question inactivated successfully',
  DYNAMIC_QUESTION_ACTIVED               : 'Question activated successfully',
  DYNAMIC_QUESTION_FAIL                  : 'Question status change failed',
  DYNAMIC_QUESTION_ANSWER_ALREADY_EXISTS : 'This dynamic question answer already exists. Please try with different name',
  ADD_DYNAMIC_QUESTION_ANSWER_SUCCESS    : 'Dynamic Question Answer added successfully',
  ADD_DYNAMIC_QUESTION_ANSWER_FAILURE    : 'Dynamic Question Answer add failed',
  UPDATE_DYNAMIC_QUESTION_TYPE_SUCCESS   : 'Question updated successfully',
  UPDATE_DYNAMIC_QUESTION_TYPE_FAILURE   : 'Question update failed',
  LIST_FEEDBACK_QUESTION_FAILURE         : 'Feedback Question list failed',
  FEEDBACK_QUESTION_ALREADY_EXISTS       : 'This question already exists. Please try with different name',
  ADD_FEEDBACK_QUESTION_SUCCESS          : 'Feedback Question added successfully',
  ADD_FEEDBACK_QUESTION_FAILURE          : 'Feedback Question add failed',
  UPDATE_FEEDBACK_QUESTION_SUCCESS       : 'Question updated successfully',
  UPDATE_FEEDBACK_QUESTION_FAILURE       : 'Question update failed',
  FEEDBACK_QUESTION_ACTIVATED            : 'Question activated successfully',
  FEEDBACK_QUESTION_INACTIVATED          : 'Question inactivated successfully',
  FEEDBACK_QUESTION_STATUS_UPDATE_FAIL   : 'Question status update failed',
  UPDATE_SEQUENCE_SUCCESS                : 'Sequence updated successfully',
  UPDATE_SEQUENCE_FAILURE                : 'Sequence update failed',
  HEALTH_OK                              : 'Health check passed',
  UPLOAD_BULK_IMPORT_EXPOSE              : 'File uploaded successfully. We will send you an email notification on the email ID of primary user once the import completes.',
  UPLOAD_BULK_IMPORT_NOT_SELECTED        : 'Please select a file to upload',
  INVALID_FILE_TYPE_FOR_BULK_IMPORT      : 'Invalid file type, allowed file types: .xlsx, .xls'
};
