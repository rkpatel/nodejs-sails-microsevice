/***************************************************************************

  Model          : EmpCertification
  Database Table : employee_certificate

***************************************************************************/

module.exports = {
  tableName  : 'employee_certificate',
  primaryKey : 'employee_certificate_id',
  attributes : {
    employee_certificate_id : { type: 'number', autoIncrement: true },
    certificate_type_id     : { model: 'CertificateType' },
    employee_profile_id     : {type: 'number' },
    name                    : { type: 'string' },
    description             : { type: 'string' },
    issue_date              : { type: 'ref', columnType: 'date' },
    expiry_date             : { type: 'ref', columnType: 'date' },
    task_id                 : { type: 'number' },
    end_date                : { type: 'ref', columnType: 'date' },
    certificate_file_path   : { type: 'string' },
    certificate_status      : { type: 'string', isIn: ['Assigned', 'InReview', 'Active','Expired','Rejected'] },
    status                  : { type: 'string', isIn: ['Inactive', 'Active'] },
    added_by                : { type: 'number' },
    approved_by             : { type: 'number' },
    created_by              : { type: 'number' },
    created_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by         : { type: 'number' },
    last_updated_date       : { type: 'ref', columnType: 'datetime' },
  },
};


