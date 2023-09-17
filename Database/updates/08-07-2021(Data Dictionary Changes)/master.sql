ALTER TABLE `account` CHANGE `account_email` `email` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE `account` ADD CONSTRAINT `last_updated_by_user` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account` ADD CONSTRAINT `created_by_user` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_configuration` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `sequence`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;

ALTER TABLE `account_configuration` ADD  CONSTRAINT `last_updated_by_account` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_configuration` ADD CONSTRAINT `craetedBy_account` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_configuration_detail` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `sequence`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`;

ALTER TABLE `account_configuration_detail` ADD  CONSTRAINT `created_by_config` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_configuration_detail` ADD  CONSTRAINT `updated_by_config` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user` DROP `date_of_joining`;

ALTER TABLE `user` CHANGE `emergency_contact_phone` `emergency_contact_number` VARCHAR(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;
ALTER TABLE `user` CHANGE `emergency_contact_city` `emergency_contact_city_id` INT(11) NULL DEFAULT NULL, CHANGE `emergency_contact_statecode` `emergency_contact_state_id` INT(11) NULL DEFAULT NULL;
ALTER TABLE `user` ADD `emergency_contact_country_id` INT(11) NULL DEFAULT NULL AFTER `emergency_contact_address`;
ALTER TABLE `user` ADD  CONSTRAINT `cityId` FOREIGN KEY (`emergency_contact_city_id`) REFERENCES `city`(`city_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user` ADD  CONSTRAINT `stateId` FOREIGN KEY (`emergency_contact_state_id`) REFERENCES `state`(`state_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user` ADD  CONSTRAINT `countryId` FOREIGN KEY (`emergency_contact_country_id`) REFERENCES `country`(`country_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_user` CHANGE `account_owner` `account_owner` BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE `account_user`  DROP `role_id`;

ALTER TABLE `account_user` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `account_owner`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`;
ALTER TABLE `account_user` ADD CONSTRAINT `created_by_accountUser` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `account_user` ADD  CONSTRAINT `updated_by_accountUser` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `onboard_step` ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`;
ALTER TABLE `onboard_step` ADD CONSTRAINT `created_by_onboard` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
RENAME TABLE `masterdb`.`account_onboard` TO `masterdb`.`account_onboard_step`;
ALTER TABLE `account_onboard_step` CHANGE `account_onboard_id` `account_onboard_step_id` INT(11) NOT NULL AUTO_INCREMENT, CHANGE `status` `status` ENUM('Active','Inactive') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
ALTER TABLE `subscription_plan` ADD `created_by` INT(11) NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`, ADD `last_updated_by` INT(11) NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;
ALTER TABLE `subscription_plan` ADD  CONSTRAINT `created_by_subscription` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `subscription_plan` ADD  CONSTRAINT `updated_by_subscription` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `subscription_plan` CHANGE `subscription_plan_id` `subscription_plan_id` INT(11) NOT NULL AUTO_INCREMENT, CHANGE `description` `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL, CHANGE `bill_interval` `bill_interval` INT(11) NULL DEFAULT NULL, CHANGE `min_price` `min_price` DOUBLE NULL DEFAULT NULL, CHANGE `last_updated_by` `last_updated_by` INT(11) NULL DEFAULT NULL, CHANGE `last_updated_date` `last_updated_date` DATETIME NULL DEFAULT NULL;

ALTER TABLE `subscription_plan_tier` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `price_per_seat`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;

ALTER TABLE `subscription_plan_tier` ADD CONSTRAINT `createdBy_plan` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `subscription_plan_tier` ADD CONSTRAINT `updatedBy_plan` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `account_subscription` ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `expiry_date`;
ALTER TABLE `account_subscription` CHANGE `account_subscription_id` `account_subscription_id` INT(11) NOT NULL AUTO_INCREMENT, CHANGE `stripe_account_id` `stripe_account_id` VARCHAR(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL, CHANGE `amount` `amount` DOUBLE NULL DEFAULT NULL, CHANGE `last_updated_date` `last_updated_date` DATETIME NULL DEFAULT NULL, CHANGE `last_updated_by` `last_updated_by` INT(11) NULL DEFAULT NULL;
ALTER TABLE `account_subscription_history` CHANGE `account_subscription_history_id` `account_subscription_history_id` INT(11) NOT NULL AUTO_INCREMENT, CHANGE `last_updated_date` `created_date` DATETIME NULL DEFAULT NULL, CHANGE `last_updated_by` `created_by` INT(11) NULL DEFAULT NULL;
ALTER TABLE `account_subscription_history` ADD CONSTRAINT `creatd_by_sub_history` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_login_log` ADD `device_os_version` VARCHAR(50) NULL DEFAULT NULL AFTER `device_os_name`;

