/*
SQLyog Community v12.09 (64 bit)
MySQL - 5.7.28 : Database - berzansky_macdonald
*********************************************************************
*/


/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`berzansky_macdonald` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `berzansky_macdonald`;

/*Table structure for table `competition` */

DROP TABLE IF EXISTS `competition`;

CREATE TABLE `competition` (
  `competition_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `banner_image_url` varchar(255) DEFAULT NULL,
  `competition_status` enum('New','Completed') DEFAULT 'New',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated_by` int(10) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`competition_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `competition_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

/*Table structure for table `competition_employee` */

DROP TABLE IF EXISTS `competition_employee`;

CREATE TABLE `competition_employee` (
  `competition_employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `competition_id` int(11) unsigned DEFAULT NULL,
  `employee_profile_id` int(11) DEFAULT NULL,
  `total_points` int(11) DEFAULT NULL,
  `rank` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`competition_employee_id`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `competitions_id` (`competition_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `competition_employee_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`competition_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_employee_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_employee_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

/*Table structure for table `competition_job_type` */

DROP TABLE IF EXISTS `competition_job_type`;

CREATE TABLE `competition_job_type` (
  `competition_job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `competition_id` int(11) unsigned NOT NULL,
  `job_type_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`competition_job_type_id`),
  KEY `created_by` (`created_by`),
  KEY `competition_id` (`competition_id`),
  KEY `job_type_id` (`job_type_id`),
  CONSTRAINT `competition_job_type_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_job_type_ibfk_4` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`competition_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_job_type_ibfk_5` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Table structure for table `competition_location` */

DROP TABLE IF EXISTS `competition_location`;

CREATE TABLE `competition_location` (
  `competition_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `competition_id` int(11) unsigned NOT NULL,
  `location_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`competition_location_id`),
  KEY `created_by` (`created_by`),
  KEY `competition_id` (`competition_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `competition_location_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_location_ibfk_4` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`competition_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_location_ibfk_5` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


ALTER TABLE `subway_qa`.`interaction_factor_job_type` 
CHANGE COLUMN `interaction_factor_job_type_id` `interaction_factor_job_type_id` INT(11) NOT NULL AUTO_INCREMENT ;
