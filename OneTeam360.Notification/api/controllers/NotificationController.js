const { RESPONSE_STATUS, NOTIFICATION_ENTITIES, ACCOUNT_STATUS, NOTIFICATION_TYPE} = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const { createPassword, resetPassword, addNote, assignTask, completedTask, completedGroupTask, taskOverdueReminder, assignTask_SMS, welcome_SMS, addNote_PushNoti, assignTask_PushNoti, crtAboutToExpireReminder, crtAboutToExpireReminder_PushNoti, completedTask_PushNoti, completedGroupTask_PushNoti, taskOverdueReminder_PushNoti, employeePointUpdate_PushNoti, employeeLevelUpdate_PushNoti,employeefeedbackPointUpdate_PushNoti,employeefeedbackPointUpdate_InApp, employeeLevelUpdate, addCompetition_PushNoti, endCompetition_PushNoti, completeAllImport, completePartialImport, NotcompleteImport, employeeReportSubmission, assignTask_InApp, completedTask_InApp, completedGroupTask_InApp, modifyTask_PushNoti, modifyTask_InApp, deleteTask_PushNoti, deleteTask_InApp, addCompetition_InApp, addCompetition, addCompetitionToday_PushNoti, certificateReject_PushNoti, certificateApprove_InApp, certificateApprove_PushNoti,customAnnouncement_PushNoti, certificateReject_InApp, addNote_InApp, taskOverdueReminder_InApp, employeeLevelUpdate_InApp, employeePointUpdate_InApp, crtAboutToExpireReminder_InApp, startCompetition_InApp, endCompetition_InApp, customAnnouncement, customAnnouncement_InApp, certificateAutoAssign, certificateAutoAssign_PushNoti, certificateAutoAssign_InApp, receiveCertificateReportDigest,checkInRequest_PushNoti,checkInRequest_InApp,noteAdded,anniversaryAnnouncement,anniversaryAnnouncement_InApp,anniversaryAnnouncement_PushNoti,onboardAnnouncement,onboardAnnouncement_InApp,onboardAnnouncement_PushNoti,birthdayAnnouncement_PushNoti,birthdayAnnouncement,birthdayAnnouncement_InApp,birthdayAnnouncement_SMS,anniversaryAnnouncement_SMS,onboardAnnouncement_SMS, feedBackReportDigest, customAnnouncement_SMS} = require('../utils/notifications');
const { tenantConnection } = require('../services/utils');
const { getDateUTC, getDateTimeSpecificTimeZone } = require('../utils/common/getDateTime');
const { sendPushNotification } = require('../services/sendPushNotification');
const { createCertificateReport } =require('../services/createCertificateReport');
const NotificationValidations = require('../validations/NotificationValidations');
const sendCheckInStatusNoti_pushNoti = require('../utils/notifications/PushNotification/sendCheckInStatusNoti_pushNoti');
const sendCheckInStatusNoti_InApp = require('../utils/notifications/InApp/sendCheckInStatusNoti_InApp');

