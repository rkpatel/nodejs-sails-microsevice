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
        recipient_first_name,
        recipient_last_name,
        receipient_employee_profile_id
      }
    ]
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS, ACCOUNT_CONFIG_CODE } = require('../../../utils/constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  let mailData = {
    assignees: request.assignees.map(assignee => ({
      email               : assignee.recipient_email,
      first_name          : assignee.recipient_first_name,
      last_name           : assignee.recipient_last_name,
      employee_profile_id : assignee.receipient_employee_profile_id
    })),
    employee_name        : request.employee_name,
    customer_portal_link : process.env.FRONTEND_BASEURL,
    account_name         : req.account.name,
    task_title           : request.task_title,
    task_description     : request.task_description,
    start_date           : request.start_date,
    end_date             : request.end_date,
    attachment           : request.attachment
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
  for (const index in mailData.assignees){
    const user = await Users.findOne({email: mailData.assignees[index].email});
    const employeedetails = await EmployeeProfile.findOne({employee_profile_id: mailData.assignees[index].employee_profile_id}).usingConnection(req.dynamic_connection);
    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<first_name>>/g,mailData.assignees[index].first_name);
    body = body.replace(/<<last_name>>/g,mailData.assignees[index].last_name);
    body = body.replace(/<<employee_name>>/g,mailData.employee_name);
    body = body.replace(/<<customer_portal_link>>/g,mailData.customer_portal_link);
    body = body.replace(/<<task_title>>/g,mailData.task_title);
    body = body.replace(/<<task_description>>/g,mailData.task_description);
    body = body.replace(/<<start_date>>/g,mailData.start_date);
    body = body.replace(/<<end_date>>/g,mailData.end_date);
    body = body.replace(/<<account_name>>/g,mailData.account_name);
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
            entity_type              : NOTIFICATION_QUEUE_ENTITIES.TASK,
            entity_id                : request.task_id,
            created_date             : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          await NotificationQueueRecipient.create({
            notification_queue_id : notiQueue.notification_queue_id,
            employee_profile_id   : mailData.assignees[index].employee_profile_id,
            recipient_email       : mailData.assignees[index].email,
            to_cc                 : 'To',
            status                : ACCOUNT_STATUS.active,
            attachment            : request.attachment
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
          entity_type              : NOTIFICATION_QUEUE_ENTITIES.TASK,
          entity_id                : request.task_id,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : mailData.assignees[index].employee_profile_id,
          recipient_email       : mailData.assignees[index].email,
          to_cc                 : 'To',
          status                : ACCOUNT_STATUS.active,
          attachment            : request.attachment
        }).usingConnection(req.dynamic_connection);
      }
    }

  }
};
