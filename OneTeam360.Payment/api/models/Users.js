/***************************************************************************

  Model          : Users
  Database Table : user

***************************************************************************/

module.exports = {
  tableName  : 'user',
  primaryKey : 'user_id',
  attributes : {
    user_id                       : { type: 'number', autoIncrement: true },
    password                      : { type: 'string' },
    email                         : { type: 'string', required: true, isEmail: true, unique: true },
    first_name                    : { type: 'string', required: true },
    last_name                     : { type: 'string', required: true },
    phone                         : { type: 'string', required: true },
    date_of_birth                 : { type: 'ref', columnType: 'date' },
    emergency_contact_name        : { type: 'string' },
    emergency_contact_relation    : { type: 'string' },
    emergency_contact_number      : { type: 'string' },
    emergency_contact_address     : { type: 'string' },
    emergency_contact_zip         : { type: 'string' },
    profile_picture_url           : { type: 'string', allowNull: true },
    profile_picture_thumbnail_url : { type: 'string', allowNull: true },
    status                        : {
      type : 'string',
      isIn : ['Invited', 'Active','Inactive']
    },
    primary_user: {
      type      : 'string',
      isIn      : ['Yes', 'No'],
      allowNull : true
    },
    portal_access: {
      type : 'string',
      isIn : ['customer_portal', 'admin_portal']
    },
    reset_password_token : { type: 'string' },
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    aboard_date          : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by      : { type: 'number',allowNull: true },
    last_updated_date    : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
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
  customToJSON: function () {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['password', 'created_by', 'last_updated_by', 'created_date', 'last_updated_date']);
  }
};

