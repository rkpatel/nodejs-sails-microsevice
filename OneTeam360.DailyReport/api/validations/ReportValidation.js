const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  add: Joi.object().keys({
    name: Joi.string().required().messages({
      'string.base'  : `Report name should be a type of 'text'`,
      'string.empty' : `Report name canot be an empty field`,
    }),
    locations: Joi.array().min(1).required().messages({
      'array.empty': `Please select atleast one location.`,
    }),
    reportQuestions: Joi.array().min(1).required().messages({
      'array.empty': `Please select atleast one question.`,
    }),
  }),

  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Report id should be a type of 'number'`,
      'number.empty' : `Report id cannot be an empty field`,
    }),
    name: Joi.string().required().messages({
      'string.base'  : `Report name should be a type of 'text'`,
      'string.empty' : `Report name canot be an empty field`,
    }),
    locations: Joi.array().min(1).required().messages({
      'array.empty': `Please select atleast one location.`,
    }),
    reportQuestions: Joi.array().min(1).required().messages({
      'array.empty': `Please select atleast one question.`,
    }),
  }),

  filter: Joi.object().keys({
    sortField: Joi.string().required().messages({
      'string.base'  : `sortField should be a type of 'string'`,
      'string.empty' : `sortField cannot be an empty field`,
    }),
    sortOrder: Joi.string().required().messages({
      'string.base'  : `sortOrder should be a type of 'string'`,
      'string.empty' : `sortOrder cannot be an empty field`,
    }),
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
  }),

  CheckReportExistValidation: Joi.object().keys({
    reportId: Joi.number().optional().messages({
      'number.base': `Report id should be a type of 'number'`,
    }),
    locationIds: Joi.array().min(1).required().messages({
      'array.empty': `Please select atleast one location.`,
    }),
    reportName: Joi.string().required().messages({
      'string.base'  : `Report name should be a type of 'text'`,
      'string.empty' : `Report name canot be an empty field`,
    }),
  }),

  delete: Joi.object().keys({
    report_id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
    status: Joi.string().valid('Active', 'Inactive').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'Active' or 'Inactive'`,
    }),
  }),

  deleteQuestion: Joi.object().keys({
    report_id: Joi.number().required().messages({
      'number.base'  : `Report id should be a type of 'number'`,
      'number.empty' : `Report id cannot be an empty field`,
    }),
    question_id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
  }),

  updateReportQuestion: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Report Question id should be a type of 'number'`,
      'number.empty' : `Report Question id cannot be an empty field`,
    }),
    title: Joi.string().min(2).max(255).required().messages({
      'string.base'  : `Title name should be a type of 'text'`,
      'string.empty' : `Title name canot be an empty field`,
      'string.min'   : `Title should be minimum of 2 characters`,
      'string.max'   : `Title should be max of 25 characters`,
    }),
    description: Joi.string().optional().messages({
      'string.base': `Description name should be a type of 'text'`,
    }),
    question_type_id: Joi.number().required().messages({
      'number.base'  : `question_type should be a type of 'number'`,
      'number.empty' : `question_type canot be an empty field`,
    }),
    is_for_dynamic_entity : Joi.boolean().optional(),
    entity                : Joi.string().when('question_type_id', {
      is   : Joi.number().valid(4),
      then : Joi.string().required().messages({
        'string.base'  : `Entity name should be a type of 'text'`,
        'string.empty' : `Entity name canot be an empty field`,
      }),
      otherwise: Joi.string().optional().allow('').messages({
        'string.base': `Entity should be a type of 'text'`,
      })
    }),
    dynamic_remark         : Joi.boolean().required(),
    dynamic_allow_multiple : Joi.boolean().required(),
    sequence               : Joi.number().optional().messages({
      'number.base': `sequence id should be a type of 'number'`,
    }),
    is_required     : Joi.boolean().optional(),
    questionOptions : Joi.array().when('question_type_id', {
      is   : Joi.number().valid(1, 2),
      then : Joi.array().min(2).max(6).items(
        Joi.object({
          report_question_option_id : Joi.number().optional(),
          option_key                : Joi.string().optional().messages({
            'string.base': `option_key name should be a type of 'text'`,
          }),
          option_value: Joi.string().min(2).max(255).required().messages({
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
        'array.empty' : `Please select atleast one question option.`,
        'array.min'   : `Please add at least 2 answer options to add question`,
        'array.max'   : `Question option must contain less than or equal to 6 options`,
      }),
    }),
  }),

  submitReport: Joi.object().keys({
    report_id: Joi.number().required().messages({
      'number.base'  : `report_id should be a type of 'number'`,
      'number.empty' : `report_id canot be an empty field`
    }),
    location_id: Joi.number().required().messages({
      'number.base'  : `location_id should be a type of 'number'`,
      'number.empty' : `location_id canot be an empty field`
    }),
    reportAnswers: Joi.array().min(1).required().messages({
      'array.empty': `Please select atleast one question.`,
    }),
    status: Joi.string().valid('submitted', 'draft').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'submitted' or 'draft'`,
    }),
  }),

  employeeList: Joi.object().keys({
    locationIds: Joi.array().min(1).required().messages({
      'array.empty': `Please select atleast one location.`,
    }),
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
    })
  }),

  taskList: Joi.object().keys({
    offset: Joi.number().required().messages({
      'number.base'  : `offset should be a type of 'number'`,
      'number.empty' : `offset cannot be an empty field`,
    }),
    perPage: Joi.number().required().messages({
      'number.base'  : `perPage should be a type of 'number'`,
      'number.empty' : `perPage cannot be an empty field`,
    }),
    locationId: Joi.number().required().messages({
      'number.base'  : `locationId should be a type of 'number'`,
      'number.empty' : `locationId cannot be an empty field`,
    }),
    filters: Joi.object().allow('').optional().messages({
      'object.base': `filters should be a type of 'object'`,
    })
  }),

  noteList: Joi.object().keys({
    offset: Joi.number().required().messages({
      'number.base'  : `offset should be a type of 'number'`,
      'number.empty' : `offset cannot be an empty field`,
    }),
    perPage: Joi.number().required().messages({
      'number.base'  : `perPage should be a type of 'number'`,
      'number.empty' : `perPage cannot be an empty field`,
    }),
    locationId: Joi.number().required().messages({
      'number.base'  : `locationId should be a type of 'number'`,
      'number.empty' : `locationId cannot be an empty field`,
    }),
    filters: Joi.object().allow('').optional().messages({
      'object.base': `filters should be a type of 'object'`,
    })
  }),

  submittedReportHistoryList: Joi.object().keys({
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
    })
  }),
};
