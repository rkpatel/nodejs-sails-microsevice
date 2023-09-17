/***************************************************************************

  Seed Function
  (sails.config.cronjobs)

  By convention, this is a good place to set up cronjobs.

  For eg:

  add more cronjobs if you want like below
  but dont forget to add a new method…
  jsonArray.push({interval:’* * * * * * ‘,method:’anothertest’});

  Method:
  anothertest:function(){
    require(‘../crontab/anothertest.js’).run();
  }

  Set interval:
  ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']

  schedule: '* * * * * *',
  triggering every second

  schedule: '0 5 * * * *',
  triggering every five minutes
***************************************************************************/

const { getDateUTC } = require('../api/utils/common/getDateTime');

module.exports.cronjobs = {

  crons: () => {
    let jsonArray = [];
    jsonArray.push({interval: process.env.CRON_STATUS_UPDATES,method: 'cronFunction'});
    jsonArray.push({interval: process.env.NOTIFICATION_CRON,method: 'notificationCron'});
    return jsonArray;
  },

  notificationCron: function(){
    if(process.env.NODE_ENV !== 'local' || process.env.ENV !== 'dev'){
      require('../api/controllers/NotificationController').run();
    }
  },

  cronFunction: async function(){
    if(process.env.NODE_ENV !== 'local' || process.env.ENV !== 'dev'){
      let curentTimeUTC = getDateUTC();
      await require('../api/controllers/AnnouncementController').announcementCron(curentTimeUTC,true);
    }
  },

};
