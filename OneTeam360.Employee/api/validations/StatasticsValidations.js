const Joi = require('joi');
module.exports = {
  viewStatastics: Joi.object().keys({
    period: Joi.string().required().empty().messages({
      'string.base'  : `period should be a type of 'text'`,
      'string.empty' : `period canot be an empty field`,
    }),
    employee_profile_id: Joi.number().optional().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
  })
};
