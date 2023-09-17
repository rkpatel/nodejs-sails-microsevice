/***************************************************************************

  Model          : TrainingResource
  Database Table : training_resource

***************************************************************************/

module.exports = {
  tableName  : 'training_resource',
  primaryKey : 'training_resource_id',
  attributes : {
    training_resource_id : { type: 'number', autoIncrement: true },
    training_id          : { model: 'Training' },
    resource_id          : { model: 'Resource'},
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },

};



