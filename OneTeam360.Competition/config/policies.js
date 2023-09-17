/***************************************************************************

  Policy Mappings
  (sails.config.policies)

  Policies are simple functions which run **before** your actions.

  Note:
  Default policy for all controllers and actions, unless overridden.
  * (`true` allows public access)

***************************************************************************/

module.exports.policies = {
  CompetitionController: {
    // '*'        : true,
    'add'                     : ['isLoggedIn', 'permission'],
    'competitionHistoryList'  : ['isLoggedIn', 'permission'],
    'historyCards'            : ['isLoggedIn'],
    'competitionDropDownList' : ['isLoggedIn'],
    'findById'                : ['isLoggedIn'],
    'update'                  : ['isLoggedIn', 'permission'],
    'delete'                  : ['isLoggedIn', 'permission'],
    'dashboard'               : ['isLoggedIn'],
    'dashboardCards'          : ['isLoggedIn']

  }
};
