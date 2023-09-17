const Joi = require('joi');
module.exports = {
  idParamValidation: Joi.object().keys({
    certificate_type_id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
  }),

  addEdit: Joi.object().keys({
    certificate_type_id: Joi.number().allow('').optional().messages({
      'number.base': `id should be a type of 'number'`,
    }),
    job_types: Joi.array().required().messages({
      'array.empty': `Please select atleast one Job Type.`,
    }),
    name: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `name should be a type of 'text'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 55 characters`,
    }),
    description: Joi.string().allow('').min(2).max(155).optional().messages({
      'string.base' : `description be a type of 'text'`,
      'string.min'  : `description should be minimum of 2 characters`,
      'string.max'  : `description should be max of 155 characters`,
    }),
    auto_assign: Joi.boolean().allow('').optional().messages({
      'number.base': `auto_assign should be a type of 'boolean'`,
    }),
    assign_existing: Joi.boolean().allow('').optional().messages({
      'number.base': `assign_existing should be a type of 'boolean'`,
    })
  }),
  updateStatus: Joi.object().keys({
    certificate_type_id: Joi.number().required().messages({
      'number.base'  : `certificate_type_id should be a type of 'number'`,
      'number.empty' : `certificate_type_id canot be an empty field`,
    }),
    status: Joi.string().valid('Active', 'Inactive').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'Active' or 'Inactive'`,
    }),
  })
};
