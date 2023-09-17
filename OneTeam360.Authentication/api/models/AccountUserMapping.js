/***************************************************************************

  Model          : AccountUser
  Database Table : account_user

  **************************************************
  Column      :   type
  **************************************************

  account_user_id  :   number
  account_id   :   number
  user_id      :   number
  account_owner      :   number
  last_updated_by    :   number
  last_updated_date  :   datetime
  **************************************************

***************************************************************************/

module.exports = {
  tableName  : 'account_user',
  primaryKey : 'account_user_id',
  attributes : {
    account_user_id   : { type: 'number', autoIncrement: true },
    account_id        : { model: 'Account' },
    user_id           : { model: 'Users' },
    account_owner     : { type: 'number' },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};
