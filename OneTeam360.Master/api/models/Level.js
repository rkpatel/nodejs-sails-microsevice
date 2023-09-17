/***************************************************************************

  Model          : level
  Database Table : level

  *************************
  Column      :   type
  level_id : string
  level : number
  name : string
  description : string
  point_range_from : number
  point_range_to : number
  status : string
  created_by :number
  created_date : datetime
  last_updated_by : number
  last_updated_date: datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'level',
  primaryKey : 'level_id',
  attributes : {
    level_id          : { type: 'number', autoIncrement: true },
    description       : { type: 'string' },
    level             : { type: 'number' },
    point_range_from  : { type: 'number' },
    point_range_to    : { type: 'number' },
    range             : { type: 'number' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    name              : { type: 'string' },
    last_updated_by   : { type: 'number', allowNull: true },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false }
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

