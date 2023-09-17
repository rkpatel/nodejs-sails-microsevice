/***************************************************************************

   Model          : NotificationQueueLog
   Database Table : notification_queue_log

***************************************************************************/

module.exports = {
  tableName  : 'notification_queue_log',
  primaryKey : 'notification_queue_log_id',
  attributes : {
    notification_queue_log_id : { type: 'number', autoIncrement: true },
    notification_queue_id     : { type: 'string'},
    created_date              : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },
};




