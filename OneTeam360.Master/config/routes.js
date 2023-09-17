/***************************************************************************

  Route Mappings
  (sails.config.routes)

  Your routes tell Sails what to do each time it receives a request.

***************************************************************************/

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * All routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'GET /bulk-import'                   : 'CommonMasterController.trigger',
  'GET /refill-tenant-cache/:id'       : 'CountryStatesController.refreshSpecificTenantCacheData',
  'GET /refill-master-cache'           : 'CountryStatesController.refreshMasteCacheData',
  'GET /refill-cache'                  : 'CountryStatesController.refreshAllTenantData',
  'GET /country'                       : 'CountryStatesController.findCountry',
  'GET /state/:id'                     : 'CountryStatesController.findStateById',
  'GET /city/:id'                      : 'CountryStatesController.findCityByStateId',
  'GET /location'                      : 'CountryStatesController.findLocation',
  'GET /role'                          : 'CountryStatesController.findRole',
  'GET /skills'                        : 'CountryStatesController.findSkills',
  'GET /level'                         : 'CountryStatesController.findLevel',
  'GET /job-type'                      : 'CountryStatesController.findJobType',
  'GET /training-category'             : 'CommonMasterController.findTrainingCategory',
  'GET /departments'                   : 'CountryStatesController.findDepartments',
  'GET /notification-template'         : 'CountryStatesController.findNotificationTemplate',
  'GET /impact-multiplier'             : 'CountryStatesController.findImpactMultiplier',
  'GET /weighted-tier'                 : 'CountryStatesController.findWeightedTier',
  'GET /task-type'                     : 'CommonMasterController.findTaskType',
  'GET /interactionFactor'             : 'CommonMasterController.findInteractionFactor',
  'POST /tasktype'                     : 'TaskTypeController.add',
  'PUT /tasktype/:id'                  : 'TaskTypeController.edit',
  'GET /tasktype/'                     : 'TaskTypeController.find',
  'GET /tasktype/:id'                  : 'TaskTypeController.findById',
  'PUT /tasktype/activate/:id'         : 'TaskTypeController.activateTask',
  'POST /locations'                    : 'LocationController.add',
  'PUT /locations/:id'                 : 'LocationController.edit',
  'GET /locations'                     : 'LocationController.find',
  'GET /locations/:id'                 : 'LocationController.findById',
  'PUT /locations/activate/:id'        : 'LocationController.activateLocation',
  'POST /jobtype'                      : 'JobTypeController.add',
  'PUT /jobtype/:id'                   : 'JobTypeController.edit',
  'PUT /jobtypestatus/:id'             : 'JobTypeController.updateStatus',
  'GET /jobtype'                       : 'JobTypeController.find',
  'GET /jobtype/:id'                   : 'JobTypeController.findById',
  'POST /notetype'                     : 'NoteTypeController.add',
  'PUT /notetype/default/:id'          : 'NoteTypeController.markAsDefault',
  'PUT /notetype/:id'                  : 'NoteTypeController.edit',
  'PUT /notetype/activate/:id'         : 'NoteTypeController.activateNoteType',
  'GET /notetype'                      : 'NoteTypeController.find',
  'GET /notetype/:id'                  : 'NoteTypeController.findById',
  'GET /locations/parent-location/:id' : 'LocationController.getParentLocation',
  'POST /trainingcategory'             : 'TrainingCategoryController.add',
  'PUT /trainingcategory/:id'          : 'TrainingCategoryController.edit',
  'PUT /trainingcategorystatus/:id'    : 'TrainingCategoryController.updateStatus',
  'GET /trainingcategory'              : 'TrainingCategoryController.find',
  'GET /trainingcategory/:id'          : 'TrainingCategoryController.findById',
  'POST /training'                     : 'TrainingController.add',
  'PUT /training/:id'                  : 'TrainingController.edit',
  'PUT /trainingstatus/:id'            : 'TrainingController.updateStatus',
  'GET /training'                      : 'TrainingController.find',
  'GET /training/:id'                  : 'TrainingController.findById',
  'GET /master-training'               : 'CountryStatesController.findTraining',
  'POST /photo-reference'              : 'TrainingController.addPhotoReference',
  'POST /video-reference'              : 'TrainingController.addVideoReference',
  'GET /employee-training/:id'         : 'TrainingController.getEmployeeTraining',
  'GET /training-grouping'             : 'CommonMasterController.findTrainingGrouping',
  'GET /employeelist'                  : 'CommonMasterController.findEmployeeList',
  'GET /gradelist'                     : 'CommonMasterController.findGrades',
  'DELETE /training/:id'               : 'TrainingController.delete',
  'PUT /training/update-sequence'      : 'TrainingController.updateResourceSequence',
  'GET /jobtypesbyemployeeid/:id'      : 'CommonMasterController.findJobTypesByEmployeeId',
  'GET /trainingsbyjobtypeandcategory' : 'CommonMasterController.findTrainingsByJobTypeAndTrainingCategory',
  'POST /findTrainingsByJobTypes'      : 'CommonMasterController.findTrainingsByJobTypes',
  'GET /findQuestionType'              : 'CommonMasterController.findQuestionType',
  'PUT /roles/:id'                     : 'RoleController.updateStatus',
  'POST /roles'                        : 'RoleController.find',
  'GET /module-permission'             : 'RoleController.modulePermissionList',
  'POST /roles/add'                    : 'RoleController.add',
  'GET /roles/:id'                     : 'RoleController.findById',
  'PUT /roles/edit/:id'                : 'RoleController.edit',
  'GET /relation'                      : 'CommonMasterController.findRelation',
  'GET /jobtypesByLocation'            : 'JobTypeController.findJobtypesByLocation',
  'POST /commonLocations'              : 'LocationController.findCommonLocations',
  /***************************************************************************
  * Certificate Type Master routes                                                            *                                                                          *
  ***************************************************************************/

  'POST /certificatetype'       : 'CertificateTypeController.add',
  'PUT /certificatetype'        : 'CertificateTypeController.edit',
  'GET /certificatetype'        : 'CertificateTypeController.find',
  'GET /certificatetype/detail' : 'CertificateTypeController.findById',
  'PUT /certificatetypestatus'  : 'CertificateTypeController.updateStatus',

  /***************************************************************************
  * Interaction Fcator Master routes                                                            *                                                                          *
  ***************************************************************************/

  'POST /interaction-factor'             : 'InteractionFactorController.add',
  'PUT /interaction-factor/:id'          : 'InteractionFactorController.edit',
  'GET /interaction-factor'              : 'InteractionFactorController.find',
  'GET /interaction-factor/:id'          : 'InteractionFactorController.findById',
  'PUT /interaction-factor/activate/:id' : 'InteractionFactorController.updateStatus',
  'GET /interaction-factor/employee/:id' : 'InteractionFactorController.findFactorBasedOnJobType',

  /***************************************************************************
   * Level Maste routes                                                            *                                                                          *
   ***************************************************************************/
  'GET /levels/max-range'    : 'LevelController.findMaxRange',
  'POST /levels'             : 'LevelController.add',
  'PUT /levels/:id'          : 'LevelController.edit',
  'GET /levels'              : 'LevelController.find',
  'GET /levels/:id'          : 'LevelController.findById',
  'PUT /levels/activate/:id' : 'LevelController.updateStatus',

  /***************************************************************************
   * Dynamic Question routes                                                            *                                                                          *
   ***************************************************************************/
  'GET /dynamic-question-option-min-max'    : 'DynamicQuestionController.optionminmax',
  'POST /dynamic-question'                  : 'DynamicQuestionController.add',
  'POST /dynamic-question/list'             : 'DynamicQuestionController.find',
  'PUT /dynamic-question/update-status/:id' : 'DynamicQuestionController.updateStatus',
  'GET /dynamic-question/:id'               : 'DynamicQuestionController.findById',
  /***************************************************************************
   *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'GET /swagger.json' : 'CommonController.swagger',
  'POST /imageUpload' : 'CommonMasterController.imageUpload',
  'GET /health-check' : 'CommonController.healthCheck',

  /************************************************************************
   *
   * Dynamic Question routes
   *
   ************************************************************************/

  'GET /dynamicquestion/:id'                  : 'DynamicQuestionController.findById',
  'PUT /dynamicquestion/:id'                  : 'DynamicQuestionController.edit',
  'POST /dynamicquestion/sequence'            : 'DynamicQuestionController.sequence',
  'POST /dynamicquestion/answer'              : 'DynamicQuestionController.answer',
  'GET /dynamicquestion/getList'              : 'DynamicQuestionController.getList',
  'GET /dynamicquestion/submitted-answer/:id' : 'DynamicQuestionController.getSubmittedAnswer',

  /************************************************************************
  /************************************************************************
   *
   * Feedback Question routes
   *
   ************************************************************************/
  'POST /feedback-question/list': 'FeedbackQuestionController.getFeedback',

  'POST /feedback-question'                  : 'FeedbackQuestionController.add',
  'PUT /feedback-question/:id'               : 'FeedbackQuestionController.edit',
  'PUT /feedback-question/update-status/:id' : 'FeedbackQuestionController.updateStatus',
  'GET /feedback-question/:id'               : 'FeedbackQuestionController.findById',
  'POST /feedback-question/update-sequence'  : 'FeedbackQuestionController.updateSequence',
  'GET /feedback-scale/list'                 : 'FeedbackQuestionController.findScaleList',
};
