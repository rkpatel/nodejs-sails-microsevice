const Joi = require('joi');

module.exports = {
  add: Joi.object().keys({
    feedback_category: Joi.string().valid(
      'Manager',
      'Location'
    ),
    question: Joi.string().min(2).max(155).required().messages({
      'string.base'  : `Question should be a type of 'text'`,
      'string.empty' : `Question canot be an empty field`,
      'string.min'   : `Question should be minimum of 2 characters`,
      'string.max'   : `Question should be max of 155 characters`,
    }),
    is_required: Joi.boolean().messages({
      'boolean.base': `is_required should be a type of 'boolean'`,
    }),
    location_id: Joi.any().when('feedback_category', { is   : 'Location', then : Joi.array().required().messages({
      'array.base': `location_id should be a type of 'array'`
    }) , otherwise: Joi.array().optional() })
  }),

  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
    feedback_category: Joi.string().valid(
      'Manager',
      'Location'
    ),
    question: Joi.string().min(2).max(155).required().messages({
      'string.base'  : `Question should be a type of 'text'`,
      'string.empty' : `Question canot be an empty field`,
      'string.min'   : `Question should be minimum of 2 characters`,
      'string.max'   : `Question should be max of 155 characters`,
    }),
    is_required: Joi.boolean().messages({
      'boolean.base': `is_required should be a type of 'boolean'`,
    }),
    location_id: Joi.any().when('feedback_category', { is   : 'Location', then : Joi.array().required().messages({
      'array.base'  : `location_id should be a type of 'array'`,
      'array.empty' : `location_id cannot be an empty array`,
    }) , otherwise: Joi.array().optional() })
  }),

  updateStatus: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id cannot be an empty field`,
    }),
    status: Joi.string().valid(
      'Active',
      'Inactive'
    ),
  }),

  findById: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Question id should be a type of 'number'`,
      'number.empty' : `Question id cannot be an empty field`,
    }),
  }),

  updateSequence: Joi.object().keys({
    feedback_category: Joi.string().required().valid(
      'Manager',
      'Location'
    ),
    draggable_id: Joi.number().required().messages({
      'number.base'  : `draggable_id should be a type of 'number'`,
      'number.empty' : `draggable_id cannot be an empty field`,
    }),
    droppable_id: Joi.number().required().messages({
      'number.base'  : `droppable_id should be a type of 'number'`,
      'number.empty' : `droppable_id cannot be an empty field`,
    }),
  }),
  ManLoclist: Joi.object().keys({
    feedback_category: Joi.string().required().empty().messages({
      'string.base'  : `feedback_category should be a type of 'string'`,
      'string.empty' : `feedback_category cannot be an empty field`,
    }),
    offset    : Joi.number().optional().empty(),
    perPage   : Joi.number().optional().empty(),
    filters   : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
    sortField : Joi.string().allow('').optional(),
    sortOrder : Joi.string().allow('').optional(),
  }),
};
