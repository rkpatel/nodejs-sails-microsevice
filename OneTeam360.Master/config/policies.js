/***************************************************************************

  Policy Mappings
  (sails.config.policies)

  Policies are simple functions which run **before** your actions.

  Note:
  Default policy for all controllers and actions, unless overridden.
  * (`true` allows public access)

***************************************************************************/

module.exports.policies = {

  /***************************************************************************
   *  CountryStatesController Policy                                                  *
   ***************************************************************************/
  CountryStatesController: {
    '*'                        : true,
    'findLocation'             : ['isLoggedIn'],
    'findRole'                 : ['isLoggedIn'],
    'findSkills'               : ['isLoggedIn'],
    'findJobType'              : ['isLoggedIn'],
    'findLevel'                : ['isLoggedIn'],
    'findNotificationTemplate' : ['isLoggedIn'],
    'findImpactMultiplier'     : ['isLoggedIn'],
    'findWeightedTier'         : ['isLoggedIn'],
    'findTraining'             : ['isLoggedIn'],
  },
  CommonMasterController: {
    '*'                                         : true,
    'imageUpload'                               : ['isLoggedIn'],
    'findTaskType'                              : ['isLoggedIn'],
    'findTrainingCategory'                      : ['isLoggedIn'],
    'findTrainingGrouping'                      : ['isLoggedIn'],
    'findEmployeeList'                          : ['isLoggedIn'],
    'findJobTypesByEmployeeId'                  : ['isLoggedIn'],
    'findTrainingsByJobTypeAndTrainingCategory' : ['isLoggedIn'],
    'findInteractionFactor'                     : ['isLoggedIn'],
    'findTrainingsByJobTypes'                   : ['isLoggedIn'],
    'findQuestionType'                          : ['isLoggedIn'],
    'findRelation'                              : ['isLoggedIn'],
  },
  RoleController: {
    '*'                    : true,
    'add'                  : ['isLoggedIn', 'permission'],
    'updateStatus'         : ['isLoggedIn', 'permission'],
    'find'                 : ['isLoggedIn', 'permission'],
    'edit'                 : ['isLoggedIn', 'permission'],
    'findById'             : ['isLoggedIn'],
    'modulePermissionList' : ['isLoggedIn'],
  },
  JobTypeController: {
    '*'                      : true,
    'add'                    : ['isLoggedIn', 'permission'],
    'edit'                   : ['isLoggedIn', 'permission'],
    'updateStatus'           : ['isLoggedIn', 'permission'],
    'find'                   : ['isLoggedIn', 'permission'],
    'findById'               : ['isLoggedIn', 'permission'],
    'findJobtypesByLocation' : ['isLoggedIn', 'permission'],
  },
  TaskTypeController: {
    '*'            : true,
    'add'          : ['isLoggedIn', 'permission'],
    'edit'         : ['isLoggedIn', 'permission'],
    'find'         : ['isLoggedIn', 'permission'],
    'findById'     : ['isLoggedIn', 'permission'],
    'activateTask' : ['isLoggedIn', 'permission'],
  },
  LocationController: {
    '*'                   : true,
    'add'                 : ['isLoggedIn', 'permission'],
    'edit'                : ['isLoggedIn', 'permission'],
    'find'                : ['isLoggedIn', 'permission'],
    'findById'            : ['isLoggedIn', 'permission'],
    'activateLocation'    : ['isLoggedIn', 'permission'],
    'getParentLocation'   : ['isLoggedIn'],
    'findCommonLocations' : ['isLoggedIn'],
  },
  NoteTypeController: {
    '*'                : true,
    'add'              : ['isLoggedIn', 'permission'],
    'markAsDefault'    : ['isLoggedIn', 'permission'],
    'edit'             : ['isLoggedIn', 'permission'],
    'find'             : ['isLoggedIn', 'permission'],
    'findById'         : ['isLoggedIn', 'permission'],
    'activateNoteType' : ['isLoggedIn', 'permission'],
  },
  TrainingCategoryController: {
    '*'            : true,
    'add'          : ['isLoggedIn', 'permission'],
    'edit'         : ['isLoggedIn', 'permission'],
    'find'         : ['isLoggedIn', 'permission'],
    'findById'     : ['isLoggedIn', 'permission'],
    'updateStatus' : ['isLoggedIn', 'permission'],
  },
  TrainingController: {
    '*'                      : true,
    'add'                    : ['isLoggedIn', 'permission'],
    'edit'                   : ['isLoggedIn', 'permission'],
    'find'                   : ['isLoggedIn', 'permission'],
    'findById'               : ['isLoggedIn', 'permission'],
    'updateStatus'           : ['isLoggedIn', 'permission'],
    'addPhotoReference'      : ['isLoggedIn', 'permission'],
    'addVideoReference'      : ['isLoggedIn', 'permission'],
    'getEmployeeTraining'    : ['isLoggedIn', 'permission'],
    'delete'                 : ['isLoggedIn', 'permission'],
    'updateResourceSequence' : ['isLoggedIn', 'permission'],
  },
  CertificateTypeController: {
    '*'            : true,
    'add'          : ['isLoggedIn', 'permission'],
    'edit'         : ['isLoggedIn', 'permission'],
    'find'         : ['isLoggedIn', 'permission'],
    'findById'     : ['isLoggedIn', 'permission'],
    'updateStatus' : ['isLoggedIn', 'permission'],
  },
  InteractionFactorController: {
    '*'                        : true,
    'add'                      : ['isLoggedIn', 'permission'],
    'edit'                     : ['isLoggedIn', 'permission'],
    'find'                     : ['isLoggedIn', 'permission'],
    'findById'                 : ['isLoggedIn', 'permission'],
    'updateStatus'             : ['isLoggedIn', 'permission'],
    'findFactorBasedOnJobType' : ['isLoggedIn', 'permission'],
  },
  LevelController: {
    '*'            : true,
    'add'          : ['isLoggedIn', 'permission'],
    'edit'         : ['isLoggedIn', 'permission'],
    'find'         : ['isLoggedIn', 'permission'],
    'findById'     : ['isLoggedIn', 'permission'],
    'updateStatus' : ['isLoggedIn', 'permission'],
    'findMaxRange' : ['isLoggedIn'],
  },

  DynamicQuestionController: {
    '*'                  : true,
    'add'                : ['isLoggedIn', 'permission'],
    'edit'               : ['isLoggedIn'],
    'find'               : ['isLoggedIn', 'permission'],
    'updateStatus'       : ['isLoggedIn', 'permission'],
    'findById'           : ['isLoggedIn', 'permission'],
    'sequence'           : ['isLoggedIn'],
    'answer'             : ['isLoggedIn'],
    'getList'            : ['isLoggedIn'],
    'optionminmax'       : ['isLoggedIn'],
    'getSubmittedAnswer' : ['isLoggedIn', 'permission'],
  },

  FeedbackQuestionController: {
    '*'              : true,
    'add'            : ['isLoggedIn', 'permission'],
    'edit'           : ['isLoggedIn', 'permission'],
    'updateStatus'   : ['isLoggedIn', 'permission'],
    'findById'       : ['isLoggedIn', 'permission'],
    'updateSequence' : ['isLoggedIn', 'permission'],
    'findScaleList'  : ['isLoggedIn'] ,
    'getFeedback'    : ['isLoggedIn', 'permission'],
  }
};
