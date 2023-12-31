
module.exports = {
  SERVER_ERROR                        : 'something went wrong',
  DATABASE_QUERY_ERROR                : 'Error in Databse query usage',
  DATABASE_CONNECTION_FAILURE         : 'Error in Connecting with Database',
  GET_RECORD                          : 'Record(s) fetched successfully',
  DATA_NOT_FOUND                      : 'No matching record found',
  PARAMETER_MISSING                   : 'Id parameter missing',
  INVALID_PARAMETER                   : 'Invalid parameter',
  GET_FAILURE                         : 'record get failed',
  DELETE_CACHE                        : 'cache deleted',
  GET_COMPETITION                     : 'Competition list get successfully.',
  GET_DROPDOWN_COMPETITION            : 'Competition dropdown list get successfully.',
  ADD_SUCCESS                         : 'Competition created successfully.',
  ADD_FAILURE                         : 'Competition add failed',
  DATE_FAILURE                        : 'Competition end date cannot be less than start date.',
  UPDATE_SUCCESS                      : 'Competition updated successfully.',
  UPDATE_FAILURE                      : 'Competition update failed',
  DELETE_COMPETITION                  : 'Competition deleted successfully.',
  DELETE_COMPETITION_FAIL             : 'Competition deleted failed.',
  AUTH_TOKEN_MISSING                  : 'authorization header is missing',
  INVALID_AUTH_TOKEN                  : 'invalid authorization header',
  INVALID_TOKEN                       : 'invalid token',
  SOMETHING_WENT_WRONG                : 'something went wrong, competition not added',
  SOMETHING_WENT_WRONG_UPDATE         : 'something went wrong, competition not updated',
  GET_DATA_FAILED                     : 'Not able to fetch Record. Something went wrong',
  ADD_TRAINING_EMPLOYEE_SUCCESS       : 'Skill Assessment completed successfully.',
  ADD_TRAINING_EMPLOYEE_FAILURE       : 'Skill Assessment complete failed.',
  DELETE_TRAINING_EMPLOYEE_SUCCESS    : 'Skill Assessment deleted successfully.',
  DELETE_TRAINING_EMPLOYEE_FAILED     : 'Skill Assessment delete failed.',
  RETEST_TRAINING_EMPLOYEE_FAILURE    : 'Skill Assessment conducted failed.',
  RETEST_TRAINING_EMPLOYEE_SUCCESS    : 'Skill Assessment retested successfully.',
  DELETE_GROUP_ACTIVITY               : 'Group Activity deleted successfully.',
  DELETE_FAIL                         : 'Delete failed',
  ALLOWED_IMAGES                      : ['image/jpeg', 'image/png'],
  INVALID_FILE_TYPE                   : 'invalid file type, only png/jpeg files are allowed',
  FILE_SIZE_LIMIT_EXCEEDED            : 'maximum file size exceeded, max allowed size is STR_TO_BE_REPLACEMB',
  IMAGE_UPLOAD_FAILURE                : 'Image upload failed',
  COMPETITION_TYPE_ACTIVATED          : 'Competition activated successfully',
  COMPETITION_TYPE_INACTIVATED        : 'Competition inactivated successfully',
  COMPETITION_TYPE_NOT_FOUND          : 'Competition record not found',
  COMPETITION_TYPE_STATUS_UPDATE_FAIL : 'Competition status not updated',
  ROLE_PERMISSION_REQUIRED            : 'Valid Role and Permission Required',
  ACCOUNT_INACTIVATE_LOGOUT           : 'You are no longer associated with OneTeam360 customer portal',
  INVALID_EMPLOYEE                    : 'You no longer have access to your company\'s OneTeam360 workspace. Please contact your administrator if you believe this is a mistake',
  HEALTH_OK                           : 'Health check passed'
};
