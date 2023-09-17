/***************************************************************************

  Model          : Role
  Database Table : Role

***************************************************************************/

module.exports = {
  tableName  : 'role',
  primaryKey : 'role_id',
  attributes : {
    role_id           : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    description       : { type: 'string' },
    is_active         : { type: 'boolean', defaultsTo: true },
    is_admin_role     : { type: 'boolean', defaultsTo: false },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};
