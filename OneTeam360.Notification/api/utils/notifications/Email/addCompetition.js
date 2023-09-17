/*

  Request Body

    notification_entity
    account_id
    receipient_employee_profile_id
    recipient_email,
    recipient_first_name,
    recipient_last_name,
    employee_name,
    note_type,
    note_description,
    employee_note_id
*/


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE, ACCOUNT_STATUS,ACCOUNT_CONFIG_CODE } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  sails.log(request);

  let mailData = {
    employees: request.employees.map(assignee => ({
      email               : assignee.email,
      first_name          : assignee.first_name,
      last_name           : assignee.last_name,
      employee_profile_id : assignee.receipient_employee_profile_id
    })),
    customer_portal_link : `${process.env.FRONTEND_BASEURL}/competition/view/${request.competition_id}`,
    competition_name     : request.competition_name,
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
  for (const index in mailData.employees){
    let subject = template.subject;
    let body = template.body;
    body = body.replace(/<<first_name>>/g,mailData.employees[index].first_name);
    body = body.replace(/<<last_name>>/g,mailData.employees[index].last_name);
    body = body.replace(/<<customer_portal_link>>/g,mailData.customer_portal_link);
    body = body.replace(/<<competition_name>>/g,mailData.competition_name);
    body = body.replace(/<<account_name>>/g,mailData.account_name);
    const user = await Users.findOne({email: mailData.employees[index].email});
    const employeedetails = await EmployeeProfile.findOne({employee_profile_id: mailData.employees[index].employee_profile_id}).usingConnection(req.dynamic_connection);
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
            entity_type              : NOTIFICATION_QUEUE_ENTITIES.COMPETITON,
            entity_id                : request.competition_id,
            created_date             : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          await NotificationQueueRecipient.create({
            notification_queue_id : notiQueue.notification_queue_id,
            employee_profile_id   : mailData.employees[index].employee_profile_id,
            status                : ACCOUNT_STATUS.active,
            recipient_email       : mailData.employees[index].email,
            to_cc                 : 'To',
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
          entity_type              : NOTIFICATION_QUEUE_ENTITIES.COMPETITON,
          entity_id                : request.competition_id,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : mailData.employees[index].employee_profile_id,
          status                : ACCOUNT_STATUS.active,
          recipient_email       : mailData.employees[index].email,
          to_cc                 : 'To',
        }).usingConnection(req.dynamic_connection);
      }
    }
  }
};
