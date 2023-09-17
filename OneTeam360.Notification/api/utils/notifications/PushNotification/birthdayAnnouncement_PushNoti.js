


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
require('twilio/lib/rest/preview/understand/assistant/task/sample');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.push_noti) {return null;}
  if(request.birthdays.length <= 0) {return null;}
  for (const data of request.birthdays) {
    let {birthdayNotiEmp,employee} = data;

    let userLoginlog = await UserLoginLog.find({ user_id: employee.user_id, thru_mobile: 1 }).sort('login_log_id DESC').limit(1);
    if(userLoginlog  && userLoginlog.length > 0 && userLoginlog[0].device_id){

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
        sender                   : process.env.PUSH_NOTIFICATION_FROM,
        sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.MOBILE,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
        entity_id                : request.announcement_id,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);

      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : employee.employee_profile_id,
        recipient_email       : userLoginlog[0].device_id,
        status                : ACCOUNT_STATUS.active,
        to_cc                 : 'To',
      }).usingConnection(req.dynamic_connection);

    }
  }
};
