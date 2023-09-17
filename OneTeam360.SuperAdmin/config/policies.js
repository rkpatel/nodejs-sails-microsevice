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
  administrator
  **************************************************

***************************************************************************/

module.exports.policies = {

  /***************************************************************************
   *  UserController Policy                                                  *
   ***************************************************************************/
  UserController: {
    '*'              : true,
    'changePassword' : ['isLoggedIn'],
    'resetPassword'  : ['isLoggedIn'],
    'impersonate'    : ['isLoggedIn'],
    'createPassword' : ['isLoggedIn'],
    'add'            : ['isLoggedIn'],
    'edit'           : ['isLoggedIn'],
    'findById'       : ['isLoggedIn'],
    'find'           : ['isLoggedIn'],
    'delete'         : ['isLoggedIn'],
    'activate'       : ['isLoggedIn'],
    'profileDetails' : ['isLoggedIn'],
  },
  LogController: {
    '*': true,
  }
};
