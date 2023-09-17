
module.exports = {
  tableName  : 'weighted_tier',
  primaryKey : 'weighted_tier_id',
  attributes : {
    weighted_tier_id  : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    description       : { type: 'string' },
    score             : {type: 'number' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false }
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};




