const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  pointsAdjustment: Joi.object().keys({
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    points: Joi.number().required().empty().messages({
      'number.base'  : `points should be a type of 'number'`,
      'number.empty' : `points cannot be an empty field`,
    }),
    reason: Joi.string().required().empty().messages({
      'string.base'  : `reason should be a type of 'string'`,
      'string.empty' : `reason cannot be an empty field`,
    }),
  }),
  list: Joi.object().keys({
    employee_profile_id : Joi.number().optional().allow(''),
    offset              : Joi.number().optional().empty(),
    perPage             : Joi.number().optional().empty(),
    filters             : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
    sortField           : Joi.string().allow('').optional(),
    sortOrder           : Joi.string().allow('').optional(),
    created_date_from   : Joi.string().allow('').optional(),
    created_date_to     : Joi.string().allow('').optional(),
    includezeros        : Joi.boolean().allow('').optional(),
  }),
  interactionHistory: Joi.object().keys({
    date: Joi.string().required().raw().messages({
      'string.base'  : `date should be a type of 'string'`,
      'string.empty' : 'date is a required field',
    }),
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `value should be a type of 'number'`,
      'number.empty' : `value cannot be an empty field`,
    }),
  }),
};
