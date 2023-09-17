/*

  Request Body

    notification_entity
    account_id
    employees : [
      {

        receipient_employee_profile_id,
        receipient_user_id
      }
    ],
    competition_id,
    competition_name
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  let employees = [];
  for(const index in request.employees){
    let userLoginlog = await UserLoginLog.find({ user_id: request.employees[index].receipient_user_id, thru_mobile: 1 }).sort('login_log_id DESC').limit(1);
    if(userLoginlog  && userLoginlog.length > 0 && userLoginlog[0].device_id){
      employees.push({
        employee_profile_id : request.employees[index].receipient_employee_profile_id,
        device_id           : userLoginlog[0].device_id,
      });

    }
  }
  let mailData = {
    employees        : employees,
    competition_id   : request.competition_id,
    competition_name : request.competition_name,
  };
  if(mailData.employees && mailData.employees.length > 0){
    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<competition_name>>/g,mailData.competition_name);
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.PUSH_NOTIFICATION_FROM,
      sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.MOBILE,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.COMPETITON,
      entity_id                : mailData.competition_id,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);
    for (const index in mailData.employees){
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : mailData.employees[index].employee_profile_id,
        recipient_email       : mailData.employees[index].device_id,
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }
  }
};
