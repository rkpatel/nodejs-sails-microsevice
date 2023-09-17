/***************************************************************************

  Model          : ReportQuestion
  Database Table : report_question

***************************************************************************/

module.exports = {
  tableName  : 'report_question',
  primaryKey : 'report_question_id',
  attributes : {
    report_question_id     : { type: 'number', autoIncrement: true },
    report_id              : { model: 'Report' },
    title                  : { type: 'string' },
    description            : { type: 'string' },
    question_id            : { model: 'Question' },
    question_type_id       : { model: 'QuestionType' },
    is_for_dynamic_entity  : { type: 'boolean', defaultsTo: false },
    entity                 : { type: 'string' },
    dynamic_remark         : { type: 'boolean', defaultsTo: false },
    dynamic_allow_multiple : { type: 'boolean', defaultsTo: false },
    status                 : { type: 'string', isIn: ['Inactive', 'Active'] },
    sequence               : { type: 'number' },
    is_required            : { type: 'boolean', defaultsTo: false },
    created_by             : { type: 'number' },
    created_date           : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by        : { type: 'number' },
    last_updated_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};
