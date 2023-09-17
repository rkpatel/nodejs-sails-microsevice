DROP TABLE IF EXISTS `question_type`;

CREATE TABLE `question_type` ( 
`question_type_id` int(11) NOT NULL AUTO_INCREMENT, 
`title` varchar(50) NOT NULL, 
`description` varchar(250), 
`field_type` varchar(50) NOT NULL, 
`status` enum('Active','Inactive') NOT NULL, 
`created_by` int(11) NOT NULL, 
`created_date` datetime NOT NULL, 
PRIMARY KEY (`question_type_id`), 
KEY `created_by` (`created_by`), 
CONSTRAINT `question_type_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Single Choice', 'Single Choice', 'RadioButton', 'Active', '127', '2021-10-14 12:54:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Multiple Choice', 'Multiple Choice', 'Checkbox', 'Active', '127', '2021-10-14 12:55:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Number Value', 'Number Value', 'TextField', 'Active', '127', '2021-10-14 12:56:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Dynamic Entities', 'Dynamic Entities', 'DynamicEntry', 'Active', '127', '2021-10-14 12:57:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Subjective answer', 'Subjective answer', 'TextField', 'Active', '127', '2021-10-14 12:58:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Attachment', 'Attachment', 'FileAttachment', 'Active', '127', '2021-10-14 12:59:17.000000');

DROP TABLE IF EXISTS `question`;

CREATE TABLE `question` (
 `question_id` int(11) NOT NULL AUTO_INCREMENT,
 `title` varchar(255) NOT NULL, 
 `description` varchar(250),
 `question_type_id` int(11) NOT NULL,
 `is_for_dynamic_entity` TINYINT DEFAULT 0, 
 `entity` varchar(50), 
 `dynamic_remark` TINYINT NOT NULL DEFAULT 0,
 `dynamic_allow_multiple` TINYINT NOT NULL DEFAULT 0,
 `status` enum('Active','Inactive') NOT NULL,
 `created_by` int(11) NOT NULL,
 `created_date` datetime NOT NULL,
 `last_updated_by` int(10) DEFAULT NULL, 
 `last_updated_date` datetime DEFAULT NULL, 
 PRIMARY KEY (`question_id`),
 KEY `question_type_id` (`question_type_id`), 
 KEY `created_by` (`created_by`), 
 KEY `last_updated_by` (`last_updated_by`), 
 CONSTRAINT `question_ibfk_1` FOREIGN KEY (`question_type_id`) REFERENCES `question_type` (`question_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `question_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE ,
 CONSTRAINT `question_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `question_option`;

CREATE TABLE `question_option` (
 `question_option_id` int(11) NOT NULL AUTO_INCREMENT,
 `question_id` int(11) NOT NULL,
 `option_key` varchar(155) NOT NULL, 
 `option_value` varchar(155) NOT NULL, 
 `sequence` int(11) NOT NULL,
 `status` enum('Active','Inactive') NOT NULL,
 `created_by` int(11) NOT NULL,
 `created_date` datetime NOT NULL,
 `last_updated_by` int(10) DEFAULT NULL, 
 `last_updated_date` datetime DEFAULT NULL, 
 PRIMARY KEY (`question_option_id`),
 KEY `question_id` (`question_id`), 
 KEY `created_by` (`created_by`), 
 KEY `last_updated_by` (`last_updated_by`), 
 CONSTRAINT `question_option_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE ,
 CONSTRAINT `question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `report`;

CREATE TABLE `report` (
 `report_id` int(11) NOT NULL AUTO_INCREMENT,
 `name` varchar(50) NOT NULL, 
 `status` enum('Active','Inactive') NOT NULL,
 `created_by` int(11) NOT NULL,
 `created_date` datetime NOT NULL,
 `last_updated_by` int(10) DEFAULT NULL,
 `last_updated_date` datetime DEFAULT NULL,
 PRIMARY KEY (`report_id`),
 KEY `created_by` (`created_by`), 
 KEY `last_updated_by` (`last_updated_by`), 
 CONSTRAINT `report_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE , 
 CONSTRAINT `report_ibfk_2` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `report_location`;

CREATE TABLE `report_location` (
 `report_location_id` int(11) NOT NULL AUTO_INCREMENT, 
 `report_id` int(11) NOT NULL,
 `location_id` int(11) NOT NULL,
 `created_by` int(11) NOT NULL, 
 `created_date` datetime NOT NULL, 
 `last_updated_by` int(10) DEFAULT NULL, 
 `last_updated_date` datetime DEFAULT NULL, 
 PRIMARY KEY (`report_location_id`),
 KEY `report_id` (`report_id`), 
 KEY `location_id` (`location_id`),  
 KEY `created_by` (`created_by`), 
 KEY `last_updated_by` (`last_updated_by`), 
 CONSTRAINT `report_location_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `report_location_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `report_location_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE , 
 CONSTRAINT `report_location_ibfk_4` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `report_question`;

CREATE TABLE `report_question` (
 `report_question_id` int(11) NOT NULL AUTO_INCREMENT,
 `report_id` int(11) NOT NULL,
 `title` varchar(255) NOT NULL, 
 `description` varchar(250),
 `question_type_id` int(11) NOT NULL,
 `is_for_dynamic_entity` TINYINT DEFAULT 0,
 `entity` varchar(50), 
 `dynamic_remark` TINYINT NOT NULL DEFAULT 0,
 `dynamic_allow_multiple` TINYINT NOT NULL DEFAULT 0,
 `status` enum('Active','Inactive') NOT NULL,
 `sequence` int(11) NOT NULL,
 `is_required` TINYINT NOT NULL DEFAULT 0, 
 `created_by` int(11) NOT NULL,
 `created_date` datetime NOT NULL,
 `last_updated_by` int(10) DEFAULT NULL, 
 `last_updated_date` datetime DEFAULT NULL, 
 PRIMARY KEY (`report_question_id`),
 KEY `report_id` (`report_id`), 
 KEY `question_type_id` (`question_type_id`), 
 KEY `created_by` (`created_by`), 
 KEY `last_updated_by` (`last_updated_by`), 
 CONSTRAINT `report_question_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `report_question_ibfk_2` FOREIGN KEY (`question_type_id`) REFERENCES `question_type` (`question_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `report_question_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE ,
 CONSTRAINT `report_question_ibfk_4` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `report_question_option`;

CREATE TABLE `report_question_option` (
 `report_question_option_id` int(11) NOT NULL AUTO_INCREMENT,
 `report_question_id` int(11) NOT NULL,
 `option_key` varchar(155) NOT NULL, 
 `option_value` varchar(155) NOT NULL, 
 `status` enum('Active','Inactive') NOT NULL,
 `sequence` int(11) NOT NULL,
 `created_by` int(11) NOT NULL,
 `created_date` datetime NOT NULL,
 `last_updated_by` int(10) DEFAULT NULL, 
 `last_updated_date` datetime DEFAULT NULL, 
 PRIMARY KEY (`report_question_option_id`),
 KEY `report_question_id` (`report_question_id`), 
 KEY `created_by` (`created_by`), 
 KEY `last_updated_by` (`last_updated_by`), 
 CONSTRAINT `report_question_option_ibfk_1` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT `report_question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE ,
 CONSTRAINT `report_question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `report_submission`;
CREATE TABLE IF NOT EXISTS `report_submission` (
  `report_submission_id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `reported_date` datetime NOT NULL,
  PRIMARY KEY (`report_submission_id`),
  KEY `location_id` (`location_id`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_submission_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_ibfk_3` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `report_submission_detail`;
CREATE TABLE IF NOT EXISTS `report_submission_detail` (
  `report_submission_detail_id` int(11) NOT NULL AUTO_INCREMENT,
  `report_submission_id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `report_question_id` int(11) NOT NULL,
  `answer` text NOT NULL,
  PRIMARY KEY (`report_submission_detail_id`),
  KEY `report_submission_id` (`report_submission_id`),
  KEY `report_id` (`report_id`),
  KEY `report_question_id` (`report_question_id`),
  CONSTRAINT `report_submission_detail_ibfk_1` FOREIGN KEY (`report_submission_id`) REFERENCES `report_submission` (`report_submission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_ibfk_3` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `report_submission_detail_option`;
CREATE TABLE IF NOT EXISTS `report_submission_detail_option` (
  `report_submission_detail_option_id` int(11) NOT NULL AUTO_INCREMENT,
  `report_submission_detail_id` int(11) NOT NULL,
  `report_question_id` int(11) NOT NULL,
  `report_question_option_id` int(11) NOT NULL,
  PRIMARY KEY (`report_submission_detail_option_id`),
  KEY `report_submission_detail_id` (`report_submission_detail_id`),
  KEY `report_question_id` (`report_question_id`),
  KEY `report_question_option_id` (`report_question_option_id`),
  CONSTRAINT `report_submission_detail_option_ibfk_1` FOREIGN KEY (`report_submission_detail_id`) REFERENCES `report_submission_detail` (`report_submission_detail_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_option_ibfk_2` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_option_ibfk_3` FOREIGN KEY (`report_question_option_id`) REFERENCES `report_question_option` (`report_question_option_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `report_submission_entity_detail`;
CREATE TABLE IF NOT EXISTS `report_submission_entity_detail` (
  `report_submission_entity_detail_id` int(11) NOT NULL AUTO_INCREMENT,
  `report_submission_detail_id` int(11) NOT NULL,
  `report_question_id` int(11) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `remarks` text NOT NULL,
  PRIMARY KEY (`report_submission_entity_detail_id`),
  KEY `report_submission_detail_id` (`report_submission_detail_id`),
  KEY `report_question_id` (`report_question_id`),
  CONSTRAINT `report_submission_entity_detail_ibfk_1` FOREIGN KEY (`report_submission_detail_id`) REFERENCES `report_submission_detail` (`report_submission_detail_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_entity_detail_ibfk_2` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('Employee report submission', 'Template for report submission', 'EMPLOYEE_REPORT_SUBMISSION', 'Email', 'Daily Report Digest – <<current_date>>', '<html lang=\"en\"><head><!-- Required meta tags --><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\" rel=\"stylesheet\"><style>html, body{font-family: \"Lato\", sans-serif;}</style></head><body><div><h4 style=\"margin-bottom:30px;\">Hello  <<user_name>>,</h4><p style=\"margin-bottom:10px;font-size:14px\">See below for summaries of your daily reports.</p><<dynamic_template>><p>Click <a href=\"<<customer_portal_link>>\">here </a>to view full details of each report.</p><h5 style=\"margin-bottom:5px;\">Thank you,</h5><h5 style=\"margin-bottom:5px;margin-top:0;\"><<account_name>></h5></div></body></html>', '1', 'Active', '7', '2021-06-10 16:56:13');


INSERT INTO `cron_job` (`cron_job_id`, `name`, `code`, `description`, `last_processing_date`) VALUES ('6', 'Employee Report Submission', 'EMPLOYEE_REPORT_SUBMISSION', 'Cron job for report submission', '2021-10-04 08:15:00');

ALTER TABLE `report_question` ADD `question_id` INT NULL;

ALTER TABLE `report_question` ADD CONSTRAINT `question_id_rquestion` FOREIGN KEY (`question_id`) REFERENCES `question`(`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;