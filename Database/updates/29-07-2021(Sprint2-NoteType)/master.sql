CREATE TABLE `weighted_tier`  (
    `weighted_tier_id` int
);
ALTER TABLE `weighted_tier` ADD PRIMARY KEY(`weighted_tier_id`);
ALTER TABLE `weighted_tier` ADD `name` VARCHAR(50) NOT NULL AFTER `weighted_tier_id`, ADD `description` VARCHAR(250) NULL DEFAULT NULL AFTER `name`, ADD `score` INT NULL DEFAULT NULL AFTER `description`, ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `score`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;
ALTER TABLE `weighted_tier` ADD CONSTRAINT `createdBy_weighted` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `weighted_tier` ADD CONSTRAINT `lastUpdatedBy_weighted` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE `impact_multiplier` ( `impact_multiplier_id` int NOT NULL )
ALTER TABLE `impact_multiplier` ADD PRIMARY KEY(`impact_multiplier_id`)
ALTER TABLE `impact_multiplier` ADD `name` VARCHAR(50) NOT NULL AFTER `impact_multiplier_id`, ADD `description` VARCHAR(250) NULL DEFAULT NULL AFTER `name`, ADD `score` INT NULL DEFAULT NULL AFTER `description`, ADD `status` ENUM('Active','Inactive') NOT NULL AFTER `score`, ADD `created_by` INT NOT NULL AFTER `status`, ADD `created_date` DATETIME NOT NULL AFTER `created_by`, ADD `last_updated_by` INT NULL DEFAULT NULL AFTER `created_date`, ADD `last_updated_date` DATETIME NULL DEFAULT NULL AFTER `last_updated_by`;
ALTER TABLE `impact_multiplier` ADD CONSTRAINT `createdBy_multiplier` FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE `impact_multiplier` ADD CONSTRAINT `lastUpdatedBy_multiplier` FOREIGN KEY (`last_updated_by`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `impact_multiplier` CHANGE `score` `score` TINYINT(11) NULL DEFAULT NULL;

INSERT INTO `weighted_tier` (`weighted_tier_id`, `name`, `description`, `score`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES ('1', 'Very High Importance', NULL, '50', 'Active', '7', '2021-07-20 00:00:00', NULL, NULL), ('2', 'High Importance', NULL, '40', 'Active', '7', '2021-07-26 00:00:00', NULL, NULL);
INSERT INTO `weighted_tier` (`weighted_tier_id`, `name`, `description`, `score`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES ('3', 'Moderately High Importance', NULL, '25', 'Active', '7', '2021-07-27 00:00:00', NULL, NULL), ('4', 'Moderate Importance', NULL, ' 20', 'Active', '7', '2021-07-26 00:00:00', NULL, NULL);
INSERT INTO `weighted_tier` (`weighted_tier_id`, `name`, `description`, `score`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES ('5', 'Less Importance', NULL, '10', 'Active', '7', '2021-07-27 00:00:00', NULL, NULL), ('6', 'No Importance', NULL, ' 0', 'Active', '7', '2021-07-26 00:00:00', NULL, NULL);


INSERT INTO `impact_multiplier` (`impact_multiplier_id`, `name`, `description`, `score`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES ('1', 'Positive', NULL, '+1', 'Active', '7', '2021-07-27 00:00:00', NULL, NULL), ('2', 'Neutral', NULL, '0', 'Active', '7', '2021-07-27 00:00:00', NULL, NULL);
INSERT INTO `impact_multiplier` (`impact_multiplier_id`, `name`, `description`, `score`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) VALUES ('3', 'Negative ', NULL, '-1', 'Active', '7', '2021-07-27 00:00:00', NULL, NULL);