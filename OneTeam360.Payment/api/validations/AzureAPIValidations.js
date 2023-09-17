/* eslint-disable key-spacing */
/* eslint-disable camelcase */

const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  createupdateproduct: Joi.object().keys({
    displayname: Joi.string().required().messages({
      'string.base' : `displayname should be a type of 'text'`,
      'string.empty': `displayname can not be an empty field`
    }),
    account_id: Joi.number().required().messages({
      'number.base'  : `account_id should be a type of 'number'`,
      'number.empty' : `account_id canot be an empty field`,
    })
  }),
  regenerateSecretKey: Joi.object().keys({
    key_type: Joi.string().valid(
        'Primary',
        'Secondary'
    )
  }),
  addPolicyInProduct: Joi.object().keys({
    account_id: Joi.number().required().messages({
      'number.base'  : `account_id should be a type of 'number'`,
      'number.empty' : `account_id canot be an empty field`,
    }),
    api_quota: Joi.number().required().messages({
      'number.base'  : `api_quota should be a type of 'number'`,
      'number.empty' : `api_quota canot be an empty field`,
    })
  }),
};
