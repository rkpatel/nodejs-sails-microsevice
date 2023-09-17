const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(request.birthdays.length <= 0) {return null;}
  for (const data of request.birthdays) {
    let {birthdayNotiEmp,employee} = data;
    let user = await Users.findOne({ user_id: employee.user_id });
    let code = '';
    if(user.emergency_contact_country_id){
      code = await Country.findOne({ country_id: user.emergency_contact_country_id });
      code = code.phone_code;
    }else{
      continue;
    }
    let body = template.body;
    let bodyText = '';
    if(birthdayNotiEmp.length < 3){
      bodyText = `${birthdayNotiEmp.map(item => item.first_name + ' ' + item.last_name).join(', ')} have birthdays this week`;
    }else{
      bodyText = `${birthdayNotiEmp[0].first_name + ' ' + birthdayNotiEmp[0].last_name} and ${birthdayNotiEmp.length - 1} others have birthdays this week`;
    }
    body = body.replace(/<<body>>/g,bodyText);
    let baseURL = process.env.FRONTEND_BASEURL.replace(/['"]+/g, '');
    body = body.replace(/<<customer_portal_link>>/g,baseURL);
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.TWILIO_PHONE_NUMBER,
      notification_type        : NOTIFICATION_TYPE.SMS,
      notification_subject     : ' ',
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
      entity_id                : request.announcement_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);
    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : employee.employee_profile_id,
      recipient_email       : `${code}${employee.phone}`,
      status                : ACCOUNT_STATUS.active,
      to_cc                 : 'To',
    }).usingConnection(req.dynamic_connection);
  }
};
