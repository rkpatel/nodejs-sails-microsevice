/***************************************************************************

  Model          : QuestionType
  Database Table : question_type

***************************************************************************/

module.exports = {
  tableName  : 'question_type',
  primaryKey : 'question_type_id',
  attributes : {
    question_type_id : { type: 'number', autoIncrement: true },
    title            : { type: 'string' },
    description      : { type: 'string' },
    field_type       : { type: 'string' },
    status           : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by       : { type: 'number' },
    created_date     : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};
