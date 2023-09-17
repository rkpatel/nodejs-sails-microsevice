const Joi = require('joi');
module.exports = {
  idParamValidation: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
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

  add: Joi.object().keys({
    name: Joi.string().min(2).max(50).required().messages({
      'string.base'     : `Name should be a type of 'text'`,
      'string.empty'    : `Name canot be an empty field`,
      'string.required' : `Name is required`,
      'string.min'      : `Name should be minimum of 2 characters`,
      'string.max'      : `Name should be max of 50 characters`,
    }),
    description: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `Description should be minimum of 2 characters`,
      'string.max' : `Description should be max of 100 characters`,
    }),
    dashboard: Joi.string().allow('').valid('Manager', 'Employee').optional().messages({
      'string.base'  : `Dashboard should be a type of 'text'`,
      'string.empty' : `Dashboard canot be an empty field`,
      'string.valid' : `Dashboard should be 'Employee' or 'Manager'`,
    }),
    permissions_ids: Joi.array().required().messages({
      'array.base'  : `Permissions should be a type of 'array'`,
      'array.empty' : `Permissions canot be an empty field`,
    }),
    page: Joi.string().required().messages({
      'string.base'  : `page should be a type of 'text'`,
      'string.empty' : `page canot be an empty field`,
    }),
  }),

  list: Joi.object().keys({
    offset    : Joi.number().optional().empty(),
    perPage   : Joi.number().optional().empty(),
    filters   : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
    sortField : Joi.string().allow('').optional(),
    sortOrder : Joi.string().allow('').optional()
  }),

  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'     : `id should be a type of 'number'`,
      'number.empty'    : `id canot be an empty field`,
      'number.required' : `id is required`,
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.base'     : `Name should be a type of 'text'`,
      'string.empty'    : `Name canot be an empty field`,
      'string.required' : `Name is required`,
      'string.min'      : `Name should be minimum of 2 characters`,
      'string.max'      : `Name should be max of 50 characters`,
    }),
    description: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `Description should be minimum of 2 characters`,
      'string.max' : `Description should be max of 100 characters`,
    }),
    dashboard: Joi.string().allow('').valid('Manager', 'Employee').optional().messages({
      'string.base'  : `Dashboard should be a type of 'text'`,
      'string.empty' : `Dashboard canot be an empty field`,
      'string.valid' : `Dashboard should be 'Employee' or 'Manager'`,
    }),
    permissions_ids: Joi.array().required().messages({
      'array.base'  : `Permissions should be a type of 'array'`,
      'array.empty' : `Permissions canot be an empty field`,
    }),
  }),

};
