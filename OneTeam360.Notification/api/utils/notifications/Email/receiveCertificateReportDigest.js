const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS,ACCOUNT_CONFIG_CODE } = require('../../../utils/constants/enums');
const { getDateUTC, getDateSpecificTimeZone } = require('../../common/getDateTime');
require('moment');
module.exports = async (template,attachment,req) => {
  let request = req.allParams();
  let subject = template.subject;
  let body = template.body;

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

  subject = subject.replace(/<<month>>/g,getDateSpecificTimeZone(getDateUTC(), req.timezone, 'MMMM'));
  body = body.replace(/<<user_name>>/g, request.name);
  body = body.replace(/<<company_name>>/g,req.account.name);
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
          entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE_DIGEST,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : request.employee_profile_id,
          recipient_email       : request.email,
          to_cc                 : 'To',
          attachment            : attachment.filename,
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
        entity_type              : NOTIFICATION_QUEUE_ENTITIES.CERTIFICATE_DIGEST,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
      await NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : request.employee_profile_id,
        recipient_email       : request.email,
        to_cc                 : 'To',
        attachment            : attachment.filename,
        status                : ACCOUNT_STATUS.active,
      }).usingConnection(req.dynamic_connection);
    }
  }
};
