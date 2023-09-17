const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.push_noti) {return null;}
  if(request.anniversary.length <= 0) {return null;}
  for (const data of request.anniversary) {
    let {anniversaryNotiEmp,employee} = data;

    let subject = template.subject;
    let body = template.body;

    let bodyText = '';
    if(anniversaryNotiEmp.length < 3){
      bodyText = `${anniversaryNotiEmp.map(item => item.first_name + ' ' + item.last_name).join(', ')} for celebrating a work anniversary`;
    }else{
      bodyText = `${anniversaryNotiEmp[0].first_name + ' ' + anniversaryNotiEmp[0].last_name} and ${anniversaryNotiEmp.length - 1} others for celebrating a work anniversary`;
    }

    body = body.replace(/<<body>>/g,bodyText);
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
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
      recipient_email       : '',
      status                : ACCOUNT_STATUS.active,
      to_cc                 : 'To',
    }).usingConnection(req.dynamic_connection);
  }
};
