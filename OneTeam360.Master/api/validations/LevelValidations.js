const Joi = require('joi');
module.exports = {
  add: Joi.object().keys({
    name: Joi.string().min(2).max(25).required().messages({
      'string.base'  : `name should be a type of 'string'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 25 characters`,
    }),
    description: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 100 characters`,
    }),
    range: Joi.number().required().messages({
      'number.base'  : `range should be a type of 'number'`,
      'number.empty' : `range canot be an empty field`,
    }),
    points_range_from: Joi.number().required().messages({
      'number.base'  : `points_range_from should be a type of 'number'`,
      'number.empty' : `points_range_from canot be an empty field`,
    }),
    points_range_to: Joi.number().required().messages({
      'number.base'  : `points_range_to should be a type of 'number'`,
      'number.empty' : `points_range_to canot be an empty field`,
    }),
  }),

  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    name: Joi.string().min(2).max(25).required().messages({
      'string.base'  : `name should be a type of 'string'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 25 characters`,
    }),
    range: Joi.number().required().messages({
      'number.base'  : `range should be a type of 'number'`,
      'number.empty' : `range canot be an empty field`,
    }),
    description: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 100 characters`,
    }),
    points_range_from: Joi.number().required().messages({
      'number.base'  : `points_range_from should be a type of 'number'`,
      'number.empty' : `points_range_from canot be an empty field`,
    }),
    points_range_to: Joi.number().required().messages({
      'number.base'  : `points_range_to should be a type of 'number'`,
      'number.empty' : `points_range_to canot be an empty field`,
    }),
  }),

  updateStatus: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    status: Joi.string().valid('Active', 'Inactive').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'Active' or 'Inactive'`,
    }),
  }),

};
