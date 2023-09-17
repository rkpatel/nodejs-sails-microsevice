/***************************************************************************

  Model          : CronJobLog
  Database Table : cron_job_logs

***************************************************************************/

module.exports = {
  tableName  : 'cron_job_logs',
  primaryKey : 'cron_job_logs_id',
  attributes : {
    cron_job_logs_id : { type: 'number', autoIncrement: true },
    cron_job_id      : { model: 'CronJob' },
    status           : { type: 'string', isIn: ['Success', 'Failure'] },
    start_date       : { type: 'ref', columnType: 'datetime' },
    end_date         : { type: 'ref', columnType: 'datetime' },
    error_message    : { type: 'string' },
  },
};



