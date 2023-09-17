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

module.exports.cronjobs = {

  crons: () => {
    let jsonArray = [];
    sails.log(process.env.BULKIMPORT_CRON);
    jsonArray.push({interval: process.env.BULKIMPORT_CRON,method: 'bulkImportCron'});
    return jsonArray;
  },

  bulkImportCron: function(){
    if(process.env.NODE_ENV !== 'local' || process.env.ENV !== 'dev'){
      require('../api/controllers/CommonMasterController').run();
    }
  }

};
