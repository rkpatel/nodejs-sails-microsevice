/***************************************************************************

  Policy Mappings
  (sails.config.policies)

  Policies are simple functions which run **before** your actions.

  Note:
  Default policy for all controllers and actions, unless overridden.
  * (`true` allows public access)

***************************************************************************/

module.exports.policies = {
  CustomerController: {
    'add'                  : ['isLoggedIn'],
    'edit'                 : ['isLoggedIn'],
    'getAccountDetails'    : ['isLoggedIn', 'permission'],
    'updateAccountDetails' : ['isLoggedIn', 'permission'],
  },
  SubscriptionController: {
    'add'                      : ['isLoggedIn'],
    'addinstripe'              : ['isLoggedIn'],
    'list'                     : ['isLoggedIn'],
    'findbycustomer'           : ['isLoggedIn'],
    'find'                     : ['isLoggedIn'],
    'findinstripe'             : ['isLoggedIn'],
    'update'                   : ['isLoggedIn'],
    'updateinstripe'           : ['isLoggedIn'],
    'cancel'                   : ['isLoggedIn'],
    'inactive'                 : ['isLoggedIn'],
    'active'                   : ['isLoggedIn'],
    'paymentintentinstripe'    : ['isLoggedIn'],
    'findcustomersubscription' : ['isLoggedIn']
  },
  CouponController: {
    'list': ['isLoggedIn'],
  },
  QuoteController: {
    'find'           : ['isLoggedIn'],
    'findbycustomer' : ['isLoggedIn'],
  },
  PaymentMethodController: {
    'add'                 : ['isLoggedIn'],
    'edit'                : ['isLoggedIn'],
    'findById'            : ['isLoggedIn'],
    'attachPaymentMethod' : ['isLoggedIn'],
    'detachPaymentMethod' : ['isLoggedIn'],
  },
  AzureAPIController: {
    'createUpdateProduct'      : ['isLoggedIn'],
    'getSubscriptionByProduct' : ['isLoggedIn'],
    'findSecretKeyList'        : ['isLoggedIn'],
    'regenerateSecretKey'      : ['isLoggedIn'],
    'addApiInProduct'          : ['isLoggedIn'],
    'addPolicyInProduct'       : ['isLoggedIn']
  },
  SubscriptionMasterController: {
    'add'              : ['isLoggedIn'],
    'edit'             : ['isLoggedIn'],
    'findById'         : ['isLoggedIn'],
    'list'             : ['isLoggedIn'],
    'listProducts'     : ['isLoggedIn'],
    'listSubscription' : ['isLoggedIn'],
    'updatestatus'     : ['isLoggedIn'],
  }
};
