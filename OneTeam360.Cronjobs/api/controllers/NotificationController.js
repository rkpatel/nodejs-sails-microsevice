const { NOTIFICATION_ENTITIES, ACCOUNT_STATUS, ACCOUNT_CONFIG_CODE, NOTIFICATION_TYPE, NOTIFICATIONQUEUE_STATUS } = require('../utils/constants/enums');
const { sendGridMail  } = require('../services/sendGridMail');
const { getDateUTC } = require('../utils/common/getDateTime');
const { sendSMS } = require('../services/twilio');
const { sendPushNotification } = require('../services/sendPushNotification');
const { bulkExportFile } =require('../services/bulkExportFile');

module.exports = {
  run: async () => {

    sails.log.debug('Notification Cron Execution Start');
    try{
      let sql = `
        SELECT
            account_configuration_detail.value
          from account
          INNER JOIN
            account_configuration ON account.account_id = account_configuration.account_id
          INNER JOIN
            account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
          Where
            account_configuration_detail.code = $1 and account.status= $2;`;

      const rawResult = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.tenant_db_connection_string, ACCOUNT_STATUS.active]);
      const results = rawResult.rows;
      for(const item of results)
      {
        try{
          // Tenant specific database connection
          let connectionString = item.value;
          let rdi = sails.getDatastore('default');
          let mysql = rdi.driver.mysql;
          let tenantConnection1;

          tenantConnection1 = await  mysql.createConnection(connectionString);
          await tenantConnection1.connect();

          let sqlQ = `SELECT * FROM notification_queue where sent_date IS NULL AND status = 'Pending' AND retry_count < 3 limit 20;`;
          const rawResult_ = await sails.sendNativeQuery(sqlQ).usingConnection(tenantConnection1);
          const notificationQueue = rawResult_.rows;
          let notificationIds = [];
          if(notificationQueue.length > 0){
            for (const i in notificationQueue){
              await NotificationQueue.update({ notification_queue_id: notificationQueue[i].notification_queue_id}, { status: NOTIFICATIONQUEUE_STATUS.inprogress }).usingConnection(tenantConnection1);
              notificationIds.push(notificationQueue[i].notification_queue_id);
            }
            let notificationQueueIds = notificationIds.join(',');
            await NotificationQueueLog.create({notification_queue_id: notificationQueueIds,created_date: getDateUTC()}).usingConnection(tenantConnection1);
            for (const index in notificationQueue){
              let successstatus = '';
              try{
                let notificationQueueReceipient_to = await NotificationQueueRecipient.find({where: { notification_queue_id: notificationQueue[index].notification_queue_id, to_cc: 'To' }}).usingConnection(tenantConnection1);
                let notificationQueueReceipient_cc = await NotificationQueueRecipient.find({where: { notification_queue_id: notificationQueue[index].notification_queue_id, to_cc: 'CC' }}).usingConnection(tenantConnection1);
                if(notificationQueue[index].notification_type === NOTIFICATION_TYPE.EMAIL){
                  sails.log('come in notification type email----->');
                  if(notificationQueueReceipient_to.length > 0){
                    let data={};
                    let to_emails = notificationQueueReceipient_to.map(notiReceipient => notiReceipient.recipient_email);
                    let cc_emails = notificationQueueReceipient_cc ? notificationQueueReceipient_cc.map(n => n.recipient_email) : [];
                    let attachment = (notificationQueueReceipient_to[0].attachment !== '') ? (notificationQueueReceipient_to[0].attachment): '';
                    //check for attachment
                    if(attachment !== ''){
                      sails.log('email have attachement----->');
                      const templateData = await NotificationTemplate.findOne({ notification_template_id: notificationQueue[index].notification_template_id }).usingConnection(tenantConnection1);
                      //check the code from notification template
                      if((templateData) && (templateData.code === NOTIFICATION_ENTITIES.COMPLETE_ALL_IMPORT || templateData.code === NOTIFICATION_ENTITIES.COMPLETE_PARTIAL_IMPORT || templateData.code === NOTIFICATION_ENTITIES.NOT_COMPLETE_IMPORT))
                      {
                        const bulkFile = await bulkExportFile(attachment, tenantConnection1);
                        data = {
                          fileName : bulkFile.fileName,
                          type     : bulkFile.type
                        };
                        await sendGridMail(to_emails,cc_emails, notificationQueue[index].notification_subject, notificationQueue[index].notification_body, data);
                      }
                      // else if((templateData) && (templateData.code === NOTIFICATION_ENTITIES.TASK_ASSIGNED) && (notificationQueue[index].entity_type === NOTIFICATION_QUEUE_ENTITIES.TASK))
                      // {
                      //   const data = await taskAttachmentFile(notificationQueue[index].entity_id, attachment, tenantConnection1);
                      //   await sendGridMailTask(to_emails,cc_emails, notificationQueue[index].notification_subject, notificationQueue[index].notification_body, data);
                      // }
                      else if((templateData) && (templateData.code === NOTIFICATION_ENTITIES.CERTIFICATE_REPORT_DIGEST))
                      {
                        sails.log('come in certificate digest report');
                        data = {
                          fileName : attachment,
                          type     : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        };
                        try {
                          await sendGridMail(to_emails,cc_emails, notificationQueue[index].notification_subject, notificationQueue[index].notification_body, data);
                        } catch (error) {
                          sails.log('error', error);
                        }
                      }
                      else {
                        await sendGridMail(to_emails,cc_emails, notificationQueue[index].notification_subject, notificationQueue[index].notification_body, data);
                      }
                    } else {
                      sails.log('come in not attachement');
                      await sendGridMail(to_emails,cc_emails, notificationQueue[index].notification_subject, notificationQueue[index].notification_body, data);
                    }
                    successstatus = 'success';
                  }
                }else if(notificationQueue[index].notification_type === NOTIFICATION_TYPE.SMS){
                  if(notificationQueueReceipient_to.length > 0){
                    //let to_emails = notificationQueueReceipient_to.map(notiQueue => notiQueue.recipient_email);
                    sails.log('notificationQueueReceipient_to------->',notificationQueueReceipient_to);
                    for(const mnumber of notificationQueueReceipient_to) {
                      sails.log('send sms to employeee------->',mnumber.recipient_email);
                      sendSMS(notificationQueue[index].notification_body,mnumber.recipient_email);
                      successstatus = 'success';
                    }
                  }
                }else if(notificationQueue[index].notification_type === NOTIFICATION_TYPE.MOBILE){
                  if(notificationQueueReceipient_to.length > 0){
                    const templateData = await NotificationTemplate.findOne({ notification_template_id: notificationQueue[index].notification_template_id }).usingConnection(tenantConnection1);
                    let to_device_id = notificationQueueReceipient_to.map(notiQueueR => notiQueueR.recipient_email);
                    let payload = {
                      notification: {
                        title : notificationQueue[index].notification_subject,
                        body  : notificationQueue[index].notification_body,
                      },
                      data: {
                        title        : notificationQueue[index].notification_subject,
                        body         : notificationQueue[index].notification_body,
                        entity_type  : notificationQueue[index].entity_type,
                        entity_id    : notificationQueue[index].entity_id,
                        type         : templateData.code,
                        click_action : 'FLUTTER_NOTIFICATION_CLICK' // Added this key for Mobile team requirement for Push Notification
                      }
                    };
                    await sendPushNotification(payload,to_device_id);
                    successstatus = 'success';
                  }
                }else if(notificationQueue[index].notification_type === NOTIFICATION_TYPE.InApp){
                  successstatus = 'success';
                }
              }catch(error){
                successstatus = 'failure';
                sails.log('error',error);
                continue;
              }
              finally {
                if(successstatus === 'failure'){
                  await NotificationQueue.update({notification_queue_id: notificationQueue[index].notification_queue_id}, { status: NOTIFICATIONQUEUE_STATUS.pending, retry_count: notificationQueue[index].retry_count + 1 }).usingConnection(tenantConnection1);
                }
                else if(successstatus === 'success'){
                  await NotificationQueue.update({notification_queue_id: notificationQueue[index].notification_queue_id}, { sent_date: getDateUTC(), status: NOTIFICATIONQUEUE_STATUS.completed }).usingConnection(tenantConnection1);
                }
              }
            }
          }

          if(tenantConnection1){
            await tenantConnection1.end();
          }
        }catch(error){
          sails.log('error',error);
          continue;
        }
      }
    }catch(error){
      sails.log(error);
    }
    sails.log.debug('Notification Cron Execution End');
  },
};
