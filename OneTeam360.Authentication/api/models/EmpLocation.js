/***************************************************************************

  Model          : EmpLocation
  Database Table : employee_location

  *************************
  Column      :   type
  employee_location_id : int
  employee_profile_id   : int
  location_id   : int
  created_by : number
  created_date : datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'employee_location',
  primaryKey : 'employee_location_id',
  attributes : {
    employee_location_id : { type: 'number', autoIncrement: true },
    employee_profile_id  : { model: 'EmployeeProfile' },
    location_id          : { model: 'Locations' },
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
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
    return _.omit(this, ['created_by', 'created_date']);
  }
};

