CREATE TABLE `berzansky_macdonald`.`cron_job` (
  `cron_job_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) NULL,
  `last_processing_date` DATETIME NULL,
  `scheduled_time` VARCHAR(45) NULL,
  PRIMARY KEY (`cron_job_id`));


CREATE TABLE `berzansky_macdonald`.`cron_job_logs` (
  `cron_job_logs_id` INT NOT NULL AUTO_INCREMENT,
  `cron_job_id` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `status` ENUM('Success', 'Failure') NOT NULL,
  `error_message` TEXT NULL,
  PRIMARY KEY (`cron_job_logs_id`));


ALTER TABLE `berzansky_macdonald`.`cron_job_logs` 
ADD INDEX `cron_job_cron_job_log_idx` (`cron_job_id` ASC) VISIBLE;
;
ALTER TABLE `berzansky_macdonald`.`cron_job_logs` 
ADD CONSTRAINT `cron_job_cron_job_log`
  FOREIGN KEY (`cron_job_id`)
  REFERENCES `berzansky_macdonald`.`cron_job` (`cron_job_id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


INSERT INTO `berzansky_macdonald`.`cron_job` (`cron_job_id`, `name`, `code`, `description`) VALUES ('1', 'Point Calculation', 'POINTS_CALCULATION', 'Cron Job For Point Calculation');


INSERT INTO `berzansky_macdonald`.`cron_job` (`cron_job_id`, `name`, `code`, `description`) VALUES ('2', 'Point Calculation Notification', 'POINTS_CALCULATION_NOTIFICATION', 'Cron Job For Point Calculation Notification');
