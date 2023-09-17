


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  sails.log(request);
  let employees = [];
  for(const index in request.employees){
    employees.push({
      employee_profile_id: request.employees[index].receipient_employee_profile_id,
    });
  }
  let mailData = {
    employees: employees,
  };
  if(mailData.employees && mailData.employees.length > 0){
    let subject = template.subject;
    let body = template.body;
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.InApp,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.POINT_CALCULATION,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);
    for (const index in mailData.employees){
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : mailData.employees[index].employee_profile_id,
        recipient_email       : '',
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }
  }
};
