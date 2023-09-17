/***************************************************************************

   Model          : NotificationQueue
   Database Table : notification_queue

***************************************************************************/

module.exports = {
  tableName  : 'notification_queue',
  primaryKey : 'notification_queue_id',
  attributes : {
    notification_queue_id    : { type: 'number', autoIncrement: true },
    notification_template_id : { model: 'NotificationTemplate' },
    sender                   : { type: 'string', required: true },
    sender_email             : { type: 'string', required: true },
    notification_type        : { type: 'string', isIn: ['SMS','Email','Mobile','InApp'] },
    notification_subject     : {  type: 'string', required: true },
    notification_body        : { type: 'string', required: true },
    entity_type              : { type: 'string' },
    entity_id                : { type: 'string' },
    default_recipeints       : { type: 'string' },
    sent_date                : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    retry_count              : { type: 'number' },
    notification_error       : { type: 'string' },
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    status                   : { type: 'string', isIn: ['Pending','InProgress','Completed'],defaultsTo: 'Pending' },
  },
};