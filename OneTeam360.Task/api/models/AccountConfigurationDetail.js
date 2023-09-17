/***************************************************************************

  Model          : AccountConfigurationDetail
  Database Table : account_configuration_detail

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
  tableName  : 'account_configuration_detail',
  primaryKey : 'account_configuration_detail_id',
  attributes : {
    account_configuration_detail_id : { type: 'number', autoIncrement: true },
    account_configuration_id        : { model: 'AccountConfiguration' },
    name                            : { type: 'string' },
    code                            : { type: 'string' },
    value                           : { type: 'string' },
    default_value                   : { type: 'string' },
    description                     : { type: 'string' },
    is_encrypted                    : { type: 'number' },
    is_editable                     : { type: 'number' },
    sequence                        : { type: 'number' },
    last_updated_by                 : { type: 'number' },
    last_updated_date               : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  }
};

