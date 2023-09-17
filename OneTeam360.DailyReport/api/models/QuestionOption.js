/***************************************************************************

  Model          : QuestionOption
  Database Table : question_option

***************************************************************************/

module.exports = {
  tableName  : 'question_option',
  primaryKey : 'question_option_id',
  attributes : {
    question_option_id : { type: 'number', autoIncrement: true },
    question_id        : { model: 'Question' },
    option_key         : { type: 'string' },
    option_value       : { type: 'string' },
    status             : { type: 'string', isIn: ['Inactive', 'Active'] },
    sequence           : { type: 'number' },
    created_by         : { type: 'number' },
    created_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by    : { type: 'number' },
    last_updated_date  : { type: 'ref', columnType: 'datetime' },
  }
};
