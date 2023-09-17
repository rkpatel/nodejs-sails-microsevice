/***************************************************************************
  Model          			: AccountUpdateSubscription
  Database Table    : account_update_subscription
***************************************************************************/

module.exports = {
  tableName  : 'account_update_subscription',
  primaryKey : 'account_update_subscription_id',
  attributes : {
    account_update_subscription_id : { type: 'number', autoIncrement: true },
    account_subscription_id        : { type: 'number'},
    subscription_id                : { type: 'number'},
    stripe_subscription_id         : { type: 'string', allowNull: true },
    seats                          : { type: 'number'},
    next_payment_date              : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    payment_start_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    stripe_product_name            : { type: 'string'},
    stripe_product_id              : { type: 'string'},
    stripe_price_id                : { type: 'string'},
    stripe_latest_invoice_id       : { type: 'string', allowNull: true },
    stripe_sid                     : { type: 'string', allowNull: true },
    amount_due                     : { type: 'number', columnType: 'double'},
    stripe_coupon_id               : { type: 'string', allowNull: true },
    amount_total                   : { type: 'number', columnType: 'double'},
    amount_subtotal                : { type: 'number', columnType: 'double'},
    billing_cycle                  : { type: 'string', allowNull: true },
    currency                       : { type: 'string', allowNull: true },
    created_date                   : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    created_by                     : { type: 'number'},
    last_updated_date              : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by                : { type: 'number', allowNull: true },
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};

