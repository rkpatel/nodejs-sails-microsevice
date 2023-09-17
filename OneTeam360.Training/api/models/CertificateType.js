/***************************************************************************

  Model          : certificateType
  Database Table : certificate_type

***************************************************************************/

module.exports = {
  tableName  : 'certificate_type',
  primaryKey : 'certificate_type_id',
  attributes : {
    certificate_type_id : { type: 'number', autoIncrement: true },
    job_type_id         : { model: 'JobType'},
    name                : { type: 'string'},
    description         : {type: 'string'},
    status              : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by          : { type: 'number' },
    created_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    certificate         : { collection : 'EmployeeProfile',
      via        : 'certificate_type_id',
      through    : 'EmpCertification'
    },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },
};



