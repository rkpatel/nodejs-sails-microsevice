create table task_type( task_type_id INT NOT NULL AUTO_INCREMENT, name VARCHAR(100) NOT NULL, description VARCHAR(250) NULL, created_date DATETIME, PRIMARY KEY ( task_type_id ) )

ALTER TABLE `task_type` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `created_date`, ADD `created_by`  INT(11) NOT NULL AFTER `status`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_by`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;

ALTER TABLE `task_type` CHANGE `description` `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL, CHANGE `last_updated_by` `last_updated_by` INT(11) NULL DEFAULT NULL, CHANGE `last_updated_date` `last_updated_date` DATETIME NULL DEFAULT NULL;

ALTER TABLE `task_type` ADD CONSTRAINT `created_by_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `task_type` ADD CONSTRAINT `updated_by_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

create table task( task_id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY ( task_id ) )

ALTER TABLE `task` ADD `task_type_id` INT NOT NULL AFTER `task_id`, ADD `job_type_id` INT NULL DEFAULT NULL AFTER `task_type_id`, ADD `title` VARCHAR(50) NOT NULL AFTER `job_type_id`, ADD `description` VARCHAR(100) NULL DEFAULT NULL AFTER `title`, ADD `assigned_by` INT NOT NULL AFTER `description`, ADD `location_id` INT NULL DEFAULT NULL AFTER `assigned_by`, ADD `task_status` ENUM('Pending','Completed') NOT NULL AFTER `location_id`, ADD `is_private` BOOLEAN NOT NULL AFTER `task_status`, ADD `start_date` DATETIME NOT NULL AFTER `is_private`, ADD `end_date` DATETIME NOT NULL AFTER `start_date`, ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `end_date`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`;

ALTER TABLE `task` ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;
ALTER TABLE `task` ADD CONSTRAINT `assigned_employee` FOREIGN KEY (`assigned_by`) REFERENCES `employee_profile`(`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `task` ADD CONSTRAINT `location_task` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `task` ADD CONSTRAINT `createdby_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `task` ADD CONSTRAINT `updatedby_task` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

create table task_assignee( task_assignee_id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY ( task_assignee_id ) )

ALTER TABLE `task_assignee` ADD `task_id` INT NOT NULL AFTER `task_assignee_id`, ADD `assigned_to` INT NOT NULL AFTER `task_id`, ADD `task_status` ENUM('Pending','Completed') NOT NULL AFTER `assigned_to`, ADD `created_by` INT NOT NULL AFTER `task_status`, ADD `created_date` DATETIME NULL DEFAULT NULL AFTER `created_by`, ADD `last_updated_by` INT NOT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;

ALTER TABLE `task_assignee` ADD CONSTRAINT `createdby_assignee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `task_assignee` ADD CONSTRAINT `updatedby_assignee` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

create table task_log( task_log_id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY ( task_log_id ) )
create table task_image( task_image_id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY ( task_image_id ) )

ALTER TABLE `task_image` ADD `task_id` INT NOT NULL AFTER `task_image_id`, ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `task_id`, ADD `image_path` VARCHAR(250) NOT NULL AFTER `status`, ADD `created_by` INT NOT NULL AFTER `image_path`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`;
ALTER TABLE `task_image` ADD CONSTRAINT `creted_by_image` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `task` CHANGE `title` `title` VARCHAR(160) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL, CHANGE `description` `description` TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;
ALTER TABLE `task` CHANGE `is_private` `is_private` TINYINT(1) NOT NULL DEFAULT '0';
ALTER TABLE `task_image` CHANGE `image_path` `image_url` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
ALTER TABLE `task_image` ADD `image_thumbnail_url` VARCHAR(250) NOT NULL AFTER `image_url`;
ALTER TABLE `task_assignee` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `task_status`;

ALTER TABLE `task_assignee` CHANGE `created_date` `created_date` DATETIME NOT NULL;
ALTER TABLE `task_assignee` CHANGE `last_updated_by` `last_updated_by` INT(11) NULL DEFAULT NULL;


ALTER TABLE `task` CHANGE `task_status` `task_status` ENUM('Overdue','Pending','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE `task_assignee` CHANGE `task_status` `task_status` ENUM('Overdue','Pending','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;