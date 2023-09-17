/*

  Request Body

    notification_entity
    account_id
    receipient_user_id
    receipient_employee_profile_id
    recipient_email,
    certificates
*/


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE,ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();

  if(request.recipients && request.recipients.length > 0){

    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<count>>/g,1);

    for(let index in request.recipients){

      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.EMAIL_FROM,
        sender_email             : process.env.EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.InApp,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE_AUTO,
        entity_id                : request.recipients[index].employee_profile_id,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);

      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : request.recipients[index].employee_profile_id,
        recipient_email       : '',
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);

    }


  }else{
    //receipient_user_id
    let mailData = {
      count               : request.certificates ? request.certificates.length : 0,
      account_name        : req.account.name,
      employee_profile_id : request.receipient_employee_profile_id,
      email               : request.recipient_email
    };

    if(mailData.count !== 0){
      let subject = template.subject;
      let body = template.body;
      body = body.replace(/<<count>>/g,mailData.count);


      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.EMAIL_FROM,
        sender_email             : process.env.EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.InApp,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE_AUTO,
        entity_id                : mailData.employee_profile_id,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);

      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : mailData.employee_profile_id,
        recipient_email       : '',
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }
  }
};
