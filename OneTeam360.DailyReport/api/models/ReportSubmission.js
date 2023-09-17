/***************************************************************************

  Model          : ReportSubmission
  Database Table : report_submission

***************************************************************************/

module.exports = {
  tableName  : 'report_submission',
  primaryKey : 'report_submission_id',
  attributes : {
    report_submission_id : { type: 'number', autoIncrement: true },
    report_id            : { type: 'number' },
    location_id          : { type: 'number' },
    employee_profile_id  : { type: 'number' },
    status               : { type: 'string', isIn: ['submitted', 'draft'] },
    reported_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: true }
  }
};



