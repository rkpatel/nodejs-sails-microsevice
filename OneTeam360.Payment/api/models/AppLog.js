/* eslint-disable camelcase */
/***************************************************************************

  Model          : AppLog
  Database Table : AppLog

***************************************************************************/

module.exports = {
  tableName  : 'app_log',
  primaryKey : 'id',
  attributes : {
    id           : { type: 'number', autoIncrement: true },
    user_id      : { type: 'number' },
    account_id   : { type: 'number' },
    customer_id  : { type: 'string' },
    title        : { type: 'string' },
    request      : { type: 'string' },
    response     : { type: 'string' },
    status       : { type: 'string' },
    created_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true }
  },

};

