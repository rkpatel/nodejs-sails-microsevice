


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE,ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
require('twilio/lib/rest/autopilot/v1/assistant/task/sample');
module.exports = async (template,req) => {
  let request = req.allParams();
  if(!request.email_noti && request.birthdays.length <= 0) {return null;}
  for (const data of request.birthdays) {
    let {birthdayNotiEmp,employee} = data;

    let subject = template.subject;
    let body = template.body;
    let birthdayNotiEmpgroup = [];
    let bodyText = '';
    for(let i = 0; i < birthdayNotiEmp.length; i += 3){
      birthdayNotiEmpgroup.push(birthdayNotiEmp.slice(i, i + 3));
    }

    for(const notiArr of birthdayNotiEmpgroup){
      bodyText +=  '<tr>';
      for(const noti of notiArr){
        let image = '';
        if(noti.profile_picture_thumbnail_url){
          image += `<img style=" border-radius:100%;width: 61px;height: 60px;" src="${noti.profile_picture_thumbnail_url}" />`;

        } else {
          image += `<span style="padding-top: 20px;display: block;">${noti.first_name.charAt(0)+''+noti.last_name.charAt(0) }</span>`;
        }
        bodyText +=  `
        <td v-align="top" style="vertical-align:top;text-align: center;padding:10px">
          <div style="text-align: center;
          width: 60px;
          height: 60px;
          margin: 0 auto;
          vertical-align: middle;
          background: #ffdbbc;
          border: 2px solid #ff9b44;
          border-radius:100%;
          width: 61px;height: 60px;
          color: #ff9b44;
          font-weight: bold;
          display: block;">${image}</div>
          <div style="text-align: center;font-weight: bold;word-wrap: break-word;text-transform: capitalize;padding-top: 10px;">${ noti.first_name + ' ' + noti.last_name }</div>
        </td> `;
      }
      bodyText +=  '</tr>';

    }
    body = body.replace(/<<body>>/g,bodyText);
    body = body.replace(/<<account_name>>/g,request.account_name);
    body = body.replace(/<<customer_portal_link>>/g,process.env.FRONTEND_BASEURL);
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
      employee_profile_id   : employee.employee_profile_id,
      recipient_email       : employee.email,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
  sails.log('announcement send');

};
