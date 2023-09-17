/***************************************************************************

  Model          : PermissionModule
  Database Table : permission_module

***************************************************************************/

module.exports = {
  tableName  : 'permission_module',
  primaryKey : 'permission_module_id',
  attributes : {
    permission_module_id        : { type: 'number', autoIncrement: true },
    parent_permission_module_id : { type: 'number' },
    name               	        : { type: 'string'},
    description                 : { type: 'string'},
    code             	          : { type: 'string'},
    sequence                    : { type: 'number' },
  },
};
