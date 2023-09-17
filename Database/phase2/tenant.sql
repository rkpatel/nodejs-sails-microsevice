
DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
  `announcement_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `email_noti` tinyint(4) NOT NULL,
  `push_noti` tinyint(4) NOT NULL,
  `sms_noti` tinyint(4) NOT NULL,
  `announcement_status` enum('Active','Scheduled','Expired','Inactive') DEFAULT 'Active',
  `announcement_type` enum('custom','birthday','anniversary','abroad') DEFAULT 'custom',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `is_default` TINYINT NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated_by` int(10) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`announcement_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `announcement` (`name`, `description`, `email_noti`, `push_noti`, `sms_noti`, `announcement_status`,
 `announcement_type`,`is_default`, `status`, `created_by`, `created_date`) 
VALUES ('Birthdays this Week', 'This is the Birthday Announcement Description', '1', '1', '1', 'Active',
 'birthday', '1','Active', '1', '2022-04-06 06:11:06');
 
INSERT INTO `announcement` (`name`, `description`, `email_noti`, `push_noti`, `sms_noti`, `announcement_status`,
 `announcement_type`,`is_default`, `status`, `created_by`, `created_date`) 
 VALUES ('Work Anniversaries', 'This is the Work Anniversary Description', '1', '1', '1', 'Active',
 'anniversary', '1','Active', '1', '2022-04-06 06:11:06');

INSERT INTO `announcement` (`name`, `description`, `email_noti`, `push_noti`, `sms_noti`, `announcement_status`,
 `announcement_type`,`is_default`, `status`, `created_by`, `created_date`) 
VALUES ('Welcome to the Team!', 'This is the Onboarding Announcement', '1', '1', '1', 'Active',
 'abroad', '1', 'Active', '1', '2022-04-06 06:11:06');

DROP TABLE IF EXISTS `announcement_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_employee` (
  `announcement_employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) unsigned DEFAULT NULL,
  `employee_profile_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_employee_id`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `announcements_id` (`announcement_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `announcement_employee_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`announcement_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_employee_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_employee_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `announcement_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_job_type` (
  `announcement_job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) unsigned NOT NULL,
  `job_type_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_job_type_id`),
  KEY `created_by` (`created_by`),
  KEY `announcement_id` (`announcement_id`),
  KEY `job_type_id` (`job_type_id`),
  CONSTRAINT `announcement_job_type_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_job_type_ibfk_4` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`announcement_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_job_type_ibfk_5` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `announcement_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_location` (
  `announcement_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) unsigned NOT NULL,
  `location_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_location_id`),
  KEY `created_by` (`created_by`),
  KEY `announcement_id` (`announcement_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `announcement_location_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_location_ibfk_4` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`announcement_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_location_ibfk_5` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

CREATE TABLE `announcement_status_enum` (
  `announcement_status_enum_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_status` enum('Active','Scheduled','Inactive','Expired') NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`announcement_status_enum_id`),
  UNIQUE KEY `announcement_status_enum_id_UNIQUE` (`announcement_status_enum_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `announcement_status_enum` */

insert  into `announcement_status_enum`(`announcement_status_enum_id`,`announcement_status`,`name`,`sort_order`) values 
(1,'Active','Active',1),
(2,'Scheduled','Scheduled',2),
(3,'Inactive','Inactive',3),
(4,'Expired','Expired',4);

ALTER TABLE `task`
ADD COLUMN `is_group_task` TINYINT(1) DEFAULT 0 NULL AFTER `is_private`;

INSERT INTO `task_type` ( `name`, `description`, `created_date`, `status`, `is_default`, `created_by`) 
VALUES ( 'Retest Skill', 'Retest Skill', '2022-04-19 16:07:43', 'Active', 1, 1);

ALTER TABLE `task`   
  ADD COLUMN `entity_type` VARCHAR(25) NULL AFTER `is_group_task`,
  ADD COLUMN `entity_id` INT(11) NULL AFTER `entity_type`;

ALTER TABLE `certificate_type` 
ADD COLUMN `auto_assign` TINYINT NULL DEFAULT 0 AFTER `description`;

ALTER TABLE notification_template CONVERT TO CHARACTER SET utf8;
ALTER TABLE notification_queue CONVERT TO CHARACTER SET utf8;

ALTER TABLE `employee_certificate` 
ADD COLUMN `added_by_auto` TINYINT NULL DEFAULT 0 AFTER `added_by`;

ALTER TABLE `employee_profile`   
	ADD COLUMN `team_member_id` VARCHAR(30) NULL AFTER `last_updated_date`;

ALTER TABLE `bulk_import_temp`   
	ADD COLUMN `team_member_id` VARCHAR(250) NULL AFTER `emergency_contact_zip`;
  
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

/*Table structure for table `employee_checkin` */
DROP TABLE IF EXISTS `employee_checkin`;
CREATE TABLE `employee_checkin` (
  `employee_checkin_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `request_status` enum('Pending','Approved','Rejected','CheckedOut') NOT NULL DEFAULT 'Pending',
  `reviewer_status` varchar(15) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `checkin_datetime` datetime DEFAULT NULL,
  `checkout_datetime` datetime DEFAULT NULL,
  `reviewed_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_checkin_id`),
  KEY `employee_checkin_ibfk_1` (`employee_profile_id`),
  KEY `employee_checkin_ibfk_2` (`location_id`),
  KEY `employee_checkin_ibfk_3` (`reviewed_by`),
  CONSTRAINT `employee_checkin_ibfk_1` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_checkin_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_checkin_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
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

ALTER TABLE `employee_checkin`   
  CHANGE `request_status` `request_status` ENUM('Pending','Approved','Rejected','CheckedOut','AutoRejected') CHARSET utf8mb4 DEFAULT 'Pending'  NOT NULL;
  
CREATE TABLE `checkin_status`(  
  `checkin_status_id` INT(10) NOT NULL AUTO_INCREMENT,
  `checkin_status` ENUM('Approved','Rejected'),
  `weighted_tier_id` INT(11),
  `impact_multiplier_id` INT(11) NOT NULL,
  PRIMARY KEY (`checkin_status_id`, `impact_multiplier_id`),
  INDEX (`weighted_tier_id`, `impact_multiplier_id`),
  INDEX (`impact_multiplier_id`),
  FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier`(`impact_multiplier_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=INNODB;

insert into `checkin_status` (`checkin_status_id`, `checkin_status`, `weighted_tier_id`, `impact_multiplier_id`) values('1','Approved','4','4');
insert into `checkin_status` (`checkin_status_id`, `checkin_status`, `weighted_tier_id`, `impact_multiplier_id`) values('2','Rejected','4','2');

ALTER TABLE `employee_point_audit` ADD COLUMN `checkin_score` DECIMAL(11,0) NULL AFTER `training_score`;

ALTER TABLE `announcement` CHANGE `description` `description` LONGTEXT NULL;

ALTER TABLE `note_type` 
ADD COLUMN `notify_management_user` TINYINT NULL DEFAULT 0 AFTER `send_notification`;

INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Announcement', 'ANNOUNCEMENT_TRIGGER', 'Croj job for announcement');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('CheckIn Request', 'CHECKIN_REQUEST', 'Cron job for Check In request');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Monthly Expire Certificates', 'MONTHLY_CERTIFICATE_EXPIRE', 'Cron job for send monthly expired and about to expire certificate');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('CheckOut Request', 'CHECKOUT', 'Cron job for Check-out request');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Weekly Feedback Report', 'WEEKLY_FEEDBACK_REPORT', 'Cron job for send weekly feedback report');

INSERT INTO `permission_module` (`parent_permission_module_id`, `name`, `code`, `description`, `sequence`, `status`, `created_by`, `created_date`) 
VALUES ('0', 'Announcements', 'Announcements', 'Announcements', '14', 'Active', '1', '2021-09-07 10:13:36');

INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'View Configured announcement List', 'View_Configured_Announcement', 'Allows user to view Configure button available on announcements sidebar', '1', 'Active');
INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'Create Announcement', 'Create_Announcement', 'Allows user to create announcement', '2', 'Active');
INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'Edit Announcement', 'Edit_Announcement', 'Allows user to edit announcement', '3', 'Active');
INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'Inactivate Announcement', 'Inactive_Announcement', 'Allows user to inactivate announcement', '4', 'Active');

INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES (13,0,'Impersonate Team Members','Impersonate_Employee','Allows user to login to other team member profile',2,'Active');
INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES (1,0,"Edit Team Member ID","Edit_Team_Member_ID","Allows user to edit team member ID if he has 'Edit Information' permission",9,"Active");
INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES ('7','0',"Profile Details Management","Dynamic_Questions_Management","Allows user to operate profile details management if s/he has view system management permission",'11',"Active");
INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES ('2','0',"Edit Profile Details","Edit_Dynamic_Questions","Allows user to edit profile detail if he has Edit Information permission",'22',"Active");

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Certificate Report',
        'Certificate_Report',
        'Certificate Report',
        '10',
        'Active',
        '1',
        '2022-06-07 10:13:36'
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '15',
        '0',
        "View Certificate Report",
        "View_Certificate_Report",
        "Allows user to view certificate report menu option within the system.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '15',
        '84',
        "Export Certificate Report",
        "Export_Certificate_Report",
        "Allows user to export excel if he has ‘View Certificate Report’ permission.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '15',
        '0',
        "Receive Certificate Report Digest",
        "Receive_Certificate_Report_Digest",
        "Allows the user to receive certificate report digest on monthly basis over email.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '1',
        '0',
        "Approve/Deny Check-in",
        "Review_Check_in",
        "Allow user to approve/deny check-in of team members.",
        '10',
        "Active"
    );


INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'Email', 'New Announcement', '<!doctype html>
 <html lang="en-US">
 
 <head>
   <meta name="viewport" content="width=device-width, initial-scale=1">
 
   <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
   <title>Email Template</title>
   <meta name="description" content="Notifications Email Template">
   <style type="text/css">
    html, body{
          font-family: "Lato", sans-serif;
          color: #34444c;
        }
     a:hover {text-decoration: none !important;}
     :focus {outline: none;border: 0;}
   </style>
 </head>
 
 <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
   <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
     <tr>
       <td style="text-align:center; max-width: 620px; width: 620px;">
         <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">New Announcement</h1>
       </td>
     </tr>
     
     <tr>
       <td style="max-width: 620px; width: 620px;">
         <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
           <tr>
       <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
         <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
       </td>
     </tr>
           <tr>
             <td style="padding:30px; background-color: #d7e4f3;">
               <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                 <tr>
                   <td>
                     <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                     <p style="margin-bottom:20px;font-size:15px"><<announcement_title>></p>
                   </td>
                 </tr>
                 <tr>
                   <td>
                     <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                       <tr>
                         <!-- <td align="center" colspan="2">
                             <a href="<<customer_portal_link>>" target="_blank" style="background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;">View Details</a>
                         </td> -->
                         <td colspan="2">
                           <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                             <tr>
                               <td style="width: 30%;">&nbsp;</td>
                                 <td style="border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                     <a href="<<customer_portal_link>>" target="_blank">
                                         <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                     </a>
                                 </td>
                                 <td style="width: 30%;">&nbsp;</td>
                             </tr>
                           </table>
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>
               </table>
             </td>
           </tr>
         </table>
       </td>
     </tr>
     <tr>
       <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
         <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
         <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
         <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
       </td>
     </tr>
   </table>
 </body>
 
 </html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'Mobile', 'New Announcement', '<<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'InApp', 'New Announcement', '<<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'SMS', '', 'OneTeam360 Announcement - <<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','Email','Group Task Completed','\n<!doctype html>\n<html lang=\"en-US\">\n\n<head>\n <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\n <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel=\"stylesheet\">\n <title>Email Template</title>\n <meta name=\"description\" content=\"Notifications Email Template\">\n <style type=\"text/css\">\n html, body{\n font-family: \"Lato\", sans-serif;\n color: #34444c;\n }\n a:hover {text-decoration: none !important;}\n :focus {outline: none;border: 0;}\n </style>\n</head>\n\n<body marginheight=\"0\" topmargin=\"0\" marginwidth=\"0\" style=\"margin: 0px; background-color: #fff;\" bgcolor=\"#fff\" leftmargin=\"0\">\n <table style=\"background-color: #fff; max-width:620px; margin:0 auto;\" width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td style=\"text-align:center; max-width: 620px; width: 620px;\">\n <h1 style=\"margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;\">Group Task Completed</h1>\n </td>\n </tr>\n \n <tr>\n <td style=\"max-width: 620px; width: 620px;\">\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\"style=\"background:#ffffff; text-align:left;\">\n <tr>\n <td colspan=\"2\" class=\"container\" style=\"font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;\">\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-task-bg.png\" alt=\"\" style=\"display: block;\">\n </td>\n </tr>\n <tr>\n <td style=\"padding:30px; background-color: #d7e4f3;\">\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td>\n <h4 style=\"margin-bottom:20px; margin-top:0px; text-transform:capitalize\">Hello <strong><<first_name>> <<last_name>>,</strong></h4>\n <p style=\"margin-bottom:20px;font-size:15px\"><strong><<employee_name>></strong> has marked the task as completed on <strong><<date_time_of_task_competition>></strong>. Below are the details regarding the task.</p>\n </td>\n </tr>\n <tr>\n <td>\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;\"><strong>Title:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; vertical-align: top;\"><<task_title>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Description:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<task_description>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Start Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<start_date>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>End Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<end_date>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Completion Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<completion_date>></td>\n </tr>\n <tr>\n <td colspan=\"2\">\n <p style=\"margin-bottom: 30px;\">Please login to <strong style=\"color:#d26934;\">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p> \n </td>\n </tr>\n <tr>\n <!-- <td align=\"center\" colspan=\"2\">\n <a href=\"<<customer_portal_link>>\" target=\"_blank\" style=\"background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;\">View Details</a>\n </td> -->\n <td colspan=\"2\">\n <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin: 0 auto;\">\n <tr>\n <td style=\"width: 30%;\">&nbsp;</td>\n <td style=\"border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;\" align=\"center\">\n <a href=\"<<customer_portal_link>>\" target=\"_blank\">\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png\" alt=\"\"> \n </a>\n </td>\n <td style=\"width: 30%;\">&nbsp;</td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n <tr>\n <td style=\"vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;\">\n <p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\">Thank you,</p>\n <p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\"><<account_name>></p>\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png\" alt=\"\">\n </td>\n </tr>\n </table>\n</body>\n\n</html>','Active','','1','2021-06-10 16:56:13',NULL,NULL);

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','Mobile','Group Task Completed','<<employee_name>> completed a task on <<date_time_of_task_competition>>. Click here for details!','Active','','1','2021-06-10 16:56:13',NULL,NULL);

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','InApp','Group Task Completed','<<employee_name>> completed a task on <<date_time_of_task_competition>>. Click here for details!','Active',NULL,'1','2021-06-10 16:56:13',NULL,NULL);

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
    <style type="text/css">
        html,
        body {
            font-family: "Lato", sans-serif;
            color: #34444c;
        }

        a:hover {
            text-decoration: none !important;
        }

        :focus {
            outline: none;
            border: 0;
        }
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">You have been assigned the below
                                            certificates. Please navigate to the certification section on your profile to add them.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>
