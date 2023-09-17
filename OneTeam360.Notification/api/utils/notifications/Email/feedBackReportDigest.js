const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS,ACCOUNT_CONFIG_CODE } = require('../../../utils/constants/enums');
const { getDateUTC, getDateSpecificTimeZone } = require('../../common/getDateTime');
require('moment');
const createTemplate = (managerData,req,dynamic_template,view_non_anonymous_report) => {

  for (const index of managerData){
    let i = 1;
    for(const item of index) {
      if(i === 1) {
        let managerSubmittedDate = getDateSpecificTimeZone(item.date, req.timezone, 'LL');
        dynamic_template += `<p style="margin-bottom: 10px; font-size: 14px"> Manager Name – ${item.managerName} `;
        dynamic_template += view_non_anonymous_report === true ? `<br> Submitted by - ${item.submitted_by}` : ``;
        dynamic_template += `<br> Date - ${managerSubmittedDate} </p>
                              <table style="border-collapse: collapse; border: 1px solid black;">
                              <tr style="border: 1px solid black; ">
                                <td style="border: 1px solid black; padding-right: 20px;">Question</td>
                                <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">Ratings</td>
                                <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">Answer</td>
                              </tr>`;
      }

      dynamic_template += `<tr style="border: 1px solid black; ">
                            <td style="border: 1px solid black; padding-right: 20px;">${item.question}</td>
                            <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">${item.rating}</td>
                            <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">${item.answer}</td>
                            </tr>`;
      if(index.length === i) {
        dynamic_template += `</table><br>`;
      }
      i++;
    }

    return dynamic_template;
  }
};
const createTemplate2 = (locationData,req,view_non_anonymous_report,dynamic_template) => {

  for (const index1 of locationData){
    let j = 1;
    for(const item1 of index1) {
      if(j === 1) {
        let locationSubmittedDate = getDateSpecificTimeZone(item1.date, req.timezone, 'LL');
        dynamic_template += `<p style="margin-bottom: 10px; font-size: 14px"> Location Name – ${item1.locationName}`;
        dynamic_template += view_non_anonymous_report === true ?  `<br> Submitted by - ${item1.submitted_by}` : ``;
        dynamic_template += `<br> Date - ${locationSubmittedDate} </p>
                              <table style="border-collapse: collapse; border: 1px solid black;">
                              <tr style="border: 1px solid black; ">
                                <td style="border: 1px solid black; padding-right: 20px;">Question</td>
                                <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">Ratings</td>
                                <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">Answer</td>
                              </tr>`;
      }
      dynamic_template += `<tr style="border: 1px solid black; ">
                          <td style="border: 1px solid black; padding-right: 20px;">${item1.question}</td>
                          <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">${item1.rating}</td>
                          <td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;">${item1.answer}</td>
                          </tr>`;
      if(index1.length === j) {
        dynamic_template += `</table><br>`;
      }
      j++;
    }
  }
  return dynamic_template;
};
module.exports = async (template,req) => {
  let request = req.allParams();
  const managerData = request.managerData;
  const managerCount = managerData.length;
  const locationData = request.locationData;
  const view_non_anonymous_report = request.view_non_anonymous_report;
  const locationCount = locationData.length;
  let subject = template.subject;
  let body = template.body;
  let dynamic_template = '';


  dynamic_template = dynamic_template + `<p style="margin-bottom: 10px; font-size: 14px">Please view the below summary for today’s manager feedback report.<br> Manager feedback received this week- ${managerCount}</p>`;
  if(managerCount > 0) {
    dynamic_template = await createTemplate(managerData,req,dynamic_template,view_non_anonymous_report);
  }
  dynamic_template = dynamic_template + `<p style="margin-bottom: 10px; font-size: 14px">Please view the below summary for today’s manager feedback report. <br>Location feedback received this week- ${locationCount}</p>`;
  if(locationCount > 0) {
    dynamic_template = await createTemplate2(locationData,req,view_non_anonymous_report,dynamic_template);
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
  body = body.replace(/<<user_name>>/g, request.name);
  body = body.replace(/<<dynamic_template>>/g,dynamic_template);
  body = body.replace(/<<customer_portal_link>>/g,process.env.FRONTEND_BASEURL+'/feedbackReport');
  body = body.replace(/<<account_name>>/g,req.account.name);
  const user = await Users.findOne({email: request.email});
  const employeedetails = await EmployeeProfile.findOne({employee_profile_id: request.employee_profile_id}).usingConnection(req.dynamic_connection);
  if(employeedetails && employeedetails.status !== ACCOUNT_STATUS.inactive){
    if(results_notification_users[0].value && results_notification_users[0].value === '0'){
      if(user && user.status !== ACCOUNT_STATUS.invited){
        let notiQueue = await NotificationQueue.create({
          notification_template_id : template.notification_template_id,
          sender                   : process.env.EMAIL_FROM,
          sender_email             : process.env.EMAIL_USERNAME,
          notification_type        : NOTIFICATION_TYPE.EMAIL,
          notification_subject     : subject,
          notification_body        : body,
          entity_type              : NOTIFICATION_QUEUE_ENTITIES.FEEDBACK_DIGEST,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : request.employee_profile_id,
          recipient_email       : request.email,
          to_cc                 : 'To',
          status                : ACCOUNT_STATUS.active,
        }).usingConnection(req.dynamic_connection);
      }
    }else{
      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.EMAIL_FROM,
        sender_email             : process.env.EMAIL_USERNAME,
        notification_type        : NOTIFICATION_TYPE.EMAIL,
        notification_subject     : subject,
        notification_body        : body,
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.FEEDBACK_DIGEST,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : request.employee_profile_id,
        recipient_email       : request.email,
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }
  }
};
