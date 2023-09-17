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

  /*
    * The asterisks in the key are equivalent to the
    * schedule setting in crontab, i.e.
    * minute hour day month day-of-week year
    * so in the example below it will run every minute
    */

  crons: function()
  {
    let jsonArray = [];
    jsonArray.push({interval: process.env.CRON_STATUS_UPDATES,method: 'cronFunction'});
    jsonArray.push({interval: process.env.CRON_TASK_SCHEDULE,method: 'cronTaskScheduledFunction'});
    return jsonArray;
  },

  cronFunction: function(){
    if(process.env.NODE_ENV !== 'local' || process.env.ENV !== 'dev'){
      let curentTimeUTC = getDateUTC();
      require('../api/controllers/TaskController').onverdueReminderCron(curentTimeUTC,true);
    }
  },

  cronTaskScheduledFunction: async function(){
    if(process.env.NODE_ENV !== 'local' || process.env.ENV !== 'dev'){
      let curentTimeUTC = getDateUTC();
      await require('../api/controllers/TaskController').scheduledCron(curentTimeUTC,true);
    }
  }
};
