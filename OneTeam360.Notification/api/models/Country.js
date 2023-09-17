/***************************************************************************

  Model          : Country
  Database Table : country

***************************************************************************/

module.exports = {
  tableName  : 'country',
  primaryKey : 'country_id',
  attributes : {
    country_id        : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    country_code      : { type: 'string' },
    phone_code        : { type: 'string' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true }
  },
};

