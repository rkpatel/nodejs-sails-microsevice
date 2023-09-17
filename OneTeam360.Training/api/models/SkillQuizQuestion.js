/***************************************************************************

  Model          : SkillQuizQuestion
  Database Table : skillquiz_question

***************************************************************************/

module.exports = {
  tableName  : 'skillquiz_question',
  primaryKey : 'skillquiz_question_id',
  attributes : {
    skillquiz_question_id : { type: 'number', autoIncrement: true },
    skill_id              : { model: 'training', required: true },
    question              : { type: 'string', required: true },
    is_required           : { type: 'boolean', defaultsTo: false },
    sequence              : { type: 'number' , required: true},
    status                : { type: 'string', isIn: ['Inactive', 'Active'] },
    created_by            : { type: 'number'},
    created_date          : { type: 'ref', columnType: 'datetime', autoCreatedAt: false },
    last_updated_by       : { type: 'number', allowNull: true },
    last_updated_date     : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
  }
};

