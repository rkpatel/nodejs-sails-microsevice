/***************************************************************************

  Model          : Skill
  Database Table : Skill

  *************************
  Column      :   type
    job_type_id     : number,
    name         : string,
    description  : string,
    is_active    : boolean,
    createdby    : number,
    created_date : datetime,
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'job_type',
  primaryKey : 'job_type_id',
  attributes : {
    job_type_id       : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    description       : { type: 'string' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    jobType           : {
      collection : 'EmployeeProfile',
      via        : 'job_type_id',
      through    : 'EmpJobType'
    },
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
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};


