/***************************************************************************

  Model          : EmployeeNote
  Database Table : employee_note

***************************************************************************/

module.exports = {
  tableName  : 'employee_note',
  primaryKey : 'employee_note_id',
  attributes : {
    employee_note_id    : { type: 'number', autoIncrement: true },
    location_id         : { model: 'Locations' },
    employee_profile_id : { model: 'EmployeeProfile' },
    note_type_id        : { model: 'NoteType'},
    description         : {type: 'string'},
    is_private          : { type: 'boolean', defaultsTo: true },
    status              : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by          : { type: 'number' },
    created_date        : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by     : { type: 'number' },
    last_updated_date   : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },

};



