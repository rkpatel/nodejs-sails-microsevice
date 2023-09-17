const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  findManagerFeedbackReport: Joi.object().keys({
    low_rating          : Joi.boolean().required(),
    employee_profile_id : Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
    offset    : Joi.number().optional().empty(),
    perPage   : Joi.number().optional().empty(),
    filters   : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
    sortField : Joi.string().allow('').optional(),
    sortOrder : Joi.string().allow('').optional(),
    locations : Joi.array().allow('').allow(null).optional().empty(),
    job_types : Joi.array().allow('').allow(null).optional().empty(),
  }),
  findLocationFeedbackByIdReport: Joi.object().keys({
    location_id: Joi.number().required().empty().messages({
      'number.base'  : `location_id should be a type of 'number'`,
      'number.empty' : `location_id canot be an empty field`,
    }),
    team_member_id: Joi.number().required().empty().messages({
      'number.base'  : `team_member_id should be a type of 'number'`,
      'number.empty' : `team_member_id canot be an empty field`,
    }),
    submitted_on: Joi.date().format('YYYY-MM-DD HH:mm:ss').required().raw().messages({
      'date.base'    : 'submitted_on should be a type of datetime',
      'date.format'  : 'submitted_on should be in YYYY-MM-DD format',
      'any.required' : 'submitted_on is a required field'
    }),
  }),
  findManagerFeedbackByIdReport: Joi.object().keys({
    manager_id: Joi.number().required().empty().messages({
      'number.base'  : `manager_id should be a type of 'number'`,
      'number.empty' : `manager_id canot be an empty field`,
    }),
    team_member_id: Joi.number().required().empty().messages({
      'number.base'  : `team_member_id should be a type of 'number'`,
      'number.empty' : `team_member_id canot be an empty field`,
    }),
    submitted_on: Joi.date().format('YYYY-MM-DD HH:mm:ss').required().raw().messages({
      'date.base'    : 'submitted_on should be a type of datetime',
      'date.format'  : 'submitted_on should be in YYYY-MM-DD format',
      'any.required' : 'submitted_on is a required field'
    }),
  }),

  findLocationFeedbackReport: Joi.object().keys({
    low_rating          : Joi.boolean().required(),
    employee_profile_id : Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
    offset    : Joi.number().optional().empty(),
    perPage   : Joi.number().optional().empty(),
    filters   : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
    sortField : Joi.string().allow('').optional(),
    sortOrder : Joi.string().allow('').optional(),
    locations : Joi.array().allow('').allow(null).optional().empty(),
    job_types : Joi.array().allow('').allow(null).optional().empty(),
  }),
};
