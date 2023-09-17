/***************************************************************************

  Model          : State
  Database Table : state

***************************************************************************/

module.exports = {
  tableName  : 'state',
  primaryKey : 'state_id',
  attributes : {
    state_id          : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    state_code        : { type: 'string' },
    country_id        : { model: 'Country' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true }
  },
};

