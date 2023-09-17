/***************************************************************************

  Model          : NoteType
  Database Table : note_type

***************************************************************************/

module.exports = {
  tableName  : 'note_type',
  primaryKey : 'note_type_id',
  attributes : {
    note_type_id      : { type: 'number', autoIncrement: true },
    name              : { type: 'string' },
    description       : { type: 'string' },
    status            : { type: 'string', isIn: ['Inactive', 'Active'] },
    is_default        : { type: 'boolean', defaultsTo: false },
    send_notification : { type: 'boolean', defaultsTo: false },
    notify_management_user : { type: 'boolean', defaultsTo: false },
    created_by        : { type: 'number' },
    created_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by   : { type: 'number' },
    last_updated_date : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },

};




