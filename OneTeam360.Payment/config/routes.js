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

  /******** Customer ***********/
  'POST /customer/add'                 : 'CustomerController.add',
  'PUT /customer/edit/:id'             : 'CustomerController.edit',
  'POST /customer/imageUpload'         : 'CustomerController.imageUpload',
  'GET /customer/find/:id'             : 'CustomerController.find',
  'POST /customer/public/registration' : 'CustomerController.add',
  'PUT /customer/public/edit/:id'      : 'CustomerController.edit',
  'GET /account-detail/:id'            : 'CustomerController.getAccountDetails',
  'GET /time-zone'                     : 'CustomerController.getTimeZone',
  'POST /update-account/:id'           : 'CustomerController.updateAccountDetails',

  /******** Subscription ***********/
  'POST /subscription/add'                                : 'SubscriptionController.add',
  'POST /subscription/addinstripe'                        : 'SubscriptionController.addinstripe',
  'GET /subscription/list'                                : 'SubscriptionController.list',
  'GET /subscription/public/graduatedprice/:price_id'     : 'SubscriptionController.graduatedprice',
  'POST /subscription/find'                               : 'SubscriptionController.find',
  'GET /subscription/findinstripe/:id'                    : 'SubscriptionController.findinstripe',
  'POST /subscription/update'                             : 'SubscriptionController.update',
  'POST /subscription/updateinstripe'                     : 'SubscriptionController.updateinstripe',
  'GET /subscription/findbycustomer'                      : 'SubscriptionController.findbycustomer',
  'DELETE /subscription/:id'                              : 'SubscriptionController.cancel',
  'PUT  /subscription/inactive/:id'                       : 'SubscriptionController.inactive',
  'PUT /subscription/active/:id'                          : 'SubscriptionController.active',
  'POST /subscription/paymentintentinstripe'              : 'SubscriptionController.paymentintentinstripe',
  'POST /subscription/public/paymentintentinstripe'       : 'SubscriptionController.paymentintentinstripe',
  'POST /subscription/sendpaymentlink'                    : 'SubscriptionController.sendPaymentLink',
  'GET /subscription/paymentstatus/:id'                   : 'SubscriptionController.paymentstatus',
  'GET /subscription/findcustomersubscription/:id'        : 'SubscriptionController.findcustomersubscription',
  'GET /subscription/public/findcustomersubscription/:id' : 'SubscriptionController.findcustomersubscription',
  'POST /subscription/updateactivestatus'                 : 'SubscriptionController.updateactivestatus',
  'POST /subscription/updatebillingdetails'               : 'SubscriptionController.updatebillingdetails',

  'POST /subscription/public/updateactivestatus'   : 'SubscriptionController.updateactivestatus',
  'POST /subscription/public/add'                  : 'SubscriptionController.add',
  'POST /subscription/public/addinstripe'          : 'SubscriptionController.addinstripe',
  'POST /subscription/public/update'               : 'SubscriptionController.update',
  'POST /subscription/public/updateinstripe'       : 'SubscriptionController.updateinstripe',
  'POST /subscription/public/updatebillingdetails' : 'SubscriptionController.updatebillingdetails',
  'GET /subscription/public/list'                  : 'SubscriptionController.list',
  'POST /subscription/public/find'                 : 'SubscriptionController.find',
  'GET /subscription/public/freetrialdays'         : 'SubscriptionController.freetrialdays',
  /******** Coupon ***********/
  'GET /coupon/list'                               : 'CouponController.list',
  'GET /coupon/public/list'                        : 'CouponController.list',

  /******** Quote ***********/
  'POST /quotes/findbycustomer'        : 'QuoteController.findbycustomer',
  'POST /quotes/public/findbycustomer' : 'QuoteController.findbycustomer',

  /******** PaymentMethod ***********/
  'POST /paymentmethod/add'              : 'PaymentMethodController.add',
  'PUT /paymentmethod/edit'              : 'PaymentMethodController.edit',
  'GET /paymentmethod/:id'               : 'PaymentMethodController.findById',
  'POST /declined-payment'               : 'PaymentMethodController.declinedPayment',
  'POST /paymentmethod/public/add'       : 'PaymentMethodController.add',
  'POST /paymentmethod/attach'           : 'PaymentMethodController.attachPaymentMethod',
  'PUT /paymentmethod/detach/:id'        : 'PaymentMethodController.detachPaymentMethod',
  'POST /paymentmethod/public/attach'    : 'PaymentMethodController.attachPaymentMethod',
  'PUT /paymentmethod/public/detach/:id' : 'PaymentMethodController.detachPaymentMethod',

  /******** AzureAPI ***********/
  'POST /azure-create-update-product'              : 'AzureAPIController.createUpdateProduct',
  'POST /azure-get-subscription-by-product'        : 'AzureAPIController.getSubscriptionByProduct',
  'POST /azure-secret-key-list'                    : 'AzureAPIController.findSecretKeyList',
  'PUT /azure-regenerate-secret-key'               : 'AzureAPIController.regenerateSecretKey',
  'POST /azure-add-api-in-product'                 : 'AzureAPIController.addApiInProduct',
  'POST /azure-add-policy-in-product'              : 'AzureAPIController.addPolicyInProduct',
  'POST /public/azure-create-update-product'       : 'AzureAPIController.createUpdateProduct',
  'POST /public/azure-get-subscription-by-product' : 'AzureAPIController.getSubscriptionByProduct',
  'POST /public/azure-secret-key-list'             : 'AzureAPIController.findSecretKeyList',
  'PUT /public/azure-regenerate-secret-key'        : 'AzureAPIController.regenerateSecretKey',
  'POST /public/azure-add-api-in-product'          : 'AzureAPIController.addApiInProduct',
  'POST /public/azure-add-policy-in-product'       : 'AzureAPIController.addPolicyInProduct',

  /******SubscriptionMaster*******************/
  'POST /subscriptionmaster/list'                   : 'SubscriptionMasterController.list',
  'GET /subscriptionmaster/listproducts'            : 'SubscriptionMasterController.listProducts',
  'GET /subscriptionmaster/listsubscription'        : 'SubscriptionMasterController.listSubscription',
  'GET /subscriptionmaster/public/listsubscription' : 'SubscriptionMasterController.listSubscription',
  'POST /subscriptionmaster/add'                    : 'SubscriptionMasterController.add',
  'PUT /subscriptionmaster/:id'                     : 'SubscriptionMasterController.edit',
  'GET /subscriptionmaster/:id'                     : 'SubscriptionMasterController.findById',
  'POST /subscriptionmaster/updatestatus'           : 'SubscriptionMasterController.updatestatus',
  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'GET /health-check'                               : 'CommonController.healthCheck',
};
