
DROP DATABASE IF EXISTS `tenant_ymca`;
CREATE DATABASE `tenant_ymca` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `tenant_ymca`;  

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
-- Table structure for table `certificate_status_enum`
--
DROP TABLE IF EXISTS `certificate_status_enum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_status_enum` (
  `certificate_status_enum_id` int(11) NOT NULL AUTO_INCREMENT,
  `certificate_status` enum('Assigned','InReview','Expired','Active','Rejected') NOT NULL,
  `name` varchar(45) NOT NULL,
  `sort_order` int(11) NOT NULL,
  PRIMARY KEY (`certificate_status_enum_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `certificate_type`
--

DROP TABLE IF EXISTS `certificate_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_type` (
  `certificate_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `job_type_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`certificate_type_id`),
  KEY `createdBy_certificate` (`created_by`),
  KEY `job_type_id` (`job_type_id`),
  CONSTRAINT `createdBy_certificate` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_type_id` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `dept_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) NOT NULL,
  `dept_name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`dept_id`),
  KEY `locations` (`location_id`),
  CONSTRAINT `locations` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_certificate`
--

DROP TABLE IF EXISTS `employee_certificate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_certificate` (
  `employee_certificate_id` int(11) NOT NULL AUTO_INCREMENT,
  `certificate_type_id` int(11) NOT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `description` text,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `approved_by` int(11) NOT NULL,
  `certificate_file_path` varchar(250) DEFAULT NULL,
  `certificate_status` enum('Assigned','InReview','Active','Expired','Rejected') DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `added_by` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_certificate_id`),
  KEY `employeProfileId` (`employee_profile_id`),
  KEY `certification_type_id` (`certificate_type_id`),
  KEY `createdbyUser_idx` (`created_by`),
  CONSTRAINT `certificate_type_id` FOREIGN KEY (`certificate_type_id`) REFERENCES `certificate_type` (`certificate_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `createdbyUser` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employeProfileId` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_certificate_history`
--

DROP TABLE IF EXISTS `employee_certificate_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_certificate_history` (
  `employee_certificate_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_certificate_id` int(11) NOT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `description` text,
  `issue_date` datetime DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `certificate_file_path` varchar(250) DEFAULT NULL,
  `certificate_status` enum('Assigned','InReview','Active','Expired','Rejected') DEFAULT NULL,
  `approved_by` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `end_date` date DEFAULT NULL,
  `task_id` int(11) NOT NULL,
  `added_by` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`employee_certificate_history_id`),
  KEY `employee_certificate_id` (`employee_certificate_id`),
  KEY `employee_profile_id_certi` (`employee_profile_id`),
  KEY `createdbyuser` (`created_by`),
  CONSTRAINT `employee_certificate_id` FOREIGN KEY (`employee_certificate_id`) REFERENCES `employee_certificate` (`employee_certificate_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_profile_id_certi` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_job_type`
--

DROP TABLE IF EXISTS `employee_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_job_type` (
  `employee_job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `job_type_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`employee_job_type_id`),
  KEY `employeeProfile` (`employee_profile_id`),
  KEY `jobType` (`job_type_id`),
  KEY `createdBy_job` (`created_by`),
  CONSTRAINT `createdBy_job` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `employeeProfile` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `jobType` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=539 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_location`
--

DROP TABLE IF EXISTS `employee_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_location` (
  `employee_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`employee_location_id`),
  KEY `emp_profile_id` (`employee_profile_id`),
  KEY `location_id` (`location_id`),
  KEY `craetedBy_empLocation` (`created_by`),
  CONSTRAINT `craetedBy_empLocation` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `emp_profile_id` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `location_id` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=625 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_note`
--

DROP TABLE IF EXISTS `employee_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_note` (
  `employee_note_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_id` int(11) DEFAULT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `note_type_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `is_private` tinyint(4) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=183 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_notification_preference`
--

DROP TABLE IF EXISTS `employee_notification_preference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_notification_preference` (
  `employee_notification_preference_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `is_web` tinyint(4) NOT NULL DEFAULT '0',
  `is_email` tinyint(4) NOT NULL DEFAULT '0',
  `is_mobile` tinyint(4) NOT NULL DEFAULT '0',
  `is_sms` tinyint(4) NOT NULL DEFAULT '0',
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_notification_preference_id`),
  KEY `createdBy_notification_idx` (`created_by`),
  KEY `updatedby_notification_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_notification_template` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_notification_template` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_profile`
--

DROP TABLE IF EXISTS `employee_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_profile` (
  `employee_profile_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `date_of_joining` datetime DEFAULT NULL,
  `points` double NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `level_id` int(11) DEFAULT NULL,
  `employee_import_Id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_profile_id`),
  KEY `createdBy_employee` (`created_by`),
  KEY `updatedby_employee_idx` (`last_updated_by`),
  KEY `roleId_idx` (`role_id`),
  KEY `level_employee` (`level_id`),
  CONSTRAINT `createdBy_employee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `level_employee` FOREIGN KEY (`level_id`) REFERENCES `level` (`level_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `roleId` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_employee` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `updatedBy_employee` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `form_field`
--

DROP TABLE IF EXISTS `form_field`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_field` (
  `field_id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) NOT NULL,
  `field_label` varchar(255) NOT NULL,
  `field_key` varchar(255) NOT NULL,
  `control_id` varchar(255) NOT NULL,
  PRIMARY KEY (`field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grade`
--

DROP TABLE IF EXISTS `grade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grade` (
  `grade_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `icon_name` varchar(250) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`grade_id`),
  KEY `created_by_grade` (`created_by`),
  KEY `updated_by_grade` (`last_updated_by`),
  CONSTRAINT `created_by_grade` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_grade` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity`
