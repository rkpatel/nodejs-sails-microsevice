const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  add: Joi.object().keys({
    account_subscription_id: Joi.number().optional().messages({
      'number.base': `account_subscription_id should be a type of 'number'`
    }),
    account_id: Joi.number().required().messages({
      'number.base'  : `account_id should be a type of 'number'`,
      'number.empty' : `account_id canot be an empty field`,
    }),
    stripe_customer_id: Joi.string().required().messages({
      'string.base'  : `stripe_customer_id name should be a type of 'text'`,
      'string.empty' : `stripe_customer_id name canot be an empty field`,
    }),
    stripe_subscription_id: Joi.string().optional().messages({
      'string.base': `stripe_subscription_id should be a type of 'text'`,
    }),
    subscription_id: Joi.number().required().messages({
      'string.base'  : `subscription_id should be a type of 'number'`,
      'number.empty' : `subscription_id canot be an empty field`,
    }),
    products: Joi.array().items(
      Joi.object({
        subscription_product_id: Joi.number().required().messages({
          'number.base'  : `subscription_product_id should be a type of 'number'`,
          'number.empty' : `subscription_product_id canot be an empty field`
        }),
        stripe_product_name: Joi.string().required().messages({
          'string.base'  : `stripe_product_name should be a type of 'text'`,
          'string.empty' : `stripe_product_name canot be an empty field`,
        }),
        stripe_product_id: Joi.string().required().messages({
          'string.base'  : `stripe_product_id should be a type of 'text'`,
          'string.empty' : `stripe_product_id canot be an empty field`,
        }),
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
    stripe_coupon_id: Joi.string().allow('').allow(null).optional().messages({
      'string.base': `stripe_coupon_id name should be a type of 'text'`,
    }),
    amount_total: Joi.string().required().messages({
      'string.base'  : `amount_total name should be a type of 'text'`,
      'string.empty' : `amount_total name canot be an empty field`,
    }),
    amount_subtotal: Joi.string().required().messages({
      'string.base'  : `amount_subtotal name should be a type of 'text'`,
      'string.empty' : `amount_subtotal name canot be an empty field`,
    }),
    billing_cycle: Joi.string().required().messages({
      'string.base'  : `billing_cycle name should be a type of 'text'`,
      'string.empty' : `billing_cycle name canot be an empty field`,
    }),
    currency: Joi.string().required().messages({
      'string.base'  : `currency name should be a type of 'text'`,
      'string.empty' : `currency name canot be an empty field`,
    }),
    free_trial: Joi.string().required().messages({
      'string.base'  : `free_trial name should be a type of 'text'`,
      'string.empty' : `free_trial name canot be an empty field`,
    }),
    free_trial_days: Joi.number().optional().allow(null).max(730).messages({
      'number.base' : `free_trial_days should be a type of 'number'`,
      'number.max'  : `free_trial_days should be less than or equal to 730`,
    }),
    price_per_user: Joi.string().optional().allow(null).allow('').messages({
      'string.base': `price_per_user name should be a type of 'text'`,
    }),
    payment_start_date: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'payment_start_date should be a type of datetime',
      'date.format'  : 'payment_start_date should be in YYYY-MM-DD formate',
      'any.required' : 'payment_start_date is a required field'
    }),
    next_payment_date: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'next_payment_date should be a type of datetime',
      'date.format'  : 'next_payment_date should be in YYYY-MM-DD formate',
      'any.required' : 'next_payment_date is a required field'
    }),
    expiry_date: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'expiry_date should be a type of datetime',
      'date.format'  : 'expiry_date should be in YYYY-MM-DD formate',
      'any.required' : 'expiry_date is a required field'
    }),
    address: Joi.string().max(80).allow('').optional().messages({
      'string.base' : `address should be a type of 'text'`,
      'string.max'  : `address should be max of 80 characters`,
    }),
    country_id: Joi.number().allow(null).optional().messages({
      'string.base': `country_id should be a type of 'number'`,
    }),
    state_id: Joi.number().allow(null).optional().messages({
      'string.base': `state_id should be a type of 'number'`,
    }),
    city_id: Joi.number().allow(null).optional().messages({
      'string.base': `city_id should be a type of 'number'`,
    }),
    zip: Joi.string().min(5).max(9).allow('').optional().messages({
      'string.base' : `zip should be a type of 'text'`,
      'string.min'  : `zip should be minimum of 5 characters`,
      'string.max'  : `zip should be max of 9 characters`,
    }),
    city_name: Joi.optional().allow('').messages({
      'string.base': `city_name should be a type of 'text'`,
    }),
    state_name: Joi.optional().allow('').messages({
      'string.base': `state_name should be a type of 'text'`,
    }),
    country_name: Joi.optional().allow('').messages({
      'string.base': `country_name should be a type of 'text'`,
    }),
    is_address_same_as_billing: Joi.number().optional().messages({
      'number.base': `is_address_same_as_billing should be a type of 'number'`
    }),
  }),

  update: Joi.object().keys({
    payment_intent: Joi.string().optional().messages({
      'string.base': `payment_intent should be a type of 'text'`
    }),
    customerId: Joi.string().optional().messages({
      'string.base': `customerId should be a type of 'text'`
    }),
    status: Joi.string().optional().allow('').optional().messages({
      'string.base': `status should be a type of 'text'`
    })
  }),
  addinstripe: Joi.object().keys({
    payment_intent: Joi.string().optional().messages({
      'string.base': `payment_intent should be a type of 'text'`
    }),
    payment_intent_client_secret: Joi.string().optional().messages({
      'string.base': `payment_intent_client_secret should be a type of 'text'`
    }),
    customerId: Joi.string().optional().messages({
      'string.base': `payment_intent_client_secret should be a type of 'text'`
    })
  }),
  updateinstripe: Joi.object().keys({
    stripe_customer_id: Joi.string().optional().allow('').allow(null).messages({
      'string.base': `stripe_customer_id should be a type of 'text'`,
    }),
    stripe_subscription_id: Joi.string().required().messages({
      'string.base'  : `stripe_subscription_id should be a type of 'text'`,
      'string.empty' : `stripe_subscription_id canot be an empty field`,
    }),
    subscription_id: Joi.number().required().messages({
      'string.base'  : `subscription_id should be a type of 'number'`,
      'number.empty' : `subscription_id canot be an empty field`,
    }),
    products: Joi.array().items(
      Joi.object({
        subscription_product_id: Joi.number().required().messages({
          'number.base'  : `subscription_product_id should be a type of 'number'`,
          'number.empty' : `subscription_product_id canot be an empty field`
        }),
        stripe_product_name: Joi.string().required().messages({
          'string.base'  : `stripe_product_name should be a type of 'text'`,
          'string.empty' : `stripe_product_name canot be an empty field`,
        }),
        stripe_product_id: Joi.string().required().messages({
          'string.base'  : `stripe_product_id should be a type of 'text'`,
          'string.empty' : `stripe_product_id canot be an empty field`,
        }),
        stripe_price_id: Joi.string().required().messages({
          'string.base'  : `stripe_price_id should be a type of 'text'`,
          'string.empty' : `stripe_price_id canot be an empty field`,
        }),
        seats: Joi.number().optional().max(10000).messages({
          'number.base' : `seat should be a type of 'number'`,
          'number.max'  : `seats should be less than or equal to 10000`,
        }),
      })
    ),

    free_trial: Joi.string().optional().allow('').optional().messages({
      'string.base': `free_trial should be a type of 'text'`
    }),
    stripe_coupon_id: Joi.string().optional().allow('').allow(null).optional().messages({
      'string.base': `stripe_coupon_id should be a type of 'text'`
    }),
    trial_end_date: Joi.string().optional().allow('').optional().messages({
      'string.base': `trial_end_date should be a type of 'text'`
    }),
    free_trial_days: Joi.number().optional().max(730).messages({
      'number.base' : `free_trial_days should be a type of 'number'`,
      'number.max'  : `free_trial_days should be less than or equal to 730`,
    }),
    status: Joi.string().optional().allow('').optional().messages({
      'string.base': `status should be a type of 'text'`
    }),
    billing_cycle: Joi.string().optional().allow('').optional().messages({
      'string.base': `billing_cycle should be a type of 'text'`
    }),
    address: Joi.string().max(80).allow('').optional().messages({
      'string.base' : `address should be a type of 'text'`,
      'string.max'  : `address should be max of 80 characters`,
    }),
    country_id: Joi.number().allow(null).optional().messages({
      'string.base': `country_id should be a type of 'number'`,
    }),
    state_id: Joi.number().allow(null).optional().messages({
      'string.base': `state_id should be a type of 'number'`,
    }),
    city_id: Joi.number().allow(null).optional().messages({
      'string.base': `city_id should be a type of 'number'`,
    }),
    city_name: Joi.optional().allow('').messages({
      'string.base': `city_name should be a type of 'text'`,
    }),
    state_name: Joi.optional().allow('').messages({
      'string.base': `state_name should be a type of 'text'`,
    }),
    country_name: Joi.optional().allow('').messages({
      'string.base': `country_name should be a type of 'text'`,
    }),
    zip: Joi.string().min(5).max(9).allow('').optional().messages({
      'string.base' : `zip should be a type of 'text'`,
      'string.min'  : `zip should be minimum of 5 characters`,
      'string.max'  : `zip should be max of 9 characters`,
    }),
    is_address_same_as_billing: Joi.number().optional().messages({
      'number.base': `is_address_same_as_billing should be a type of 'number'`
    }),
  }),
};
