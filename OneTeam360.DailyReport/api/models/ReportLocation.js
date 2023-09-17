/***************************************************************************

  Model          : Reportlocation
  Database Table : report_location

***************************************************************************/

module.exports = {
  tableName  : 'report_location',
  primaryKey : 'report_location_id',
  attributes : {
    report_location_id : { type: 'number', autoIncrement: true },
    report_id          : { model: 'Report' },
    location_id        : { model: 'Locations' },
    created_by         : { type: 'number' },
    created_date       : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
    last_updated_by    : { type: 'number' },
    last_updated_date  : { type: 'ref', columnType: 'datetime' },
  }
};


