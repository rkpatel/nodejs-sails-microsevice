/***************************************************************************
  Model          			: Announcement
  Database Table    : announcement
***************************************************************************/

module.exports = {
  tableName  : 'announcement',
  primaryKey : 'announcement_id',
  attributes : {
    announcement_id     : { type: 'number', autoIncrement: true },
	  name                : { type: 'string'},
    short_description   : { type: 'string'},
    description         : { type: 'string'},
    start_date          : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    end_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    is_default          : { type: 'boolean', defaultsTo: false },
    email_noti          : { type: 'boolean', defaultsTo: true },
    push_noti           : { type: 'boolean', defaultsTo: true },
    sms_noti            : { type: 'boolean', defaultsTo: true },
    announcement_status : { type: 'string', isIn: ['Scheduled', 'Active','Expired','Inactive']},
    announcement_type   : { type: 'string', isIn: ['custom', 'birthday', 'anniversary', 'abroad']},
    status              : { type: 'string', isIn: ['Inactive', 'Active']},
    created_by          : { type: 'number'},
    created_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by     : { type: 'number', allowNull: true },
    last_updated_date   : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
  }
};

