const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);

module.exports = {
  add: Joi.object().keys({
    location_id: Joi.array().required().messages({
      'array.empty' : `location_id canot be an empty field`,
      'array.base'  : `location_id should be a type of 'array'`,
    }),
    employee_profile_id: Joi.number().optional().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
  }),

  edit: Joi.object().keys({
    checkInRequests: Joi.array().items(
      Joi.object({
        employee_checkin_id: Joi.number().required().messages({
          'number.empty' : `employee_checkin_id canot be an empty field`,
          'number.base'  : `employee_checkin_id should be a type of 'number'`,
        }),
        request_status: Joi.string().valid(
          'Approved',
          'Rejected',
          'CheckedOut'
        ),
      })
    ),
  }),

  findListById: Joi.object().keys({
    location_id: Joi.array().min(1).required().messages({
      'array.empty' : `location_id canot be an empty field`,
      'array.base'  : `location_id should be a type of 'array'`,
      'array.min'   : `location_id should contain at least 1 value`
    }),
    offset: Joi.number().required().messages({
      'number.base'  : `offset should be a type of 'number'`,
      'number.empty' : `offset cannot be an empty field`,
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
  }),

  pendingRequestCount: Joi.object().keys({
    location_id: Joi.array().required().messages({
      'array.empty' : `location_id canot be an empty field`,
      'array.base'  : `location_id should be a type of 'array'`,
    }),
  }),

};