module.exports = {
  send: async (req,res) => {
    try{
      let request = req.allParams();
      let { notification_entity, account_id } = request;
      if(NOTIFICATION_ENTITIES.TRIGGER_PERMISSION_NOTI === notification_entity){
        let { tokens } = req.allParams();
        let to_device_id = tokens;
        let title = 'Permission Updated!';
        let body = 'The application configuration is updated by administrator. You will now be redirected to the dashboard to update the app configuration.';
        let payload = {
          notification: {
            title : title,
            body  : body,
          },
          data: {
            title        : title,
            body         : body,
            entity_type  : NOTIFICATION_ENTITIES.TRIGGER_PERMISSION_NOTI,
            entity_id    : '',
            click_action : 'FLUTTER_NOTIFICATION_CLICK' // Added this key for Mobile team requirement for Push Notification
          }
        };
        sails.log('TOKENS',tokens,to_device_id);
        if(to_device_id && to_device_id.length > 0){
          await sendPushNotification(payload,to_device_id);
        }
        return res.ok(undefined,'Notification Triggered for Push Notification update',RESPONSE_STATUS.success);
      }else if(NOTIFICATION_ENTITIES.TRIGGER_ACCOUNT_CONF === notification_entity){
        let { tokens } = req.allParams();
        let to_device_id = tokens;
        let title = 'Account dateformat Updated!';
        let body = 'The application configuration is updated by administrator. You will now be redirected to the dashboard to update the app configuration.';
        let payload = {
          notification: {
            title : title,
            body  : body,
          },
          data: {
            title        : title,
            body         : body,
            entity_type  : NOTIFICATION_ENTITIES.TRIGGER_ACCOUNT_CONF,
            entity_id    : '',
            click_action : 'FLUTTER_NOTIFICATION_CLICK' // Added this key for Mobile team requirement for Push Notification
          }
        };
        sails.log('TOKENS',tokens,to_device_id);
        if(to_device_id && to_device_id.length > 0){
          await sendPushNotification(payload,to_device_id);
        }
        return res.ok(undefined,'Notification Triggered for Push Notification update',RESPONSE_STATUS.success);
      }
      let account = await Account.findOne({ account_id });

      let connection = await tenantConnection(account_id);

      req.dynamic_connection = connection.connection;
      req.account = account;
      let template = await NotificationTemplate.findOne({ code: notification_entity, status: ACCOUNT_STATUS.active, notification_type: NOTIFICATION_TYPE.EMAIL }).usingConnection(req.dynamic_connection);
      let templateSMS = await NotificationTemplate.findOne({ code: notification_entity, status: ACCOUNT_STATUS.active, notification_type: NOTIFICATION_TYPE.SMS }).usingConnection(req.dynamic_connection);
      let templatePushNoti = await NotificationTemplate.findOne({ code: notification_entity, status: ACCOUNT_STATUS.active, notification_type: NOTIFICATION_TYPE.MOBILE }).usingConnection(req.dynamic_connection);
      let templateInApp = await NotificationTemplate.findOne({ code: notification_entity, status: ACCOUNT_STATUS.active, notification_type: NOTIFICATION_TYPE.InApp }).usingConnection(req.dynamic_connection);

      if(process.env.NODE_ENV === 'local'){ sails.log('You are on local environment');
        return res.ok(undefined,'You are on local environment',RESPONSE_STATUS.success);
      }
      if(template || templateSMS || templatePushNoti || templateInApp){
        switch(notification_entity){
          case NOTIFICATION_ENTITIES.COMPLETE_ALL_IMPORT:
            await completeAllImport(template,req,res);
            break;
          case NOTIFICATION_ENTITIES.COMPLETE_PARTIAL_IMPORT:
            await completePartialImport(template,req,res);
            break;
          case NOTIFICATION_ENTITIES.NOT_COMPLETE_IMPORT:
            await NotcompleteImport(template,req,res);
            break;
          case NOTIFICATION_ENTITIES.CREATE_PASSWORD:
            await createPassword(template,req,res);
            await welcome_SMS(templateSMS,req,res);
            break;
          case NOTIFICATION_ENTITIES.RESET_PASSWORD:
            await resetPassword(template,req,res);
            break;
          case NOTIFICATION_ENTITIES.ADD_NOTE:
            await addNote(template,req,res);
            await addNote_PushNoti(templatePushNoti,req,res);
            await addNote_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.ADD_NOTE_NOTIFY_MANAGER:
            await noteAdded(template,req,res);
            break;
          case NOTIFICATION_ENTITIES.TASK_ASSIGNED:
            await assignTask(template,req,res);
            await assignTask_PushNoti(templatePushNoti,req,res);
            await assignTask_SMS(templateSMS,req,res);
            await assignTask_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.TASK_MODIFICATION:
            await modifyTask_PushNoti(templatePushNoti,req,res);
            await modifyTask_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.TASK_DELETION:
            await deleteTask_PushNoti(templatePushNoti, req, res);
            await deleteTask_InApp(templateInApp, req, res);
            break;
          case NOTIFICATION_ENTITIES.TASK_COMPLETED:
            await completedTask(template,req,res);
            await completedTask_PushNoti(templatePushNoti,req,res);
            await completedTask_InApp(templateInApp, req,res);
            break;
          case NOTIFICATION_ENTITIES.GROUP_TASK_COMPLETED:
            await completedGroupTask(template,req,res);
            await completedGroupTask_PushNoti(templatePushNoti,req,res);
            await completedGroupTask_InApp(templateInApp, req,res);
            break;
          case NOTIFICATION_ENTITIES.TASK_OVERDUE_REMINDER:
            await taskOverdueReminder(template,req,res);
            await taskOverdueReminder_PushNoti(templatePushNoti,req,res);
            await taskOverdueReminder_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.CRT_ABOUT_TO_EXPIRE:
            await crtAboutToExpireReminder(template,req,res);
            await crtAboutToExpireReminder_PushNoti(templatePushNoti,req,res);
            await crtAboutToExpireReminder_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.EMPLOYEE_POINTS_UPDATE:
            await employeePointUpdate_PushNoti(templatePushNoti,req,res);
            await employeePointUpdate_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.POINT_CALCULATION_FEEDBACK:
            await employeefeedbackPointUpdate_PushNoti(templatePushNoti,req,res);
            await employeefeedbackPointUpdate_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.EMPLOYEE_LEVEL_UPDATE:
            await employeeLevelUpdate(template,req,res);
            await employeeLevelUpdate_PushNoti(templatePushNoti,req,res);
            await employeeLevelUpdate_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.COMPETITION_START:
            await addCompetition_PushNoti(templatePushNoti,req,res);
            await startCompetition_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.COMPETITION_START_TODAY:
            await addCompetition(template,req,res);
            await addCompetitionToday_PushNoti(templatePushNoti,req,res);
            await addCompetition_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.COMPETITION_END:
            await endCompetition_PushNoti(templatePushNoti,req,res);
            await endCompetition_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.EMPLOYEE_REPORT_SUBMISSION:
            await employeeReportSubmission(template,req,res);
            break;
          case NOTIFICATION_ENTITIES.CERTIFICATE_REJECTED:
            await certificateReject_PushNoti(templatePushNoti, req, res);
            await certificateReject_InApp(templateInApp, req, res);
            break;
          case NOTIFICATION_ENTITIES.CERTIFICATE_APPROVED:
            await certificateApprove_PushNoti(templatePushNoti, req, res);
            await certificateApprove_InApp(templateInApp, req, res);
            break;
          case NOTIFICATION_ENTITIES.CUSTOM_ANNOUNCEMENT:
            await customAnnouncement(template, req, res);
            await customAnnouncement_PushNoti(templatePushNoti, req, res);
            await customAnnouncement_InApp(templateInApp, req, res);
            await customAnnouncement_SMS(templateSMS, req, res);
            break;
          case NOTIFICATION_ENTITIES.CERTIFICATE_AUTO_ASSIGN:
            await certificateAutoAssign(template, req, res);
            await certificateAutoAssign_PushNoti(templatePushNoti, req, res);
            await certificateAutoAssign_InApp(templateInApp, req, res);
            break;
          case NOTIFICATION_ENTITIES.CERTIFICATE_AUTO_JOB_ASSIGN:
            {   await certificateAutoAssign(template, req, res);
              await certificateAutoAssign_PushNoti(templatePushNoti, req, res);
              await certificateAutoAssign_InApp(templateInApp, req, res);}
            break;
          case NOTIFICATION_ENTITIES.CHECKIN_REQUEST:
            await checkInRequest_PushNoti(templatePushNoti, req, res);
            await checkInRequest_InApp(templateInApp, req, res);
            break;
          case NOTIFICATION_ENTITIES.CERTIFICATE_REPORT_DIGEST:
            const attachment = await createCertificateReport(req,res);
            await receiveCertificateReportDigest(template,attachment,req,res);
            break;
          case NOTIFICATION_ENTITIES.REJECT_CHECKIN_REQUEST:
          case NOTIFICATION_ENTITIES.ACCEPT_CHECKIN_REQUEST:
            await sendCheckInStatusNoti_pushNoti(templatePushNoti,req,res);
            await sendCheckInStatusNoti_InApp(templateInApp,req,res);
            break;
          case NOTIFICATION_ENTITIES.BIRTHDAY_ANNOUNCEMENT:
            await birthdayAnnouncement(template, req, res);
            await birthdayAnnouncement_InApp(templateInApp, req, res);
            await birthdayAnnouncement_PushNoti(templatePushNoti, req, res);
            await birthdayAnnouncement_SMS(templateSMS, req, res);
            break;
          case NOTIFICATION_ENTITIES.WORK_ANNIV_ANNOUNCEMENT:
            await anniversaryAnnouncement(template, req, res);
            await anniversaryAnnouncement_InApp(templateInApp, req, res);
            await anniversaryAnnouncement_PushNoti(templatePushNoti, req, res);
            await anniversaryAnnouncement_SMS(templateSMS, req, res);
            break;
          case NOTIFICATION_ENTITIES.WORK_ONBOARD_ANNOUNCEMENT:
            await onboardAnnouncement(template, req, res);
            await onboardAnnouncement_InApp(templateInApp, req, res);
            await onboardAnnouncement_PushNoti(templatePushNoti, req, res);
            await onboardAnnouncement_SMS(templateSMS, req, res);
            break;
          case NOTIFICATION_ENTITIES.FEEDBACK_REPORT_DIGEST:
            await feedBackReportDigest(template,req,res);
            break;
          default : return res.ok(undefined,messages.NOTI_ENTITY_NOT_FOUND,RESPONSE_STATUS.error);
        }
        return res.ok(undefined,'Mail added to Queue',RESPONSE_STATUS.success);
      }else{
        return res.ok(undefined,'No Template Found',RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,'Error in Sending Notification',RESPONSE_STATUS.error);
    }
  },
  find: async(req,res) => {
    try{
      let sql = `Select notification_queue.notification_queue_id ,
            notification_subject, notification_body, entity_type, entity_id, notification_queue.sent_date,
            read_date from notification_queue 
              INNER JOIN notification_queue_recipient
                ON notification_queue_recipient.notification_queue_id = notification_queue.notification_queue_id
              where notification_queue.notification_type = $1 AND notification_queue_recipient.employee_profile_id = $2;`;

      const rawResult = await sails.sendNativeQuery(`${sql};`, ['InApp',req.empProfile.employee_profile_id]).usingConnection(req.dynamic_connection);
      let results = rawResult.rows;
      return res.ok(results,'Notifications List',RESPONSE_STATUS.success);
    }catch(error){
      sails.log(error);
      return res.ok(undefined,'Error in Getting Notification List',RESPONSE_STATUS.error);
    }
  },
  read: async(req,res) => {
    try{
      let sql = `Select notification_queue.notification_queue_id ,
            notification_subject, notification_body, entity_type, entity_id, notification_queue.sent_date,
            read_date from notification_queue 
              INNER JOIN notification_queue_recipient
                ON notification_queue_recipient.notification_queue_id = notification_queue.notification_queue_id
              where notification_queue.notification_type = $1 AND notification_queue_recipient.employee_profile_id = $2;`;

      const rawResult = await sails.sendNativeQuery(`${sql};`, ['InApp',req.empProfile.employee_profile_id]).usingConnection(req.dynamic_connection);
      return res.ok( rawResult.rows,'Notifications List',RESPONSE_STATUS.success);
    }catch(error){
      sails.log(error);
      return res.ok(undefined,'Error in Getting Notification List',RESPONSE_STATUS.error);
    }
  },

  findAll: async(req,res) => {
    try{
      const {perPage, offset} = req.allParams();
      let  skip=0;
      if(offset >= 1){
        skip = offset - 1;
      }
      let sql = `Select notification_queue.notification_queue_id, notification_queue_recipient.notification_queue_recipient_id,
            notification_subject, notification_body, entity_type, entity_id, notification_queue.sent_date,
            read_date, notification_queue.created_date, notification_queue_recipient.new_notification_flag from notification_queue 
              INNER JOIN notification_queue_recipient
                ON notification_queue_recipient.notification_queue_id = notification_queue.notification_queue_id
              where notification_queue.notification_type = $1 AND notification_queue_recipient.employee_profile_id = $2 and notification_queue_recipient.status = 'Active' Order by notification_queue.created_date DESC `;
      if(skip !== undefined && perPage !== undefined){
        sql += ` LIMIT $3 OFFSET $4 `;
      }
      const rawResult = await sails.sendNativeQuery(`${sql};`, [ 'InApp', req.empProfile.employee_profile_id, perPage, skip]).usingConnection(req.dynamic_connection);
      let results = rawResult.rows;

      const countQuery = sql.split('LIMIT ');
      const countRawResult = await sails.sendNativeQuery(`${countQuery[0]};`, [ 'InApp', req.empProfile.employee_profile_id, perPage, skip]).usingConnection(req.dynamic_connection);
      let count = countRawResult.rows;
      if(results.length > 0)
      {
        const notificationList = results.map(item => {
          return {
            notification_queue_id           : item.notification_queue_id,
            notification_queue_recipient_id : item.notification_queue_recipient_id,
            entity_id                       : item.entity_id,
            entity_type                     : item.entity_type,
            notification_subject            : item.notification_subject,
            notification_body               : item.notification_body,
            sent_date                       : (item.sent_date) ? getDateTimeSpecificTimeZone(item.sent_date, req.timezone, req.dateTimeFormat) : '',
            read_date                       : (item.read_date) ? getDateTimeSpecificTimeZone(item.read_date, req.timezone, req.dateTimeFormat) : '',
            created_date                    : (item.created_date) ? getDateTimeSpecificTimeZone(item.created_date, req.timezone, req.dateTimeFormat) : '',
            new_notification_flag           : item.new_notification_flag
          };
        });
        return res.ok({
          totalCount: count.length,
          notificationList}, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(results, messages.NOT_RECEIVED_NOTIFICATION ,RESPONSE_STATUS.success);
      }
    }catch(error){
      sails.log(error);
      return res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  },

  delete: async(req, res) =>{
    try{
      const notification_queue_recipient_id = req.params.id;
      await NotificationQueueRecipient.update({notification_queue_recipient_id}, {
        status: ACCOUNT_STATUS.inactive
      }).usingConnection(req.dynamic_connection);
      return res.ok(undefined, messages.DELETE_SUCCESS, RESPONSE_STATUS.success);
    }catch(error){
      sails.log(error);
      return res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  },

  multipleDelete: async(req, res) =>{
    try{
      const request = req.allParams();
      const isValidate = await NotificationValidations.deleteMultiple.validate(request);
      if (!isValidate.error) {
        const { id } = request;
        if(id && id.length > 0){
          const id_arr = id.map((item) => {return item;});
          let sql = `UPDATE notification_queue_recipient SET status = '${ACCOUNT_STATUS.inactive}' where notification_queue_recipient_id IN (${id_arr.join(',')});`;
          const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
          const  results = rawResult.rows;
          sails.log(results);
          return res.ok(undefined, messages.DELETE_SUCCESS, RESPONSE_STATUS.success);
        }
        return res.ok(undefined, messages.DELETE_SUCCESS, RESPONSE_STATUS.success);
      }
      else {
        return res.ok(undefined, messages.INVALID_PARAMETER, RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log(error);
      return res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  },

  readMultiple: async(req, res) =>{
    try{
      const request = req.allParams();
      const isValidate = await NotificationValidations.deleteMultiple.validate(request);
      if (!isValidate.error) {
        const { id } = request;
        if(id && id.length > 0){
          const id_arr = id.map((item) => {return item;});
          let sql = `UPDATE notification_queue_recipient SET read_date = '${getDateUTC()}' where notification_queue_recipient_id IN (${id_arr.join(',')});`;
          const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
          const results = rawResult.rows;
          sails.log(results);
          return res.ok(undefined, messages.READ_SUCCESS, RESPONSE_STATUS.success);
        }
        return res.ok(undefined, messages.READ_SUCCESS, RESPONSE_STATUS.success);
      }
      else {
        return res.ok(undefined, messages.INVALID_PARAMETER, RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log(error);
      return res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  },

  notificationCount: async (req, res)=>{
    try{
      let sql = `Select Count(distinct notification_queue.notification_queue_id) as notification_count from notification_queue 
              INNER JOIN notification_queue_recipient
                ON notification_queue_recipient.notification_queue_id = notification_queue.notification_queue_id
              where notification_queue.notification_type = $1 AND notification_queue_recipient.employee_profile_id = $2 and notification_queue_recipient.new_notification_flag = 1 and notification_queue_recipient.status = '${ACCOUNT_STATUS.active}';`;

      const rawResult = await sails.sendNativeQuery(`${sql};`, ['InApp',req.empProfile.employee_profile_id]).usingConnection(req.dynamic_connection);
      let results = rawResult.rows[0];
      return res.ok(results,'Notifications Count',RESPONSE_STATUS.success);
    }catch(error){
      sails.log(error);
      return res.ok(undefined,'Error in Getting Notification List',RESPONSE_STATUS.error);
    }
  },

  updateNotificationFlag: async (req, res)=>{
    try{
      const request = req.allParams();
      const isValidate = await NotificationValidations.deleteMultiple.validate(request);
      if (!isValidate.error) {
        const { id } = request;
        if(id && id.length > 0){
          const id_arr = id.map((item) => {return item;});
          let sql = `UPDATE notification_queue_recipient SET new_notification_flag = 0 where notification_queue_recipient_id IN (${id_arr.join(',')});`;
          const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
          const  results = rawResult.rows;
          sails.log(results);
          return res.ok(undefined, messages.UPDATE_SUCCESS, RESPONSE_STATUS.success);
        }
        return res.ok(undefined, messages.UPDATE_SUCCESS, RESPONSE_STATUS.success);
      }
      else {
        return res.ok(undefined, messages.INVALID_PARAMETER, RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log(error);
      return res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  }
};
