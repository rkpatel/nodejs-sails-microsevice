CREATE TABLE `interaction_factor`  (
    `interaction_factor_id` int
);
ALTER TABLE `interaction_factor` CHANGE `interaction_factor_id` `interaction_factor_id` INT NOT NULL;
ALTER TABLE `interaction_factor` ADD PRIMARY KEY(`interaction_factor_id`);
ALTER TABLE `interaction_factor` CHANGE `interaction_factor_id` `interaction_factor_id` INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `interaction_factor` ADD `name` VARCHAR(255) NOT NULL AFTER `interaction_factor_id`, ADD `description` TEXT NOT NULL AFTER `name`, ADD `weighted_tier_id` INT NOT NULL AFTER `description`, ADD `job_type_id` INT NOT NULL AFTER `weighted_tier_id`, ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `job_type_id`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`, ADD `last_updated_by` INT NOT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NOT NULL AFTER `last_updated_by`;

ALTER TABLE `interaction_factor` ADD CONSTRAINT `interaxction_weighted_tier` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `interaction_factor` ADD CONSTRAINT `interaction_user` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `interaction_factor` CHANGE `last_updated_by` `last_updated_by` INT(11) NULL DEFAULT NULL, CHANGE `last_updated_date` `last_updated_date` DATETIME NULL DEFAULT NULL;

CREATE TABLE `employee_interaction`  (
    `employee_interaction_id` int
);
ALTER TABLE `employee_interaction` CHANGE `employee_interaction_id` `employee_interaction_id` INT NOT NULL;
ALTER TABLE `employee_interaction` ADD PRIMARY KEY(`employee_interaction_id`);
ALTER TABLE `employee_interaction` CHANGE `employee_interaction_id` `employee_interaction_id` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `employee_interaction` ADD `employee_profile_id` INT(11) NOT NULL AFTER `employee_interaction_id`, ADD `notes` TEXT NULL DEFAULT NULL AFTER `employee_profile_id`, ADD `created_by` INT NOT NULL AFTER `notes`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`;
ALTER TABLE `employee_interaction` ADD CONSTRAINT `emp_interaction_created_by` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `employee_interaction` ADD CONSTRAINT `employee_interaction_employee` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile`(`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `employee_interaction` ADD `level_id` INT NOT NULL AFTER `employee_profile_id`;

CREATE TABLE `employee_interaction_detail`  (
    `employee_interaction_detail_id` int
);
ALTER TABLE `employee_interaction_detail` CHANGE `employee_interaction_detail_id` `employee_interaction_detail_id` INT NOT NULL;
ALTER TABLE `employee_interaction_detail` ADD PRIMARY KEY(`employee_interaction_detail_id`);
ALTER TABLE `employee_interaction_detail` CHANGE `employee_interaction_detail_id` `employee_interaction_detail_id` INT(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `employee_interaction_detail` ADD `employee_interaction_id` INT NOT NULL AFTER `employee_interaction_detail_id`, ADD `interaction_factor_id` INT NOT NULL AFTER `employee_interaction_id`, ADD `grade_id` INT NOT NULL AFTER `interaction_factor_id`;
ALTER TABLE `employee_interaction_detail` ADD CONSTRAINT `emp_detail_interaction` FOREIGN KEY (`interaction_factor_id`) REFERENCES `interaction_factor`(`interaction_factor_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `employee_interaction_detail` ADD CONSTRAINT `grade_interaction_emp_detail` FOREIGN KEY (`grade_id`) REFERENCES `masterdb`.`grade`(`grade_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `level` ADD `level` INT(11) NOT NULL AFTER `level_id`;
ALTER TABLE `level` ADD `range` INT NOT NULL AFTER `point_range_to`;

ALTER TABLE `employee_interaction` CHANGE `level_id` `points` DOUBLE NOT NULL;

ALTER TABLE `interaction_factor` DROP `job_type_id`;
CREATE TABLE `interaction_factor_job_type`  (
    `interaction_factor_job_type_id` int
);
ALTER TABLE `interaction_factor_job_type` CHANGE `interaction_factor_job_type_id` `interaction_factor_job_type_id` INT NOT NULL;
ALTER TABLE `interaction_factor_job_type` ADD PRIMARY KEY(`interaction_factor_job_type_id`);
ALTER TABLE `interaction_factor_job_type` ADD `interaction_factor_id` INT NOT NULL AFTER `interaction_factor_job_type_id`, ADD `job_type_id` INT NOT NULL AFTER `interaction_factor_id`, ADD `created_by` INT NOT NULL AFTER `job_type_id`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`;
ALTER TABLE `interaction_factor_job_type` ADD CONSTRAINT `interaction_job_type` FOREIGN KEY (`interaction_factor_id`) REFERENCES `interaction_factor`(`interaction_factor_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `interaction_factor_job_type` ADD CONSTRAINT `factor_job_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_type`(`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `interaction_factor_job_type` ADD CONSTRAINT `created_by_interaction_factor_job` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;