
/***************************************************************************

  Model          : City
  Database Table : city

***************************************************************************/

module.exports = {
  tableName  : 'city',
  primaryKey : 'city_id',
  attributes : {
    city_id           : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    state_id          : { type: 'number' },
    status            : { type: 'string' },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true }
  },
};

