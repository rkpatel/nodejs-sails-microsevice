const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  addEdit: Joi.object().keys({
    id: Joi.number().allow('').optional().messages({
      'number.base': `id should be a type of 'number'`,
    }),
    name: Joi.string().min(5).max(160).required().messages({
      'string.base'  : `Competition name should be a type of 'text'`,
      'string.empty' : `Competition name canot be an empty field`,
      'string.min'   : `Competition name should be minimum of 5 characters`,
      'string.max'   : `Competition name should be max of 160 characters`,
    }),
    description: Joi.string().allow(null, '').min(0).max(1000).messages({
      'string.base' : `Competition description should be a type of 'text'`,
      'string.max'  : `Competition description should be max of 1000 characters`,
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
    competition_file: Joi.string().allow('').optional().max(255).messages({
      'string.max': `Competition file should be max of 255 characters`,
    }),
    removed_file : Joi.allow('').optional(),
    employees    : Joi.array().items(Joi.number().required()).messages({
      'array.empty': `Please select atleast one team member.`,
    }),
    locations: Joi.array().items(Joi.number().required()).messages({
      'array.empty': `Please select atleast one location.`,
    }),
    job_types: Joi.array().items(Joi.number().allow(null).allow('')).messages({
      'array.empty': `Please select atleast one job type.`,
    }),
  }),
  delete: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `competition_id should be a type of 'number'`,
      'number.empty' : `competition_id canot be an empty field`,
    })
  }),
  filter: Joi.object().keys({
    offset: Joi.number().required().messages({
      'number.base'  : `offset should be a type of 'number'`,
      'number.empty' : `offset cannot be an empty field`,
    }),
    perPage: Joi.number().required().messages({
      'number.base'  : `perPage should be a type of 'number'`,
      'number.empty' : `perPage cannot be an empty field`,
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
    flag: Joi.string().required().messages({
      'string.base'  : `flag should be a type of 'text'`,
      'string.empty' : `flag canot be an empty field`,
    }),
  })
};
