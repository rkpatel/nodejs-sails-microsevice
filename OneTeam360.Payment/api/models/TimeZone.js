/***************************************************************************

  Model          : State
  Database Table : state

***************************************************************************/

module.exports = {
  tableName  : 'time_zone',
  primaryKey : 'time_zone_id',
  attributes : {
    time_zone_id : { type: 'number', autoIncrement: true },
    name         : { type: 'string' },
    display_name : { type: 'string' },
    status       : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by   : { type: 'number' },
    created_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true }
  },
};


