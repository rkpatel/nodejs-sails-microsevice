# Sprint - 2 (Implementation of Add note functionality)

ALTER TABLE `location` 
CHANGE COLUMN `city_id` `city_id` INT UNSIGNED NOT NULL ,
CHANGE COLUMN `state_id` `state_id` INT UNSIGNED NOT NULL ,
CHANGE COLUMN `country_id` `country_id` INT UNSIGNED NOT NULL ,
ADD INDEX `state_id_location_idx` (`state_id` ASC) VISIBLE,
ADD INDEX `country_id_location_idx` (`country_id` ASC) VISIBLE,
ADD INDEX `city_id_location_idx` (`city_id` ASC) VISIBLE;
;
ALTER TABLE `location` 
ADD CONSTRAINT `city_id_location`
  FOREIGN KEY (`city_id`)
  REFERENCES `masterdb`.`city` (`city_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `state_id_location`
  FOREIGN KEY (`state_id`)
  REFERENCES `masterdb`.`state` (`state_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `country_id_location`
  FOREIGN KEY (`country_id`)
  REFERENCES `masterdb`.`country` (`country_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;

DROP TABLE `city`;
DROP TABLE `state`;
DROP TABLE `country`;

CREATE TABLE `note_type` (
  `note_type_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL,
  `is_default` TINYINT NOT NULL DEFAULT 0,
  `send_notification` TINYINT NOT NULL DEFAULT 0,
  `created_by` INT NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT NULL,
  `last_updated_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`note_type_id`));

ALTER TABLE`note_type` 
ADD INDEX `created_by_note_type_idx` (`created_by` ASC) VISIBLE,
ADD INDEX `last_update_by_note_type_idx` (`last_updated_by` ASC) VISIBLE;
;
ALTER TABLE `note_type` 
ADD CONSTRAINT `created_by_note_type`
  FOREIGN KEY (`created_by`)
  REFERENCES `masterdb`.`user` (`user_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `last_update_by_note_type`
  FOREIGN KEY (`last_updated_by`)
  REFERENCES `masterdb`.`user` (`user_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


CREATE TABLE `employee_note` (
  `employee_note_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `employee_profile_id` INT NOT NULL,
  `note_type_id` INT NOT NULL,
  `description` TEXT(1000) NOT NULL,
  `is_private` TINYINT NOT NULL,
  `status` ENUM('Active', 'Inactive') NOT NULL,
  `created_by` INT NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT NULL,
  `last_updated_date` DATETIME NULL,
  PRIMARY KEY (`employee_note_id`),
  INDEX `created_by_employee_note_idx` (`created_by` ASC) VISIBLE,
  INDEX `updated_by_employee_note_idx` (`last_updated_by` ASC) VISIBLE,
  CONSTRAINT `created_by_employee_note`
    FOREIGN KEY (`created_by`)
    REFERENCES `masterdb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `updated_by_employee_note`
    FOREIGN KEY (`last_updated_by`)
    REFERENCES `masterdb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


ALTER TABLE `employee_note` 
ADD INDEX `location_employee_note_idx` (`location_id` ASC) VISIBLE,
ADD INDEX `employee_profile_employee_note_idx` (`employee_profile_id` ASC) VISIBLE,
ADD INDEX `note_type_employee_note_idx` (`note_type_id` ASC) VISIBLE;
;
ALTER TABLE `employee_note` 
ADD CONSTRAINT `location_employee_note`
  FOREIGN KEY (`location_id`)
  REFERENCES `location` (`location_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `employee_profile_employee_note`
  FOREIGN KEY (`employee_profile_id`)
  REFERENCES `employee_profile` (`employee_profile_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `note_type_employee_note`
  FOREIGN KEY (`note_type_id`)
  REFERENCES `note_type` (`note_type_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;



INSERT INTO `note_type` (`note_type_id`, `name`, `description`, `status`, `is_default`, `send_notification`, `created_by`, `created_date`) VALUES ('1', 'General', 'description', 'Active', '1', '0', '1', '2021-06-08 00:00:00');
INSERT INTO `note_type` (`note_type_id`, `name`, `description`, `status`, `is_default`, `send_notification`, `created_by`, `created_date`) VALUES ('2', 'Praise', 'description', 'Active', '0', '0', '1', '2021-06-08 00:00:00');
INSERT INTO `note_type` (`note_type_id`, `name`, `description`, `status`, `is_default`, `send_notification`, `created_by`, `created_date`) VALUES ('3', 'Verbal', 'description', 'Active', '0', '0', '1', '2021-06-08 00:00:00');
INSERT INTO `note_type` (`note_type_id`, `name`, `description`, `status`, `is_default`, `send_notification`, `created_by`, `created_date`) VALUES ('4', 'Admin Alert', 'description', 'Active', '0', '1', '1', '2021-06-08 00:00:00');


ALTER TABLE `employee_note` 
CHANGE COLUMN `employee_note_id` `employee_note_id` INT NOT NULL AUTO_INCREMENT;



ALTER TABLE `berzansky_macdonald`.`employee_note` 
DROP FOREIGN KEY `location_employee_note`;
ALTER TABLE `berzansky_macdonald`.`employee_note` 
CHANGE COLUMN `location_id` `location_id` INT NULL DEFAULT NULL ;
ALTER TABLE `berzansky_macdonald`.`employee_note` 
ADD CONSTRAINT `location_employee_note`
  FOREIGN KEY (`location_id`)
  REFERENCES `berzansky_macdonald`.`location` (`location_id`);