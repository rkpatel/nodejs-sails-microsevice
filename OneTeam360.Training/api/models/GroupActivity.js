
module.exports = {
  tableName  : 'group_activity',
  primaryKey : 'group_activity_id',
  attributes : {
    group_activity_id : { type: 'number', autoIncrement: true },
    scenario          : { type: 'string'},
    day               : { type: 'string'},
    notes             : { type: 'string'},
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },

  customToJSON: function () {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};


