const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
require('twilio/lib/rest/preview/understand/assistant/task/sample');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.push_noti) {return null;}
  if(request.aboard.length <= 0) {return null;}
  for (const data of request.aboard) {
    let {locationsName,abordEmp,employees} = data;
    let location_name = locationsName.map((item) => item);
    sails.log(location_name);
    let subject = template.subject;
    let body = template.body;


    subject = subject.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);
    body = body.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);
    if(employees && employees.length > 0){
      for (const index in employees){
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
          employee_profile_id   : employees[index].employee_profile_id,
          recipient_email       : '',
          status                : ACCOUNT_STATUS.active,
          to_cc                 : 'To',
        }).usingConnection(req.dynamic_connection);
      }
    }
  }
};
