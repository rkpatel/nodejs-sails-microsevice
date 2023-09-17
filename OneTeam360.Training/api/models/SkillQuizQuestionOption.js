/***************************************************************************

  Model          : SkillQuizQuestionOption
  Database Table : skillquiz_question_option

***************************************************************************/

module.exports = {
  tableName  : 'skillquiz_question_option',
  primaryKey : 'skillquiz_question_option_id',
  attributes : {
    skillquiz_question_option_id : { type: 'number', autoIncrement: true },
    skillquiz_question_id        : { model: 'SkillQuizQuestion', required: true},
    option                       : { type: 'string' , required: true},
    sequence                     : { type: 'number'},
    isCorrectAnswer              : { type: 'boolean', defaultsTo: false},
    description                  : { type: 'string', allowNull: true },
    status                       : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by                   : { type: 'number' },
    created_date                 : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by              : { type: 'number', allowNull: true },
    last_updated_date            : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
  },
};
