/***************************************************************************

  Model          : ReportSubmissionDetail
  Database Table : report_submission_detail

***************************************************************************/

module.exports = {
  tableName  : 'report_submission_detail',
  primaryKey : 'report_submission_detail_id',
  attributes : {
    report_submission_detail_id : { type: 'number', autoIncrement: true },
    report_submission_id        : { type: 'number' },
    report_id                   : { type: 'number' },
    report_question_id          : { type: 'number' },
    answer                      : { type: 'string' },
    notes                       : { type: 'string', allowNull: true }
  }
};



