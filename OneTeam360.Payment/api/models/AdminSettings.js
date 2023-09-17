/* eslint-disable camelcase */
/***************************************************************************

  Model          : AdminSettings
  Database Table : admin_settings


***************************************************************************/

module.exports = {
  tableName  : 'admin_settings',
  primaryKey : 'admin_settings_id',
  attributes : {
    admin_settings_id : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    code              : { type: 'string' },
    value             : { type: 'string' }
  },
};

