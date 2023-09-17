const Joi = require('joi');
module.exports = {
  idParamValidation: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
  }),

  addEdit: Joi.object().keys({
    id: Joi.number().allow('').optional().messages({
      'number.base': `id should be a type of 'number'`,
    }),
    name: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `name should be a type of 'text'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 55 characters`,
    }),
    description: Joi.string().allow('').min(2).max(155).required().messages({
      'string.base'  : `description be a type of 'text'`,
      'string.empty' : `description canot be an empty field`,
      'string.min'   : `description should be minimum of 2 characters`,
      'string.max'   : `description should be max of 155 characters`,
    }),
    color: Joi.string().max(50).required().messages({
      'string.base'  : `color should be a type of 'text'`,
      'string.empty' : `color canot be an empty field`,
      'string.max'   : `color should be max of 50 characters`,
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
  employeeIdParamValidation: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
  }),
  jobTypeIds: Joi.object().keys({
    jobTypeIds: Joi.array().required().messages({
      'array.empty': `Please select atleast one Job Type.`,
    }),
  }),
};
