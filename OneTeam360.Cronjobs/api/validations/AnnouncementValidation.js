const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  addEdit: Joi.object().keys({
    id: Joi.number().allow('').optional().messages({
      'number.base': `id should be a type of 'number'`,
    }),
    name: Joi.string().min(5).max(160).required().messages({
      'string.base'  : `Announcement name should be a type of 'text'`,
      'string.empty' : `Announcement name canot be an empty field`,
      'string.min'   : `Announcement name should be minimum of 5 characters`,
      'string.max'   : `Announcement name should be max of 160 characters`,
    }),
    short_description: Joi.string().allow(null, '').min(0).messages({
      'string.base': `Announcement short_description should be a type of 'text'`,
    }),
    description: Joi.string().allow(null, '').min(0).messages({
      'string.base': `Announcement description should be a type of 'text'`,
    }),
    start_date: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'start_date should be a type of datetime',
      'date.format'  : 'start_date should be in YYYY-MM-DD formate',
      'any.required' : 'start_date is a required field'
    }),
    end_date: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'end_date should be a type of datetime',
      'date.format'  : 'end_date should be in YYYY-MM-DD formate',
      'any.required' : 'end_date is a required field'
    }),
    employees: Joi.array().items(Joi.number().required()).messages({
      'array.empty': `Please select atleast one employee.`,
    }),
    locations: Joi.array().items(Joi.number().required()).messages({
      'array.empty': `Please select atleast one location.`,
    }),
    job_types: Joi.array().items(Joi.number().allow(null).allow('')).messages({
      'array.empty': `Please select atleast one job type.`,
    }),
    email_notification : Joi.boolean().required(),
    push_notification  : Joi.boolean().required(),
    sms_notification   : Joi.boolean().required(),
  }),
  EditAuto: Joi.object().keys({
    id: Joi.number().allow('').optional().messages({
      'number.base': `id should be a type of 'number'`,
    }),
    name: Joi.string().min(5).max(160).required().messages({
      'string.base'  : `Announcement name should be a type of 'text'`,
      'string.empty' : `Announcement name canot be an empty field`,
      'string.min'   : `Announcement name should be minimum of 5 characters`,
      'string.max'   : `Announcement name should be max of 160 characters`,
    }),
    short_description: Joi.string().allow(null, '').min(0).messages({
      'string.base': `Announcement short_description should be a type of 'text'`,
    }),
    description: Joi.string().allow(null, '').min(0).messages({
      'string.base': `Announcement description should be a type of 'text'`,
    }),
    email_noti : Joi.boolean().required(),
    push_noti  : Joi.boolean().required(),
    sms_noti   : Joi.boolean().required(),
  }),
  filter: Joi.object().keys({
    offset: Joi.number().required().messages({
      'number.base'  : `offset should be a type of 'number'`,
      'number.empty' : `offset cannot be an empty field`,
    }),
    rows: Joi.number().required().messages({
      'number.base'  : `perPage should be a type of 'number'`,
      'number.empty' : `perPage cannot be an empty field`,
    }),
    employee_profile_id: Joi.number().optional().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
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
    })
  }),
  delete: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `competition_id should be a type of 'number'`,
      'number.empty' : `competition_id canot be an empty field`,
    })
  }),
  updateStatus: Joi.object().keys({
    announcement_id: Joi.number().required().messages({
      'number.base'  : `competition_id should be a type of 'number'`,
      'number.empty' : `competition_id canot be an empty field`,
    }),
    status: Joi.string().valid('Active', 'Inactive').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'Active' or 'Inactive'`,
    }),
  }),
};
