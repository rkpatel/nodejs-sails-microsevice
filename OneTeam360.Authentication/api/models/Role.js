/***************************************************************************

  Model          : Role
  Database Table : Role

  **************************************************
  Column      :   type
  **************************************************
  role_id  : number
  name : string
  description : string
  is_active : number
  is_admin_role : number
  created_by : number
  created_date: datetime
  updatedby : number
  updated_date: datetime
  **************************************************

***************************************************************************/

module.exports = {
  tableName  : 'role',
  primaryKey : 'role_id',
  attributes : {
    role_id           : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    description       : { type: 'string' },
    dashboard         : { type: 'string', isIn: ['Manager', 'Employee'] },
    is_active         : { type: 'boolean', defaultsTo: true },
    is_admin_role     : { type: 'boolean', defaultsTo: false },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};
