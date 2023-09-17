


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.push_noti) {return null;}
  if(request.aboard.length <= 0) {return null;}
  for (const data of request.aboard) {
    let {abordEmp,employees} = data;
    let emp = [];
    for(const index in employees){
      let userLoginlog = await UserLoginLog.find({ user_id: employees[index].user_id, thru_mobile: 1 }).sort('login_log_id DESC').limit(1);
      if(userLoginlog  && userLoginlog.length > 0 && userLoginlog[0].device_id){
        emp.push({
          employee_profile_id : employees[index].employee_profile_id,
          device_id           : userLoginlog[0].device_id
        });
      }
    }
    let mailData = {
      employees          : emp,
      announcement_title : request.announcement_title,
      announcement_id    : request.announcement_id
    };
    let subject = template.subject;
    let body = template.body;
    subject = subject.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);
    body = body.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);

    if(mailData.employees && mailData.employees.length > 0){
      for (const index in mailData.employees){
        let notiQueue = await NotificationQueue.create({
          notification_template_id : template.notification_template_id,
          sender                   : process.env.PUSH_NOTIFICATION_FROM,
          sender_email             : process.env.PUSH_NOTIFICATION_EMAIL_USERNAME,
          notification_type        : NOTIFICATION_TYPE.MOBILE,
          notification_subject     : subject,
          notification_body        : body,
          entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
          entity_id                : mailData.announcement_id,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : mailData.employees[index].employee_profile_id,
          recipient_email       : mailData.employees[index].device_id,
          status                : ACCOUNT_STATUS.active,
          to_cc                 : 'To',
        }).usingConnection(req.dynamic_connection);
      }

    }
  }
};
