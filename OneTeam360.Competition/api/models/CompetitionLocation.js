/***************************************************************************
  Model          			: CompetitionEmployee
  Database Table      : competition_location
***************************************************************************/

module.exports = {
  tableName  : 'competition_location',
  primaryKey : 'competition_location_id',
  attributes : {
    competition_location_id : { type: 'number', autoIncrement: true },
	  competition_id          : { type: 'number'},
	  location_id            	: { type: 'number'},
    created_by              : { type: 'number'},
    created_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
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
