/***************************************************************************

  Model          : EmpDynamicQuestionAnswer
  Database Table : employee_dynamic_question_answer

  *************************
  Column      :   type
  employee_question_id : int
  dynamic_question_id   : int
  employee_profile_id   : int
  answer   : string
  dynamic_question_option_id   : int
  created_by : number
  created_date : datetime
  updated_by : number
  updated_date : datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'employee_dynamic_question_answer',
  primaryKey : 'employee_question_id',
  attributes : {
    employee_question_id       : { type: 'number', autoIncrement: true },
    dynamic_question_id        : { type: 'number' },
    employee_profile_id        : { type: 'number' },
    answer                     : {type: 'string', allowNull: true},
    dynamic_question_option_id : { type: 'number', allowNull: true},
    created_by                 : { type: 'number', allowNull: true},
    created_date               : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    updated_by                 : { type: 'number' },
    updated_date               : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
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