--

DROP TABLE IF EXISTS `group_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity` (
  `group_activity_id` int(11) NOT NULL AUTO_INCREMENT,
  `scenario` varchar(255) NOT NULL,
  `day` varchar(100) DEFAULT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`group_activity_id`),
  KEY `created_by_group_activity` (`created_by`),
  KEY `updated_by_group_activity` (`last_updated_by`),
  CONSTRAINT `created_by_group_activity` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_group_activity` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_employee`
--

DROP TABLE IF EXISTS `group_activity_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_employee` (
  `group_activity_employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` int(11) NOT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`group_activity_employee_id`),
  KEY `group_activity_id_group_activity_employee` (`group_activity_id`),
  KEY `employee_profile_id_group_activity_employee` (`employee_profile_id`),
  KEY `created_by_group_group_activity_employee` (`created_by`),
  CONSTRAINT `created_by_group_group_activity_employee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_profile_id_group_activity_employee` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_employee` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_job_type`
--

DROP TABLE IF EXISTS `group_activity_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_job_type` (
  `group_activity_job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` int(11) NOT NULL,
  `job_type_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`group_activity_job_type_id`),
  KEY `group_activity_id_group_activity_job_type` (`group_activity_id`),
  KEY `job_type_id_job_type` (`job_type_id`),
  KEY `created_by_group_activity_job_type` (`created_by`),
  CONSTRAINT `created_by_group_activity_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_job_type` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_type_id_job_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_location`
--

DROP TABLE IF EXISTS `group_activity_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_location` (
  `group_activity_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`group_activity_location_id`),
  KEY `group_activity_id_group_activity_location` (`group_activity_id`),
  KEY `location_id_group_activity_location` (`location_id`),
  KEY `created_by_group_group_activity_location` (`created_by`),
  CONSTRAINT `created_by_group_group_activity_location` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_location` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `location_id_group_activity_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `group_activity_training`
--

DROP TABLE IF EXISTS `group_activity_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_activity_training` (
  `group_activity_training_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_activity_id` int(11) NOT NULL,
  `training_id` int(11) NOT NULL,
  `training_category_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`group_activity_training_id`),
  KEY `group_activity_id_group_activity_training` (`group_activity_id`),
  KEY `training_id_group_activity_training` (`training_id`),
  KEY `training_category_id_group_activity_training` (`training_category_id`),
  KEY `created_by_group_group_activity_training` (`created_by`),
  CONSTRAINT `created_by_group_group_activity_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_activity_id_group_activity_training` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_category_id_group_activity_training` FOREIGN KEY (`training_category_id`) REFERENCES `training_category` (`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_id_group_activity_training` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interaction`
--

DROP TABLE IF EXISTS `interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interaction` (
  `inter_id` int(11) NOT NULL AUTO_INCREMENT,
  `emp_profile_id` int(11) NOT NULL,
  `inter_factor_id` int(11) NOT NULL,
  `notes` varchar(255) NOT NULL,
  `rank` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`inter_id`),
  KEY `emp_profile` (`emp_profile_id`),
  KEY `rank` (`rank`),
  CONSTRAINT `emp_profile` FOREIGN KEY (`emp_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`),
  CONSTRAINT `rank` FOREIGN KEY (`rank`) REFERENCES `rank` (`rank_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_type`
--

DROP TABLE IF EXISTS `job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_type` (
  `job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `color` varchar(50) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`job_type_id`),
  KEY `created_by_job` (`created_by`),
  KEY `updated_by_job` (`last_updated_by`),
  CONSTRAINT `created_by_job` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_job` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `level`
--

DROP TABLE IF EXISTS `level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `level` (
  `level_id` int(11) NOT NULL AUTO_INCREMENT,
  `level` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `point_range_from` int(11) NOT NULL,
  `point_range_to` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`level_id`),
  KEY `createdBy_level` (`created_by`),
  KEY `updatedby_level_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_level` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `update_by_level` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `updatedby_level` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_location_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `address_1` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `address_2` varchar(250) DEFAULT NULL,
  `city_id` int(10) unsigned NOT NULL,
  `state_id` int(10) unsigned NOT NULL,
  `country_id` int(10) unsigned NOT NULL,
  `zip` varchar(10) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  KEY `createdby_location` (`created_by`),
  KEY `update_by_location` (`last_updated_by`),
  KEY `state_id_location_idx` (`state_id`),
  KEY `country_id_location_idx` (`country_id`),
  KEY `city_id_location_idx` (`city_id`),
  CONSTRAINT `city_id_location` FOREIGN KEY (`city_id`) REFERENCES `masterdb`.`city` (`city_id`),
  CONSTRAINT `country_id_location` FOREIGN KEY (`country_id`) REFERENCES `masterdb`.`country` (`country_id`),
  CONSTRAINT `createdby_location` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `state_id_location` FOREIGN KEY (`state_id`) REFERENCES `masterdb`.`state` (`state_id`),
  CONSTRAINT `update_by_location` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `note_type`
--

DROP TABLE IF EXISTS `note_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `note_type` (
  `note_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `weighted_tier_id` int(11) NOT NULL,
  `impact_multiplier_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `is_default` tinyint(4) NOT NULL DEFAULT '0',
  `send_notification` tinyint(4) NOT NULL DEFAULT '0',
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`note_type_id`),
  KEY `created_by_note_type_idx` (`created_by`),
  KEY `last_update_by_note_type_idx` (`last_updated_by`),
  KEY ` impact_multiplier_id` (`impact_multiplier_id`),
  KEY `weighted_tier_id` (`weighted_tier_id`),
  CONSTRAINT ` impact_multiplier_id` FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier` (`impact_multiplier_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `created_by_note_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `last_update_by_note_type` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `weighted_tier_id` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier` (`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_queue`
--

DROP TABLE IF EXISTS `notification_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_queue` (
  `notification_queue_id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_template_id` int(11) NOT NULL,
  `sender` varchar(50) NOT NULL,
  `sender_email` varchar(100) NOT NULL,
  `notification_type` enum('SMS','Email','Mobile','InApp') NOT NULL,
  `notification_subject` varchar(100) NOT NULL,
  `notification_body` text NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` varchar(50) DEFAULT NULL,
  `default_recipeints` varchar(250) DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `retry_count` int(11) DEFAULT NULL,
  `notification_error` varchar(250) DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`notification_queue_id`),
  KEY `notification_template` (`notification_template_id`),
  CONSTRAINT `notification_template` FOREIGN KEY (`notification_template_id`) REFERENCES `notification_template` (`notification_template_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_queue_recipient`
--

DROP TABLE IF EXISTS `notification_queue_recipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_queue_recipient` (
  `notification_queue_recipient_id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_queue_id` int(11) NOT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `read_date` datetime DEFAULT NULL,
  `to_cc` enum('To','CC') NOT NULL,
  `recipient_email` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`notification_queue_recipient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_template`
--

DROP TABLE IF EXISTS `notification_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_template` (
  `notification_template_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `notification_type` enum('SMS','Email','Mobile','InApp') NOT NULL,
  `subject` varchar(100) NOT NULL,
  `body` text NOT NULL,
  `permission_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `default_recipeints` varchar(250) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`notification_template_id`),
  KEY `permissionId` (`permission_id`),
  KEY `createdBy_notification_idx` (`created_by`),
  KEY `updatedby_notification_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_notification_idx` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `permissionId` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_notification_idx` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `permission_id` int(11) NOT NULL AUTO_INCREMENT,
  `permission_module_id` int(11) NOT NULL,
  `parent_permission_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `sequence` int(11) NOT NULL,
  PRIMARY KEY (`permission_id`),
  KEY `permission_module` (`permission_module_id`),
  CONSTRAINT `permission_module` FOREIGN KEY (`permission_module_id`) REFERENCES `permission_module` (`permission_module_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission_module`
--

DROP TABLE IF EXISTS `permission_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission_module` (
  `permission_module_id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) DEFAULT NULL,
  `parent_permission_module_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(45) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `sequence` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  PRIMARY KEY (`permission_module_id`),
  KEY `createdBy_module_idx` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rank`
--

DROP TABLE IF EXISTS `rank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rank` (
  `rank_id` int(11) NOT NULL AUTO_INCREMENT,
  `rank_title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `points` double NOT NULL,
  PRIMARY KEY (`rank_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resource`
--

DROP TABLE IF EXISTS `resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource` (
  `resource_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `resource_type` enum('PNG','JPG','PDF','MP4') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `source` enum('YouTube','Vimeo','Other') CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `sequence` int(11) NOT NULL,
  `location_path` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`resource_id`),
  KEY `created_by_resource` (`created_by`),
  CONSTRAINT `created_by_resource` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `is_admin_role` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  KEY `createdBy_role` (`created_by`),
  CONSTRAINT `createdBy_role` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `role_permission_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`role_permission_id`),
  KEY `roleId_role` (`role_id`),
  KEY `permissionId_role` (`permission_id`),
  KEY `createdBy_user_idx` (`created_by`),
  CONSTRAINT `createdBy_user` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`),
  CONSTRAINT `modulePermissionId` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `roleId_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenario`
--

DROP TABLE IF EXISTS `scenario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenario` (
  `scenario_id` int(11) NOT NULL AUTO_INCREMENT,
  `day` varchar(100) DEFAULT NULL,
  `name` varchar(160) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`scenario_id`),
  KEY `created_by_scenario` (`created_by`),
  KEY `updated_by_scenario` (`last_updated_by`),
  CONSTRAINT `created_by_scenario` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_scenario` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `scenario_training`
--

DROP TABLE IF EXISTS `scenario_training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scenario_training` (
  `scenario_training_id` int(11) NOT NULL AUTO_INCREMENT,
  `scenario_id` int(11) NOT NULL,
  `training_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`scenario_training_id`),
  KEY `training_id_scenario_training` (`training_id`),
  KEY `created_by_scenario_training` (`created_by`),
  KEY `updated_by_scenario_training` (`last_updated_by`),
  CONSTRAINT `created_by_scenario_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_id_scenario_training` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_scenario_training` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `user_id_number` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `createdby` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`user_id_number`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `task_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_type_id` int(11) NOT NULL,
  `job_type_id` int(11) DEFAULT NULL,
  `title` varchar(160) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `description` text CHARACTER SET latin1 COLLATE latin1_swedish_ci,
  `assigned_by` int(11) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `task_status` enum('Overdue','Pending','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT '0',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  KEY `assigned_employee` (`assigned_by`),
  KEY `location_task` (`location_id`),
  KEY `createdby_task` (`created_by`),
  KEY `updatedby_task` (`last_updated_by`),
  CONSTRAINT `assigned_employee` FOREIGN KEY (`assigned_by`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `createdby_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `location_task` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_task` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_assignee`
--

DROP TABLE IF EXISTS `task_assignee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_assignee` (
  `task_assignee_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `task_status` enum('Overdue','Pending','Completed') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`task_assignee_id`),
  KEY `createdby_assignee` (`created_by`),
  KEY `updatedby_assignee` (`last_updated_by`),
  CONSTRAINT `createdby_assignee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_assignee` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6687 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_image`
--

DROP TABLE IF EXISTS `task_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_image` (
  `task_image_id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `image_url` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `image_thumbnail_url` varchar(250) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`task_image_id`),
  KEY `creted_by_image` (`created_by`),
  CONSTRAINT `creted_by_image` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_log`
--

DROP TABLE IF EXISTS `task_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_log` (
  `task_log_id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`task_log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_type`
--

DROP TABLE IF EXISTS `task_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_type` (
  `task_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int(11) NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`task_type_id`),
  KEY `updated_by_task` (`created_by`),
  CONSTRAINT `created_by_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_task` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training`
--

DROP TABLE IF EXISTS `training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training` (
  `training_id` int(11) NOT NULL AUTO_INCREMENT,
  `training_category_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`training_id`),
  KEY `created_by_training` (`created_by`),
  KEY `updated_by_training` (`last_updated_by`),
  KEY `training_category_training` (`training_category_id`),
  CONSTRAINT `created_by_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_category_training` FOREIGN KEY (`training_category_id`) REFERENCES `training_category` (`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_training` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_category`
--

DROP TABLE IF EXISTS `training_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_category` (
  `training_category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `weighted_tier_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`training_category_id`),
  KEY `created_by_training_category_idx` (`created_by`),
  KEY `last_update_by_training_category_idx` (`last_updated_by`),
  KEY `weighted_tier_id` (`weighted_tier_id`),
  CONSTRAINT `created_by_training_category` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `last_update_by_training_category` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `weighted_tier_id_training_category` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier` (`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_employee`
--

DROP TABLE IF EXISTS `training_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_employee` (
  `training_employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `training_id` int(11) NOT NULL,
  `employee_profile_id` int(11) NOT NULL,
  `grade_id` int(11) DEFAULT NULL,
  `job_type_id` int(11) DEFAULT NULL,
  `notes` text,
  `group_activity_id` int(11) DEFAULT NULL,
  `is_retest` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`training_employee_id`),
  KEY `grade_id_emptraining` (`grade_id`),
  KEY `created_by_emptraining` (`created_by`),
  KEY `updated_by_emptraining` (`last_updated_by`),
  KEY `employee_profile_training` (`employee_profile_id`),
  KEY `training_id` (`training_id`),
  KEY `training_group_activity_idx` (`group_activity_id`),
  KEY `job_type_training_employee` (`job_type_id`),
  CONSTRAINT `created_by_emptraining` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `employee_profile_training` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grade_id_emptraining` FOREIGN KEY (`grade_id`) REFERENCES `masterdb`.`grade` (`grade_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `job_type_training_employee` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_group_activity` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `training_id` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_emptraining` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_job_type`
--

DROP TABLE IF EXISTS `training_job_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_job_type` (
  `training_job_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `training_id` int(11) NOT NULL,
  `job_type_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`training_job_type_id`),
  KEY `created_by_training_job_type` (`created_by`),
  CONSTRAINT `created_by_training_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_resource`
--

DROP TABLE IF EXISTS `training_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_resource` (
  `training_resource_id` int(11) NOT NULL AUTO_INCREMENT,
  `training_id` int(11) NOT NULL,
  `resource_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`training_resource_id`),
  KEY `created_by_tresource` (`created_by`),
  CONSTRAINT `created_by_tresource` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'berzansky_macdonald'
--
/*!50003 DROP PROCEDURE IF EXISTS `ExportTaskList` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`synmysqladmin`@`%` PROCEDURE `ExportTaskList`(
   IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT
)
BEGIN
SET
   @query = CONCAT(
      'SELECT DISTINCT task.task_id, task_type.name as task_type, task.task_status as taskStatus, task.title, t2.task_status , task.description, task.created_date, location.name as location_name, job_type.name as job_type_name, task.end_date, task.start_date, (select  CONCAT(user.first_name, " ", user.last_name)  FROM masterdb.user user, 
employee_profile, task y WHERE y.task_id = task.task_id AND y.assigned_by = 
employee_profile.employee_profile_id AND employee_profile.user_id = user.user_id) as created_by, t2.assignees, t2.completed_date, t2.completed_by, (select GROUP_CONCAT(task_image.task_image_id SEPARATOR ",") FROM task_image WHERE task_image.task_id=task.task_id ) as task_images FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id LEFT JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN (SELECT assigned_to, task_id, task_assignee.last_updated_date as completed_date, (select CONCAT(x.first_name, " ", x.last_name) AS name FROM masterdb.user x WHERE x.user_id = task_assignee.last_updated_by) as completed_by, task_assignee.task_status as task_status, (CONCAT(user.first_name, " ", user.last_name)) AS assignees FROM task_assignee  LEFT JOIN employee_profile ON task_assignee.assigned_to = employee_profile.employee_profile_id  LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id WHERE task_assignee.status = "Active") t2 ON t2.task_id = task.task_id LEFT JOIN employee_profile ON task_assignee.assigned_to= employee_profile.employee_profile_id LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status= "Active" AND task_assignee.status = "Active" AND'
   );

if assignee = 0 then
SET
   @query = CONCAT(@query, ' task.assigned_by = ', id);

end if;

if assignee = 1 then
SET
   @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);

end if;

if assignee = 2 THEN
SET
   @query = CONCAT(@query, ' (task.assigned_by = ', id);

SET
   @query = CONCAT(@query, ' OR task_assignee.assigned_to = ', id);

SET
   @query = CONCAT(@query, ')');

end if;

if andCondition IS NOT NULL THEN
SET
   @query = CONCAT(@query, ' ', andCondition);

end if;
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

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GroupActivityCount` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`synmysqladmin`@`%` PROCEDURE `GroupActivityCount`()
    NO SQL
BEGIN 
SET @query = CONCAT('SELECT GA.group_activity_id , GA.day, GA.scenario, (select GROUP_CONCAT(job_type.name SEPARATOR ",") FROM job_type JOIN group_activity_job_type ON   job_type.job_type_id=group_activity_job_type.job_type_id WHERE group_activity_job_type.group_activity_id = GA.group_activity_id  ) as job_type, (select GROUP_CONCAT(location.name SEPARATOR ",") FROM location JOIN group_activity_location ON   location.location_id=group_activity_location.location_id WHERE group_activity_location.group_activity_id = GA.group_activity_id  ) as location, (select GROUP_CONCAT(training.name SEPARATOR ",") FROM training JOIN group_activity_training ON training.training_id = group_activity_training.training_id WHERE group_activity_training.group_activity_id = GA.group_activity_id  ) as training, (select GROUP_CONCAT(employee_profile.employee_profile_id SEPARATOR ",") FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id  ) as employee_profile, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM masterdb.user y WHERE y.user_id = GA.created_by ) as created_by, GA.created_date FROM group_activity as GA WHERE GA.status = "Active" ORDER BY GA.created_date DESC');
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GroupActivityList` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`synmysqladmin`@`%` PROCEDURE `GroupActivityList`(IN `countRows` INT, IN `skipRows` INT)
    NO SQL
BEGIN 
SET @query = CONCAT('SELECT GA.group_activity_id , GA.day, GA.scenario, (select GROUP_CONCAT(job_type.name SEPARATOR ",") FROM job_type JOIN group_activity_job_type ON   job_type.job_type_id=group_activity_job_type.job_type_id WHERE group_activity_job_type.group_activity_id = GA.group_activity_id  ) as job_type, (select GROUP_CONCAT(location.name SEPARATOR ",") FROM location JOIN group_activity_location ON   location.location_id=group_activity_location.location_id WHERE group_activity_location.group_activity_id = GA.group_activity_id  ) as location, (select GROUP_CONCAT(training.name SEPARATOR ",") FROM training JOIN group_activity_training ON training.training_id = group_activity_training.training_id WHERE group_activity_training.group_activity_id = GA.group_activity_id  ) as training, (select GROUP_CONCAT(employee_profile.employee_profile_id SEPARATOR ",") FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id  ) as employee_profile, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM masterdb.user y WHERE y.user_id = GA.created_by ) as created_by, GA.created_date FROM group_activity as GA  WHERE GA.status = "Active" ORDER BY GA.created_date DESC');
SET @query = CONCAT(@query, ' limit ', countRows);
SET @query = CONCAT(@query, ' offset ', skipRows);
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `TaskListCount` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`synmysqladmin`@`%` PROCEDURE `TaskListCount`(IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT)
BEGIN
SET @query = CONCAT('SELECT DISTINCT task.task_id FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id INNER JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN  masterdb.user ON task.created_by = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status = "Active" AND task_assignee.status="Active" AND');
if assignee = 0 then
   SET @query = CONCAT(@query, ' task.assigned_by = ', id);
end if;
if assignee = 1 then
   SET @query = CONCAT(@query, ' task_assignee.assigned_to = ', id );
end if;
if assignee =2 THEN
   SET @query = CONCAT(@query, ' (task.assigned_by = ', id );
   SET @query = CONCAT(@query, ' OR task_assignee.assigned_to = ', id );
   SET @query = CONCAT(@query, ')');
end if;
if andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
end if;
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `TaskListHistory` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`synmysqladmin`@`%` PROCEDURE `TaskListHistory`(
   IN `id` INT(11),
   IN `assignee` INT(11),
   IN `countRows` INT(11),
   IN `skipRows` INT(11),
   IN `andCondition` TEXT
)
BEGIN
SET
   @query = CONCAT(
      'SELECT DISTINCT task.task_id, task_type.name as task_type, task.title, task.task_status, task.description, task.created_date, task.last_updated_date, location.name as location_name,  task.is_private, task.end_date, task.start_date, user.profile_picture_url, user.profile_picture_thumbnail_url,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM masterdb.user y WHERE y.user_id = task.created_by ) as created_by, ( select CONCAT(y.first_name, " ", y.last_name) AS name  FROM  masterdb.user y  WHERE  y.user_id = task.last_updated_by) as last_updated_by, (select  GROUP_CONCAT( CONCAT(user.first_name, " ", user.last_name) SEPARATOR "," ) FROM task_assignee y, employee_profile, masterdb.user user WHERE y.task_id = task.task_id AND y.assigned_to = employee_profile.employee_profile_id AND employee_profile.user_id = user.user_id  AND y.status = "Active") as task_assignee, (select GROUP_CONCAT(task_image.task_image_id SEPARATOR ",") FROM task_image WHERE task_image.task_id=task.task_id ) as task_images'
   );

if assignee = 1 then
SET
   @query = CONCAT(
      @query,
      ', task_assignee.task_status as task_assignee_status'
   );

end if;

SET
   @query = CONCAT(
      @query,
      ' FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id INNER JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN  masterdb.user ON task.created_by = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status = "Active" AND  task_assignee.status = "Active" AND'
   );

if assignee = 0 then
SET
   @query = CONCAT(@query, ' task.assigned_by = ', id);

end if;

if assignee = 1 then
SET
   @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);

end if;

if assignee = 2 THEN
SET
   @query = CONCAT(@query, ' (task.assigned_by = ', id);

SET
   @query = CONCAT(@query, ' OR task_assignee.assigned_to = ', id);

SET
   @query = CONCAT(@query, ')');

end if;

if andCondition IS NOT NULL THEN
SET
   @query = CONCAT(@query, ' ', andCondition);

end if;

if assignee = 0 then
SET
   @query = CONCAT(@query, ' ORDER BY task.task_status ASC, ');

end if;

if assignee = 1 then
SET
   @query = CONCAT(
      @query,
      ' ORDER BY task_assignee.task_status ASC, '
   );

end if;

if assignee = 2 THEN
SET
   @query = CONCAT(@query, ' ORDER BY task.task_status ASC, ');

end if;

SET
   @query = CONCAT(@query, ' task.end_date ASC limit ', countRows);

SET
   @query = CONCAT(@query, ' offset ', skipRows);

PREPARE stmt
FROM
   @query;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-26 14:38:03
