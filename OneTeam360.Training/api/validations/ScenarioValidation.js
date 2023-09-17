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
      'string.base' : `Skill Assessment name should be a type of 'text'`,
      'string.min'  : `Skill Assessment name should be minimum of 5 characters`,
      'string.max'  : `Skill Assessment name should be max of 160 characters`,
    }),
    trainings: Joi.array().required().messages({
      'array.empty': `Please select atleast one skill.`,
    }),
    trainingCategories: Joi.array().optional().messages({
      'array.empty': `Skill Categories canot be an empty field`,
    }),
    jobTypes: Joi.array().optional().messages({
      'array.empty': `Job Types canot be an empty field`,
    }),
  }),
  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Skill Assessment id should be a type of 'number'`,
      'number.empty' : `Skill Assessment id cannot be an empty field`,
    }),
    day: Joi.string().allow('').max(100).required().messages({
      'string.base' : `Day should be a type of 'text'`,
      'string.max'  : `Day should be max of 100 characters`,
    }),
    name: Joi.string().optional().allow('').min(5).max(160).messages({
      'string.base' : `Skill Assessment name should be a type of 'text'`,
      'string.min'  : `Skill Assessment name should be minimum of 5 characters`,
      'string.max'  : `Skill Assessment name should be max of 160 characters`,
    }),
    trainings: Joi.array().required().messages({
      'array.empty': `Please select atleast one skill.`,
    }),
    trainingCategories : Joi.optional(),
    jobTypes           : Joi.optional(),
  }),
  nameParamValidation: Joi.object().keys({
    id: Joi.string().optional().allow('').min(5).max(160).messages({
      'string.base' : `Skill Assessment name should be a type of 'text'`,
      'string.min'  : `Skill Assessment name should be minimum of 5 characters`,
      'string.max'  : `Skill Assessment name should be max of 160 characters`,
    }),
  }),
  idParamValidation: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `Skill Assessment id should be a type of 'number'`,
      'number.empty' : `Skill Assessment id cannot be an empty field`,
    }),
  }),
  getSenarios: Joi.object().keys({
    jobTypes: Joi.array().optional().allow(null).messages({
      'array.empty': `Please select atleast one Job Type.`,
    }),
  }),
};
