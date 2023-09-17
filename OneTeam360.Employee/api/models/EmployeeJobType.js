/***************************************************************************

  Model          : EmpJobType
  Database Table : employee_job_type

  *************************
  Column      :   type
  employee_job_type_id : int
  employee_profile_id   : int
  job_type_id   : int
  created_by : number
  created_date : datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'employee_job_type',
  primaryKey : 'employee_job_type_id',
  attributes : {
    employee_job_type_id : { type: 'number', autoIncrement: true },
    employee_profile_id  : { model: 'EmployeeProfile' },
    job_type_id          : {
      model: 'JobType'
    },
    created_by   : { type: 'number' },
    created_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
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

};

