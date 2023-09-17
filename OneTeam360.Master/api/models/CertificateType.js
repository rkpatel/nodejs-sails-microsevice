/***************************************************************************

  Model          : certificateType
  Database Table : certificate_type

***************************************************************************/

module.exports = {
  tableName  : 'certificate_type',
  primaryKey : 'certificate_type_id',
  attributes : {
    certificate_type_id : { type: 'number', autoIncrement: true },
    name                : { type: 'string'},
    description         : {type: 'string'},
    status              : { type: 'string', isIn: ['Inactive', 'Active'] },
    auto_assign         : { type: 'boolean', defaultsTo: false },
    created_by          : { type: 'number' },
    created_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by     : { type: 'number' },
    last_updated_date   : { type: 'ref', columnType: 'datetime', autoCreatedAt: false }
  },
};



