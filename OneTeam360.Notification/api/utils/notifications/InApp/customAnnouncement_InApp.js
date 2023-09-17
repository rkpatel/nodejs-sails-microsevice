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

  if(!request.push_noti) {return null;}

  let employees = [];
  for(const index in request.employees){
    employees.push({
      employee_profile_id: request.employees[index].receipient_employee_profile_id,
    });
  }
  let mailData = {
    employees          : employees,
    announcement_title : request.announcement_title,
    announcement_id    : request.announcement_id
  };
  let subject = template.subject;
  let body = template.body;
  body = body.replace(/<<announcement_title>>/g,mailData.announcement_title);
  if(mailData.employees && mailData.employees.length > 0){
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.InApp,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
      entity_id                : mailData.announcement_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    for (const index in mailData.employees){
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : mailData.employees[index].employee_profile_id,
        recipient_email       : '',
        status                : ACCOUNT_STATUS.active,
        to_cc                 : 'To',
      }).usingConnection(req.dynamic_connection);
    }

  }
};
