


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
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
  sails.log(request);
  for(const index in request.certificates){
    certificates.push({
      duration                : request.certificates[index].duration,
      employee_certificate_id : request.certificates[index].employee_certificate_id,
      employee_profile_id     : request.certificates[index].receipient_employee_profile_id,
    });
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
      notification_type        : NOTIFICATION_TYPE.InApp,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE,
      entity_id                : mailData.certificates[index].employee_certificate_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : request.employee_profile_id,
      recipient_email       : '',
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
