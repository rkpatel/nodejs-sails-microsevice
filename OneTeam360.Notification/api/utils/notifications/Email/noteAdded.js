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


const { NOTIFICATION_QUEUE_ENTITIES,NOTIFICATION_TYPE,ACCOUNT_STATUS,ACCOUNT_CONFIG_CODE } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  let request = req.allParams();
  let mailData = {
    email                : request.recipient_email,
    created_by           : request.created_by,
    first_name           : request.recipient_first_name,
    last_name            : request.recipient_last_name,
    employee_name        : request.employee_name,
    customer_portal_link : process.env.FRONTEND_BASEURL,
    note_type            : request.note_type,
    note_description     : request.note_description,
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
  const rawResultData = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.note_notification_roles, ACCOUNT_STATUS.active, req.account.account_id]);
  const results_notification_users = rawResultData.rows;
  const getRoles = results_notification_users[0].value.split(',').map(Number);
  let sqlUser = `select user.email,employee_profile.employee_profile_id  from employee_profile employee_profile
  INNER JOIN ${process.env.DB_NAME}.user user
  ON user.user_id =  employee_profile.user_id
  where role_id IN (${getRoles}) AND user.status = ${ACCOUNT_STATUS.active}`;
  let employeesRow = await sails.sendNativeQuery(sqlUser).usingConnection(req.dynamic_connection);

  let employees = employeesRow.rows;


  let subject = template.subject;
  let body = template.body;
  body = body.replace(/<<created_by>>/g,mailData.created_by);
  body = body.replace(/<<added_name>>/g,mailData.created_by);
  body = body.replace(/<<employee_name>>/g,mailData.employee_name);
  body = body.replace(/<<customer_portal_link>>/g,mailData.customer_portal_link);
  body = body.replace(/<<Note_type>>/g,mailData.note_type);
  body = body.replace(/<<account_name>>/g,mailData.account_name);



  let notiQueue = await NotificationQueue.create({
    notification_template_id : template.notification_template_id,
    sender                   : process.env.EMAIL_FROM,
    sender_email             : process.env.EMAIL_USERNAME,
    notification_type        : NOTIFICATION_TYPE.EMAIL,
    notification_subject     : subject,
    notification_body        : body,
    entity_type              : NOTIFICATION_QUEUE_ENTITIES.NOTE,
    entity_id                : request.employee_note_id,
    created_date             : getDateUTC()
  }).fetch().usingConnection(req.dynamic_connection);

  for (const emp of employees) {

    await NotificationQueueRecipient.create({
      notification_queue_id : notiQueue.notification_queue_id,
      employee_profile_id   : emp.employee_profile_id,
      recipient_email       : emp.email,
      to_cc                 : 'To',
      status                : ACCOUNT_STATUS.active,
    }).usingConnection(req.dynamic_connection);
  }
};
