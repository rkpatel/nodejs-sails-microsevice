const messages = sails.config.globals.messages;
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const { RESPONSE_STATUS, STATUS, ACCOUNT_STATUS,MASTERINFO_STATUS,ACCOUNT_CONFIG_CODE, ONBOARD_STATUS, PORTAL_ACCESS, NOTIFICATION_ENTITIES } = require('../utils/constants/enums');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Uuid = require('uuid');
const { uploadDocument } = require('../services/uploadDocument');
const CustomerValidations = require('../validations/CustomerValidations');
const { getDateUTC } = require('../utils/common/getDateTime');
const {sendNotification, sendCustomerNotification} = require('../services/sendNotification');
const { generateToken } = require('../services/jwt');
const moment = require('moment');
const getImgUrl = function (profilePicName, isThumb = false) {
  let company_logo_name = profilePicName;
  if (isThumb) {
    let arr = profilePicName.split('.');
    company_logo_name = `${arr[0]}_thumbnail.${arr[1]}`;
  }
  return `${process.env.PROFILE_PIC_CDN_URL}/${process.env.CONTAINER_NAME}/${process.env.COMPANY_LOGO_DIR_INSIDE_MASTER_CONTAINER}/${company_logo_name}`;
};
const getCustomerDetails = async function(_req, account_id){
  let sql = `SELECT a.account_id, a.name, a.account_guid, a.address, a.onboard_status, a.status AS account_status, a.email AS account_email, a.phone AS account_phone, a.city_id as account_city_id,
                    a.state_id AS account_state_id, a.country_id AS account_country_id, a.zip AS account_zip, a.website_url AS account_website_url, a.company_logo_url AS account_company_logo_url, a.theme,
                    stripe_customer_id, au.account_user_id, au.user_id, account_owner, u.email AS user_email, first_name, last_name, u.phone AS user_phone, date_of_birth, emergency_contact_name, emergency_contact_relation, 
                    emergency_contact_number, emergency_contact_address, emergency_contact_zip, profile_picture_url, profile_picture_thumbnail_url, u.status AS user_status, primary_user
            FROM account AS a 
            LEFT JOIN account_user AS au ON a.account_id = au.account_id
            LEFT JOIN user AS u ON au.user_id = u.user_id
            WHERE a.account_id = '${account_id}' and u.primary_user = 'Yes'`;

  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};

const existingAccountDatas=(existingaccount,res)=>{
  if(existingaccount.status === ACCOUNT_STATUS.payment_pending || existingaccount.status === ACCOUNT_STATUS.payment_declined){
    return res.ok({ account_id: existingaccount.account_id , status: existingaccount.status }, messages.COMPANY_ALREADY_EXISTS);
  }else if(existingaccount.status === ACCOUNT_STATUS.active){
    return res.ok(undefined,messages.COMPANY_EXISTS_ACTIVE, RESPONSE_STATUS.error);
  }
  else if(existingaccount.status === ACCOUNT_STATUS.inactive){
    return res.ok(undefined, messages.COMPANY_EXISTS_INACTIVE, RESPONSE_STATUS.error);
  }
  else{
    return res.ok(undefined, messages.COMPANY_EXISTS_CANCEL, RESPONSE_STATUS.error);
  }
};

const existingUserDatas=(source,res)=>{
  if(source && source === 'Admin'){
    return res.ok(undefined, messages.USER_ALREADY_EXISTS, RESPONSE_STATUS.error);
  }else{
    return res.ok(undefined, messages.CUSTOMER_USER_ALREADY_EXISTS, RESPONSE_STATUS.error);
  }
};

const copyLogoUrl=(company_logo_url,image_data)=>{
  if (company_logo_url) {
    image_data = getImgUrl(company_logo_url, false);
  }
  return image_data;
};

const webSiteUrlData=(website_url,addData)=>{
  if(website_url){
    addData['website_url'] = website_url;
  }
  return addData['website_url'];
};

const stripeAddressData=(addData)=>{
  return (addData['address'] !== null && addData['address'] !== '') ? addData['address'] : '12, street';
};

const stripeCountryName=(country_name)=>{
  return (country_name !== null && country_name !== '') ? country_name : 'US';
};

const stripeStateName=(state_name)=>{
  return (state_name !== null && state_name !== '') ? state_name : 'CA';
};

const stripeCityName=(city_name)=>{
  return (city_name !== null && city_name !== '') ? city_name : 'Irivine';
};

const postalCodeData=(addData)=>{
  return (addData['zip'] !== null && addData['zip'] !== '') ? addData['zip'] : '48322';
};

