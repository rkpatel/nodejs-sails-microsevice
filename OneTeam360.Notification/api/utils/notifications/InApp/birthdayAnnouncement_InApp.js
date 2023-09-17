const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.push_noti) {return null;}
  if(request.birthdays.length <= 0) {return null;}
  for (const data of request.birthdays) {
    let {birthdayNotiEmp,employee} = data;

    let subject = template.subject;
    let body = template.body;

    let bodyText = '';
    if(birthdayNotiEmp.length < 3){
      bodyText = `${birthdayNotiEmp.map(item => item.first_name + ' ' + item.last_name).join(', ')} have birthdays this week`;
    }else{
      bodyText = `${birthdayNotiEmp[0].first_name + ' ' + birthdayNotiEmp[0].last_name} and ${birthdayNotiEmp.length - 1} others have birthdays this week`;
    }

    body = body.replace(/<<body>>/g,bodyText);

    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.EMAIL_FROM,
      sender_email             : process.env.EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.InApp,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
      entity_id                : request.announcement_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : employee.employee_profile_id,
      recipient_email       : employee.email,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