ALTER TABLE `user` 
ADD COLUMN `profile_picture_thumbnail_url` VARCHAR(120) NULL AFTER `profile_picture_url`;


########################################################################


ALTER TABLE `masterdb`.`user` 
ADD COLUMN `emergency_contact_country_id` INT NULL AFTER `usercol`;

SET SQL_SAFE_UPDATES = 0;
Update user set emergency_contact_country_id = 233;

SET SQL_SAFE_UPDATES = 0;
Update user set emergency_contact_statecode = 1407;

SET SQL_SAFE_UPDATES = 0;
Update user set emergency_contact_city = 110981;

ALTER TABLE `masterdb`.`user` 
CHANGE COLUMN `emergency_contact_country_id` `emergency_contact_country_id` INT NULL DEFAULT NULL AFTER `emergency_contact_address`,
CHANGE COLUMN `emergency_contact_statecode` `emergency_contact_state_id` INT NULL DEFAULT NULL AFTER `emergency_contact_country_id`,
CHANGE COLUMN `emergency_contact_city` `emergency_contact_city_id` INT NULL DEFAULT NULL ;


ALTER TABLE `masterdb`.`user` 
CHANGE COLUMN `emergency_contact_country_id` `emergency_contact_country_id` INT UNSIGNED NULL DEFAULT NULL ,
CHANGE COLUMN `emergency_contact_state_id` `emergency_contact_state_id` INT UNSIGNED NULL DEFAULT NULL ,
CHANGE COLUMN `emergency_contact_city_id` `emergency_contact_city_id` INT UNSIGNED NULL DEFAULT NULL ;


ALTER TABLE `masterdb`.`user` 
ADD INDEX `FK_USER_COUNTRY_idx` (`emergency_contact_country_id` ASC) VISIBLE;;
ALTER TABLE `masterdb`.`user` 
ADD CONSTRAINT `FK_USER_COUNTRY`
  FOREIGN KEY (`emergency_contact_country_id`)
  REFERENCES `masterdb`.`country` (`country_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

ALTER TABLE `masterdb`.`user` 
ADD INDEX `FK_USER_STATE_idx` (`emergency_contact_state_id` ASC) VISIBLE,
ADD INDEX `FK_USER_CITY_idx` (`emergency_contact_city_id` ASC) VISIBLE;
;

 ALTER TABLE `masterdb`.`user` 
ADD CONSTRAINT `FK_USER_STATE`
  FOREIGN KEY (`emergency_contact_state_id`)
  REFERENCES `masterdb`.`state` (`state_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `FK_USER_CITY`
  FOREIGN KEY (`emergency_contact_city_id`)
  REFERENCES `masterdb`.`city` (`city_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


ALTER TABLE `masterdb`.`country` ADD COLUMN `created_by` INT NOT NULL AFTER `status`, ADD COLUMN `last_updated_by` INT NULL AFTER `created_date`, CHANGE COLUMN `created_date` `created_date` DATETIME NOT NULL , CHANGE COLUMN `updated_date` `last_updated_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ;
 
 

ALTER TABLE `masterdb`.`city`
ADD COLUMN `created_by` INT NOT NULL AFTER `status`,
ADD COLUMN `last_updated_by` INT NULL AFTER `created_date`,
CHANGE COLUMN `created_date` `created_date` DATETIME NOT NULL ,
CHANGE COLUMN `updated_date` `last_updated_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ;

 