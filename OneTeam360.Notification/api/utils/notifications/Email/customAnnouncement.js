/*

  Request Body

    notification_entity
    account_id
    receipient_employee_profile_id
    recipient_email,
    recipient_first_name,
    recipient_last_name,
    employee_name,
    note_type,
    note_description,
    employee_note_id
*/

const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE,ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();

  if(!request.email_noti) {return null;}

  let mailData = {
    employees: request.employees.map(employee => ({
      email               : employee.recipient_email,
      first_name          : employee.recipient_first_name,
      last_name           : employee.recipient_last_name,
      employee_profile_id : employee.receipient_employee_profile_id,
    })),
    account_name             : req.account.name,
    announcement_id          : request.announcement_id,
    announcement_title       : request.announcement_title,
    announcement_description : request.announcement_description,
    customer_portal_link     : `${process.env.FRONTEND_BASEURL}`,

  };

  for (const index in mailData.employees){
    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<first_name>>/g,mailData.employees[index].first_name);
    body = body.replace(/<<last_name>>/g,mailData.employees[index].last_name);
    body = body.replace(/<<announcement_title>>/g,mailData.announcement_title);
    body = body.replace(/<<announcement_description>>/g,mailData.announcement_description);
    body = body.replace(/<<account_name>>/g,mailData.account_name);
    body = body.replace(/<<customer_portal_link>>/g,mailData.customer_portal_link);
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.EMAIL_FROM,
      sender_email             : process.env.EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.EMAIL,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
      entity_id                : request.announcement_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : mailData.employees[index].employee_profile_id,
      recipient_email       : mailData.employees[index].email,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
