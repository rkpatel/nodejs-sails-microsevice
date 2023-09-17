/***************************************************************************

  Policy Mappings
  (sails.config.policies)

  Policies are simple functions which run **before** your actions.

  Note:
  Default policy for all controllers and actions, unless overridden.
  * (`true` allows public access)

***************************************************************************/

module.exports.policies = {
  ReportController: {
    'add'                        : ['isLoggedIn', 'permission'],
    'find'                       : ['isLoggedIn', 'permission'],
    'CheckReportExist'           : ['isLoggedIn'],
    'findDailyReport'            : ['isLoggedIn'],
    'edit'                       : ['isLoggedIn', 'permission'],
    'activate'                   : ['isLoggedIn', 'permission'],
    'findById'                   : ['isLoggedIn'],
    'assignedReportList'         : ['isLoggedIn', 'permission'],
    'submitReport'               : ['isLoggedIn', 'permission'],
    'submittedReportHistoryList' : ['isLoggedIn', 'permission'],
    'findBySubmittedReportId'    : ['isLoggedIn', 'permission'],
    'deleteQuestion'             : ['isLoggedIn'],
    'dailyReportGroupingList'    : ['isLoggedIn'],
    'getReportQuestionById'      : ['isLoggedIn'],
    'updateReportQuestion'       : ['isLoggedIn'],
    'employeeList'               : ['isLoggedIn', 'permission'],
    'taskList'                   : ['isLoggedIn', 'permission'],
    'noteList'                   : ['isLoggedIn', 'permission'],
  },

  QuestionController: {
    'add'                 : ['isLoggedIn'],
    'edit'                : ['isLoggedIn'],
    'delete'              : ['isLoggedIn'],
    'predefinedQuestions' : ['isLoggedIn'],
    'findById'            : ['isLoggedIn'],
    'findByIds'           : ['isLoggedIn'],
  },
};
