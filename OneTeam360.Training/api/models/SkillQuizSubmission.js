/***************************************************************************

  Model          : SkillQuizSubmission
  Database Table : skill_quiz_submission

***************************************************************************/

module.exports = {
  tableName  : 'skillquiz_submission',
  primaryKey : 'skillquiz_submission_id',
  attributes : {
    skillquiz_submission_id : { type: 'number', autoIncrement: true },
    task_id                 : { type: 'number', required: true },
    skill_id                : { model: 'Training', required: true },
    training_employee_id    : { model: 'TrainingEmployee', required: true },
    skillquiz_question_id   : { model: 'SkillQuizQuestion', required: true},
    submitted_option_id     : { model: 'SkillQuizQuestionOption', required: true},
    submitted_option_value  : { type: 'string',  required: true },
    employee_profile_id     : { model: 'EmployeeProfile', required: true},
    submission_date         : { type: 'ref', columnType: 'datetime', autoUpdatedAt: false },
  }
};

