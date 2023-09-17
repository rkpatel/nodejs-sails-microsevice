const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);

module.exports = {
  findWithPagination: Joi.object().keys({
    sortField           : Joi.string().allow('').optional(),
    sortOrder           : Joi.string().allow('').optional(),
    offset              : Joi.number().optional(),
    perPage             : Joi.number().optional(),
    employee_profile_id : Joi.number().optional().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id cannot be an empty field`,
    }),
    locations : Joi.array().allow('').allow(null).optional().empty(),
    job_types : Joi.array().allow('').allow(null).optional().empty(),
    filters   : [Joi.string().allow('').optional(), Joi.object().allow('').optional()] ,
  }),
};

