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
    '*'                   : true,
    // 'login'          : ['MultiTenantPolicy'],
    // 'selectTenant'   : ['isLoggedIn'],
    'changePassword'      : ['isLoggedIn'],
    'resetPassword'       : ['isLoggedIn'],
    'createPassword'      : ['isLoggedIn'],
    'profileDetails'      : ['isLoggedIn'],
    'SignInToAdmin'       : ['isLoggedIn'],
    'SignInToEmployee'    : ['isLoggedIn'],
    'SignInToPrimaryUser' : ['isLoggedIn']
  },
  CommonController: {
    'verifyToken'  : ['isLoggedIn'],
    'refreshToken' : ['isLoggedIn']
  },
  LogController: {
    '*': true,
  }
};
