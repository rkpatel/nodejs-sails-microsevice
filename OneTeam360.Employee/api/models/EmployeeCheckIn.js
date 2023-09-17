/***************************************************************************
  Model             : EmployeeCheckIn
  Database Table    : employee_checkin
***************************************************************************/

module.exports = {
  tableName  : 'employee_checkin',
  primaryKey : 'employee_checkin_id',
  attributes : {
    employee_checkin_id : { type: 'number', autoIncrement: true },
    employee_profile_id : { model: 'EmployeeProfile'},
    location_id         : { model: 'Locations'},
    request_status      : { type: 'string', isIn: ['Pending', 'Approved', 'Rejected', 'CheckedOut', 'AutoRejected']},
    checkin_datetime    : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    checkout_datetime   : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    reviewer_status     : { type: 'string', allowNull: true},
    reviewed_by         : { type: 'number', allowNull: true },
    reviewed_datetime   : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },
};
