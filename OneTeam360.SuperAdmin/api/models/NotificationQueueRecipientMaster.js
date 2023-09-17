/***************************************************************************

   Model          : NotificationQueueRecipientMaster
   Database Table : notification_queue_recipient_master

***************************************************************************/

module.exports = {
  tableName  : 'notification_queue_recipient_master',
  primaryKey : 'notification_queue_recipient_id',
  attributes : {
    notification_queue_recipient_id : { type: 'number', autoIncrement: true },
    notification_queue_id           : { model: 'NotificationQueueMaster' },
    user_id                         : { type: 'number', required: true },
    recipient_email                 : { type: 'string' },
    read_date                       : {  type: 'ref', columnType: 'datetime', required: false },
    to_cc                           : { type: 'string', isIn: ['To','CC'] },
  },
};





