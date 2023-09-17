/***************************************************************************

  Model          : AccountSubscription
  Database Table : account_subscription

  **************************************************
  Column      :   type
  **************************************************

  name        :   string
  dbname      : string
  password    :   string
  user        :   string
  **************************************************

***************************************************************************/

module.exports = {
  tableName  : 'account_subscription',
  primaryKey : 'account_subscription_id',
  attributes : {
    account_subscription_id : { type: 'number', autoIncrement: true },
    account_id              : { model: 'Account'},
    expiry_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    subscription_status     : { type: 'string', isIn: ['Inactive', 'Active','Canceled'] },

  }
};


