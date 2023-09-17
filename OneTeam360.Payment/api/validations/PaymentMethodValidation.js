const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  add: Joi.object().keys({
    id: Joi.string().optional().allow('').messages({
      'string.base'  : `id should be a type of 'text'`,
      'string.empty' : `id canot be an empty field`,
    }),
    cardNumber: Joi.number().integer().required().messages({
      'number.base'  : `card number should be a type of 'number'`,
      'number.empty' : `card number canot be an empty field`,
    }),
    exp_month: Joi.number().integer().min(1).max(12).required().messages({
      'number.base'  : `exp_month should be a type of 'number'`,
      'number.empty' : `exp_month canot be an empty field`,
      'number.min'   : `exp_month should be minimum of 1 month`,
      'number.max'   : `exp_month should be max of 12 months`,
    }),
    exp_year: Joi.number().required().messages({
      'number.base'  : `exp_year should be a type of 'number'`,
      'number.empty' : `exp_year canot be an empty field`,
    }),
    cvc: Joi.number().required().messages({
      'number.base'  : `cvc should be a type of 'number'`,
      'number.empty' : `cvc canot be an empty field`,
    }),
    country: Joi.string().min(1).max(2).required().messages({
      'string.base'  : `country should be a type of 'text'`,
      'string.empty' : `country canot be an empty field`,
      'string.min'   : `country should be minimum of 1 characters`,
      'string.max'   : `country should be max of 2 characters`,
    }),
    postal_code: Joi.string().min(5).max(9).required().messages({
      'string.base'  : `zip should be a type of 'text'`,
      'string.empty' : `zip canot be an empty field`,
      'string.min'   : `zip should be minimum of 5 characters`,
      'string.max'   : `zip should be max of 9 characters`,
    }),
    customerId: Joi.string().required().messages({
      'string.base'  : `customerId should be a type of 'text'`,
      'string.empty' : `customerId canot be an empty field`,
    }),
  }),

  edit: Joi.object().keys({
    id: Joi.string().required().messages({
      'string.base'  : `id should be a type of 'text'`,
      'string.empty' : `id canot be an empty field`,
    }),
    exp_month: Joi.number().integer().min(1).max(12).required().messages({
      'number.base'  : `exp_month should be a type of 'number'`,
      'number.empty' : `exp_month canot be an empty field`,
      'number.min'   : `exp_month should be minimum of 1 month`,
      'number.max'   : `exp_month should be max of 12 months`,
    }),
    exp_year: Joi.number().required().messages({
      'number.base'  : `exp_year should be a type of 'number'`,
      'number.empty' : `exp_year canot be an empty field`,
    }),
  }),

  attachPaymentMethod: Joi.object().keys({
    payment_method_id: Joi.string().required().messages({
      'string.base'  : `payment_method_id should be a type of 'text'`,
      'string.empty' : `payment_method_id canot be an empty field`,
    }),
    customerId: Joi.string().required().messages({
      'string.base'  : `customerId should be a type of 'text'`,
      'string.empty' : `customerId canot be an empty field`,
    }),
  })
};
