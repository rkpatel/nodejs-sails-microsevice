/***************************************************************************

  Model          : FeedbackQuestionLocation
  Database Table : feedback_question_location

***************************************************************************/

module.exports = {
  tableName  : 'feedback_question_location',
  primaryKey : 'feedback_question_location_id',
  attributes : {
    feedback_question_location_id : { type: 'number', autoIncrement: true },
    feedback_question_id          : { type: 'number',required: true },
    location_id                   : { type: 'number',required: true },
    status                        : { type: 'string', isIn: ['Inactive', 'Active']}
  }
};

