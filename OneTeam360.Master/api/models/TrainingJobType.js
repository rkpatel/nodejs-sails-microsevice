/***************************************************************************

  Model          : TrainingJobType
  Database Table : training_job_type

***************************************************************************/

module.exports = {
  tableName  : 'training_job_type',
  primaryKey : 'training_job_type_id',
  attributes : {
    training_job_type_id : { type: 'number', autoIncrement: true },
    training_id          : { model: 'Training' },
    job_type_id          : { model: 'JobType'},
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },

};
