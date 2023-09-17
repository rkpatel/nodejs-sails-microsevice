CREATE TABLE `berzansky_macdonald`.`employee_point_audit` (
  ` employee_point_audit_id` INT NOT NULL AUTO_INCREMENT,
  `employee_profile_id` INT NOT NULL,
  `reason` VARCHAR(250) NOT NULL,
  `interaction_score` INT NULL,
  `note_score` INT NULL,
  `training_score` INT NULL,
  `total_weighted_score` INT NULL,
  `points_earned` INT NOT NULL,
  `additional_points` INT NULL,
  `old_points` INT NULL,
  `new_points` INT NULL,
  `old_level_id` INT NULL,
  `new_level_id` INT NULL,
  `created_by` INT NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (` employee_point_audit_id`));



ALTER TABLE `berzansky_macdonald`.`employee_point_audit` 
ADD INDEX `craetedBy_empAudit_idx` (`created_by` ASC) VISIBLE;
;
ALTER TABLE `berzansky_macdonald`.`employee_point_audit` 
ADD CONSTRAINT `craetedBy_empAudit`
  FOREIGN KEY (`created_by`)
  REFERENCES `masterdb`.`user` (`user_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT `emp_profile_id_empAudit`
  FOREIGN KEY (`employee_profile_id`)
  REFERENCES `berzansky_macdonald`.`employee_profile` (`employee_profile_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


ALTER TABLE `masterdb`.`grade` 
ADD COLUMN `score` TINYINT NULL AFTER `status`;


UPDATE `masterdb`.`grade` SET `score` = '1' WHERE (`name` = 'Exceed Expectations');
UPDATE `masterdb`.`grade` SET `score` = '0' WHERE (`name` = 'Meet Expectations');
UPDATE `masterdb`.`grade` SET `score` = '-1' WHERE (`name` = 'Remediate');

ALTER TABLE `berzansky_macdonald`.`employee_point_audit`
DROP column `additional_points`;
ALTER TABLE `berzansky_macdonald`.`employee_point_audit` 
CHANGE COLUMN `interaction_score` `interaction_score` DECIMAL(11) NULL DEFAULT NULL ,
CHANGE COLUMN `note_score` `note_score` DECIMAL(11) NULL DEFAULT NULL ,
CHANGE COLUMN `training_score` `training_score` DECIMAL(11) NULL DEFAULT NULL ,
CHANGE COLUMN `total_weighted_score` `total_weighted_score` DECIMAL(11) NULL DEFAULT NULL ;
