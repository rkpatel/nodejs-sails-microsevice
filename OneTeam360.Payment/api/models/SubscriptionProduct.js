/***************************************************************************
  Model          			: SubscriptionProduct
  Database Table    : subscription_product
***************************************************************************/

module.exports = {
  tableName  : 'subscription_product',
  primaryKey : 'subscription_product_id',
  attributes : {
    subscription_product_id : { type: 'number', autoIncrement: true },
	  subscription_id         : { type: 'number'},
    stripe_product_id       : { type: 'string'},
    stripe_product_name     : { type: 'string'},
    stripe_price_id         : { type: 'string'},
    api_enabled             : { type: 'string', isIn: ['Yes', 'No'] },
    api_quota               : { type: 'number'},
    interval                : { type: 'string', isIn: ['Monthly', 'Yearly', 'Daily'] },
    created_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    created_by              : { type: 'number'},
    updated_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'created_date', 'updated_date']);
  }
};

