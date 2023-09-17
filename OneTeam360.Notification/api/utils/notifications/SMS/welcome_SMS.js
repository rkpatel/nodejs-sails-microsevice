/*

  Request Body

  notification_entity
  account_id
  receipient_employee_profile_id
  recipient_email
  recipient_first_name
  recipient_phone
  recipient_last_name
  receipient_user_id
  url
*/

const { NOTIFICATION_TYPE, ACCOUNT_STATUS } = require('../../constants/enums');
const { getDateUTC } = require('../../common/getDateTime');
module.exports = async (template,req) => {
  if(template){

    let request = req.allParams();
    let user = await Users.findOne({ user_id: request.receipient_user_id });
    if(user.emergency_contact_country_id){
      let code = await Country.findOne({ country_id: user.emergency_contact_country_id });
      code = code.phone_code;
      let mailData = {
        email               : request.recipient_email,
        first_name          : request.recipient_first_name,
        last_name           : request.recipient_last_name,
        phone               : `${code}${request.recipient_phone}`,
        employee_profile_id : request.receipient_employee_profile_id
      };
      let body = template.body;
      body = body.replace(/<<first_name>>/g,mailData.first_name);
      body = body.replace(/<<last_name>>/g,mailData.last_name);

      let notiQueue = await NotificationQueue.create({
        notification_template_id : template.notification_template_id,
        sender                   : process.env.PUSH_NOTIFICATION_FROM,
        sender_email             : process.env.TWILIO_PHONE_NUMBER,
        notification_type        : NOTIFICATION_TYPE.SMS,
        notification_subject     : ' ',
        notification_body        : body,
        created_date             : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);

      await  NotificationQueueRecipient.create({
        notification_queue_id : notiQueue.notification_queue_id,
        employee_profile_id   : mailData.employee_profile_id,
        recipient_email       : mailData.phone,
        to_cc                 : 'To',
        status                : ACCOUNT_STATUS.active
      }).usingConnection(req.dynamic_connection);
    }
  }
};
