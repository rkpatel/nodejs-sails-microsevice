/*

  Request Body

    notification_entity
    account_id
    certificates : [
      {
        recipient_email,
        recipient_first_name,
        recipient_last_name,
        receipient_user_id,
        receipient_employee_profile_id,
        employee_certificate_id,
        crt_description,
        duration,
        crt_issue_date,
        crt_expiry_date,
        crt_type
      }
    ]
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS, ACCOUNT_CONFIG_CODE } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');

const getDuration = (duration) => {
  switch(duration){
    case 60 : return `in 60 days`;
    case 30 : return `in 30 days`;
    case 7 : return `in 7 days`;
    case 0 : return `today`;
  }
};

module.exports = async (template,req) => {
  let request = req.allParams();
  let mailData = {
    certificates         : request.certificates,
    customer_portal_link : process.env.FRONTEND_BASEURL,
    account_name         : req.account.name
  };
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

  for (const index in mailData.certificates){
    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<first_name>>/g,mailData.certificates[index].recipient_first_name);
    body = body.replace(/<<last_name>>/g,mailData.certificates[index].recipient_last_name);
    body = body.replace(/<<duration>>/g,getDuration(mailData.certificates[index].duration));
    body = body.replace(/<<customer_portal_link>>/g,mailData.customer_portal_link);
    body = body.replace(/<<crt_type>>/g,mailData.certificates[index].crt_type);
    body = body.replace(/<<crt_description>>/g,mailData.certificates[index].crt_description ? mailData.certificates[index].crt_description : '');
    body = body.replace(/<<crt_issue_date>>/g,mailData.certificates[index].crt_issue_date);
    body = body.replace(/<<crt_expiry_date>>/g,mailData.certificates[index].crt_expiry_date);
    body = body.replace(/<<account_name>>/g,mailData.account_name);
    const user = await Users.findOne({email: mailData.certificates[index].recipient_email});
    const employeedetails = await EmployeeProfile.findOne({employee_profile_id: mailData.certificates[index].receipient_employee_profile_id}).usingConnection(req.dynamic_connection);
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
            entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE,
            entity_id                : mailData.certificates[index].employee_certificate_id,
            created_date             : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          await NotificationQueueRecipient.create({
            notification_queue_id : notiQueue.notification_queue_id,
            employee_profile_id   : mailData.certificates[index].receipient_employee_profile_id,
            recipient_email       : mailData.certificates[index].recipient_email,
            to_cc                 : 'To',
            status                : ACCOUNT_STATUS.active,
          }).usingConnection(req.dynamic_connection);
        }
      }
      else{
        let notiQueue = await NotificationQueue.create({
          notification_template_id : template.notification_template_id,
          sender                   : process.env.EMAIL_FROM,
          sender_email             : process.env.EMAIL_USERNAME,
          notification_type        : NOTIFICATION_TYPE.EMAIL,
          notification_subject     : subject,
          notification_body        : body,
          entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE,
          entity_id                : mailData.certificates[index].employee_certificate_id,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : mailData.certificates[index].receipient_employee_profile_id,
          recipient_email       : mailData.certificates[index].recipient_email,
          to_cc                 : 'To',
          status                : ACCOUNT_STATUS.active,
        }).usingConnection(req.dynamic_connection);
      }
    }
  }
};
