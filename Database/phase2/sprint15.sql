ALTER TABLE `employee_point_audit` 
ADD COLUMN `dailyreport_score` DECIMAL(11,0) NULL AFTER `checkin_score`;

ALTER TABLE `task`   
  ADD COLUMN `is_scheduled` TINYINT(1) DEFAULT 0  NULL AFTER `status`,
  ADD COLUMN `scheduled_interval_in_days` INT(10) NULL AFTER `is_scheduled`,
  ADD COLUMN `scheduled_task_end_date_interval` INT(10) NULL AFTER `scheduled_interval_in_days`,
  ADD COLUMN `scheduled_end_date` DATE NULL AFTER `scheduled_task_end_date_interval`;

INSERT INTO `cron_job` (`name`, `code`, `description`, `last_processing_date`, `scheduled_time`) 
VALUES('Task Scheduled','TASK_SCHEDULED','Cron Job for Task Scheduled',NULL,NULL);
CREATE TABLE `report_submission_point_calculation`(  
  `report_submission_status_id` INT(10) NOT NULL AUTO_INCREMENT,
  `report_submission_status` ENUM('draft','submitted'),
  `weighted_tier_id` INT(11),
  `impact_multiplier_id` INT(11) NOT NULL,
  PRIMARY KEY (`report_submission_status_id`, `impact_multiplier_id`),
  INDEX (`weighted_tier_id`, `impact_multiplier_id`),
  INDEX (`impact_multiplier_id`),
  FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier`(`impact_multiplier_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=INNODB;

INSERT INTO `report_submission_point_calculation` (`report_submission_status_id`, `report_submission_status`, `weighted_tier_id`, `impact_multiplier_id`) 
VALUES('1','submitted','4','5');
