/***************************************************************************

  Model          			: scenario_training_category
  Database Table      : scenario_training_category

  *************************
  Column      :   type
  scenario_training_category_id : number
  scenario_id : number
  training_category_id : number
  status : string
  created_by :number
  created_date : datetime
  last_updated_by : number
  last_updated_date: datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'scenario_training_category',
  primaryKey : 'scenario_training_category_id',
  attributes : {
    scenario_training_category_id : { type: 'number', autoIncrement: true },
    scenario_id                   : { type: 'number'},
    training_category_id         	: { type: 'number'},
    status                        : { type: 'string', isIn: ['Inactive', 'Active']},
    created_by                    : { type: 'number'},
    created_date                  : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by               : { type: 'number', allowNull: true },
    last_updated_date             : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
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
