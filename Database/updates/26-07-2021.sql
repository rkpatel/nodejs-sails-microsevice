ALTER TABLE `task_type` ADD `is_default` BOOLEAN NOT NULL DEFAULT FALSE AFTER `status`;
ALTER TABLE `location` CHANGE `address` `address_1` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;
ALTER TABLE `location` ADD `address_2` VARCHAR(250) NULL DEFAULT NULL AFTER `address_1`;
ALTER TABLE `location` ADD `zip` VARCHAR(50) NOT NULL AFTER `country_id`;