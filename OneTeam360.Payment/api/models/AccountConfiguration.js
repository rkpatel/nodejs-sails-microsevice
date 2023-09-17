/* eslint-disable camelcase */
/***************************************************************************

  Model          : AccountConfiguration
  Database Table : account_configuration

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
  tableName  : 'account_configuration',
  primaryKey : 'account_configuration_id',
  attributes : {
    account_configuration_id : { type: 'number', autoIncrement: true },
    account_id               : { model: 'Account'},
    name                     : { type: 'string' },
    code                     : { type: 'string' },
    description              : { type: 'string'},
    sequence                 : { type: 'number'},
    status                   : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by               : { type: 'number' },
    last_updated_by          : { type: 'number' },
    last_updated_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
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

