DROP TABLE IF EXISTS `scenario`;
create table scenario ( 
scenario_id INT(11) NOT NULL AUTO_INCREMENT, 
day VARCHAR(100) DEFAULT NULL, 
name VARCHAR(160) NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
last_updated_by INT(11) DEFAULT NULL, 
last_updated_date DATETIME DEFAULT NULL, 
PRIMARY KEY ( scenario_id ) );
ALTER TABLE `scenario` ADD CONSTRAINT `created_by_scenario` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario` ADD CONSTRAINT `updated_by_scenario` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


DROP TABLE IF EXISTS `scenario_training`;
create table scenario_training ( 
scenario_training_id INT(11) NOT NULL AUTO_INCREMENT, 
scenario_id INT(11) NOT NULL, 
training_id INT(11) NOT NULL, 
status ENUM('Active', 'Inactive') NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
last_updated_by INT(11) DEFAULT NULL, 
last_updated_date DATETIME DEFAULT NULL, 
PRIMARY KEY ( scenario_training_id ) );
ALTER TABLE `scenario_training` ADD CONSTRAINT `training_id_scenario_training` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_training` ADD CONSTRAINT `created_by_scenario_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_training` ADD CONSTRAINT `updated_by_scenario_training` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


DROP TABLE IF EXISTS `group_activity`;
create table group_activity ( 
group_activity_id INT(11) NOT NULL AUTO_INCREMENT, 
scenario VARCHAR(255) NOT NULL, 
day VARCHAR(100) DEFAULT NULL, 
notes VARCHAR(1000) DEFAULT NULL, 
status ENUM('Active', 'Inactive') NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
last_updated_by INT(11) DEFAULT NULL, 
last_updated_date DATETIME DEFAULT NULL, 
PRIMARY KEY ( group_activity_id ) );
ALTER TABLE `group_activity` ADD CONSTRAINT `created_by_group_activity` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity` ADD CONSTRAINT `updated_by_group_activity` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


DROP TABLE IF EXISTS `group_activity_job_type`;
create table group_activity_job_type ( 
group_activity_job_type_id INT(11) NOT NULL AUTO_INCREMENT, 
group_activity_id INT(11) NOT NULL, 
job_type_id INT(11) NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL,
PRIMARY KEY ( group_activity_job_type_id ) );
ALTER TABLE `group_activity_job_type` ADD CONSTRAINT `group_activity_id_group_activity_job_type` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_job_type` ADD CONSTRAINT `job_type_id_job_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_job_type` ADD CONSTRAINT `created_by_group_activity_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


DROP TABLE IF EXISTS `group_activity_employee`;
create table group_activity_employee ( 
group_activity_employee_id INT(11) NOT NULL AUTO_INCREMENT, 
group_activity_id INT(11) NOT NULL, 
employee_profile_id INT(11) NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
PRIMARY KEY ( group_activity_employee_id ) );
ALTER TABLE `group_activity_employee` ADD CONSTRAINT `group_activity_id_group_activity_employee` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_employee` ADD CONSTRAINT `employee_profile_id_group_activity_employee` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_employee` ADD CONSTRAINT `created_by_group_group_activity_employee` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


DROP TABLE IF EXISTS `group_activity_location`;
create table group_activity_location ( 
group_activity_location_id INT(11) NOT NULL AUTO_INCREMENT, 
group_activity_id INT(11) NOT NULL, 
location_id INT(11) NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
PRIMARY KEY ( group_activity_location_id ) );
ALTER TABLE `group_activity_location` ADD CONSTRAINT `group_activity_id_group_activity_location` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_location` ADD CONSTRAINT `location_id_group_activity_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_location` ADD CONSTRAINT `created_by_group_group_activity_location` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;


DROP TABLE IF EXISTS `group_activity_training`;
create table group_activity_training ( 
group_activity_training_id INT(11) NOT NULL AUTO_INCREMENT, 
group_activity_id INT(11) NOT NULL, 
training_id INT(11) NOT NULL, 
training_category_id INT(11) NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
PRIMARY KEY ( group_activity_training_id ) );
ALTER TABLE `group_activity_training` ADD CONSTRAINT `group_activity_id_group_activity_training` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_training` ADD CONSTRAINT `training_id_group_activity_training` FOREIGN KEY (`training_id`) REFERENCES `training` (`training_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_training` ADD CONSTRAINT `training_category_id_group_activity_training` FOREIGN KEY (`training_category_id`) REFERENCES `training_category` (`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `group_activity_training` ADD CONSTRAINT `created_by_group_group_activity_training` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `training_employee` ADD INDEX `training_group_activity_idx` (`group_activity_id` ASC) VISIBLE;
ALTER TABLE `training_employee` ADD CONSTRAINT `training_group_activity` FOREIGN KEY (`group_activity_id`) REFERENCES `group_activity` (`group_activity_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `training_employee` CHANGE `grade_id` `grade_id` INT(11) NULL;

DROP TABLE IF EXISTS `scenario_training_category`;
create table scenario_training_category ( 
scenario_training_category_id INT(11) NOT NULL AUTO_INCREMENT, 
scenario_id INT(11) NOT NULL, 
training_category_id INT(11) NOT NULL, 
status ENUM('Active', 'Inactive') NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
last_updated_by INT(11) DEFAULT NULL,
last_updated_date DATETIME DEFAULT NULL, 
PRIMARY KEY ( scenario_training_category_id ) );
ALTER TABLE `scenario_training_category` ADD CONSTRAINT `scenario_id_scenario_training_category` FOREIGN KEY (`scenario_id`) REFERENCES `scenario` (`scenario_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_training_category` ADD CONSTRAINT `training_category_id_scenario_training_category` FOREIGN KEY (`training_category_id`) REFERENCES `training_category` (`training_category_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_training_category` ADD CONSTRAINT `created_by_scenario_training_category` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_training_category` ADD CONSTRAINT `updated_by_scenario_training_category` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE IF EXISTS `scenario_job_type`;
create table scenario_job_type ( 
scenario_job_type_id INT(11) NOT NULL AUTO_INCREMENT, 
scenario_id INT(11) NOT NULL, 
job_type_id INT(11) NOT NULL, 
status ENUM('Active', 'Inactive') NOT NULL, 
created_by INT(11) NOT NULL, 
created_date DATETIME NOT NULL, 
last_updated_by INT(11) DEFAULT NULL, 
last_updated_date DATETIME DEFAULT NULL, 
PRIMARY KEY ( scenario_job_type_id ) );
ALTER TABLE `scenario_job_type` ADD CONSTRAINT `scenario_id_scenario_job_type` FOREIGN KEY (`scenario_id`) REFERENCES `scenario` (`scenario_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_job_type` ADD CONSTRAINT `job_type_id_scenario_job_type` FOREIGN KEY (`job_type_id`) REFERENCES `job_type` (`job_type_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_job_type` ADD CONSTRAINT `created_by_scenario_job_type` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scenario_job_type` ADD CONSTRAINT `updated_by_scenario_job_type` FOREIGN KEY (`last_updated_by`) REFERENCES `masterdb`.`user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;