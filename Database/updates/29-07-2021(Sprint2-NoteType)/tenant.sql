ALTER TABLE `note_type` CHANGE `note_type_id` `note_type_id` INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `note_type` ADD `weighted_tier_id` INT NOT NULL AFTER `description`, ADD `impact_multiplier_id` INT NOT NULL AFTER `weighted_tier_id`;
ALTER TABLE `note_type` ADD CONSTRAINT ` impact_multiplier_id` FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier`(`impact_multiplier_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE `note_type` ADD CONSTRAINT `weighted_tier_id` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `note_type` DROP FOREIGN KEY ` impact_multiplier_id`; 
ALTER TABLE `note_type` ADD CONSTRAINT ` impact_multiplier_id` FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier`(`impact_multiplier_id`) ON DELETE CASCADE ON UPDATE CASCADE; 
ALTER TABLE `note_type` DROP FOREIGN KEY `created_by_note_type`;
ALTER TABLE `note_type` ADD CONSTRAINT `created_by_note_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; 
ALTER TABLE `note_type` DROP FOREIGN KEY `last_update_by_note_type`; 
ALTER TABLE `note_type` ADD CONSTRAINT `last_update_by_note_type` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE; 
ALTER TABLE `note_type` DROP FOREIGN KEY `weighted_tier_id`; 
ALTER TABLE `note_type` ADD CONSTRAINT `weighted_tier_id` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE;