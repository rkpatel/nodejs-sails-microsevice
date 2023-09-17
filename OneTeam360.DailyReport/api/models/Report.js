/***************************************************************************

  Model          : Report
  Database Table : report

***************************************************************************/

module.exports = {
  tableName  : 'report',
  primaryKey : 'report_id',
  attributes : {
    report_id         : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime' },
  }
};



