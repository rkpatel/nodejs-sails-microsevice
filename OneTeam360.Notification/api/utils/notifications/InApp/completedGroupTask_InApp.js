/*

  Request Body

    notification_entity
    account_id
    employee_name,
    task_title,
    task_description,
    start_date,
    end_date,
    completion_date,
    task_id,
    recipient_email,
    recipient_first_name,
    recipient_last_name,
    receipient_employee_profile_id

*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  let mailData = {
    employee_profile_id : request.receipient_employee_profile_id,
    employee_name       : request.employee_name,
    completion_date     : request.completion_date
  };

  let subject = template.subject;
  let body = template.body;
  body = body.replace(/<<employee_name>>/g,mailData.employee_name);
  body = body.replace(/<<date_time_of_task_competition>>/g,mailData.completion_date);

  let notiQueue = await NotificationQueue.create({
    notification_template_id : template.notification_template_id,
    sender                   : process.env.PUSH_NOTIFICATION_FROM,
    sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
    notification_type        : NOTIFICATION_TYPE.InApp,
    notification_subject     : subject,
    notification_body        : body,
    entity_type              : NOTIFICATION_QUEUE_ENTITIES.TASK,
    entity_id                : request.task_id,
    created_date             : getDateUTC()
  }).fetch().usingConnection(req.dynamic_connection);

  await NotificationQueueRecipient.create({
    notification_queue_id : notiQueue.notification_queue_id,
    employee_profile_id   : mailData.employee_profile_id,
    recipient_email       : '',
    status                : ACCOUNT_STATUS.active,
    to_cc                 : 'To',
  }).usingConnection(req.dynamic_connection);

};
