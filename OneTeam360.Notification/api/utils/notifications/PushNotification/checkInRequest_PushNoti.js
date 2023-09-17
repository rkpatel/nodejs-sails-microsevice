/*

  Request Body

    notification_entity
    account_id
    receipient_user_id
    receipient_employee_profile_id
    recipient_email,
    certificates
*/


const { NOTIFICATION_ENTITIES,NOTIFICATION_TYPE,ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(request.employees && request.employees.length > 0){

    for (let index in request.employees){
      let subject = template.subject;
      let body = template.body;
      body = body.replace(/<<body>>/g,request.employees[index].name);


      let userLoginlog = await UserLoginLog.find({ user_id: request.employees[index].user_id, thru_mobile: 1 }).sort('login_log_id DESC').limit(1);
      if(userLoginlog  && userLoginlog.length > 0 && userLoginlog[0].device_id){
        let notiQueue = await NotificationQueue.create({
          notification_template_id : template.notification_template_id,
          sender                   : process.env.EMAIL_FROM,
          sender_email             : process.env.EMAIL_USERNAME,
          notification_type        : NOTIFICATION_TYPE.MOBILE,
          notification_subject     : subject,
          notification_body        : body,
          entity_type              : NOTIFICATION_ENTITIES.CHECKIN_REQUEST,
          entity_id                : request.employees[index].location_id,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : request.employees[index].employee_profile_id,
          recipient_email       : userLoginlog[0].device_id,
          to_cc                 : 'To',
          status                : ACCOUNT_STATUS.active,
        }).usingConnection(req.dynamic_connection);
      }
    }

  }else {
    sails.log('No records');
  }
};
