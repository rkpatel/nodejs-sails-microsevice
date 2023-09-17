const Joi = require('joi');
module.exports = {
  idParamValidation: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
  }),
  findNotificationTemplate: Joi.object().keys({
    code: Joi.string().required().messages({
      'string.base'  : `code should be a type of 'text'`,
      'string.empty' : `code canot be an empty field`,
    }),
    type: Joi.string().required().messages({
      'string.base'  : ` type be a type of 'text'`,
      'string.empty' : `type canot be an empty field`,
    }),
  }),
  bulkImport: Joi.object().keys({
    export_file: Joi.string().required().messages({
      'string.base'  : `export_file should be a type of 'text'`,
      'string.empty' : `export_file canot be an empty field`,
    })
  }),
  bulkAdd: Joi.object().options({ abortEarly: false }).keys({
    first_name: Joi.string().min(2).max(25).required().messages({
      'string.base'     : `first_name should be a type of 'text'`,
      'string.empty'    : `First name is required`,
      'string.min'      : `first_name should be minimum of 2 characters`,
      'string.max'      : `first_name should be max of 25 characters`,
      'string.required' : 'First name is required'
    }),
    last_name: Joi.string().min(2).max(25).required().messages({
      'string.base'  : `last_name should be a type of 'text'`,
      'string.empty' : `Last name is required`,
      'string.min'   : `last_name should be minimum of 2 characters`,
      'string.max'   : `last_name should be max of 25 characters`,
      'any.required' : 'Last name is required'
    }),
    email: Joi.string().min(5).max(80).required().empty().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).messages({
      'string.base'         : `email should be a type of 'text'`,
      'string.empty'        : `Email is a required field`,
      'string.pattern.base' : 'Invalid email address',
      'string.min'          : `Email should be minimum of 5 characters`,
      'string.max'          : `Email should be max of 80 characters`,
      'any.required'        : `Email is a required field`,
    }),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).empty().required().messages({
      'string.base'         : `Contact number is invalid`,
      'string.empty'        : `Contact number is mandatory field`,
      'string.length'       : `Contact number is invalid`,
      'string.pattern.base' : 'Contact number is invalid',
      'any.required'        : 'Contact number is mandatory field'
    }),

    date_of_birth: Joi.string().optional().allow('').messages({
      'string.base': 'date_of_birth should be a type of string',
    }),

    date_of_joining: Joi.string().empty().required().messages({
      'string.base'  : 'date_of_joining should be a type of string',
      'string.empty' : `Date of joining is required`,
      'any.required' : 'Date of joining is required'
    }),
    locations: Joi.string().optional().allow('').messages({
      'string.empty': `Location is required`,
    }),
    job_types: Joi.string().optional().allow('').messages({
      'string.empty': `Job Type is required`,
    }),
    // role: Joi.string().empty().required().messages({
    //   'string.base'  : `role_id should be a type of 'string'`,
    //   'string.empty' : `Role is required`,
    //   'any.required' : 'Role is required'
    // }),
    emergency_contact_name: Joi.string().optional().allow('').min(2).max(25).messages({
      'string.base'  : `emergency_contact_name should be a type of 'text'`,
      'string.empty' : `emergency_contact_name canot be an empty field`,
      'string.min'   : 'emergency_contact_name should be minimum of 2 characters',
      'string.max'   : 'emergency_contact_name should be maximum of 25 characters',
    }),
    emergency_contact_relation: Joi.string().optional().allow('').min(2).max(25).messages({
      'string.base'  : `emergency_contact_relation should be a type of 'text'`,
      'string.empty' : `emergency_contact_relation canot be an empty field`,
      'string.min'   : 'emergency_contact_relation should be minimum of 2 characters',
      'string.max'   : 'emergency_contact_relation should be maximum of 25 characters',
    }),
    emergency_contact_number: Joi.string().length(10).pattern(/^[0-9]+$/).optional().allow('').messages({
      'string.base'         : `emergency_contact_number should be a type of 'text'`,
      'string.empty'        : `emergency_contact_number canot be an empty field`,
      'string.length'       : `Invalid emergency contact number provided`,
      'string.pattern.base' : 'Invalid emergency contact number provided',
    }),
    emergency_contact_address: Joi.string().optional().allow('').max(80).messages({
      'string.base'  : `emergency_contact_address should be a type of 'text'`,
      'string.empty' : `emergency_contact_address canot be an empty field`,
      'string.max'   : 'emergency_contact_address should be maximum of 80 characters',
    }),
    emergency_contact_country: Joi.string().allow('').optional().messages({
      'string.base'  : `emergency_contact_country should be a type of 'string'`,
      'string.empty' : `emergency_contact_country canot be an empty field`,
    }),
    emergency_contact_state: Joi.string().allow('').optional().messages({
      'string.base'  : `emergency_contact_state should be a type of 'string'`,
      'string.empty' : `emergency_contact_state canot be an empty field`,
    }),
    emergency_contact_city: Joi.string().allow('').optional().messages({
      'string.base'  : `emergency_contact_city should be a type of 'string'`,
      'string.empty' : `emergency_contact_city canot be an empty field`,
    }),
    emergency_contact_zip: Joi.string().min(5).max(9).optional().allow('').messages({
      'string.base'  : `emergency_contact_zip should be a type of 'text'`,
      'string.empty' : `emergency_contact_zip canot be an empty field`,
      'string.min'   : 'emergency_contact_zip should be minimum of 5 characters',
      'string.max'   : 'emergency_contact_zip should be maximum of 9 characters',
    }),
    team_member_id: Joi.string().regex(/^[a-zA-Z0-9]{0,30}$/).max(30).optional().allow('').messages({
      'string.base' : `team_member_id should be a type of 'text'`,
      'string.max'  : `team_member_id should be max of 30 characters`,
    }),


  }),
};
