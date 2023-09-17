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
   *  TaskController Policy                                                  *
   ***************************************************************************/
  TaskController: {
    // '*'        : true,
    'add'                    : ['isLoggedIn', 'permission'],
    'findById'               : ['isLoggedIn', 'permission'],
    'findTaskImage'          : ['isLoggedIn', 'permission'],
    'findWithFilter'         : ['isLoggedIn'],
    'edit'                   : ['isLoggedIn', 'permission'],
    'getAssigneeByCreatorId' : ['isLoggedIn'],
    'findAssignee'           : ['isLoggedIn'],
    'taskExportToCSV'        : ['isLoggedIn', 'permission'],
    'deleteTask'             : ['isLoggedIn', 'permission'],
    'deleteTaskForAssignee'  : ['isLoggedIn', 'permission'],
    'updateTaskStatus'       : ['isLoggedIn', 'permission'],
    'findTaskAssignee'       : ['isLoggedIn'],
    'getPendingTaskCount'    : ['isLoggedIn'],
    'deleteMultipleTask'     : ['isLoggedIn'],
    'addMultiSkillTask'      : ['isLoggedIn'],
    'uploadTaskImages'       : ['isLoggedIn', 'permission']
  }
};
