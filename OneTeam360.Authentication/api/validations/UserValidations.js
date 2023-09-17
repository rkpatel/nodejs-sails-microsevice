const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  signup: Joi.object().keys({
    email: Joi.string().required().empty().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
    }),
    password: Joi.string().required().empty().regex(/^[a-zA-Z0-9]{6,16}$/).min(6).max(16).messages({
      'string.base'         : `password should be a type of 'text'`,
      'string.empty'        : `password cannot be an empty field`,
      'string.min'          : 'password should be of minimum 6 characters',
      'string.max'          : 'password should be of maximum 16 characters',
      'string.pattern.base' : 'password must contains lower case, upper case and between 6 and 16 characters',
      'any.required'        : `password is a required field`,
    }),
    role: Joi.string().required().messages({
      'string.base'  : `role should be a type of 'text'`,
      'string.empty' : `role canot be an empty field`,
    }),
    connection: Joi.required().messages({
      'any.required': `connection is a required`,
    })
  }),

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
    portal: Joi.optional().messages({
      'string.base': `portal should be a type of 'text'`,
    }),
    device_id: Joi.optional().messages({
      'string.base'  : `device_id should be a type of 'text'`,
      'string.empty' : `device_id canot be an empty field`,
    }),
    device_os_name: Joi.optional().messages({
      'string.base'  : `device_os_name should be a type of 'text'`,
      'string.empty' : `device_os_name canot be an empty field`,
    }),
    device_os_version: Joi.optional().messages({
      'string.base'  : `device_os_version should be a type of 'text'`,
      'string.empty' : `device_os_version canot be an empty field`,
    }),
    device_info: Joi.optional().allow('').messages({
      'string.base'  : `device_os_version should be a type of 'text'`,
      'string.empty' : `device_os_version canot be an empty field`,
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
      'string.base'         : `Password should be a type of 'text'`,
      'string.empty'        : `Password cannot be an empty field`,
      'string.min'          : 'Password should be of minimum 8 characters',
      'string.max'          : 'Password should be of maximum 16 characters',
      'string.pattern.base' : 'Password must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `Password is a required field`,
    }),
    newpassword: Joi.string().required().empty().regex(/^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]).*$/).min(8).max(16).messages({
      'string.base'         : `new password should be a type of 'text'`,
      'string.empty'        : `new password cannot be an empty field`,
      'string.min'          : 'new password should be of minimum 8 characters',
      'string.max'          : 'new password should be of maximum 16 characters',
      'string.pattern.base' : 'new password must contain at least one uppercase alphabet, lowercase alphabet, number, and special characters.',
      'any.required'        : `new password is a required field`,
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
    emergency_contact_name: Joi.required().messages({
      'string.base'  : `emergency_contact_name should be a type of 'text'`,
      'string.empty' : `emergency_contact_name canot be an empty field`,
    }),
    emergency_contact_relation: Joi.required().messages({
      'string.base'  : `emergency_contact_relation should be a type of 'text'`,
      'string.empty' : `emergency_contact_relation canot be an empty field`,
    }),
    emergency_contact_number: Joi.required().messages({
      'string.base'  : `emergency_contact_number should be a type of 'text'`,
      'string.empty' : `emergency_contact_number canot be an empty field`,
    }),
    emergency_contact_address    : Joi.optional().allow(''),
    emergency_contact_city_id    : Joi.optional().allow(''),
    emergency_contact_state_id   : Joi.optional().allow(''),
    emergency_contact_country_id : Joi.optional().allow(''),
    emergency_contact_zip        : Joi.optional().allow(''),
    date_of_birth                : Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'date_of_birth should be a type of datetime',
      'date.format'  : 'date_of_birth should be in YYYY-MM-DD formate',
      'any.required' : 'date_of_birth is a required field'
    }),
    location_id: Joi.array().required().messages({
      'array.empty': `location_id canot be an empty field`,
    }),
    job_type_id: Joi.array().required().messages({
      'array.empty': `job_type_id canot be an empty field`,
    }),
    dynamic_questions: Joi.array().items(
      Joi.object({
        dynamic_question_id: Joi.number().required().messages({
          'number.base'  : `dynamic_question_id should be a type of 'number'`,
          'number.empty' : `dynamic_question_id cannot be an empty field`
        }),
        dynamic_question_option_id: Joi.number().optional().allow(null).messages({
          'number.base': `dynamic_question_option_id should be a type of 'number'`
        }),
        answer: Joi.string().optional().allow('').allow(null).messages({
          'string.base': `answer should be a type of 'string'`
        })
      })
    )
  }),
  verifyImpersonateToken: Joi.object().keys({
    toekn: Joi.string().required().messages({
      'string.base'  : `toekn should be a type of 'text'`,
      'string.empty' : `toekn cannot be an empty field`,
      'any.required' : `toekn is a required field`,
    }),
  }),
  SignInToAdmin: Joi.object().keys({
    admin_email: Joi.string().required().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
    }),
    customer_email: Joi.string().required().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
    }),
  }),
  SignInToEmployee: Joi.object().keys({
    employee_user_email: Joi.string().required().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
    }),
    customer_email: Joi.string().required().email().messages({
      'string.base'  : `email should be a type of 'text'`,
      'string.empty' : `email cannot be an empty field`,
      'string.email' : `email format not valid`,
      'any.required' : `email is a required field`,
    }),
  })
};
