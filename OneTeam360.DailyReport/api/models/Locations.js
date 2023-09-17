/***************************************************************************

  Model          : Location
  Database Table : Location

  *************************
  Column      :   type
    location_id : number
    parent_location_id : number,
    name         : string,
    description  : string,
    address : string,
    city : string,
    state :string,
    state_code : string,
    country_code : string,
    status    : string,
    created_by    : number,
    created_date : datetime,
    last_updated_by : number
    last_updated_date: datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'location',
  primaryKey : 'location_id',
  attributes : {
    location_id        : { type: 'number', autoIncrement: true },
    parent_location_id : {type: 'number'},
    name               : {type: 'string'},
    description        : {type: 'string'},
    address_1          : {type: 'string'},
    address_2          : {type: 'string'},
    city_id            : {type: 'number'},
    state_id           : {type: 'number'},
    country_id         : {type: 'number'},
    zip                : { type: 'string' },
    status             : { type: 'string', isIn: ['Inactive', 'Active']},
    created_by         : { type: 'number' },
    created_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by    : { type: 'number' },
    last_updated_date  : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
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

