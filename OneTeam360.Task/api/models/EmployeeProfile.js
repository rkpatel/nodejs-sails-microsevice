/***************************************************************************

  Model          : Employee_Profile
  Database Table : employee_profile

  *************************
  Column      :   type
  *************************

  employee_profile_id             :   number
  user_id          :   number
  status              :   enum
  points             :   number
  level_id     :   number
  created_by : number
  created_date : datetime
  last_updated_by : number
  last_updated_date :datetime

  *************************

***************************************************************************/

module.exports = {
  tableName  : 'employee_profile',
  primaryKey : 'employee_profile_id',
  attributes : {
    employee_profile_id : { type: 'number', autoIncrement: true },
    user_id             : { type: 'number' },
    role_id             : { type: 'number' },
    status              : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by          : { type: 'number' },
    last_updated_by     : { type: 'number' },
    last_updated_date   : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    created_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
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
  customToJSON: function () {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};
