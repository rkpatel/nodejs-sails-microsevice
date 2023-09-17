/***************************************************************************
  Model          			: Subscription
  Database Table    : subscription
***************************************************************************/

module.exports = {
  tableName  : 'subscription',
  primaryKey : 'subscription_id',
  attributes : {
    subscription_id   : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    status            : { type: 'string', isIn: ['Active', 'Inactive'] },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    created_by        : { type: 'number'},
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by   : { type: 'number', allowNull: true }
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by','created_date']);
  }
};

