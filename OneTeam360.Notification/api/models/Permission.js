/***************************************************************************

  Model          : Permission
  Database Table : permission

***************************************************************************/

module.exports = {
  tableName  : 'permission',
  primaryKey : 'permission_id',
  attributes : {
    permission_id        : { type: 'number', autoIncrement: true },
    permission_module_id : { model: 'PermissionModule'},
    parent_permission_id : { type: 'number' },
    name        	        : { type: 'string'},
    code      	          : { type: 'string'},
    description          : { type: 'string'},
    sequence             : { type: 'number' },
  },
};
