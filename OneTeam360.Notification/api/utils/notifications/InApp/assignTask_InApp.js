/*

  Request Body

    notification_entity
    account_id
    employee_name,
    task_title,
    task_description,
    start_date,
    end_date,
    task_id,
    assignees : [
      {
        receipient_user_id,
        recipient_email,
        recipient_first_name,
        recipient_last_name,
        receipient_employee_profile_id
      }
    ]
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  let assignees = [];
  for(const index in request.assignees){
    assignees.push({
      email               : request.assignees[index].recipient_email,
      first_name          : request.assignees[index].recipient_first_name,
      last_name           : request.assignees[index].recipient_last_name,
      employee_profile_id : request.assignees[index].receipient_employee_profile_id,
      user_id             : request.assignees[index].receipient_user_id,
    });
  }

  let mailData = {
    assignees     : assignees,
    employee_name : request.employee_name,
  };

  let subject = template.subject;
  let body = template.body;
  body = body.replace(/<<employee_name>>/g,mailData.employee_name);

  if(mailData.assignees && mailData.assignees.length > 0){
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
    for (const index in mailData.assignees){
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : mailData.assignees[index].employee_profile_id,
        recipient_email       : '',
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }

  }

};
