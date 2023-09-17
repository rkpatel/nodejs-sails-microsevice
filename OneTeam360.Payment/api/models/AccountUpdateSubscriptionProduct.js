/***************************************************************************
  Model          			: AccountUpdateSubscriptionProduct
  Database Table    : account_update_subscription_product
***************************************************************************/

module.exports = {
  tableName  : 'account_update_subscription_product',
  primaryKey : 'account_update_subscription_product_id',
  attributes : {
    account_update_subscription_product_id : { type: 'number', autoIncrement: true },
	  account_subscription_id                : { type: 'number'},
	  subscription_product_id                : { type: 'number'},
    seats                                  : { type: 'number'},
    stripe_sid                             : { type: 'string', allowNull: true },
    created_date                           : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    created_by                             : { type: 'number'},
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'created_date']);
  }
};

