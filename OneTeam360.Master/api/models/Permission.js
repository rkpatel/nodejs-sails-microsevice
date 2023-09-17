

module.exports = {
  tableName  : 'permission',
  primaryKey : 'permission_id',
  attributes : {
    permission_id        : { type: 'number', autoIncrement: true },
    permission_module_id : { type: 'number'},
    parent_permission_id : { type: 'number'},
    name                 : { type: 'string' },
    code                 : { type: 'string' },
    description          : { type: 'string' },
    sequence             : { type: 'number'},
    status               : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    // last_updated_by      : { type: 'number' },
    // last_updated_date    : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  }
};

