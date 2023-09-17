/***************************************************************************

  Model          : EmpCertificateHistory
  Database Table : employee_certificate_history

***************************************************************************/

module.exports = {
  tableName  : 'employee_certificate_history',
  primaryKey : 'employee_certificate_history_id',
  attributes : {
    employee_certificate_history_id : { type: 'number', autoIncrement: true },
    employee_certificate_id         : { model: 'EmpCertification' },
    employee_profile_id             : { model: 'EmployeeProfile' },
    description                     : { type: 'string' },
    issue_date                      : { type: 'ref', columnType: 'date' },
    expiry_date                     : { type: 'ref', columnType: 'date' },
    certificate_file_path           : { type: 'string' },
    certificate_status              : { type: 'string', isIn: ['Assigned', 'InReview', 'Active','Expired', 'Rejected'] },
    status                          : { type: 'string', isIn: ['Inactive', 'Active'] },
    task_id                         : { type: 'number' },
    end_date                        : { type: 'ref', columnType: 'date' },
    added_by                        : { type: 'number' },
    approved_by                     : { type: 'number' },
    created_by                      : { type: 'number' },
    created_date                    : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },
};


