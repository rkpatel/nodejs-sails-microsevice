/***************************************************************************

  Model          : TrainingEmployee
  Database Table : training_employee

***************************************************************************/

module.exports = {
  tableName  : 'training_employee',
  primaryKey : 'training_employee_id',
  attributes : {
    training_employee_id : { type: 'number', autoIncrement: true },
    training_id          : { type: 'number' },
    employee_profile_id  : { type: 'number' },
    job_type_id          : { type: 'number', allowNull: true  },
    grade_id             : { type: 'number', allowNull: true },
    notes                : { type: 'string' },
    group_activity_id    : { type: 'number', allowNull: true  },
    is_retest            : { type: 'boolean', defaultsTo: false },
    status               : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by      : { type: 'number', allowNull: true },
    last_updated_date    : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
  },

};


