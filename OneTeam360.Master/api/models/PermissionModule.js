

module.exports = {
  tableName  : 'permission_module',
  primaryKey : 'permission_module_id',
  attributes : {
    permission_module_id        : { type: 'number', autoIncrement: true },
    parent_permission_module_id : { type: 'number'},
    name                        : { type: 'string' },
    code                        : { type: 'string' },
    description                 : { type: 'string' },
    sequence                    : { type: 'number'},
    status                      : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by                  : { type: 'number' },
    created_date                : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};


