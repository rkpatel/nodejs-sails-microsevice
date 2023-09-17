CREATE TABLE `certificate_status_enum` (
  `certificate_status_enum_id` INT NOT NULL AUTO_INCREMENT,
  `certificate_status` ENUM('Assigned', 'InReview','Expired','Active', 'Rejected') NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `sort_order` INT NOT NULL,
  PRIMARY KEY (`certificate_status_enum_id`));


INSERT INTO `certificate_status_enum` (`certificate_status_enum_id`, `certificate_status`, `name`, `sort_order`) VALUES ('1', 'Assigned', 'Assigned', '1');
INSERT INTO `certificate_status_enum` (`certificate_status_enum_id`, `certificate_status`, `name`, `sort_order`) VALUES ('2', 'InReview', 'In Review', '2');
INSERT INTO `certificate_status_enum` (`certificate_status_enum_id`, `certificate_status`, `name`, `sort_order`) VALUES ('3', 'Active', 'Active', '3');
INSERT INTO `certificate_status_enum` (`certificate_status_enum_id`, `certificate_status`, `name`, `sort_order`) VALUES ('4', 'Expired', 'Expired', '4');


ALTER TABLE `employee_certificate` 
CHANGE COLUMN `certificate_status` `certificate_status` ENUM('Assigned', 'InReview', 'Active', 'Expired', 'Rejected') NULL DEFAULT NULL ;


ALTER TABLE `employee_certificate_history` 
CHANGE COLUMN `certificate_status` `certificate_status` ENUM('Assigned', 'InReview', 'Active', 'Expired', 'Rejected') NULL DEFAULT NULL ;
