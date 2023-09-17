ALTER TABLE `user`   
    ADD COLUMN `impersonation_token` TEXT NULL AFTER `reset_password_token`;
ALTER TABLE `user` 
    ADD COLUMN `aboard_date` DATETIME NULL AFTER `impersonation_token`;

INSERT INTO`admin_settings` (`admin_settings_id`, `name`, `code`, `value`) VALUES
(2, 'Dynamic Question Option Min', 'dynamic_question_option_min', '2'),
(3, 'Dynamic Question Option Max', 'dynamic_question_option_max', '6');
(4, 'Skill Question Option Min', 'skill_question_option_min', '2');
(5, 'Skill Question Option Max', 'skill_question_option_max', '4');
COMMIT;

ALTER TABLE `impact_multiplier` CHANGE `score` `score` DOUBLE(4,2) NULL;

INSERT INTO `impact_multiplier` (`impact_multiplier_id`, `name`, `description`, `score`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('4','CheckInApproved',NULL,'0.25','Active','7','2022-06-20 18:15:14',NULL,NULL);

/*replace account_configuration_id with actual Id */

INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'Automated Task Due Date Days', 'automated_task_due_date_days', '5', '5', 'Automated Task Due Date Days', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 
INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'cron to generate certificate report digest', 'cron_certificate_report_submission', '20:00', '20:00', 'Set the time for your monthly certificate report to be sent out. This will be approximate time and will be sent based on response from email services.', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 
INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'Cron for default check-in period', 'cron_checkin', '12:00', '12:00', 'Configure time default check-in period', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 
INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'Check-in for points calculation', 'checkin_points_calculation', '1', '1', 'Configure if you want to consider team member check-in for points calculation', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 
INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'Allow Multiple Check-in', 'allow_multiple_checkin', '1', '1', 'Configure if team member is allowed for multiple check-in', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 
INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'Notify other users', 'note_notification_roles', '', '', 'Users with selected role should receive notification for specific notes added', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 
INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'Cron for 360 Feedback Report Submission', 'cron_360feedback_report_submission', '22:00', '22:00', 'Configure the time to generate 360 feedback report digest', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 
INSERT INTO `account_configuration_detail` (`account_configuration_detail_id`, `account_configuration_id`, `name`, `code`, `value`, `default_value`, `description`, `is_encrypted`, `is_editable`, `sequence`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES (NULL, '3', 'Receive 360 Feedback Report On', 'receive_360feedback_report_on', 'Monday', 'Monday', 'Configure the day to receive 360 feedback report', '0', '0', '0', 'Active', '1', CURRENT_TIMESTAMP, NULL, NULL); 

INSERT INTO `impact_multiplier` (`impact_multiplier_id`, `name`, `description`, `score`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('5','ReportSubmission',NULL,'0.25','Active','7','2022-06-20 18:15:14',NULL,NULL);

/*sprint 16  changes*/
ALTER TABLE `account`   
  ADD COLUMN `azure_product_id` VARCHAR(255) NULL AFTER `is_address_same_as_billing`,
  ADD COLUMN `azure_product_sid` VARCHAR(255) NULL AFTER `azure_product_id`,
  ADD COLUMN `azure_primary_api_key` VARCHAR(255) NULL AFTER `azure_product_sid`,
  ADD COLUMN `azure_secondary_api_key` VARCHAR(255) NULL AFTER `azure_primary_api_key`;

CREATE TABLE `subscription` (
  `subscription_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`subscription_id`),
  KEY `created_by_subscriptions` (`created_by`),
  CONSTRAINT `created_by_subscriptions` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `subscription_product` (
  `subscription_product_id` int(11) NOT NULL AUTO_INCREMENT,
  `subscription_id` int(11) NOT NULL,
  `stripe_product_id` varchar(250) DEFAULT NULL,
  `stripe_product_name` varchar(250) DEFAULT NULL,
  `stripe_price_id` varchar(250) DEFAULT NULL,
  `api_enabled` enum('Yes','No') DEFAULT NULL,
  `api_quota` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`subcription_product_id`),
  KEY `subcription_id` (`subscription_id`),
  CONSTRAINT `subscription_id` FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`subscription_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `account_subscription`  
  ADD COLUMN `subscription_id` INT(11) NULL AFTER `account_id`, 
  ADD INDEX (`subscription_id`),
  ADD FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`subscription_id`) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TABLE `account_subscription_product` (
  `account_subscription_product_id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_subscription_id` INT(11) NOT NULL,
  `subscription_product_id` INT(11) NOT NULL,
  `seats` INT(11) NOT NULL,
  `stripe_sid` VARCHAR(250) DEFAULT NULL,
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT(11) DEFAULT NULL,
  PRIMARY KEY (`account_subscription_product_id`),
  KEY `created_by_subscriptions_product` (`created_by`),
  CONSTRAINT `created_by_subscriptions_product` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;

ALTER TABLE `account_subscription_product`   
  ADD INDEX (`account_subscription_id`),
  ADD INDEX (`subscription_product_id`),
  ADD FOREIGN KEY (`account_subscription_id`) REFERENCES `account_subscription`(`account_subscription_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  ADD FOREIGN KEY (`subscription_product_id`) REFERENCES `subscription_product`(`subscription_product_id`) ON UPDATE CASCADE ON DELETE CASCADE;
 ENGINE=InnoDB DEFAULT CHARSET=latin1;  

ALTER TABLE `account_subscription_history`   
  CHANGE `seats` `seats` VARCHAR(255) NOT NULL;

ALTER TABLE `subscription_product`   
  ADD COLUMN `interval` ENUM('Yearly','Monthly','Daily') DEFAULT 'Monthly'  NULL AFTER `updated_date`;

ALTER TABLE `account_update_subscription`   
  ADD COLUMN `subscription_id` INT(11) NULL AFTER `account_subscription_id`;

ALTER TABLE `subscription`   
  ADD COLUMN `last_updated_date` DATETIME NULL AFTER `created_by`,
  ADD COLUMN `last_updated_by` INT(11) NULL AFTER `last_updated_date`, 
  ADD INDEX (`last_updated_by`),
  ADD FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `user` CHANGE `portal_access` `portal_access` ENUM('admin_portal','customer_portal','api_developer_portal') CHARSET latin1 COLLATE latin1_swedish_ci DEFAULT 'customer_portal'  NULL;

INSERT INTO `user` (`email`, `first_name`, `last_name`, `phone`, `date_of_birth`, `profile_picture_url`, `profile_picture_thumbnail_url`, `status`, `created_by`, `created_date`, `portal_access`) VALUES ('admin@oneteam360.com', 'API', 'User', '1111111111', '2021-07-12', '', '', 'Invited', '11', '2021-07-13 09:41:36', 'api_developer_portal');
INSERT INTO `user` (`email`, `first_name`, `last_name`, `phone`, `date_of_birth`, `profile_picture_url`, `profile_picture_thumbnail_url`, `status`, `created_by`, `created_date`, `portal_access`) 
VALUES ('exposeapi@oneteam360.com', 'API', 'User', '1111111111', '2021-07-12', '', '', 'Invited', '11', '2021-07-13 09:41:36', 'api_developer_portal');

ALTER TABLE `account_subscription_history` ADD COLUMN `subscription_id` INT(11) NULL AFTER `account_subscription_id`;

DROP TABLE IF EXISTS `account_update_subscription_product`;
CREATE TABLE `account_update_subscription_product` (
  `account_update_subscription_product_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_subscription_id` int(11) NOT NULL,
  `subscription_product_id` int(11) NOT NULL,
  `seats` int(11) DEFAULT NULL,
  `stripe_sid` varchar(250) DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`account_update_subscription_product_id`),
  KEY `account_update_subscription_ibfk_3` (`account_subscription_id`),
  KEY `account_update_subscription_product_ibfk_4` (`subscription_product_id`),
  KEY `created_by_user_ibfk5` (`created_by`),
  CONSTRAINT `account_update_subscription_ibfk_3` FOREIGN KEY (`account_subscription_id`) REFERENCES `account_subscription` (`account_subscription_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `account_update_subscription_product_ibfk_4` FOREIGN KEY (`subscription_product_id`) REFERENCES `subscription_product` (`subscription_product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `created_by_user_ibfk5` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

ALTER TABLE `account`   
	ADD COLUMN `retry_count` TINYINT(1) DEFAULT 0 NULL AFTER `azure_secondary_api_key`;
	
ALTER TABLE `account`   
	ADD COLUMN `payment_failed_date` DATETIME NULL AFTER `retry_count`;

INSERT  INTO `notification_template_master`(`name`,`description`,`code`,`notification_type`,`subject`,`body`,`status`,`default_recipeints`,`created_by`,`created_date`,`last_updated_by`,`last_updated_date`) VALUES ('Customer Payment Failed Reminder','Template for customer payment Failed Reminder','NOTIFICATION_PAYMENT_FAILED_REMINDER','Email','OneTeam360 - Payment Failed','<html lang=\"en\">\r\n    <head>\r\n      <!-- Required meta tags -->\r\n      <meta charset=\"utf-8\" />\r\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n  \r\n      <link\r\n        href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\"\r\n        rel=\"stylesheet\"\r\n      />\r\n      <style>\r\n        html,\r\n        body {\r\n          font-family: \"Lato\", sans-serif;\r\n        }\r\n      </style>\r\n    </head>\r\n    <body>\r\n      <div>\r\n        <h4 style=\"margin-bottom: 30px\">Hello <<first_name>> <<last_name>>,</h4>\r\n        <p style=\"margin-bottom: 10px; font-size: 14px\">\r\n            <<body>> Please check your payment details and make any necessary updates.\r\n        </p>  \r\n      <p>Thank you and let us know if you have any questions.</p>\r\n        <h5 style=\"margin-bottom: 5px\">Sincerely,</h5>\r\n        <h5 style=\"margin-bottom: 5px; margin-top: 0\">Customer Service</h5>\r\n        <h5 style=\"margin-bottom: 5px; margin-top: 0\">OneTeam360</h5>\r\n      </div>\r\n    </body>\r\n  </html>','Active','',1,'2022-10-04 14:36:17',NULL,NULL);
