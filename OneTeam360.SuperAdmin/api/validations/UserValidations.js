const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');
const Joi = JoiBase.extend(JoiDate);
module.exports = {
  login: Joi.object().keys({
    email: Joi.string().required().empty().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).messages({
      'string.base'         : `email should be a type of 'text'`,
      'string.empty'        : `email cannot be an empty field`,
      'string.pattern.base' : 'email format not valid',
      'any.required'        : `email is a required field`,
    }),
    password: Joi.string().required().empty().messages({
      'string.base'  : `password should be a type of 'text'`,
      'string.empty' : `password cannot be an empty field`,
      'any.required' : `password is a required field`,
    }),
    itoken: Joi.optional().messages({
      'string.base': `itoken should be a type of 'text'`,
    }),
  }),
  Add: Joi.object().keys({
    first_name: Joi.string().min(2).max(25).required().messages({
      'string.base'  : `first_name should be a type of 'text'`,
      'string.empty' : `first_name canot be an empty field`,
      'string.min'   : `first_name should be minimum of 2 characters`,
      'string.max'   : `first_name should be max of 25 characters`,
    }),
    last_name: Joi.string().min(2).max(25).required().messages({
      'string.base'  : `last_name should be a type of 'text'`,
      'string.empty' : `last_name canot be an empty field`,
      'string.min'   : `last_name should be minimum of 2 characters`,
      'string.max'   : `last_name should be max of 25 characters`,
    }),
    email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
      'string.min'   : `email should be minimum of 5 characters`,
      'string.max'   : `email should be max of 80 characters`,
    }),
    date_of_birth: Joi.date().format('YYYY-MM-DD').optional().raw().messages({
      'date.base'   : 'date_of_birth should be a type of datetime',
      'date.format' : 'date_of_birth should be in YYYY-MM-DD formate'
    }),
    profile_picture_url: Joi.string().optional().messages({
      'string.base'  : `profile_picture_url should be a type of 'text'`,
      'string.empty' : `profile_picture_url cannot be an empty field`,
    }),
    emergency_contact_name: Joi.optional().messages({
      'string.base'  : `emergency_contact_name should be a type of 'text'`,
      'string.empty' : `emergency_contact_name cannot be an empty field`,
    }),
    emergency_contact_relation: Joi.optional().messages({
      'string.base'  : `emergency_contact_relation should be a type of 'text'`,
      'string.empty' : `emergency_contact_relation cannot be an empty field`,
    }),
    emergency_contact_number: Joi.optional().messages({
      'string.base'  : `emergency_contact_number should be a type of 'text'`,
      'string.empty' : `emergency_contact_number cannot be an empty field`,
    }),
    emergency_contact_address: Joi.optional().messages({
      'string.base'  : `emergency_contact_address should be a type of 'text'`,
      'string.empty' : `emergency_contact_address cannot be an empty field`,
    }),

    emergency_contact_city_id: Joi.number().optional().messages({
      'string.base'  : `emergency_contact_city_id should be a type of 'number'`,
      'string.empty' : `emergency_contact_city_id cannot be an empty field`,
    }),
    emergency_contact_state_id: Joi.number().optional().messages({
      'string.base'  : `emergency_contact_state_id should be a type of 'number'`,
      'string.empty' : `emergency_contact_state_id cannot be an empty field`,
    }),
    emergency_contact_country_id: Joi.number().optional().messages({
      'string.base'  : `emergency_contact_country_id should be a type of 'number'`,
      'string.empty' : `emergency_contact_country_id cannot be an empty field`,
    }),
    emergency_contact_zip: Joi.optional().messages({
      'string.base'  : `emergency_contact_zip should be a type of 'text'`,
      'string.empty' : `emergency_contact_zip cannot be an empty field`,
    }),
    phone: Joi.number().required().messages({
      'number.base'  : `phone should be a type of 'number'`,
      'number.empty' : `phone cannot be an empty field`,
    }),
  }),

  Edit: Joi.object().keys({
    id         : Joi.number(),
    first_name : Joi.string().min(2).max(25).required().messages({
      'string.base'  : `first_name should be a type of 'text'`,
      'string.empty' : `first_name canot be an empty field`,
      'string.min'   : `first_name should be minimum of 2 characters`,
      'string.max'   : `first_name should be max of 25 characters`,
    }),
    last_name: Joi.string().min(2).max(25).required().messages({
      'string.base'  : `last_name should be a type of 'text'`,
      'string.empty' : `last_name canot be an empty field`,
      'string.min'   : `last_name should be minimum of 2 characters`,
      'string.max'   : `last_name should be max of 25 characters`,
    }),
    email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
      'string.min'   : `email should be minimum of 5 characters`,
      'string.max'   : `email should be max of 80 characters`,
    }),
    date_of_birth: Joi.date().format('YYYY-MM-DD').optional().raw().messages({
      'date.base'   : 'date_of_birth should be a type of datetime',
      'date.format' : 'date_of_birth should be in YYYY-MM-DD formate'
    }),
    profile_picture_url: Joi.string().optional().messages({
      'string.base'  : `profile_picture_url should be a type of 'text'`,
      'string.empty' : `profile_picture_url canot be an empty field`,
    }),
    emergency_contact_name: Joi.string().optional().messages({
      'string.base'  : `emergency_contact_name should be a type of 'text'`,
      'string.empty' : `emergency_contact_name canot be an empty field`,
    }),
    emergency_contact_relation: Joi.string().optional().messages({
      'string.base'  : `emergency_contact_relation should be a type of 'text'`,
      'string.empty' : `emergency_contact_relation canot be an empty field`,
    }),
    emergency_contact_number: Joi.number().optional().messages({
      'string.base'  : `emergency_contact_number should be a type of 'text'`,
      'string.empty' : `emergency_contact_number canot be an empty field`,
    }),
    emergency_contact_address: Joi.optional().messages({
      'string.base'  : `emergency_contact_address should be a type of 'text'`,
      'string.empty' : `emergency_contact_address canot be an empty field`,
    }),

    emergency_contact_city_id: Joi.number().optional().messages({
      'string.base'  : `emergency_contact_city_id should be a type of 'number'`,
      'string.empty' : `emergency_contact_city_id canot be an empty field`,
    }),
    emergency_contact_state_id: Joi.number().optional().messages({
      'string.base'  : `emergency_contact_state_id should be a type of 'number'`,
      'string.empty' : `emergency_contact_state_id canot be an empty field`,
    }),
    emergency_contact_country_id: Joi.number().optional().messages({
      'string.base'  : `emergency_contact_country_id should be a type of 'number'`,
      'string.empty' : `emergency_contact_country_id canot be an empty field`,
    }),
    emergency_contact_zip: Joi.optional().messages({
      'string.base'  : `emergency_contact_zip should be a type of 'text'`,
      'string.empty' : `emergency_contact_zip canot be an empty field`,
    }),
    phone: Joi.number().required().messages({
      'number.base'  : `phone should be a type of 'number'`,
      'number.empty' : `phone canot be an empty field`,
    }),
  }),

  forgotPassword: Joi.object().keys({
    email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
    }),
  }),
  signInCustomer: Joi.object().keys({
    admin_email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format is invalid`,
      'any.required' : `email is a required field`,
    }),
    customer_email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format is invalid`,
      'any.required' : `email is a required field`,
    }),
  }),

  resetPassword: Joi.object().keys({
    password: Joi.string().required().empty().regex(/^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]).*$/).min(8).max(16).messages({
      'string.base'         : `password should be a type of 'text'`,
      'string.empty'        : `password cannot be an empty field`,
      'string.min'          : 'password should be of minimum 8 characters',
      'string.max'          : 'password should be of maximum 16 characters',
      'string.pattern.base' : 'Password must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `password is a required field`,
    }),
  }),

  changePassword: Joi.object().keys({
    password: Joi.string().required().empty().regex(/^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]).*$/).min(8).max(16).messages({
      'string.base'         : `confirmpassword should be a type of 'text'`,
      'string.empty'        : `confirmpassword cannot be an empty field`,
      'string.min'          : 'confirmpassword should be of minimum 8 characters',
      'string.max'          : 'confirmpassword should be of maximum 16 characters',
      'string.pattern.base' : 'confirmpassword must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `confirmpassword is a required field`,
    }),
    newpassword: Joi.string().required().empty().regex(/^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]).*$/).min(8).max(16).messages({
      'string.base'         : `confirmpassword should be a type of 'text'`,
      'string.empty'        : `confirmpassword cannot be an empty field`,
      'string.min'          : 'confirmpassword should be of minimum 8 characters',
      'string.max'          : 'confirmpassword should be of maximum 16 characters',
      'string.pattern.base' : 'confirmpassword must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `confirmpassword is a required field`,
    }),
    confirmpassword: Joi.string().required().empty().regex(/^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]).*$/).min(8).max(16).messages({
      'string.base'         : `confirmpassword should be a type of 'text'`,
      'string.empty'        : `confirmpassword cannot be an empty field`,
      'string.min'          : 'confirmpassword should be of minimum 8 characters',
      'string.max'          : 'confirmpassword should be of maximum 16 characters',
      'string.pattern.base' : 'confirmpassword must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `confirmpassword is a required field`,
    })
  }),

  createPassword: Joi.object().keys({
    password: Joi.string().required().empty().regex(/^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]).*$/).min(8).max(16).messages({
      'string.base'         : `password should be a type of 'text'`,
      'string.empty'        : `password cannot be an empty field`,
      'string.min'          : 'password should be of minimum 8 characters',
      'string.max'          : 'password should be of maximum 16 characters',
      'string.pattern.base' : 'password must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `password is a required field`,
    }),
    confirmpassword: Joi.string().required().empty().regex(/^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]).*$/).min(8).max(16).messages({
      'string.base'         : `confirmpassword should be a type of 'text'`,
      'string.empty'        : `confirmpassword cannot be an empty field`,
      'string.min'          : 'confirmpassword should be of minimum 8 characters',
      'string.max'          : 'confirmpassword should be of maximum 16 characters',
      'string.pattern.base' : 'confirmpassword must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `confirmpassword is a required field`,
    }),
  }),
  updateStatus: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
  })
};