</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
    <style type="text/css">
        html,
        body {
            font-family: "Lato", sans-serif;
            color: #34444c;
        }

        a:hover {
            text-decoration: none !important;
        }

        :focus {
            outline: none;
            border: 0;
        }
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">The below certificates are associated with your new job type. Please navigate to the certification section on your profile to add them.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>
</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Email', 'Birthdays This Week', 
'<html lang="en-US">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link
    href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap
    rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template" />
    <style type="text/css">
      html,
      body {
        font-family: "Lato", sans-serif;
        color: #34444c;
      }

      a:hover {
        text-decoration: none !important;
      }

      :focus {
        outline: none;
        border: 0;
      }
    </style>
  </head>

  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="margin: 0px; background-color: #fff"
    bgcolor="#fff"
    leftmargin="0"
  >
    <table
      style="background-color: #fff; max-width: 620px; margin: 0 auto"
      width="100%"
      border="0"
      align="center"
      cellpadding="0"
      cellspacing="0"
    >
     <tr>
        <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 15px;">
          <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
          margin-bottom: 0;">Birthdays This Week</h1>
        </td>
      </tr>
      <tr>
        <td style="max-width: 620px; width: 620px">
          <table
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
            style="background: #ffffff; text-align: left"
          >
            <tr>
              <td
                colspan="2"
                class="container"
                style="
                  font-size: 15px;
                  vertical-align: bottom;
                  display: block;
                  margin: 0 auto;
                  max-width: 620px;
                  width: 620px;
                "
              >
                <img src="https://ot360dev.blob.core.windows.net/master/email-template/header.png" alt="" style="display: block" />
              </td>
            </tr>
            <tr>
                <td style="text-align:center; max-width: 620px; width: 620px;background-color: #d7e4f3;">
                  <h1 style="margin-top: 10px; text-align: center; font-weight: 900; font-size: 22px;margin-bottom: 0;">Time To Celebrate!</h1>
                </td>
              </tr>
            <tr>
            <tr>
              <td style="padding: 30px; background-color: #d7e4f3">
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td style="line-height: 30px; display: flex; align-items: center;justify-content: center; flex-flow: wrap;gap: 5px;">
                      <<body>>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: #d7e4f3;
                    max-width: 620px;
                    margin: 0 auto;
                  "
                >
                  <tr>
                    <td colspan="2" style="padding-bottom: 20px">
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="margin: 0 auto"
                      >
                        <tr>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                          <td
                            style="
                              border-radius: 2px;
                              text-align: center;
                              width: 40%;
                              height: 48px;
                              width: 208px;
                              padding-top: 20px;padding-bottom: 20px;
                            "
                            align="center"
                          >
                            <a href="<<customer_portal_link>>" target="_blank">
                              <img
                                src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png"
                                alt=""
                              />
                            </a>
                          </td>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                        </tr>
                         <tr>
                          <td style="width: 30%">&nbsp;</td>
                          <td style="width: 30%">&nbsp;</td>
                          <td
                            style="
                              width: 30%;
                              text-align: right;
                              padding-right: 20px;
                            "
                          >
                            <img src="https://ot360dev.blob.core.windows.net/master/email-template/birthday_img.png" alt="" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td
          style="
            vertical-align: top;
            padding-bottom: 10px;
            padding-top: 10px;
            font-size: 15px;
            text-align: left;
          "
        >
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            Thank you,
          </p>
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            <<account_name>>
          </p>
          <img
            src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
            alt=""
          />
        </td>
      </tr>
    </table>
  </body>
</html>', 'Active', '1', '2021-06-10 16:56:13');


INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Mobile', 'Birthdays This Week', '<<body>>','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'InApp', 'Birthdays This Week', '<<body>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'SMS', 'Birthdays This Week', '<<body>>. View Details <<customer_portal_link>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Email', 'Work Anniversaries This Week', 
'
<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 20px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">WORK ANNIVERSARIES THIS WEEK</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360dev.blob.core.windows.net/master/email-template/MicrosoftTeams-image.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin-top: 0; text-align: center; font-weight: 700; font-size: 20px;margin-bottom: 0;">Congratulations!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;text-align: center;">
              <table  width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <<body>>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0px 30px 20px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <td style="width:100%;text-align: center;padding-top: 30px;padding-bottom: 10px;font-size: 14px;">
                      <a href="<<customer_portal_link>>" target="_blank">
                        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                    </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Mobile', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'InApp', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'SMS', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Email', 'Welcome to the Team – <<employee_name>>', 
'<html lang="en-US">
  
  <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
  
      <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
      <title>Email Template</title>
      <meta name="description" content="Notifications Email Template">
      <style type="text/css">
          html,
          body {
              font-family: "Lato", sans-serif;
              color: #34444c;
          }
  
          a:hover {
              text-decoration: none !important;
          }
  
          :focus {
              outline: none;
              border: 0;
          }
      </style>
  </head>
  
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
      leftmargin="0">
      <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
          cellpadding="0" cellspacing="0">
          <tr>
             <td style="text-align:center; max-width: 620px; width: 620px;">
               <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
               margin-bottom: 0;">Welcome to the Team</h1>
             </td>
           </tr>
          <tr>
              <td style="max-width: 620px; width: 620px;">
                  <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                      style="background:#ffffff; text-align:left;">
                      <tr>
                          <td colspan="2" class="container"
                              style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                              <img src="https://ot360dev.blob.core.windows.net/master/email-template/common-header.png"
                                  alt="" style="display: block;">
                          </td>
                      </tr>
                      
                      <tr>
                          <td style="padding:30px; background-color: #d7e4f3;">
                              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                  <tr>
                         <td style="padding:30px; background-color: #d7e4f3;">
                             <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                 <tr>
                                     <td>
                                         <p> Reach out and give our new team member a warm welcome! </p>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td>
                                         <p>Name : <<employee_name>>, <<employee_email>></p>
                                         <p>Location : <<location>></p>
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
                              </table>
                          </td>
                      </tr>
                      <tr>
                        <td>
                         <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="background-color: #d7e4f3; max-width:620px; margin:0 auto;">
                           <tr>
                             <td colspan="2" style="padding-bottom:20px;">
                               <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                 <tr>
                                   <td style="width: 30%;padding-bottom: 20px;padding-top: 20px;">&nbsp;</td>
                                     <td style="padding-bottom: 20px;padding-top: 20px;border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                         <a href="<<customer_portal_link>>" target="_blank">
                                             <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                         </a>
                                     </td>
                                     <td style="width: 30%;padding-bottom: 20px;padding-top: 20px;">&nbsp;</td>
                                 </tr>
                               </table>
                             </td>
                           </tr>
                         </table>
                        </td>
                      </tr>
                      
  
                  </table>
              </td>
          </tr>
          <tr>
              <td
                  style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                  <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                  <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                      <<account_name>>
                  </p>
                  <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                      alt="">
              </td>
          </tr>
      </table>
  </body>
  
  </html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Mobile', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!',
 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'InApp', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!', 
