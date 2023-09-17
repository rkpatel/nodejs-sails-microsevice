-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: ot360dev.mysql.database.azure.com    Database: ymca_qa
-- ------------------------------------------------------
-- Server version	5.6.47.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bulk_import_log`
--

DROP TABLE IF EXISTS `bulk_import_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bulk_import_log` (
  `bulk_import_log_id` INT(11) NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(250) NOT NULL,
  `file_path` VARCHAR(250) DEFAULT NULL,
  `status` ENUM('Imported','Validated','Completed','Failed','Mail Sent') NOT NULL,
  `error_count` INT(11) DEFAULT NULL,
  `success_count` INT(11) DEFAULT NULL,
  `total_count` INT(11) DEFAULT NULL,
  `is_accept` TINYINT(1) NOT NULL,
  `error_export_url` VARCHAR(250) DEFAULT NULL,
  `uploaded_by` INT(11) DEFAULT NULL,
  `uploaded_date` DATETIME DEFAULT NULL,
  `uploaded_file_name` VARCHAR(250) DEFAULT NULL,
  PRIMARY KEY (`bulk_import_log_id`)
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bulk_import_temp`
--

DROP TABLE IF EXISTS `bulk_import_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bulk_import_temp` (
  `bulk_import_temp_id` INT(11) NOT NULL AUTO_INCREMENT,
  `bulk_import_log_id` INT(11) NOT NULL,
  `first_name` VARCHAR(250) DEFAULT NULL,
  `last_name` VARCHAR(250) DEFAULT NULL,
  `email` VARCHAR(250) DEFAULT NULL,
  `phone` VARCHAR(250) DEFAULT NULL,
  `date_of_joining` VARCHAR(50) DEFAULT NULL,
  `date_of_birth` VARCHAR(50) DEFAULT NULL,
  `locations` TEXT,
  `job_types` TEXT,
  `role` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_name` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_relation` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_number` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_address` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_country` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_state` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_city` VARCHAR(250) DEFAULT NULL,
  `emergency_contact_zip` VARCHAR(250) DEFAULT NULL,
  `status` ENUM('Success','Failure') NOT NULL,
  `error_log` TEXT,
  PRIMARY KEY (`bulk_import_temp_id`),
  KEY `bulk_import_log` (`bulk_import_log_id`),
  CONSTRAINT `bulk_import_log` FOREIGN KEY (`bulk_import_log_id`) REFERENCES `bulk_import_log` (`bulk_import_log_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `certificate_job_type`
--

DROP TABLE IF EXISTS `certificate_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_job_type` (
  `certificate_job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `certificate_type_id` INT(11) NOT NULL,
  `job_type_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`certificate_job_type_id`),
  KEY `certificate_type_id` (`certificate_type_id`),
  KEY `job_type_id` (`job_type_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `certificate_job_type_ibfk_1` FOREIGN KEY (`certificate_type_id`) REFERENCES `certificate_type` (`certificate_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificate_job_type_ibfk_2` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `certificate_job_type_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `certificate_status_enum`
--

DROP TABLE IF EXISTS `certificate_status_enum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_status_enum` (
  `certificate_status_enum_id` INT(11) NOT NULL AUTO_INCREMENT,
  `certificate_status` ENUM('Assigned','InReview','Expired','Active','Rejected') NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `sort_order` INT(11) NOT NULL,
  PRIMARY KEY (`certificate_status_enum_id`)
) ENGINE=INNODB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `certificate_type`
--

DROP TABLE IF EXISTS `certificate_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_type` (
  `certificate_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`certificate_type_id`),
  KEY `createdBy_certificate` (`created_by`),
  CONSTRAINT `createdBy_certificate` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `competition`
--

DROP TABLE IF EXISTS `competition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition` (
  `competition_id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `start_date` DATETIME DEFAULT NULL,
  `end_date` DATETIME DEFAULT NULL,
  `banner_image_url` VARCHAR(255) DEFAULT NULL,
  `competition_status` ENUM('Not Started','Ongoing','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT 'Not Started',
  `status` ENUM('Active','Inactive') DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME DEFAULT NULL,
  `last_updated_by` INT(10) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`competition_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `competition_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `competition_employee`
--

DROP TABLE IF EXISTS `competition_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition_employee` (
  `competition_employee_id` INT(11) NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED DEFAULT NULL,
  `employee_profile_id` INT(11) DEFAULT NULL,
  `total_points` INT(11) DEFAULT NULL,
  `rank` INT(11) NOT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`competition_employee_id`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `competitions_id` (`competition_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `competition_employee_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`competition_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_employee_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_employee_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `competition_job_type`
--

DROP TABLE IF EXISTS `competition_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition_job_type` (
  `competition_job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED NOT NULL,
  `job_type_id` INT(11) DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`competition_job_type_id`),
  KEY `created_by` (`created_by`),
  KEY `competition_id` (`competition_id`),
  KEY `job_type_id` (`job_type_id`),
  CONSTRAINT `competition_job_type_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_job_type_ibfk_4` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`competition_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_job_type_ibfk_5` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `competition_location`
--

DROP TABLE IF EXISTS `competition_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition_location` (
  `competition_location_id` INT(11) NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) UNSIGNED NOT NULL,
  `location_id` INT(11) NOT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`competition_location_id`),
  KEY `created_by` (`created_by`),
  KEY `competition_id` (`competition_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `competition_location_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_location_ibfk_4` FOREIGN KEY (`competition_id`) REFERENCES `competition` (`competition_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `competition_location_ibfk_5` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cron_job`
--

DROP TABLE IF EXISTS `cron_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cron_job` (
  `cron_job_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `last_processing_date` DATETIME DEFAULT NULL,
  `scheduled_time` VARCHAR(45) DEFAULT NULL,
  PRIMARY KEY (`cron_job_id`)
) ENGINE=INNODB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cron_job_logs`
--

DROP TABLE IF EXISTS `cron_job_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cron_job_logs` (
  `cron_job_logs_id` INT(11) NOT NULL AUTO_INCREMENT,
  `cron_job_id` INT(11) NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `status` ENUM('Success','Failure') NOT NULL,
  `error_message` TEXT,
  PRIMARY KEY (`cron_job_logs_id`),
  KEY `cron_job_cron_job_log_idx` (`cron_job_id`),
  CONSTRAINT `cron_job_cron_job_log` FOREIGN KEY (`cron_job_id`) REFERENCES `cron_job` (`cron_job_id`)
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=4588 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `dept_id` INT(11) NOT NULL AUTO_INCREMENT,
  `location_id` INT(11) NOT NULL,
  `dept_name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `location_name` VARCHAR(255) NOT NULL,
  `status` INT(11) NOT NULL,
  `createdby` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`dept_id`),
  KEY `locations` (`location_id`),
  CONSTRAINT `locations` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_certificate`
--

DROP TABLE IF EXISTS `employee_certificate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_certificate` (
  `employee_certificate_id` INT(11) NOT NULL AUTO_INCREMENT,
  `certificate_type_id` INT(11) NOT NULL,
  `employee_profile_id` INT(11) NOT NULL,
  `description` TEXT,
  `issue_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `task_id` INT(11) DEFAULT NULL,
  `approved_by` INT(11) NOT NULL,
  `certificate_file_path` VARCHAR(250) DEFAULT NULL,
  `certificate_status` ENUM('Assigned','InReview','Active','Expired','Rejected') DEFAULT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `added_by` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`employee_certificate_id`),
  KEY `employeProfileId` (`employee_profile_id`),
  KEY `certificate_type_id` (`certificate_type_id`),
  KEY `createdbyUser_idx` (`created_by`),
  CONSTRAINT `certificate_type_id` FOREIGN KEY (`certificate_type_id`) REFERENCES `certificate_type` (`certificate_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `createdbyUser` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employeProfileId` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_certificate_history`
--

DROP TABLE IF EXISTS `employee_certificate_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_certificate_history` (
  `employee_certificate_history_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_certificate_id` INT(11) NOT NULL,
  `employee_profile_id` INT(11) NOT NULL,
  `description` TEXT,
  `issue_date` DATETIME DEFAULT NULL,
  `expiry_date` DATETIME DEFAULT NULL,
  `certificate_file_path` VARCHAR(250) DEFAULT NULL,
  `certificate_status` ENUM('Assigned','InReview','Active','Expired','Rejected') DEFAULT NULL,
  `approved_by` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `task_id` INT(11) NOT NULL,
  `added_by` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`employee_certificate_history_id`),
  KEY `employee_certificate_id` (`employee_certificate_id`),
  KEY `employee_profile_id_certi` (`employee_profile_id`),
  KEY `createdbyuser` (`created_by`),
  CONSTRAINT `employee_certificate_id` FOREIGN KEY (`employee_certificate_id`) REFERENCES `employee_certificate` (`employee_certificate_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_profile_id_certi` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_interaction`
--

DROP TABLE IF EXISTS `employee_interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_interaction` (
  `employee_interaction_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` INT(11) NOT NULL,
  `points` DOUBLE NOT NULL,
  `notes` TEXT,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`employee_interaction_id`),
  KEY `emp_interaction_created_by` (`created_by`),
  KEY `employee_interaction_employee` (`employee_profile_id`),
  CONSTRAINT `emp_interaction_created_by` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_interaction_employee` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_interaction_detail`
--

DROP TABLE IF EXISTS `employee_interaction_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_interaction_detail` (
  `employee_interaction_detail_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_interaction_id` INT(11) NOT NULL,
  `interaction_factor_id` INT(11) NOT NULL,
  `grade_id` INT(11) NOT NULL,
  PRIMARY KEY (`employee_interaction_detail_id`),
  KEY `emp_detail_interaction` (`interaction_factor_id`),
  KEY `grade_interaction_emp_detail` (`grade_id`),
  CONSTRAINT `emp_detail_interaction` FOREIGN KEY (`interaction_factor_id`) REFERENCES `interaction_factor` (`interaction_factor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grade_interaction_emp_detail` FOREIGN KEY (`grade_id`) REFERENCES `masterdb`.`grade` (`grade_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_job_type`
--

DROP TABLE IF EXISTS `employee_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_job_type` (
  `employee_job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` INT(11) NOT NULL,
  `job_type_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`employee_job_type_id`),
  KEY `employeeProfile` (`employee_profile_id`),
  KEY `jobType` (`job_type_id`),
  KEY `createdBy_job` (`created_by`),
  CONSTRAINT `createdBy_job` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `employeeProfile` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `jobType` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`)
) ENGINE=INNODB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_location`
--

DROP TABLE IF EXISTS `employee_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_location` (
  `employee_location_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` INT(11) NOT NULL,
  `location_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`employee_location_id`),
  KEY `emp_profile_id` (`employee_profile_id`),
  KEY `location_id` (`location_id`),
  KEY `craetedBy_empLocation` (`created_by`),
  CONSTRAINT `craetedBy_empLocation` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `emp_profile_id` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `location_id` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=56 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_note`
--

DROP TABLE IF EXISTS `employee_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_note` (
  `employee_note_id` INT(11) NOT NULL AUTO_INCREMENT,
  `location_id` INT(11) DEFAULT NULL,
  `employee_profile_id` INT(11) NOT NULL,
  `note_type_id` INT(11) NOT NULL,
  `description` TEXT NOT NULL,
  `is_private` TINYINT(4) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`employee_note_id`),
  KEY `created_by_employee_note_idx` (`created_by`),
  KEY `updated_by_employee_note_idx` (`last_updated_by`),
  KEY `location_employee_note_idx` (`location_id`),
  KEY `employee_profile_employee_note_idx` (`employee_profile_id`),
  KEY `note_type_employee_note_idx` (`note_type_id`),
  CONSTRAINT `created_by_employee_note` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `employee_profile_employee_note` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`),
  CONSTRAINT `location_employee_note` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  CONSTRAINT `note_type_employee_note` FOREIGN KEY (`note_type_id`) REFERENCES `note_type` (`note_type_id`),
  CONSTRAINT `updated_by_employee_note` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_notification_preference`
--

DROP TABLE IF EXISTS `employee_notification_preference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_notification_preference` (
  `employee_notification_preference_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` INT(11) NOT NULL,
  `is_web` TINYINT(4) NOT NULL DEFAULT '0',
  `is_email` TINYINT(4) NOT NULL DEFAULT '0',
  `is_mobile` TINYINT(4) NOT NULL DEFAULT '0',
  `is_sms` TINYINT(4) NOT NULL DEFAULT '0',
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`employee_notification_preference_id`),
  KEY `createdBy_notification_idx` (`created_by`),
  KEY `updatedby_notification_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_notification_template` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_notification_template` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_point_audit`
--

DROP TABLE IF EXISTS `employee_point_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_point_audit` (
  `employee_point_audit_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` INT(11) NOT NULL,
  `reason` TEXT NOT NULL,
  `interaction_score` DECIMAL(11,0) DEFAULT NULL,
  `note_score` DECIMAL(11,0) DEFAULT NULL,
  `training_score` DECIMAL(11,0) DEFAULT NULL,
  `checkin_score` DECIMAL(11,0) NULL,
  `total_weighted_score` DECIMAL(11,0) DEFAULT NULL,
  `points_earned` INT(11) NOT NULL,
  `old_points` INT(11) DEFAULT NULL,
  `new_points` INT(11) DEFAULT NULL,
  `old_level_id` INT(11) DEFAULT NULL,
  `new_level_id` INT(11) DEFAULT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`employee_point_audit_id`),
  KEY `craetedBy_empAudit_idx` (`created_by`),
  KEY `emp_profile_id_empAudit` (`employee_profile_id`),
  CONSTRAINT `craetedBy_empAudit` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `emp_profile_id_empAudit` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`)
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=959 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_profile`
--

DROP TABLE IF EXISTS `employee_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_profile` (
  `employee_profile_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `role_id` INT(11) NOT NULL,
  `date_of_joining` DATETIME DEFAULT NULL,
  `created_by` INT(11) NOT NULL,
  `points` DOUBLE NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `level_id` INT(11) DEFAULT NULL,
  `employee_import_id` INT(11) DEFAULT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`employee_profile_id`),
  KEY `role_employee` (`role_id`),
  KEY `level_employee` (`level_id`),
  KEY `createdBy_employee_idx` (`created_by`),
  KEY `updatedBy_employee_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_employee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `level_employee` FOREIGN KEY (`level_id`) REFERENCES `level` (`level_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `role_employee` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `updatedBy_employee` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`)
) ENGINE=INNODB AUTO_INCREMENT=42 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `form_field`
--

DROP TABLE IF EXISTS `form_field`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_field` (
  `field_id` INT(11) NOT NULL AUTO_INCREMENT,
  `module_id` INT(11) NOT NULL,
  `field_label` VARCHAR(255) NOT NULL,
  `field_key` VARCHAR(255) NOT NULL,
  `control_id` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`field_id`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity`
--

DROP TABLE IF EXISTS `group_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity` (
  `group_activity_id` INT(11) NOT NULL AUTO_INCREMENT,
  `scenario` VARCHAR(255) NOT NULL,
  `day` VARCHAR(100) DEFAULT NULL,
  `notes` VARCHAR(1000) DEFAULT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`group_activity_id`),
  KEY `created_by_group_activity` (`created_by`),
  KEY `updated_by_group_activity` (`last_updated_by`),
  CONSTRAINT `created_by_group_activity` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_group_activity` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_employee`
--

DROP TABLE IF EXISTS `group_activity_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_employee` (
  `group_activity_employee_id` INT(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` INT(11) NOT NULL,
  `employee_profile_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`group_activity_employee_id`),
  KEY `group_activity_id_group_activity_employee` (`group_activity_id`),
  KEY `employee_profile_id_group_activity_employee` (`employee_profile_id`),
  KEY `created_by_group_group_activity_employee` (`created_by`),
  CONSTRAINT `created_by_group_group_activity_employee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_profile_id_group_activity_employee` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_employee` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_job_type`
--

DROP TABLE IF EXISTS `group_activity_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_job_type` (
  `group_activity_job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` INT(11) NOT NULL,
  `job_type_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`group_activity_job_type_id`),
  KEY `group_activity_id_group_activity_job_type` (`group_activity_id`),
  KEY `job_type_id_job_type` (`job_type_id`),
  KEY `created_by_group_activity_job_type` (`created_by`),
  CONSTRAINT `created_by_group_activity_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_job_type` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_type_id_job_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_location`
--

DROP TABLE IF EXISTS `group_activity_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_location` (
  `group_activity_location_id` INT(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` INT(11) NOT NULL,
  `location_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`group_activity_location_id`),
  KEY `group_activity_id_group_activity_location` (`group_activity_id`),
  KEY `location_id_group_activity_location` (`location_id`),
  KEY `created_by_group_group_activity_location` (`created_by`),
  CONSTRAINT `created_by_group_group_activity_location` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_location` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `location_id_group_activity_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_training`
--

DROP TABLE IF EXISTS `group_activity_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_training` (
  `group_activity_training_id` INT(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` INT(11) NOT NULL,
  `training_id` INT(11) NOT NULL,
  `training_category_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`group_activity_training_id`),
  KEY `group_activity_id_group_activity_training` (`group_activity_id`),
  KEY `training_id_group_activity_training` (`training_id`),
  KEY `training_category_id_group_activity_training` (`training_category_id`),
  KEY `created_by_group_group_activity_training` (`created_by`),
  CONSTRAINT `created_by_group_group_activity_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_training` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_category_id_group_activity_training` FOREIGN KEY (`training_category_id`) REFERENCES `training_category` (`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_id_group_activity_training` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interaction`
--

DROP TABLE IF EXISTS `interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interaction` (
  `inter_id` INT(11) NOT NULL AUTO_INCREMENT,
  `emp_profile_id` INT(11) NOT NULL,
  `inter_factor_id` INT(11) NOT NULL,
  `notes` VARCHAR(255) NOT NULL,
  `rank` INT(11) NOT NULL,
  `createdby` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`inter_id`),
  KEY `emp_profile` (`emp_profile_id`),
  KEY `rank` (`rank`),
  CONSTRAINT `emp_profile` FOREIGN KEY (`emp_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`),
  CONSTRAINT `rank` FOREIGN KEY (`rank`) REFERENCES `rank` (`rank_id`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interaction_factor`
--

DROP TABLE IF EXISTS `interaction_factor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interaction_factor` (
  `interaction_factor_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `weighted_tier_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`interaction_factor_id`),
  KEY `interaxction_weighted_tier` (`weighted_tier_id`),
  KEY `interaction_user` (`created_by`),
  CONSTRAINT `interaction_user` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `interaxction_weighted_tier` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier` (`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interaction_factor_job_type`
--

DROP TABLE IF EXISTS `interaction_factor_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interaction_factor_job_type` (
  `interaction_factor_job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `interaction_factor_id` INT(11) NOT NULL,
  `job_type_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`interaction_factor_job_type_id`),
  KEY `interaction_job_type` (`interaction_factor_id`),
  KEY `factor_job_type` (`job_type_id`),
  KEY `created_by_interaction_factor_job` (`created_by`),
  CONSTRAINT `created_by_interaction_factor_job` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `factor_job_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `interaction_job_type` FOREIGN KEY (`interaction_factor_id`) REFERENCES `interaction_factor` (`interaction_factor_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_type`
--

DROP TABLE IF EXISTS `job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_type` (
  `job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`job_type_id`),
  KEY `created_by_job_idx` (`created_by`),
  KEY `updated_by_job_idx` (`last_updated_by`),
  CONSTRAINT `created_by_job` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `updated_by_job` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`)
) ENGINE=INNODB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `level`
--

DROP TABLE IF EXISTS `level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `level` (
  `level_id` INT(11) NOT NULL AUTO_INCREMENT,
  `level` INT(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `point_range_from` INT(11) NOT NULL,
  `point_range_to` INT(11) NOT NULL,
  `range` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`level_id`),
  KEY `createdBy_level_idx` (`created_by`),
  KEY `update_by_level_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_level` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `update_by_level` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`)
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `location_id` INT(11) NOT NULL AUTO_INCREMENT,
  `parent_location_id` INT(11) DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `address_1` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `address_2` VARCHAR(250) DEFAULT NULL,
  `city_id` INT(10) UNSIGNED NOT NULL,
  `state_id` INT(10) UNSIGNED NOT NULL,
  `country_id` INT(10) UNSIGNED NOT NULL,
  `zip` VARCHAR(10) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  KEY `createdby_location_idx` (`created_by`),
  KEY `update_by_location_idx` (`last_updated_by`),
  KEY `state_id_location_idx` (`state_id`),
  KEY `country_id_location_idx` (`country_id`),
  KEY `city_id_location_idx` (`city_id`),
  CONSTRAINT `city_id_location` FOREIGN KEY (`city_id`) REFERENCES `masterdb`.`city` (`city_id`),
  CONSTRAINT `country_id_location` FOREIGN KEY (`country_id`) REFERENCES `masterdb`.`country` (`country_id`),
  CONSTRAINT `createdby_location` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `state_id_location` FOREIGN KEY (`state_id`) REFERENCES `masterdb`.`state` (`state_id`),
  CONSTRAINT `update_by_location` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`)
) ENGINE=INNODB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `note_type`
--

DROP TABLE IF EXISTS `note_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note_type` (
  `note_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `weighted_tier_id` INT(11) NOT NULL,
  `impact_multiplier_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `is_default` TINYINT(4) NOT NULL DEFAULT '0',
  `send_notification` TINYINT(4) NOT NULL DEFAULT '0',
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`note_type_id`),
  KEY `created_by_note_type_idx` (`created_by`),
  KEY `last_update_by_note_type_idx` (`last_updated_by`),
  KEY ` impact_multiplier_id` (`impact_multiplier_id`),
  KEY `weighted_tier_id` (`weighted_tier_id`),
  CONSTRAINT ` impact_multiplier_id` FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier` (`impact_multiplier_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `created_by_note_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `last_update_by_note_type` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `weighted_tier_id` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier` (`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_queue`
--

DROP TABLE IF EXISTS `notification_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_queue` (
  `notification_queue_id` INT(11) NOT NULL AUTO_INCREMENT,
  `notification_template_id` INT(11) NOT NULL,
  `sender` VARCHAR(50) NOT NULL,
  `sender_email` VARCHAR(100) NOT NULL,
  `notification_type` ENUM('SMS','Email','Mobile','InApp') NOT NULL,
  `notification_subject` VARCHAR(100) NOT NULL,
  `notification_body` TEXT NOT NULL,
  `entity_type` VARCHAR(50) DEFAULT NULL,
  `entity_id` VARCHAR(50) DEFAULT NULL,
  `default_recipeints` VARCHAR(250) DEFAULT NULL,
  `sent_date` DATETIME DEFAULT NULL,
  `retry_count` INT(11) DEFAULT NULL,
  `notification_error` VARCHAR(250) DEFAULT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`notification_queue_id`),
  KEY `notification_template` (`notification_template_id`),
  CONSTRAINT `notification_template` FOREIGN KEY (`notification_template_id`) REFERENCES `notification_template` (`notification_template_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_queue_recipient`
--

DROP TABLE IF EXISTS `notification_queue_recipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_queue_recipient` (
  `notification_queue_recipient_id` INT(11) NOT NULL AUTO_INCREMENT,
  `notification_queue_id` INT(11) NOT NULL,
  `employee_profile_id` INT(11) NOT NULL,
  `read_date` DATETIME DEFAULT NULL,
  `to_cc` ENUM('To','CC') NOT NULL,
  `recipient_email` TEXT,
  `attachment` TEXT,
  `status` ENUM('Active','Inactive') NOT NULL,
  `new_notification_flag` TINYINT(4) DEFAULT 1 NULL,
  PRIMARY KEY (`notification_queue_recipient_id`)
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_template`
--

DROP TABLE IF EXISTS `notification_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_template` (
  `notification_template_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `code` VARCHAR(50) NOT NULL,
  `notification_type` ENUM('SMS','Email','Mobile','InApp') NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `body` TEXT NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `default_recipeints` VARCHAR(250) DEFAULT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`notification_template_id`),
  KEY `createdBy_notification_idx` (`created_by`),
  KEY `updatedby_notification_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_notification_idx` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_notification_idx` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `permission_id` INT(11) NOT NULL AUTO_INCREMENT,
  `permission_module_id` INT(11) NOT NULL,
  `parent_permission_id` INT(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `sequence` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`permission_id`),
  KEY `permission_module` (`permission_module_id`),
  CONSTRAINT `permission_module` FOREIGN KEY (`permission_module_id`) REFERENCES `permission_module` (`permission_module_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission_module`
--

DROP TABLE IF EXISTS `permission_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission_module` (
  `permission_module_id` INT(11) NOT NULL AUTO_INCREMENT,
  `parent_permission_module_id` INT(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(250) NOT NULL,
  `description` VARCHAR(250) NOT NULL,
  `sequence` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`permission_module_id`)
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `question_id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `question_type_id` INT(11) NOT NULL,
  `is_for_dynamic_entity` TINYINT(4) DEFAULT '0',
  `entity` VARCHAR(50) DEFAULT NULL,
  `dynamic_remark` TINYINT(4) NOT NULL DEFAULT '0',
  `dynamic_allow_multiple` TINYINT(4) NOT NULL DEFAULT '0',
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(10) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `question_type_id` (`question_type_id`),
  KEY `created_by` (`created_by`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `question_ibfk_1` FOREIGN KEY (`question_type_id`) REFERENCES `question_type` (`question_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `question_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `question_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question_option`
--

DROP TABLE IF EXISTS `question_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_option` (
  `question_option_id` INT(11) NOT NULL AUTO_INCREMENT,
  `question_id` INT(11) NOT NULL,
  `option_key` VARCHAR(155) NOT NULL,
  `option_value` VARCHAR(155) NOT NULL,
  `sequence` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(10) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`question_option_id`),
  KEY `question_id` (`question_id`),
  KEY `created_by` (`created_by`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `question_option_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `question_type`
--

DROP TABLE IF EXISTS `question_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_type` (
  `question_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(50) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `field_type` VARCHAR(50) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`question_type_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `question_type_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rank`
--

DROP TABLE IF EXISTS `rank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rank` (
  `rank_id` INT(11) NOT NULL AUTO_INCREMENT,
  `rank_title` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `points` DOUBLE NOT NULL,
  PRIMARY KEY (`rank_id`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `relation`
--

DROP TABLE IF EXISTS `relation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relation` (
  `relation_id` INT(11) NOT NULL AUTO_INCREMENT,
  `relation_name` VARCHAR(255) NOT NULL,
  `relation_value` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`relation_id`)
) ENGINE=INNODB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `report_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(10) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `created_by` (`created_by`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_ibfk_2` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_location`
--

DROP TABLE IF EXISTS `report_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_location` (
  `report_location_id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_id` INT(11) NOT NULL,
  `location_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(10) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`report_location_id`),
  KEY `report_id` (`report_id`),
  KEY `location_id` (`location_id`),
  KEY `created_by` (`created_by`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `report_location_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_location_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_location_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_location_ibfk_4` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_question`
--

DROP TABLE IF EXISTS `report_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_question` (
  `report_question_id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_id` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `question_type_id` INT(11) NOT NULL,
  `is_for_dynamic_entity` TINYINT(4) DEFAULT '0',
  `entity` VARCHAR(50) DEFAULT NULL,
  `dynamic_remark` TINYINT(4) NOT NULL DEFAULT '0',
  `dynamic_allow_multiple` TINYINT(4) NOT NULL DEFAULT '0',
  `status` ENUM('Active','Inactive') NOT NULL,
  `sequence` INT(11) NOT NULL,
  `is_required` TINYINT(4) NOT NULL DEFAULT '0',
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(10) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`report_question_id`),
  KEY `report_id` (`report_id`),
  KEY `question_type_id` (`question_type_id`),
  KEY `created_by` (`created_by`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `report_question_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_question_ibfk_2` FOREIGN KEY (`question_type_id`) REFERENCES `question_type` (`question_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_question_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_question_ibfk_4` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_question_option`
--

DROP TABLE IF EXISTS `report_question_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_question_option` (
  `report_question_option_id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_question_id` INT(11) NOT NULL,
  `option_key` VARCHAR(155) NOT NULL,
  `option_value` VARCHAR(155) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `sequence` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(10) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`report_question_option_id`),
  KEY `report_question_id` (`report_question_id`),
  KEY `created_by` (`created_by`),
  KEY `last_updated_by` (`last_updated_by`),
  CONSTRAINT `report_question_option_ibfk_1` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_submission`
--

DROP TABLE IF EXISTS `report_submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_submission` (
  `report_submission_id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_id` INT(11) NOT NULL,
  `location_id` INT(11) NOT NULL,
  `employee_profile_id` INT(11) NOT NULL,
  `reported_date` DATETIME NOT NULL,
  PRIMARY KEY (`report_submission_id`),
  KEY `location_id` (`location_id`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `report_submission_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_ibfk_3` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_submission_detail`
--

DROP TABLE IF EXISTS `report_submission_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_submission_detail` (
  `report_submission_detail_id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_submission_id` INT(11) NOT NULL,
  `report_id` INT(11) NOT NULL,
  `report_question_id` INT(11) NOT NULL,
  `answer` TEXT NOT NULL,
  PRIMARY KEY (`report_submission_detail_id`),
  KEY `report_submission_id` (`report_submission_id`),
  KEY `report_id` (`report_id`),
  KEY `report_question_id` (`report_question_id`),
  CONSTRAINT `report_submission_detail_ibfk_1` FOREIGN KEY (`report_submission_id`) REFERENCES `report_submission` (`report_submission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `report` (`report_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_ibfk_3` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_submission_detail_option`
--

DROP TABLE IF EXISTS `report_submission_detail_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_submission_detail_option` (
  `report_submission_detail_option_id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_submission_detail_id` INT(11) NOT NULL,
  `report_question_id` INT(11) NOT NULL,
  `report_question_option_id` INT(11) NOT NULL,
  PRIMARY KEY (`report_submission_detail_option_id`),
  KEY `report_submission_detail_id` (`report_submission_detail_id`),
  KEY `report_question_id` (`report_question_id`),
  KEY `report_question_option_id` (`report_question_option_id`),
  CONSTRAINT `report_submission_detail_option_ibfk_1` FOREIGN KEY (`report_submission_detail_id`) REFERENCES `report_submission_detail` (`report_submission_detail_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_option_ibfk_2` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_detail_option_ibfk_3` FOREIGN KEY (`report_question_option_id`) REFERENCES `report_question_option` (`report_question_option_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_submission_entity_detail`
--

DROP TABLE IF EXISTS `report_submission_entity_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_submission_entity_detail` (
  `report_submission_entity_detail_id` INT(11) NOT NULL AUTO_INCREMENT,
  `report_submission_detail_id` INT(11) NOT NULL,
  `report_question_id` INT(11) NOT NULL,
  `entity` VARCHAR(50) NOT NULL,
  `entity_id` INT(11) NOT NULL,
  `remarks` TEXT NOT NULL,
  PRIMARY KEY (`report_submission_entity_detail_id`),
  KEY `report_submission_detail_id` (`report_submission_detail_id`),
  KEY `report_question_id` (`report_question_id`),
  CONSTRAINT `report_submission_entity_detail_ibfk_1` FOREIGN KEY (`report_submission_detail_id`) REFERENCES `report_submission_detail` (`report_submission_detail_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_submission_entity_detail_ibfk_2` FOREIGN KEY (`report_question_id`) REFERENCES `report_question` (`report_question_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
ALTER TABLE `report_question` ADD `question_id` INT NULL;
ALTER TABLE `report_question` ADD CONSTRAINT `question_id_rquestion` FOREIGN KEY (`question_id`) REFERENCES `question`(`question_id`) ON DELETE CASCADE ON UPDATE CASCADE;
--
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource` (
  `resource_id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `resource_type` ENUM('PNG','JPG','PDF','MP4') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `source` ENUM('YouTube','Vimeo','Other') CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `sequence` INT(11) NOT NULL,
  `location_path` VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`resource_id`),
  KEY `created_by_resource` (`created_by`),
  CONSTRAINT `created_by_resource` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) NOT NULL,
  `is_active` TINYINT(1) NOT NULL,
  `status` ENUM('Active','Inactive') DEFAULT NULL,
  `dashboard` ENUM('Employee','Manager') DEFAULT NULL,
  `is_admin_role` TINYINT(1) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  KEY `createdBy_role` (`created_by`),
  CONSTRAINT `createdBy_role` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `role_permission_id` INT(11) NOT NULL AUTO_INCREMENT,
  `role_id` INT(11) NOT NULL,
  `permission_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`role_permission_id`),
  KEY `roleId_role` (`role_id`),
  KEY `permissionId_role` (`permission_id`),
  CONSTRAINT `permissionId_role` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `roleId_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenario`
--

DROP TABLE IF EXISTS `scenario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenario` (
  `scenario_id` INT(11) NOT NULL AUTO_INCREMENT,
  `day` VARCHAR(100) DEFAULT NULL,
  `name` VARCHAR(160) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`scenario_id`),
  KEY `created_by_scenario` (`created_by`),
  KEY `updated_by_scenario` (`last_updated_by`),
  CONSTRAINT `created_by_scenario` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_scenario` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenario_job_type`
--

DROP TABLE IF EXISTS `scenario_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenario_job_type` (
  `scenario_job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `scenario_id` INT(11) NOT NULL,
  `job_type_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`scenario_job_type_id`),
  KEY `scenario_id_scenario_job_type` (`scenario_id`),
  KEY `job_type_id_scenario_job_type` (`job_type_id`),
  KEY `created_by_scenario_job_type` (`created_by`),
  KEY `updated_by_scenario_job_type` (`last_updated_by`),
  CONSTRAINT `created_by_scenario_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_type_id_scenario_job_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scenario_id_scenario_job_type` FOREIGN KEY (`scenario_id`) REFERENCES `scenario` (`scenario_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_scenario_job_type` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenario_training`
--

DROP TABLE IF EXISTS `scenario_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenario_training` (
  `scenario_training_id` INT(11) NOT NULL AUTO_INCREMENT,
  `scenario_id` INT(11) NOT NULL,
  `training_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`scenario_training_id`),
  KEY `training_id_scenario_training` (`training_id`),
  KEY `created_by_scenario_training` (`created_by`),
  KEY `updated_by_scenario_training` (`last_updated_by`),
  CONSTRAINT `created_by_scenario_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_id_scenario_training` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_scenario_training` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenario_training_category`
--

DROP TABLE IF EXISTS `scenario_training_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenario_training_category` (
  `scenario_training_category_id` INT(11) NOT NULL AUTO_INCREMENT,
  `scenario_id` INT(11) NOT NULL,
  `training_category_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`scenario_training_category_id`),
  KEY `scenario_id_scenario_training_category` (`scenario_id`),
  KEY `training_category_id_scenario_training_category` (`training_category_id`),
  KEY `created_by_scenario_training_category` (`created_by`),
  KEY `updated_by_scenario_training_category` (`last_updated_by`),
  CONSTRAINT `created_by_scenario_training_category` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scenario_id_scenario_training_category` FOREIGN KEY (`scenario_id`) REFERENCES `scenario` (`scenario_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_category_id_scenario_training_category` FOREIGN KEY (`training_category_id`) REFERENCES `training_category` (`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_scenario_training_category` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `user_id_number` INT(11) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `tenant_id` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL,
  `createdby` VARCHAR(255) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`user_id_number`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `task_id` INT(11) NOT NULL AUTO_INCREMENT,
  `task_type_id` INT(11) NOT NULL,
  `job_type_id` INT(11) DEFAULT NULL,
  `title` VARCHAR(160) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `description` TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `assigned_by` INT(11) NOT NULL,
  `location_id` INT(11) DEFAULT NULL,
  `task_status` ENUM('Overdue','Pending','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `is_private` TINYINT(1) NOT NULL DEFAULT '0',
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  KEY `assigned_employee` (`assigned_by`),
  KEY `location_task` (`location_id`),
  KEY `createdby_task` (`created_by`),
  KEY `updatedby_task` (`last_updated_by`),
  CONSTRAINT `assigned_employee` FOREIGN KEY (`assigned_by`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `createdby_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `location_task` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_task` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_assignee`
--

DROP TABLE IF EXISTS `task_assignee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_assignee` (
  `task_assignee_id` INT(11) NOT NULL AUTO_INCREMENT,
  `task_id` INT(11) NOT NULL,
  `assigned_to` INT(11) NOT NULL,
  `task_status` ENUM('Overdue','Pending','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`task_assignee_id`),
  KEY `createdby_assignee` (`created_by`),
  KEY `updatedby_assignee` (`last_updated_by`),
  CONSTRAINT `createdby_assignee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_assignee` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_image`
--

DROP TABLE IF EXISTS `task_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_image` (
  `task_image_id` INT(11) NOT NULL AUTO_INCREMENT,
  `task_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `image_url` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `image_thumbnail_url` VARCHAR(250) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`task_image_id`),
  KEY `creted_by_image` (`created_by`),
  CONSTRAINT `creted_by_image` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_log`
--

DROP TABLE IF EXISTS `task_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_log` (
  `task_log_id` INT(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`task_log_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_type`
--

DROP TABLE IF EXISTS `task_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_type` (
  `task_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `created_date` DATETIME DEFAULT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT '0',
  `created_by` INT(11) NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`task_type_id`),
  KEY `updated_by_task` (`created_by`),
  CONSTRAINT `created_by_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training`
--

DROP TABLE IF EXISTS `training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training` (
  `training_id` INT(11) NOT NULL AUTO_INCREMENT,
  `training_category_id` INT(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`training_id`),
  KEY `created_by_training` (`created_by`),
  KEY `updated_by_training` (`last_updated_by`),
  KEY `training_category_training` (`training_category_id`),
  CONSTRAINT `created_by_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_category_training` FOREIGN KEY (`training_category_id`) REFERENCES `training_category` (`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_training` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=INNODB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_category`
--

DROP TABLE IF EXISTS `training_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_category` (
  `training_category_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(250) DEFAULT NULL,
  `weighted_tier_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`training_category_id`),
  KEY `created_by_training_category_idx` (`created_by`),
  KEY `last_update_by_training_category_idx` (`last_updated_by`),
  KEY `weighted_tier_id` (`weighted_tier_id`),
  CONSTRAINT `created_by_training_category` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `last_update_by_training_category` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `weighted_tier_id_training_category` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier` (`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_employee`
--

DROP TABLE IF EXISTS `training_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_employee` (
  `training_employee_id` INT(11) NOT NULL AUTO_INCREMENT,
  `training_id` INT(11) NOT NULL,
  `employee_profile_id` INT(11) NOT NULL,
  `grade_id` INT(11) DEFAULT NULL,
  `job_type_id` INT(11) DEFAULT NULL,
  `notes` TEXT,
  `group_activity_id` INT(11) DEFAULT NULL,
  `is_retest` TINYINT(1) NOT NULL DEFAULT '0',
  `status` ENUM('Active','Inactive') NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  `last_updated_by` INT(11) DEFAULT NULL,
  `last_updated_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`training_employee_id`),
  KEY `grade_id_emptraining` (`grade_id`),
  KEY `created_by_emptraining` (`created_by`),
  KEY `updated_by_emptraining` (`last_updated_by`),
  KEY `employee_profile_training` (`employee_profile_id`),
  KEY `training_id` (`training_id`),
  KEY `job_type_training_employee` (`job_type_id`),
  KEY `training_group_activity_idx` (`group_activity_id`),
  CONSTRAINT `created_by_emptraining` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_profile_training` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grade_id_emptraining` FOREIGN KEY (`grade_id`) REFERENCES `masterdb`.`grade` (`grade_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_type_training_employee` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_group_activity` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_id` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_emptraining` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_job_type`
--

DROP TABLE IF EXISTS `training_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_job_type` (
  `training_job_type_id` INT(11) NOT NULL AUTO_INCREMENT,
  `training_id` INT(11) NOT NULL,
  `job_type_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`training_job_type_id`),
  KEY `created_by_training_job_type` (`created_by`),
  CONSTRAINT `created_by_training_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_resource`
--

DROP TABLE IF EXISTS `training_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_resource` (
  `training_resource_id` INT(11) NOT NULL AUTO_INCREMENT,
  `training_id` INT(11) NOT NULL,
  `resource_id` INT(11) NOT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`training_resource_id`),
  KEY `created_by_tresource` (`created_by`),
  CONSTRAINT `created_by_tresource` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

CREATE PROCEDURE `CardLevelIncreasing`( OUT var_output VARCHAR(8000))
BEGIN  

    DECLARE i INT DEFAULT 0;
    DECLARE var_employees_count INT DEFAULT 0;
    DECLARE var_output VARCHAR(8000);
    DECLARE var_employee_profile_id INT;
    DECLARE var_level INT;
    DECLARE var_emp_points INT;
    DECLARE var_emp_employee_profile_id INT;
    DECLARE var_total_score INT;
    DECLARE var_start_range_from INT;
    SET var_output = NULL;

    SELECT COUNT(1) INTO var_employees_count FROM employee_profile AS ep WHERE STATUS='Active';

    SET i = 0;
    WHILE i < var_employees_count DO   
        SET var_level = 0;
        SET var_emp_points = 0;
        SET var_employee_profile_id = 0;
        SET var_emp_employee_profile_id = 0;
         SELECT employee_profile_id INTO var_employee_profile_id 
         FROM employee_profile WHERE STATUS='Active' LIMIT i, 1;

        SELECT level.level, points INTO var_level, var_emp_points FROM employee_profile AS ep INNER JOIN LEVEL ON ep.level_id = level.level_id WHERE  employee_profile_id = var_employee_profile_id AND ep.status = 'Active';

        IF var_level IS NOT NULL THEN
           SELECT DISTINCT level.point_range_from INTO var_start_range_from 
           FROM LEVEL WHERE LEVEL =  (var_level + 1); 

           IF var_start_range_from IS NOT NULL THEN
              SET var_total_score = var_start_range_from - var_emp_points;

              IF var_total_score = 5 THEN 

                SET var_output = CONCAT_WS(',', var_output, var_employee_profile_id );

              END IF;
           END IF;
        END IF;
        SET i = i + 1;
    END WHILE;
    SELECT var_output;
END;

CREATE PROCEDURE `ExportTaskList`(
   IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT
)
BEGIN
  SET
    @query = CONCAT(
        'SELECT DISTINCT task.task_id, task_type.name as task_type, task.task_status as taskStatus, task.title, t2.task_status , task.description, task.is_group_task, task.created_date, location.name as location_name, job_type.name as job_type_name, task.end_date, task.start_date, task.is_scheduled, task.scheduled_interval_in_days, task.scheduled_task_end_date_interval, task.scheduled_end_date, (select CONCAT(user.first_name, " ", user.last_name)  FROM masterdb.user user, employee_profile, task y WHERE y.task_id = task.task_id AND y.assigned_by = employee_profile.employee_profile_id AND employee_profile.user_id = user.user_id ) as created_by, t2.assignees, t2.completed_date, t2.completed_by, (select GROUP_CONCAT(task_image.task_image_id SEPARATOR ",") FROM task_image WHERE task_image.task_id=task.task_id ) as task_images FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id LEFT JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN (SELECT assigned_to, task_id, task_assignee.last_updated_date as completed_date, (select CONCAT(x.first_name, " ", x.last_name) AS name FROM masterdb.user x WHERE x.user_id = task_assignee.last_updated_by) as completed_by, task_assignee.task_status as task_status, (CONCAT(user.first_name, " ", user.last_name)) AS assignees FROM task_assignee  LEFT JOIN employee_profile ON task_assignee.assigned_to = employee_profile.employee_profile_id  LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id WHERE task_assignee.status = "Active") t2 ON t2.task_id = task.task_id LEFT JOIN employee_profile ON task_assignee.assigned_to= employee_profile.employee_profile_id LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status= "Active" AND task_assignee.status = "Active" AND'
    );

  IF assignee = 0 THEN
  SET
    @query = CONCAT(@query, ' task.assigned_by = ', id);

  END IF;

  IF assignee = 1 THEN
  SET
    @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);

  END IF;
  IF assignee = 3 THEN
  SET
    @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);

  END IF;

  IF assignee = 2 THEN
  SET
    @query = CONCAT(@query, ' (task.assigned_by = ', id);

  SET
    @query = CONCAT(@query, ' OR task_assignee.assigned_to = ', id);

  SET
    @query = CONCAT(@query, ')');

  END IF;

  IF andCondition IS NOT NULL THEN
  SET
    @query = CONCAT(@query, ' ', andCondition);

  END IF;

  SET
    @query = CONCAT(
        @query,
        ' ORDER BY task.task_status ASC, task.end_date ASC'
    );

  PREPARE stmt
  FROM
    @query;

  EXECUTE stmt;

DEALLOCATE PREPARE stmt;

END;

CREATE PROCEDURE `GroupActivityCount`(IN `andCondition` TEXT)
    NO SQL
BEGIN 
SET @query = CONCAT('SELECT DISTINCT GA.group_activity_id, GA.day, GA.scenario, (select GROUP_CONCAT(job_type.name SEPARATOR ",") FROM job_type JOIN group_activity_job_type ON   job_type.job_type_id=group_activity_job_type.job_type_id WHERE group_activity_job_type.group_activity_id = GA.group_activity_id  ) as job_type, (select GROUP_CONCAT(location.name SEPARATOR ",") FROM location JOIN group_activity_location ON   location.location_id=group_activity_location.location_id WHERE group_activity_location.group_activity_id = GA.group_activity_id  ) as location, (select GROUP_CONCAT(training.name SEPARATOR ",") FROM training JOIN group_activity_training ON training.training_id = group_activity_training.training_id WHERE group_activity_training.group_activity_id = GA.group_activity_id  ) as training, (select GROUP_CONCAT(employee_profile.employee_profile_id SEPARATOR ",") FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id  ) as employee_profile, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM masterdb.user y WHERE y.user_id = GA.created_by ) as created_by, GA.created_date, (SELECT Count(*) FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id) as participants FROM group_activity as GA JOIN group_activity_training ON GA.group_activity_id = group_activity_training.group_activity_id LEFT JOIN group_activity_location ON GA.group_activity_id = group_activity_location.group_activity_id LEFT JOIN group_activity_job_type ON Ga.group_activity_id = group_activity_job_type.group_activity_id JOIN group_activity_employee ON GA.group_activity_id = group_activity_employee.group_activity_id JOIN masterdb.user ON GA.created_by = user.user_id WHERE GA.status = "Active" ');
IF andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
END IF;
SET @query = CONCAT(@query, ' ORDER BY GA.created_date DESC');
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END ;

CREATE PROCEDURE `GroupActivityList`(IN `countRows` INT, IN `skipRows` INT,  IN `andCondition` TEXT,IN `sortColumn` TEXT)
    NO SQL
BEGIN 
SET @query = CONCAT('SELECT DISTINCT GA.group_activity_id, GA.day, GA.scenario, (select GROUP_CONCAT(CONCAT(job_type.color,"|", job_type.name) SEPARATOR ",") FROM job_type JOIN group_activity_job_type ON   job_type.job_type_id=group_activity_job_type.job_type_id WHERE group_activity_job_type.group_activity_id = GA.group_activity_id  ) as job_type, (select GROUP_CONCAT(location.name SEPARATOR ",") FROM location JOIN group_activity_location ON   location.location_id=group_activity_location.location_id WHERE group_activity_location.group_activity_id = GA.group_activity_id  ) as location, (select GROUP_CONCAT(training.name SEPARATOR ",") FROM training JOIN group_activity_training ON training.training_id = group_activity_training.training_id WHERE group_activity_training.group_activity_id = GA.group_activity_id  ) as training, (select GROUP_CONCAT(employee_profile.employee_profile_id SEPARATOR ",") FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id  ) as employee_profile, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM masterdb.user y WHERE y.user_id = GA.created_by ) as created_by, GA.created_date, (SELECT Count(*) FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id) as participants FROM group_activity as GA JOIN group_activity_training ON GA.group_activity_id = group_activity_training.group_activity_id JOIN training ON group_activity_training.training_id = training.training_id LEFT JOIN group_activity_location ON GA.group_activity_id = group_activity_location.group_activity_id LEFT JOIN location ON group_activity_location.location_id = location.location_id LEFT JOIN group_activity_job_type ON Ga.group_activity_id = group_activity_job_type.group_activity_id  LEFT JOIN job_type ON group_activity_job_type.job_type_id =job_type.job_type_id JOIN group_activity_employee ON GA.group_activity_id = group_activity_employee.group_activity_id JOIN masterdb.user ON GA.created_by = user.user_id WHERE GA.status = "Active" ');
IF andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
END IF;
SET @query = CONCAT(@query, ' ORDER BY ',sortColumn);
SET @query = CONCAT(@query, ' limit ', countRows);
SET @query = CONCAT(@query, ' offset ', skipRows);
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END ;

CREATE PROCEDURE `LevelUpdation`(
    IN `var_current_datetime` DATETIME
)
BEGIN  

	DECLARE i INT DEFAULT 0;
	DECLARE var_employees_count INT DEFAULT 0;
    DECLARE var_employee_profile_id INT;
    DECLARE var_employee_points INT;
    DECLARE var_employee_level_id INT;
    DECLARE var_level_id INT;
    DECLARE var_created_by INT;
	
    SELECT COUNT(1) INTO var_employees_count FROM employee_profile WHERE STATUS='Active' ;
    SELECT user_id INTO var_created_by FROM masterdb.user WHERE email='admin@oneteam360.com';
   
    DROP TABLE IF EXISTS temp_employee_point_audit;
    CREATE TABLE temp_employee_point_audit LIKE employee_point_audit;

    SET i = 0;
	WHILE i < var_employees_count DO   
		SET var_employee_profile_id = 0;
        SET var_employee_points = 0;
        SET var_level_id = NULL;
		SELECT employee_profile_id INTO var_employee_profile_id FROM employee_profile WHERE STATUS='Active' LIMIT i, 1;
		SELECT points INTO var_employee_points FROM employee_profile WHERE employee_profile_id = var_employee_profile_id ;
		SELECT level_id INTO var_employee_level_id FROM employee_profile WHERE employee_profile_id = var_employee_profile_id ;

		## GET LEVEL START
        SELECT level_id INTO var_level_id  FROM LEVEL WHERE var_employee_points BETWEEN point_range_from AND point_range_to AND STATUS = 'Active' LIMIT 1;
        ## GET LEVEL END
        
        IF var_level_id IS NULL THEN
			IF  var_employee_points <= 0 THEN
				SELECT level_id INTO var_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL ASC LIMIT 1;
			ELSE
			   SELECT level_id INTO var_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL DESC LIMIT 1;
		   END IF;
		END IF;
        
        IF var_level_id != var_employee_level_id THEN
			## INSERT IN EMPLOYEE_AUDIT START
			INSERT INTO `temp_employee_point_audit`
				( `employee_profile_id`,
				`reason`,
				`interaction_score`,
				`note_score`,
				`training_score`,
				`total_weighted_score`,
				`points_earned`,
				`old_points`,
				`new_points`,
				`old_level_id`,
				`new_level_id`,
				`created_by`,
				`created_date`)
				VALUES
				( var_employee_profile_id,
				"Level recalibration by user",
				0,
				0,
				0,
				0, 
				0, 
				var_employee_points,
				var_employee_points,
				var_employee_level_id,
				var_level_id,
				var_created_by, 
				var_current_datetime);
			## INSERT IN EMPLOYEE_AUDIT END
		END IF;

		SET i = i + 1;
	END WHILE;
    
    BEGIN

		DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			  ROLLBACK;
		END;

		START TRANSACTION;
			SET SQL_SAFE_UPDATES = 0;
			
            UPDATE employee_profile SET employee_profile.level_id = (SELECT new_level_id FROM temp_employee_point_audit WHERE temp_employee_point_audit.employee_profile_id = employee_profile.employee_profile_id ORDER BY temp_employee_point_audit.employee_profile_id DESC LIMIT 1) WHERE employee_profile.status = 'Active' AND employee_profile.employee_profile_id IN (SELECT employee_profile_id FROM temp_employee_point_audit) ;
        
			INSERT INTO employee_point_audit (employee_profile_id, reason, interaction_score, note_score, training_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date) SELECT employee_profile_id, reason, interaction_score, note_score, training_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date FROM temp_employee_point_audit;
            SET SQL_SAFE_UPDATES = 1;

		COMMIT;    
	END;
    
	DROP TABLE IF EXISTS temp_employee_point_audit;
    
END ;

CREATE PROCEDURE `PointsCalculation`(
	IN `deduct_points_for_negative_performance` BOOLEAN,
	IN `threshold_score_for_points_calculation` INT,
    IN `additional_points_for_points_calculation` INT,
    IN `var_current_datetime` DATETIME,
    IN `var_start_date` DATETIME,
    IN `var_end_date` DATETIME,
    IN `var_deduct_points` INT,
    IN `var_points_for_positive_performance` INT,
    IN `var_checkin_points_calculation` INT
)
BEGIN  
	DECLARE i INT DEFAULT 0;
	DECLARE var_employees_count INT DEFAULT 0;
    DECLARE var_total_score INT DEFAULT 0 ;
	DECLARE var_note_score INT DEFAULT 0 ;
	DECLARE var_training_score INT DEFAULT 0 ;
	DECLARE var_interaction_score INT DEFAULT 0;
	DECLARE var_checkin_score INT DEFAULT 0;
	DECLARE var_daily_report_submittion_score INT DEFAULT 0;
    DECLARE var_points INT DEFAULT 0;
    DECLARE var_threshold_points INT DEFAULT 0;
    DECLARE var_total_points INT DEFAULT 0;
    DECLARE var_employee_profile_id INT;
    DECLARE var_employee_points INT DEFAULT 0;
    DECLARE var_employee_level_id INT DEFAULT NULL;
	DECLARE var_new_level_id INT  DEFAULT NULL;
    DECLARE var_level_id INT DEFAULT NULL;
    DECLARE var_created_by INT ;
	
    SELECT COUNT(1) INTO var_employees_count FROM employee_profile WHERE STATUS='Active' ;
    SELECT user_id INTO var_created_by FROM masterdb.user WHERE email='admin@oneteam360.com';
    
    DROP TABLE IF EXISTS temp_employee_point_audit;
    CREATE TABLE temp_employee_point_audit LIKE employee_point_audit;
    
    SET i = 0;
	WHILE i < var_employees_count DO   
		SET var_note_score = NULL;
		SET var_training_score = NULL;
		SET var_interaction_score = NULL;
		SET var_checkin_score = NULL;
		SET var_daily_report_submittion_score = NULL;
		SET var_employee_level_id = NULL;
		SET var_total_score = 0;
		SET var_points = 0;
		SET var_employee_points = 0;
		SET var_employee_profile_id = 0;  
        SET var_total_points = 0;
		SET var_level_id = NULL;
		SET var_new_level_id = NULL;
      
		SELECT employee_profile_id INTO var_employee_profile_id FROM employee_profile WHERE STATUS='Active' LIMIT i, 1;
		SELECT points INTO var_employee_points FROM employee_profile WHERE employee_profile_id = var_employee_profile_id ;
		SELECT level_id INTO var_employee_level_id FROM employee_profile WHERE employee_profile_id = var_employee_profile_id ;
        
         ## NOTE SECTION START
		 SELECT SUM(note_calc_table.var_note_score) INTO var_note_score FROM 
			(
				SELECT 
					employee_note_table.note_type_id, impact_multiplier.score AS impact_multiplier_score, weighted_tier.score AS weighted_tier_score, 
					employee_note_table.note_counts,(weighted_tier.score*impact_multiplier.score*employee_note_table.note_counts) AS var_note_score
					FROM (
							SELECT employee_note.note_type_id, COUNT(note_type_id) AS note_counts   FROM employee_note 
								WHERE employee_note.status="Active" AND employee_note.employee_profile_id = var_employee_profile_id
									AND employee_note.created_date > var_start_date AND employee_note.created_date <= var_end_date 
								GROUP BY employee_note.note_type_id			
						) AS employee_note_table 
					INNER JOIN note_type 
						ON note_type.note_type_id = employee_note_table.note_type_id
					INNER JOIN masterdb.weighted_tier 
						ON note_type.weighted_tier_id = weighted_tier.weighted_tier_id
					INNER JOIN masterdb.impact_multiplier 
						ON note_type.impact_multiplier_id = impact_multiplier.impact_multiplier_id
			 ) AS note_calc_table; 
         ## NOTE SECTION END
         
         ## TRAINING SECTION START
		 SELECT SUM(training_score) INTO var_training_score FROM 
			(
					SELECT training_id,training_category_id, 
						SUM(internal_score) AS training_sum,
                        COUNT(training_id) AS training_count, 
                        (ROUND(SUM(internal_score) / COUNT(training_id),2)) AS training_score
						FROM 
						(
							SELECT 
							training_employee.training_id,training_category.training_category_id ,
							weighted_tier.score AS weighted_tier_score,
							grade.score AS grade_score,
							(weighted_tier.score*grade.score) AS internal_score
							FROM training_employee 
							INNER JOIN training
								ON training.training_id = training_employee.training_id
							INNER JOIN training_category 
								ON training_category.training_category_id = training.training_category_id
							INNER JOIN masterdb.weighted_tier 
								ON training_category.weighted_tier_id = weighted_tier.weighted_tier_id
							INNER JOIN masterdb.grade 
								ON training_employee.grade_id = grade.grade_id
							WHERE training_employee.status = 'Active' 
								AND training_employee.employee_profile_id = var_employee_profile_id
                                AND training_employee.created_date > var_start_date AND training_employee.created_date <= var_end_date 
						
						) AS training_calc_table GROUP BY training_id
				) AS training_calculation_table;
         ## TRAINING SECTION END
         
         ## INTERACTION SECTION START
		 SELECT SUM(interaction_score) INTO var_interaction_score FROM 
			(
				SELECT interaction_factor_id, 
					SUM(internal_score) AS training_sum,
					COUNT(interaction_factor_id) AS interaction_count, 
					(ROUND(SUM(internal_score) / COUNT(interaction_factor_id),2)) AS interaction_score
					FROM 
					(
						SELECT 
							employee_interaction_detail.interaction_factor_id,
							weighted_tier.score AS weighted_tier_score,
							grade.score AS grade_score,
							(weighted_tier.score*grade.score) AS internal_score
							FROM employee_interaction
								INNER JOIN employee_interaction_detail
									ON employee_interaction_detail.employee_interaction_id = employee_interaction.employee_interaction_id
								INNER JOIN interaction_factor
									ON employee_interaction_detail.interaction_factor_id = interaction_factor.interaction_factor_id
								INNER JOIN masterdb.weighted_tier 
									ON interaction_factor.weighted_tier_id = weighted_tier.weighted_tier_id
								INNER JOIN masterdb.grade 
									ON employee_interaction_detail.grade_id = grade.grade_id
							WHERE employee_interaction.employee_profile_id = var_employee_profile_id
								AND employee_interaction.created_date > var_start_date AND employee_interaction.created_date <= var_end_date 
					) AS interaction_calc_table GROUP BY interaction_factor_id
			) AS interaction_calculation_table;
         ## INTERACTION SECTION END
         
		 ## CHECKIN SECTION START
		 IF var_checkin_points_calculation > 0 THEN
			SELECT SUM(checkin_calc_table.var_checkin_score) INTO var_checkin_score FROM 
			(
			SELECT 
			employee_checkin_table.reviewer_status, employee_checkin_table.checkin_counts, impact_multiplier.score AS impact_multiplier_score, weighted_tier.score AS weighted_tier_score, 
			(weighted_tier.score*impact_multiplier.score*employee_checkin_table.checkin_counts) AS var_checkin_score
			FROM ( SELECT employee_checkin.reviewer_status, COUNT(employee_checkin_id) AS checkin_counts FROM employee_checkin 
			WHERE employee_checkin.employee_profile_id = var_employee_profile_id
			AND employee_checkin.checkin_datetime > var_start_date AND employee_checkin.checkin_datetime <= var_end_date
			AND reviewer_status IS NOT NULL 
			GROUP BY employee_checkin.reviewer_status
			) AS employee_checkin_table 
			INNER JOIN checkin_status 
				ON checkin_status.checkin_status = employee_checkin_table.reviewer_status
			INNER JOIN masterdb.weighted_tier 
				ON checkin_status.weighted_tier_id = weighted_tier.weighted_tier_id
			INNER JOIN masterdb.impact_multiplier 
				ON checkin_status.impact_multiplier_id = impact_multiplier.impact_multiplier_id
			) AS checkin_calc_table; 
		ELSE 
			SET var_checkin_score  = 0;
		END IF; 
         ## CHECKIN SECTION END
         
         ## DAILY REPORT SECTION START
		 SELECT SUM(report_submit_table.var_daily_report_submittion_score) INTO var_daily_report_submittion_score FROM 
				(
				SELECT 
				(weighted_tier.score*impact_multiplier.score*report_submission_table.report_submit_counts) AS var_daily_report_submittion_score
				FROM ( 
					SELECT `status` AS report_status, COUNT(report_submission_id) AS report_submit_counts 
					FROM report_submission 
					WHERE report_submission.employee_profile_id = var_employee_profile_id
					AND report_submission.reported_date > var_start_date 
					AND report_submission.reported_date <= var_end_date
					AND `status` = 'submitted'
					GROUP BY report_id, location_id
				) AS report_submission_table 
				INNER JOIN report_submission_point_calculation ON report_submission_point_calculation.report_submission_status = report_submission_table.report_status
				INNER JOIN masterdb.weighted_tier  ON report_submission_point_calculation.weighted_tier_id = weighted_tier.weighted_tier_id
				INNER JOIN masterdb.impact_multiplier ON report_submission_point_calculation.impact_multiplier_id = impact_multiplier.impact_multiplier_id
				) AS report_submit_table; 
         ## DAILY REPORT SECTION END
         
         ## TOTAL SCORE CALCULATION START
         IF var_note_score IS NULL THEN SET var_note_score = 0; END IF;
         IF var_training_score IS NULL THEN SET var_training_score = 0;  END IF;
         IF var_interaction_score IS NULL THEN SET var_interaction_score = 0;  END IF;
         IF var_checkin_score IS NULL THEN SET var_checkin_score = 0;  END IF;
         IF var_daily_report_submittion_score IS NULL THEN SET var_daily_report_submittion_score = 0;  END IF;
         
         SET var_total_score = var_note_score + var_training_score + var_interaction_score + var_checkin_score + var_daily_report_submittion_score;
		 ## TOTAL SCORE CALCULATION END
        
        
        ## POINTS CALCULATION START
        IF var_total_score > 0 THEN
			SET var_points = var_points_for_positive_performance;
		ELSEIF var_total_score = 0 THEN
			SET var_points = 0;
		ELSE
			IF deduct_points_for_negative_performance THEN
				IF var_employee_points > 0 THEN
					SET var_points = var_deduct_points * -1; ## Check if the customer configuration allows point deduction. If the deduction is allowed, award negative 1-point else award no var_points.
				ELSE
					SET var_points = 0;
				END IF;
			ELSE 
				SET var_points = 0; 
			END IF;
        END IF;
        
        SET var_total_points = var_employee_points + var_points;
		IF var_total_points < 0 THEN
			SET var_total_points = 0;
		END IF;
		## POINTS CALCULATION END
        
        #THRESHOLD CALCULATION START
        IF var_total_score > threshold_score_for_points_calculation THEN
			SET var_threshold_points  = additional_points_for_points_calculation;
		ELSE 
			SET var_threshold_points  = 0;
		END IF;
        #THRESHOLD CALCULATION END
        
		## GET LEVEL START
        SELECT level_id INTO var_level_id  FROM LEVEL WHERE var_total_points BETWEEN point_range_from AND point_range_to AND STATUS = 'Active' LIMIT 1;
        ## GET LEVEL END
        
        IF var_level_id IS NULL THEN
			IF var_total_points <= 0 THEN
				SELECT level_id INTO var_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL ASC LIMIT 1;
			ELSE
               SELECT level_id INTO var_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL DESC LIMIT 1;
		   END IF;
		END IF;
        
		## UPDATE EMPLOYEE PROFILE START
        ## if var_level_id IS NOT NULL then
		## 	UPDATE employee_profile SET points = var_total_points, level_id = var_level_id  WHERE employee_profile_id = var_employee_profile_id;
		## else
		## 	UPDATE employee_profile SET points = var_total_points  WHERE employee_profile_id = var_employee_profile_id;
		## end if;
        ## UPDATE EMPLOYEE PROFILE END
        
        ## INSERT IN EMPLOYEE_AUDIT START
        INSERT INTO `temp_employee_point_audit`
			( `employee_profile_id`,
			`reason`,
			`interaction_score`,
			`note_score`,
			`training_score`,
			`checkin_score`,
			`dailyreport_score`,
			`total_weighted_score`,
			`points_earned`,
			`old_points`,
			`new_points`,
			`old_level_id`,
			`new_level_id`,
			`created_by`,
			`created_date`)
			VALUES
			( var_employee_profile_id,
			"Daily Score",
			var_interaction_score,
			var_note_score,
			var_training_score,
			var_checkin_score,
			var_daily_report_submittion_score,
			var_total_score, 
			var_points, 
			var_employee_points,
			var_total_points,
			var_employee_level_id,
			var_level_id,
			var_created_by, 
			var_current_datetime);
        ## INSERT IN EMPLOYEE_AUDIT END
        
        IF var_threshold_points > 0 THEN
			SELECT level_id INTO var_new_level_id  FROM LEVEL WHERE (var_total_points + var_threshold_points) BETWEEN point_range_from AND point_range_to AND STATUS = 'Active' LIMIT 1;
				IF var_new_level_id IS NULL THEN
					IF (var_total_points + var_threshold_points) <= 0 THEN
						SELECT level_id INTO var_new_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL ASC LIMIT 1;
					ELSE
					   SELECT level_id INTO var_new_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL DESC LIMIT 1;
				   END IF;
				END IF;
			## INSERT IN EMPLOYEE_AUDIT START
			INSERT INTO `temp_employee_point_audit`
				( `employee_profile_id`,
				`reason`,
				`interaction_score`,
				`note_score`,
				`training_score`,
				`checkin_score`,
				`dailyreport_score`,
				`total_weighted_score`,
				`old_points`,
				`new_points`,
				`old_level_id`,
				`new_level_id`,
				`points_earned`,
				`created_by`,
				`created_date`)
				VALUES
				( var_employee_profile_id,
				"Automated Additional points rewarded",
				0,
				0,
				0,
				0,
				0,
				0, 
				var_total_points,
				var_total_points + var_threshold_points,
				var_level_id,
				var_new_level_id,
				var_threshold_points,
				var_created_by, 
				var_current_datetime);
			## INSERT IN EMPLOYEE_AUDIT END
		END IF;
		SET i = i + 1;
	END WHILE;
    
    BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			  ROLLBACK;
		END;
		START TRANSACTION;
			SET SQL_SAFE_UPDATES = 0;
            UPDATE employee_profile SET 
			employee_profile.points = (SELECT new_points FROM temp_employee_point_audit WHERE temp_employee_point_audit.employee_profile_id = employee_profile.employee_profile_id ORDER BY temp_employee_point_audit.employee_profile_id DESC LIMIT 1),
			employee_profile.level_id = (SELECT new_level_id FROM temp_employee_point_audit WHERE temp_employee_point_audit.employee_profile_id = employee_profile.employee_profile_id ORDER BY temp_employee_point_audit.employee_profile_id DESC LIMIT 1) WHERE employee_profile.status = 'Active';
        
			INSERT INTO employee_point_audit (employee_profile_id, reason, interaction_score, note_score, training_score, checkin_score, dailyreport_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date) SELECT employee_profile_id, reason, interaction_score, note_score, training_score, checkin_score, dailyreport_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date FROM temp_employee_point_audit;
            SET SQL_SAFE_UPDATES = 1;
		COMMIT;    
	END;
    
	DROP TABLE IF EXISTS temp_employee_point_audit;
    
END ;

CREATE PROCEDURE `TaskListCount`(IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT)
BEGIN
SET @query = CONCAT('SELECT DISTINCT task.task_id FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id INNER JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN  masterdb.user ON task.created_by = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status = "Active" AND task_assignee.status="Active" AND');
IF assignee = 0 THEN
   SET @query = CONCAT(@query, ' task.assigned_by = ', id);
END IF;
IF assignee = 1 THEN
   SET @query = CONCAT(@query, ' task_assignee.assigned_to = ', id );
END IF;
IF assignee = 3 THEN
   SET @query = CONCAT(@query, ' task_assignee.assigned_to = ', id );
END IF;
IF assignee =2 THEN
   SET @query = CONCAT(@query, ' (task.assigned_by = ', id );
   SET @query = CONCAT(@query, ' OR task_assignee.assigned_to  IN
			(select distinct ep1.employee_profile_id from employee_profile as ep1 
			INNER JOIN employee_location el1 ON ep1.employee_profile_id = el1.employee_profile_id
			INNER JOIN location ON el1.location_id = location.location_id 
			where el1.location_id IN 
			((select y.location_id 
			FROM location y INNER JOIN  employee_location el ON y.location_id = el.location_id
			INNER JOIN employee_profile as ep ON el.employee_profile_id = ep.employee_profile_id
			 WHERE  ep.employee_profile_id= ', id );
   SET @query = CONCAT(@query, ')) AND ep1.status = "Active" AND location.status = "Active") )');
END IF;
IF andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
END IF;
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END ;

CREATE PROCEDURE `TaskListHistory`(
   IN `id` INT(11),
   IN `assignee` INT(11),
   IN `countRows` INT(11),
   IN `skipRows` INT(11),
   IN `andCondition` TEXT
)
BEGIN
SET
   @query = CONCAT(
   'SELECT DISTINCT task.task_id, task_type.name as task_type, task.title, task.task_status, task.description, 
   task.is_group_task, task.entity_type, task.entity_id, task.training_employee_id,
   task.created_date, task.created_by as created_by_id, task.last_updated_date, location.name as location_name, task.is_private, task.end_date, 
   task.start_date, user.profile_picture_url, user.profile_picture_thumbnail_url,
   (select CONCAT(y.first_name, " ", y.last_name) AS name FROM masterdb.user y WHERE y.user_id = task.created_by ) 
   as created_by, ( select CONCAT(y.first_name, " ", y.last_name) AS name FROM masterdb.user y 
   WHERE y.user_id = task.last_updated_by) as last_updated_by, 
   (select GROUP_CONCAT( CONCAT(CONCAT(user.first_name, " ", user.last_name),"-",y.task_status,"-",y.assigned_to) SEPARATOR "," ) 
   FROM task_assignee y, employee_profile, masterdb.user user WHERE y.task_id = task.task_id AND y.assigned_to = employee_profile.employee_profile_id AND employee_profile.user_id = user.user_id AND y.status = "Active") as task_assignee, (select GROUP_CONCAT(task_image.task_image_id SEPARATOR ",") FROM task_image WHERE task_image.task_id=task.task_id ) as task_images'
   );IF assignee = 1 THEN
   SET
   @query = CONCAT(
   @query,
   ', task_assignee.task_status as task_assignee_status'
   );END IF;
   IF assignee = 3 THEN
   SET
   @query = CONCAT(
   @query,
   ', task_assignee.task_status as task_assignee_status'
   );END IF;SET
   @query = CONCAT(
   @query,
   ' FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id INNER JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN masterdb.user ON task.created_by = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status = "Active" AND task_assignee.status = "Active" AND'
   );IF assignee = 0 THEN
   SET
   @query = CONCAT(@query, ' task.assigned_by = ', id);END IF;IF assignee = 1 THEN
   SET
   @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);END IF;
   IF assignee = 3 THEN
   SET
   @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);END IF;IF assignee = 2 THEN
   SET
   @query = CONCAT(@query, ' (task.assigned_by = ', id);SET
   @query = CONCAT(@query, ' OR task_assignee.assigned_to = ', id);SET
   @query = CONCAT(@query, ')');END IF;IF andCondition IS NOT NULL THEN
   SET
   @query = CONCAT(@query, ' ', andCondition);END IF;IF assignee = 0 THEN
   SET
   @query = CONCAT(@query, ' ORDER BY task.task_status ASC, ');END IF;IF assignee = 1 THEN
   SET
   @query = CONCAT(
   @query,
   ' ORDER BY task_assignee.task_status ASC, '
   );END IF;
   IF assignee = 3 THEN
   SET
   @query = CONCAT(
   @query,
   ' ORDER BY task.task_status ASC, task.last_updated_date DESC, '
   );END IF;IF assignee = 2 THEN
   SET
   @query = CONCAT(@query, ' ORDER BY task.task_status ASC, task.last_updated_date DESC, ');END IF;SET
   @query = CONCAT(@query, ' task.end_date ASC limit ', countRows);SET
   @query = CONCAT(@query, ' offset ', skipRows);PREPARE stmt
   FROM
   @query;EXECUTE stmt;DEALLOCATE PREPARE stmt;

END ;

-- Dump completed on 2022-01-05 17:59:35

/*AUTO_INCREMENT set to 1*/

ALTER TABLE 	bulk_import_log	 AUTO_INCREMENT = 1;
ALTER TABLE 	bulk_import_temp	 AUTO_INCREMENT = 1;
ALTER TABLE 	certificate_job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	certificate_status_enum	 AUTO_INCREMENT = 1;
ALTER TABLE 	certificate_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	competition	 AUTO_INCREMENT = 1;
ALTER TABLE 	competition_employee	 AUTO_INCREMENT = 1;
ALTER TABLE 	competition_job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	competition_location	 AUTO_INCREMENT = 1;
ALTER TABLE 	cron_job	 AUTO_INCREMENT = 1;
ALTER TABLE 	cron_job_logs	 AUTO_INCREMENT = 1;
ALTER TABLE 	department	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_certificate	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_certificate_history	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_interaction	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_interaction_detail	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_location	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_note	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_notification_preference	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_point_audit	 AUTO_INCREMENT = 1;
ALTER TABLE 	employee_profile	 AUTO_INCREMENT = 1;
ALTER TABLE 	form_field	 AUTO_INCREMENT = 1;
ALTER TABLE 	group_activity	 AUTO_INCREMENT = 1;
ALTER TABLE 	group_activity_employee	 AUTO_INCREMENT = 1;
ALTER TABLE 	group_activity_job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	group_activity_location	 AUTO_INCREMENT = 1;
ALTER TABLE 	group_activity_training	 AUTO_INCREMENT = 1;
ALTER TABLE 	interaction	 AUTO_INCREMENT = 1;
ALTER TABLE 	interaction_factor	 AUTO_INCREMENT = 1;
ALTER TABLE 	interaction_factor_job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	LEVEL	 AUTO_INCREMENT = 1;
ALTER TABLE 	location	 AUTO_INCREMENT = 1;
ALTER TABLE 	note_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	notification_queue	 AUTO_INCREMENT = 1;
ALTER TABLE 	notification_queue_recipient	 AUTO_INCREMENT = 1;
ALTER TABLE 	notification_template	 AUTO_INCREMENT = 1;
ALTER TABLE 	permission	 AUTO_INCREMENT = 1;
ALTER TABLE 	permission_module	 AUTO_INCREMENT = 1;
ALTER TABLE 	question	 AUTO_INCREMENT = 1;
ALTER TABLE 	question_option	 AUTO_INCREMENT = 1;
ALTER TABLE 	question_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	report	 AUTO_INCREMENT = 1;
ALTER TABLE 	report_location	 AUTO_INCREMENT = 1;
ALTER TABLE 	report_question	 AUTO_INCREMENT = 1;
ALTER TABLE 	report_question_option	 AUTO_INCREMENT = 1;
ALTER TABLE 	report_submission	 AUTO_INCREMENT = 1;
ALTER TABLE 	report_submission_detail	 AUTO_INCREMENT = 1;
ALTER TABLE 	report_submission_detail_option	 AUTO_INCREMENT = 1;
ALTER TABLE 	report_submission_entity_detail	 AUTO_INCREMENT = 1;
ALTER TABLE 	resource	 AUTO_INCREMENT = 1;
ALTER TABLE 	role	 AUTO_INCREMENT = 1;
ALTER TABLE 	role_permission	 AUTO_INCREMENT = 1;
ALTER TABLE 	scenario	 AUTO_INCREMENT = 1;
ALTER TABLE 	scenario_job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	scenario_training	 AUTO_INCREMENT = 1;
ALTER TABLE 	scenario_training_category	 AUTO_INCREMENT = 1;
ALTER TABLE 	STATUS	 AUTO_INCREMENT = 1;
ALTER TABLE 	task	 AUTO_INCREMENT = 1;
ALTER TABLE 	task_assignee	 AUTO_INCREMENT = 1;
ALTER TABLE 	task_image	 AUTO_INCREMENT = 1;
ALTER TABLE 	task_log	 AUTO_INCREMENT = 1;
ALTER TABLE 	task_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	training	 AUTO_INCREMENT = 1;
ALTER TABLE 	training_category	 AUTO_INCREMENT = 1;
ALTER TABLE 	training_employee	 AUTO_INCREMENT = 1;
ALTER TABLE 	training_job_type	 AUTO_INCREMENT = 1;
ALTER TABLE 	training_resource	 AUTO_INCREMENT = 1;

/* completed AUTO_INCREMENT set to 1*/

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `certificate_status_enum`
--

LOCK TABLES `certificate_status_enum` WRITE;
/*!40000 ALTER TABLE `certificate_status_enum` DISABLE KEYS */;
INSERT INTO `certificate_status_enum` VALUES (1,'Assigned','Assigned',1),(2,'InReview','In Review',2),(3,'Active','Active',3),(4,'Expired','Expired',4);
/*!40000 ALTER TABLE `certificate_status_enum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `cron_job`
--

LOCK TABLES `cron_job` WRITE;
/*!40000 ALTER TABLE `cron_job` DISABLE KEYS */;
INSERT INTO `cron_job` VALUES (1,'Point Calculation','POINTS_CALCULATION','Cron Job For Point Calculation',NULL,NULL),(2,'Point Calculation Notification','POINTS_CALCULATION_NOTIFICATION','Cron Job For Point Calculation Notification',NULL,NULL),(3,'Certificate About to Expire','CERTIFICATE_ABOUT_TO_EXPIRE','Cron Job for Certificate About to Expire',NULL,NULL),(4,'Task Overdue','TASK_OVERDUE','Cron Job for Task Overdue',NULL,NULL),(5,'Competition Completion','COMPETITION_COMPLETION','Cron Job for Competition Completion',NULL,NULL),(6,'Bulk Import','BULK_IMPORT','Cron Job for Bulk Import',NULL,NULL),(7,'Employee Report Submission','EMPLOYEE_REPORT_SUBMISSION','Cron job for report submission',NULL,NULL),(8,'Competition Start','COMPETITION_START_TODAY','Cron job for start competition',NULL,NULL);
/*!40000 ALTER TABLE `cron_job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES (1,1,0,'View Team Members','View_Employees','Allows user to view all the team members added within the system for the locations to which logged in user is associated with.',1,'Active',NULL,NULL),(2,1,1,'View All Team Members - All locations','View_All_employees -_All_locations','Allows user to view all the team members added within the system.',2,'Active',NULL,NULL),(3,1,1,'Add','Add_Employee','Allows user to add new team member if he has view all team members permission.',3,'Active',NULL,NULL),(4,1,1,'Bulk Import','Bulk_Import_Employees','Allows user to add team members using bulk import feature if s/he has view all team members permission.',4,'Active',NULL,NULL),(5,1,1,'Inactivate','Inactivate_Employee','Allows user to inactive a team member if he has view all team members permission.',5,'Active',NULL,NULL),(6,1,0,'Edit Information','Edit_Employee','Allows user to edit the team member details if he has view all team members permission.',6,'Active',NULL,NULL),(7,2,6,'Edit Date of Hire','Edit_Date_of_Hire','Allows user to edit date of hire if s/he has edit team member permission',1,'Active',NULL,NULL),(8,1,6,'Edit Email ID','Edit_Email_ID','Allows user to edit email ID if s/he has edit team member permission.',7,'Active',NULL,NULL),(9,1,1,'View Profile','View_Employee_Profile','Allows user to view team member profile if s/he has view all team members permission.',8,'Active',NULL,NULL),(10,2,0,'Add Task','Add_Employee_Task','Allow user to add new task on team member profile.',2,'Active',NULL,NULL),(11,2,0,'Edit Task','Edit_Employee_Task','Allow user to edit task on team member profile.',3,'Active',NULL,NULL),(12,2,0,'Delete Task','Delete_Employee_Task','Allow user to delete task on team member profile.',4,'Active',NULL,NULL),(13,2,0,'Complete Task','Complete_Employee_Task','Allow user to complete task on team member profile.',5,'Active',NULL,NULL),(14,2,0,'View Private Tasks','View_Employee_Private_Tasks','Allow user to view private task on team member profile.',6,'Active',NULL,NULL),(15,2,0,'Rate Interaction','Rate_Interaction','Allow user to rate interaction on team member profile.',7,'Active',NULL,NULL),(16,2,0,'View Points History','View_Points_History','Allow user to view points history of team member.',8,'Active',NULL,NULL),(17,2,0,'Adjust Point','Adjust_Point','Allow user to adjust points on team member profile.',9,'Active',NULL,NULL),(18,2,0,'View Private Notes','View_Private_Notes','Allow user to view private notes on team member profile.',10,'Active',NULL,NULL),(19,2,0,'Add Note','Add_Note','Allow user to add new note on team member profile.',11,'Active',NULL,NULL),(20,2,0,'Remove Note','Remove_Note','Allow user to remove note from team member profile.',12,'Active',NULL,NULL),(21,2,0,'Add Certificate','Add_Certificate','Allow user to add certificate on team member profile.',13,'Active',NULL,NULL),(22,2,0,'Assign Certificate','Assign_Certificate','Allow user to assign certificate on team member profile.',14,'Active',NULL,NULL),(23,2,0,'Review Certificate','Review_Certificate','Allow user to review certificate on team member profile.',15,'Active',NULL,NULL),(24,2,0,'Edit Certificate','Edit_Certificate','Allow user to edit certificate on team member profile.',16,'Active',NULL,NULL),(25,2,0,'Delete Certificate','Delete_Certificate','Allow user to delete certificate on team member profile.',17,'Active',NULL,NULL),(26,2,22,'Edit Assigned Certificate','Edit_Assigned_Certificate','Allow user to edit assigned certificate on team member profile if s/he has assign certificate permission.',18,'Active',NULL,NULL),(27,2,0,'Add Skill Assessment','Add_Training','Allow user to add skill assessment on team member profile.',19,'Active',NULL,NULL),(28,2,0,'Retest Assessment','Retest_Training','Allow user to retest assessment on team member profile.',20,'Active',NULL,NULL),(29,2,0,'Delete Assessment','Delete_Training','Allow user to delete assessment on team member profile.',21,'Active',NULL,NULL),(30,3,0,'View Skill Assessment History','View_Training&Developments_History','Allows user to view skill assessment history within the system.',1,'Active',NULL,NULL),(31,3,30,'Add Multi Skill Assessment','Conduct_Group_Activity','Allows user to add multi skill assessment if s/he has permission to view skill assessment history.',2,'Active',NULL,NULL),(32,3,30,'Delete Assessment','Delete_Group_Activity','Allows user to delete assessment if s/he has permission to view skill assessment.',3,'Active',NULL,NULL),(33,3,31,'Save Assessment','Save_Scenario','Allow user to save assessment while adding multi skill assessment.',4,'Active',NULL,NULL),(34,4,0,'Access Task History','Access_Task_History','Allows user to view Tasks menu item if s/he has access task history permission.',1,'Active',NULL,NULL),(35,4,0,'View All Tasks','View_All_Tasks','Allows user to view all tasks if s/he has access task history permission.',2,'Active',NULL,NULL),(36,4,34,'Add Tasks','Add_Task','Allows user to add task if s/he has access task history permission.',3,'Active',NULL,NULL),(37,4,34,'Edit Task','Edit_Task','Allows user to edit task if s/he has access task history permission.',4,'Active',NULL,NULL),(38,4,34,'Delete Task','Delete_Task','Allows user to delete task if s/he has access task history permission.',5,'Active',NULL,NULL),(39,4,34,'Complete Task','Complete_Task','Allows user to complete task if s/he has access task history permission.',6,'Active',NULL,NULL),(40,4,34,'View Task Image','View_Task_Image','Allows user to view task image if s/he has access task history permission.',7,'Active',NULL,NULL),(41,4,34,'View Private Tasks','View_Private_Tasks','Allows user to view private task if s/he has access task history permission.',8,'Active',NULL,NULL),(42,4,34,'Export Excel Task','Export_Excel_Task','Allows user to export task excel if s/he has access task history permission.',9,'Active',NULL,NULL),(43,5,0,'View Competition History','View_Competition_History','Allows user to view competition history.',2,'Active',NULL,NULL),(44,5,43,'Create Competition','Create_Competition','Allows user to create competition if s/he has view competition history permission.',3,'Active',NULL,NULL),(45,5,43,'Edit Competition','Edit_Competition','Allows user to edit competition if s/he has view competition history permission.',4,'Active',NULL,NULL),(46,5,0,'Delete Competition','Delete_Competition','Allows user to delete competition if s/he has view competition history permission.',5,'Active',NULL,NULL),(47,6,0,'View All Roles','View_All_Roles','Allows user to view all the roles created within the system.',1,'Active',NULL,NULL),(48,6,47,'Add Role','Add_Role','Allows user to add new role if s/he has view all roles permission.',2,'Active',NULL,NULL),(49,6,47,'Edit Role','Edit_Role','Allows user to edit the role if s/he has view all roles permission.',3,'Active',NULL,NULL),(50,6,47,'Inactivate Role','Inactivate_Role','Allows user to inactivate the role if s/he has view all roles permission.',4,'Active',NULL,NULL),(51,7,0,'View System Management','View_System_Management','Allows user to view system management option within the system.',1,'Active',NULL,NULL),(52,7,51,'Job types Management','Job_types_Management','Allows user to operate job type management if s/he has view system management permission.',2,'Active',NULL,NULL),(53,7,51,'Location Management','Location_Management','Allows user to operate location management if s/he has view system management permission.',3,'Active',NULL,NULL),(54,7,51,'Level Management','Level_Management','Allows user to operate level management if s/he has view system management permission.',4,'Active',NULL,NULL),(55,7,51,'Task Type Management','Task_Type_Management','Allows user to operate task type management if s/he has view system management permission.',5,'Active',NULL,NULL),(56,7,51,'Certificate Type Management','Certificate_Type_Management','Allows user to operate certificate type management if s/he has view system management permission.',6,'Active',NULL,NULL),(57,7,51,'Note Type Management','Note_Type_Management','Allows user to operate note type management if s/he has view system management permission.',7,'Active',NULL,NULL),(58,7,51,'Skill Management','Training_Management','Allows user to operate skill management if s/he has view system management permission.',8,'Active',NULL,NULL),(59,7,51,'Skill Category Management','Training_Category_Management','Allows user to operate skill category management if s/he has view system management permission.',9,'Active',NULL,NULL),(60,7,51,'Interaction Factor Management','Interaction_Factor_Management','Allows user to operate interaction factor management if s/he has view system management permission.',10,'Active',NULL,NULL),(61,8,0,'View Configured Report List','View_Configured_Report_List','Allows user to view Daily report configuration menu option.',1,'Active',NULL,NULL),(62,8,61,'Create Report','Create_Report','Allows user to create report if s/he has view configured report list permission.',2,'Active',NULL,NULL),(63,8,61,'Edit Report','Edit_Report','Allows user to edit report if s/he has view configured report list permission.',3,'Active',NULL,NULL),(64,8,61,'Inactivate Report','Inactivate_Report','Allows user to inactivate report if s/he has view configured report list permission.',4,'Active',NULL,NULL),(65,8,61,'Clone Report','Clone_Report','Allows user to clone report if s/he has view configured report list permission.',5,'Active',NULL,NULL),(66,9,0,'Receive Daily Report Digest','Receive_Daily_Report_Digest','Allows user to receive daily report digest over email.',1,'Active',NULL,NULL),(67,9,0,'View Assigned Reports','View_Assigned_Reports','Allows user to view assigned report for the location.',2,'Active',NULL,NULL),(68,9,67,'Submit Daily Report','Submit_Daily_Report','Allows user to submit report if s/he has view assigned reports permission.',3,'Active',NULL,NULL),(69,9,0,'View Report History','View_Report_History','Allows user to view reports that are submitted.',4,'Active',NULL,NULL),(70,10,0,'Skill Assessment List','Training_List','Allows user to view skill assessment report menu option within the system.',1,'Active',NULL,NULL),(71,10,70,'Export Excel Skill Assessment','Export_Excel_Training','Allows user to export excel if s/he has Skill Assessment Report permission.',2,'Active',NULL,NULL),(72,11,0,'View Points History - All team member','View_Points_History-All_Employee','Allows user to view points history menu option within the system.',1,'Active',NULL,NULL),(73,5,0,'View Competition Dashboard','View_Competition_Dashboard','Allows user to view Competition menu item if s/he has access View Competition Dashboard permission.',1,'Active',NULL,NULL),(74,12,0,'Manage Company Account','Manage_company_account','Allow user to view the company account page and make required changes. ',11,'Active',NULL,NULL),(75,12,0,'Manage Configurations','Manage_configurations','Allow user to view the configurations menu item within the main menu and make required changes.',12,'Active',NULL,NULL);
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `permission_module`
--

LOCK TABLES `permission_module` WRITE;
/*!40000 ALTER TABLE `permission_module` DISABLE KEYS */;
INSERT INTO `permission_module` VALUES (1,0,'Directory','Employee_List','Directory',1,'Active',1,'2021-09-07 10:13:36'),(2,0,'Profile','Employee_Profile','Profile',2,'Active',1,'2021-09-07 10:13:36'),(3,0,'Skill Assessment','Training_&_Development','Skill Assessment',3,'Active',1,'2021-09-07 10:13:36'),(4,0,'Tasks','Tasks','Tasks',4,'Active',1,'2021-09-07 10:13:36'),(5,0,'Competitions','Competitions','Competitions',5,'Active',1,'2021-09-07 10:13:36'),(6,0,'Role Management','Role_Management','Role Management',6,'Active',1,'2021-09-07 10:13:36'),(7,0,'Master Management','Master_Management','Master Management',7,'Active',1,'2021-09-07 10:13:36'),(8,0,'Daily Report Configuration','Daily_Report_Configuration','Daily Report Configuration',8,'Active',1,'2021-09-07 10:13:36'),(9,0,'Daily Report','Daily_Report','Daily Report',9,'Active',1,'2021-09-07 10:13:36'),(10,0,'Skill Assessment Report','Training_Report','Skill Assessment Report',10,'Active',1,'2021-09-07 10:13:36'),(11,0,'Point History','Point_History','Point History',11,'Active',1,'2021-09-07 10:13:36'),(12,0,'Company Account','Company_Account','Company Account',12,'Active',7,'2021-09-07 10:13:36');
/*!40000 ALTER TABLE `permission_module` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Admin','Admin Role',1,'Active','Manager',1,1,'2021-06-14 07:07:42',0,'2021-06-14 07:07:42'),(2,'Manager','Manager Role',0,'Active','Manager',0,1,'2021-06-14 07:07:42',0,'2021-06-14 07:07:42'),(3,'Employee','Employee',0,'Active','Employee',0,1,'2021-06-14 07:07:42',0,'2021-06-14 07:07:42');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES (625,3,1,131,'2021-12-16 21:20:12','Active',NULL,NULL),(626,3,2,131,'2021-12-16 21:20:12','Active',NULL,NULL),(627,3,10,131,'2021-12-16 21:20:12','Active',NULL,NULL),(628,3,11,131,'2021-12-16 21:20:12','Active',NULL,NULL),(629,3,13,131,'2021-12-16 21:20:12','Active',NULL,NULL),(630,3,14,131,'2021-12-16 21:20:12','Active',NULL,NULL),(631,3,16,131,'2021-12-16 21:20:12','Active',NULL,NULL),(632,3,21,131,'2021-12-16 21:20:12','Active',NULL,NULL),(633,3,26,131,'2021-12-16 21:20:12','Active',NULL,NULL),(634,3,43,131,'2021-12-16 21:20:12','Active',NULL,NULL),(635,3,67,131,'2021-12-16 21:20:12','Active',NULL,NULL),(636,3,68,131,'2021-12-16 21:20:12','Active',NULL,NULL),(637,3,73,131,'2021-12-16 21:20:12','Active',NULL,NULL),(638,3,25,131,'2021-12-16 21:20:12','Active',NULL,NULL),(639,2,1,131,'2021-12-16 21:25:27','Active',NULL,NULL),(640,2,2,131,'2021-12-16 21:25:27','Active',NULL,NULL),(641,2,3,131,'2021-12-16 21:25:27','Active',NULL,NULL),(642,2,4,131,'2021-12-16 21:25:27','Active',NULL,NULL),(643,2,5,131,'2021-12-16 21:25:27','Active',NULL,NULL),(644,2,6,131,'2021-12-16 21:25:27','Active',NULL,NULL),(645,2,8,131,'2021-12-16 21:25:27','Active',NULL,NULL),(646,2,9,131,'2021-12-16 21:25:27','Active',NULL,NULL),(647,2,10,131,'2021-12-16 21:25:27','Active',NULL,NULL),(648,2,11,131,'2021-12-16 21:25:27','Active',NULL,NULL),(649,2,12,131,'2021-12-16 21:25:27','Active',NULL,NULL),(650,2,13,131,'2021-12-16 21:25:27','Active',NULL,NULL),(651,2,14,131,'2021-12-16 21:25:27','Active',NULL,NULL),(652,2,15,131,'2021-12-16 21:25:27','Active',NULL,NULL),(653,2,16,131,'2021-12-16 21:25:27','Active',NULL,NULL),(654,2,17,131,'2021-12-16 21:25:27','Active',NULL,NULL),(655,2,18,131,'2021-12-16 21:25:27','Active',NULL,NULL),(656,2,19,131,'2021-12-16 21:25:27','Active',NULL,NULL),(657,2,20,131,'2021-12-16 21:25:27','Active',NULL,NULL),(658,2,21,131,'2021-12-16 21:25:27','Active',NULL,NULL),(659,2,22,131,'2021-12-16 21:25:27','Active',NULL,NULL),(660,2,23,131,'2021-12-16 21:25:27','Active',NULL,NULL),(661,2,24,131,'2021-12-16 21:25:27','Active',NULL,NULL),(662,2,25,131,'2021-12-16 21:25:27','Active',NULL,NULL),(663,2,26,131,'2021-12-16 21:25:27','Active',NULL,NULL),(664,2,27,131,'2021-12-16 21:25:27','Active',NULL,NULL),(665,2,28,131,'2021-12-16 21:25:27','Active',NULL,NULL),(666,2,29,131,'2021-12-16 21:25:27','Active',NULL,NULL),(667,2,30,131,'2021-12-16 21:25:27','Active',NULL,NULL),(668,2,31,131,'2021-12-16 21:25:27','Active',NULL,NULL),(669,2,32,131,'2021-12-16 21:25:27','Active',NULL,NULL),(670,2,33,131,'2021-12-16 21:25:27','Active',NULL,NULL),(671,2,34,131,'2021-12-16 21:25:27','Active',NULL,NULL),(672,2,35,131,'2021-12-16 21:25:27','Active',NULL,NULL),(673,2,36,131,'2021-12-16 21:25:27','Active',NULL,NULL),(674,2,37,131,'2021-12-16 21:25:27','Active',NULL,NULL),(675,2,38,131,'2021-12-16 21:25:27','Active',NULL,NULL),(676,2,39,131,'2021-12-16 21:25:27','Active',NULL,NULL),(677,2,40,131,'2021-12-16 21:25:27','Active',NULL,NULL),(678,2,42,131,'2021-12-16 21:25:27','Active',NULL,NULL),(679,2,43,131,'2021-12-16 21:25:27','Active',NULL,NULL),(680,2,44,131,'2021-12-16 21:25:27','Active',NULL,NULL),(681,2,51,131,'2021-12-16 21:25:27','Active',NULL,NULL),(682,2,58,131,'2021-12-16 21:25:27','Active',NULL,NULL),(683,2,67,131,'2021-12-16 21:25:27','Active',NULL,NULL),(684,2,68,131,'2021-12-16 21:25:27','Active',NULL,NULL),(685,2,69,131,'2021-12-16 21:25:27','Active',NULL,NULL),(686,2,70,131,'2021-12-16 21:25:27','Active',NULL,NULL),(687,2,71,131,'2021-12-16 21:25:27','Active',NULL,NULL),(688,2,73,131,'2021-12-16 21:25:27','Active',NULL,NULL),(689,2,45,131,'2021-12-16 21:25:27','Active',NULL,NULL),(690,1,1,131,'2021-12-16 21:25:41','Active',NULL,NULL),(691,1,2,131,'2021-12-16 21:25:41','Active',NULL,NULL),(692,1,3,131,'2021-12-16 21:25:41','Active',NULL,NULL),(693,1,4,131,'2021-12-16 21:25:41','Active',NULL,NULL),(694,1,5,131,'2021-12-16 21:25:41','Active',NULL,NULL),(695,1,6,131,'2021-12-16 21:25:41','Active',NULL,NULL),(696,1,7,131,'2021-12-16 21:25:41','Active',NULL,NULL),(697,1,8,131,'2021-12-16 21:25:41','Active',NULL,NULL),(698,1,9,131,'2021-12-16 21:25:41','Active',NULL,NULL),(699,1,10,131,'2021-12-16 21:25:41','Active',NULL,NULL),(700,1,11,131,'2021-12-16 21:25:41','Active',NULL,NULL),(701,1,12,131,'2021-12-16 21:25:41','Active',NULL,NULL),(702,1,13,131,'2021-12-16 21:25:41','Active',NULL,NULL),(703,1,14,131,'2021-12-16 21:25:41','Active',NULL,NULL),(704,1,15,131,'2021-12-16 21:25:41','Active',NULL,NULL),(705,1,16,131,'2021-12-16 21:25:41','Active',NULL,NULL),(706,1,17,131,'2021-12-16 21:25:41','Active',NULL,NULL),(707,1,18,131,'2021-12-16 21:25:41','Active',NULL,NULL),(708,1,19,131,'2021-12-16 21:25:41','Active',NULL,NULL),(709,1,20,131,'2021-12-16 21:25:41','Active',NULL,NULL),(710,1,21,131,'2021-12-16 21:25:41','Active',NULL,NULL),(711,1,22,131,'2021-12-16 21:25:41','Active',NULL,NULL),(712,1,23,131,'2021-12-16 21:25:41','Active',NULL,NULL),(713,1,24,131,'2021-12-16 21:25:41','Active',NULL,NULL),(714,1,25,131,'2021-12-16 21:25:41','Active',NULL,NULL),(715,1,26,131,'2021-12-16 21:25:41','Active',NULL,NULL),(716,1,27,131,'2021-12-16 21:25:41','Active',NULL,NULL),(717,1,28,131,'2021-12-16 21:25:41','Active',NULL,NULL),(718,1,29,131,'2021-12-16 21:25:41','Active',NULL,NULL),(719,1,30,131,'2021-12-16 21:25:41','Active',NULL,NULL),(720,1,31,131,'2021-12-16 21:25:41','Active',NULL,NULL),(721,1,32,131,'2021-12-16 21:25:41','Active',NULL,NULL),(722,1,33,131,'2021-12-16 21:25:41','Active',NULL,NULL),(723,1,34,131,'2021-12-16 21:25:41','Active',NULL,NULL),(724,1,35,131,'2021-12-16 21:25:41','Active',NULL,NULL),(725,1,36,131,'2021-12-16 21:25:41','Active',NULL,NULL),(726,1,37,131,'2021-12-16 21:25:41','Active',NULL,NULL),(727,1,38,131,'2021-12-16 21:25:41','Active',NULL,NULL),(728,1,39,131,'2021-12-16 21:25:41','Active',NULL,NULL),(729,1,40,131,'2021-12-16 21:25:41','Active',NULL,NULL),(730,1,41,131,'2021-12-16 21:25:41','Active',NULL,NULL),(731,1,42,131,'2021-12-16 21:25:41','Active',NULL,NULL),(732,1,43,131,'2021-12-16 21:25:41','Active',NULL,NULL),(733,1,44,131,'2021-12-16 21:25:41','Active',NULL,NULL),(734,1,45,131,'2021-12-16 21:25:41','Active',NULL,NULL),(735,1,46,131,'2021-12-16 21:25:41','Active',NULL,NULL),(736,1,47,131,'2021-12-16 21:25:41','Active',NULL,NULL),(737,1,48,131,'2021-12-16 21:25:41','Active',NULL,NULL),(738,1,49,131,'2021-12-16 21:25:41','Active',NULL,NULL),(739,1,50,131,'2021-12-16 21:25:41','Active',NULL,NULL),(740,1,51,131,'2021-12-16 21:25:41','Active',NULL,NULL),(741,1,52,131,'2021-12-16 21:25:41','Active',NULL,NULL),(742,1,53,131,'2021-12-16 21:25:41','Active',NULL,NULL),(743,1,54,131,'2021-12-16 21:25:41','Active',NULL,NULL),(744,1,55,131,'2021-12-16 21:25:41','Active',NULL,NULL),(745,1,56,131,'2021-12-16 21:25:41','Active',NULL,NULL),(746,1,57,131,'2021-12-16 21:25:41','Active',NULL,NULL),(747,1,58,131,'2021-12-16 21:25:41','Active',NULL,NULL),(748,1,59,131,'2021-12-16 21:25:41','Active',NULL,NULL),(749,1,60,131,'2021-12-16 21:25:41','Active',NULL,NULL),(750,1,61,131,'2021-12-16 21:25:41','Active',NULL,NULL),(751,1,62,131,'2021-12-16 21:25:41','Active',NULL,NULL),(752,1,63,131,'2021-12-16 21:25:41','Active',NULL,NULL),(753,1,64,131,'2021-12-16 21:25:41','Active',NULL,NULL),(754,1,65,131,'2021-12-16 21:25:41','Active',NULL,NULL),(755,1,66,131,'2021-12-16 21:25:41','Active',NULL,NULL),(756,1,67,131,'2021-12-16 21:25:41','Active',NULL,NULL),(757,1,68,131,'2021-12-16 21:25:41','Active',NULL,NULL),(758,1,69,131,'2021-12-16 21:25:41','Active',NULL,NULL),(759,1,70,131,'2021-12-16 21:25:41','Active',NULL,NULL),(760,1,71,131,'2021-12-16 21:25:41','Active',NULL,NULL),(761,1,72,131,'2021-12-16 21:25:41','Active',NULL,NULL),(762,1,73,131,'2021-12-16 21:25:41','Active',NULL,NULL),(763,1,74,131,'2021-12-16 21:25:41','Active',NULL,NULL),(764,1,75,131,'2021-12-16 21:25:41','Active',NULL,NULL);

/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;



LOCK TABLES `task_type` WRITE;
/*!40000 ALTER TABLE `task_type` DISABLE KEYS */;
INSERT INTO `task_type` VALUES 
(1,'Add Certificate','Add Certificate','2021-08-05 13:36:00','Active',1,1,NULL,NULL),
(2,'Review Certificate','Review Certificate','2021-08-05 13:36:00','Active',1,1,NULL,NULL),
(3,'Administrative','Administrative','2021-08-05 13:36:00','Active',0,1,NULL,NULL),
(4,'General HR','General HR','2021-08-05 13:36:00','Active',0,1,NULL,NULL),
(5,'Maintenance/Facilities','Maintenance/Facilities','2021-08-05 13:36:00','Active',0,1,NULL,NULL),
(6,'Customer Service','Customer Service','2021-08-05 13:36:00','Active',0,1,NULL,NULL),
(7,'Other','Other','2021-08-05 13:36:00','Active',0,1,NULL,NULL);
/*!40000 ALTER TABLE `task_type` ENABLE KEYS */;
UNLOCK TABLES;


INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Multiple Choice', 'Multiple Choice', 'RadioButton', 'Active', '1', '2021-10-14 12:54:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Checkboxes', 'Checkboxes', 'Checkbox', 'Active', '1', '2021-10-14 12:55:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Number', 'Number', 'TextField', 'Active', '1', '2021-10-14 12:56:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Dynamic Entities', 'Dynamic Entities', 'DynamicEntry', 'Active', '1', '2021-10-14 12:57:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Short answer', 'Short answer', 'TextField', 'Active', '1', '2021-10-14 12:58:17.000000');

INSERT INTO `question_type` 
(`title`, `description`, `field_type`, `status`, `created_by`, `created_date`) 
VALUES ('Attachment', 'Attachment', 'FileAttachment', 'Active', '1', '2021-10-14 12:59:17.000000');

INSERT INTO `level` 
(`level_id`, `level`, `name`, `description`, `point_range_from`, `point_range_to`, `range`, `status`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
VALUES 
('1', '1', 'Level 1', 'Level 1', '0', '20', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('2', '2', 'Level 2', 'Level 2', '21', '40', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('3', '3', 'Level 3', 'Level 3', '41', '60', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('4', '4', 'Level 4', 'Level 4', '61', '80', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('5', '5', 'Level 5', 'Level 5', '81', '100', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('6', '6', 'Level 6', 'Level 6', '101', '140', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('7', '7', 'Level 7', 'Level 7', '141', '180', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('8', '8', 'Level 8', 'Level 8', '181', '220', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('9', '9', 'Level 9', 'Level 9', '221', '260', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36'),
('10', '10', 'Level 10', 'Level 10', '261', '300', '20', 'Active', '1', '2021-11-10 00:00:00', '1', '2021-11-10 08:16:36');

INSERT INTO `relation` (`relation_id`,`relation_name`,`relation_value`) 
VALUES (1,'relative','Relative'),(2,'spouse','Spouse'),(3,'friend','Friend'),(4,'other','Other');

INSERT INTO `note_type`
(`note_type_id`,
`name`,
`description`,
`weighted_tier_id`,
`impact_multiplier_id`,
`status`,
`is_default`,
`send_notification`,
`created_by`,
`created_date`)
VALUES
(1,
'General',
'generic notes added to profiles – will not impact score',
5,
2,
'Active',
1,
0,
1,
'2021-11-10 08:16:36'),
(2,
'Praise',
'recognition, shoutouts, written praise – impacts score positively',
2,
1,
'Active',
0,
0,
1,
'2021-11-10 08:16:36'),
(3,
'Feedback',
'constructive feedback, write-ups, warnings, etc. – negatively impacts score',
3,
3,
'Active',
0,
0,
1,
'2021-11-10 08:16:36');


INSERT INTO `interaction_factor`
(`interaction_factor_id`,
`name`,
`description`,
`weighted_tier_id`,
`status`,
`created_by`,
`created_date`)
VALUES
(1,
'Punctuality',
'Did this team member arrive to work on time?',
3,
'Active',
1,
'2021-11-10 08:16:36'),
(2,
'Engagement',
'Was this team member engaged in their work today?',
3,
'Active',
1,
'2021-11-10 08:16:36'),
(3,
'Customer Service',
'How did this team member do with customers today?',
3,
'Active',
1,
'2021-11-10 08:16:36'),
(4,
'Uniform',
'Is this team member wearing the correct uniform as is it tidy?',
3,
'Active',
1,
'2021-11-10 08:16:36');



LOCK TABLES `notification_template` WRITE;
/*!40000 ALTER TABLE `notification_template` DISABLE KEYS */;
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
VALUES('1','Create Password','Template for Creating Password','CREATE_PASSWORD','Email','Welcome Onboard - <<first_name>> <<last_name>>',
'\n<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Password Creation</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-create-password-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">We are excited to have you get started your journey with us. Kindly click on the below link to get onboarded with us.</p>
                    <a style="color:#d26934;" href="<<link>>">Password Creation link </a>
                    <p style="font-size: 15px"> If you need any assistance in the process, please email us at below mentioned email ID. </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0px 30px 20px 30px; background-color: #e6edf6;border-top:3px solid #ffffff;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table style="width:100%;">
                      <tr>
                        <td style="width:100%;text-align: center;padding-top: 15px;padding-bottom: 10px;font-size: 14px;">Get the latest Oneteam360 APP for your phone</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table style="width:100%;">
                      <tr>
                        <td style="width:50%;text-align: right;padding-right: 15px;"><a href=""><img src="https://ot360prod.blob.core.windows.net/master/email-template/app-icon-download-IOS.png"/></a></td>
                        <td style="width:50%;padding-left:15px;text-align: left;"><a href=""><img src="https://ot360prod.blob.core.windows.net/master/email-template/app-icon-download-Android.png"/></a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_email>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>',
'Active','','1','2021-06-10 16:56:13',NULL,NULL);
/*!40000 ALTER TABLE `notification_template` ENABLE KEYS */;
UNLOCK TABLES;


INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Modified', 'Template when task is modified', 'TASK_MODIFICATION', 'InApp', 'Task Modified', '<<task_name>> has been modified by <<modified_employee_name>>. Click to view more!', 'Active', '1', '2021-06-10 16:56:13');


INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Deleted', 'Template when task is deleted', 'TASK_DELETION', 'InApp', 'Task Deleted/Removed', '<<task_name>> has been removed by <<removed_employee_name>>.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Modified', 'Template when task is modified', 'TASK_MODIFICATION', 'Mobile', 'Task Modified', '<<task_name>> has been modified by <<modified_employee_name>>. Click to view more!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Deleted', 'Template when task is deleted', 'TASK_DELETION', 'Mobile', 'Task Deleted/Removed', '<<task_name>> has been removed by <<removed_employee_name>>.', 'Active', '1', '2021-06-10 16:56:13');



INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Competition Started', 'Template when competition is started', 'COMPETITION_START_TODAY', 'Email', 'OneTeam360 - Competition about to start', '<!doctype html><html lang=\"en-US\"><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel=\"stylesheet\"><title>Email Template</title><meta name=\"description\" content=\"Notifications Email Template\"><style type=\"text/css\">html,body {font-family: \"Lato\", sans-serif;color: #34444c;}a:hover {text-decoration: none !important;}:focus {outline: none;border: 0;}</style></head><body marginheight=\"0\" topmargin=\"0\" marginwidth=\"0\" style=\"margin: 0px; background-color: #fff;\" bgcolor=\"#fff\"    leftmargin=\"0\"><table style=\"background-color: #fff; max-width:620px; margin:0 auto;\" width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\"> <tr><td style=\"max-width: 620px; width: 620px;\"><table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#ffffff; text-align:left;\"><tr><td colspan=\"2\" class=\"container\" style=\"font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;\"><img src=\"https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-competition-bg.png\" alt=\"\" style=\"display: block;\"></td></tr><tr><td style=\"padding:30px; background-color: #d7e4f3;\"><table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\"><tr><td><h4 style=\"margin-bottom:20px; margin-top:0px; text-transform:capitalize\">Hello <strong><<first_name>> <<last_name>>,</strong></h4><p style=\"margin-bottom:20px;font-size:15px\"> Your competition <<competition_name>> starts today, check your competition dashboard for more details.</p></td></tr><tr><td><p style=\"margin-bottom: 30px;\">Please login to <strong            style=\"color:#d26934;\">OneTeam360</strong><strong>Customer Portal</strong> by clicking on the link. <a href=\"<<customer_portal_link>>\" target=\"_blank\"><<customer_portal_link>></a> to view more details.</p></td></tr></table></td></tr></table></td></tr><tr> <td style=\"vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;\"><p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\">Thank you,</p><p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\"><<account_name>></p><img src=\"https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png\"  alt=\"\"></td></tr></table></body></html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Competition Started', 'Template when competition is started', 'COMPETITION_START_TODAY', 'InApp', '<<competition_title>> about to start', ' Check competition dashboard for details. Good luck!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Competition Started', 'Template when competition is started', 'COMPETITION_START_TODAY', 'Mobile', '<<competition_title>> about to start', ' Check competition dashboard for details. Good luck!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ('Certificate Approved', 'Template when certificate is approved', 'CERTIFICATE_APPROVED', 'Mobile', 'Certificate Approved', ' Your Certificate has been approved by <<employee_name>>. Click here to view details', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Certificate Approved', 'Template when certificate is approved', 'CERTIFICATE_APPROVED', 'InApp', 'Certificate Approved', ' Your Certificate has been approved by <<employee_name>>. Click here to view details', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Certificate Rejected', 'Template when certificate is rejected', 'CERTIFICATE_REJECTED', 'Mobile', 'Certificate Rejected', ' Your Certificate has been rejected by <<employee_name>>. Click here to view details', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Certificate Rejected', 'Template when certificate is rejected', 'CERTIFICATE_REJECTED', 'InApp', 'Certificate Rejected', ' Your Certificate has been rejected by <<employee_name>>. Click here to view details', 'Active', '1', '2021-06-10 16:56:13');



INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Add Note', 'Template when note is added', 'ADD_NOTE', 'InApp', 'New Note Added', 'A note is added by <<employee_name>> on your profile. Click here to view details!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Task Overdue Reminder', 'Template when task is overdue, notfication will be trigger', 'TASK_OVERDUE_REMINDER', 'InApp', 'A task needs your attention!', 'Your task is getting due tomorrow! Click here to complete task.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Certificate about to expire', 'Template when certificate about to expire', 'CRT_ABOUT_TO_EXPIRE', 'InApp', 'A certificate needs your attention!', ' Your certificate is going to expire in <<timeline>>! Click here to view it', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Employee level Update', 'Template when employee level is updated', 'EMPLOYEE_LEVEL_UPDATE', 'InApp', 'One level up!', 'Your level just advanced to <<new_level>>. Click here to view your current points & new level.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Competition Create', 'Template when competition is created', 'COMPETITION_START', 'InApp', 'New Competition Created!', 'Who will win? Click here to view details.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ( 'Competition End', 'Template when competition is end', 'COMPETITION_END', 'InApp', 'Competition Ending Today! Hurry Up', 'It’s the last day of your competition - <<competition_name>>. Give it your best.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `permission_module` (`parent_permission_module_id`, `name`, `code`, `description`, `sequence`, `status`, `created_by`, `created_date`) VALUES ('0', 'Configurations', 'Configurations', 'Configurations', '13', 'Active', '1', '2021-09-07 10:13:36');

DROP TABLE IF EXISTS `announcement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement` (
  `announcement_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `email_noti` tinyint(4) NOT NULL,
  `push_noti` tinyint(4) NOT NULL,
  `sms_noti` tinyint(4) NOT NULL,
  `announcement_status` enum('Active','Scheduled','Expired','Inactive') DEFAULT 'Active',
  `announcement_type` enum('custom','birthday','anniversary','abroad') DEFAULT 'custom',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `is_default` TINYINT NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated_by` int(10) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`announcement_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

INSERT INTO `announcement` (`name`, `description`, `email_noti`, `push_noti`, `sms_noti`, `announcement_status`,
 `announcement_type`,`is_default`, `status`, `created_by`, `created_date`) 
VALUES ('Birthdays this Week', 'This is the Birthday Announcement Description', '1', '1', '1', 'Active',
 'birthday', '1','Active', '1', '2022-04-06 06:11:06');
 
INSERT INTO `announcement` (`name`, `description`, `email_noti`, `push_noti`, `sms_noti`, `announcement_status`,
 `announcement_type`,`is_default`, `status`, `created_by`, `created_date`) 
 VALUES ('Work Anniversaries', 'This is the Work Anniversary Description', '1', '1', '1', 'Active',
 'anniversary', '1','Active', '1', '2022-04-06 06:11:06');

INSERT INTO `announcement` (`name`, `description`, `email_noti`, `push_noti`, `sms_noti`, `announcement_status`,
 `announcement_type`,`is_default`, `status`, `created_by`, `created_date`) 
VALUES ('Welcome to the Team!', 'This is the Onboarding Announcement', '1', '1', '1', 'Active',
 'abroad', '1', 'Active', '1', '2022-04-06 06:11:06');

DROP TABLE IF EXISTS `announcement_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_employee` (
  `announcement_employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) unsigned DEFAULT NULL,
  `employee_profile_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_employee_id`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `announcements_id` (`announcement_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `announcement_employee_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`announcement_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_employee_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_employee_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `announcement_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_job_type` (
  `announcement_job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) unsigned NOT NULL,
  `job_type_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_job_type_id`),
  KEY `created_by` (`created_by`),
  KEY `announcement_id` (`announcement_id`),
  KEY `job_type_id` (`job_type_id`),
  CONSTRAINT `announcement_job_type_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_job_type_ibfk_4` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`announcement_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_job_type_ibfk_5` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `announcement_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_location` (
  `announcement_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) unsigned NOT NULL,
  `location_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`announcement_location_id`),
  KEY `created_by` (`created_by`),
  KEY `announcement_id` (`announcement_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `announcement_location_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_location_ibfk_4` FOREIGN KEY (`announcement_id`) REFERENCES `announcement` (`announcement_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `announcement_location_ibfk_5` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

CREATE TABLE `announcement_status_enum` (
  `announcement_status_enum_id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_status` enum('Active','Scheduled','Inactive','Expired') NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`announcement_status_enum_id`),
  UNIQUE KEY `announcement_status_enum_id_UNIQUE` (`announcement_status_enum_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `announcement_status_enum` */

insert  into `announcement_status_enum`(`announcement_status_enum_id`,`announcement_status`,`name`,`sort_order`) values 
(1,'Active','Active',1),
(2,'Scheduled','Scheduled',2),
(3,'Inactive','Inactive',3),
(4,'Expired','Expired',4);

ALTER TABLE `task`
ADD COLUMN `is_group_task` TINYINT(1) DEFAULT 0 NULL AFTER `is_private`;

INSERT INTO `task_type` ( `name`, `description`, `created_date`, `status`, `is_default`, `created_by`) 
VALUES ( 'Retest Skill', 'Retest Skill', '2022-04-19 16:07:43', 'Active', 1, 1);

ALTER TABLE `task`   
  ADD COLUMN `entity_type` VARCHAR(25) NULL AFTER `is_group_task`,
  ADD COLUMN `entity_id` INT(11) NULL AFTER `entity_type`;

ALTER TABLE `certificate_type` 
ADD COLUMN `auto_assign` TINYINT NULL DEFAULT 0 AFTER `description`;

ALTER TABLE notification_template CONVERT TO CHARACTER SET utf8;
ALTER TABLE notification_queue CONVERT TO CHARACTER SET utf8;

ALTER TABLE `employee_certificate` 
ADD COLUMN `added_by_auto` TINYINT NULL DEFAULT 0 AFTER `added_by`;

ALTER TABLE `employee_profile`   
	ADD COLUMN `team_member_id` VARCHAR(30) NULL AFTER `last_updated_date`;

ALTER TABLE `bulk_import_temp`   
	ADD COLUMN `team_member_id` VARCHAR(250) NULL AFTER `emergency_contact_zip`;
  
DROP TABLE IF EXISTS `dynamic_question`;
CREATE TABLE IF NOT EXISTS `dynamic_question` (
`dynamic_question_id` bigint NOT NULL AUTO_INCREMENT,
`question` text NOT NULL,
`required` tinyint(1) DEFAULT '0',
`answer_format` enum('text','multiple_choice') DEFAULT 'text',
`status` enum('Active','Inactive') DEFAULT 'Active',
`sequence` int DEFAULT NULL,
`created_by` int DEFAULT NULL,
`created_date` datetime DEFAULT NULL,
`last_updated_by` int DEFAULT NULL,
`last_updated_date` datetime DEFAULT NULL,
PRIMARY KEY (`dynamic_question_id`),
KEY `created_by` (`created_by`),
KEY `last_updated_by` (`last_updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `dynamic_question`
ADD CONSTRAINT `dynamic_question_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `dynamic_question_ibfk_2` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

DROP TABLE IF EXISTS `dynamic_question_option`;
CREATE TABLE IF NOT EXISTS `dynamic_question_option` (
`dynamic_question_option_id` bigint NOT NULL AUTO_INCREMENT,
`dynamic_question_id` bigint DEFAULT NULL,
`option_value` text,
`sequence` int DEFAULT NULL,
`created_by` int DEFAULT NULL,
`created_date` datetime DEFAULT NULL,
`last_updated_by` int DEFAULT NULL,
`last_updated_date` datetime DEFAULT NULL,
PRIMARY KEY (`dynamic_question_option_id`),
KEY `dynamic_question_id` (`dynamic_question_id`),
KEY `created_by` (`created_by`),
KEY `last_updated_by` (`last_updated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `dynamic_question_option`
ADD CONSTRAINT `dynamic_question_option_ibfk_1` FOREIGN KEY (`dynamic_question_id`) REFERENCES `dynamic_question` (`dynamic_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `dynamic_question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `dynamic_question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*Table structure for table `employee_checkin` */
DROP TABLE IF EXISTS `employee_checkin`;
CREATE TABLE `employee_checkin` (
  `employee_checkin_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `request_status` enum('Pending','Approved','Rejected','CheckedOut') NOT NULL DEFAULT 'Pending',
  `reviewer_status` varchar(15) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `checkin_datetime` datetime DEFAULT NULL,
  `checkout_datetime` datetime DEFAULT NULL,
  `reviewed_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_checkin_id`),
  KEY `employee_checkin_ibfk_1` (`employee_profile_id`),
  KEY `employee_checkin_ibfk_2` (`location_id`),
  KEY `employee_checkin_ibfk_3` (`reviewed_by`),
  CONSTRAINT `employee_checkin_ibfk_1` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_checkin_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_checkin_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*Table structure for table `skillquiz_question` */

DROP TABLE IF EXISTS `skillquiz_question`;
CREATE TABLE `skillquiz_question` (
  `skillquiz_question_id` bigint(11) NOT NULL AUTO_INCREMENT,
  `skill_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `is_required` tinyint(1) DEFAULT '0',
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `sequence` int(11) NOT NULL,
  PRIMARY KEY (`skillquiz_question_id`),
  KEY `skill_quiz_ibfk_1` (`skill_id`),
  KEY `skill_quiz_ibfk_2` (`created_by`),
  KEY `skill_quiz_ibfk_3` (`last_updated_by`),
  CONSTRAINT `skillquiz_question_ibfk_1` FOREIGN KEY (`skill_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `skillquiz_question_option` */

DROP TABLE IF EXISTS `skillquiz_question_option`;
CREATE TABLE `skillquiz_question_option` (
  `skillquiz_question_option_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `skillquiz_question_id` bigint(20) NOT NULL,
  `option` tinytext NOT NULL,
  `sequence` int(11) DEFAULT NULL,
  `isCorrectAnswer` tinyint(1) DEFAULT '0',
  `description` text,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`skillquiz_question_option_id`),
  KEY `skill_quiz_option_ibfk_1` (`skillquiz_question_id`),
  KEY `skill_quiz_option_ibfk_2` (`created_by`),
  KEY `skill_quiz_option_ibfk_3` (`last_updated_by`),
  CONSTRAINT `skillquiz_question_option_ibfk_1` FOREIGN KEY (`skillquiz_question_id`) REFERENCES `skillquiz_question` (`skillquiz_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_option_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_question_option_ibfk_3` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `skillquiz_submission` */

DROP TABLE IF EXISTS `skillquiz_submission`;
CREATE TABLE `skillquiz_submission` (
  `skillquiz_submission_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `training_employee_id` int(11) DEFAULT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `skillquiz_question_id` bigint(20) NOT NULL,
  `submitted_option_id` bigint(20) NOT NULL,
  `submitted_option_value` text NOT NULL,
  `submission_date` datetime NOT NULL,
  PRIMARY KEY (`skillquiz_submission_id`),
  KEY `skillquiz_submission_ibfk_1` (`skillquiz_question_id`),
  KEY `skillquiz_submission_ibfk_2` (`employee_profile_id`),
  KEY `skillquiz_submission_ibfk_3` (`task_id`),
  KEY `skillquiz_submission_ibfk_4` (`skill_id`),
  KEY `training_employee_id` (`training_employee_id`),
  CONSTRAINT `skillquiz_submission_ibfk_1` FOREIGN KEY (`skillquiz_question_id`) REFERENCES `skillquiz_question` (`skillquiz_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_3` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_4` FOREIGN KEY (`skill_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `skillquiz_submission_ibfk_5` FOREIGN KEY (`training_employee_id`) REFERENCES `training_employee` (`training_employee_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `employee_dynamic_question_answer`;
CREATE TABLE IF NOT EXISTS `employee_dynamic_question_answer` (
  `employee_question_id` int NOT NULL AUTO_INCREMENT,
  `dynamic_question_id` bigint NOT NULL,
  `employee_profile_id` int NOT NULL,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `dynamic_question_option_id` bigint DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_date` datetime NOT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_question_id`),
  KEY `employee_dynamic_question_submission_id` (`employee_question_id`),
  KEY `dynamic_question_id` (`dynamic_question_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `employee_profile_id` (`employee_profile_id`),
  KEY `dynamic_question_option_id` (`dynamic_question_option_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `employee_dynamic_question_answer`
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_1` FOREIGN KEY (`dynamic_question_id`) REFERENCES `dynamic_question` (`dynamic_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_2` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_dynamic_question_answer_ibfk_5` FOREIGN KEY (`dynamic_question_option_id`) REFERENCES `dynamic_question_option` (`dynamic_question_option_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

CREATE TABLE `employee_filter` (
  `employee_filter_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `name` tinyint(4) DEFAULT NULL,
  `location` tinyint(4) DEFAULT NULL,
  `phone` tinyint(4) DEFAULT NULL,
  `job_type` tinyint(4) DEFAULT NULL,
  `total_points` tinyint(4) DEFAULT NULL,
  `level` tinyint(4) DEFAULT NULL,
  `id` tinyint(4) DEFAULT NULL,
  `contact_name` tinyint(4) DEFAULT NULL,
  `relation` tinyint(4) DEFAULT NULL,
  `emergency_phone` tinyint(4) DEFAULT NULL,
  `other_details` text,
  PRIMARY KEY (`employee_filter_id`),
  KEY `empprof_filter_idx` (`employee_profile_id`),
  CONSTRAINT `empprof_filter` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `task`   
  ADD COLUMN `training_employee_id` INT(11) NULL AFTER `entity_id`, 
  ADD INDEX (`training_employee_id`),
  ADD FOREIGN KEY (`training_employee_id`) REFERENCES `training_employee`(`training_employee_id`) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `employee_checkin`   
  CHANGE `request_status` `request_status` ENUM('Pending','Approved','Rejected','CheckedOut','AutoRejected') CHARSET utf8mb4 DEFAULT 'Pending'  NOT NULL;
  
CREATE TABLE `checkin_status`(  
  `checkin_status_id` INT(10) NOT NULL AUTO_INCREMENT,
  `checkin_status` ENUM('Approved','Rejected'),
  `weighted_tier_id` INT(11),
  `impact_multiplier_id` INT(11) NOT NULL,
  PRIMARY KEY (`checkin_status_id`, `impact_multiplier_id`),
  INDEX (`weighted_tier_id`, `impact_multiplier_id`),
  INDEX (`impact_multiplier_id`),
  FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier`(`impact_multiplier_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=INNODB;

insert into `checkin_status` (`checkin_status_id`, `checkin_status`, `weighted_tier_id`, `impact_multiplier_id`) values('1','Approved','4','4');
insert into `checkin_status` (`checkin_status_id`, `checkin_status`, `weighted_tier_id`, `impact_multiplier_id`) values('2','Rejected','4','2');



ALTER TABLE `announcement` CHANGE `description` `description` LONGTEXT NULL;

ALTER TABLE `note_type` 
ADD COLUMN `notify_management_user` TINYINT NULL DEFAULT 0 AFTER `send_notification`;

INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Announcement', 'ANNOUNCEMENT_TRIGGER', 'Croj job for announcement');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('CheckIn Request', 'CHECKIN_REQUEST', 'Cron job for Check In request');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Monthly Expire Certificates', 'MONTHLY_CERTIFICATE_EXPIRE', 'Cron job for send monthly expired and about to expire certificate');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('CheckOut Request', 'CHECKOUT', 'Cron job for Check-out request');
INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Weekly Feedback Report', 'WEEKLY_FEEDBACK_REPORT', 'Cron job for send weekly feedback report');

INSERT INTO `permission_module` (`parent_permission_module_id`, `name`, `code`, `description`, `sequence`, `status`, `created_by`, `created_date`) 
VALUES ('0', 'Announcements', 'Announcements', 'Announcements', '14', 'Active', '1', '2021-09-07 10:13:36');

INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'View Configured announcement List', 'View_Configured_Announcement', 'Allows user to view Configure button available on announcements sidebar', '1', 'Active');
INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'Create Announcement', 'Create_Announcement', 'Allows user to create announcement', '2', 'Active');
INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'Edit Announcement', 'Edit_Announcement', 'Allows user to edit announcement', '3', 'Active');
INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('14', '0', 'Inactivate Announcement', 'Inactive_Announcement', 'Allows user to inactivate announcement', '4', 'Active');

INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES (13,0,'Impersonate Team Members','Impersonate_Employee','Allows user to login to other team member profile',2,'Active');
INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES (1,0,"Edit Team Member ID","Edit_Team_Member_ID","Allows user to edit team member ID if he has 'Edit Information' permission",9,"Active");
INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES ('7','0',"Profile Details Management","Dynamic_Questions_Management","Allows user to operate profile details management if s/he has view system management permission",'11',"Active");
INSERT INTO `permission`(`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`) 
VALUES ('2','0',"Edit Profile Details","Edit_Dynamic_Questions","Allows user to edit profile detail if he has Edit Information permission",'22',"Active");

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Certificate Report',
        'Certificate_Report',
        'Certificate Report',
        '10',
        'Active',
        '1',
        '2022-06-07 10:13:36'
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '15',
        '0',
        "View Certificate Report",
        "View_Certificate_Report",
        "Allows user to view certificate report menu option within the system.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '15',
        '84',
        "Export Certificate Report",
        "Export_Certificate_Report",
        "Allows user to export excel if he has ‘View Certificate Report’ permission.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '15',
        '0',
        "Receive Certificate Report Digest",
        "Receive_Certificate_Report_Digest",
        "Allows the user to receive certificate report digest on monthly basis over email.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '1',
        '0',
        "Approve/Deny Check-in",
        "Review_Check_in",
        "Allow user to approve/deny check-in of team members.",
        '10',
        "Active"
    );


INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'Email', 'New Announcement', '<!doctype html>
 <html lang="en-US">
 
 <head>
   <meta name="viewport" content="width=device-width, initial-scale=1">
 
   <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
   <title>Email Template</title>
   <meta name="description" content="Notifications Email Template">
   <style type="text/css">
    html, body{
          font-family: "Lato", sans-serif;
          color: #34444c;
        }
     a:hover {text-decoration: none !important;}
     :focus {outline: none;border: 0;}
   </style>
 </head>
 
 <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
   <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
     <tr>
       <td style="text-align:center; max-width: 620px; width: 620px;">
         <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">New Announcement</h1>
       </td>
     </tr>
     
     <tr>
       <td style="max-width: 620px; width: 620px;">
         <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
           <tr>
       <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
         <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
       </td>
     </tr>
           <tr>
             <td style="padding:30px; background-color: #d7e4f3;">
               <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                 <tr>
                   <td>
                     <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                     <p style="margin-bottom:20px;font-size:15px"><<announcement_title>></p>
                   </td>
                 </tr>
                 <tr>
                   <td>
                     <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                       <tr>
                         <!-- <td align="center" colspan="2">
                             <a href="<<customer_portal_link>>" target="_blank" style="background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;">View Details</a>
                         </td> -->
                         <td colspan="2">
                           <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                             <tr>
                               <td style="width: 30%;">&nbsp;</td>
                                 <td style="border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                     <a href="<<customer_portal_link>>" target="_blank">
                                         <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                     </a>
                                 </td>
                                 <td style="width: 30%;">&nbsp;</td>
                             </tr>
                           </table>
                         </td>
                       </tr>
                     </table>
                   </td>
                 </tr>
               </table>
             </td>
           </tr>
         </table>
       </td>
     </tr>
     <tr>
       <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
         <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
         <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
         <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
       </td>
     </tr>
   </table>
 </body>
 
 </html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'Mobile', 'New Announcement', '<<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'InApp', 'New Announcement', '<<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Custom Announcement', 'Template when custom announcement is triggered', 'CUSTOM_ANNOUNCEMENT', 'SMS', '', 'OneTeam360 Announcement - <<announcement_title>>', 'Active', '1', '2021-06-10 16:56:13');

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','Email','Group Task Completed','\n<!doctype html>\n<html lang=\"en-US\">\n\n<head>\n <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\n <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel=\"stylesheet\">\n <title>Email Template</title>\n <meta name=\"description\" content=\"Notifications Email Template\">\n <style type=\"text/css\">\n html, body{\n font-family: \"Lato\", sans-serif;\n color: #34444c;\n }\n a:hover {text-decoration: none !important;}\n :focus {outline: none;border: 0;}\n </style>\n</head>\n\n<body marginheight=\"0\" topmargin=\"0\" marginwidth=\"0\" style=\"margin: 0px; background-color: #fff;\" bgcolor=\"#fff\" leftmargin=\"0\">\n <table style=\"background-color: #fff; max-width:620px; margin:0 auto;\" width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td style=\"text-align:center; max-width: 620px; width: 620px;\">\n <h1 style=\"margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;\">Group Task Completed</h1>\n </td>\n </tr>\n \n <tr>\n <td style=\"max-width: 620px; width: 620px;\">\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\"style=\"background:#ffffff; text-align:left;\">\n <tr>\n <td colspan=\"2\" class=\"container\" style=\"font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;\">\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-task-bg.png\" alt=\"\" style=\"display: block;\">\n </td>\n </tr>\n <tr>\n <td style=\"padding:30px; background-color: #d7e4f3;\">\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td>\n <h4 style=\"margin-bottom:20px; margin-top:0px; text-transform:capitalize\">Hello <strong><<first_name>> <<last_name>>,</strong></h4>\n <p style=\"margin-bottom:20px;font-size:15px\"><strong><<employee_name>></strong> has marked the task as completed on <strong><<date_time_of_task_competition>></strong>. Below are the details regarding the task.</p>\n </td>\n </tr>\n <tr>\n <td>\n <table width=\"100%\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\">\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;\"><strong>Title:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; vertical-align: top;\"><<task_title>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Description:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<task_description>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Start Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<start_date>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>End Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<end_date>></td>\n </tr>\n <tr>\n <td style=\"padding: 10px 10px 10px 0px; vertical-align: top;\"><strong>Completion Date:</strong></td>\n <td style=\"padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;\"><<completion_date>></td>\n </tr>\n <tr>\n <td colspan=\"2\">\n <p style=\"margin-bottom: 30px;\">Please login to <strong style=\"color:#d26934;\">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p> \n </td>\n </tr>\n <tr>\n <!-- <td align=\"center\" colspan=\"2\">\n <a href=\"<<customer_portal_link>>\" target=\"_blank\" style=\"background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;\">View Details</a>\n </td> -->\n <td colspan=\"2\">\n <table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin: 0 auto;\">\n <tr>\n <td style=\"width: 30%;\">&nbsp;</td>\n <td style=\"border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;\" align=\"center\">\n <a href=\"<<customer_portal_link>>\" target=\"_blank\">\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png\" alt=\"\"> \n </a>\n </td>\n <td style=\"width: 30%;\">&nbsp;</td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n </table>\n </td>\n </tr>\n <tr>\n <td style=\"vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;\">\n <p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\">Thank you,</p>\n <p style=\"margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;\"><<account_name>></p>\n <img src=\"https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png\" alt=\"\">\n </td>\n </tr>\n </table>\n</body>\n\n</html>','Active','','1','2021-06-10 16:56:13',NULL,NULL);

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','Mobile','Group Task Completed','<<employee_name>> completed a task on <<date_time_of_task_competition>>. Click here for details!','Active','','1','2021-06-10 16:56:13',NULL,NULL);

insert into `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `default_recipeints`, `created_by`, `created_date`, `last_updated_by`, `last_updated_date`) 
values('Group Task Completed','Template when group task is completed','GROUP_TASK_COMPLETED','InApp','Group Task Completed','<<employee_name>> completed a task on <<date_time_of_task_competition>>. Click here for details!','Active',NULL,'1','2021-06-10 16:56:13',NULL,NULL);

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
    <style type="text/css">
        html,
        body {
            font-family: "Lato", sans-serif;
            color: #34444c;
        }

        a:hover {
            text-decoration: none !important;
        }

        :focus {
            outline: none;
            border: 0;
        }
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">You have been assigned the below
                                            certificates. Please navigate to the certification section on your profile to add them.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>
</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
    <style type="text/css">
        html,
        body {
            font-family: "Lato", sans-serif;
            color: #34444c;
        }

        a:hover {
            text-decoration: none !important;
        }

        :focus {
            outline: none;
            border: 0;
        }
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">The below certificates are associated with your new job type. Please navigate to the certification section on your profile to add them.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>
</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Email', 'Birthdays This Week', 
'<html lang="en-US">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link
    href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap
    rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template" />
    <style type="text/css">
      html,
      body {
        font-family: "Lato", sans-serif;
        color: #34444c;
      }

      a:hover {
        text-decoration: none !important;
      }

      :focus {
        outline: none;
        border: 0;
      }
    </style>
  </head>

  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="margin: 0px; background-color: #fff"
    bgcolor="#fff"
    leftmargin="0"
  >
    <table
      style="background-color: #fff; max-width: 620px; margin: 0 auto"
      width="100%"
      border="0"
      align="center"
      cellpadding="0"
      cellspacing="0"
    >
     <tr>
        <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 15px;">
          <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
          margin-bottom: 0;">Birthdays This Week</h1>
        </td>
      </tr>
      <tr>
        <td style="max-width: 620px; width: 620px">
          <table
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
            style="background: #ffffff; text-align: left"
          >
            <tr>
              <td
                colspan="2"
                class="container"
                style="
                  font-size: 15px;
                  vertical-align: bottom;
                  display: block;
                  margin: 0 auto;
                  max-width: 620px;
                  width: 620px;
                "
              >
                <img src="https://ot360dev.blob.core.windows.net/master/email-template/header.png" alt="" style="display: block" />
              </td>
            </tr>
            <tr>
                <td style="text-align:center; max-width: 620px; width: 620px;background-color: #d7e4f3;">
                  <h1 style="margin-top: 10px; text-align: center; font-weight: 900; font-size: 22px;margin-bottom: 0;">Time To Celebrate!</h1>
                </td>
              </tr>
            <tr>
            <tr>
              <td style="padding: 30px; background-color: #d7e4f3">
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td style="line-height: 30px; display: flex; align-items: center;justify-content: center; flex-flow: wrap;gap: 5px;">
                      <<body>>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: #d7e4f3;
                    max-width: 620px;
                    margin: 0 auto;
                  "
                >
                  <tr>
                    <td colspan="2" style="padding-bottom: 20px">
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="margin: 0 auto"
                      >
                        <tr>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                          <td
                            style="
                              border-radius: 2px;
                              text-align: center;
                              width: 40%;
                              height: 48px;
                              width: 208px;
                              padding-top: 20px;padding-bottom: 20px;
                            "
                            align="center"
                          >
                            <a href="<<customer_portal_link>>" target="_blank">
                              <img
                                src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png"
                                alt=""
                              />
                            </a>
                          </td>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                        </tr>
                         <tr>
                          <td style="width: 30%">&nbsp;</td>
                          <td style="width: 30%">&nbsp;</td>
                          <td
                            style="
                              width: 30%;
                              text-align: right;
                              padding-right: 20px;
                            "
                          >
                            <img src="https://ot360dev.blob.core.windows.net/master/email-template/birthday_img.png" alt="" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td
          style="
            vertical-align: top;
            padding-bottom: 10px;
            padding-top: 10px;
            font-size: 15px;
            text-align: left;
          "
        >
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            Thank you,
          </p>
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            <<account_name>>
          </p>
          <img
            src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
            alt=""
          />
        </td>
      </tr>
    </table>
  </body>
</html>', 'Active', '1', '2021-06-10 16:56:13');


INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Mobile', 'Birthdays This Week', '<<body>>','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'InApp', 'Birthdays This Week', '<<body>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'SMS', 'Birthdays This Week', '<<body>>. View Details <<customer_portal_link>>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Email', 'Work Anniversaries This Week', 
'<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 20px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">WORK ANNIVERSARIES THIS WEEK</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360dev.blob.core.windows.net/master/email-template/MicrosoftTeams-image.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin-top: 0; text-align: center; font-weight: 700; font-size: 20px;margin-bottom: 0;">Congratulations!</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 30px; background-color: #d7e4f3;text-align: center;">
              <table  width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <<body>>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0px 30px 20px 30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tbody>
                  <tr>
                    <td style="width:100%;text-align: center;padding-top: 30px;padding-bottom: 10px;font-size: 14px;">
                      <a href="<<customer_portal_link>>" target="_blank">
                        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                    </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Mobile', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.','Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'InApp', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'SMS', 'Work Anniversaries This Week', 'Congratulate <<body>>. Wish them on this occasion.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Email', 'Welcome to the Team – <<employee_name>>', 
'<html lang="en-US">
  
  <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
  
      <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
      <title>Email Template</title>
      <meta name="description" content="Notifications Email Template">
      <style type="text/css">
          html,
          body {
              font-family: "Lato", sans-serif;
              color: #34444c;
          }
  
          a:hover {
              text-decoration: none !important;
          }
  
          :focus {
              outline: none;
              border: 0;
          }
      </style>
  </head>
  
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
      leftmargin="0">
      <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
          cellpadding="0" cellspacing="0">
          <tr>
             <td style="text-align:center; max-width: 620px; width: 620px;">
               <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
               margin-bottom: 0;">Welcome to the Team</h1>
             </td>
           </tr>
          <tr>
              <td style="max-width: 620px; width: 620px;">
                  <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                      style="background:#ffffff; text-align:left;">
                      <tr>
                          <td colspan="2" class="container"
                              style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                              <img src="https://ot360dev.blob.core.windows.net/master/email-template/common-header.png"
                                  alt="" style="display: block;">
                          </td>
                      </tr>
                      
                      <tr>
                          <td style="padding:30px; background-color: #d7e4f3;">
                              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                  <tr>
                         <td style="padding:30px; background-color: #d7e4f3;">
                             <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                 <tr>
                                     <td>
                                         <p> Reach out and give our new team member a warm welcome! </p>
                                     </td>
                                 </tr>
                                 <tr>
                                     <td>
                                         <p>Name : <<employee_name>>, <<employee_email>></p>
                                         <p>Location : <<location>></p>
                                     </td>
                                 </tr>
                             </table>
                         </td>
                     </tr>
                              </table>
                          </td>
                      </tr>
                      <tr>
                        <td>
                         <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="background-color: #d7e4f3; max-width:620px; margin:0 auto;">
                           <tr>
                             <td colspan="2" style="padding-bottom:20px;">
                               <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                 <tr>
                                   <td style="width: 30%;padding-bottom: 20px;padding-top: 20px;">&nbsp;</td>
                                     <td style="padding-bottom: 20px;padding-top: 20px;border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                         <a href="<<customer_portal_link>>" target="_blank">
                                             <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                         </a>
                                     </td>
                                     <td style="width: 30%;padding-bottom: 20px;padding-top: 20px;">&nbsp;</td>
                                 </tr>
                               </table>
                             </td>
                           </tr>
                         </table>
                        </td>
                      </tr>
                      
  
                  </table>
              </td>
          </tr>
          <tr>
              <td
                  style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                  <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                  <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                      <<account_name>>
                  </p>
                  <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                      alt="">
              </td>
          </tr>
      </table>
  </body>
  
  </html>', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Mobile', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!',
 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'InApp', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!', 
'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'SMS', '', 'Welcome New Team Member - <<employee_name>>', 
'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'CHECKIN_REQUEST', 'InApp', 'Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`,`description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'CHECKIN_REQUEST', 'Mobile', 'Check-in Request!', 'There are pending check-in requests for <<body>> location. Please review it.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Report Digest', 'Template when Certificate Report Digest', 'CERTIFICATE_REPORT_DIGEST', 'Email', '<<month>>’s Certificate Report', 
'<!doctype html>
<html lang="en-US">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Monthly Report Digest</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-bulk-import-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<user_name>> ,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">Your team’s certificate report for the month of <month> is now available in OneTeam360 for review, and an exported version is attached to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<company_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '1', '2022-06-12 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Checked-in!', 'Your check-in at <<location>> was confirmed.', 'ACCEPT_CHECKIN_REQUEST', 'InApp', 'Checked-in!', 'Your check-in at <<location>> was confirmed.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Checked-in!', 'Your check-in at <<location>> was confirmed.', 'ACCEPT_CHECKIN_REQUEST', 'Mobile', 'Checked-in!', 'Your check-in at <<location>> was confirmed.', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'REJECT_CHECKIN_REQUEST', 'InApp', 'Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`)
VALUES ('Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'REJECT_CHECKIN_REQUEST', 'Mobile', 'Check-in Rejected', 'Your check-in at <<location>> was rejected. Click here to check-in again!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Note Added!', 'Template for note is added', 'ADD_NOTE_NOTIFY_MANAGER', 'Email', 'Note Added!', '
<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Add Note</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">
                    <p style="margin-bottom:20px;font-size:15px">A <<Note_type>> note is added to <<added_name>> by <<employee_name>>. Please click here to view details <a href="<<customer_portal_link>>" target="_blank"> link of OT360 platform </a>.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '1', '2022-06-21 16:46:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Task Assigned', 'Template when new task assigned', 'TASK_ASSIGNED', 'InApp', 'New Task Assigned', 'A new task has been assigned to you by <<employee_name>>. Click to view more!', 'Active', '1', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Task Completed', 'Template when task is completed', 'TASK_COMPLETED', 'InApp', 'Task Completed', '<<employee_name>> has marked the task as completed on <<date_time_of_task_competition>>. Click here to view details!', 'Active', '1', '2021-06-10 16:56:13');

INSERT INTO `permission_module`(`permission_module_id`,`parent_permission_module_id`,`name`,`code`,`description`,`sequence`,`status`,`created_by`,`created_date`) VALUES ('16','0','360 Feedback Report','360_Feedback_Report','360 Feedback Report','15','Active','1','2022-06-23 19:45:34');
INSERT  INTO `permission`(`permission_id`,`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`,`created_by`,`created_date`) VALUES 
('88','13','0','View All Locations','View_All_Locations','Allow user to view all locations','3','Active',NULL,NULL),
('89','13','0','View All Job Types','View_All_JobTypes','Allow user to view all job types','4','Active',NULL,NULL),
('90','7','0','360 Feedback Management','360_Feedback_Management','Allows user to operate 360 feedback management if s/he has view system management permission','12','Active',NULL,NULL),
('91','16','0','View Manager Report','View_Manager_Report','Allow user to view manager report if s/he has permission','1','Active',NULL,NULL),
('92','16','0','View Location Report','View_Location_Report','Allow user to view location report if s/he has permission','2','Active',NULL,NULL),
('93','16','0','Receive Weekly Digest','Receive_Weekly_Digest','Allow user to receive weekly 360 feedback report digest over email','3','Active',NULL,NULL),
('94','16','0','View non-Anonymous Feedback Report','View_nonAnonymous_Feedback_Report','Allow user to view 360 feedback report in non-anonymous manner','4','Active',NULL,NULL);

/*Table structure for table `feedback_question` */

DROP TABLE IF EXISTS `feedback_question`;
CREATE TABLE `feedback_question` (
  `feedback_question_id` INT(11) NOT NULL AUTO_INCREMENT,
  `feedback_category` ENUM('Manager','Location') NOT NULL,
  `question` TEXT NOT NULL,
  `is_required` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('Active','Inactive') NOT NULL,
  `sequence` INT(11) DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME DEFAULT NULL,
  `modified_by` INT(11) DEFAULT NULL,
  `modified_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`feedback_question_id`),
  KEY `feedback_question_ibfk_1` (`created_by`),
  KEY `feedback_question_ibfk_2` (`modified_by`),
  CONSTRAINT `feedback_question_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_question_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_question_location` */

DROP TABLE IF EXISTS `feedback_question_location`;
CREATE TABLE `feedback_question_location` (
  `feedback_question_location_id` INT(11) NOT NULL AUTO_INCREMENT,
  `feedback_question_id` INT(11) NOT NULL,
  `location_id` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`feedback_question_location_id`),
  KEY `feedback_question_location_ibfk_1` (`feedback_question_id`),
  KEY `feedback_question_location_ibfk_2` (`location_id`),
  CONSTRAINT `feedback_question_location_ibfk_1` FOREIGN KEY (`feedback_question_id`) REFERENCES `feedback_question` (`feedback_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_question_location_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_rating_scale` */

DROP TABLE IF EXISTS `feedback_rating_scale`;
CREATE TABLE `feedback_rating_scale` (
  `feedback_rating_scale_id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(20) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `scale` INT(11) NOT NULL,
  `status` ENUM('Active','Inactive') DEFAULT 'Active',
  `created_by` INT(11) DEFAULT NULL,
  `created_date` DATETIME DEFAULT NULL,
  `modified_by` INT(11) DEFAULT NULL,
  `modified_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`feedback_rating_scale_id`),
  KEY `feedback_rating_scale_ibfk_1` (`created_by`),
  KEY `feedback_rating_scale_ibfk_2` (`modified_by`),
  CONSTRAINT `feedback_rating_scale_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_rating_scale_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_answer` */

DROP TABLE IF EXISTS `feedback_answer`;
CREATE TABLE `feedback_answer` (
  `feedback_answer_id` INT(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` INT(11) NOT NULL,
  `manager_id` INT(11) DEFAULT NULL,
  `location_id` INT(11) DEFAULT NULL,
  `feedback_question_id` INT(11) NOT NULL,
  `feedback_rating_scale_id` INT(11) NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_by` INT(11) NOT NULL,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`feedback_answer_id`),
  KEY `feedback_answer_ibfk_1` (`employee_profile_id`),
  KEY `feedback_answer_ibfk_2` (`manager_id`),
  KEY `feedback_answer_ibfk_3` (`location_id`),
  KEY `feedback_answer_ibfk_4` (`feedback_question_id`),
  KEY `feedback_answer_ibfk_5` (`feedback_rating_scale_id`),
  KEY `feedback_answer_ibfk_6` (`created_by`),
  CONSTRAINT `feedback_answer_ibfk_1` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_4` FOREIGN KEY (`feedback_question_id`) REFERENCES `feedback_question` (`feedback_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_5` FOREIGN KEY (`feedback_rating_scale_id`) REFERENCES `feedback_rating_scale` (`feedback_rating_scale_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;

INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Very Unsatisfied', 'Very Unsatisfied', 1, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Unsatisfied', 'Unsatisfied', 2, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Normal', 'Normal', 3, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Satisfied', 'Satisfied', 4, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Very Satisfied', 'Very Satisfied', 5, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');

ALTER TABLE `report_submission_detail` 
ADD COLUMN `notes` TEXT NULL AFTER `answer`;

UPDATE `notification_template` SET `body` = '
<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Add Note</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">
                    <p style="margin-bottom:20px;font-size:15px">A <<Note_type>> note is added to <<added_name>> by <<employee_name>>. Please click here to view details <a href="<<customer_portal_link>>" target="_blank"> link of OT360 platform </a>.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>'
 WHERE (`notification_template_id` = '71'); 

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Weekly Feedback Report', 'Template for Weekly Feedback Report', 'FEEDBACK_REPORT_DIGEST', 'Email', '360 Feedback Report – Last Week', 
'<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Weekly FeedBack Report Digest</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-bulk-import-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<user_name>> ,</strong></h4>
                    <<dynamic_template>>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td style="width: 20%;">&nbsp;</td>
                          <td style="border-radius: 2px; text-align: center; width: 60%;" align="center">
                          <p>Click <a href="<<customer_portal_link>>" target="_blank">here</a> to view full details of each report.</p>
                          </td>
                          <td style="width: 30%;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '1', '2022-06-12 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ('Employee point update', 'Push Notification when employee Point change', 'EMPLOYEE_POINTS_UPDATE', 'InApp', 'Daily Score Available', 'Visit your profile to see today’s updated points.', 'Active', '131', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ('Employee point update', 'Push Notification when employee Point change', 'EMPLOYEE_POINTS_UPDATE', 'Mobile', 'Daily Score Available', 'Visit your profile to see today’s updated points.', 'Active', '131', '2021-06-10 16:56:13');


ALTER TABLE `announcement`   
  ADD COLUMN `short_description` TEXT NULL AFTER `name`;

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Employee point update', 'Push Notification when employee Point change', 'POINT_CALCULATION_FEEDBACK', 'InApp', 'Daily Score Available', 'Click here to give us feedback and view your updated points.', 'Active', '131', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Employee point update', 'Push Notification when employee Point change', 'POINT_CALCULATION_FEEDBACK', 'Mobile', 'Daily Score Available', 'Click here to give us feedback and view your updated points.', 'Active', '131', '2021-06-10 16:56:13');

ALTER TABLE `employee_point_audit` 
ADD COLUMN `dailyreport_score` DECIMAL(11,0) NULL AFTER `checkin_score`;

ALTER TABLE `report_submission` 
ADD COLUMN `status` ENUM('submitted', 'draft') NULL AFTER `reported_date`;

INSERT INTO `role_permission` VALUES (NULL,1,84,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,1,85,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,1,86,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,2,84,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,2,85,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,1,87,1,'2022-07-16 21:20:12','Active',NULL,NULL),(NULL,2,87,1,'2022-07-16 21:20:12','Active',NULL,NULL);

 UPDATE `notification_template` SET `body` = '<html lang="en-US">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
    href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap
    rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template" />
    <style type="text/css">
      html,
      body {
        font-family: "Lato", sans-serif;
        color: #34444c;
      }
      a:hover {
        text-decoration: none !important;
      }
      :focus {
        outline: none;
        border: 0;
      }
    </style>
  </head>
  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="margin: 0px; background-color: #fff"
    bgcolor="#fff"
    leftmargin="0"
  >
    <table
      style="background-color: #fff; max-width: 620px; margin: 0 auto"
      width="100%"
      border="0"
      align="center"
      cellpadding="0"
      cellspacing="0"
    >
     <tr>
        <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 15px;">
          <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
          margin-bottom: 0;">Birthdays This Week</h1>
        </td>
      </tr>
      <tr>
        <td style="max-width: 620px; width: 620px">
          <table
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
            style="background: #ffffff; text-align: left"
          >
            <tr>
              <td
                colspan="2"
                class="container"
                style="
                  font-size: 15px;
                  vertical-align: bottom;
                  display: block;
                  margin: 0 auto;
                  max-width: 620px;
                  width: 620px;
                "
              >
                <img src="https://ot360dev.blob.core.windows.net/master/email-template/header.png" alt="" style="display: block" />
              </td>
            </tr>
            <tr>
                <td style="text-align:center; max-width: 620px; width: 620px;background-color: #d7e4f3;">
                  <h1 style="margin-top: 10px; text-align: center; font-weight: 900; font-size: 22px;margin-bottom: 0;">Time To Celebrate!</h1>
                </td>
              </tr>
            <tr>
            <tr>
              <td style="padding: 30px; background-color: #d7e4f3">
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td style="line-height: 30px; display: flex; align-items: center;justify-content: center; flex-flow: wrap;gap: 5px;">
                      <<body>>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: #d7e4f3;
                    max-width: 620px;
                    margin: 0 auto;
                  "
                >
                  <tr>
                    <td colspan="2" style="padding-bottom: 20px">
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="margin: 0 auto"
                      >
                        <tr>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                          <td
                            style="
                              border-radius: 2px;
                              text-align: center;
                              width: 40%;
                              height: 48px;
                              width: 208px;
                              padding-top: 20px;padding-bottom: 20px;
                            "
                            align="center"
                          >
                            <a href="<<customer_portal_link>>" target="_blank">
                              <img
                                src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png"
                                alt=""
                              />
                            </a>
                          </td>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                        </tr>
                         <tr>
                          <td style="width: 30%">&nbsp;</td>
                          <td style="width: 30%">&nbsp;</td>
                          <td
                            style="
                              width: 30%;
                              text-align: right;
                              padding-right: 20px;
                            "
                          >
                            <img src="https://ot360dev.blob.core.windows.net/master/email-template/birthday_img.png" alt="" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td
          style="
            vertical-align: top;
            padding-bottom: 10px;
            padding-top: 10px;
            font-size: 15px;
            text-align: left;
          "
        >
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            Thank you,
          </p>
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            <<account_name>>
          </p>
          <img
            src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
            alt=""
          />
        </td>
      </tr>
    </table>
  </body>
</html>
' WHERE (`code` = 'BIRTHDAY_ANNOUNCEMENT' AND `notification_type` = 'Email');

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

INSERT INTO `permission` (`permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) 
VALUES ('13', '75', 'Expose API', 'Expose_API', 'Allows user to view authentication key', '5', 'Active');

CREATE TABLE `api_permission_module` (
  `api_permission_module_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(250) NOT NULL,
  `description` VARCHAR(250) NOT NULL,
  `status` ENUM('Active', 'Inactive') NULL DEFAULT 'Active',
  `created_by` INT NULL,
  `created_date` DATETIME NULL,
  PRIMARY KEY (`api_permission_module_id`));
CREATE TABLE `api_permission` (
  `api_permission_id` INT NOT NULL AUTO_INCREMENT,
  `api_permission_module_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `status` ENUM('Active', 'Inactive') NULL DEFAULT 'Active',
  `created_by` INT NULL,
  `created_date` DATETIME NULL,
  PRIMARY KEY (`api_permission_id`),
  INDEX `api_permission_module_idx` (`api_permission_module_id` ASC) VISIBLE,
  CONSTRAINT `api_permission_module`
    FOREIGN KEY (`api_permission_module_id`)
    REFERENCES `api_permission_module` (`api_permission_module_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);



INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Management', 'Employee_Management', 'Employee Management', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Onboarding', 'Employee_Onboarding', 'Employee Onboarding', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Profile', 'Employee_Profile', 'Employee Profile', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Certificates', 'Certificates', 'Certificates', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Notes', 'Notes', 'Notes', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Skills', 'Skills', 'Skills', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Offboarding', 'Employee_Offboarding', 'Employee Offboarding', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Manager Dashboard', 'Manager_Dashboard', 'Manager Dashboard', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Daily Report', 'Daily_Report', 'Daily Report', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Skill Assessment Report', 'Skill_Assessment_Report', 'Skill Assessment Report', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Tasks', 'Tasks', 'Tasks', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Points Audit', 'Points_Audit', 'Points Audit', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Skill Master', 'Skill_Master', 'Skill Master', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Company Announcements', 'Company_Announcements', 'Company Announcements', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('360 Feedback Report', '360_Feedback_Report', '360 Feedback Report', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Certificate Report', 'Certificate_Report', 'Certificate Report', 'Active', '1', '2022-08-09 19:45:34');
INSERT INTO `api_permission_module` (`name`, `code`, `description`, `status`, `created_by`, `created_date`) VALUES ('Employee Dashboard', 'Employee_Dashboard', 'Employee Dashboard', 'Active', '1', '2022-08-09 19:45:34');

-- api permission data
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Directory', 'View_Employees',  'view all employee list', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'View Team Member Profile', 'View_Employee_Profile', 'view employee profile', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Team Member', 'Edit_Employee',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('2', 'Add Team Member', 'Add_Employee',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('2', 'Add Bulk Team Members', 'Bulk_Import_Employees',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'View Profile Details', 'View_Employee_Profile', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'Rate Interaction', 'Rate_Interaction', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'Adjust Points', 'Adjust_Point', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'View Points History', 'View_Points_History',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('4', 'Add Certificates', 'Add_Certificate', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('4', 'View Certificates', 'View_Certificates', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('5', 'Add Note', 'Add_Note', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('5', 'View Notes', 'View_Notes',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('6', 'View Skill', 'View_Skill', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('7', 'Inactivate Team Member', 'Inactivate_Employee', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('8', 'View Team Members', 'View_Employees', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('9', 'View Report History', 'View_Report_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('10', 'Skill Assessment Report', 'Training_List', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('10', 'Skill Assessment Report', 'Export_Excel_Training', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Add Task', 'Add_Task',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Complete Task', 'Complete_Task', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('12', 'View Point Audit Report', 'View_Points_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('13', 'Add Quiz Questions', 'Add_Quiz_Questions', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Add Announcement', 'Create_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'View Announcement List', 'View_Configured_Announcement',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Edit Announcement', 'Edit_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('14', 'Inactivate Announcement', 'Inactive_Announcement', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Feedback Statistics', 'View_Feedback_Statastics', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('16', 'View Certificates Report', 'View_Certificates_Report',  '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('16', 'Export Certificates Report', 'Export_Certificates_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('6', 'View All Roles', 'View_All_Roles', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Manager Report', 'View_Manager_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'Export Manager Report', 'Export_Manager_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'View Location Report', 'View_Location_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('15', 'Export Location Report', 'Export_Location_Report', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('17', 'Request Check In', 'Request_Check_in', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('8', 'Review Check In', 'Review_Check_in', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('8', 'View Pending Checkin Requests', 'View_Pending_Checkin_Requests', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'View Private Tasks', 'View_Private_Tasks', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'Access Task History', 'Access_Task_History', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('11', 'View Employee Private Tasks', 'View_Employee_Private_Tasks', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Date of Hire', 'Edit_Date_of_Hire', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Email ID', 'Edit_Email_ID', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('1', 'Edit Team Member ID', 'Edit_Team_Member_ID', '', 'Active');
INSERT INTO `api_permission` (`api_permission_module_id`, `name`, `code`, `description`, `status`) VALUES ('3', 'Review Certificate', 'Review_Certificate', '', 'Active');

INSERT INTO `employee_profile` (`user_id`, `role_id`, `created_by`, `points`, `status`, `employee_import_id`, `created_date`) VALUES ('1', '2', '61', '0', 'Active', '0', '2022-08-09 08:10:59');

INSERT INTO `role_permission` VALUES 
(NULL,3,34,1,'2021-12-16 21:20:12','Active',NULL,NULL),
(NULL,1,76,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,77,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,78,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,79,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,80,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,81,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,82,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,83,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,88,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,89,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,90,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,91,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,92,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,93,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,94,1,'2022-07-16 21:20:12','Active',NULL,NULL),
(NULL,1,95,1,'2022-07-16 21:20:12','Active',NULL,NULL);

ALTER TABLE `notification_queue`   
	ADD COLUMN `status` ENUM('Pending','InProgress','Completed') NULL AFTER `created_date`;

ALTER TABLE `notification_queue`   
	CHANGE `status` `status` ENUM('Pending','InProgress','Completed') CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending' NULL;

CREATE TABLE `notification_queue_log` (  
  `notification_queue_log_id` INT(11) NOT NULL AUTO_INCREMENT,
  `notification_queue_id` TEXT,
  `created_date` DATETIME NOT NULL,
  PRIMARY KEY (`notification_queue_log_id`) 
);
UPDATE `notification_template` SET `body` = 'Congratulate <<body>>.' WHERE (`code` = 'WORK_ANNIV_ANNOUNCEMENT' AND `notification_type` = 'Mobile');
UPDATE `notification_template` SET `body` = 'Congratulate <<body>>.' WHERE (`code` = 'WORK_ANNIV_ANNOUNCEMENT' AND `notification_type` = 'InApp');
UPDATE `notification_template` SET `body` = 'Congratulate <<body>>.' WHERE (`code` = 'WORK_ANNIV_ANNOUNCEMENT' AND `notification_type` = 'SMS');
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
