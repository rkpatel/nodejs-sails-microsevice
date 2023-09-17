/***************************************************************************

   Model          : NotificationQueueRecipient
   Database Table : notification_queue_recipient

***************************************************************************/

module.exports = {
  tableName  : 'notification_queue_recipient',
  primaryKey : 'notification_queue_recipient_id',
  attributes : {
    notification_queue_recipient_id : { type: 'number', autoIncrement: true },
    notification_queue_id           : { model: 'NotificationQueue' },
    employee_profile_id             : { type: 'number', required: true },
    recipient_email                 : { type: 'string' },
    read_date                       : {  type: 'ref', columnType: 'datetime', required: false },
    to_cc                           : { type: 'string', isIn: ['To','CC'] },
    attachment                      : { type: 'string', required: false },
    status                          : { type: 'string', isIn: ['Inactive', 'Active'] },
    new_notification_flag           : { type: 'boolean', defaultsTo: true },
  },
};
