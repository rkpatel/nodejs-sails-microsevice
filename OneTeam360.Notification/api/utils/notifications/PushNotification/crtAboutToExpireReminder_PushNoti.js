/*

  Request Body

    notification_entity
    account_id
    certificates : [
      {
        recipient_email,
        recipient_first_name,
        recipient_last_name,
        receipient_user_id,
        receipient_employee_profile_id,
        employee_certificate_id,
        crt_description,
        duration,
        crt_issue_date,
        crt_expiry_date,
        crt_type
      }
    ]
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');

const getDuration = (duration) => {
  switch(duration){
    case 60 : return `in 2 months`;
    case 30 : return `in a month`;
    case 7 : return `in a week`;
    case 0 : return `today`;
  }
};

module.exports = async (template,req) => {
  let request = req.allParams();
  let certificates = [];
  for(const index in request.certificates){
    let userLoginlog = await UserLoginLog.find({ user_id: request.certificates[index].receipient_user_id, thru_mobile: 1 }).sort('login_log_id DESC').limit(1);
    if(userLoginlog  && userLoginlog.length > 0 && userLoginlog[0].device_id){
      certificates.push({
        duration                : request.certificates[index].duration,
        employee_certificate_id : request.certificates[index].employee_certificate_id,
        employee_profile_id     : request.certificates[index].receipient_employee_profile_id,
        device_id               : userLoginlog[0].device_id
      });
    }
  }
  let mailData = {
    certificates: certificates,
  };

  for (const index in mailData.certificates){
    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<duration>>/g,getDuration(mailData.certificates[index].duration));

    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.MOBILE,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE,
      entity_id                : mailData.certificates[index].employee_certificate_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : mailData.certificates[index].employee_profile_id,
      recipient_email       : mailData.certificates[index].device_id,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
