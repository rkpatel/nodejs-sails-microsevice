
module.exports = {
  tableName  : 'employee_interaction',
  primaryKey : 'employee_interaction_id',
  attributes : {
    employee_interaction_id : { type: 'number', autoIncrement: true },
    employee_profile_id     : { type: 'number' },
    points                  : { type: 'number', columnType: 'double' },
    notes                   : { type: 'string' },
    created_by              : { type: 'number' },
    created_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false }
  },

  customToJSON: function() {
    return _.omit(this, ['created_by',  'created_date']);
  }
};





