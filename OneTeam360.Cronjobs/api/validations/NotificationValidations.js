const Joi = require('joi');
module.exports = {
  sendMail: Joi.object().keys({
    notification_entity: Joi.string().required()
  }),

  deleteMultiple: Joi.object().keys({
    id: Joi.array().required(),
  }),
};
