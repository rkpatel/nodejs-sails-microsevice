const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  add: Joi.object().keys({
    subscription_name: Joi.string().required().messages({
      'string.base'  : `subscription name should be a type of 'text'`,
      'string.empty' : `subscription name canot be an empty field`,
    }),
    products: Joi.array().items(
      Joi.object({
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
        api_enabled: Joi.number().optional().messages({
          'number.base': `api_enabled should be a type of 'number'`,
        }),
        api_quota: Joi.number().optional().messages({
          'number.base': `api_quota should be a type of 'number'`,
        }),
        interval: Joi.string().optional().messages({
          'string.base': `interval should be a type of 'text'`,
        }),
        currency: Joi.string().optional().messages({
          'string.base': `currency should be a type of 'text'`,
        })
      })
    ),
  }),
  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    subscription_name: Joi.string().required().messages({
      'string.base'  : `subscription name should be a type of 'text'`,
      'string.empty' : `subscription name canot be an empty field`,
    }),
    products: Joi.array().items(
      Joi.object({
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
        api_enabled: Joi.number().optional().messages({
          'number.base': `api_enabled should be a type of 'number'`,
        }),
        api_quota: Joi.number().optional().messages({
          'number.base': `api_quota should be a type of 'number'`,
        }),
        interval: Joi.string().optional().messages({
          'string.base': `interval should be a type of 'text'`,
        }),
        currency: Joi.string().optional().messages({
          'string.base': `currency should be a type of 'text'`,
        })
      })
    ),
  }),
  filter: Joi.object().keys({
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
    sortField: Joi.string().required().messages({
      'string.base' : `sortField should be a type of 'text'`,
      'string.max'  : `sortField should be max of 100 characters`,
    }),
    sortOrder: Joi.string().required().messages({
      'string.base' : `sortOrder should be a type of 'text'`,
      'string.max'  : `sortOrder should be max of 100 characters`,
    }),
    rows: Joi.string().allow('').optional().messages({
      'string.base': `flag should be a type of 'text'`
    }),
  }),
  updatestatus: Joi.object().keys({
    subscription_id: Joi.number().required().messages({
      'number.base'  : `subscription_id should be a type of 'number'`,
      'number.empty' : `subscription_id cannot be an empty field`,
    }),
    status: Joi.string().required().messages({
      'string.base' : `status should be a type of 'text'`,
      'string.max'  : `status should be max of 100 characters`,
    })
  }),
};
