
module.exports = {
  tableName  : 'group_activity_employee',
  primaryKey : 'group_activity_employee_id',
  attributes : {
    group_activity_employee_id : { type: 'number', autoIncrement: true },
    employee_profile_id        : { type: 'number' },
    group_activity_id          : { type: 'number' },
    created_by                 : { type: 'number' },
    created_date               : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },

  customToJSON: function () {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};





