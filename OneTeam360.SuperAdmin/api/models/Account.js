/***************************************************************************

  Model          : Account
  Database Table : account

***************************************************************************/

module.exports = {
  tableName  : 'account',
  primaryKey : 'account_id',
  attributes : {
    account_id        : { type: 'number', autoIncrement: true },
    account_guid      : { type: 'string' },
    name              : { type: 'string' },
    email             : { type: 'string' },
    phone             : { type: 'string' },
    address           : { type: 'string' },
    onboard_status    : { type: 'string', isIn: ['Completed'] },
    status            : { type: 'string', isIn: ['Inactive', 'Active','Cancelled', 'Payment Pending', 'Payment Declined', 'Cancel Requested'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime'},
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};


