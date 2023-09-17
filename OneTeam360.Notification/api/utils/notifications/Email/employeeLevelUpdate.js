/*

  Request Body

    notification_entity
    account_id
    employees : [
      {
        recipient_email,
        recipient_first_name,
        recipient_last_name,
        receipient_user_id,
        receipient_employee_profile_id,
        points,
        old_level_name,
        new_level_name
      }
    ]
*/


const { NOTIFICATION_QUEUE_ENTITIES, NOTIFICATION_TYPE, ACCOUNT_STATUS, ACCOUNT_CONFIG_CODE } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');

module.exports = async (template,req) => {
  let request = req.allParams();
  let mailData = {
    employees: request.employees.map(assignee => ({
      email               : assignee.recipient_email,
      first_name          : assignee.recipient_first_name,
      last_name           : assignee.recipient_last_name,
      employee_profile_id : assignee.receipient_employee_profile_id,
      points              : assignee.points,
      old_level_name      : assignee.old_level_name,
      new_level_name      : assignee.new_level_name
    })),
    customer_portal_link : process.env.FRONTEND_BASEURL,
    account_name         : req.account.name,

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
    body = body.replace(/<<points>>/g,mailData.employees[index].points);
    body = body.replace(/<<old_level_name>>/g,mailData.employees[index].old_level_name);
    body = body.replace(/<<new_level_name>>/g,mailData.employees[index].new_level_name);
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
            entity_type              : NOTIFICATION_QUEUE_ENTITIES.POINT_CALCULATION,
            created_date             : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          await NotificationQueueRecipient.create({
            notification_queue_id : notiQueue.notification_queue_id,
            employee_profile_id   : mailData.employees[index].employee_profile_id,
            recipient_email       : mailData.employees[index].email,
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
          entity_type              : NOTIFICATION_QUEUE_ENTITIES.POINT_CALCULATION,
          created_date             : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        await NotificationQueueRecipient.create({
          notification_queue_id : notiQueue.notification_queue_id,
          employee_profile_id   : mailData.employees[index].employee_profile_id,
          recipient_email       : mailData.employees[index].email,
          to_cc                 : 'To',
          status                : ACCOUNT_STATUS.active,
        }).usingConnection(req.dynamic_connection);
      }
    }
  }
};
