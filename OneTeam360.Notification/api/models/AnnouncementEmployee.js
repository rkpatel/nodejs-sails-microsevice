/***************************************************************************
  Model          			: AnnouncementEmployee
  Database Table      : announcement_employee
***************************************************************************/

module.exports = {
  tableName  : 'announcement_employee',
  primaryKey : 'announcement_employee_id',
  attributes : {
    announcement_employee_id : { type: 'number', autoIncrement: true },
	  announcement_id          : { type: 'number'},
	  employee_profile_id     	: { type: 'number'},
    created_by               : { type: 'number'},
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  }
};