'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'SMS', '', 'Welcome New Team Member - <<employee_name>>', 
'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'CHECKIN_REQUEST', 'InApp', 'Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`,`description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'CHECKIN_REQUEST', 'Mobile', 'Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Report Digest', 'Template when Certificate Report Digest', 'CERTIFICATE_REPORT_DIGEST', 'Email', '<<month>>’s Certificate Report', 
'<!doctype html>
<html lang="en-US">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Monthly Report Digest</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-bulk-import-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<user_name>> ,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">Your team’s certificate report for the month of <month> is now available in OneTeam360 for review, and an exported version is attached to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<company_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '1', '2022-06-12 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Checked-in!', 'Your check-in at <<location>> was confirmed.', 'ACCEPT_CHECKIN_REQUEST', 'InApp', 'Checked-in!', 'Your check-in at <<location>> was confirmed.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Checked-in!', 'Your check-in at <<location>> was confirmed.', 'ACCEPT_CHECKIN_REQUEST', 'Mobile', 'Checked-in!', 'Your check-in at <<location>> was confirmed.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'REJECT_CHECKIN_REQUEST', 'InApp', 'Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`)
VALUES ('Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'REJECT_CHECKIN_REQUEST', 'Mobile', 'Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Note Added!', 'Template for note is added', 'ADD_NOTE_NOTIFY_MANAGER', 'Email', 'Note Added!', '
<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Add Note</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">
                    <p style="margin-bottom:20px;font-size:15px">A <<Note_type>> note is added to <<added_name>> by <<employee_name>>. Please click here to view details <a href="<<customer_portal_link>>" target="_blank"> link of OT360 platform </a>.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '1', '2022-06-21 16:46:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Task Assigned', 'Template when new task assigned', 'TASK_ASSIGNED', 'InApp', 'New Task Assigned', 'A new task has been assigned to you by <<employee_name>>. Click to view more!', 'Active', '1', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Task Completed', 'Template when task is completed', 'TASK_COMPLETED', 'InApp', 'Task Completed', '<<employee_name>> has marked the task as completed on <<date_time_of_task_competition>>. Click here to view details!', 'Active', '1', '2021-06-10 16:56:13');

/*-------------- Sprint 13 End--------------*/

/*Table structure for table `feedback_question` */

DROP TABLE IF EXISTS `feedback_question`;
CREATE TABLE `feedback_question` (
  `feedback_question_id` int(11) NOT NULL AUTO_INCREMENT,
  `feedback_category` enum('Manager','Location') NOT NULL,
  `question` text NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive') NOT NULL,
  `sequence` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT NULL,
  PRIMARY KEY (`feedback_question_id`),
  KEY `feedback_question_ibfk_1` (`created_by`),
  KEY `feedback_question_ibfk_2` (`modified_by`),
  CONSTRAINT `feedback_question_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_question_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_question_location` */

DROP TABLE IF EXISTS `feedback_question_location`;
CREATE TABLE `feedback_question_location` (
  `feedback_question_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `feedback_question_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`feedback_question_location_id`),
  KEY `feedback_question_location_ibfk_1` (`feedback_question_id`),
  KEY `feedback_question_location_ibfk_2` (`location_id`),
  CONSTRAINT `feedback_question_location_ibfk_1` FOREIGN KEY (`feedback_question_id`) REFERENCES `feedback_question` (`feedback_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_question_location_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_rating_scale` */

DROP TABLE IF EXISTS `feedback_rating_scale`;
CREATE TABLE `feedback_rating_scale` (
  `feedback_rating_scale_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `scale` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT NULL,
  PRIMARY KEY (`feedback_rating_scale_id`),
  KEY `feedback_rating_scale_ibfk_1` (`created_by`),
  KEY `feedback_rating_scale_ibfk_2` (`modified_by`),
  CONSTRAINT `feedback_rating_scale_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_rating_scale_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_answer` */

DROP TABLE IF EXISTS `feedback_answer`;
CREATE TABLE `feedback_answer` (
  `feedback_answer_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `feedback_question_id` int(11) NOT NULL,
  `feedback_rating_scale_id` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`feedback_answer_id`),
  KEY `feedback_answer_ibfk_1` (`employee_profile_id`),
  KEY `feedback_answer_ibfk_2` (`manager_id`),
  KEY `feedback_answer_ibfk_3` (`location_id`),
  KEY `feedback_answer_ibfk_4` (`feedback_question_id`),
  KEY `feedback_answer_ibfk_5` (`feedback_rating_scale_id`),
  KEY `feedback_answer_ibfk_6` (`created_by`),
  CONSTRAINT `feedback_answer_ibfk_1` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_4` FOREIGN KEY (`feedback_question_id`) REFERENCES `feedback_question` (`feedback_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_5` FOREIGN KEY (`feedback_rating_scale_id`) REFERENCES `feedback_rating_scale` (`feedback_rating_scale_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Very Unsatisfied', 'Very Unsatisfied', 1, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Unsatisfied', 'Unsatisfied', 2, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Normal', 'Normal', 3, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Satisfied', 'Satisfied', 4, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Very Satisfied', 'Very Satisfied', 5, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');

ALTER TABLE `report_submission_detail` 
ADD COLUMN `notes` TEXT NULL AFTER `answer`;


INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'Mobile', 'New Announcement', '<<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'InApp', 'New Announcement', '<<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'SMS', '', 'OneTeam360 Announcement - <<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','Email','Group Task Completed','\n<!doctype html>\n<html lang=\"en-US\">\n\n<head>\n <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\n <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel=\"stylesheet\">\n <title>Email Template</title>\n <meta name=\"description\" content=\"Notifications Email Template\">\n <style type=\"text/css\">\n html, body{\n font-family: \"Lato\", sans-serif;\n color: #34444c;\n }\n a:hover {text-decoration: none !important;}\n :focus {outline: none;border: 0;}\n </style>\n</head>\n\n<body marginheight=\"0\" topmargin=\"0\" marginwidth=\"0\" style=\"margin: 0px; background-color: #fff;\" bgcolor=\"#fff\" leftmargin=\"0\">\n <table style=\"background-color: #fff; max-width:620px; margin:0 auto;\" width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td style=\"text-align:center; max-width: 620px; width: 620px;\">\n <h1 style=\"margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;\">Group Task Completed</h1>\n </td>\n </tr>\n \n <tr>\n <td style=\"max-width: 620px; width: 620px;\">\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\"style=\"background:#ffffff; text-align:left;\">\n <tr>\n <td colspan=\"2\" class=\"container\" style=\"font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;\">\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-task-bg.png\" alt=\"\" style=\"display: block;\">\n </td>\n </tr>\n <tr>\n <td style=\"padding:30px; background-color: #d7e4f3;\">\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td>\n <h4 style=\"margin-bottom:20px; margin-top:0px; text-transform:capitalize\">Hello <strong><<first_name>> <<last_name>>,</strong></h4>\n <p style=\"margin-bottom:20px;font-size:15px\"><strong><<employee_name>></strong> has marked the task as completed on <strong><<date_time_of_task_competition>></strong>. Below are the details regarding the task.</p>\n </td>\n </tr>\n <tr>\n <td>\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;\"><strong>Title:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; vertical-align: top;\"><<task_title>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Description:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<task_description>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Start Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<start_date>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>End Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<end_date>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Completion Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<completion_date>></td>\n </tr>\n <tr>\n <td colspan=\"2\">\n <p style=\"margin-bottom: 30px;\">Please login to <strong style=\"color:#d26934;\">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p> \n </td>\n </tr>\n <tr>\n <!-- <td align=\"center\" colspan=\"2\">\n <a href=\"<<customer_portal_link>>\" target=\"_blank\" style=\"background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;\">View Details</a>\n </td> -->\n <td colspan=\"2\">\n <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin: 0 auto;\">\n <tr>\n <td style=\"width: 30%;\">&nbsp;</td>\n <td style=\"border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;\" align=\"center\">\n <a href=\"<<customer_portal_link>>\" target=\"_blank\">\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png\" alt=\"\"> \n </a>\n </td>\n <td style=\"width: 30%;\">&nbsp;</td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n <tr>\n <td style=\"vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;\">\n <p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\">Thank you,</p>\n <p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\"><<account_name>></p>\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png\" alt=\"\">\n </td>\n </tr>\n </table>\n</body>\n\n</html>','Active','','1','2021-06-10 16:56:13',NULL,NULL);

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','Mobile','Group Task Completed','<<employee_name>> completed a task on <<date_time_of_task_competition>>. Click here for details!','Active','','1','2021-06-10 16:56:13',NULL,NULL);

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','InApp','Group Task Completed','<<employee_name>> completed a task on <<date_time_of_task_competition>>. Click here for details!','Active',NULL,'1','2021-06-10 16:56:13',NULL,NULL);

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
    <style type="text/css">
        html,
        body {
            font-family: "Lato", sans-serif;
            color: #34444c;
        }

        a:hover {
            text-decoration: none !important;
        }

        :focus {
            outline: none;
            border: 0;
        }
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">You have been assigned the below
                                            certificates. Please check the details on your profile to add them.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>
</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
    <style type="text/css">
        html,
        body {
            font-family: "Lato", sans-serif;
            color: #34444c;
        }

        a:hover {
            text-decoration: none !important;
        }

        :focus {
            outline: none;
            border: 0;
        }
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">The below certificates are associated with your new job type. Review your profile for details.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>
</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Email', 'Birthdays This Week', 
'<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 20px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Birthdays This Week</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360dev.blob.core.windows.net/master/email-template/MicrosoftTeams-image.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin-top: 0; text-align: center; font-weight: 700; font-size: 20px;margin-bottom: 0;">Time To Celebrate!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;text-align: center;">
              <table  width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <<body>>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0px 30px 20px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <td style="width:100%;text-align: center;padding-top: 30px;padding-bottom: 10px;font-size: 14px;">
                      <a href="<<customer_portal_link>>" target="_blank">
                        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                    </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0px 30px 20px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <td style="width:100%;text-align: right;"><img src="https://ot360dev.blob.core.windows.net/master/email-template/birthday_img.png"/></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Mobile', 'Birthdays This Week', '<<body>>','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'InApp', 'Birthdays This Week', '<<body>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'SMS', 'Birthdays This Week', '<<body>>. View Details <<customer_portal_link>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Email', 'Work Anniversaries This Week', 
'<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 20px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">WORK ANNIVERSARIES THIS WEEK</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360dev.blob.core.windows.net/master/email-template/MicrosoftTeams-image.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin-top: 0; text-align: center; font-weight: 700; font-size: 20px;margin-bottom: 0;">Congratulations!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;text-align: center;">
              <table  width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <<body>>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0px 30px 20px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <td style="width:100%;text-align: center;padding-top: 30px;padding-bottom: 10px;font-size: 14px;">
                      <a href="<<customer_portal_link>>" target="_blank">
                        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                    </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Mobile', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'InApp', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'SMS', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Email', 'Welcome to the Team – <<employee_name>>', 
'<html lang="en-US">
  
  <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
  
      <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
      <title>Email Template</title>
      <meta name="description" content="Notifications Email Template">
      <style type="text/css">
          html,
          body {
              font-family: "Lato", sans-serif;
              color: #34444c;
          }
  
          a:hover {
              text-decoration: none !important;
          }
  
          :focus {
              outline: none;
              border: 0;
          }
      </style>
  </head>
  
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
      leftmargin="0">
      <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
          cellpadding="0" cellspacing="0">
          <tr>
             <td style="text-align:center; max-width: 620px; width: 620px;">
               <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
               margin-bottom: 0;">Welcome to the Team</h1>
             </td>
           </tr>
          <tr>
              <td style="max-width: 620px; width: 620px;">
                  <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                      style="background:#ffffff; text-align:left;">
                      <tr>
                          <td colspan="2" class="container"
                              style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                              <img src="https://ot360dev.blob.core.windows.net/master/email-template/common-header.png"
                                  alt="" style="display: block;">
                          </td>
                      </tr>
                      
                      <tr>
                          <td style="padding:30px; background-color: #d7e4f3;">
                              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                  <tr>
                         <td style="padding:30px; background-color: #d7e4f3;">
                             <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                 <tr>
                                     <td>
                                         <p> Reach out and give our new team member a warm welcome! </p>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td>
                                         <p>Name : <<employee_name>>, <<employee_email>></p>
                                         <p>Location : <<location>></p>
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
                              </table>
                          </td>
                      </tr>
                      <tr>
                        <td>
                         <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="background-color: #d7e4f3; max-width:620px; margin:0 auto;">
                           <tr>
                             <td colspan="2" style="padding-bottom:20px;">
                               <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                 <tr>
                                   <td style="width: 30%;padding-bottom: 20px;padding-top: 20px;">&nbsp;</td>
                                     <td style="padding-bottom: 20px;padding-top: 20px;border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                         <a href="<<customer_portal_link>>" target="_blank">
                                             <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                         </a>
                                     </td>
                                     <td style="width: 30%;padding-bottom: 20px;padding-top: 20px;">&nbsp;</td>
                                 </tr>
                               </table>
                             </td>
                           </tr>
                         </table>
                        </td>
                      </tr>
                      
  
                  </table>
              </td>
          </tr>
          <tr>
              <td
                  style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                  <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                  <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                      <<account_name>>
                  </p>
                  <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                      alt="">
              </td>
          </tr>
      </table>
  </body>
  
  </html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Mobile', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!',
 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'InApp', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!', 
'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'SMS', '', 'Welcome New Team Member - <<employee_name>>', 
'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'CHECKIN_REQUEST', 'InApp', 'Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`,`description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'CHECKIN_REQUEST', 'Mobile', 'Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Report Digest', 'Template when Certificate Report Digest', 'CERTIFICATE_REPORT_DIGEST', 'Email', '<<month>>’s Certificate Report', 
'<!doctype html>
<html lang="en-US">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Monthly Report Digest</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-bulk-import-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<user_name>> ,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">Your team’s certificate report for the month of <month> is now available in OneTeam360 for review, and an exported version is attached to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<company_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '1', '2022-06-12 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Checked-in!', 'Your check-in at <<location>> was confirmed.', 'ACCEPT_CHECKIN_REQUEST', 'InApp', 'Checked-in!', 'Your check-in at <<location>> was confirmed.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Checked-in!', 'Your check-in at <<location>> was confirmed.', 'ACCEPT_CHECKIN_REQUEST', 'Mobile', 'Checked-in!', 'Your check-in at <<location>> was confirmed.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'REJECT_CHECKIN_REQUEST', 'InApp', 'Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`)
VALUES ('Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'REJECT_CHECKIN_REQUEST', 'Mobile', 'Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Note Added!', 'Template for note is added', 'ADD_NOTE_NOTIFY_MANAGER', 'Email', 'Note Added!', '
<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Add Note</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">
                    <p style="margin-bottom:20px;font-size:15px">A <<Note_type>> note is added to <<added_name>> by <<employee_name>>. Please click here to view details <a href="<<customer_portal_link>>" target="_blank"> link of OT360 platform </a>.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '1', '2022-06-12 16:56:13');


UPDATE `notification_template` SET `subject` = 'Daily Score Available', `body` = 'Visit your profile to see today’s updated points.' WHERE (`code` = 'EMPLOYEE_POINTS_UPDATE' AND `notification_type` = 'InApp');
UPDATE `notification_template` SET `subject` = 'Daily Score Available', `body` = 'Visit your profile to see today’s updated points.' WHERE (`code` = 'EMPLOYEE_POINTS_UPDATE' AND `notification_type` = 'Mobile');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Task Assigned', 'Template when new task assigned', 'TASK_ASSIGNED', 'InApp', 'New Task Assigned', 'A new task has been assigned to you by <<employee_name>>. Click to view more!', 'Active', '1', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Task Completed', 'Template when task is completed', 'TASK_COMPLETED', 'InApp', 'Task Completed', '<<employee_name>> has marked the task as completed on <<date_time_of_task_competition>>. Click here to view details!', 'Active', '1', '2021-06-10 16:56:13');


