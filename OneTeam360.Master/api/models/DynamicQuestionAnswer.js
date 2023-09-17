/***************************************************************************

  Model          : DynamicQuestionAnswer
  Database Table : employee_dynamic_question_answer

  *************************
  Column      :   type
  *************************
  employee_profile_id  :   number
  employee_question_id  :   number
  dynamic_question_option_id  :   number
  dynamic_question_id         :   number
  answer                :   string
  created_by                  :   number
  created_date                :   datetime
  updated_by             :   number
  updated_date           :   datetime
  *************************

***************************************************************************/

module.exports = {
  tableName  : 'employee_dynamic_question_answer',
  primaryKey : 'employee_question_id',
  attributes : {
    employee_question_id       : { type: 'number', autoIncrement: true },
    dynamic_question_id        : { type: 'number',required: true },
    dynamic_question_option_id : { type: 'number', allowNull: true },
    employee_profile_id        : { type: 'number', required: true},
    answer                     : { type: 'string', allowNull: true},
    created_by                 : { type: 'number',allowNull: true },
    created_date               : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    updated_by                 : { type: 'number' },
    updated_date               : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },

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
    return _.omit(this, [ 'created_by', 'updated_by', 'created_date', 'updated_date']);
  }
};



