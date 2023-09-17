/***************************************************************************

  Model          : CronJob
  Database Table : cron_job

***************************************************************************/

module.exports = {
  tableName  : 'cron_job',
  primaryKey : 'cron_job_id',
  attributes : {
    cron_job_id          : { type: 'number', autoIncrement: true },
    name                 : { type: 'string' },
    code                 : { type: 'string' },
    description          : { type: 'string' },
    last_processing_date : { type: 'ref', columnType: 'datetime' },
    scheduled_time       : { type: 'ref', columnType: 'datetime' }
  },
};


