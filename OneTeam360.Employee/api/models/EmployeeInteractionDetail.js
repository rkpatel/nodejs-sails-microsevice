
module.exports = {
  tableName  : 'employee_interaction_detail',
  primaryKey : 'employee_interaction_detail_id',
  attributes : {
    employee_interaction_detail_id : { type: 'number', autoIncrement: true },
    employee_interaction_id        : { type: 'number' },
    interaction_factor_id          : { type: 'number' },
    grade_id                       : { type: 'number' },
  }

};






