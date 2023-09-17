const Joi = require('joi');
module.exports = {
  add: Joi.object().keys({
    note_type_id: Joi.number().required().empty().messages({
      'number.base'  : `note_type_id should be a type of 'number'`,
      'number.empty' : `note_type_id canot be an empty field`,
    }),
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
    location_id: Joi.number().optional().empty().messages({
      'number.base'  : `location_id should be a type of 'number'`,
      'number.empty' : `location_id canot be an empty field`,
    }),
    description: Joi.string().required().empty().messages({
      'string.base'  : `description should be a type of 'text'`,
      'string.empty' : `description canot be an empty field`,
    }),
    is_private: Joi.boolean().required()
  }),
  find: Joi.object().keys({
    note_type_id        : [Joi.number().allow(''), Joi.array()],
    employee_profile_id : Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    }),
    offset  : Joi.number().optional().empty(),
    perPage : Joi.number().optional().empty()
  }),
  types: Joi.object().keys({
    employee_profile_id: Joi.number().required().empty().messages({
      'number.base'  : `employee_profile_id should be a type of 'number'`,
      'number.empty' : `employee_profile_id canot be an empty field`,
    })
  }),
  delete: Joi.object().keys({
    id: Joi.number().required().empty().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    })
  })
};

