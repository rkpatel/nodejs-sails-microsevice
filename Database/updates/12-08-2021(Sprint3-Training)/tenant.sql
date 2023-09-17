CREATE TABLE `training`  (
    `training_id` int
);
ALTER TABLE `training` CHANGE `training_id` `training_id` INT NOT NULL;
ALTER TABLE `training` ADD PRIMARY KEY(`training_id`);
ALTER TABLE `training` CHANGE `training_id` `training_id` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `training` ADD `training_category_id` INT NOT NULL AFTER `training_id`, ADD `name` VARCHAR(50) NOT NULL AFTER `training_category_id`, ADD `description` VARCHAR(100) NULL DEFAULT NULL AFTER `name`,  ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `description`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;

ALTER TABLE `training` ADD CONSTRAINT `created_by_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `training` ADD CONSTRAINT `updated_by_training` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `training` ADD CONSTRAINT `training_category_training` FOREIGN KEY (`training_category_id`) REFERENCES `training_category`(`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `resource` (
  `resource_id` int(11) NOT NULL )
ALTER TABLE `resource` ADD PRIMARY KEY(`resource_id`);
ALTER TABLE `resource` CHANGE `resource_id` `resource_id` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `resource` ADD `title` VARCHAR(50) NOT NULL AFTER `resource_id`, ADD `description` VARCHAR(100) NULL DEFAULT NULL AFTER `title`, ADD `resource_type` VARCHAR(100) NOT NULL AFTER `description`, ADD `location_path` VARCHAR(100) NOT NULL AFTER `resource_type`, ADD `created_by` INT(11) NOT NULL AFTER `location_path`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`;
ALTER TABLE `resource` ADD CONSTRAINT `created_by_resource` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE `training_resource` (
  `training_resource_id` int(11) NOT NULL );
ALTER TABLE `training_resource` ADD PRIMARY KEY(`training_resource_id`);
ALTER TABLE `training_resource` CHANGE `training_resource_id` `training_resource_id` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `training_resource` ADD `training_id` INT(11) NOT NULL AFTER `training_resource_id`, ADD `resource_id` INT(11) NOT NULL AFTER `training_id`, ADD `created_by` INT(11) NOT NULL AFTER `resource_id`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`;
ALTER TABLE `training_resource` ADD CONSTRAINT `created_by_tresource` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE `training_job_type`  (
    `training_job_type_id` int
);
ALTER TABLE `training_job_type` ADD PRIMARY KEY(`training_job_type_id`);
ALTER TABLE `training_job_type` CHANGE `training_job_type_id` `training_job_type_id` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `training_job_type` ADD `training_id` INT NOT NULL AFTER `training_job_type_id`, ADD `job_type_id` INT NOT NULL AFTER `training_id`, ADD `created_by` INT NOT NULL AFTER `job_type_id`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`;
ALTER TABLE `training_job_type` ADD CONSTRAINT `created_by_training_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `resource` CHANGE `location_path` `location_path` VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE `resource` CHANGE `resource_type` `resource_type` ENUM('PNG','JPG','PDF','MP4') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
CREATE TABLE `training_employee`  (
    `training_employee_id` int
);
ALTER TABLE `training_employee` CHANGE `training_employee_id` `training_employee_id` INT NOT NULL;
ALTER TABLE `training_employee` ADD PRIMARY KEY(`training_employee_id`);
ALTER TABLE `training_employee` CHANGE `training_employee_id` `training_employee_id` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `training_employee` ADD `training_id` INT NOT NULL AFTER `training_employee_id`, ADD `employee_profile_id` INT NOT NULL AFTER `training_id`, ADD `grade_id` INT NOT NULL AFTER `employee_profile_id`, ADD `notes` TEXT NULL DEFAULT NULL AFTER `grade_id`, ADD `group_activity_id` INT NULL DEFAULT NULL AFTER `notes`, ADD `is_retest` BOOLEAN NOT NULL DEFAULT FALSE AFTER `group_activity_id`, ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `is_retest`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;

ALTER TABLE `training_employee` ADD CONSTRAINT `training_id` FOREIGN KEY (`training_employee_id`) REFERENCES `training`(`training_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `training_employee` ADD CONSTRAINT `employee_profile_training` FOREIGN KEY (`training_employee_id`) REFERENCES `employee_profile`(`employee_profile_id`) ON DELETE CASCADE ON UPDATE RESTRICT;


ALTER TABLE `training_employee` ADD CONSTRAINT `grade_id_emptraining` FOREIGN KEY (`grade_id`) REFERENCES `masterdb`.`grade`(`grade_id`) ON DELETE CASCADE ON UPDATE CASCADE; 
ALTER TABLE `training_employee` ADD CONSTRAINT `created_by_emptraining` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `training_employee` ADD CONSTRAINT `updated_by_emptraining` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `training_employee` DROP FOREIGN KEY `employee_profile_training`; ALTER TABLE `training_employee` ADD CONSTRAINT `employee_profile_training` FOREIGN KEY (`training_employee_id`) REFERENCES `employee_profile`(`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `training_employee` DROP FOREIGN KEY `employee_profile_training`; ALTER TABLE `training_employee` ADD CONSTRAINT `employee_profile_training` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile`(`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `training_employee` DROP FOREIGN KEY `training_id`; ALTER TABLE `training_employee` ADD CONSTRAINT `training_id` FOREIGN KEY (`training_id`) REFERENCES `training`(`training_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `resource` ADD `source` ENUM('Youtube','Vimeo') NOT NULL AFTER `resource_type`;
ALTER TABLE `resource` CHANGE `source` `source` ENUM('Youtube','Vimeo') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;
ALTER TABLE `resource` CHANGE `source` `source` ENUM('YouTube','Vimeo') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

ALTER TABLE `resource` ADD `sequence` INT  NULL AFTER `source`;

ALTER TABLE `training_employee` ADD `job_type_id` INT(11) NULL DEFAULT NULL AFTER `grade_id`;
ALTER TABLE `training_employee` ADD CONSTRAINT `job_type_training_employee` FOREIGN KEY (`job_type_id`) REFERENCES `job_type`(`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `training_employee` CHANGE `training_employee_id` `training_employee_id` INT(11) NOT NULL AUTO_INCREMENT;



ALTER TABLE `resource` CHANGE `source` `source` ENUM('YouTube','Vimeo','Other') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;
