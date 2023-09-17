
module.exports = {
  tableName  : 'interaction_factor_job_type',
  primaryKey : 'interaction_factor_job_type_id',
  attributes : {
    interaction_factor_job_type_id : { type: 'number', autoIncrement: true },
    interaction_factor_id          : { type: 'number' },
    job_type_id                    : { model: 'JobType' } ,
    created_by                     : { type: 'number' },
    created_date                   : { type: 'ref', columnType: 'datetime', autoCreatedAt: true },
  },

  customToJSON: function() {
    // Return a shallow copy of this record with the password removed.
    return _.omit(this, ['created_by', 'created_date']);
  }
};



