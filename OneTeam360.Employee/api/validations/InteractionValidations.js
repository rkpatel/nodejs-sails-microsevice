const Joi = require('joi');
module.exports = {
  add: Joi.object().keys({
    employee_profile_id: Joi.number().required().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
    notes: Joi.string().min(0).max(500).allow('').optional().messages({
      'string.base' : `notes should be a type of 'text'`,
      'string.max'  : `notes should be max of 100 characters`,
    }),
    interaction_factors: Joi.array().required().messages({
      'array.base'  : `interaction_factors should be a type of 'array'`,
      'array.empty' : `Please select grade to rate an interaction`,
    }),
  }),

  graph: Joi.object().keys({
    level_id: Joi.number().required().messages({
      'number.base'  : `level_id should be a type of 'number'`,
      'number.empty' : `level_id canot be an empty field`,
    }),
    employee_profile_id: Joi.number().required().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
  })
};

