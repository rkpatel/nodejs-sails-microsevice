INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('13', '0', 'Expose API', 'Expose_API', 'Allows user to view authentication key', '5', 'Active');

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
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('7', 'Inactivate Team Member', 'View_Employees', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('8', 'View Team Members', 'View_Employees', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('9', 'View Report History', 'View_Report_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('10', 'Skill Assessment Report', 'Training_List', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('10', 'Skill Assessment Report', 'Export_Excel_Training', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'View Task', 'View_Task',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Add Task', 'Add_Task',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Complete Task', 'Complete_Task', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('12', 'View Point Audit Report', 'View_Points_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('13', 'Add Quiz Questions', 'Add_Quiz_Questions', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Add Announcement', 'Create_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'View Announcement List', 'View_Configured_Announcement',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Edit Announcement', 'Edit_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Inactivate Announcement', 'Inactive_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Feedback Statistics', 'View_Feedback_Statastics', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Feedback Report', 'View_Feedback_Report',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Feedback Report', 'Export_Feedback_Report',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('16', 'View Certificates Report', 'View_Certificates_Report',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('16', 'Export Certificates Report', 'Export_Certificates_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('6', 'View All Roles', 'View_All_Roles', '', 'Active');
INSERT INTO `user` (`email`, `first_name`, `last_name`, `phone`, `date_of_birth`, `profile_picture_url`, `profile_picture_thumbnail_url`, `status`, `created_by`, `created_date`, `portal_access`) VALUES ('admin@oneteam360.com', 'System', 'system', '1111111111', '2021-07-12', 'https://ot360dev.azureedge.net/master/qa/profile-picture/449db469-e5ca-424b-8c43-121141a7174e.png', 'https://ot360dev.azureedge.net/master/qa/profile-picture/449db469-e5ca-424b-8c43-121141a7174e.png', 'Invited', '11', '2021-07-13 09:41:36', 'customer_portal');

INSERT INTO `employee_profile` (`user_id`, `role_id`, `created_by`, `points`, `status`, `employee_import_id`, `created_date`) VALUES ('27', '2', '61', '0', 'Active', '0', '2022-08-09 08:10:59');

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