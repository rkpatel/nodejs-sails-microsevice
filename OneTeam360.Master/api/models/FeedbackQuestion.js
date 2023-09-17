/***************************************************************************

  Model          : FeedbackQuestion
  Database Table : feedback_question

***************************************************************************/

module.exports = {
  tableName  : 'feedback_question',
  primaryKey : 'feedback_question_id',
  attributes : {
    feedback_question_id : { type: 'number', autoIncrement: true },
    feedback_category    : { type: 'string', isIn: ['Manager', 'Location'] },
    question             : { type: 'string', required: true },
    is_required          : { type: 'boolean', defaultsTo: false },
    status               : { type: 'string', isIn: ['Inactive', 'Active']},
    sequence             : { type: 'number' },
    created_by           : { type: 'number' },
    created_date         : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    modified_by          : { type: 'number', allowNull: true },
    modified_date        : { type: 'ref',columnType: 'datetime',autoUpdatedAt: false}
  }
};
