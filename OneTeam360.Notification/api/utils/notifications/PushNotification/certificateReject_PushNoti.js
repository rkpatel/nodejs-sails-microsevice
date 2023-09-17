const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  sails.log(request);
  let userLoginlog = await UserLoginLog.find({ user_id: request.receipient_user_id, thru_mobile: 1 }).sort('login_log_id DESC').limit(1);

  if(userLoginlog  && userLoginlog.length > 0 && userLoginlog[0].device_id){
    let mailData = {
      employee_name: `${request.employee.first_name} ${request.employee.last_name}`,
    };
    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<employee_name>>/g,mailData.employee_name);

    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.MOBILE,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE,
      entity_id                : request.employee_certificate_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : request.employee_profile_id,
      recipient_email       : userLoginlog[0].device_id,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
