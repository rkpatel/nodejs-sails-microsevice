


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE,ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.email_noti) {return null;}
  if(request.aboard.length <= 0) {return null;}
  for (const data of request.aboard) {
    let {locationsName,abordEmp,employees} = data;
    let location_name = locationsName.map((item) => item);
    let subject = template.subject;
    let body = template.body;

    let bodyText = '';
    if(location_name < 3){
      bodyText = location_name;
    }else{
      bodyText = ` ${location_name[0]}, and ${location_name.length - 1} more locations.`;
    }
    subject = subject.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);
    body = body.replace(/<<employee_name>>/g,`${abordEmp.first_name} ${abordEmp.last_name}`);
    body = body.replace(/<<employee_email>>/g,abordEmp.email);
    body = body.replace(/<<location>>/g,bodyText);
    body = body.replace(/<<account_name>>/g,request.account_name);
    body = body.replace(/<<customer_portal_link>>/g,process.env.FRONTEND_BASEURL);
    for (const index in employees){
      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.EMAIL_FROM,
        sender_email             : process.env.EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.EMAIL,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.ANNOUNCEMENT,
        entity_id                : request.announcement_id,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : employees[index].employee_profile_id,
        recipient_email       : employees[index].email,
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }
  }
  sails.log('announcement send');

};
