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
        recipient_email,
        recipient_phone,
        recipient_first_name,
        recipient_last_name,
        receipient_employee_profile_id
      }
    ]
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  if(template){
    let request = req.allParams();
    let assignee = [];
    for(const index in request.assignees){
      let user = await Users.findOne({ user_id: request.assignees[index].receipient_user_id });
      let code = '';
      if(user.emergency_contact_country_id){
        code = await Country.findOne({ country_id: user.emergency_contact_country_id });
        code = code.phone_code;
      }else{
        continue;
      }

      assignee.push({
        phone               : `${code}${request.assignees[index].recipient_phone}`,
        email               : request.assignees[index].recipient_email,
        first_name          : request.assignees[index].recipient_first_name,
        last_name           : request.assignees[index].recipient_last_name,
        employee_profile_id : request.assignees[index].receipient_employee_profile_id
      });
    }
    let smsData = {
      assignees     : assignee,
      employee_name : request.employee_name,
    };

    for (const index in smsData.assignees){
      let body = template.body;
      body = body.replace(/<<first_name>>/g,smsData.assignees[index].first_name);
      body = body.replace(/<<last_name>>/g,smsData.assignees[index].last_name);
      body = body.replace(/<<employee_name>>/g,smsData.employee_name);

      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.PUSH_NOTIFICATION_FROM,
        sender_email             : process.env.TWILIO_PHONE_NUMBER,
        notification_type        : NOTIFICATION_TYPE.SMS,
        notification_subject     : ' ',
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.TASK,
        entity_id                : request.task_id,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);

      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : smsData.assignees[index].employee_profile_id,
        recipient_email       : smsData.assignees[index].phone,
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active
      }).usingConnection(req.dynamic_connection);
    }
  }
};
