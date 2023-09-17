/***************************************************************************
  Model          			: AnnouncementEmployee
  Database Table      : announcement_location
***************************************************************************/

module.exports = {
  tableName  : 'announcement_location',
  primaryKey : 'announcement_location_id',
  attributes : {
    announcement_location_id : { type: 'number', autoIncrement: true },
	  announcement_id          : { type: 'number'},
	  location_id             	: { type: 'number'},
    created_by               : { type: 'number'},
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  }
};
