/***************************************************************************

   Model          : EmployeenotificationPreference
   Database Table : employee_notification_preference

***************************************************************************/

module.exports = {
  tableName  : 'employee_notification_preference',
  primaryKey : 'employee_notification_preference_id',
  attributes : {
    employee_notification_preference_id : { type: 'number', autoIncrement: true },
    employee_profile_id                 : { type: 'number', required: true },
    is_web                              : { type: 'boolean', defaultsTo: false },
    is_email                            : { type: 'boolean', defaultsTo: false },
    is_mobile                           : { type: 'boolean', defaultsTo: false },
    is_sms                              : { type: 'boolean', defaultsTo: false },
    created_by                          : { type: 'number' },
    created_date                        : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by                     : { type: 'number' },
    last_updated_date                   : {
      type          : 'ref',
      columnType    : 'datetime',
      autoCreatedAt : true,
    },
  },
};



