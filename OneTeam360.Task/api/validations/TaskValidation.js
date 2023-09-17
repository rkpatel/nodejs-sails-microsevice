const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  addEdit: Joi.object().keys({
    id: Joi.number().allow('').optional().messages({
      'number.base': `id should be a type of 'number'`,
    }),
    title: Joi.string().min(5).max(160).required().messages({
      'string.base'  : `title should be a type of 'text'`,
      'string.empty' : `title cannot be an empty field`,
      'string.min'   : `title should be minimum of 5 characters`,
      'string.max'   : `title should be max of 160 characters`,
    }),
    task_type_id: Joi.number().required().messages({
      'number.empty' : `task_type_id cannot be an empty field`,
      'number.base'  : `task_type_id should be a type of 'number'`,
    }),
    job_type_id: Joi.number().allow('').optional().messages({
      'number.base': `job_type_id should be a type of 'number'`,
    }),
    from: Joi.string().allow('').optional().messages({
      'string.base': `from should be a type of 'text'`,
    }),
    location_id: Joi.number().allow('').optional().messages({
      'number.base': `location_id should be a type of 'number'`,
    }),
    description: Joi.string().allow('').max(1000).optional().messages({
      'string.max': `	description should be max of 1000 characters`,
    }),

    start_date: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'start_date should be a type of datetime',
      'date.format'  : 'start_date should be in YYYY-MM-DD formate',
      'any.required' : 'start_date is a required field'
    }),

    end_date: Joi.date().format('YYYY-MM-DD').required().raw().messages({
      'date.base'    : 'end_date should be a type of datetime',
      'date.format'  : 'end_date should be in YYYY-MM-DD formate',
      'any.required' : 'end_date is a required field'
    }),
    is_private: Joi.number().allow('').optional().messages({
      'number.base'  : `is_private should be a type of 'number'`,
      'number.empty' : `is_private cannot be an empty field`,
    }),
    is_group_task: Joi.number().allow('').optional().messages({
      'number.base': `is_group_task should be a type of 'number'`,
    }),
    entity_type: Joi.string().allow('').allow(null).optional().messages({
      'string.base': `entity_type should be a type of 'string'`,
    }),
    entity_id: Joi.number().allow('').optional().messages({
      'number.base': `entity_id should be a type of 'number'`,
    }),
    training_employee_id: Joi.number().allow('').optional().messages({
      'number.base': `entity_id should be a type of 'number'`,
    }),
    assignees: Joi.array().required().messages({
      'array.empty': `assignees cannot be an empty field`,
    }),
    task_images: Joi.array().optional().messages({
      'array.empty': `task_images cannot be an empty field`,
    }),
    removed_task_image_ids: Joi.array().optional().messages({
      'array.empty': `removed_task_image_ids cannot be an empty field`,
    }),
    is_scheduled: Joi.number().allow('').optional().messages({
      'number.base'  : `is_scheduled should be a type of 'number'`,
      'number.empty' : `is_scheduled cannot be an empty field`,
    }),
    scheduled_interval_in_days: Joi.number().allow('').optional().messages({
      'number.base'  : `scheduled_interval_in_days should be a type of 'number'`,
      'number.empty' : `scheduled_interval_in_days cannot be an empty field`,
    }),
    scheduled_task_end_date_interval: Joi.number().allow('').optional().messages({
      'number.base'  : `scheduled_task_end_date_interval should be a type of 'number'`,
      'number.empty' : `scheduled_task_end_date_interval cannot be an empty field`,
    }),
    scheduled_end_date: Joi.date().format('YYYY-MM-DD').allow(null).allow('').optional().raw().messages({
      'date.base'    : 'scheduled_end_date should be a type of datetime',
      'date.format'  : 'scheduled_end_date should be in YYYY-MM-DD formate',
      'any.required' : 'scheduled_end_date is a required field'
    }),
  }),
  idParamValidation: Joi.object().keys({
    id: Joi.number().required().messages({
      'number.base'  : `id should be a type of 'number'`,
      'number.empty' : `id cannot be an empty field`,
    }),
  }),
  deleteMultipleTask: Joi.object().keys({
    id: Joi.array().required(),
  }),
  deleteValidation: Joi.object().keys({
    task_id: Joi.number().required().messages({
      'number.base'  : `task_id should be a type of 'number'`,
      'number.empty' : `task_id cannot be an empty field`,
    }),
    is_group_task: Joi.number().required().messages({
      'number.base'  : `is_group_task should be a type of 'number'`,
      'number.empty' : `is_group_task cannot be an empty field`,
    }),
    employee_profile_id: Joi.number().when('is_group_task', {
      is   : 0,
      then : Joi.number().required().messages({
        'number.base'  : `employee_profile_id should be a type of 'number'`,
        'number.empty' : `employee_profile_id cannot be an empty field`,
      }),
      otherwise: Joi.number().optional().allow('').messages({
        'number.base': `employee_profile_id should be a type of 'number'`,
      })
    }),
  }),

  filter: Joi.object().keys({
    assigned: Joi.number().required().messages({
      'number.base'  : `assigned should be a type of 'number'`,
      'number.empty' : `assigned cannot be an empty field`,
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
    id: Joi.number().required().messages({
      'number.base'  : `team member profile id should be a type of 'number'`,
      'number.empty' : `team member profile id cannot be an empty field`,
    }),
    page: Joi.string().required().messages({
      'string.base'  : `page should be a type of 'string'`,
      'any.required' : 'page is a required field'
    }),
  }),

  export: Joi.object().keys({
    assigned: Joi.number().required().messages({
      'number.base'  : `assigned should be a type of 'number'`,
      'number.empty' : `assigned cannot be an empty field`,
    }),
    offset: Joi.string().allow('').optional().messages({
      'string.base': `offset should be a type of 'string'`,
    }),
    perPage: Joi.string().allow('').optional().messages({
      'string.base': `perPage should be a type of 'string'`,
    }),
    filters: Joi.object().allow('').optional().messages({
      'object.base': `filters should be a type of 'object'`,
    }),
    id: Joi.number().required().messages({
      'number.base'  : `employee profile id should be a type of 'number'`,
      'number.empty' : `employee profile id cannot be an empty field`,
    }),
  }),

  updateTaskStatusValidation: Joi.object().keys({
    task_id: Joi.number().required().messages({
      'number.base'  : `task_id should be a type of 'number'`,
      'number.empty' : `task_id cannot be an empty field`,
    }),
    employee_profile_id: Joi.array().required().messages({
      'array.empty': `employee_profile_id cannot be an empty field`,
    }),
  }),

  uploadTaskImages: Joi.object().keys({
    task_id: Joi.number().required().messages({
      'number.base'  : `task_id should be a type of 'number'`,
      'number.empty' : `task_id cannot be an empty field`,
    }),
    images: Joi.any().optional().messages({
      'any.empty': `images cannot be an empty field`,
    }),
  }),

};
