/***************************************************************************

   Model          : Task
  Database Table : task

  *************************
  Column      :   type
  *************************
  task_id                     :   number
  task_type_id                :   number
  job_type_id                 :   number
  title                       :   string
  description                 :   string
  assigned_by                 :   number
  location_id                 :   number
  task_status                 :   enum
  is_private                  :   boolean
  is_group_task               :   boolean
  start_date                  :   datetime
  end_date                    :   datetime
  status                      :   enum
  created_by                  :   number
  created_date                :   datetime
  last_updated_by             :   number
  last_updated_date           :   datetime
  *************************

***************************************************************************/

module.exports = {
  tableName  : 'task',
  primaryKey : 'task_id',
  attributes : {
    task_id      : { type: 'number', autoIncrement: true },
    task_type_id : { model: 'TaskType'},
    job_type_id  : { model: 'JobType' },
    title        : { type: 'string'},
    description  : { type: 'string'},
    assigned_by  : { type: 'number' },
    location_id  : { model: 'Locations' },
    task_status  : {
      type : 'string',
      isIn : ['Overdue','Pending', 'Completed']
    },
    is_private           : { type: 'boolean' },
    is_group_task        : { type: 'boolean' },
    entity_type          : { type: 'string', allowNull: true },
    entity_id            : { type: 'number', columnType: 'double', allowNull: true },
    training_employee_id : { type: 'number', columnType: 'double', allowNull: true },
    start_date           : { type: 'ref', columnType: 'date' },
    end_date             : { type: 'ref', columnType: 'date' },
    status               : {
      type : 'string',
      isIn : ['Inactive', 'Active']
    },
    is_scheduled                     : { type: 'boolean' },
    scheduled_interval_in_days       : { type: 'number', columnType: 'double', allowNull: true },
    scheduled_task_end_date_interval : { type: 'number', columnType: 'double', allowNull: true },
    scheduled_end_date               : { type: 'ref', columnType: 'date' },
    created_by                       : { type: 'number' },
    created_date                     : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by                  : { type: 'number',allowNull: true },
    last_updated_date                : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },

  },

  /**
        * beforeDestry : Database Table Waterline ORM query hook
        *
        * NOTE : This func. will execute before destroy on User table record. In order to
        *        to execure this function use fetch: true in User.Destroy() method
        *
        * beforeDestroy: function(destroyedRecord, proceed) {
        *   Company.destroy({ user: destroyedRecord.id }).exec(proceed);
        * },
        */

  /**
        * customToJson : Database Table Waterline ORM query hook
        *
        * NOTE : A function that allows you to customize the way a model's records are serialized to JSON.
        */
  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, [ 'created_by', 'last_updated_by', 'last_updated_date']);
  }
};



