const Joi = require('joi');

module.exports = {
  findQuestionList: Joi.object().keys({
    feedback_category: Joi.string().required().valid(
      'Manager',
      'Location'
    ),
    location_id: Joi.any().when('feedback_category', { is   : 'Location', then : Joi.number().required().messages({
      'number.base'  : `location_id should be a type of 'number'`,
      'number.empty' : `location_id cannot be an empty field`,
    }) , otherwise: Joi.number().optional() })
  }),

  submitFeedback: Joi.object().keys({
    feedback_category: Joi.string().required().valid(
      'Manager',
      'Location'
    ),
    feedback_details: Joi.array().items(
      Joi.object({
        manager_id: Joi.any().when('....feedback_category', { is   : 'Manager', then : Joi.number().required().messages({
          'number.base'  : `manager_id should be a type of 'number'`,
          'number.empty' : `manager_id cannot be an empty field`,
        }) , otherwise: Joi.forbidden() }),
        location_id: Joi.any().when('....feedback_category', { is   : 'Location', then : Joi.number().required().messages({
          'number.base'  : `location_id should be a type of 'number'`,
          'number.empty' : `location_id cannot be an empty field`,
        }) , otherwise: Joi.forbidden() }),

        feedback_answer: Joi.array()
        .items(
          Joi.object({
            feedback_question_id: Joi.number().required().messages({
              'number.base'  : `feedback_question_id should be a type of 'number'`,
              'number.empty' : `feedback_question_id cannot be an empty field`,
            }),
            feedback_rating_scale_id: Joi.number().required().messages({
              'number.base'  : `feedback_rating_scale_id should be a type of 'number'`,
              'number.empty' : `feedback_rating_scale_id cannot be an empty field`,
            }),
            comment: Joi.string().optional().allow('').max(500).messages({
              'string.base' : `comment should be a type of 'string'`,
              'string.max'  : `comment should be max of 500 characters`,
            })
          })
        )
      })
    )
  }),

  findLocationDetail: Joi.object().keys({
    location_id: Joi.array().min(1).required().messages({
      'array.base'  : `location_id should be a type of 'array'`,
      'array.empty' : `location_id cannot be an empty field`,
      'array.min'   : `location_id should contain at least 1 value`
    })
  }),

  pendingFeedbackCount: Joi.object().keys({
    location_id: Joi.array().min(1).required().messages({
      'array.base'  : `location_id should be a type of 'array'`,
      'array.empty' : `location_id cannot be an empty field`,
      'array.min'   : `location_id should contain at least 1 value`
    })
  }),

  findQuestionListByLocation: Joi.object().keys({
    location_id: Joi.array().required().messages({
      'array.base'  : `location_id should be a type of 'array'`,
      'array.empty' : `location_id cannot be an empty field`,
    })
  }),
};
