
DROP DATABASE IF EXISTS `masterdb`;
CREATE DATABASE `masterdb` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `masterdb`;  

/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `account_guid` char(38) NOT NULL,
  `name` varchar(50) NOT NULL,
  `address` varchar(250) NOT NULL,
  `onboard_status` enum('Completed') NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  `email` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `account_guid_UNIQUE` (`account_guid`),
  KEY `createdBy` (`created_by`),
  KEY `last_updated_by_user` (`last_updated_by`),
  CONSTRAINT `created_by_user` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `last_updated_by_user` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `account_configuration`;
CREATE TABLE `account_configuration` (
  `account_configuration_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` varchar(250) NOT NULL,
  `sequence` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`account_configuration_id`),
  KEY `AccountConfig` (`account_id`),
  KEY `last_updated_by_account` (`last_updated_by`),
  KEY `craetedBy_account` (`created_by`),
  CONSTRAINT `AccountConfig` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  CONSTRAINT `craetedBy_account` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `last_updated_by_account` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `account_configuration_detail`;
CREATE TABLE `account_configuration_detail` (
  `account_configuration_detail_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_configuration_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `code` varchar(50) NOT NULL,
  `value` varchar(250) NOT NULL,
  `default_value` varchar(250) NOT NULL,
  `description` varchar(250) NOT NULL,
  `is_encrypted` tinyint(4) NOT NULL,
  `is_editable` tinyint(4) NOT NULL,
  `sequence` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`account_configuration_detail_id`),
  KEY `account_configuration_id` (`account_configuration_id`),
  KEY `created_by_config` (`created_by`),
  KEY `updated_by_config` (`last_updated_by`),
  CONSTRAINT `account_configuration_id` FOREIGN KEY (`account_configuration_id`) REFERENCES `account_configuration` (`account_configuration_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `created_by_config` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_config` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `account_onboard_step`;
CREATE TABLE `account_onboard_step` (
  `account_onboard_step_id` int(11) NOT NULL AUTO_INCREMENT,
  `onboard_step_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `last_updated_by` int(11) NOT NULL,
  `last_updated_date` datetime NOT NULL,
  PRIMARY KEY (`account_onboard_step_id`),
  KEY `last_updated_by_onboard` (`last_updated_by`),
  CONSTRAINT `last_updated_by_onboard` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `account_subscription`;
CREATE TABLE `account_subscription` (
  `account_subscription_id` int(11) NOT NULL AUTO_INCREMENT,
  `subscription_plan_tier_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `seats_used` int(11) NOT NULL,
  `next_payment_date` date NOT NULL,
  `stripe_account_id` varchar(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `last_payment_status` enum('Success','Failure') NOT NULL,
  `expiry_date` datetime NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`account_subscription_id`),
  KEY `lastUpdatedBy` (`last_updated_by`),
  CONSTRAINT `lastUpdatedBy` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `account_subscription_history`;
CREATE TABLE `account_subscription_history` (
  `account_subscription_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_subscription_id` int(11) NOT NULL,
  `subscription_plan_tier_id` int(11) NOT NULL,
  `stripe_account_id` int(11) NOT NULL,
  `amount` double NOT NULL,
  `last_payment_status` enum('Success','Failure') NOT NULL,
  `expiry_date` datetime NOT NULL,
  `created_date` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`account_subscription_history_id`),
  KEY `creatd_by_sub_history` (`created_by`),
  CONSTRAINT `creatd_by_sub_history` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `account_user`;
CREATE TABLE `account_user` (
  `account_user_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_owner` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_by` int(11) NOT NULL,
  `last_updated_date` datetime NOT NULL,
  PRIMARY KEY (`account_user_id`),
  KEY `AccountIdF` (`account_id`),
  KEY `UserIdF` (`user_id`),
  KEY `created_by_accountUser` (`created_by`),
  KEY `updated_by_accountUser` (`last_updated_by`),
  CONSTRAINT `AccountIdF` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `UserIdF` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `created_by_accountUser` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_accountUser` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `country`;
CREATE TABLE `country` (
  `country_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capital` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency_symbol` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_by` int NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int DEFAULT NULL,
  `last_updated_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`country_id`)
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `city`;
CREATE TABLE `city` (
  `city_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_id` int(10) unsigned NOT NULL,
  `state_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `country_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`city_id`),
  KEY `FK_CITY_STATE_idx` (`state_id`),
  CONSTRAINT `FK_city_state` FOREIGN KEY (`state_id`) REFERENCES `state` (`state_id`)
) ENGINE=InnoDB AUTO_INCREMENT=147940 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPACT;

