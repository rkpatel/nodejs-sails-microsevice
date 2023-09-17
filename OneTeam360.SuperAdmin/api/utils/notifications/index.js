const createPassword = require('./Email/createPassword.js');
const resetPassword = require('./Email/resetPassword.js');
const createPasswordCustomer = require('./Email/createPasswordCustomer.js');
const paymentDeclinedCustomer = require('./Email/paymentDeclinedCustomer.js');
const paymentLinkCustomer = require('./Email/paymentLinkCustomer.js');
const notificationCustomer = require('./Email/notificationCustomer.js');
const notificationPaymentFailedReminder = require('./Email/notificationPaymentFailedReminder.js');

module.exports = {
  createPassword,
  resetPassword,
  createPasswordCustomer,
  paymentDeclinedCustomer,
  paymentLinkCustomer,
  notificationCustomer,
  notificationPaymentFailedReminder
};
