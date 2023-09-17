/*

  Request Body

  notification_entity
  receipient_user_id
  recipient_email
  recipient_first_name
  recipient_last_name
  url
  amount
*/


const { NOTIFICATION_TYPE } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  let mailData = {
    email      : request.recipient_email,
    first_name : request.recipient_first_name,
    last_name  : request.recipient_last_name,
    days_left  : request.days_left
  };
  let subject = template.subject;
  let body = template.body;
  let bodyText = '';
  bodyText = `${request.days_left} days left to update your payment details.`;

  body = body.replace(/<<body>>/g,bodyText);
  body = body.replace(/<<first_name>>/g,mailData.first_name);
  body = body.replace(/<<last_name>>/g,mailData.last_name);

  let notiQueue = await NotificationQueueMaster.create({
    notification_template_id : template.notification_template_id,
    sender                   : process.env.EMAIL_FROM_ADMIN,
    sender_email             : process.env.EMAIL_USERNAME_ADMIN,
    notification_type        : NOTIFICATION_TYPE.EMAIL,
    notification_subject     : subject,
    notification_body        : body,
    created_date             : getDateUTC()
  }).fetch();

  await  NotificationQueueRecipientMaster.create({
    notification_queue_id : notiQueue.notification_queue_id,
    user_id               : request.receipient_user_id,
    recipient_email       : request.recipient_email,
    to_cc                 : 'To',
  });
};