DROP TABLE IF EXISTS `grade`;
CREATE TABLE `grade` (
  `grade_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `icon_name` varchar(250) DEFAULT NULL,
  `icon_img_path` varchar(250) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`grade_id`),
  KEY `created_by_grade` (`created_by`),
  KEY `updated_by_grade` (`last_updated_by`),
  CONSTRAINT `created_by_grade` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_grade` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `impact_multiplier`;
CREATE TABLE `impact_multiplier` (
  `impact_multiplier_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `score` tinyint(4) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`impact_multiplier_id`),
  KEY `createdBy_multiplier` (`created_by`),
  KEY `lastUpdatedBy_multiplier` (`last_updated_by`),
  CONSTRAINT `createdBy_multiplier` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lastUpdatedBy_multiplier` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `onboard_step`;
CREATE TABLE `onboard_step` (
  `onboard_step_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(250) NOT NULL,
  `code` int(11) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`onboard_step_id`),
  KEY `created_by_onboard` (`created_by`),
  CONSTRAINT `created_by_onboard` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `state`;
CREATE TABLE `state` (
  `state_id` int(10) unsigned NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_id` int(10) unsigned NOT NULL,
  `country_code` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`state_id`),
  KEY `FK_STATE_COUNTRY_idx` (`country_id`),
  CONSTRAINT `FK_STATE_COUNTRY` FOREIGN KEY (`country_id`) REFERENCES `country` (`country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPACT;

DROP TABLE IF EXISTS `subscription_plan`;
CREATE TABLE `subscription_plan` (
  `subscription_plan_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(250) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `bill_interval` int(11) DEFAULT NULL,
  `min_price` double DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`subscription_plan_id`),
  KEY `created_by_subscription` (`created_by`),
  KEY `updated_by_subscription` (`last_updated_by`),
  CONSTRAINT `created_by_subscription` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updated_by_subscription` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `subscription_plan_tier`;
CREATE TABLE `subscription_plan_tier` (
  `subscription_plan_tier_id` int(11) NOT NULL AUTO_INCREMENT,
  `subscription_plan_id` int(11) NOT NULL,
  `seats_from_range` varchar(100) NOT NULL,
  `seats_to_range` int(11) NOT NULL,
  `price_per_seat` double NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`subscription_plan_tier_id`),
  KEY `createdBy_plan` (`created_by`),
  KEY `updatedBy_plan` (`last_updated_by`),
  CONSTRAINT `createdBy_plan` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedBy_plan` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `system_log`;
CREATE TABLE `system_log` (
  `system_log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `ip_address` varchar(255) NOT NULL,
  `error_code` varchar(255) NOT NULL,
  `error_message` varchar(255) NOT NULL,
  `useragent` varchar(255) NOT NULL,
  `datetime` datetime NOT NULL,
  `stack_trace` text NOT NULL,
  PRIMARY KEY (`system_log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3624 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(100) DEFAULT NULL,
  `email` varchar(250) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `date_of_birth` date NOT NULL,
  `emergency_contact_name` varchar(50) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `emergency_contact_number` varchar(20) DEFAULT NULL,
  `emergency_contact_address` varchar(250) DEFAULT NULL,
  `emergency_contact_country_id` mediumint(9) DEFAULT NULL,
  `emergency_contact_state_id` mediumint(9) DEFAULT NULL,
  `emergency_contact_city_id` int(11) DEFAULT NULL,
  `emergency_contact_zip` varchar(20) DEFAULT NULL,
  `profile_picture_url` varchar(250) NOT NULL,
  `profile_picture_thumbnail_url` varchar(250) DEFAULT NULL,
  `status` enum('Invited','Active') NOT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `user_login_log`;
CREATE TABLE `user_login_log` (
  `login_log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `login_date_time` datetime NOT NULL,
  `thru_mobile` tinyint(4) NOT NULL,
  `device_id` varchar(50) DEFAULT NULL,
  `device_os_name` varchar(50) DEFAULT NULL,
  `device_os_version` varchar(50) DEFAULT NULL,
  `app_version` varchar(250) DEFAULT NULL,
  `ip_adress` varchar(50) DEFAULT NULL,
  `status` enum('Success','Failure') NOT NULL,
  `login_error` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`login_log_id`),
  KEY `UserId` (`user_id`),
  CONSTRAINT `UserId` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1208 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `weighted_tier`;
CREATE TABLE `weighted_tier` (
  `weighted_tier_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`weighted_tier_id`),
  KEY `createdBy_weighted` (`created_by`),
  KEY `lastUpdatedBy_weighted` (`last_updated_by`),
  CONSTRAINT `createdBy_weighted` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lastUpdatedBy_weighted` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `account`   
  ADD COLUMN `is_address_same_as_billing` BOOLEAN DEFAULT 0  NULL AFTER `user_exists`;

ALTER TABLE `account_update_subscription`   
  ADD COLUMN `stripe_coupon_id` VARCHAR(50) NULL AFTER `amount_due`;

ALTER TABLE `account`   
  CHANGE `status` `status` ENUM('Payment Pending','Payment Declined','Active','Inactive','Cancelled','Cancel Requested') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE `user`   
  CHANGE `portal_access` `portal_access` ENUM('admin_portal','customer_portal') CHARSET latin1 COLLATE latin1_swedish_ci DEFAULT 'customer_portal'  NULL;

CREATE TABLE `app_log`(  
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(255),
  `account_id` INT(255),
  `customer_id` VARCHAR(255),
  `title` TEXT,
  `request` TEXT,
  `response` TEXT,
  `status` ENUM('success','error') NULL,
  `created_date` DATETIME,
  PRIMARY KEY (`id`)
);

ALTER TABLE `user`   
  ADD COLUMN `impersonation_token` TEXT NULL AFTER `reset_password_token`;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;