ALTER TABLE `announcement`   
  ADD COLUMN `short_description` TEXT NULL AFTER `name`;

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Employee point update', 'Push Notification when employee Point change', 'POINT_CALCULATION_FEEDBACK', 'InApp', 'Daily Score Available', 'Click here to give us feedback and view your updated points.', 'Active', '131', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Employee point update', 'Push Notification when employee Point change', 'POINT_CALCULATION_FEEDBACK', 'Mobile', 'Daily Score Available', 'Click here to give us feedback and view your updated points.', 'Active', '131', '2021-06-10 16:56:13');

ALTER TABLE `employee_point_audit` 
ADD COLUMN `dailyreport_score` DECIMAL(11,0) NULL AFTER `checkin_score`;

INSERT INTO `role_permission` VALUES (NULL,1,84,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,1,85,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,1,86,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,2,84,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,2,85,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,1,87,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,2,87,1,'2022-07-16 21:20:12','Active',NULL,NULL);

 UPDATE `notification_template` SET `body` = '<html lang="en-US">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
    href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap
    rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template" />
    <style type="text/css">
      html,
      body {
        font-family: "Lato", sans-serif;
        color: #34444c;
      }
      a:hover {
        text-decoration: none !important;
      }
      :focus {
        outline: none;
        border: 0;
      }
    </style>
  </head>
  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="margin: 0px; background-color: #fff"
    bgcolor="#fff"
    leftmargin="0"
  >
    <table
      style="background-color: #fff; max-width: 620px; margin: 0 auto"
      width="100%"
      border="0"
      align="center"
      cellpadding="0"
      cellspacing="0"
    >
     <tr>
        <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 15px;">
          <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
          margin-bottom: 0;">Birthdays This Week</h1>
        </td>
      </tr>
      <tr>
        <td style="max-width: 620px; width: 620px">
          <table
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
            style="background: #ffffff; text-align: left"
          >
            <tr>
              <td
                colspan="2"
                class="container"
                style="
                  font-size: 15px;
                  vertical-align: bottom;
                  display: block;
                  margin: 0 auto;
                  max-width: 620px;
                  width: 620px;
                "
              >
                <img src="https://ot360dev.blob.core.windows.net/master/email-template/header.png" alt="" style="display: block" />
              </td>
            </tr>
            <tr>
                <td style="text-align:center; max-width: 620px; width: 620px;background-color: #d7e4f3;">
                  <h1 style="margin-top: 10px; text-align: center; font-weight: 900; font-size: 22px;margin-bottom: 0;">Time To Celebrate!</h1>
                </td>
              </tr>
            <tr>
            <tr>
              <td style="padding: 30px; background-color: #d7e4f3">
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td style="line-height: 30px; display: flex; align-items: center;justify-content: center; flex-flow: wrap;gap: 5px;">
                      <<body>>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: #d7e4f3;
                    max-width: 620px;
                    margin: 0 auto;
                  "
                >
                  <tr>
                    <td colspan="2" style="padding-bottom: 20px">
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="margin: 0 auto"
                      >
                        <tr>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                          <td
                            style="
                              border-radius: 2px;
                              text-align: center;
                              width: 40%;
                              height: 48px;
                              width: 208px;
                              padding-top: 20px;padding-bottom: 20px;
                            "
                            align="center"
                          >
                            <a href="<<customer_portal_link>>" target="_blank">
                              <img
                                src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png"
                                alt=""
                              />
                            </a>
                          </td>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                        </tr>
                         <tr>
                          <td style="width: 30%">&nbsp;</td>
                          <td style="width: 30%">&nbsp;</td>
                          <td
                            style="
                              width: 30%;
                              text-align: right;
                              padding-right: 20px;
                            "
                          >
                            <img src="https://ot360dev.blob.core.windows.net/master/email-template/birthday_img.png" alt="" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td
          style="
            vertical-align: top;
            padding-bottom: 10px;
            padding-top: 10px;
            font-size: 15px;
            text-align: left;
          "
        >
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            Thank you,
          </p>
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            <<account_name>>
          </p>
          <img
            src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
            alt=""
          />
        </td>
      </tr>
    </table>
  </body>
