/***************************************************************************
  Model          			: AnnouncementJobType
  Database Table      : announcement_job_type
***************************************************************************/

module.exports = {
  tableName  : 'announcement_job_type',
  primaryKey : 'announcement_job_type_id',
  attributes : {
    announcement_job_type_id : { type: 'number', autoIncrement: true },
	  announcement_id          : { type: 'number'},
	  job_type_id             	: { type: 'number'},
    created_by               : { type: 'number'},
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  }
};
