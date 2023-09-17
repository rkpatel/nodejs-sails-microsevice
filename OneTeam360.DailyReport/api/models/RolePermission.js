

module.exports = {
  tableName  : 'role_permission',
  primaryKey : 'role_permission_id',
  attributes : {
    role_permission_id : { type: 'number', autoIncrement: true },
    role_id            : { model: 'role'},
    permission_id      : { model: 'permission' },
    status             : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by         : { type: 'number' },
    created_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by    : { type: 'number',allowNull: true },
    last_updated_date  : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  }
};