const handleConfingDetailUpdate= async function(account_configuration_id, confingDetails, code, createItem, confArr, updatedConfigIds){
  let configItem = confingDetails.filter((item) => item.code === code);
  if (configItem.length > 0 ) {
    for(let itm of configItem){
      updatedConfigIds.push(itm.account_configuration_detail_id);
      if(itm.value !== `${createItem.value}`){
        await AccountConfigurationDetail.update({ account_configuration_id: account_configuration_id, code: code },{
          name              : createItem.name,
          code              : createItem.code,
          value             : createItem.value,
          default_value     : createItem.default_value,
          description       : createItem.description,
          status            : createItem.status,
          last_updated_by   : createItem.last_updated_by,
          last_updated_date : getDateUTC()
        }).fetch();
      }else{
        continue;
      }
    }
  }else{
    confArr.push(createItem);
  }
  return [confArr,updatedConfigIds];
};
const triggerpaymentFailedNotificationCron = async (_curentTimeUTC) => {
  let sql = `SELECT a.account_id, a.name, a.account_guid, a.onboard_status, a.status AS account_status, a.email AS account_email, 
             stripe_customer_id, au.account_user_id, au.user_id, u.email AS user_email, u.first_name, u.last_name, a.retry_count,
             a.payment_failed_date, u.status AS user_status 
             FROM account AS a 
          LEFT JOIN account_user AS au ON a.account_id = au.account_id
          LEFT JOIN user AS u ON au.user_id = u.user_id
          WHERE a.retry_count > 0 and a.status = '${ACCOUNT_STATUS.active}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  const results = rawResult.rows;
  if(results.length > 0){
    for(const item in results){
      let days_left = 0;
      let days_diff = 0;
      const payment_failed_date = results[item].payment_failed_date && results[item].payment_failed_date !==null ? results[item].payment_failed_date : _curentTimeUTC;
      days_diff = moment().diff(moment(payment_failed_date),'days');
      days_left = 7 - days_diff;
      if(days_diff > 0){
        await sendNotification(null, {
          notification_entity  : NOTIFICATION_ENTITIES.NOTIFICATION_PAYMENT_FAILED_REMINDER,
          recipient_email      : results[item].user_email,
          recipient_first_name : results[item].first_name,
          recipient_last_name  : results[item].last_name,
          receipient_user_id   : results[item].user_id,
          days_left            : days_left
        });
      }
    }
  }
};
module.exports = {
  add: async(req, res) =>{
    let request = req.allParams();
    const isValidate = await CustomerValidations.Add.validate(request);
    if (!isValidate.error) {
      const {
        name,
        phone,
        email,
        address,
        city_id,
        state_id,
        country_id,
        city_name,
        state_name,
        country_name,
        zip,
        company_logo_url,
        website_url,
        primary_contact_first_name,
        primary_contact_last_name,
        primary_contact_number,
        primary_contact_email,
        source,
      } = req.allParams();
      const existingaccount = await Account.findOne({ email });
      sails.log('existingaccount',existingaccount);
      const existinguser = await Users.findOne({ email: primary_contact_email });
      if (existingaccount) {
        existingAccountDatas(existingaccount,res);
      }
      if(existinguser){
        existingUserDatas(source,res);
      }
      else{
        let  userId;
        if(req.user.user_id){
          userId = req.user.user_id;
        }else{
          sails.log(email);
          const defaultuser = await Users.findOne({ email: process.env.DEFAULT_ADMIN_USER });
          userId = defaultuser.user_id;
        }

        let image_data = '';
        copyLogoUrl(company_logo_url,image_data);
        let addData = {
          name,
          phone,
          email,
          address,
          city_id,
          state_id,
          country_id,
          zip,
          source,
          user_exists      : 'No',
          theme            : 'Fresh Saffron',
          company_logo_url : image_data,
          created_by       : userId,
          created_date     : getDateUTC(),
          onboard_status   : ONBOARD_STATUS.completed,
          status           : ACCOUNT_STATUS.payment_pending
        };
        webSiteUrlData(website_url,addData);
        try{
          const stripe_address = stripeAddressData(addData);
          const stripe_country_name = stripeCountryName(country_name);
          const stripe_state_name = stripeStateName(state_name);
          const stripe_city_name = stripeCityName(city_name);
          const postalcode = postalCodeData(addData);

          const customerdata = await stripe.customers.create({
            name    : addData['name'],
            email   : addData['email'],
            phone   : addData['phone'],
            address : {
              line1       : stripe_address,
              postal_code : postalcode,
              city        : stripe_city_name,
              state       : stripe_state_name,
              country     : stripe_country_name
            }
            //payment_method: 'pm_card_visa',
          });
          addData['stripe_customer_id'] = customerdata.id;
          addData['account_guid'] = Uuid.v4();

          const account = await Account.create(addData).fetch();

          const newUser = await Users.create({
            first_name          : primary_contact_first_name,
            last_name           : primary_contact_last_name,
            email               : primary_contact_email,
            phone               : primary_contact_number,
            profile_picture_url : '',
            status              : STATUS.invited,
            created_by          : userId,
            portal_access       : PORTAL_ACCESS.CUSTOMER_PORTAL,
            primary_user        : 'Yes',
            created_date        : getDateUTC()
          }).fetch();
          let DATABASE_NAME = account.name;
          DATABASE_NAME.split(' ').join('_');

          const accountconfiguration = await AccountConfiguration.create({
            account_id      : account.account_id,
            name            : account.name,
            code            : ' ',
            created_date    : getDateUTC(),
            created_by      : userId,
            last_updated_by : userId,
            status          : STATUS.active
          }).fetch();
          let accountconf = [];

          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'System Timezone',
            code                     : 'time_zone',
            value                    : 'UTC – 08:00 Pacific Time',
            default_value            : 'UTC – 08:00 Pacific Time',
            description              : 'Based on the time zone configured here, it would be displayed across the organization',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'System Datetime format',
            code                     : 'date_time_format',
            value                    : 'MM/DD/YYYY HH:MM A',
            default_value            : 'MM/DD/YYYY HH:MM A',
            description              : 'Based on the date format configured here, it would be displayed across the organization',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'System Date format',
            code                     : 'date_format',
            value                    : `MM/DD/YYYY`,
            default_value            : 'MM/DD/YYYY',
            description              : 'Based on the date format configured here, it would be displayed across the organization',
            status                   : ACCOUNT_STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Training master max allowed photo count',
            code                     : 'training_master_photos_count',
            value                    : '10',
            default_value            : '10',
            description              : 'Configure maximum number of photos that you want to upload under trainings. This count will be applicable for each training',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Training master max allowed video count',
            code                     : 'training_master_video_count',
            value                    : '10',
            default_value            : '10',
            description              : 'Configure maximum number of videos that you want to upload under trainings. This count will be applicable for each training',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Points for Positive Performance',
            code                     : 'points_for_positive_performance',
            value                    : '1',
            default_value            : '1',
            description              : 'Configure the daily points value for positive performance',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Daily Point calculation',
            code                     : 'cron_points_calculation',
            value                    : '20:00',
            default_value            : '20:00',
            description              : 'Configure time for points calculation activity',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Deduct Points For Negative Performance',
            code                     : 'deduct_points_for_negative_performance',
            value                    : 'No',
            default_value            : 'No',
            description              : 'Configure the points for negative performance. Based on the point entered here, it would be deducted from total points',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Deduct Points',
            code                     : 'deduct_points',
            value                    : '1',
            default_value            : '1',
            description              : 'Configure the points for negative performance. Based on the point entered here, it would be deducted from total points',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Threshold score for Points Calculation',
            code                     : 'threshold_score_for_points_calculation',
            value                    : 'Good - 40',
            default_value            : 'Good - 40',
            description              : 'This is the minimum level which if user crosses reward an extra point for the day',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Additional Points for Points Calculation',
            code                     : 'additional_points_for_points_calculation',
            value                    : '0',
            default_value            : '0',
            description              : 'Configure extra points for team members exceeding threshold score',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Task Over Due',
            code                     : 'cron_task_overDue',
            value                    : '09:00',
            default_value            : '09:00',
            description              : 'Configure time to trigger notification for overdue tasks',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Cron Certificate Expire',
            code                     : 'cron_certificate_expire',
            value                    : '09:00',
            default_value            : '09:00',
            description              : 'Configure time to trigger certificate expiration notification',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Cron competition completion',
            code                     : 'cron_competiton_completion',
            value                    : '09:00',
            default_value            : '09:00',
            description              : 'Configure time to trigger notification on the day of competition getting completed',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Cron points Notification',
            code                     : 'cron_points_notification',
            value                    : '20:30',
            default_value            : '20:30',
            description              : 'Configure time to trigger team member points & level notification',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Time for cron team member report submission',
            code                     : 'cron_report_submission',
            value                    : '20:00',
            default_value            : '20:00',
            description              : 'Configure the time to generate daily report digest',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Cron to generate certificate report digest',
            code                     : 'cron_certificate_report_submission',
            value                    : '20:00',
            default_value            : '20:00',
            description              : 'Set the time for your monthly certificate report to be sent out. This will be approximate time and will be sent based on response from email services.',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Time for cron announcement',
            code                     : 'cron_announcement',
            value                    : '09:00',
            default_value            : '09:00',
            description              : 'Users will receive notification for announcements on the time configured here',
            status                   : ACCOUNT_STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Automated Task Due Date Days',
            code                     : 'automated_task_due_date_days',
            value                    : '5',
            default_value            : '5',
            description              : 'Automated Task Due Date Days',
            status                   : ACCOUNT_STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Send Notification Mails to Invited Users',
            code                     : 'notification_mail_all_users',
            value                    : '0',
            default_value            : '0',
            description              : 'Send Emails to Invited Users',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Cron for default check-in period',
            code                     : 'cron_checkin',
            value                    : '12:00',
            default_value            : '12:00',
            description              : 'Configure time default check-in period',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Check-in for points calculation',
            code                     : 'checkin_points_calculation',
            value                    : '1',
            default_value            : '1',
            description              : 'Configure if you want to consider team member check-in for points calculation',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Expire Certificate Days Limit',
            code                     : 'expire_certificate_days_limit',
            value                    : '30',
            default_value            : '30',
            description              : 'Set a day\'s limit for which certificate record should be considered as About to expire',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Allow Multiple Check-in',
            code                     : 'allow_multiple_checkin',
            value                    : '1',
            default_value            : '1',
            description              : 'Configure if team member is allowed for multiple check-in',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Notify other users',
            code                     : 'note_notification_roles',
            value                    : '',
            default_value            : '',
            description              : 'Users with selected role should receive notification for specific notes added',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Cron for 360 Feedback Report Submission',
            code                     : 'cron_360feedback_report_submission',
            value                    : '22:00',
            default_value            : '22:00',
            description              : 'Configure the time to generate 360 feedback report digest',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          accountconf.push({
            account_configuration_id : accountconfiguration.account_configuration_id,
            name                     : 'Receive 360 Feedback Report On',
            code                     : 'receive_360feedback_report_on',
            value                    : 'Monday',
            default_value            : 'Monday',
            description              : 'Configure the day to receive 360 feedback report',
            status                   : STATUS.active,
            created_by               : userId,
            last_updated_by          : userId,
            created_date             : getDateUTC()
          });
          await AccountConfigurationDetail.createEach(accountconf).fetch();

          await AccountUserMapping.create({
            account_id      : account.account_id,
            user_id         : newUser.user_id,
            created_by      : userId,
            last_updated_by : userId,
            created_date    : getDateUTC()
          });
          return res.ok({ account_id: account.account_id, userexists: 'No' }, messages.CUSTOMER_REGISTER_SUCCESS, RESPONSE_STATUS.success);
        }catch (err) {
          sails.log.error(err);
          return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
        }

      }
    } else {
      res.ok(undefined, messages.CUSTOMER_REGISTER_FAILURE, RESPONSE_STATUS.error);
    }
  },
  edit: async(req, res) =>{
    try{
      let request = req.allParams();
      const isValidate = await CustomerValidations.Edit.validate(request);
      if (!isValidate.error) {
        const {
          name,
          phone,
          email,
          address,
          city_id,
          state_id,
          country_id,
          city_name,
          state_name,
          country_name,
          zip,
          company_logo_url,
          website_url,
          theme,
          primary_contact_first_name,
          primary_contact_last_name,
          primary_contact_number,
          primary_contact_email
        } = req.allParams();
        const account = await Account.findOne({ account_id: req.params.id });
        const emailexistsaccount = await Account.findOne({ email });
        const is_address_same_as_billing = account.is_address_same_as_billing;
        let userId;
        if (!account) {
          return res.ok(undefined, messages.CUSTOMER_NOT_FOUND, RESPONSE_STATUS.error);
        }
        else{
          if(emailexistsaccount) {
            //check if company email Id already exists
            if (account.account_id !== emailexistsaccount.account_id){
              return res.ok(undefined, messages.COMPANY_ALREADY_EXISTS);
            }
          }
          let sql = `SELECT distinct user.user_id,user.email FROM user 
          INNER JOIN account_user ON account_user.user_id = user.user_id 
          INNER JOIN account ON account_user.account_id = account.account_id 
          WHERE user.primary_user = 'Yes' AND account.account_id = '${req.params.id}' limit 1`;
          const rawResult = await sails.sendNativeQuery(sql);
          let primaryuser =  rawResult.rows && rawResult.rows.length ?  rawResult.rows[0]  : null;

          if(!primaryuser){
            res.ok(isValidate.error, messages.CUSTOMER_EDIT_FAILURE, RESPONSE_STATUS.error);
          }
          if(req.user.user_id){
            userId = req.user.user_id;
          }else{
            const defaultuser = await Users.findOne({ email: process.env.DEFAULT_ADMIN_USER });
            userId = defaultuser.user_id;
          }
          let image_data = '';
          if (company_logo_url) {
            image_data = getImgUrl(company_logo_url, false);
          }
          let updateData = {
            name,
            phone,
            email,
            address,
            city_id,
            state_id,
            country_id,
            zip,
            company_logo_url  : image_data,
            theme,
            last_updated_by   : userId,
            last_updated_date : getDateUTC()
          };
          if(website_url){
            updateData['website_url'] = website_url;
          }

          await Account.update({ account_id: req.params.id }, updateData).fetch();
          if(is_address_same_as_billing === 1) {
            let updateRequest = {};
            if(address !== undefined && address !== null && address !== '') {
              updateRequest.address = address;
            } else {
              updateRequest.address = '';
            }
            if(country_id !== undefined && country_id !== null && country_id !== '') {
              updateRequest.country_id = country_id;
            }
            if(state_id !== undefined && state_id !== null && state_id !== '') {
              updateRequest.state_id = state_id;
            }
            if(city_id !== undefined && city_id !== null && city_id !== '') {
              updateRequest.city_id = city_id;
            }
            if(zip !== undefined && zip !== null && zip !== '') {
              updateRequest.zip = zip;
            }
            updateRequest.last_updated_by = userId;
            updateRequest.last_updated_date = getDateUTC();
            await AccountBilling.update({ account_id: req.params.id },updateRequest).fetch();

            if(account.stripe_customer_id){
              let customerRequest = {};
              customerRequest.name = name;
              customerRequest.email = email;
              customerRequest.phone = phone;
              let addressRequest = {};
              if(address !== undefined && address !== null && address !== '') {
                addressRequest.line1 = address;
              }

              if(zip !== undefined && zip !== null && zip !== '') {
                addressRequest.postal_code = zip;
              }

              if(city_name !== undefined && city_name !== null && city_name !== '') {
                addressRequest.city = city_name;
              }

              if(state_name !== undefined && state_name !== null && state_name !== '') {
                addressRequest.state = state_name;
              }

              if(country_name !== undefined && country_name !== null && country_name !== '') {
                addressRequest.country = country_name;
              }

              if(Object.keys(addressRequest).length > 0) {
                customerRequest.address = addressRequest;
              }
              await stripe.customers.update(account.stripe_customer_id, customerRequest);
            }
          }
          let userexists = account.user_exists;
          //check if primary contact email is updated
          if(primaryuser.email !== primary_contact_email) {
          //check if updated email id exists in account
            let accountUsersql = `SELECT distinct user.user_id,user.email,user.primary_user FROM user 
          INNER JOIN account_user ON account_user.user_id = user.user_id 
          INNER JOIN account ON account_user.account_id = account.account_id 
          WHERE user.email = '${primary_contact_email}' AND account.account_id = '${req.params.id}' limit 1`;
            const accountUserResult = await sails.sendNativeQuery(accountUsersql);
            const existinguser = accountUserResult.rows[0] || null;

            if(existinguser){
              await Users.update({ user_id: existinguser.user_id },{
                first_name          : primary_contact_first_name,
                last_name           : primary_contact_last_name,
                email               : primary_contact_email,
                phone               : primary_contact_number,
                profile_picture_url : '',
                portal_access       : PORTAL_ACCESS.CUSTOMER_PORTAL,
                primary_user        : 'Yes',
                last_updated_by     : userId,
                last_updated_date   : getDateUTC()
              }).fetch();
              //unset existing primary user
              await Users.update({ user_id: primaryuser.user_id },{
                primary_user: 'No'
              }).fetch();

              userexists = 'Yes';
              await Account.update({ account_id: account.account_id }, {user_exists: userexists}).fetch();
              //send notification to existing user
              if(account.status === ACCOUNT_STATUS.active){
                await sendNotification(req, {
                  notification_entity  : NOTIFICATION_ENTITIES.NOTIFICATION_CUSTOMER,
                  recipient_email      : primary_contact_email,
                  recipient_first_name : primary_contact_first_name,
                  recipient_last_name  : primary_contact_last_name,
                  receipient_user_id   : existinguser.user_id
                });
              }

            }else {
              //check if user exists with new email address
              const newuserexists = await Users.findOne({ email: primary_contact_email });
              if(newuserexists){
                return res.ok(undefined, messages.CUSTOMER_USER_ALREADY_EXISTS);
              }
              //New user added
              const newUser = await Users.create({
                first_name          : primary_contact_first_name,
                last_name           : primary_contact_last_name,
                email               : primary_contact_email,
                phone               : primary_contact_number,
                profile_picture_url : '',
                status              : STATUS.invited,
                created_by          : userId,
                portal_access       : PORTAL_ACCESS.CUSTOMER_PORTAL,
                primary_user        : 'Yes',
                created_date        : getDateUTC()
              }).fetch();
              await AccountUserMapping.create({
                account_id      : account.account_id,
                user_id         : newUser.user_id,
                created_by      : userId,
                last_updated_by : userId,
                created_date    : getDateUTC()
              });
              //unset existing primary user
              await Users.update({ user_id: primaryuser.user_id },{
                primary_user: 'No'
              }).fetch();

              userexists = 'No';
              await Account.update({ account_id: account.account_id }, {user_exists: userexists}).fetch();
              if(account.status === ACCOUNT_STATUS.active){
                const token = generateToken({ id: newUser.user_id, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, process.env.JWT_CREATE_PASS_EXPIRY);
                const createUrl = `${process.env.FRONTEND_BASEURL}/create-password?token=${token}`;
                await Users.update({ user_id: newUser.user_id }, {
                  reset_password_token: token,
                });
                await sendNotification(req, {
                  notification_entity  : NOTIFICATION_ENTITIES.CREATE_PASSWORD_CUSTOMER,
                  recipient_email      : newUser.email,
                  recipient_first_name : newUser.first_name,
                  recipient_last_name  : newUser.last_name,
                  receipient_user_id   : newUser.user_id,
                  url                  : createUrl,
                });
              }
            }
          } else {
            userexists = account.user_exists;
            await Users.update({ user_id: primaryuser.user_id },{
              first_name          : primary_contact_first_name,
              last_name           : primary_contact_last_name,
              email               : primary_contact_email,
              phone               : primary_contact_number,
              profile_picture_url : '',
              last_updated_by     : userId,
              last_updated_date   : getDateUTC()
            }).fetch();
          }
          return res.ok({ account_id: account.account_id, userexists: userexists }, messages.CUSTOMER_EDIT_SUCCESS, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(undefined, messages.CUSTOMER_EDIT_FAILURE, RESPONSE_STATUS.error);
      }
    }catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  imageUpload: async function (req, res) {
    const upload = req.file('image');
    let fileUID;
    if (upload._files[0]) {
      const fileData = upload._files[0].stream;
      const allowedTypes = messages.ALLOWED_IMAGES;
      if (allowedTypes.indexOf(fileData.headers['content-type']) === -1) {
        return res.ok(undefined, messages.INVALID_FILE_TYPE, RESPONSE_STATUS.error);
      }
      fileUID = await uploadDocument(upload);
      const result = { 'imageName': fileUID };
      return res.ok(result, messages.SUCCESS_UPLOAD, RESPONSE_STATUS.success);
    }
    else {
      clearTimeout(upload.timeouts.untilMaxBufferTimer);
      clearTimeout(upload.timeouts.untilFirstFileTimer);
      return res.ok(undefined, messages.UPLOAD_FAILURE, RESPONSE_STATUS.success);
    }
  },
  find: async(req, res) =>{
    try {
      const account_id = req.params.id;
      const results = await getCustomerDetails(req, account_id);

      if(results)
      {
        return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);

      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  getAccountDetails: async (req, res) =>{
    try{
      const account_id = req.params.id;
      const rawResult = await sails.sendNativeQuery(`Select acd.account_configuration_id, acd.name, acd.code, acd.value, acd.default_value, acd.description, acd.status  from account_configuration as ac join account_configuration_detail as acd 
      on ac.account_configuration_id = acd.account_configuration_id where ac.account_id = ${account_id}`);
      const accountDetails = rawResult.rows;

      const rawResult1 = await sails.sendNativeQuery(`SELECT azure_product_id, azure_product_sid, azure_primary_api_key, azure_secondary_api_key FROM account WHERE account_id = ${account_id}`);
      const accountData =  rawResult1.rows[0] || null;
      accountDetails.push({
        account_configuration_id : '',
        name                     : 'Subscription Key',
        code                     : 'subscription_key',
        value                    : accountData.azure_primary_api_key,
        default_value            : accountData.azure_primary_api_key,
        description              : 'Allows user to view authentication key.',
        status                   : ACCOUNT_STATUS.active
      });

      if(accountDetails)
      {
        return res.ok(accountDetails, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(err){
      sails.log(err);
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
    }
  },

  getTimeZone: async (_req, res) =>{
    try{
      const timeZoneDetails = await TimeZone.find({status: ACCOUNT_STATUS.active});
      if(timeZoneDetails)
      {
        const results = await timeZoneDetails.map((item)=>({
          time_zone_id : item.time_zone_id,
          name         : item.name,
          display_name : item.display_name
        }));
        return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(err){
      sails.log(err);
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
    }
  },

  updateAccountDetails: async(req, res) =>{
    try{
      let request = req.allParams();
      const isValidate = await CustomerValidations.updateAccount.validate(request);
      if (!isValidate.error) {
        const account_configuration_id = req.params.id;
        const { time_zone, date_format, time_format, deduct_points, training_master_photos_count, training_master_video_count, cron_points_calculation, deduct_points_for_negative_performance, threshold_score_for_points_calculation, additional_points_for_points_calculation, cron_task_overDue, cron_certificate_expire, cron_points_notification, cron_competiton_completion, cron_report_submission,cron_announcement,cron_announcement_on, points_for_positive_performance, automated_task_due_date_days, notification_mail_all_users, cron_certificate_report_submission, cron_checkin, checkin_points_calculation, allow_multiple_checkin, note_notification_roles, cron_360feedback_report_submission, receive_360feedback_report_on, expire_certificate_days_limit } = req.allParams();
        let accountconf = [];
        const userId = req.user.user_id;
        let date_time_format = `${date_format} ${time_format}`;
        let confArr = [];

        let updateConfigDetails = [
          {
            code       : 'time_zone',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'System Timezone',
              code                     : 'time_zone',
              value                    : time_zone,
              default_value            : 'UTC – 08:00 Pacific Time',
              description              : 'Based on the time zone configured here, it would be displayed across the organization',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'date_time_format',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'System Datetime format',
              code                     : 'date_time_format',
              value                    : `${date_format} ${time_format}`,
              default_value            : 'MM/DD/YYYY HH:MM',
              description              : 'Based on the date format configured here, it would be displayed across the organization',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'date_format',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'System Date format',
              code                     : 'date_format',
              value                    : `${date_format}`,
              default_value            : 'MM/DD/YYYY',
              description              : 'Based on the date format configured here, it would be displayed across the organization',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'training_master_photos_count',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Training master max allowed photo count',
              code                     : 'training_master_photos_count',
              value                    : training_master_photos_count,
              default_value            : '10',
              description              : 'Configure maximum number of photos that you want to upload under trainings. This count will be applicable for each training',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'training_master_video_count',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Training master max allowed video count',
              code                     : 'training_master_video_count',
              value                    : training_master_video_count,
              default_value            : '10',
              description              : 'Configure maximum number of videos that you want to upload under trainings. This count will be applicable for each training',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'points_for_positive_performance',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Points for Positive Performance',
              code                     : 'points_for_positive_performance',
              value                    : points_for_positive_performance,
              default_value            : '1',
              description              : 'Configure the daily points value for positive performance',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_points_calculation',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Daily Point calculation',
              code                     : 'cron_points_calculation',
              value                    : cron_points_calculation,
              default_value            : '23:30',
              description              : 'Configure time for points calculation activity',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'deduct_points_for_negative_performance',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Deduct Points For Negative Performance',
              code                     : 'deduct_points_for_negative_performance',
              value                    : deduct_points_for_negative_performance,
              default_value            : 'No',
              description              : 'Configure the points for negative performance. Based on the point entered here, it would be deducted from total points',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'deduct_points',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Deduct Points',
              code                     : 'deduct_points',
              value                    : deduct_points,
              default_value            : deduct_points,
              description              : 'Configure the points for negative performance. Based on the point entered here, it would be deducted from total points',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'threshold_score_for_points_calculation',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Threshold score for Points Calculation',
              code                     : 'threshold_score_for_points_calculation',
              value                    : threshold_score_for_points_calculation,
              default_value            : threshold_score_for_points_calculation,
              description              : 'This is the minimum level which if user crosses reward an extra point for the day',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'additional_points_for_points_calculation',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Additional Points for Points Calculation',
              code                     : 'additional_points_for_points_calculation',
              value                    : additional_points_for_points_calculation,
              default_value            : '',
              description              : 'Configure extra points for team members exceeding threshold score',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_task_overDue',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Task Over Due',
              code                     : 'cron_task_overDue',
              value                    : cron_task_overDue,
              default_value            : '09:00',
              description              : 'Configure time to trigger notification for overdue tasks',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_certificate_expire',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Cron Certificate Expire',
              code                     : 'cron_certificate_expire',
              value                    : cron_certificate_expire,
              default_value            : '09:00',
              description              : 'Configure time to trigger certificate expiration notification',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_competiton_completion',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Cron competition completion',
              code                     : 'cron_competiton_completion',
              value                    : cron_competiton_completion,
              default_value            : '09:00',
              description              : 'Configure time to trigger notification on the day of competition getting completed',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_points_notification',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Cron points Notification',
              code                     : 'cron_points_notification',
              value                    : cron_points_notification,
              default_value            : '09:00',
              description              : 'Configure time to trigger team member points & level notification',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_report_submission',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Time for cron team member report submission',
              code                     : 'cron_report_submission',
              value                    : cron_report_submission,
              default_value            : '23:30',
              description              : 'Configure the time to generate daily report digest',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_announcement',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Time for cron announcement',
              code                     : 'cron_announcement',
              value                    : cron_announcement,
              default_value            : '09:00',
              description              : 'Users will receive notification for announcements on the time configured here',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_announcement_on',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Day for cron announcement',
              code                     : 'cron_announcement_on',
              value                    : cron_announcement_on,
              default_value            : 'Monday',
              description              : 'Users will receive notification for announcements on the day configured here',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'notification_mail_all_users',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Send Notification Mails to Invited Users',
              code                     : 'notification_mail_all_users',
              value                    : notification_mail_all_users,
              default_value            : '0',
              description              : 'Send Emails to Invited Users',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'automated_task_due_date_days',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Automated Task Due Date Days',
              code                     : 'automated_task_due_date_days',
              value                    : automated_task_due_date_days,
              default_value            : '5',
              description              : 'Automated Task Due Date Days',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_certificate_report_submission',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Cron to generate certificate report digest',
              code                     : 'cron_certificate_report_submission',
              value                    : cron_certificate_report_submission,
              default_value            : '20:00',
              description              : 'Set the time for your monthly certificate report to be sent out. This will be approximate time and will be sent based on response from email services.',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_checkin',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Cron for default check-in period',
              code                     : 'cron_checkin',
              value                    : cron_checkin,
              default_value            : '12:00',
              description              : 'Configure time default check-in period',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'checkin_points_calculation',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Check-in for points calculation',
              code                     : 'checkin_points_calculation',
              value                    : checkin_points_calculation,
              default_value            : '1',
              description              : 'Configure if you want to consider team member check-in for points calculation',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'expire_certificate_days_limit',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Expire Certificate Days Limit',
              code                     : 'expire_certificate_days_limit',
              value                    : expire_certificate_days_limit,
              default_value            : '30',
              description              : 'Set a day\'s limit for which certificate record should be considered as About to expire',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'allow_multiple_checkin',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Allow Multiple Check-in',
              code                     : 'allow_multiple_checkin',
              value                    : allow_multiple_checkin,
              default_value            : '1',
              description              : 'Configure if team member is allowed for multiple check-in',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'note_notification_roles',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Notify other users',
              code                     : 'note_notification_roles',
              value                    : note_notification_roles,
              default_value            : '',
              description              : 'Users with selected role should receive notification for specific notes added',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'cron_360feedback_report_submission',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Cron for 360 Feedback Report Submission',
              code                     : 'cron_360feedback_report_submission',
              value                    : cron_360feedback_report_submission,
              default_value            : '22:00',
              description              : 'Configure the time to generate 360 feedback report digest',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
          {
            code       : 'receive_360feedback_report_on',
            createItem : {
              account_configuration_id : account_configuration_id,
              name                     : 'Receive 360 Feedback Report On',
              code                     : 'receive_360feedback_report_on',
              value                    : receive_360feedback_report_on,
              default_value            : 'Monday',
              description              : 'Configure the day to receive 360 feedback report',
              status                   : ACCOUNT_STATUS.active,
              created_by               : userId,
              last_updated_by          : userId,
              created_date             : getDateUTC()
            }
          },
        ];
        let confingDetails = await AccountConfigurationDetail.find({
          account_configuration_id : account_configuration_id,
          code                     : {'!=': 'tenant_db_connection_string'}
        });
        if(confingDetails && confingDetails.length > 0){
          let updatedConfigIds = [];
          let notInPayloadConfig = [];
          updateConfigDetails.map(async(item) => {
            let handleConfingDetailUpdateResults = await handleConfingDetailUpdate(account_configuration_id, confingDetails, item.code, item.createItem, confArr, updatedConfigIds);
            confArr = handleConfingDetailUpdateResults[0];
            updatedConfigIds = handleConfingDetailUpdateResults[1];
          });

          notInPayloadConfig = confingDetails.filter((item) => !updatedConfigIds.includes(item.account_configuration_detail_id));
          sails.log('notInPayloadConfig', notInPayloadConfig);
          notInPayloadConfig.map(async(confItm) => {
            await AccountConfigurationDetail.destroy({
              account_configuration_detail_id: confItm.account_configuration_detail_id
            });
          });
          if(confArr.length > 0){
            confArr.map((item) => {
              let createItemObj = item;
              if(createItemObj.value !== undefined){
                if(createItemObj.code === 'deduct_points'){
                  if((deduct_points_for_negative_performance === true) || (deduct_points_for_negative_performance === 'Yes')){
                    accountconf.push(createItemObj);
                  }
                }else{
                  accountconf.push(createItemObj);
                }
              }
            });
          }
        }else{
          updateConfigDetails.map((item) => {
            let createItemObj = item.createItem;
            if(createItemObj.value !== undefined){
              if(item.code === 'deduct_points'){
                if((deduct_points_for_negative_performance === true) || (deduct_points_for_negative_performance === 'Yes')){
                  accountconf.push(createItemObj);
                }
              }else{
                accountconf.push(createItemObj);
              }
            }
          });
        }
        if(accountconf.length > 0)
        {
          await AccountConfigurationDetail.createEach(accountconf);
        }
        const accountDetails = await sails.sendNativeQuery(`Select account.account_guid, account.account_id from account_configuration ac join account on ac.account_id= account.account_id where ac.account_configuration_id = ${account_configuration_id}`);
        const resultAccount = accountDetails.rows;
        const getKey = `${resultAccount[0].account_guid}_${MASTERINFO_STATUS.account}`;
        let accountKeyExists = await keyExists(getKey);
        let oldconf = await getCache(getKey);
        if(accountKeyExists === 1)
        {
          await deleteCache(getKey);
        }
        const sqlAccount = `Select distinct account.account_id, account_guid, account.name, address, onboard_status, account.status, 
              ac.account_configuration_id,  asb.payment_status as payment_status,
              (select GROUP_CONCAT(acgd.code SEPARATOR ",") FROM account_configuration_detail acgd 
              WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_code,
              (select GROUP_CONCAT(acgd.value SEPARATOR ",") FROM account_configuration_detail acgd 
              WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_value
              from account 
              INNER JOIN account_configuration ac ON account.account_id = ac.account_id 
              INNER JOIN account_subscription asb ON account.account_id = asb.account_id  
              where account.account_id = ${resultAccount[0].account_id}`;
        const rawAccount = await sails.sendNativeQuery(sqlAccount);
        let results = rawAccount.rows[0];
        let accountTimezone;
        let accountDateTime;
        let accountDate;
        const dataAccount = {
          'key'   : `${results.account_guid}_${MASTERINFO_STATUS.account}`,
          'value' : results
        };
        await setCache(dataAccount);

        let account_code = []; let account_value = [];

        if(oldconf.data.account_code !== null){
          account_code = (oldconf.data.account_code).split(',');
        }
        if(oldconf.data.account_value !== null){
          account_value = (oldconf.data.account_value).split(',');
        }
        if((account_code.length > 0) && (account_value.length > 0))
        {
          for(const item in account_code){
            if((account_code[item]) === ACCOUNT_CONFIG_CODE.time_zone)
            {
              accountTimezone = account_value[item];
            }
            if((account_code[item]) === ACCOUNT_CONFIG_CODE.date_time_format)
            {
              accountDateTime = account_value[item];
            }
            if((account_code[item]) === ACCOUNT_CONFIG_CODE.date_format)
            {
              accountDate = account_value[item];
            }
          }
          if(!accountTimezone)
          {
            accountTimezone = process.env.ACCOUNT_TIMEZONE;
          }
          if(!accountDateTime)
          {
            accountDateTime = process.env.ACCOUNT_DATETIMEFORMAT;
          }
          if(!accountDate)
          {
            accountDate = process.env.ACCOUNT_DATEFORMAT;
          }
        }

        if(accountTimezone !== time_zone || accountDateTime !== date_time_format || accountDate !== date_format ){
          sails.log('Format Changes');
          let device_tokens = `
            SELECT
              user_login_log.login_date_time, user_login_log.user_id, user_login_log.device_id,account_user.account_id 
            FROM user_login_log
            INNER JOIN
              (SELECT MAX(user_login_log.login_date_time) as max_login_date_time, user_id, device_id 
              FROM user_login_log
              where thru_mobile = 1 
              GROUP BY user_login_log.user_id ) tbl
            ON 
              user_login_log.login_date_time = tbl.max_login_date_time 
              AND user_login_log.user_id = tbl.user_id 
            INNER JOIN account_user
            ON 
              account_user.user_id = user_login_log.user_id
            where account_user.account_id = $1`;

          const rawResult = await sails.sendNativeQuery(`${device_tokens};`,[resultAccount[0].account_id]);
          results = rawResult.rows;
          sails.log('Format Changes here',results);

          await sendCustomerNotification(null,{ notification_entity: NOTIFICATION_ENTITIES.TRIGGER_ACCOUNT_CONF, tokens: results.map(item => item.device_id) });

        }else{
          sails.log('no changes found');
        }

        return res.ok(undefined, messages.UPDATE_ACCOUNT_CONFIG_DETAILS, RESPONSE_STATUS.success);
      }
      else{
        res.ok(isValidate.error, messages.SERVER_ERROR, RESPONSE_STATUS.error);
      }
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.SERVER_ERROR , RESPONSE_STATUS.error);
    }
  },
  paymentFailedNotificationCron    : triggerpaymentFailedNotificationCron,
  triggerpaymentFailedNotification : async (_req, res) => {
    let curentTimeUTC = getDateUTC();
    await triggerpaymentFailedNotificationCron(curentTimeUTC,_req);
    return res.ok(
      undefined,
      'payment failed notification Cron Triggered Successfully',
      RESPONSE_STATUS.success
    );
  }
};
