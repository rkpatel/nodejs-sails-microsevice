const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  add: Joi.object().keys({
    day: Joi.string().allow('').max(100).messages({
      'string.base' : `Day should be a type of 'text'`,
      'string.max'  : `Day should be max of 100 characters`,
    }),
    name: Joi.string().optional().allow('').min(5).max(160).messages({
      'string.base' : `Skill name should be a type of 'text'`,
      'string.min'  : `Skill name should be minimum of 5 characters`,
      'string.max'  : `Skill name should be max of 160 characters`,
    }),
    trainings: Joi.array().required().messages({
      'array.empty': `Please select atleast one skill.`,
    }),
    employees: Joi.array().required().messages({
      'array.empty': `Please select atleast one team member.`,
    }),
    employeeGrades: Joi.array().required().messages({
      'array.empty': `Please select atleast one team member.`,
    }),
    notes: Joi.string().allow('').max(1000).messages({
      'string.base' : `Day should be a type of 'text'`,
      'string.max'  : `Day should be max of 100 characters`,
    }),
  }),
  filter: Joi.object().keys({
    sortField: Joi.string().required().messages({
      'string.base'  : `sortField should be a type of 'string'`,
      'string.empty' : `sortField cannot be an empty field`,
    }),
    sortOrder: Joi.string().required().messages({
      'string.base'  : `sortOrder should be a type of 'string'`,
      'string.empty' : `sortOrder cannot be an empty field`,
    }),
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
  }),

  delete: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `skill team member id should be a type of 'number'`,
      'number.empty' : `skill team member id cannot be an empty field`,
    }),
  })
};
