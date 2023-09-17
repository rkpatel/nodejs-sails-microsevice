/*

  Request Body

    notification_entity
    account_id
    receipient_user_id
    receipient_employee_profile_id
    recipient_email,
    certificates
*/


const { NOTIFICATION_TYPE,ACCOUNT_STATUS, NOTIFICATION_ENTITIES } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
require('twilio/lib/rest/autopilot/v1/assistant/task/sample');
module.exports = async (template,req) => {
  let request = req.allParams();

  if(request.employees && request.employees.length > 0){

    for (let item of request.employees){

      let subject = template.subject;
      let body = template.body;
      body = body.replace(/<<body>>/g,item.name);
      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.EMAIL_FROM,
        sender_email             : process.env.EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.InApp,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_ENTITIES.CHECKIN_REQUEST,
        entity_id                : item.location_id,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : item.employee_profile_id,
        recipient_email       : '',
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);

    }
  }else {
    sails.log('No records');
  }
};
