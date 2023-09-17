/***************************************************************************

  Policy Mappings
  (sails.config.policies)

  Policies are simple functions which run **before** your actions.

  Note:
  Default policy for all controllers and actions, unless overridden.
  * (`true` allows public access)

  **************************************************
  Available Policies
  **************************************************

  isLoggedIn
  permission
  **************************************************

***************************************************************************/

module.exports.policies = {
  NotificationController: {
    'find'                   : ['isLoggedIn'],
    'findAll'                : ['isLoggedIn'],
    'delete'                 : ['isLoggedIn'],
    'multipleDelete'         : ['isLoggedIn'],
    'readMultiple'           : ['isLoggedIn'],
    'notificationCount'      : ['isLoggedIn'],
    'updateNotificationFlag' : ['isLoggedIn'],
  },
  AnnouncementController: {
    'list'          : ['isLoggedIn'],
    'add'           : ['isLoggedIn','permission'],
    'findById'      : ['isLoggedIn'],
    'update'        : ['isLoggedIn','permission'],
    'updateauto'    : ['isLoggedIn','permission'],
    'delete'        : ['isLoggedIn','permission'],
    'updateStatus'  : ['isLoggedIn'],
    'dashboardList' : ['isLoggedIn'],
    'dashboard'     : ['isLoggedIn']
  }
};
