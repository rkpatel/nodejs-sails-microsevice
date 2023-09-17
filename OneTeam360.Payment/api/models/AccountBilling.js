/***************************************************************************
  Model          			: AccountBilling
  Database Table    : account_billing
***************************************************************************/

module.exports = {
  tableName  : 'account_billing',
  primaryKey : 'account_billig_id',
  attributes : {
    account_billig_id       : { type: 'number', autoIncrement: true },
	  account_id              : { type: 'number'},
    account_subscription_id : { type: 'number'},
    address                 : { type: 'string', allowNull: true},
    country_id              : { type: 'number', allowNull: true},
    state_id                : { type: 'number', allowNull: true},
    city_id                 : { type: 'number', allowNull: true},
    zip                     : { type: 'string', allowNull: true},
    created_by              : { type: 'number'},
    created_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by         : { type: 'number', allowNull: true},
    last_updated_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: false }
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};

