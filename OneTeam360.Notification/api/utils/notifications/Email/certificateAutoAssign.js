/*

  Request Body

    notification_entity
    account_id
    receipient_user_id
    receipient_employee_profile_id
    recipient_email
    certificates
*/


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE,ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();

  sails.log('Certificate Auto Assign',request);

  if(request.recipients && request.recipients.length > 0){

    for(let index in request.recipients){
      let subject = template.subject;
      let body = template.body;
      body = body.replace(/<<certificates>>/g,`<li>${request.recipients[index].certificate_name}</li>`);
      body = body.replace(/<<account_name>>/g,req.account.name);

      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.EMAIL_FROM,
        sender_email             : process.env.EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.EMAIL,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE_AUTO,
        entity_id                : request.recipients[index].employee_profile_id,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);

      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : request.recipients[index].employee_profile_id,
        recipient_email       : request.recipients[index].recipient_email,
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);

    }
  }else{
    let mailData = {
      certificates        : request.certificates,
      account_name        : req.account.name,
      employee_profile_id : request.receipient_employee_profile_id,
      email               : request.recipient_email
    };

    let crts = [];
    mailData.certificates.forEach(item => {
      crts = crts + `<li>${item}</li>`;
    });

    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<certificates>>/g,crts);
    body = body.replace(/<<account_name>>/g,mailData.account_name);

    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.EMAIL_FROM,
      sender_email             : process.env.EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.EMAIL,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE_AUTO,
      entity_id                : mailData.employee_profile_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : mailData.employee_profile_id,
      recipient_email       : mailData.email,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }



};
