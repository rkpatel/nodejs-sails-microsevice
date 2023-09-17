module.exports = {
  tableName  : 'system_log',
  primaryKey : 'system_log_id',
  attributes : {
    system_log_id : { type: 'number', autoIncrement: true },
    user_id       : { type: 'number' },
    account_id    : { type: 'number' },
    url           : { type: 'string', required: true },
    ip_address    : { type: 'string', required: true },
    error_code    : { type: 'string', required: true },
    error_message : { type: 'string' },
    datetime      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    stack_trace   : { type: 'string' },
    useragent     : { type: 'string' },
  },
};

