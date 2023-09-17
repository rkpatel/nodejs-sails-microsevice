const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS,ACCOUNT_CONFIG_CODE } = require('../../../utils/constants/enums');
const { getDateUTC, getDateSpecificTimeZone } = require('../../common/getDateTime');
require('moment');
const notify = async(req,request,template,subject,body,user) => {
  if(user && user.status !== ACCOUNT_STATUS.invited){
    let notiQueue = await NotificationQueue.create({
      notification_template_id : template.notification_template_id,
      sender                   : process.env.EMAIL_FROM,
      sender_email             : process.env.EMAIL_USERNAME,
      notification_type        : NOTIFICATION_TYPE.EMAIL,
      notification_subject     : subject,
      notification_body        : body,
      entity_type              : NOTIFICATION_QUEUE_ENTITIES.REPORT,
      created_date             : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);
    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : request.receipient.employee_profile_id,
      recipient_email       : request.receipient.email,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
module.exports = async (template,req) => {
  let request = req.allParams();
  sails.log(request);
  const reports = request.reports;
  const missingReports = request.missingReports;
  let subject = template.subject;
  let body = template.body;
  let dynamic_template = '';
  let sequence=1;
  for (const index of reports){
    dynamic_template = dynamic_template + `<p style="margin-bottom: 10px; font-size: 14px"> ${sequence}. Report Name – ${index.report_name} <br>Location - ${index.location} <br> Submitted By - ${index.submitted_by} </p><table style="border-collapse: collapse; border: 1px solid black;">`;
    for(const item of (index.questions))
    {
      dynamic_template += `<tr style="border: 1px solid black; "><td style="border: 1px solid black; padding-right: 20px;">${item.question}</td><td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">`;
      if(item.answer !== undefined){
        dynamic_template += item.answer;
      }
      dynamic_template += `</td></tr>`;
    }
    dynamic_template += `</table><br>`;
    sequence++;
  }
  if(missingReports && missingReports.length > 0)
  {
    dynamic_template += `<p style="margin-bottom: 10px; font-size: 14px">Below is the list of reports not submitted today.</p><table style="border-collapse: collapse; border: 1px solid black;">`;
    for(const mkey of missingReports)
    {
      dynamic_template += `<tr style="border: 1px solid black; "><td style="border: 1px solid black; padding-right: 20px;">${mkey.name}</td><td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">${mkey.location}</td></tr>`;
    }
    dynamic_template += `</table><br>`;
  }
  let sql = `
  SELECT
      account_configuration_detail.value
    from account
    INNER JOIN
      account_configuration ON account.account_id = account_configuration.account_id
    INNER JOIN
      account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
    Where
      account_configuration_detail.code = $1 and account.status= $2 and account.account_id= $3`;
  const rawResultData = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.notification_mail_all_users, ACCOUNT_STATUS.active, req.account.account_id]);
  const results_notification_users = rawResultData.rows;

  subject = subject.replace(/<<current_date>>/g,getDateSpecificTimeZone(getDateUTC(), req.timezone, 'LL'));
  body = body.replace(/<<user_name>>/g, request.receipient.user);
  body = body.replace(/<<dynamic_template>>/g,dynamic_template);
  body = body.replace(/<<customer_portal_link>>/g,process.env.FRONTEND_BASEURL);
  body = body.replace(/<<account_name>>/g,req.account.name);
  const user = await Users.findOne({email: request.receipient.email});
  const employeedetails = await EmployeeProfile.findOne({employee_profile_id: request.receipient.employee_profile_id}).usingConnection(req.dynamic_connection);
  if(employeedetails && employeedetails.status !== ACCOUNT_STATUS.inactive){
    if(results_notification_users[0].value && results_notification_users[0].value === '0'){
      await notify(req,request,template,subject,body,user);
    }else{
      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.EMAIL_FROM,
        sender_email             : process.env.EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.EMAIL,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.REPORT,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : request.receipient.employee_profile_id,
        recipient_email       : request.receipient.email,
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }
  }
};
