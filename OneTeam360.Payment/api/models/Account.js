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
  primaryKey : 'account_id',
  attributes : {
    account_id                 : { type: 'number', autoIncrement: true },
    name                       : { type: 'string', required: true},
    account_guid               : { type: 'string'},
    address                    : { type: 'string'},
    onboard_status             : { type: 'string', isIn: ['Completed']  },
    status                     : { type: 'string', isIn: ['Inactive', 'Active','Cancelled', 'Payment Pending', 'Payment Declined', 'Cancel Requested'] },
    created_by                 : { type: 'number'},
    created_date               : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by            : { type: 'number' },
    last_updated_date          : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    email                      : { type: 'string', required: true, isEmail: true, unique: true },
    phone                      : { type: 'string' },
    city_id                    : { model: 'city' },
    state_id                   : { model: 'state' },
    country_id                 : { model: 'country' },
    zip                        : { type: 'string' },
    website_url                : { type: 'string', allowNull: true},
    company_logo_url           : { type: 'string' },
    theme                      : { type: 'string', isIn: ['Fresh Saffron','Business Blue'] },
    stripe_customer_id         : { type: 'string', required: true },
    source                     : { type: 'string', isIn: ['Admin', 'Public'] },
    user_exists                : { type: 'string', isIn: ['','Yes', 'No'] },
    is_address_same_as_billing : { type: 'number' },
    azure_product_id           : { type: 'string', allowNull: true},
    azure_product_sid          : { type: 'string', allowNull: true},
    azure_primary_api_key      : { type: 'string', allowNull: true},
    azure_secondary_api_key    : { type: 'string', allowNull: true},
    retry_count                : { type: 'number' },
    payment_failed_date        : { type: 'ref', columnType: 'datetime'},
    // accountConfig  : { collection : 'AccountConfiguration',
    //   via        : 'owner',
    // },
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

