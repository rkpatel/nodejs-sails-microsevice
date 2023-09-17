/***************************************************************************
  Model          			: AccountSubscription
  Database Table    : account_subscription
***************************************************************************/

module.exports = {
  tableName  : 'account_subscription',
  primaryKey : 'account_subscription_id',
  attributes : {
    account_subscription_id  : { type: 'number', autoIncrement: true },
	  subscription_id          : { type: 'number'},
	  account_id               : { type: 'number'},
    stripe_customer_id       : { type: 'string', allowNull: true },
    stripe_subscription_id   : { type: 'string', allowNull: true },
    next_payment_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    payment_start_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    stripe_payment_intent_id : { type: 'string', allowNull: true },
    stripe_payment_method_id : { type: 'string', allowNull: true },
    stripe_latest_invoice_id : { type: 'string', allowNull: true },
    stripe_coupon_id         : { type: 'string', allowNull: true },
    seats                    : { type: 'number'},
    amount_total             : { type: 'number', columnType: 'double'},
    amount_subtotal          : { type: 'number', columnType: 'double'},
    billing_cycle            : { type: 'string', allowNull: true },
    currency                 : { type: 'string', allowNull: true },
    free_trial               : { type: 'string', allowNull: true },
    free_trial_days          : { type: 'number', allowNull: true },
    price_per_user           : { type: 'number', columnType: 'double',allowNull: true},
    payment_status           : { type: 'string'},
    expiry_date              : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    subscription_status      : { type: 'string' },
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    created_by               : { type: 'number'},
    last_updated_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by          : { type: 'number', allowNull: true },
    paymentlinktoken         : { type: 'string', allowNull: true },
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};

