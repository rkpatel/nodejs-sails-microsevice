
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `certificate_type`;
DROP TABLE IF EXISTS `employee_certificate`;
DROP TABLE IF EXISTS `employee_certificate_history`;

CREATE TABLE `certificate_type` (
  `certificate_type_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `job_type_id` int NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`certificate_type_id`),
  KEY `createdBy_certificate` (`created_by`),
  KEY `job_type_id` (`job_type_id`),
  KEY `updatedby_certificate_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_certificate` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_type_id` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_certificate` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_certificate` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;


CREATE TABLE `employee_certificate` (
  `employee_certificate_id` int NOT NULL AUTO_INCREMENT,
  `certificate_type_id` int NOT NULL,
  `employee_profile_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `approved_by` int NOT NULL,
  `certificate_file_path` varchar(250) DEFAULT NULL,
  `certificate_status` enum('Assigned','InReview','Active','Rejected') DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `added_by` int NOT NULL,
  `created_by` int NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_certificate_id`),
  KEY `employeProfileId` (`employee_profile_id`),
  KEY `certification_type_id` (`certificate_type_id`),
  KEY `updatedByUser_idx` (`last_updated_by`),
  KEY `createdbyUser_idx` (`created_by`),
  CONSTRAINT `certification_type_id` FOREIGN KEY (`certificate_type_id`) REFERENCES `certificate_type` (`certificate_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `createdbyUser` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employeProfileId` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedByUser` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;


CREATE TABLE `employee_certificate_history` (
  `employee_certificate_history_id` int NOT NULL AUTO_INCREMENT,
  `employee_certificate_id` int NOT NULL,
  `employee_profile_id` int NOT NULL,
  `name` varchar(250) NOT NULL,
  `description` text,
  `issue_date` datetime DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `certificate_file_path` varchar(250) DEFAULT NULL,
  `certificate_status` enum('Assigned','InReview','Active','Rejected') DEFAULT NULL,
  `approved_by` int NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `task_id` int NOT NULL,
  `added_by` int NOT NULL,
  `created_by` int NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`employee_certificate_history_id`),
  KEY `employee_certification_id` (`employee_certificate_id`),
  KEY `employee_profile_id_certi` (`employee_profile_id`),
  KEY `createdbyuser` (`created_by`),
  CONSTRAINT `employee_certification_id` FOREIGN KEY (`employee_certificate_id`) REFERENCES `employee_certificate` (`employee_certificate_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_profile_id_certi` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

SET FOREIGN_KEY_CHECKS=1;




INSERT INTO `certificate_type` (`certificate_type_id`, `name`, `job_type_id`, `status`, `created_by`, `created_date`) VALUES ('1', 'First Aid', '1', 'Active', '1', '2021-06-23 00:00:00');
INSERT INTO `certificate_type` (`certificate_type_id`, `name`, `job_type_id`, `status`, `created_by`, `created_date`) VALUES ('2', 'Award', '1', 'Active', '1', '2021-06-23 00:00:00');
INSERT INTO `certificate_type` (`certificate_type_id`, `name`, `job_type_id`, `status`, `created_by`, `created_date`) VALUES ('3', 'Swiminstructor', '1', 'Active', '1', '2021-06-23 00:00:00');
INSERT INTO `certificate_type` (`certificate_type_id`, `name`, `job_type_id`, `status`, `created_by`, `created_date`) VALUES ('4', 'Lifeguard certificate', '1', 'Active', '1', '2021-06-23 00:00:00');


INSERT INTO `task_type` ( `name`, `description`, `created_date`, `status`, `is_default`, `created_by`) VALUES ('Assign Certificate', 'Assign Certificate', '2021-08-05 13:36:00', 'Active', '1', '7');
INSERT INTO `task_type` ( `name`, `description`, `created_date`, `status`, `is_default`, `created_by`) VALUES ('Review Certificate', 'Review Certificate', '2021-08-05 13:36:00', 'Active', '1', '7');


ALTER TABLE `employee_certificate` 
DROP FOREIGN KEY `updatedByUser`;
ALTER TABLE `employee_certificate` 
DROP INDEX `updatedByUser_idx` ;
;


ALTER TABLE `employee_certificate` 
ADD COLUMN `end_date` DATE NULL AFTER `expiry_date`,
ADD COLUMN `task_id` INT NULL DEFAULT NULL AFTER `end_date`;

ALTER TABLE `employee_certificate_history` 
ADD COLUMN `end_date` DATE NULL AFTER `status`;


SET SQL_SAFE_UPDATES=0;
UPDATE `task_type` SET `name` = 'Add Certificate', `description` = 'Task type for adding Certificate' WHERE (`name` = 'Assign Certificate');
SET SQL_SAFE_UPDATES=1;

