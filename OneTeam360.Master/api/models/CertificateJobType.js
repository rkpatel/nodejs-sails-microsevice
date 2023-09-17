/***************************************************************************

  Model          : CertificateJobType
  Database Table : certificate_job_type

***************************************************************************/

module.exports = {
  tableName  : 'certificate_job_type',
  primaryKey : 'certificate_job_type_id',
  attributes : {
    certificate_job_type_id : { type: 'number', autoIncrement: true },
    certificate_type_id     : { type: 'number' },
    job_type_id             : { model: 'JobType'},
    status                  : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by              : { type: 'number' },
    created_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false }
  },
};



