/***************************************************************************

  Model          : BulkImportTemp
  Database Table : bulk_import_temp

***************************************************************************/

module.exports = {
  tableName  : 'bulk_import_temp',
  primaryKey : 'bulk_import_temp_id',
  attributes : {
    bulk_import_temp_id        : { type: 'number', autoIncrement: true },
    bulk_import_log_id         : {type: 'number'},
    first_name                 : { type: 'string' },
    last_name                  : { type: 'string' },
    email                      : { type: 'string' },
    phone                      : { type: 'string' },
    date_of_joining            : { type: 'ref', columnType: 'datetime' },
    date_of_birth              : { type: 'ref', columnType: 'datetime' },
    locations                  : { type: 'string' },
    job_types                  : { type: 'string' },
    role                       : { type: 'string' },
    emergency_contact_name     : { type: 'string' },
    emergency_contact_relation : { type: 'string' },
    emergency_contact_number   : { type: 'string' },
    emergency_contact_address  : { type: 'string' },
    emergency_contact_country  : { type: 'string' },
    emergency_contact_state    : { type: 'string' },
    emergency_contact_city     : { type: 'string' },
    emergency_contact_zip      : { type: 'string' },
    status                     : { type: 'string', isIn: ['Success', 'Failure'] },
    error_log                  : { type: 'string' },
  },

};






