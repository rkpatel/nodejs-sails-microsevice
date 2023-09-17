/***************************************************************************

  Model          : ReportSubmissionDetailOption
  Database Table : report_submission_detail_option

***************************************************************************/

module.exports = {
  tableName  : 'report_submission_detail_option',
  primaryKey : 'report_submission_detail_option_id',
  attributes : {
    report_submission_detail_option_id : { type: 'number', autoIncrement: true },
    report_submission_detail_id        : { type: 'number' },
    report_question_id                 : { type: 'number' },
    report_question_option_id          : { type: 'number' }
  }
};



