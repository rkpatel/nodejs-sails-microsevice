/***************************************************************************

  Model          : EmployeePointsAudit
  Database Table : employee_point_audit

***************************************************************************/

module.exports = {
  tableName  : 'employee_point_audit',
  primaryKey : 'employee_point_audit_id',
  attributes : {
    employee_point_audit_id : { type: 'number', autoIncrement: true },
    employee_profile_id     : { model: 'EmployeeProfile' },
    reason                  : { type: 'string' },
    interaction_score       : {type: 'number'},
    checkin_score           : {type: 'number'},
    note_score              : {type: 'number'},
    training_score          : {type: 'number'},
    total_weighted_score    : {type: 'number'},
    points_earned           : {type: 'number'},
    old_points              : {type: 'number'},
    new_points              : {type: 'number'},
    old_level_id            : {type: 'number'},
    new_level_id            : {type: 'number'},
    created_by              : { type: 'number' },
    created_date            : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },
};


