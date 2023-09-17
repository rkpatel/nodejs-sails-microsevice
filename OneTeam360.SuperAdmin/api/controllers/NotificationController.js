const {
  RESPONSE_STATUS,
  NOTIFICATION_ENTITIES,
  ACCOUNT_STATUS,
  NOTIFICATION_TYPE,
} = require('../utils/constants/enums');
const notificationmessages = sails.config.globals.notificationmessages;
const { createPassword, resetPassword, createPasswordCustomer, paymentDeclinedCustomer, paymentLinkCustomer, notificationCustomer, notificationPaymentFailedReminder} = require('../utils/notifications');
const { sendGridMail } = require('../services/sendGridMail');
const { getDateUTC } = require('../utils/common/getDateTime');

const ccEmailData=async(notificationQueueReceipient_cc)=>{
  return  notificationQueueReceipient_cc
  ? notificationQueueReceipient_cc.map(
      (item) => item.recipient_email
  )
  : [];
};

module.exports = {
  send: async (req, res) => {
    try {
      let request = req.allParams();
      let { notification_entity } = request;
      let template = await NotificationTemplateMaster.findOne({
        code              : notification_entity,
        status            : ACCOUNT_STATUS.active,
        notification_type : NOTIFICATION_TYPE.EMAIL,
      });

      if (template) {
        switch (notification_entity) {
          case NOTIFICATION_ENTITIES.CREATE_PASSWORD_ADMIN:
            await createPassword(template, req, res);
            break;
          case NOTIFICATION_ENTITIES.RESET_PASSWORD_ADMIN:
            await resetPassword(template, req, res);
            break;
          case NOTIFICATION_ENTITIES.CREATE_PASSWORD_CUSTOMER:
            await createPasswordCustomer(template, req, res);
            break;
          case NOTIFICATION_ENTITIES.PAYMENT_DECLINED_CUSTOMER:
            await paymentDeclinedCustomer(template, req, res);
            break;
          case NOTIFICATION_ENTITIES.PAYMENT_LINK_CUSTOMER:
            await paymentLinkCustomer(template, req, res);
            break;
          case NOTIFICATION_ENTITIES.NOTIFICATION_CUSTOMER:
            await notificationCustomer(template, req, res);
            break;
          case NOTIFICATION_ENTITIES.NOTIFICATION_PAYMENT_FAILED_REMINDER:
            await notificationPaymentFailedReminder(template, req, res);
            break;
          default:
            return res.ok(
              undefined,
              notificationmessages.NOTI_ENTITY_NOT_FOUND,
              RESPONSE_STATUS.error
            );
        }
        return res.ok(
          undefined,
          'Mail added to Queue',
          RESPONSE_STATUS.success
        );
      } else {
        return res.ok(undefined, 'No Template Found', RESPONSE_STATUS.error);
      }
    } catch (error) {
      sails.log.error(error);
      return res.ok(
        undefined,
        'Error in Sending Notification',
        RESPONSE_STATUS.error
      );
    }
  },
  run: async () => {
    sails.log.debug('Notification Cron Execution Start');
    try {
      //for(const item of results)
      //{
      // Search for Notification Queue

      let notificationQueue = await NotificationQueueMaster.find({
        where: {
          sent_date: null,
        },
      });

      if (notificationQueue.length > 0) {
        for (const index in notificationQueue) {
          let notificationQueueReceipient_to =
            await NotificationQueueRecipientMaster.find({
              where: {
                notification_queue_id:
                  notificationQueue[index].notification_queue_id,
                to_cc: 'To',
              },
            });
          let notificationQueueReceipient_cc =
            await NotificationQueueRecipientMaster.find({
              where: {
                notification_queue_id:
                  notificationQueue[index].notification_queue_id,
                to_cc: 'CC',
              },
            });

          if (
            notificationQueue[index].notification_type ===
            NOTIFICATION_TYPE.EMAIL
          ) {
            if (notificationQueueReceipient_to.length > 0) {
              let to_emails = notificationQueueReceipient_to.map(
                (item) => item.recipient_email
              );
              let cc_emails =await ccEmailData(notificationQueueReceipient_cc);
              await sendGridMail(
                to_emails,
                cc_emails,
                notificationQueue[index].notification_subject,
                notificationQueue[index].notification_body
              );
              await NotificationQueueMaster.update(
                {
                  notification_queue_id:
                    notificationQueue[index].notification_queue_id,
                },
                { sent_date: getDateUTC() }
              );
            }
          }
        }
      }
      //}
    } catch (error) {
      sails.log.debug(error);
    }
    sails.log.debug('Notification Cron Execution End');
  },
};