</html>
' WHERE (`code` = 'BIRTHDAY_ANNOUNCEMENT' AND `notification_type` = 'Email');

ALTER TABLE `task`   
  ADD COLUMN `is_scheduled` TINYINT(1) DEFAULT 0  NULL AFTER `status`,
  ADD COLUMN `scheduled_interval_in_days` INT(10) NULL AFTER `is_scheduled`,
  ADD COLUMN `scheduled_task_end_date_interval` INT(10) NULL AFTER `scheduled_interval_in_days`,
  ADD COLUMN `scheduled_end_date` DATE NULL AFTER `scheduled_task_end_date_interval`;

INSERT INTO `cron_job` (`name`, `code`, `description`, `last_processing_date`, `scheduled_time`) 
VALUES('Task Scheduled','TASK_SCHEDULED','Cron Job for Task Scheduled',NULL,NULL);
CREATE TABLE `report_submission_point_calculation`(  
  `report_submission_status_id` INT(10) NOT NULL AUTO_INCREMENT,
  `report_submission_status` ENUM('draft','submitted'),
  `weighted_tier_id` INT(11),
  `impact_multiplier_id` INT(11) NOT NULL,
  PRIMARY KEY (`report_submission_status_id`, `impact_multiplier_id`),
  INDEX (`weighted_tier_id`, `impact_multiplier_id`),
  INDEX (`impact_multiplier_id`),
  FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier`(`impact_multiplier_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=INNODB;

INSERT INTO `report_submission_point_calculation` (`report_submission_status_id`, `report_submission_status`, `weighted_tier_id`, `impact_multiplier_id`) 
VALUES('1','submitted','4','5');

ALTER TABLE `account`   
  ADD COLUMN `azure_product_id` VARCHAR(255) NULL AFTER `is_address_same_as_billing`,
  ADD COLUMN `azure_product_sid` VARCHAR(255) NULL AFTER `azure_product_id`,
  ADD COLUMN `azure_primary_api_key` VARCHAR(255) NULL AFTER `azure_product_sid`,
  ADD COLUMN `azure_secondary_api_key` VARCHAR(255) NULL AFTER `azure_primary_api_key`;

INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('13', '75', 'Expose API', 'Expose_API', 'Allows user to view authentication key', '5', 'Active');

CREATE TABLE `api_permission_module` (
  `api_permission_module_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(250) NOT NULL,
  `description` VARCHAR(250) NOT NULL,
  `status` ENUM('Active', 'Inactive') NULL DEFAULT 'Active',
  `created_by` INT NULL,
  `created_date` DATETIME NULL,
  PRIMARY KEY (`api_permission_module_id`));
CREATE TABLE `api_permission` (
  `api_permission_id` INT NOT NULL AUTO_INCREMENT,
  `api_permission_module_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `status` ENUM('Active', 'Inactive') NULL DEFAULT 'Active',
  `created_by` INT NULL,
  `created_date` DATETIME NULL,
  PRIMARY KEY (`api_permission_id`),
  INDEX `api_permission_module_idx` (`api_permission_module_id` ASC) VISIBLE,
  CONSTRAINT `api_permission_module`
    FOREIGN KEY (`api_permission_module_id`)
    REFERENCES `api_permission_module` (`api_permission_module_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);



INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Management', 'Employee_Management', 'Employee Management', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Onboarding', 'Employee_Onboarding', 'Employee Onboarding', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Profile', 'Employee_Profile', 'Employee Profile', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Certificates', 'Certificates', 'Certificates', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Notes', 'Notes', 'Notes', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Skills', 'Skills', 'Skills', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Offboarding', 'Employee_Offboarding', 'Employee Offboarding', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Manager Dashboard', 'Manager_Dashboard', 'Manager Dashboard', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Daily Report', 'Daily_Report', 'Daily Report', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Skill Assessment Report', 'Skill_Assessment_Report', 'Skill Assessment Report', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Tasks', 'Tasks', 'Tasks', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Points Audit', 'Points_Audit', 'Points Audit', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Skill Master', 'Skill_Master', 'Skill Master', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Company Announcements', 'Company_Announcements', 'Company Announcements', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('360 Feedback Report', '360_Feedback_Report', '360 Feedback Report', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Certificate Report', 'Certificate_Report', 'Certificate Report', 'Active', '7', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Dashboard', 'Employee_Dashboard', 'Employee Dashboard', 'Active', '7', '2022-08-09 19:45:34');

-- api permission data
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Directory', 'View_Employees',  'view all employee list', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'View Team Member Profile', 'View_Employee_Profile', 'view employee profile', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Team Member', 'Edit_Employee',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('2', 'Add Team Member', 'Add_Employee',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('2', 'Add Bulk Team Members', 'Bulk_Import_Employees',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'View Profile Details', 'View_Employee_Profile', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'Rate Interaction', 'Rate_Interaction', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'Adjust Points', 'Adjust_Point', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'View Points History', 'View_Points_History',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('4', 'Add Certificates', 'Add_Certificate', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('4', 'View Certificates', 'View_Certificates', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('5', 'Add Note', 'Add_Note', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('5', 'View Notes', 'View_Notes',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('6', 'View Skill', 'View_Skill', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('7', 'Inactivate Team Member', 'Inactivate_Employee', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('8', 'View Team Members', 'View_Employees', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('9', 'View Report History', 'View_Report_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('10', 'Skill Assessment Report', 'Training_List', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('10', 'Skill Assessment Report', 'Export_Excel_Training', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Add Task', 'Add_Task',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Complete Task', 'Complete_Task', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('12', 'View Point Audit Report', 'View_Points_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('13', 'Add Quiz Questions', 'Add_Quiz_Questions', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Add Announcement', 'Create_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'View Announcement List', 'View_Configured_Announcement',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Edit Announcement', 'Edit_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Inactivate Announcement', 'Inactive_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Feedback Statistics', 'View_Feedback_Statastics', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('16', 'View Certificates Report', 'View_Certificates_Report',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('16', 'Export Certificates Report', 'Export_Certificates_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('6', 'View All Roles', 'View_All_Roles', '', 'Active');
INSERT INTO `user` (`email`, `first_name`, `last_name`, `phone`, `date_of_birth`, `profile_picture_url`, `profile_picture_thumbnail_url`, `status`, `created_by`, `created_date`, `portal_access`) VALUES ('admin@oneteam360.com', 'System', 'system', '1111111111', '2021-07-12', 'https://ot360dev.azureedge.net/master/qa/profile-picture/449db469-e5ca-424b-8c43-121141a7174e.png', 'https://ot360dev.azureedge.net/master/qa/profile-picture/449db469-e5ca-424b-8c43-121141a7174e.png', 'Invited', '11', '2021-07-13 09:41:36', 'customer_portal');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Manager Report', 'View_Manager_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'Export Manager Report', 'Export_Manager_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Location Report', 'View_Location_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'Export Location Report', 'Export_Location_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('17', 'Request Check In', 'Request_Check_in', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('8', 'Review Check In', 'Review_Check_in', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('8', 'View Pending Checkin Requests', 'View_Pending_Checkin_Requests', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'View Private Tasks', 'View_Private_Tasks', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Access Task History', 'Access_Task_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'View Employee Private Tasks', 'View_Employee_Private_Tasks', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Date of Hire', 'Edit_Date_of_Hire', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Email ID', 'Edit_Email_ID', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Team Member ID', 'Edit_Team_Member_ID', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'Review Certificate', 'Review_Certificate', '', 'Active');

INSERT INTO `employee_profile` (`user_id`, `role_id`, `created_by`, `points`, `status`, `employee_import_id`, `created_date`) VALUES ('27', '2', '61', '0', 'Active', '0', '2022-08-09 08:10:59');

INSERT INTO `role_permission` VALUES 
(NULL,1,76,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,77,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,78,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,79,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,80,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,81,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,82,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,83,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,88,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,89,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,90,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,91,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,92,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,93,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,94,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,95,1,'2022-07-16 21:20:12','Active',NULL,NULL);

ALTER TABLE `notification_queue`   
	ADD COLUMN `status` ENUM('Pending','InProgress','Completed') NULL AFTER `created_date`;

ALTER TABLE `notification_queue`   
	CHANGE `status` `status` ENUM('Pending','InProgress','Completed') CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending' NULL;

CREATE TABLE `notification_queue_log` (  
  `notification_queue_log_id` INT(11) NOT NULL AUTO_INCREMENT,
  `notification_queue_id` TEXT,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`notification_queue_log_id`) 
);

UPDATE `notification_template` SET `body` = 'Congratulate <<body>>.' WHERE (`code` = 'WORK_ANNIV_ANNOUNCEMENT' AND `notification_type` = 'Mobile');
UPDATE `notification_template` SET `body` = 'Congratulate <<body>>.' WHERE (`code` = 'WORK_ANNIV_ANNOUNCEMENT' AND `notification_type` = 'InApp');
UPDATE `notification_template` SET `body` = 'Congratulate <<body>>.' WHERE (`code` = 'WORK_ANNIV_ANNOUNCEMENT' AND `notification_type` = 'SMS');
