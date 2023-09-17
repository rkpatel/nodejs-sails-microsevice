const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  getQuote: Joi.object().keys({
    customerId: Joi.string().min(5).max(255).required().messages({
      'string.base'  : `customerId name should be a type of 'text'`,
      'string.empty' : `customerId name canot be an empty field`,
      'string.min'   : `customerId should be minimum of 5 characters`,
      'string.max'   : `customerId should be max of 255 characters`,
    }),
    products: Joi.array().items(
      Joi.object({
        stripe_price_id: Joi.string().required().messages({
          'string.base'  : `stripe_price_id should be a type of 'text'`,
          'string.empty' : `stripe_price_id canot be an empty field`,
        }),
        seats: Joi.number().required().max(10000).messages({
          'number.base'  : `seat should be a type of 'number'`,
          'number.empty' : `seat canot be an empty field`,
          'number.max'   : `seats should be less than or equal to 10000`,
        }),
      })
    ),
    coupon: Joi.string().optional().messages({
      'string.base': `coupons name should be a type of 'text'`,
    })
  }),
};
