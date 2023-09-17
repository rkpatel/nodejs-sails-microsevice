const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);

module.exports = {
  add: Joi.object().keys({
    skill_id: Joi.number().required().messages({
      'number.base'  : `skill_id should be a type of 'number'`,
      'number.empty' : `skill_id canot be an empty field`,
    }),
    question: Joi.string().min(2).max(255).required().messages({
      'string.base'  : `Question should be a type of 'text'`,
      'string.empty' : `Question canot be an empty field`,
      'string.min'   : `Question should be minimum of 2 characters`,
      'string.max'   : `Question should be max of 255 characters`,
    }),
    is_required: Joi.boolean().messages({
      'boolean.base': `is_required should be a type of 'boolean'`,
    }),
    correct_answer: Joi.string().required().messages({
      'string.base'  : `correct_answer should be a type of 'text'`,
      'string.empty' : `correct_answer can not be an empty field`,
    }),
    description: Joi.string().optional().allow('').messages({
      'string.base': `description should be a type of 'text'`,
    }),

    question_options: Joi.array()
    .items(
        Joi.object({
          skill_quiz_option_id: Joi.number().optional().messages({
            'number.base': `skill_quiz_option_id should be a type of 'number'`,
          }),
          option: Joi.string().min(2).max(50).required().messages({
            'string.base'  : `option should be a type of 'text'`,
            'string.empty' : `option can not be an empty field`,
            'string.min'   : `option should be minimum of 2 characters`,
            'string.max'   : `option should be max of 25 characters`,
          }),
          sequence: Joi.number().optional().messages({
            'number.base': `sequence should be a type of 'number'`,
          }),
        })
    )
      .required()
      .messages({
        'array.empty': `Please select atleast two question option.`,
      }),
  }),

  edit: Joi.object().keys({

    id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
    skill_id: Joi.number().required().messages({
      'number.base'  : `skill_id should be a type of 'number'`,
      'number.empty' : `skill_id canot be an empty field`,
    }),
    question: Joi.string().min(2).max(255).required().messages({
      'string.base'  : `Question should be a type of 'text'`,
      'string.empty' : `Question canot be an empty field`,
      'string.min'   : `Question should be minimum of 2 characters`,
      'string.max'   : `Question should be max of 255 characters`,
    }),
    is_required: Joi.boolean().messages({
      'boolean.base': `is_required should be a type of 'boolean'`,
    }),
    correctAnswer: Joi.string().required().messages({
      'string.base'  : `correctAnswer should be a type of 'text'`,
      'string.empty' : `correctAnswer can not be an empty field`,
    }),
    description: Joi.string().optional().allow('').messages({
      'string.base': `description should be a type of 'text'`,
    }),

    questionOptions: Joi.array()
      .items(
        Joi.object({
          skillquiz_question_option_id: Joi.number().optional().messages({
            'number.base': `skill_quiz_option_id should be a type of 'number'`,
          }),
          option: Joi.string().min(2).max(50).required().messages({
            'string.base'  : `option should be a type of 'text'`,
            'string.empty' : `option can not be an empty field`,
            'string.min'   : `option should be minimum of 2 characters`,
            'string.max'   : `option should be max of 25 characters`,
          }),
          sequence: Joi.number().optional().messages({
            'number.base': `sequence should be a type of 'number'`,
          }),
          action: Joi.string().allow('').optional().messages({
            'string.base': `action should be a type of 'text'`,
          }),
        })
      )
      .required()
      .messages({
        'array.empty': `Please select atleast two question option.`
      }),
  }),

  delete: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
  }),

  findListById: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Skill id should be a type of 'number'`,
      'number.empty' : `Skill id cannot be an empty field`,
    }),
  }),
  findById: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
  }),
  findListByTrainingEmployeeId: Joi.object().keys({
    skill_id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
    training_employee_id: Joi.number().required().messages({
      'number.base'  : `Training employee id should be a type of 'number'`,
      'number.empty' : `Training employee id cannot be an empty field`,
    }),
  }),

  submitQuestion: Joi.object().keys({
    task_id: Joi.number().required().messages({
      'number.base'  : `task_id should be a type of 'number'`,
      'number.empty' : `task_id canot be an empty field`,
    }),
    skill_id: Joi.number().required().messages({
      'number.base'  : `skill_id should be a type of 'number'`,
      'number.empty' : `skill_id canot be an empty field`,
    }),
    training_employee_id: Joi.number().required().messages({
      'number.base'  : `training_employee_id should be a type of 'number'`,
      'number.empty' : `training_employee_id canot be an empty field`,
    }),
    skillquiz_question_id: Joi.number().required().messages({
      'number.base'  : `skillquiz_question_id should be a type of 'number'`,
      'number.empty' : `skillquiz_question_id cannot be an empty field`,
    }),
    submitted_option_id: Joi.number().optional().messages({
      'number.base': `submitted_option_id should be a type of 'number'`,
    }),
  })
};

