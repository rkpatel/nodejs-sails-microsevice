/***************************************************************************

  Model          : AccountConfiguration
  Database Table : account_configuration

  **************************************************
  Column      :   type
  **************************************************

  account_configuration_id  :   number
  account_id                :   number
  name      :   string
  code      :   string
  status    :   string
  sequence  :   number
  **************************************************

***************************************************************************/

module.exports = {
  tableName  : 'account_configuration',
  primaryKey : 'account_configuration_id',
  attributes : {
    account_configuration_id : { type: 'number', autoIncrement: true },
    account_id               : { model: 'Account' },
    name                     : { type: 'string' },
    code                     : { type: 'string' },
    description              : { type: 'string' },
    sequence                 : { type: 'number' },
  }
};
