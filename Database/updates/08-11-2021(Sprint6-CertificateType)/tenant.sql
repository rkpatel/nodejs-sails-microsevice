DROP TABLE IF EXISTS `certificate_job_type`;

CREATE TABLE IF NOT EXISTS `certificate_job_type` (
  `certificate_job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `certificate_type_id` int(11) NOT NULL,
  `job_type_id` int(11) NOT NULL,
  `status` enum('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`certificate_job_type_id`),
  KEY `certificate_type_id` (`certificate_type_id`),
  KEY `job_type_id` (`job_type_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `certificate_job_type_ibfk_1` FOREIGN KEY (`certificate_type_id`) REFERENCES `certificate_type` (`certificate_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificate_job_type_ibfk_2` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificate_job_type_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

ALTER TABLE
  `certificate_type` DROP FOREIGN KEY `job_type_id`,
  DROP COLUMN `job_type_id`,
  DROP INDEX `job_type_id`;