/***************************************************************************
  Model          			: Competition
  Database Table    : competition
***************************************************************************/

module.exports = {
  tableName  : 'competition',
  primaryKey : 'competition_id',
  attributes : {
    competition_id     : { type: 'number', autoIncrement: true },
	  name               : { type: 'string'},
    description        : { type: 'string'},
    start_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    end_date           : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    banner_image_url   : { type: 'string', allowNull: true },
    competition_status : { type: 'string', isIn: ['Not Started', 'Ongoing', 'Completed']},
    status             : { type: 'string', isIn: ['Inactive', 'Active']},
    created_by         : { type: 'number'},
    created_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by    : { type: 'number', allowNull: true },
    last_updated_date  : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
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

