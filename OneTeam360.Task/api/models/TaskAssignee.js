/***************************************************************************

   Model          : TaskAssignee
  Database Table : task_assignee

  *************************
  Column      :   type
  *************************
  task_assignee_id            :   number
  task_id                     :   number
  assigned_to                 :   number
  task_status                 :   enum
  status                      :   enum
  created_by                  :   number
  created_date                :   datetime
  last_updated_by             :   number
  last_updated_date           :   datetime
  *************************

***************************************************************************/

module.exports = {
  tableName  : 'task_assignee',
  primaryKey : 'task_assignee_id',
  attributes : {
    task_assignee_id : { type: 'number', autoIncrement: true },
    task_id          : { model: 'Task'},
    assigned_to      : { model: 'EmployeeProfile'},
    task_status      : {
      type : 'string',
      isIn : ['Overdue','Pending', 'Completed']
    },
    status: {
      type : 'string',
      isIn : ['Inactive', 'Active']
    },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime',  autoCreatedAt: false  },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },

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
    return _.omit(this, [ 'created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};



