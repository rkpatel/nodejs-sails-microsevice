/***************************************************************************

  Model          : FeedbackAnswer
  Database Table : feedback_answer

***************************************************************************/

module.exports = {
  tableName  : 'feedback_answer',
  primaryKey : 'feedback_answer_id',
  attributes : {
    feedback_answer_id       : { type: 'number', autoIncrement: true },
    employee_profile_id      : { type: 'number', required: true },
    manager_id               : { type: 'number', allowNull: true},
    location_id              : { type: 'number', allowNull: true},
    feedback_question_id     : { type: 'number', required: true},
    feedback_rating_scale_id : { type: 'number', required: true},
    comment                  : { type: 'string', allowNull: true},
    created_by               : { type: 'number', required: true},
    created_date             : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
  },
};
