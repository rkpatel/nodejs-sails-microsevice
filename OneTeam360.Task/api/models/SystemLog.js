/* eslint-disable camelcase */
/***************************************************************************

  Model          : Account
  Database Table : Account

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
  tableName  : 'system_log',
  primaryKey : 'system_log_id',
  attributes : {
    system_log_id : { type: 'number', autoIncrement: true },
    user_id       : { type: 'number' },
    account_id    : { type: 'number' },
    url           : { type: 'string', required: true },
    ip_address    : { type: 'string', required: true },
    error_code    : { type: 'string', required: true },
    error_message : { type: 'string' },
    datetime      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    stack_trace   : { type: 'string' },
    useragent     : { type: 'string' },
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
};

