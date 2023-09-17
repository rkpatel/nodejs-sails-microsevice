/*

  Request Body

    notification_entity
    account_id
    employee_name,
    task_title,
    task_description,
    start_date,
    end_date,
    task_id,
    assignees : [
      {
        receipient_user_id,
        recipient_email,
        recipient_first_name,
        recipient_last_name,
        receipient_employee_profile_id
      }
    ]
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.sms_noti) {return null;}

  let employees = [];
  for(const index in request.employees){
    let user = await Users.findOne({ user_id: request.employees[index].receipient_user_id });
    let code = '';
    if(user.emergency_contact_country_id){
      code = await Country.findOne({ country_id: user.emergency_contact_country_id });
      code = code.phone_code;
    }
    employees.push({
      employee_profile_id : request.employees[index].receipient_employee_profile_id,
      phone               : request.employees[index].recipient_phone,
      code                : code,
    });
  }
  let smsData = {
    employees          : employees,
    announcement_title : request.announcement_title,
    announcement_id    : request.announcement_id
  };
  let body = template.body;
  body = body.replace(/<<announcement_title>>/g,smsData.announcement_title);
  if(smsData.employees && smsData.employees.length > 0){
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.TWILIO_PHONE_NUMBER,
      notification_type        : NOTIFICATION_TYPE.SMS,
      notification_subject     : ' ',
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
      entity_id                : smsData.announcement_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);

    for (const index in smsData.employees){
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : smsData.employees[index].employee_profile_id,
        recipient_email       : `${smsData.employees[index].code}${smsData.employees[index].phone}`,
        status                : ACCOUNT_STATUS.active,
        to_cc                 : 'To',
      }).usingConnection(req.dynamic_connection);
    }

  }
};
