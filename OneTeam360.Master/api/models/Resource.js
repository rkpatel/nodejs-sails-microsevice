/***************************************************************************

  Model          : Resource
  Database Table : resource

***************************************************************************/

module.exports = {
  tableName  : 'resource',
  primaryKey : 'resource_id',
  attributes : {
    resource_id   : { type: 'number', autoIncrement: true },
    title         : { type: 'string' },
    description   : { type: 'string' },
    resource_type : { type: 'string' },
    source        : { type: 'string', allowNull: true },
    sequence      : { type: 'number' },
    location_path : { type: 'string' },
    created_by    : { type: 'number' },
    created_date  : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },

};



