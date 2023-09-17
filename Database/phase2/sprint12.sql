INSERT INTO `permission`(`permission_id`,`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) VALUES ('82','7','0',"Profile Details Management","Dynamic_Questions_Management","Allows user to operate profile details management if s/he has view system management permission",'11',"Active");
INSERT INTO `permission`(`permission_id`,`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) VALUES ('83','2','0',"Edit Profile Details","Edit_Dynamic_Questions","Allows user to edit profile detail if he has Edit Information permission",'22',"Active");
DROP TABLE IF EXISTS `dynamic_question`;
CREATE TABLE IF NOT EXISTS `dynamic_question` (
`dynamic_question_id` bigint NOT NULL AUTO_INCREMENT,
`question` text NOT NULL,
`required` tinyint(1) DEFAULT '0',
`answer_format` enum('text','multiple_choice') DEFAULT 'text',
`status` enum('Active','Inactive') DEFAULT 'Active',
`sequence` int DEFAULT NULL,
`created_by` int DEFAULT NULL,
`created_date` datetime DEFAULT NULL,
`last_updated_by` int DEFAULT NULL,
`last_updated_date` datetime DEFAULT NULL,
PRIMARY KEY (`dynamic_question_id`),
KEY `created_by` (`created_by`),
KEY `last_updated_by` (`last_updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `dynamic_question`
ADD CONSTRAINT `dynamic_question_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `dynamic_question_ibfk_2` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

DROP TABLE IF EXISTS `dynamic_question_option`;
CREATE TABLE IF NOT EXISTS `dynamic_question_option` (
`dynamic_question_option_id` bigint NOT NULL AUTO_INCREMENT,
`dynamic_question_id` bigint DEFAULT NULL,
`option_value` text,
`sequence` int DEFAULT NULL,
`created_by` int DEFAULT NULL,
`created_date` datetime DEFAULT NULL,
`last_updated_by` int DEFAULT NULL,
`last_updated_date` datetime DEFAULT NULL,
PRIMARY KEY (`dynamic_question_option_id`),
KEY `dynamic_question_id` (`dynamic_question_id`),
KEY `created_by` (`created_by`),
KEY `last_updated_by` (`last_updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `dynamic_question_option`
ADD CONSTRAINT `dynamic_question_option_ibfk_1` FOREIGN KEY (`dynamic_question_id`) REFERENCES `dynamic_question` (`dynamic_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `dynamic_question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `dynamic_question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*Table structure for table `skillquiz_question` */

DROP TABLE IF EXISTS `skillquiz_question`;
CREATE TABLE `skillquiz_question` (
  `skillquiz_question_id` bigint(11) NOT NULL AUTO_INCREMENT,
  `skill_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `is_required` tinyint(1) DEFAULT '0',
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `sequence` int(11) NOT NULL,
  PRIMARY KEY (`skillquiz_question_id`),
  KEY `skill_quiz_ibfk_1` (`skill_id`),
  KEY `skill_quiz_ibfk_2` (`created_by`),
  KEY `skill_quiz_ibfk_3` (`last_updated_by`),
  CONSTRAINT `skillquiz_question_ibfk_1` FOREIGN KEY (`skill_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `skillquiz_question_option` */

DROP TABLE IF EXISTS `skillquiz_question_option`;
CREATE TABLE `skillquiz_question_option` (
  `skillquiz_question_option_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `skillquiz_question_id` bigint(20) NOT NULL,
  `option` tinytext NOT NULL,
  `sequence` int(11) DEFAULT NULL,
  `isCorrectAnswer` tinyint(1) DEFAULT '0',
  `description` text,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`skillquiz_question_option_id`),
  KEY `skill_quiz_option_ibfk_1` (`skillquiz_question_id`),
  KEY `skill_quiz_option_ibfk_2` (`created_by`),
  KEY `skill_quiz_option_ibfk_3` (`last_updated_by`),
  CONSTRAINT `skillquiz_question_option_ibfk_1` FOREIGN KEY (`skillquiz_question_id`) REFERENCES `skillquiz_question` (`skillquiz_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `skillquiz_submission` */

DROP TABLE IF EXISTS `skillquiz_submission`;
CREATE TABLE `skillquiz_submission` (
  `skillquiz_submission_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `training_employee_id` int(11) DEFAULT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `skillquiz_question_id` bigint(20) NOT NULL,
  `submitted_option_id` bigint(20) NOT NULL,
  `submitted_option_value` text NOT NULL,
  `submission_date` datetime NOT NULL,
  PRIMARY KEY (`skillquiz_submission_id`),
  KEY `skillquiz_submission_ibfk_1` (`skillquiz_question_id`),
  KEY `skillquiz_submission_ibfk_2` (`employee_profile_id`),
  KEY `skillquiz_submission_ibfk_3` (`task_id`),
  KEY `skillquiz_submission_ibfk_4` (`skill_id`),
  KEY `training_employee_id` (`training_employee_id`),
  CONSTRAINT `skillquiz_submission_ibfk_1` FOREIGN KEY (`skillquiz_question_id`) REFERENCES `skillquiz_question` (`skillquiz_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_3` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_4` FOREIGN KEY (`skill_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_5` FOREIGN KEY (`training_employee_id`) REFERENCES `training_employee` (`training_employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `employee_dynamic_question_answer`;
CREATE TABLE IF NOT EXISTS `employee_dynamic_question_answer` (
  `employee_question_id` int NOT NULL AUTO_INCREMENT,
  `dynamic_question_id` bigint NOT NULL,
  `employee_profile_id` int NOT NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `dynamic_question_option_id` bigint DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_date` datetime NOT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_question_id`),
  KEY `employee_dynamic_question_submission_id` (`employee_question_id`),
  KEY `dynamic_question_id` (`dynamic_question_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `dynamic_question_option_id` (`dynamic_question_option_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `employee_dynamic_question_answer`
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_1` FOREIGN KEY (`dynamic_question_id`) REFERENCES `dynamic_question` (`dynamic_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_5` FOREIGN KEY (`dynamic_question_option_id`) REFERENCES `dynamic_question_option` (`dynamic_question_option_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
CREATE TABLE `employee_filter` (
  `employee_filter_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `name` tinyint(4) DEFAULT NULL,
  `location` tinyint(4) DEFAULT NULL,
  `phone` tinyint(4) DEFAULT NULL,
  `job_type` tinyint(4) DEFAULT NULL,
  `total_points` tinyint(4) DEFAULT NULL,
  `level` tinyint(4) DEFAULT NULL,
  `id` tinyint(4) DEFAULT NULL,
  `contact_name` tinyint(4) DEFAULT NULL,
  `relation` tinyint(4) DEFAULT NULL,
  `emergency_phone` tinyint(4) DEFAULT NULL,
  `other_details` text,
  PRIMARY KEY (`employee_filter_id`),
  KEY `empprof_filter_idx` (`employee_profile_id`),
  CONSTRAINT `empprof_filter` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `task`   
  ADD COLUMN `training_employee_id` INT(11) NULL AFTER `entity_id`, 
  ADD INDEX (`training_employee_id`),
  ADD FOREIGN KEY (`training_employee_id`) REFERENCES `training_employee`(`training_employee_id`) ON UPDATE CASCADE ON DELETE CASCADE;


