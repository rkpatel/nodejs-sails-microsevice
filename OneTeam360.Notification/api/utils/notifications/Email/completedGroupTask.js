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
  if(request.receipient_user_id === request.created_user_id){
    let mailData = {
      email                : request.recipient_email,
      first_name           : request.recipient_first_name,
      last_name            : request.recipient_last_name,
      employee_profile_id  : request.receipient_employee_profile_id,
      employee_name        : request.employee_name,
      customer_portal_link : process.env.FRONTEND_BASEURL,
      account_name         : req.account.name,
      task_title           : request.task_title,
      task_description     : request.task_description,
      start_date           : request.start_date,
      end_date             : request.end_date,
      completion_date      : request.completion_date
    };

    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<first_name>>/g,mailData.first_name);
    body = body.replace(/<<last_name>>/g,mailData.last_name);
    body = body.replace(/<<employee_name>>/g,mailData.employee_name);
    body = body.replace(/<<customer_portal_link>>/g,mailData.customer_portal_link);
    body = body.replace(/<<task_title>>/g,mailData.task_title);
    body = body.replace(/<<task_description>>/g,mailData.task_description);
    body = body.replace(/<<start_date>>/g,mailData.start_date);
    body = body.replace(/<<end_date>>/g,mailData.end_date);
    body = body.replace(/<<date_time_of_task_competition>>/g,mailData.completion_date);
    body = body.replace(/<<completion_date>>/g,mailData.completion_date);
    body = body.replace(/<<account_name>>/g,mailData.account_name);


    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.EMAIL_FROM,
      sender_email             : process.env.EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.EMAIL,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.TASK,
      entity_id                : request.task_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : mailData.employee_profile_id,
      recipient_email       : mailData.email,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
