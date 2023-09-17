const Joi = require('joi');
module.exports = {
  add: Joi.object().keys({
    name: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `name should be a type of 'string'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 55 characters`,
    }),
    description: Joi.string().allow('').min(2).max(1000).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 1000 characters`,
    }),
    training_category_id: Joi.number().required().messages({
      'number.base'  : `training_category_id should be a type of 'number'`,
      'number.empty' : `training_category_id canot be an empty field`,
    }),
    job_type_id: Joi.array().required().messages({
      'array.base'  : `job_type_id should be a type of 'array'`,
      'array.empty' : `job_type_id canot be an empty field`,
    }),
    explanation: Joi.string().allow('').optional().messages({
      'string.min' : `explanation should be minimum of 2 characters`,
      'string.max' : `explanation should be max of 155 characters`,
    }),
  }),

  edit: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    name: Joi.string().min(2).max(55).required().messages({
      'string.base'  : `name should be a type of 'string'`,
      'string.empty' : `name canot be an empty field`,
      'string.min'   : `name should be minimum of 2 characters`,
      'string.max'   : `name should be max of 55 characters`,
    }),
    description: Joi.string().allow('').min(2).max(1000).optional().messages({
      'string.min' : `description should be minimum of 2 characters`,
      'string.max' : `description should be max of 1000 characters`,
    }),
    training_category_id: Joi.number().required().messages({
      'number.base'  : `training_category_id should be a type of 'number'`,
      'number.empty' : `training_category_id canot be an empty field`,
    }),
    job_type_id: Joi.array().required().messages({
      'array.base'  : `job_type_id should be a type of 'array'`,
      'array.empty' : `job_type_id canot be an empty field`,
    }),
    explanation: Joi.string().allow('').optional().messages({
      'string.min' : `explanation should be minimum of 2 characters`,
      'string.max' : `explanation should be max of 155 characters`,
    }),
    removed_resource_id: Joi.number().allow('').optional().messages({
      'number.base'  : `training_resource_id should be a type of 'number'`,
      'number.empty' : `training_resource_id canot be an empty field`,
    }),
    training_resource_id: Joi.number().allow('').optional().messages({
      'number.base'  : `training_resource_id should be a type of 'number'`,
      'number.empty' : `training_resource_id cannot be an empty field`,
    }),
  }),

  updateStatus: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id canot be an empty field`,
    }),
    status: Joi.string().valid('Active', 'Inactive').required().messages({
      'string.base'  : `status should be a type of 'text'`,
      'string.empty' : `status canot be an empty field`,
      'string.valid' : `status should be 'Active' or 'Inactive'`,
    }),

  }),

  addPhoto: Joi.object().keys({
    training_id: Joi.number().required().messages({
      'number.base'  : `training_id should be a type of 'number'`,
      'number.empty' : `training_id cannot be an empty field`,
    }),
    training_resource_id: Joi.number().allow('').optional().messages({
      'number.base'  : `training_resource_id should be a type of 'number'`,
      'number.empty' : `training_resource_id cannot be an empty field`,
    }),
    images: Joi.string().allow('').optional().messages({
      'string.base'  : `images should be a type of 'text'`,
      'string.empty' : `images cannot be an empty field`,
    }),
    title: Joi.string().min(5).max(50).allow('').optional().messages({
      'string.base'  : `title should be a type of 'text'`,
      'string.empty' : `title cannot be an empty field`,
    }),
    description: Joi.string().min(2).max(155).allow('').optional().messages({
      'string.base'  : `description should be a type of 'text'`,
      'string.empty' : `description cannot be an empty field`,
    }),
    sequence: Joi.number().required().messages({
      'number.base'  : `sequence should be a type of 'number'`,
      'number.empty' : `sequence cannot be an empty field`,
    }),
    removed_resource_id: Joi.number().allow('').optional().messages({
      'number.base'  : `removed_resource_id should be a type of 'number'`,
      'number.empty' : `removed_resource_id cannot be an empty field`,
    }),

  }),

  addVideo: Joi.object().keys({
    training_id: Joi.number().required().messages({
      'number.base'  : `training_id should be a type of 'number'`,
      'number.empty' : `training_id canot be an empty field`,
    }),
    type: Joi.string().valid('Upload Video', 'Add Link').required().messages({
      'string.base'  : `type should be a type of 'text'`,
      'string.empty' : `type canot be an empty field`,
      'string.valid' : `type should be 'Upload Video' or 'Add Link'`,
    }),
    video: Joi.string().allow('').optional().messages({
      'string.base'  : `video should be a type of 'text'`,
      'string.empty' : `video canot be an empty field`,
    }),
    source: Joi.string().allow('').optional().messages({
      'string.base'  : `source should be a type of 'text'`,
      'string.empty' : `source canot be an empty field`,
    }),
    link: Joi.string().allow('').optional().messages({
      'string.base'  : `source should be a type of 'text'`,
      'string.empty' : `source canot be an empty field`,
    }),
    title: Joi.string().min(5).max(50).allow('').optional().messages({
      'string.base'  : `title should be a type of 'text'`,
      'string.empty' : `title canot be an empty field`,
    }),
    description: Joi.string().min(2).max(155).allow('').optional().messages({
      'string.base'  : `description should be a type of 'text'`,
      'string.empty' : `description canot be an empty field`,
    }),
    sequence: Joi.number().required().messages({
      'number.base'  : `sequence should be a type of 'number'`,
      'number.empty' : `sequence cannot be an empty field`,
    }),
    training_resource_id: Joi.number().allow('').optional().messages({
      'number.base'  : `training_resource_id should be a type of 'number'`,
      'number.empty' : `training_resource_id cannot be an empty field`,
    }),
    removed_resource_id: Joi.number().allow('').optional().messages({
      'number.base'  : `removed_resource_id should be a type of 'number'`,
      'number.empty' : `removed_resource_id cannot be an empty field`,
    }),
  }),
  linkVideo: Joi.object().keys({
    link: Joi.string().required().messages({
      'string.base'  : `link should be a type of 'text'`,
      'string.empty' : `link canot be an empty field`,
    }),
    source: Joi.string().valid('YouTube', 'Vimeo', 'Other').required().messages({
      'string.base'  : `source should be a type of 'text'`,
      'string.empty' : `source canot be an empty field`,
      'string.valid' : `source should be 'YouTube' or 'Vimeo'`,
    }),
  }),

  uploadVideo: Joi.object().keys({
    video: Joi.string().required().messages({
      'string.base'  : `video should be a type of 'text'`,
      'string.empty' : `video canot be an empty field`,
    }),
  }),

  updateResourceSequence: Joi.object().keys({
    training_sequence: Joi.array().items(
      Joi.object({
        training_resource_id : Joi.number().required(),
        sequence             : Joi.number().required(),
      })
    ).required().messages({
      'string.base'  : `sequence should be a type of 'array of objects'`,
      'string.empty' : `sequence canot be an empty field`,
    }),
    training_id: Joi.number().required().messages({
      'number.base'  : `training_id should be a type of 'number'`,
      'number.empty' : `training_id cannot be an empty field`,
    }),
  }),

  jobTypeAndTrainingCategory: Joi.object().keys({
    job_type_id: Joi.number().messages({
      'number.base': `job_type_id should be a type of 'number'`,
    }),
    training_category_id: Joi.number().messages({
      'number.base': `training_category_id should be a type of 'number'`,
    }),
  }),
};
