/* eslint-disable key-spacing */
/* eslint-disable camelcase */
const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  Add: Joi.object().keys({
    first_name: Joi.string().min(2).max(25).required().messages({
      'string.base': `first_name should be a type of 'text'`,
      'string.empty': `first_name canot be an empty field`,
      'string.min': `first_name should be minimum of 2 characters`,
      'string.max': `first_name should be max of 25 characters`,
    }),
    last_name: Joi.string().min(2).max(25).required().messages({
      'string.base': `last_name should be a type of 'text'`,
      'string.empty': `last_name canot be an empty field`,
      'string.min': `last_name should be minimum of 2 characters`,
      'string.max': `last_name should be max of 25 characters`,
    }),
    email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base': `email should be a type of 'text'`,
      'string.empty': `email cannot be an empty field`,
      'string.email': `email format not valid`,
      'any.required': `email is a required field`,
      'string.min': `email should be minimum of 5 characters`,
      'string.max': `email should be max of 80 characters`,
    }),
    date_of_birth: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base': 'date_of_birth should be a type of datetime',
      'date.format': 'date_of_birth should be in YYYY-MM-DD formate',
      'any.required': 'date_of_birth is a required field'
    }),

    date_of_joining: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base': 'date_of_birth should be a type of datetime',
      'date.format': 'date_of_birth should be in YYYY-MM-DD formate',
      'any.required': 'date_of_birth is a required field'
    }),
    profile_picture_url: Joi.string().optional().messages({
      'string.base': `profile_picture_url should be a type of 'text'`,
      'string.empty': `profile_picture_url canot be an empty field`,
    }),
    location_id: Joi.array().required().messages({
      'array.empty': `location_id canot be an empty field`,
    }),
    job_type_id: Joi.array().required().messages({
      'array.empty': `job_type_id canot be an empty field`,
    }),

    emergency_contact_name: Joi.optional().allow('').messages({
      'string.base': `emergency_contact_name should be a type of 'text'`
    }),
    emergency_contact_relation: Joi.optional().allow('').messages({
      'string.base': `emergency_contact_relation should be a type of 'text'`
    }),
    emergency_contact_number: Joi.optional().allow('').messages({
      'string.base': `emergency_contact_number should be a type of 'text'`
    }),
    emergency_contact_address: Joi.optional().messages({
      'string.base': `emergency_contact_address should be a type of 'text'`,
      'string.empty': `emergency_contact_address canot be an empty field`,
    }),

    emergency_contact_city_id: Joi.number().optional().messages({
      'string.base': `emergency_contact_city_id should be a type of 'number'`,
      'string.empty': `emergency_contact_city_id canot be an empty field`,
    }),
    emergency_contact_state_id: Joi.number().optional().messages({
      'string.base': `emergency_contact_state_id should be a type of 'number'`,
      'string.empty': `emergency_contact_state_id canot be an empty field`,
    }),
    emergency_contact_country_id: Joi.number().optional().messages({
      'string.base': `emergency_contact_country_id should be a type of 'number'`,
      'string.empty': `emergency_contact_country_id canot be an empty field`,
    }),
    emergency_contact_zip: Joi.optional().messages({
      'string.base': `emergency_contact_zip should be a type of 'text'`,
      'string.empty': `emergency_contact_zip canot be an empty field`,
    }),

    phone: Joi.number().required().messages({
      'number.base': `phone should be a type of 'number'`,
      'number.empty': `phone canot be an empty field`,
    }),
    role_id: Joi.number().required().messages({
      'number.base': `role_id should be a type of 'number'`,
      'number.empty': `role canot be an empty field`,
    }),
    team_member_id: Joi.string().regex(/^[a-zA-Z0-9]{0,30}$/).max(30).optional().allow('').allow(null).messages({
      'string.base': `team_member_id should be a type of 'text'`,
      'string.max': `team_member_id should be max of 30 characters`,
    }),
  }),

  Edit: Joi.object().keys({
    id: Joi.number(),
    first_name: Joi.string().min(2).max(25).required().messages({
      'string.base': `first_name should be a type of 'text'`,
      'string.empty': `first_name canot be an empty field`,
      'string.min': `first_name should be minimum of 2 characters`,
      'string.max': `first_name should be max of 25 characters`,
    }),
    last_name: Joi.string().min(2).max(25).required().messages({
      'string.base': `last_name should be a type of 'text'`,
      'string.empty': `last_name canot be an empty field`,
      'string.min': `last_name should be minimum of 2 characters`,
      'string.max': `last_name should be max of 25 characters`,
    }),
    date_of_birth: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base': 'date_of_birth should be a type of datetime',
      'date.format': 'date_of_birth should be in YYYY-MM-DD format',
      'any.required': 'date_of_birth is a required field'
    }),
    date_of_joining: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base': 'date_of_joining should be a type of datetime',
      'date.format': 'date_of_joining should be in YYYY-MM-DD format',
      'any.required': 'date_of_joining is a required field'
    }),
    profile_picture_url: Joi.string().optional().messages({
      'string.base': `profile_picture_url should be a type of 'text'`,
      'string.empty': `profile_picture_url canot be an empty field`,
    }),
    location_id: Joi.array().required().messages({
      'array.empty': `location_id canot be an empty field`,
    }),
    job_type_id: Joi.array().required().messages({
      'array.empty': `job_type_id canot be an empty field`,
    }),
    email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base': `email should be a type of 'text'`,
      'string.empty': `email cannot be an empty field`,
      'string.email': `email format not valid`,
      'any.required': `email is a required field`,
      'string.min': `email should be minimum of 5 characters`,
      'string.max': `email should be max of 80 characters`,
    }),
    emergency_contact_name: Joi.optional().allow('').messages({
      'string.base': `emergency_contact_name should be a type of 'text'`
    }),
    emergency_contact_relation: Joi.optional().allow('').messages({
      'string.base': `emergency_contact_relation should be a type of 'text'`
    }),
    emergency_contact_number: Joi.optional().allow('').messages({
      'string.base': `emergency_contact_number should be a type of 'text'`
    }),
    emergency_contact_address: Joi.optional().messages({
      'string.base': `emergency_contact_address should be a type of 'text'`,
      'string.empty': `emergency_contact_address canot be an empty field`,
    }),

    emergency_contact_city_id: Joi.number().optional().messages({
      'string.base': `emergency_contact_city_id should be a type of 'number'`,
      'string.empty': `emergency_contact_city_id canot be an empty field`,
    }),
    emergency_contact_state_id: Joi.number().optional().messages({
      'string.base': `emergency_contact_state_id should be a type of 'number'`,
      'string.empty': `emergency_contact_state_id canot be an empty field`,
    }),
    emergency_contact_country_id: Joi.number().optional().messages({
      'string.base': `emergency_contact_country_id should be a type of 'number'`,
      'string.empty': `emergency_contact_country_id canot be an empty field`,
    }),
    emergency_contact_zip: Joi.optional().messages({
      'string.base': `emergency_contact_zip should be a type of 'text'`,
      'string.empty': `emergency_contact_zip canot be an empty field`,
    }),
    phone: Joi.number().required().messages({
      'number.base': `phone should be a type of 'number'`,
      'number.empty': `phone canot be an empty field`,
    }),
    role_id: Joi.number().required().messages({
      'number.base': `role_id should be a type of 'number'`,
      'number.empty': `role canot be an empty field`,
    }),
    team_member_id: Joi.string().regex(/^[a-zA-Z0-9]{0,30}$/).max(30).optional().allow('').allow(null).messages({
      'string.base': `team_member_id should be a type of 'text'`,
      'string.max': `team_member_id should be max of 30 characters`,
    }),
    questionAnswers: Joi.array().optional().messages({
      'array.base': `questionOptions should be a type of 'array'`,
      'array.empty': `questionOptions canot be an empty field`,
    }),
  }),

  Find: Joi.object().keys({
    first: Joi.number().required().messages({
      'number.base'  : `first should be a type of 'number'`,
      'number.empty' : `first cannot be an empty field`,
    }),
    rows: Joi.number().required().messages({
      'number.base'  : `rows should be a type of 'number'`,
      'number.empty' : `rows cannot be an empty field`,
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
    employee_profile_id: Joi.number().optional().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
    search: Joi.string().optional().allow('').messages({
      'string.base': `search should be a type of 'text'`
    }),
  }),

  bulkAdd: Joi.object().keys({
    name: Joi.string().required().messages({
      'string.base': `name should be a type of 'text'`,
      'string.empty': `name canot be an empty field`,
    }),
    email: Joi.string().required().empty().email().messages({
      'string.base': `email should be a type of 'text'`,
      'string.empty': `email cannot be an empty field`,
      'string.email': `email format not valid`,
      'any.required': `email is a required field`,
    }),
    password: Joi.string().required().empty().regex(/^[a-zA-Z0-9]{6,16}$/).min(6).max(16).messages({
      'string.base': `password should be a type of 'text'`,
      'string.empty': `password cannot be an empty field`,
      'string.min': 'password should be of minimum 6 characters',
      'string.max': 'password should be of maximum 16 characters',
      'string.pattern.base': 'password must contains lower case, upper case and between 6 and 16 characters',
      'any.required': `password is a required field`,
    }),
    role_id: Joi.number().required().messages({
      'number.empty': `role canot be an empty field`,
    }),
    phone: Joi.string().regex(/^\d+$/).messages({
      'string.empty': `phone canot be an empty field`,
      'string.pattern.base': 'phone must contains only number',
    }),
    // date_of_birth: Joi.date().format('M/DD/YYYY').raw().required().messages({
    //   'date.base'    : 'date_of_birth should be a type of datetime',
    //   'date.format'  : 'date_of_birth should be in M/DD/YYYY formate',
    //   'any.required' : 'date_of_birth is a required field'
    // }),
    date_of_birth: Joi.string(),
    department_id: Joi.string().required().messages({
      'number.empty': `department_id canot be an empty field`,
    }),
    image: Joi.optional(),
    // date_of_joining : Joi.date().format('MM/DD/YYYY').required().raw().messages({
    //   'date.base'    : 'date_of_joining should be a type of datetime',
    //   'date.formate' : 'date_of_joining should be in MM/DD/YYYY formate',
    //   'any.required' : 'date_of_joining is a required field'
    // }),
    date_of_joining: Joi.string(),
    location_id: Joi.string().required().messages({
      'number.empty': `location_id canot be an empty field`,
    }),
    skill_id: Joi.string().required().messages({
      'number.empty': `skill_id canot be an empty field`,
    }),
    relative_name: Joi.optional().required().messages({
      'string.base': `name should be a type of 'text'`,
      'string.empty': `name canot be an empty field`,
    }),
    relation: Joi.optional().required().messages({
      'string.base': `relation should be a type of 'text'`,
      'string.empty': `relation canot be an empty field`,
    }),
    relative_phone: Joi.optional().required().messages({
      'string.base': `name should be a type of 'text'`,
      'string.empty': `name canot be an empty field`,
    }),
    relative_address: Joi.optional().required().messages({
      'string.base': `name should be a type of 'text'`,
      'string.empty': `name canot be an empty field`,
    }),
    team_member_id: Joi.string().regex(/^[a-zA-Z0-9]{0,30}$/).max(30).optional().messages({
      'string.base': `team_member_id should be a type of 'text'`,
      'string.max': `team_member_id should be max of 30 characters`,
    }),
  }),

  updateStatus: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    status: Joi.string().valid('Active', 'Inactive', 'Reset').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'Active' or 'Inactive'`,
    }),

  }),
  filter: Joi.object().keys({
    location: Joi.boolean().required(),
    phone: Joi.boolean().required(),
    job_type: Joi.boolean().required(),
    total_points: Joi.boolean().required(),
    level: Joi.boolean().required(),
    id: Joi.boolean().required(),
    contact_name: Joi.boolean().required(),
    relation: Joi.boolean().required(),
    emergency_phone: Joi.boolean().required(),
    other_details: Joi.string().optional().allow('').messages({
      'string.base'  : `other_details should be a type of 'text'`
    }),
  }),
  uploadProfilePicture: Joi.object().keys({
    user_id: Joi.number().required().messages({
      'number.base'  : `user_id should be a type of 'number'`,
      'number.empty' : `user_id canot be an empty field`,
    }),
    profile_picture: Joi.any().optional().empty().messages({
      'any.empty': `profile_picture cannot be an empty field`,
    })
  }),
};
