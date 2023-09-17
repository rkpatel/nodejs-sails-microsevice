/***************************************************************************

  Model          			: scenario
  Database Table    : scenario

  *************************
  Column      :   type
  scenario_id : number
  scenario : string
  day : string
  name : string
  created_by :number
  created_date : datetime
  last_updated_by : number
  last_updated_date: datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'scenario',
  primaryKey : 'scenario_id',
  attributes : {
    scenario_id       : { type: 'number', autoIncrement: true },
    day               : { type: 'string', allowNull: true},
	  name              : { type: 'string'},
    created_by        : { type: 'number'},
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by   : { type: 'number', allowNull: true },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
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
    return _.omit(this, ['created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};
