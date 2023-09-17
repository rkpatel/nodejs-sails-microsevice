/***************************************************************************

   Model          : TaskImage
  Database Table : task_image

  *************************
  Column      :   type
  *************************
  task_image_id               :   number
  task_id                     :   number
  image_url                   :   string
  image_thumbnail_url         :   string
  status                      :   enum
  created_by                  :   number
  created_date                :   datetime
  *************************

***************************************************************************/

module.exports = {
  tableName  : 'task_image',
  primaryKey : 'task_image_id',
  attributes : {
    task_image_id       : { type: 'number', autoIncrement: true },
    task_id             : { model: 'Task'},
    image_url           : { type: 'string'},
    image_thumbnail_url : { type: 'string'},
    status              : {
      type : 'string',
      isIn : ['Inactive', 'Active']
    },
    created_by   : { type: 'number' },
    created_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },

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
    return _.omit(this, [ 'created_by',  'created_date']);
  }
};



