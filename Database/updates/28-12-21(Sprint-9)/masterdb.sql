CREATE TABLE `time_zone` (
  `time_zone_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(225) NOT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL,
  `created_by` INT NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`time_zone_id`));


INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Modified', 'Template when task is modified', 'TASK_MODIFICATION', 'InApp', 'Task Modified', '<<task_name>> has been modified by <<modified_employee_name>>. Click to view more!', 'Active', '1', '2021-06-10 16:56:13');


INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Deleted', 'Template when task is deleted', 'TASK_DELETION', 'InApp', 'Task Deleted/Removed', '<<task_name>> has been removed by <<removed_employee_name>>.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Modified', 'Template when task is modified', 'TASK_MODIFICATION', 'Mobile', 'Task Modified', '<<task_name>> has been modified by <<modified_employee_name>>. Click to view more!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Deleted', 'Template when task is deleted', 'TASK_DELETION', 'Mobile', 'Task Deleted/Removed', '<<task_name>> has been removed by <<removed_employee_name>>.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `time_zone` ( `name`, `status`, `created_by`, `created_date`) VALUES ( 'UTC – 08:00 Pacific Time', 'Active', '7', '2019-10-05 23:58:06');

INSERT INTO `time_zone` ( `name`, `status`, `created_by`, `created_date`) VALUES ( 'America/Los_Angeles', 'Active', '7', '2019-10-05 23:58:06');


ALTER TABLE `account`   
  ADD COLUMN `theme` ENUM('Fresh Saffron','Business Blue') DEFAULT 'Fresh Saffron' NOT NULL AFTER `website_url`;

INSERT INTO `permission_module` (`permission_module_id`, `parent_permission_module_id`, `name`, `code`, `description`, `sequence`, `status`, `created_by`, `created_date`) VALUES ('13', '0', 'Configurations', 'Configurations', 'Configurations', '13', 'Active', '7', '2021-09-07 10:13:36');

UPDATE `permission` SET `permission_module_id` = '13', `sequence` = '1' WHERE (`permission_id` = '75');

ALTER TABLE `time_zone`   
	ADD COLUMN `display_name` VARCHAR(255) NOT NULL AFTER `name`;

UPDATE
    `time_zone`
SET
    `display_name` = 'Universal Time (UTC)'
WHERE
    (`time_zone_id` = '1');

UPDATE
    `time_zone`
SET
    `display_name` = 'Pacific Standard Time (UTC-8)'
WHERE
    (`time_zone_id` = '2');

INSERT INTO `time_zone`(`time_zone_id`,`name`,`display_name`,`status`,`created_by`,`created_date`) VALUES 
(3,'America/New_York','Eastern Standard Time (UTC-5)','Active',7,'2022-02-04 13:57:25'),
(4,'America/Chicago','Central Standard Time (UTC-6)','Active',7,'2022-02-04 13:53:15'),
(5,'America/Denver','Mountain Standard Time (UTC-7)','Active',7,'2022-02-04 13:54:17'),
(6,'America/Anchorage','Alaska Standard Time(UTC-9)','Active',7,'2022-02-04 13:59:17'),
(7,'Pacific/Honolulu','Hawaii-Aleutian Standard Time (UTC-10)','Active',7,'2022-02-04 14:12:14');
