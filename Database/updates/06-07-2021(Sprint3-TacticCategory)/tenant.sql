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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `training`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training` (
  `training_id` int(11) NOT NULL AUTO_INCREMENT,
  `training_category_id` int(11) NOT NULL,
  `job_type_id` int(11) NOT NULL,
  `weighted_tier_id` int(11) NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`training_id`),
  KEY `created_by_training_idx` (`created_by`),
  KEY `last_update_by_training_idx` (`last_updated_by`),
  KEY `weighted_tier_id` (`weighted_tier_id`),
  KEY `job_type_id_training` (`job_type_id`),
  CONSTRAINT ` job_type_id_training` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `created_by_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `last_update_by_training` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `weighted_tier_id_training` FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier` (`weighted_tier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;