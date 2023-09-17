/***************************************************************************

  Model          : Question
  Database Table : question

***************************************************************************/

module.exports = {
  tableName  : 'question',
  primaryKey : 'question_id',
  attributes : {
    question_id            : { type: 'number', autoIncrement: true },
    title                  : { type: 'string' },
    description            : { type: 'string' },
    question_type_id       : { model: 'QuestionType' },
    is_for_dynamic_entity  : { type: 'boolean', defaultsTo: false },
    entity                 : { type: 'string' },
    dynamic_remark         : { type: 'boolean', defaultsTo: false },
    dynamic_allow_multiple : { type: 'boolean', defaultsTo: false },
    status                 : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by             : { type: 'number' },
    created_date           : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by        : { type: 'number' },
    last_updated_date      : { type: 'ref', columnType: 'datetime' },
  }
};
