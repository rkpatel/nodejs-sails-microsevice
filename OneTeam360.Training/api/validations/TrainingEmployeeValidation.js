const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  add: Joi.object().keys({
    employee_profile_id: Joi.number().required().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    job_type_id: Joi.number().allow('').optional().messages({
      'number.base'  : `job_type_id should be a type of 'number'`,
      'number.empty' : `job_type_id cannot be an empty field`,
    }),
    training_category_id: Joi.number().allow('').optional().messages({
      'number.base'  : `training_category_id should be a type of 'number'`,
      'number.empty' : `training_category_id cannot be an empty field`,
    }),
    training_id: Joi.number().required().messages({
      'number.base'  : `training_id should be a type of 'number'`,
      'number.empty' : `training_id cannot be an empty field`,
    }),
    grade_id: Joi.number().required().messages({
      'number.base'  : `grade_id should be a type of 'number'`,
      'number.empty' : `grade_id cannot be an empty field`,
    }),
    notes: Joi.string().min(0).max(500).allow('').optional().messages({
      'string.base' : `Day should be a type of 'text'`,
      'string.max'  : `Day should be max of 100 characters`,
    }),
  }),

  reTest: Joi.object().keys({
    training_employee_id: Joi.number().required().messages({
      'number.base'  : `training_employee_id should be a type of 'number'`,
      'number.empty' : `training_employee_id cannot be an empty field`,
    }),
    grade_id: Joi.number().required().messages({
      'number.base'  : `grade_id should be a type of 'number'`,
      'number.empty' : `grade_id cannot be an empty field`,
    }),
    notes: Joi.string().min(0).max(500).allow('').optional().messages({
      'string.base' : `Day should be a type of 'text'`,
      'string.max'  : `Day should be max of 100 characters`,
    }),
  }),

  delete: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `skill team member id should be a type of 'number'`,
      'number.empty' : `skill team member id cannot be an empty field`,
    }),
  }),

  findById: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `training team member id should be a type of 'number'`,
      'number.empty' : `training team member id cannot be an empty field`,
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
  })
};
