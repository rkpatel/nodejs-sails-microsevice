DROP TABLE IF EXISTS `employee_notification_preference`;
DROP TABLE IF EXISTS `notification_queue_recipient`;
DROP TABLE IF EXISTS `notification_queue`;
DROP TABLE IF EXISTS `notification_template`;

CREATE TABLE `notification_template` (
  `notification_template_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250),
  `code` varchar(50) NOT NULL,
  `notification_type` enum('SMS','Email','Mobile','InApp') NOT NULL,
  `subject` varchar(100) NOT NULL,
  `body` text NOT NULL,
  `permission_id` int NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `default_recipeints` varchar(250) DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`notification_template_id`),
  KEY `permissionId` (`permission_id`),
  KEY `createdBy_notification_idx` (`created_by`),
  KEY `updatedby_notification_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_notification_idx` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_notification_idx` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `permissionId` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `employee_notification_preference` (
    `employee_notification_preference_id` int NOT NULL AUTO_INCREMENT,
    `employee_profile_id` int NOT NULL,
    `is_web` TINYINT NOT NULL DEFAULT 0,
    `is_email` TINYINT NOT NULL DEFAULT 0,
    `is_mobile` TINYINT NOT NULL DEFAULT 0,
    `is_sms` TINYINT NOT NULL DEFAULT 0,
    `created_by` int NOT NULL,
    `created_date` datetime NOT NULL,
    `last_updated_by` int DEFAULT NULL,
    `last_updated_date` datetime DEFAULT NULL,
    PRIMARY KEY (`employee_notification_preference_id`),
    KEY `createdBy_notification_idx` (`created_by`),
    KEY `updatedby_notification_idx` (`last_updated_by`),
    CONSTRAINT `createdBy_notification_template` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `updatedby_notification_template` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `notification_queue` (
  `notification_queue_id` int NOT NULL AUTO_INCREMENT,
  `notification_template_id` int NOT NULL,
  `sender` varchar(50) NOT NULL,
  `sender_email` varchar(100) NOT NULL,
  `notification_type` enum('SMS','Email','Mobile','InApp') NOT NULL,
  `notification_subject` varchar(100) NOT NULL,
  `notification_body` text NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `default_recipeints` varchar(250) DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `retry_count` int DEFAULT NULL,
  `notification_error` varchar(250) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`notification_queue_id`),
  KEY `notification_template` (`notification_template_id`),
  CONSTRAINT `notification_template` FOREIGN KEY (`notification_template_id`) REFERENCES `notification_template` (`notification_template_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `notification_queue_recipient` (
  `notification_queue_recipient_id` int NOT NULL AUTO_INCREMENT,
  `notification_queue_id` int NOT NULL,
  `employee_profile_id` int NOT NULL,
  `read_date` datetime DEFAULT NULL,
  `to_cc` enum('To','CC') NOT NULL,
  PRIMARY KEY (`notification_queue_recipient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `berzansky_macdonald`.`notification_queue_recipient` 
ADD COLUMN `recipient_email` VARCHAR(45) NULL AFTER `to_cc`;
