ALTER TABLE `notification_queue` ADD `entity_type` VARCHAR(50) NULL DEFAULT NULL AFTER `entity_id`;

ALTER TABLE `notification_queue` CHANGE `notification_queue_id` `notification_queue_id` INT(11) NOT NULL AUTO_INCREMENT, CHANGE `notification_subject` `notification_subject` VARCHAR(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL, CHANGE `entity_type` `entity_type` VARCHAR(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL, CHANGE `default_recipeints` `default_recipeints` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL, CHANGE `sent_date` `sent_date` DATETIME NULL DEFAULT NULL, CHANGE `retry_count` `retry_count` INT(11) NULL DEFAULT NULL, CHANGE `notification_error` `notification_error` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

ALTER TABLE `notification_template` DROP FOREIGN KEY `CreatedBynotification`; ALTER TABLE `notification_template` ADD CONSTRAINT `CreatedBynotification` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `notification_template` ADD CONSTRAINT `LastUpdatedByNotification` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

RENAME TABLE `ymca_qa`.`employee_certification` TO `ymca_qa`.`employee_certificate`;
 
ALTER TABLE `employee_certificate` CHANGE `certification_path` `certificate_file_path` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

ALTER TABLE `employee_certificate` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `note`;

ALTER TABLE `certificate_type` DROP FOREIGN KEY `createdBy_certificate`; ALTER TABLE `certificate_type` ADD CONSTRAINT `createdBy_certificate` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `certificate_type` ADD CONSTRAINT `updated_by_certificate` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `level` CHANGE `description` `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL;

ALTER TABLE `level` ADD CONSTRAINT `update_by_level` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `job_type` CHANGE `description` `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL;

ALTER TABLE `job_type` ADD CONSTRAINT `updated_by_job` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `location` CHANGE `parent_location_id` `parent_location_id` INT(11) NULL;

ALTER TABLE `location` CHANGE `description` `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL;


UPDATE `location` SET `city` = '1', `state_code` = '1', `country_code` = '1' WHERE (`location_id` = '1');
UPDATE `location` SET `city` = '1', `state_code` = '1', `country_code` = '1' WHERE (`location_id` = '2');
UPDATE `location` SET `city` = '1', `state_code` = '1', `country_code` = '1' WHERE (`location_id` = '3');
UPDATE `location` SET `city` = '1', `state_code` = '1', `country_code` = '1' WHERE (`location_id` = '4');

ALTER TABLE `location` CHANGE `city` `city_id` INT NOT NULL;

ALTER TABLE `location` CHANGE `state_code` `state_id` INT NOT NULL;

ALTER TABLE `location` CHANGE `country_code` `country_id` INT NOT NULL;

ALTER TABLE `location` ADD `zip` VARCHAR(10) NOT NULL AFTER `country_id`;

ALTER TABLE `location` ADD CONSTRAINT `update_by_location` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;


ALTER TABLE `employee_profile` ADD `role_id` INT NOT NULL AFTER `user_id`;

SET SQL_SAFE_UPDATES = 0;
Update employee_profile set role_id = 1;

ALTER TABLE `employee_profile` ADD CONSTRAINT `role_employee` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `employee_profile` ADD `date_of_joining` DATETIME NULL AFTER `role_id`;

ALTER TABLE `employee_profile` CHANGE `level_id` `level_id` INT(11) NULL;

ALTER TABLE `employee_profile` ADD CONSTRAINT `level_employee` FOREIGN KEY (`level_id`) REFERENCES `level`(`level_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `employee_profile` CHANGE `bulk_import_Id` `employee_import_id` INT(11) NULL DEFAULT NULL;

ALTER TABLE `employee_profile` ADD CONSTRAINT `createdBy_employee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `employee_profile` ADD CONSTRAINT `updatedBy_employee` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;