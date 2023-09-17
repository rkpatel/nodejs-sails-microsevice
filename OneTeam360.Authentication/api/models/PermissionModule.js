/***************************************************************************

  Model          : PermissionModule
  Database Table : permission_module

  **************************************************
  Column      :   type
  **************************************************
  permission_module_id        : number
  parent_permission_module_id : number
  name               	        : string
  description                 : string
  sequence                    : number
  **************************************************

***************************************************************************/

module.exports = {
  tableName  : 'permission_module',
  primaryKey : 'permission_module_id',
  attributes : {
    permission_module_id        : { type: 'number', autoIncrement: true },
    parent_permission_module_id : { type: 'number' },
    name               	        : { type: 'string'},
    description                 : { type: 'string'},
    sequence                    : { type: 'number' },
  },
};
