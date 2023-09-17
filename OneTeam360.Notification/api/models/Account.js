/***************************************************************************

  Model          : Account
  Database Table : account

  **************************************************
  Column      :   type
  **************************************************

  account_id       :   number
  name             :   string
  address          :   string
  onboard_status   :   enum
  status           :   enum
  created_by          :   number
  created_date        :   datetime
  last_updated_by     :   number
  last_updated_date   :   datetime
  **************************************************

***************************************************************************/


module.exports = {
  table      : 'account',
  primaryKey : 'account_id',
  attributes : {
    account_id        : { type: 'number', autoIncrement: true },
    name              : { type: 'string', required: true },
    email             : { type: 'string', required: true },
    address           : { type: 'string', required: true },
    onboard_status    : { type: 'string', isIn: ['Completed'] },
    status            : { type: 'string', isIn: ['Inactive', 'Active','Cancelled', 'Payment Pending', 'Payment Declined', 'Cancel Requested'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};
