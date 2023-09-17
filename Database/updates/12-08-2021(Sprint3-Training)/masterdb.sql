CREATE TABLE `grade`  (
    `grade_id` int
);
ALTER TABLE `grade` CHANGE `grade_id` `grade_id` INT NOT NULL;
ALTER TABLE `grade` ADD PRIMARY KEY(`grade_id`);
ALTER TABLE `grade` CHANGE `grade_id` `grade_id` INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `grade` ADD `name` VARCHAR(100) NOT NULL AFTER `grade_id`, ADD `description` VARCHAR(255) NULL DEFAULT NULL AFTER `name`, ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `description`, ADD `icon_img_path` VARCHAR(250) NULL DEFAULT NULL AFTER `status`, ADD `created_by` INT NOT NULL AFTER `icon_img_path`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;

ALTER TABLE `grade` ADD CONSTRAINT `created_by_grade` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `grade` ADD  CONSTRAINT `updated_by_grade` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `grade` ADD COLUMN `icon_name` VARCHAR(45) NULL AFTER `status`;