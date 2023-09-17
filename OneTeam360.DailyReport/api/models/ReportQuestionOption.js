/***************************************************************************

  Model          : ReportQuestionOption
  Database Table : report_question_option

***************************************************************************/

module.exports = {
  tableName  : 'report_question_option',
  primaryKey : 'report_question_option_id',
  attributes : {
    report_question_option_id : { type: 'number', autoIncrement: true },
    report_question_id        : { model: 'ReportQuestion' },
    option_key                : { type: 'string' },
    option_value              : { type: 'string' },
    sequence                  : { type: 'number' },
    status                    : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by                : { type: 'number' },
    created_date              : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by           : { type: 'number' },
    last_updated_date         : { type: 'ref', columnType: 'datetime' },
  }
};
