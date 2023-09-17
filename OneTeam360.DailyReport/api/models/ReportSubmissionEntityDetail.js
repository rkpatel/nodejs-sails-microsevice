/***************************************************************************

  Model          : ReportSubmissionEntityDetail
  Database Table : report_submission_entity_detail

***************************************************************************/

module.exports = {
  tableName  : 'report_submission_entity_detail',
  primaryKey : 'report_submission_entity_detail_id',
  attributes : {
    report_submission_entity_detail_id : { type: 'number', autoIncrement: true },
    report_submission_detail_id        : { type: 'number' },
    report_question_id                 : { type: 'number' },
    entity                             : { type: 'string' },
    entity_id                          : { type: 'number' },
    remarks                            : { type: 'string' }
  }
};



