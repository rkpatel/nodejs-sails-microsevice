/***************************************************************************

  Policy Mappings
  (sails.config.policies)

  Policies are simple functions which run **before** your actions.

  Note:
  Default policy for all controllers and actions, unless overridden.
  * (`true` allows public access)

***************************************************************************/

module.exports.policies = {

  TrainingReportController: {
    '*'                        : true,
    'find'                     : ['isLoggedIn'],
    'findLazyLoading'          : ['isLoggedIn'],
    'findWithPagination'       : ['isLoggedIn'],
    'findByEmployeeId'         : ['isLoggedIn'],
    'exportTrainingReportList' : ['isLoggedIn']
  },
  /***************************************************************************
   *  ScenarioController Policy                                                  *
   ***************************************************************************/
  ScenarioController: {
    // '*'        : true,
    'add'           : ['isLoggedIn', 'permission'],
    'edit'          : ['isLoggedIn'],
    'findByName'    : ['isLoggedIn'],
    'findScenarios' : ['isLoggedIn'],
    'findById'      : ['isLoggedIn'],
  },
  TrainingEmployeeController: {
    // '*'           : true,
    'add'            : ['isLoggedIn', 'permission'],
    'delete'         : ['isLoggedIn', 'permission'],
    'reTestTraining' : ['isLoggedIn', 'permission'],
    'findById'       : ['isLoggedIn'],
  },
  GroupActivityController: {
    'add'      : ['isLoggedIn', 'permission'],
    'find'     : ['isLoggedIn', 'permission'],
    'delete'   : ['isLoggedIn', 'permission'],
    'findById' : ['isLoggedIn'],
  },
  SkillQuizController: {
    'add'                          : ['isLoggedIn', 'permission'],
    'delete'                       : ['isLoggedIn', 'permission'],
    'findListById'                 : ['isLoggedIn', 'permission'],
    'findListByTrainingEmployeeId' : ['isLoggedIn', 'permission'],
    'findById'                     : ['isLoggedIn', 'permission'],
    'edit'                         : ['isLoggedIn', 'permission'],
    'submitQuestion'               : ['isLoggedIn', 'permission'],
    'optionminmax'                 : ['isLoggedIn'],
    'sequence'                     : ['isLoggedIn'],
  }
};
