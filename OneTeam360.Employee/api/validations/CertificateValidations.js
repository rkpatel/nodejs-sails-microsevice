const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  types: Joi.object().keys({
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    })
  }),
  review: Joi.object().keys({
    employee_certificate_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_certificate_id should be a type of 'number'`,
      'number.empty' : `employee_certificate_id cannot be an empty field`,
    }),
    approved : Joi.boolean().required(),
    reject   : Joi.string().valid('Reject','Reject_Assign_Back')
  }),
  list: Joi.object().keys({
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    offset    : Joi.number().optional().empty(),
    perPage   : Joi.number().optional().empty(),
    filters   : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
    sortField : Joi.string().allow('').optional(),
    sortOrder : Joi.string().allow('').optional(),
  }),
  filterList: Joi.object().keys({
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    certificate_status: Joi.string().required().empty().messages({
      'string.base'  : `certificateStatus should be a type of 'string'`,
      'string.empty' : `certificateStatus cannot be an empty field`,
    }),
    offset    : Joi.number().optional().empty(),
    perPage   : Joi.number().optional().empty(),
    filters   : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
    sortField : Joi.string().allow('').optional(),
    sortOrder : Joi.string().allow('').optional(),
    locations : Joi.array().allow('').allow(null).optional().empty(),
    job_types : Joi.array().allow('').allow(null).optional().empty(),
  }),
  findById: Joi.object().keys({
    employee_certificate_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_certificate_id should be a type of 'number'`,
      'number.empty' : `employee_certificate_id cannot be an empty field`,
    })
  }),
  assign: Joi.object().keys({
    certificate_type_id: Joi.number().required().empty().messages({
      'number.base'  : `certificate_type_id should be a type of 'number'`,
      'number.empty' : `certificate_type_id cannot be an empty field`,
    }),
    description : Joi.string().allow(''),
    end_date    : Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'end_date should be a type of datetime',
      'date.format'  : 'end_date should be in YYYY-MM-DD format',
      'any.required' : 'end_date is a required field'
    }),
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    prompt: Joi.boolean().allow('')
  }),
  assignMultiple: Joi.object().keys({
    certificate_type_id: Joi.number().required().empty().messages({
      'number.base'  : `certificate_type_id should be a type of 'number'`,
      'number.empty' : `certificate_type_id cannot be an empty field`,
    }),
    certificate_name : Joi.string().allow(''),
    from_empProfile  : Joi.boolean().allow('').optional()
  }),
  assignMultipleCrts: Joi.object().keys({
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    job_type_ids: Joi.array().required().messages({
      'array.empty': `job_type_ids canot be an empty field`,
    }),
    from_empProfile: Joi.boolean().allow('').optional()
  }),
  add: Joi.object().keys({
    certificate_type_id: Joi.number().required().empty().messages({
      'number.base'  : `certificate_type_id should be a type of 'number'`,
      'number.empty' : `certificate_type_id cannot be an empty field`,
    }),
    description : Joi.string().allow(''),
    issue_date  : Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'issue_date should be a type of datetime',
      'date.format'  : 'issue_date should be in YYYY-MM-DD format',
      'any.required' : 'issue_date is a required field'
    }),
    expiry_date: Joi.date().format('YYYY-MM-DD').optional().allow('').raw().messages({
      'date.base'   : 'expiry_date should be a type of datetime',
      'date.format' : 'expiry_date should be in YYYY-MM-DD format',
    }),
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    certificate_file: Joi.string().allow('')
  }),
  edit: Joi.object().keys({
    employee_certificate_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_certificate_id should be a type of 'number'`,
      'number.empty' : `employee_certificate_id cannot be an empty field`,
    }),
    certificate_type_id: Joi.number().required().empty().messages({
      'number.base'  : `certificate_type_id should be a type of 'number'`,
      'number.empty' : `certificate_type_id cannot be an empty field`,
    }),
    description : Joi.string().allow(''),
    requstFor   : Joi.string().allow('').valid('Edit_Assignment','Upload_Certificate'),
    issue_date  : Joi.date().format('YYYY-MM-DD').optional().allow('').raw().messages({
      'date.base'    : 'issue_date should be a type of datetime',
      'date.format'  : 'issue_date should be in YYYY-MM-DD format',
      'any.required' : 'issue_date is a required field'
    }),
    expiry_date: Joi.date().format('YYYY-MM-DD').optional().allow('').raw().messages({
      'date.base'   : 'expiry_date should be a type of datetime',
      'date.format' : 'expiry_date should be in YYYY-MM-DD format',
    }),
    end_date: Joi.date().format('YYYY-MM-DD').optional().allow('').raw().messages({
      'date.base'   : 'end_date should be a type of datetime',
      'date.format' : 'end_date should be in YYYY-MM-DD format',
    }),
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    certificate_file : Joi.string().allow(''),
    prompt           : Joi.boolean().allow('')
  }),
  delete: Joi.object().keys({
    employee_certificate_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_certificate_id should be a type of 'number'`,
      'number.empty' : `employee_certificate_id cannot be an empty field`,
    })
  }),
  uploadCertificate: Joi.object().keys({
    employee_certificate_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_certificate_id should be a type of 'number'`,
      'number.empty' : `employee_certificate_id cannot be an empty field`,
    }),
    certificate_file: Joi.any().optional().empty().messages({
      'any.empty': `certificate_file cannot be an empty field`,
    })
  }),
};
