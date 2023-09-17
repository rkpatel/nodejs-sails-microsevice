/***************************************************************************

  Model          : TaskType
  Database Table : task_type


***************************************************************************/

module.exports = {
  tableName  : 'task_type',
  primaryKey : 'task_type_id',
  attributes : {
    task_type_id : { type: 'number', autoIncrement: true },
    name         : { type: 'string'},
    description  : { type: 'string'},
    is_default   : { type: 'boolean' },
    status       : {
      type : 'string',
      isIn : ['Inactive', 'Active']
    },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },

  }
};


