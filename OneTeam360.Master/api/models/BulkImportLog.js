/***************************************************************************

  Model          : BulkImportLog
  Database Table : bulk_import_log

***************************************************************************/

module.exports = {
  tableName  : 'bulk_import_log',
  primaryKey : 'bulk_import_log_id',
  attributes : {
    bulk_import_log_id : { type: 'number', autoIncrement: true },
    file_name          : { type: 'string' },
    uploaded_file_name : { type: 'string' },
    file_path          : { type: 'string' },
    status             : { type: 'string', isIn: ['Imported', 'Validated', 'Completed', 'Failed', 'Mail Sent'] },
    error_count        : { type: 'number' },
    success_count      : { type: 'number' },
    total_count        : { type: 'number' },
    is_accept          : { type: 'boolean', defaultsTo: false },
    error_export_url   : { type: 'string' },
    uploaded_by        : { type: 'number' },
    uploaded_date      : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },

};





