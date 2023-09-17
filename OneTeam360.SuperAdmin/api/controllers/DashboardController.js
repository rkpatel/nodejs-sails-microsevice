const messages = sails.config.globals.messages;
const { RESPONSE_STATUS, ACCOUNT_STATUS } = require('../utils/constants/enums'); const moment = require('moment');

module.exports = {
  dashboardCardsDetails: async(_req, res) =>{
    try{
      //active customers
      const activeCustomerSql = await sails.sendNativeQuery(`Select count(distinct account_id) as active_customers from account where status = '${ACCOUNT_STATUS.active}'`);
      const resultActiveCustomer = activeCustomerSql.rows;

      //customers added in last 60 days
      const customerSql = await sails.sendNativeQuery(`Select count(distinct account_id) as last_customers 
      from account where DATE(created_date) >= (DATE(NOW()) - INTERVAL 60 DAY)`);
      const resultCustomer = customerSql.rows;

      //active users
      const activeUserSql = await sails.sendNativeQuery(`Select count(distinct user_id) as active_users from user where status = '${ACCOUNT_STATUS.active}'`);
      const resultActiveUser = activeUserSql.rows;

      //subscription due in next month
      const startOfMonth = moment().clone().add(1, 'M').startOf('month').format('YYYY-MM-DD');
      const endOfMonth   = moment().clone().add(1, 'M').endOf('month').format('YYYY-MM-DD');
      const subDueSql = await sails.sendNativeQuery(`Select count(distinct account_subscription_id) as subscription_due_next from account_subscription
      where date(next_payment_date) BETWEEN '${startOfMonth}' AND '${endOfMonth}'`);
      const resultSubDue = subDueSql.rows;

      //subscription expired in current month
      const startOfCurrentMonth = moment().clone().startOf('month').format('YYYY-MM-DD');
      const endOfCurrentMonth   = moment().clone().endOf('day').format('YYYY-MM-DD');
      const subExpiredSql = await sails.sendNativeQuery(`Select count(distinct account_subscription_id) as subscription_expired from account_subscription 
       where date(expiry_date) BETWEEN '${startOfCurrentMonth}' AND '${endOfCurrentMonth}'`);
      const resultSubExpired = subExpiredSql.rows;

      return res.ok({
        active_customer       : resultActiveCustomer[0].active_customers,
        customer_days         : resultCustomer[0].last_customers,
        active_users          : resultActiveUser[0].active_users,
        subscription_due_next : resultSubDue[0].subscription_due_next,
        subscription_expired  : resultSubExpired[0].subscription_expired
      }, messages.GET_RECORD, RESPONSE_STATUS.success);
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  }
};

