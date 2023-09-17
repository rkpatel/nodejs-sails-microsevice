/***************************************************************************

  Model          : UserLoginLog
  Database Table : user_login_log

**************************************************************************/

module.exports = {
  tableName  : 'user_login_log',
  primaryKey : 'login_log_id',
  attributes : {
    login_log_id      : { type: 'number', autoIncrement: true },
    user_id           : { type: 'number', allowNull: true },
    login_date_time   : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    thru_mobile       : { type: 'number' },
    device_id         : { type: 'string' },
    device_os_name    : { type: 'string' },
    device_info       : { type: 'string' },
    device_os_version : { type: 'string' },
    app_version       : { type: 'string' },
    ip_adress         : { type: 'string' },
    status            : { type: 'string' },
    login_error       : { type: 'string' }
  }
};
