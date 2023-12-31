
module.exports = {
  SERVER_ERROR                          : 'something went wrong',
  DATABASE_QUERY_ERROR                  : 'Error in Databse query usage',
  DATABASE_CONNECTION_FAILURE           : 'Error in Connecting with Database',
  GET_RECORD                            : 'Record(s) fetched successfully',
  DATA_NOT_FOUND                        : 'No matching record found',
  PARAMETER_MISSING                     : 'Id parameter missing',
  INVALID_PARAMETER                     : 'Invalid parameter',
  GET_FAILURE                           : 'record get failed',
  DELETE_CACHE                          : 'cache deleted',
  AUTH_TOKEN_MISSING                    : 'authorization header is missing',
  INVALID_AUTH_TOKEN                    : 'invalid authorization header',
  INVALID_TOKEN                         : 'invalid token',
  SOMETHING_WENT_WRONG                  : 'something went wrong',
  SOMETHING_WENT_WRONG_UPDATE           : 'something went wrong',
  GET_DATA_FAILED                       : 'Not able to fetch Record. Something went wrong',
  DELETE_FAIL                           : 'Delete failed',
  SUBSCRIPTION_GET_SUCCESSFULL          : 'Subscription get successful',
  SUBSCRIPTION_PRICE_GET_SUCCESSFULL    : 'Price data get successful',
  COUPON_GET_SUCCESSFULL                : 'Coupon get successful',
  QUOTE_GET_SUCCESSFULL                 : 'Quote get successful',
  ADD_SUBSCRIPTION                      : 'Subscription added successfully.',
  UPDATE_SUBSCRIPTION                   : 'Subscription updated successfully.',
  SUBSCRIPTION_ADD_FAILURE              : 'Subscription add request failed',
  SUBSCRIPTION_EDIT_FAILURE             : 'Subscription edit request failed',
  STRIPE_UPDATE_SUBSCRIPTION            : 'Your subscription has been updated.',
  ADD_CERTIFICATE                       : 'Certificate added successfully.',
  ADD_CERTIFICATE_FAIL                  : 'Certificate add failed.',
  SUBSCRIPTION_CANCELLED_SUCCESSFULLY   : 'Subscription cancelled successfully.',
  SUBSCRIPTION_INACTIVATED_SUCCESSFULLY : 'Subscription Inactivated successfully.',
  ADD_PAYMENTMETHOD_SUCCESS             : 'Payment Method added successfully',
  ADD_PAYMENTMETHOD_FAILURE             : 'Payment Method added failed',
  UPDATE_PAYMENTMETHOD_SUCCESS          : 'Payment Method updated successfully.',
  UPDATE_PAYMENTMETHOD_FAILURE          : 'Payment Method update failed',
  SUCCESS_UPLOAD                        : 'Document Uploaded Successfully',
  ALLOWED_IMAGES                        : ['image/jpeg', 'image/png'],
  INVALID_FILE_TYPE                     : 'invalid file type, only png/jpeg files are allowed',
  FILE_SIZE_LIMIT_EXCEEDED              : 'maximum file size exceeded, max allowed size is STR_TO_BE_REPLACEMB',
  UPLOAD_FAILURE                        : 'Document Upload failed',
  CUSTOMER_ALREADY_EXISTS               : 'This email ID of primary user already exists. Please try with different email ID',
  COMPANY_ALREADY_EXISTS                : 'This email ID is already associated with another customer account. Please try with different email ID.',
  CUSTOMER_REGISTER_SUCCESS             : 'Customer registered successfully',
  CUSTOMER_REGISTER_FAILURE             : 'Customer registration request failed',
  CUSTOMER_INACTIVATED_SUCCESSFULLY     : 'Customer inactivated successfully.',
  VALIDATION_FAILED                     : 'Validation failed.',
  CUSTOMER_EDIT_FAILURE                 : 'Customer edit request failed',
  CUSTOMER_EDIT_SUCCESS                 : 'Customer details updated successfully',
  PAYMENT_LINK_SUCCESS                  : 'Payment link is sent successfully',
  CUSTOMER_USER_ALREADY_EXISTS          : 'This email ID is already associated with another customer account. Please try with different email ID.',
  CUSTOMER_ACTIVATED_SUCCESSFULLY       : 'Customer activated successfully',
  ADD_PAYMENTMETHOD_ATTACH_SUCCESS      : 'Card added successfully',
  ADD_PAYMENTMETHOD_ATTACH_FAILURE      : 'Card attach failed',
  ADD_PAYMENTMETHOD_DETACH_SUCCESS      : 'Card detach successfully',
  ADD_PAYMENTMETHOD_DETACH_FAILURE      : 'Card detach failed',
  UPDATE_ACCOUNT_CONFIG_DETAILS         : 'Account Configuration details updated successfully',
  COMPANY_EXISTS_ACTIVE                 : 'This company email ID is already associated with OneTeam360. Please contact your administrator',
  COMPANY_EXISTS_INACTIVE               : 'Your subscription is inactive, Please contact your administrator to activate it',
  COMPANY_EXISTS_CANCEL                 : 'Your subscription is cancelled, Please ask primary contact person to log in customer portal and update it',
  ROLE_PERMISSION_REQUIRED              : 'Valid Role and Permission Required',
  PAYMENT_LINK_USED                     : 'Payment has already been processed for this customer. Please contact administrator',
  ACCOUNT_INACTIVATE_LOGOUT             : 'You are no longer associated with OneTeam360 customer portal',
  PAYMENT_LINK_EXPIRED                  : 'Please proceed using the latest payment link received on your email',
  INVALID_EMPLOYEE                      : 'You no longer have access to your company\'s OneTeam360 workspace. Please contact your administrator if you believe this is a mistake',
  UPDATE_BILLING_DETAILS                : 'Billing details updated successfully.',
  INVOICE_IS_PAID                       : 'There is some problem in invocie.',
  PROBLEM_IN_TENANT_CREATE              : 'There is some problem in creation of tenant db.',
  USER_ALREADY_EXISTS                   : 'This email ID already exists. Please try with different email ID.',
  REGENERATE_KEY_SUCCESS                : 'Key regenerated successfully',
  REGENERATE_KEY_FAILURE                : 'Key regeneration failed',
  ADD_SUBSCRIPTION_FAILED               : 'Subscription add failed',
  SUBSCRIPTION_EXISTS                   : 'This subscription name already exists. Please try with different name.',
  ADD_SUBSCRIPTION_SUCCESS              : 'Subscription added successfully',
  UPDATE_SUBSCRIPTION_FAILED            : 'Subscription update failed',
  UPDATE_SUBSCRIPTION_SUCCESS           : 'Subscription updated successfully',
  HEALTH_OK                             : 'Health check passed',
  CREATE_PRODUCT_SUCCESS                : 'Product added successfully',
  CREATE_PRODUCT_FAILED                 : 'Product added failed',
  SUBSCRIPTION_PRODUCT_GET_SUCCESSFULL  : 'Subscription get successful',
  SUBSCRIPTION_PRODUCT_GET_FAILED       : 'Subscription added failed',
  ADD_POLICEY_SUCCESS                   : 'Policey added successfully',
  ADD_POLICEY_FAILED                    : 'Policey added failed',
  UPDATE_SUBSCRIPTION_INACTIVE_SUCCESS  : 'Subscription inactivated successfully.',
  UPDATE_SUBSCRIPTION_ACTIVE_SUCCESS    : 'Subscription activated successfully.',
  UPDATE_SUBSCRIPTION_STATUS_FAILED     : 'Subscription status updated failed',
  CANT_UPDATE_SUBSCRIPTION_STATUS       : 'Subscription status can`t updated because of subscription is alreday assigend with customer',
};
