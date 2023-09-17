const Joi = require('joi');
module.exports = {
  add: Joi.object().keys({
    name: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `name should be a type of 'string'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 55 characters`,
    }),
    parent_location_id: Joi.number().allow('').optional().messages({
      'number.base': `parentLocation should be a type of 'number'`,
    }),
    description: Joi.string().allow('').min(2).max(155).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 155 characters`,
    }),
    address_1: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `address1 should be minimum of 2 characters`,
      'string.max' : `address1 should be max of 100 characters`,
    }),
    address_2: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `address2 should be minimum of 2 characters`,
      'string.max' : `address2 should be max of 100 characters`,
    }),
    country_id: Joi.number().required().messages({
      'number.base'  : `country should be a type of 'number'`,
      'number.empty' : `country canot be an empty field`,
    }),
    state_id: Joi.number().required().messages({
      'number.base'  : `state should be a type of 'number'`,
      'number.empty' : `state canot be an empty field`,
    }),
    city_id: Joi.number().required().messages({
      'number.base'  : `city should be a type of 'number'`,
      'number.empty' : `city canot be an empty field`,
    }),
    zip: Joi.string().allow('').min(5).max(9).optional().messages({
      'string.base' : `zipcode should be a type of 'string'`,
      'string.min'  : `zipcode should be minimum of 5 characters`,
      'string.max'  : `zipcode should be max of 9 characters`,
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
    parent_location_id: Joi.number().allow('').optional().messages({
      'number.base': `parentLocation should be a type of 'number'`,
    }),
    description: Joi.string().allow('').min(2).max(155).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 155 characters`,
    }),
    address_1: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `address1 should be minimum of 2 characters`,
      'string.max' : `address1 should be max of 100 characters`,
    }),
    address_2: Joi.string().allow('').min(2).max(100).optional().messages({
      'string.min' : `address2 should be minimum of 2 characters`,
      'string.max' : `address2 should be max of 100 characters`,
    }),
    country_id: Joi.number().required().messages({
      'number.base'  : `country should be a type of 'number'`,
      'number.empty' : `country canot be an empty field`,
    }),
    state_id: Joi.number().required().messages({
      'number.base'  : `state should be a type of 'number'`,
      'number.empty' : `state canot be an empty field`,
    }),
    city_id: Joi.number().required().messages({
      'number.base'  : `city should be a type of 'number'`,
      'number.empty' : `city canot be an empty field`,
    }),
    zip: Joi.string().allow('').min(5).max(9).optional().messages({
      'string.base' : `zipCode should be a type of 'string'`,
      'string.min'  : `zipCode should be minimum of 5 characters`,
      'string.max'  : `zipCode should be max of 9 characters`,
    }),
  }),

  updateStatus: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base': `id should be a type of 'number'`,
    }),
    status: Joi.string().valid('Active', 'Inactive').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'Active' or 'Inactive'`,
    }),

  }),

  findCommonLocations: Joi.object().keys({
    employee_profile_ids: Joi.array().min(2).required().messages({
      'array.base'  : `employee_profile_ids should be a type of 'array'`,
      'array.empty' : `employee_profile_ids canot be an empty field`,
      'array.min'   : `employee_profile_ids should contain minimum 2 values`,
    })
  }),
};
