/***************************************************************************

  Model          : RolePermision
  Database Table : rolepermission

  *****************************
  Column      :   type
  role_permission_id : number
  role_id            : { model: 'Role' },
  permission_id      : { model: 'Permission'},
  created_by          : number
  created_date       : datetime
  *****************************

***************************************************************************/

module.exports = {
  tableName  : 'role_permission',
  primaryKey : 'role_permission_id',
  attributes : {
    role_permission_id : { type: 'number', autoIncrement: true },
    role_id            : { model: 'Role' },
    permission_id      : { model: 'Permission' },
    created_by         : { type: 'number' },
    created_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },

  },
};
