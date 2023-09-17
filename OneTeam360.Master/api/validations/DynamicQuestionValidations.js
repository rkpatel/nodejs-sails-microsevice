const Joi = require('joi');
module.exports = {
  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    question: Joi.string().optional().messages({
      'string.base'  : `question should be a type of 'string'`,
      'string.empty' : `question canot be an empty field`,
    }),
    required: Joi.boolean().allow('').optional().messages({
      'number.base': `is_default should be a type of 'boolean'`,
    }),
    answer_format: Joi.string().messages({
      'string.base': `answer_format should be a type of 'string'`
    }),
    questionOptions: Joi.array().when('answer_format', {
      is   : Joi.string().valid('multiple_choice'),
      then : Joi.array().items(
        Joi.object({
          option_value: Joi.string().min(2).max(155).required().messages({
            'string.base'  : `option_value name should be a type of 'text'`,
            'string.empty' : `option_value name canot be an empty field`,
            'string.min'   : `option_value should be minimum of 2 characters`,
            'string.max'   : `option_value should be max of 25 characters`,
          }),
          sequence: Joi.number().optional().messages({
            'number.base': `sequence id should be a type of 'number'`,
          }),
          dynamic_question_option_id: Joi.number().optional().messages({
            'number.base'  : `dynamic_question_option_id should be a type of 'number'`,
            'number.empty' : `dynamic_question_option_id canot be an empty field`,
          }),
          action: Joi.string().valid('Delete', 'Edit', 'Add').required().messages({
            'string.base'  : `action should be a type of 'text'`,
            'string.empty' : `action canot be an empty field`,
            'string.valid' : `action should be 'Delete' , 'Edit' or 'Add'`,
          }),
        })
      ).required().messages({
        'array.empty' : `Please add at least 2 answer options to add question`,
        'array.min'   : `Please add at least 2 answer options to add question`,
        'array.max'   : `Question option must contain less than or equal to 6 options`,
      }),
    }),
  }),
  add: Joi.object().keys({
    question: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `question should be a type of 'string'`,
      'string.empty' : `question canot be an empty field`,
      'string.min'   : `question should be minimum of 2 characters`,
      'string.max'   : `question should be max of 55 characters`,
    }),
    required: Joi.boolean().allow('').optional().messages({
      'number.base': `is_default should be a type of 'boolean'`,
    }),
    answer_format: Joi.string().required().valid('text', 'multiple_choice').messages({
      'string.base'  : `answer_format should be a type of 'string'`,
      'string.empty' : `answer_format canot be an empty field`
    }),
    questionOptions: Joi.array().when('answer_format', {
      is   : Joi.string().valid('multiple_choice'),
      then : Joi.array().min(2).items(
        Joi.object({
          option_value: Joi.string().min(2).max(155).required().messages({
            'string.base'  : `option_value name should be a type of 'text'`,
            'string.empty' : `option_value name canot be an empty field`,
            'string.min'   : `option_value should be minimum of 2 characters`,
            'string.max'   : `option_value should be max of 25 characters`,
          }),
          sequence: Joi.number().optional().messages({
            'number.base': `sequence id should be a type of 'number'`,
          }),
        })
      ).required().messages({
        'array.empty' : `Please add at least 2 answer options to add question`,
        'array.min'   : `Please add at least 2 answer options to add question`,
        'array.max'   : `Question option must contain less than or equal to 6 options`,
      }),
    }),
  }),
  filter: Joi.object().keys({
    offset: Joi.number().required().messages({
      'number.base'  : `offset should be a type of 'number'`,
      'number.empty' : `offset cannot be an empty field`,
    }),
    perPage: Joi.number().required().messages({
      'number.base'  : `perPage should be a type of 'number'`,
      'number.empty' : `perPage cannot be an empty field`,
    }),
    filters: Joi.object().allow('').optional().messages({
      'object.base': `filters should be a type of 'object'`,
    }),
    sortField: Joi.string().required().messages({
      'string.base' : `sortField should be a type of 'text'`,
      'string.max'  : `sortField should be max of 100 characters`,
    }),
    sortOrder: Joi.string().required().messages({
      'string.base' : `sortOrder should be a type of 'text'`,
      'string.max'  : `sortOrder should be max of 100 characters`,
    }),
    rows: Joi.string().allow('').optional().messages({
      'string.base': `flag should be a type of 'text'`
    }),
  }),
  updatestatus: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id cannot be an empty field`,
    }),
    status: Joi.string().required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`
    })
  }),
  sequence: Joi.object().keys({
    draggable_id: Joi.number().required().messages({
      'number.base'  : `draggable_id should be a type of 'number'`,
      'number.empty' : `draggable_id cannot be an empty field`,
    }),
    droppable_id: Joi.number().required().messages({
      'number.base'  : `droppable_id should be a type of 'number'`,
      'number.empty' : `droppable_id cannot be an empty field`,
    })
  }),
  answer: Joi.object().keys({
    dynamic_questions: Joi.array().items(
      Joi.object({
        dynamic_question_id: Joi.number().required().messages({
          'number.base'  : `dynamic_question_id should be a type of 'number'`,
          'number.empty' : `dynamic_question_id cannot be an empty field`
        }),
        dynamic_question_option_id: Joi.number().optional().allow(null).messages({
          'number.base': `dynamic_question_option_id should be a type of 'number'`
        }),
        answer: Joi.string().optional().allow('').allow(null).messages({
          'string.base': `answer should be a type of 'string'`
        })
      })
    ),
    employee_profile_id: Joi.number().required().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`
    }),

  }),


};
