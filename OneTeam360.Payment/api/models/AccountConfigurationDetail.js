/* eslint-disable camelcase */
/***************************************************************************

  Model          : AccountConfigurationDetail
  Database Table : account_configuration_detail

  *************************
  Column      :   type
  *************************

  name       :   string
  dbname      : string
  password    :   string
  user        :   string
  *************************

***************************************************************************/

module.exports = {
  tableName  : 'account_configuration_detail',
  primaryKey : 'account_configuration_detail_id',
  attributes : {
    account_configuration_detail_id : { type: 'number', autoIncrement: true },
    account_configuration_id        : { model: 'AccountConfiguration'},
    name                            : { type: 'string' },
    code                            : { type: 'string' },
    value                           : { type: 'string' },
    default_value                   : { type: 'string'},
    description                     : { type: 'string' },
    is_encrypted                    : { type: 'number' },
    is_editable                     : { type: 'number' },
    sequence                        : { type: 'number'},
    status                          : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by                      : { type: 'number' },
    created_date                    : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by                 : { type: 'number' },
    last_updated_date               : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },


  /**
    * beforeDestry : Database Table Waterline ORM query hook
    *
    * NOTE : This func. will execute before destroy on User table record. In order to
    *        to execure this function use fetch: true in User.Destroy() method
    *
    * beforeDestroy: function(destroyedRecord, proceed) {
    *   Company.destroy({ user: destroyedRecord.id }).exec(proceed);
    * },
    */

  /**
    * customToJson : Database Table Waterline ORM query hook
    *
    * NOTE : A function that allows you to customize the way a model's records are serialized to JSON.
    */
  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['password']);
  }
};

