const Joi = require('joi');
module.exports = {
  add: Joi.object().keys({
    name: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `name should be a type of 'string'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 55 characters`,
    }),
    description: Joi.string().allow('').min(2).max(155).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 155 characters`,
    }),
  }),

  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    name: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `name should be a type of 'string'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 55 characters`,
    }),
    description: Joi.string().allow('').min(2).max(155).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 155 characters`,
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

  })
};
