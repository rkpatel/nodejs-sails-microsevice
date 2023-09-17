const Joi = require('joi');
module.exports = {
  dashboard: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `location_id should be a type of 'number'`,
      'number.empty' : `location_id canot be an empty field`,
    })
  }),
  employeeDashboard: Joi.object().keys({
    location_id: Joi.number().required().messages({
      'number.base'  : `location_id should be a type of 'number'`,
      'number.empty' : `location_id canot be an empty field`,
    }),
    employee_profile_id: Joi.number().required().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
  })
};

