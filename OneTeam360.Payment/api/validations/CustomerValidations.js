/* eslint-disable key-spacing */
/* eslint-disable camelcase */

const JoiBase = require('joi');
const JoiDate = require('@hapi/joi-date');

const Joi = JoiBase.extend(JoiDate);
module.exports = {
  Add: Joi.object().keys({
    name: Joi.string().min(3).max(160).required().messages({
      'string.base' : `company_name should be a type of 'text'`,
      'string.empty': `company_name can not be an empty field`,
      'string.min'  : `company_name should be minimum of 3 characters`,
      'string.max'  : `company_name should be max of 160 characters`,
    }),
    phone: Joi.number().allow('').optional().messages({
      'number.base' : `phone should be a type of 'number'`,
    }),
    email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base' : `company_email should be a type of 'text'`,
      'string.empty': `company_email can not be an empty field`,
      'string.email': `company_email format not valid`,
      'any.required': `company_email is a required field`,
      'string.min'  : `company_email should be minimum of 5 characters`,
      'string.max'  : `company_email should be max of 80 characters`,
    }),
    address: Joi.string().max(80).allow('').optional().messages({
      'string.base' : `address should be a type of 'text'`,
      'string.max'  : `address should be max of 80 characters`,
    }),
    country_id: Joi.number().allow(null).optional().messages({
      'string.base' : `country_id should be a type of 'number'`,
    }),
    state_id: Joi.number().allow(null).optional().messages({
      'string.base' : `state_id should be a type of 'number'`,
    }),
    city_id: Joi.number().allow(null).optional().messages({
      'string.base' : `city_id should be a type of 'number'`,
    }),
    city_name: Joi.optional().allow('').messages({
      'string.base' : `city_name should be a type of 'text'`,
    }),
    state_name: Joi.optional().allow('').messages({
      'string.base' : `state_name should be a type of 'text'`,
    }),
    country_name: Joi.optional().allow('').messages({
      'string.base' : `country_name should be a type of 'text'`,
    }),
    zip: Joi.string().min(5).max(9).allow('').optional().messages({
      'string.base' : `zip should be a type of 'text'`,
      'string.min'  : `zip should be minimum of 5 characters`,
      'string.max'  : `zip should be max of 9 characters`,
    }),
    website_url: Joi.string().allow('').allow(null).optional().messages({
      'string.base' : `website_url should be a type of 'text'`,
    }),
    company_logo_url: Joi.string().allow('').optional().messages({
      'string.base': `company_logo_url should be a type of 'text'`,
    }),
    primary_contact_first_name: Joi.string().min(2).max(50).required().messages({
      'string.base' : `primary_contact_first_name should be a type of 'text'`,
      'string.empty': `primary_contact_first_name can not be an empty field`,
      'string.min'  : `primary_contact_first_name should be minimum of 2 characters`,
      'string.max'  : `primary_contact_first_name should be max of 50 characters`,
    }),
    primary_contact_last_name: Joi.string().min(2).max(50).required().messages({
      'string.base' : `primary_contact_last_name should be a type of 'text'`,
      'string.empty': `primary_contact_last_name can not be an empty field`,
      'string.min'  : `primary_contact_last_name should be minimum of 2 characters`,
      'string.max'  : `primary_contact_last_name should be max of 50 characters`,
    }),
    primary_contact_number: Joi.number().required().messages({
      'number.base' : `primary_contact_number should be a type of 'number'`,
      'number.empty': `primary_contact_number can not be an empty field`,
    }),
    primary_contact_email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base' : `primary_contact_email should be a type of 'text'`,
      'string.empty': `primary_contact_email can not be an empty field`,
      'string.email': `primary_contact_email format not valid`,
      'any.required': `primary_contact_email is a required field`,
      'string.min'  : `primary_contact_email should be minimum of 5 characters`,
      'string.max'  : `primary_contact_email should be max of 80 characters`,
    }),
    source: Joi.string().allow('').optional().messages({
      'string.base': `source should be a type of 'text'`,
    }),
    user_exists: Joi.string().allow('').allow(null).optional().messages({
      'string.base': `user_exists should be a type of 'text'`,
    }),
  }),
  Edit: Joi.object().keys({
    id: Joi.number(),
    name: Joi.string().min(3).max(160).required().messages({
      'string.base' : `company_name should be a type of 'text'`,
      'string.empty': `company_name can not be an empty field`,
      'string.min'  : `company_name should be minimum of 3 characters`,
      'string.max'  : `company_name should be max of 160 characters`,
    }),
    phone: Joi.number().allow('').optional().messages({
      'number.base': `phone should be a type of 'number'`,
    }),
    email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base' : `company_email should be a type of 'text'`,
      'string.empty': `company_email can not be an empty field`,
      'string.email': `company_email format not valid`,
      'any.required': `company_email is a required field`,
      'string.min'  : `company_email should be minimum of 5 characters`,
      'string.max'  : `company_email should be max of 80 characters`,
    }),
    address: Joi.string().allow('').max(80).optional().messages({
      'string.base' : `address should be a type of 'text'`,
      'string.max'  : `address should be max of 80 characters`,
    }),
    country_id: Joi.number().allow(null).optional().messages({
      'string.base' : `country_id should be a type of 'number'`,
    }),
    state_id: Joi.number().allow(null).optional().messages({
      'string.base' : `state_id should be a type of 'number'`,
    }),
    city_id: Joi.number().allow(null).optional().messages({
      'string.base' : `city_id should be a type of 'number'`,
    }),
    city_name: Joi.allow('').optional().messages({
      'string.base' : `city_name should be a type of 'text'`,
    }),
    state_name: Joi.allow('').optional().messages({
      'string.base' : `state_name should be a type of 'text'`,
    }),
    country_name: Joi.allow('').optional().messages({
      'string.base' : `country_name should be a type of 'text'`,
    }),
    zip: Joi.string().allow('').min(5).max(9).optional().messages({
      'string.base' : `zip should be a type of 'text'`,
      'string.min'  : `zip should be minimum of 5 characters`,
      'string.max'  : `zip should be max of 9 characters`,
    }),
    website_url: Joi.string().allow('').allow(null).optional().messages({
      'string.base' : `website_url should be a type of 'text'`,
    }),
    company_logo_url: Joi.string().allow('').optional().messages({
      'string.base': `company_logo_url should be a type of 'text'`,
    }),
    theme: Joi.string().allow('').optional().messages({
      'string.base': `theme should be a type of 'text'`,
    }),
    primary_contact_first_name: Joi.string().min(2).max(50).required().messages({
      'string.base' : `primary_contact_first_name should be a type of 'text'`,
      'string.empty': `primary_contact_first_name can not be an empty field`,
      'string.min'  : `primary_contact_first_name should be minimum of 2 characters`,
      'string.max'  : `primary_contact_first_name should be max of 50 characters`,
    }),
    primary_contact_last_name: Joi.string().min(2).max(50).required().messages({
      'string.base' : `primary_contact_last_name should be a type of 'text'`,
      'string.empty': `primary_contact_last_name can not be an empty field`,
      'string.min'  : `primary_contact_last_name should be minimum of 2 characters`,
      'string.max'  : `primary_contact_last_name should be max of 50 characters`,
    }),
    primary_contact_number: Joi.number().required().messages({
      'number.base' : `primary_contact_number should be a type of 'number'`,
      'number.empty': `primary_contact_number can not be an empty field`,
    }),
    primary_contact_email: Joi.string().min(5).max(80).required().empty().email().messages({
      'string.base' : `primary_contact_email should be a type of 'text'`,
      'string.empty': `primary_contact_email can not be an empty field`,
      'string.email': `primary_contact_email format not valid`,
      'any.required': `primary_contact_email is a required field`,
      'string.min'  : `primary_contact_email should be minimum of 5 characters`,
      'string.max'  : `primary_contact_email should be max of 80 characters`,
    }),
    source: Joi.string().allow('').optional().messages({
      'string.base': `source should be a type of 'text'`,
    }),
    user_exists: Joi.string().allow('').allow(null).optional().messages({
      'string.base': `user_exists should be a type of 'text'`,
    }),
  }),
  updateAccount : Joi.object().keys({
    id: Joi.number(),
    time_zone: Joi.string().required().messages({
      'string.base' : `time_zone should be a type of 'text'`,
      'string.empty': `time_zone can not be an empty field`,
    }),
    date_format: Joi.string().required().messages({
      'string.base' : `date_format should be a type of 'text'`,
      'string.empty': `date_format can not be an empty field`,
    }),
    time_format: Joi.string().required().messages({
      'string.base' : `time_format should be a type of 'text'`,
      'string.empty': `time_format can not be an empty field`,
    }),
    training_master_photos_count: Joi.number().required().messages({
      'string.base' : `training_master_photos_count should be a type of 'number'`,
      'string.empty': `training_master_photos_count can not be an empty field`,
    }),
    training_master_video_count: Joi.number().required().messages({
      'string.base' : `training_master_video_count should be a type of 'number'`,
      'string.empty': `training_master_video_count can not be an empty field`,
    }),
    cron_points_calculation: Joi.string().required().messages({
      'string.base' : `cron_points_calculation should be a type of 'text'`,
      'string.empty': `cron_points_calculation can not be an empty field`,
    }),
    points_for_positive_performance: Joi.string().required().messages({
      'string.base' : `points_for_positive_performance should be a type of 'text'`,
      'string.empty': `points_for_positive_performance can not be an empty field`,
    }),
    deduct_points_for_negative_performance: Joi.string().required().messages({
      'string.base' : `deduct_points_for_negative_performance should be a type of 'text'`,
      'string.empty': `deduct_points_for_negative_performance can not be an empty field`,
    }),
    deduct_points: Joi.string().allow('').optional().messages({
      'string.base' : `deduct_points should be a type of 'text'`,
    }),
    threshold_score_for_points_calculation: Joi.string().allow('').optional().messages({
      'string.base' : `threshold_score_for_points_calculation should be a type of 'text'`,
    }),
    additional_points_for_points_calculation: Joi.string().allow('').optional().messages({
      'string.base' : `additional_points_for_points_calculation should be a type of 'text'`,
    }),
    cron_task_overDue: Joi.string().required().messages({
      'string.base' : `cron_task_overDue should be a type of 'text'`,
      'string.empty': `cron_task_overDue can not be an empty field`,
    }),
    cron_certificate_expire: Joi.string().required().messages({
      'string.base' : `cron_certificate_expire should be a type of 'text'`,
      'string.empty': `cron_certificate_expire can not be an empty field`,
    }),
    cron_points_notification: Joi.string().required().messages({
      'string.base' : `cron_points_notification should be a type of 'text'`,
      'string.empty': `cron_points_notification can not be an empty field`,
    }),
    cron_competiton_completion: Joi.string().required().messages({
      'string.base' : `cron_competiton_completion should be a type of 'text'`,
      'string.empty': `cron_competiton_completion can not be an empty field`,
    }),
    cron_report_submission: Joi.string().required().messages({
      'string.base' : `cron_report_submission should be a type of 'text'`,
      'string.empty': `cron_report_submission can not be an empty field`,
    }),
    cron_announcement: Joi.string().required().messages({
      'string.base' : `cron_announcement should be a type of 'text'`,
      'string.empty': `cron_announcement can not be an empty field`,
    }),
    cron_announcement_on: Joi.string().required().messages({
      'string.base' : `cron_announcement_on should be a type of 'text'`,
      'string.empty': `cron_announcement_on can not be an empty field`,
    }),
    automated_task_due_date_days: Joi.number().allow('').optional().messages({
      'number.base' : `automated_task_due_date_days should be a type of 'number'`,
    }),
    notification_mail_all_users:Joi.number().required().messages({
      'string.base' : `notification_mail_all_users should be a type of 'number'`,
      'string.empty': `notification_mail_all_users can not be an empty field`,
    }),
    cron_certificate_report_submission: Joi.string().required().messages({
      'string.base' : `cron_certificate_report_submission should be a type of 'text'`,
      'string.empty': `cron_certificate_report_submission can not be an empty field`,
    }),
    cron_checkin: Joi.string().required().messages({
      'string.base' : `cron_checkin should be a type of 'text'`,
      'string.empty': `cron_checkin can not be an empty field`,
    }),
    checkin_points_calculation:Joi.number().required().messages({
      'string.base' : `checkin_points_calculation should be a type of 'number'`,
      'string.empty': `checkin_points_calculation can not be an empty field`,
    }),
    allow_multiple_checkin:Joi.number().required().messages({
      'string.base' : `allow_multiple_checkin should be a type of 'number'`,
      'string.empty': `allow_multiple_checkin can not be an empty field`,
    }),
    note_notification_roles:Joi.string().optional().allow('').messages({
      'string.base' : `note_notification_roles should be a type of 'text'`,
    }),
    cron_360feedback_report_submission: Joi.string().required().messages({
      'string.base' : `cron_360feedback_report_submission should be a type of 'text'`,
      'string.empty': `cron_360feedback_report_submission can not be an empty field`,
    }),
    receive_360feedback_report_on: Joi.string().required().messages({
      'string.base' : `receive_360feedback_report_on should be a type of 'text'`,
      'string.empty': `receive_360feedback_report_on can not be an empty field`,
    }),
    expire_certificate_days_limit: Joi.number().required().messages({
      'string.base' : `expire_certificate_days_limit should be a type of 'number'`,
      'string.empty': `expire_certificate_days_limit can not be an empty field`,
    }),
  }),
};
