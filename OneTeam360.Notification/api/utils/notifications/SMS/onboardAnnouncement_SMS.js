const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(request.aboard.length <= 0) {return null;}
  for (const data of request.aboard) {
    let {abordEmp,employees} = data;
    let subject = template.subject;
    let body = template.body;
    subject = subject.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);
    body = body.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);
    for (const index in employees){
      if(employees && employees.length > 0){
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
          employee_profile_id   : employees[index].employee_profile_id,
          recipient_email       : `${employees[index].phone_code}${employees[index].phone}`,
          status                : ACCOUNT_STATUS.active,
          to_cc                 : 'To',
        }).usingConnection(req.dynamic_connection);
      }
    }
  }
};
