/*

  Request Body

  notification_entity
  recipient_email
  receipient_employee_profile_id
  recipient_first_name
  recipient_last_name
  url
  account_id
*/



const { NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  let mailData = {
    email         : request.recipient_email,
    first_name    : request.recipient_first_name,
    last_name     : request.recipient_last_name,
    link          : request.url,
    account_name  : req.account.name,
    account_email : req.account.email
  };
  let subject = template.subject;
  let body = template.body;
  subject = subject.replace(/<<first_name>>/g,mailData.first_name);
  subject = subject.replace(/<<last_name>>/g,mailData.last_name);
  body = body.replace(/<<first_name>>/g,mailData.first_name);
  body = body.replace(/<<last_name>>/g,mailData.last_name);
  body = body.replace(/<<link>>/g,mailData.link);
  body = body.replace(/<<account_name>>/g,mailData.account_name);
  body = body.replace(/<<account_email>>/g,mailData.account_email);

  let notiQueue = await NotificationQueue.create({
    notification_template_id : template.notification_template_id,
    sender                   : process.env.EMAIL_FROM,
    sender_email             : process.env.EMAIL_USERNAME,
    notification_type        : NOTIFICATION_TYPE.EMAIL,
    notification_subject     : subject,
    notification_body        : body,
    created_date             : getDateUTC()
  }).fetch().usingConnection(req.dynamic_connection);

  await NotificationQueueRecipient.create({
    notification_queue_id : notiQueue.notification_queue_id,
    employee_profile_id   : request.receipient_employee_profile_id,
    recipient_email       : request.recipient_email,
    to_cc                 : 'To',
    status                : ACCOUNT_STATUS.active,
  }).usingConnection(req.dynamic_connection);

};
