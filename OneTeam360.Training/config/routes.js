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
  'POST /trainingreport'              : 'TrainingReportController.find',
  'POST /trainingsonprofile'          : 'TrainingReportController.findLazyLoading',
  'POST /trainingreportlist'          : 'TrainingReportController.findWithPagination',
  'GET /trainingreport'               : 'TrainingReportController.findByEmployeeId',
  'POST /training-report-list/export' : 'TrainingReportController.exportTrainingReportList',
  'POST /addscenario'                 : 'ScenarioController.add',
  'PUT /editscenario/:id'             : 'ScenarioController.edit',
  'POST /get-scenariobyname'          : 'ScenarioController.findByName',
  'POST /get-scenarios'               : 'ScenarioController.findScenarios',
  'GET /get-scenario/:id'             : 'ScenarioController.findById',
  'POST /training-employee'           : 'TrainingEmployeeController.add',
  'PUT /training-employee/:id'        : 'TrainingEmployeeController.delete',
  'POST /training-employee/re-test'   : 'TrainingEmployeeController.reTestTraining',
  'GET /training-employee/:id'        : 'TrainingEmployeeController.findById',
  'POST /addgroupactivity'            : 'GroupActivityController.add',
  'POST /group-activity'              : 'GroupActivityController.find',
  'PUT /group-activity/:id'           : 'GroupActivityController.delete',
  'GET /group-activity/:id'           : 'GroupActivityController.findById',

  'POST /skillquiz/add-question'           : 'SkillQuizController.add',
  'GET /skillquiz/get-quiz/:id'            : 'SkillQuizController.findListById',
  'POST /skillquiz/get-quiz'               : 'SkillQuizController.findListByTrainingEmployeeId',
  'GET /skillquiz/get-question/:id'        : 'SkillQuizController.findById',
  'PUT /skillquiz/edit-question/:id'       : 'SkillQuizController.edit',
  'DELETE /skillquiz/delete-question/:id'  : 'SkillQuizController.delete',
  'POST /skillquiz/submit-question'        : 'SkillQuizController.submitQuestion',
  'GET /skillquiz-question-option-min-max' : 'SkillQuizController.optionminmax',
  'POST /sequence'                         : 'SkillQuizController.sequence',

  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'GET /swagger.json' : 'CommonController.swagger',
  'GET /health-check' : 'CommonController.healthCheck'

};
