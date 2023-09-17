
create table bulk_import_log( bulk_import_log_id INT NOT NULL AUTO_INCREMENT, 
file_name VARCHAR(250) NOT NULL, 
file_path VARCHAR(250) NULL, 
`status` ENUM('Imported', 'Validated', 'Completed', 'Failed') NOT NULL,
`error_count` INT(11) NULL DEFAULT NULL,
`success_count` INT(11) NULL DEFAULT NULL,
`total_count` INT(11) NULL DEFAULT NULL,
error_export_url VARCHAR(250) NULL, 
`uploaded_by` INT(11) NULL DEFAULT NULL,
uploaded_date DATETIME, PRIMARY KEY ( bulk_import_log_id ) )
ALTER TABLE `bulk_import_log` 
ADD COLUMN `is_accept` BOOLEAN NOT NULL AFTER `total_count`;
ALTER TABLE `bulk_import_log` 
CHANGE COLUMN `status` `status` ENUM('Imported', 'Validated', 'Completed', 'Failed', 'Mail Sent') NOT NULL ;



create table bulk_import_temp( bulk_import_temp_id INT NOT NULL AUTO_INCREMENT, 
bulk_import_log_id INT(11)  NOT NULL,
first_name VARCHAR(250) NOT NULL, 
last_name VARCHAR(250) NOT NULL, 
email  VARCHAR(250) NOT NULL,
    contact_number  VARCHAR(250) NOT NULL,
    date_of_joining   DATETIME NOT NULL,
    date_of_birth  DATETIME NOT NULL,
    locations  text NOT NULL,
    job_types text NOT NULL,
    `role`      VARCHAR(250) NOT NULL,
    emergency_contact_name   VARCHAR(250)  NULL DEFAULT NULL,
    emergency_contact_relation  VARCHAR(250)  NULL DEFAULT NULL,
    emergency_contact_number    VARCHAR(250)  NULL DEFAULT NULL,
    emergency_contact_address   VARCHAR(250)  NULL DEFAULT NULL,
    emergency_contact_country   VARCHAR(250)  NULL DEFAULT NULL,
    emergency_contact_state     VARCHAR(250)  NULL DEFAULT NULL,
    emergency_contact_city    VARCHAR(250)  NULL DEFAULT NULL,
    emergency_contact_zip    VARCHAR(250)  NULL DEFAULT NULL,
`status` ENUM('Success', 'Failure') NOT NULL, PRIMARY KEY ( bulk_import_temp_id ) );
ALTER TABLE `bulk_import_temp` 
CHANGE COLUMN `contact_number` `phone` VARCHAR(250) NULL DEFAULT NULL ;

ALTER TABLE `bulk_import_temp` 
ADD COLUMN `error_log` TEXT NULL DEFAULT NULL AFTER `status`;
ALTER TABLE `bulk_import_temp` ADD CONSTRAINT `bulk_import_log` FOREIGN KEY (`bulk_import_log_id`) 
REFERENCES `bulk_import_log`(`bulk_import_log_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `berzansky_macdonald`.`bulk_import_temp` 
CHANGE COLUMN `first_name` `first_name` VARCHAR(250) NULL ,
CHANGE COLUMN `last_name` `last_name` VARCHAR(250) NULL DEFAULT NULL ,
CHANGE COLUMN `email` `email` VARCHAR(250) NULL DEFAULT NULL ,
CHANGE COLUMN `phone` `phone` VARCHAR(250) NULL DEFAULT NULL ,
CHANGE COLUMN `date_of_joining` `date_of_joining` DATETIME NULL DEFAULT NULL ,
CHANGE COLUMN `date_of_birth` `date_of_birth` DATETIME NULL DEFAULT NULL ,
CHANGE COLUMN `locations` `locations` TEXT NULL DEFAULT NULL ,
CHANGE COLUMN `job_types` `job_types` TEXT NULL DEFAULT NULL ,
CHANGE COLUMN `role` `role` VARCHAR(250) NULL DEFAULT NULL ;

ALTER TABLE `bulk_import_temp` 
CHANGE COLUMN `date_of_joining` `date_of_joining` VARCHAR(50) NULL DEFAULT NULL ,
CHANGE COLUMN `date_of_birth` `date_of_birth` VARCHAR(50) NULL DEFAULT NULL ;

INSERT INTO `cron_job` ( `name`, `code`, `description`, `last_processing_date`) VALUES ( 'Bulk Import', 'BULK_IMPORT', 'Cron Job for Bulk Import', '2021-10-27 08:30:00');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('Bulk Import', 'Template for successfully import of all recrods for bulk import', 'COMPLETED_ALL_IMPORT', 'Email', 'Employee Import Successful', '<html lang=\"en\"><head><!-- Required meta tags --><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><link href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\" rel=\"stylesheet\" /><style>html,body {font-family: \"Lato\", sans-serif;}</style></head><body><div><h4 style=\"margin-bottom: 30px\">Hello <<first_name>>,</h4><p style=\"margin-bottom: 10px; font-size: 14px\">We have imported all the employees from the file that you had uploaded. All employees have been sent welcome emails from OneTeam360 successfully. </p><p style=\"font-size: 14px\">    We’ve attached the imported file here for your reference. </p><h5 style=\"margin-top: 5px\">Thank you,</h5><h5 style=\"margin-bottom: 5px;margin-top:0px;\">OneTeam360</h5></div></body></html>', '1', 'Active', '7', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('Bulk Import - Partial', 'Template for import  partial recrods for bulk import', 'COMPLETED_PARTIAL_IMPORT', 'Email', 'Employee Import Notifications – Partial Import', '<html lang=\"en\"><head><!-- Required meta tags --><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><link href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\" rel=\"stylesheet\" /><style>html,body {font-family: \"Lato\", sans-serif;}</style></head><body><div><h4 style=\"margin-bottom: 30px\">Hello <<first_name>>,</h4><p style=\"margin-bottom: 10px; font-size: 14px\">We have not imported the employees due to failed validation on one or multiple records. Attached the output file here for your reference. Please take required action for invalid records within the output file.  </p><h5 style=\"margin-bottom: 5px\">Thank you,</h5><h5 style=\"margin-bottom: 5px;margin-top:0px;\">OneTeam360</h5></div></body></html>', '1', 'Active', '7', '2021-06-10 16:56:13');
UPDATE `notification_template` SET `name` = 'Bulk Import - All' WHERE (`notification_template_id` = '20');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('Bulk Import - No', 'Template for import no recrods for bulk import', 'NOT_COMPLETE_IMPORT', 'Email', 'Employee Import Failed', '<html lang=\"en\"><head><!-- Required meta tags --><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><link href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\" rel=\"stylesheet\" /><style>html,body {font-family: \"Lato\", sans-serif;}</style></head><body><div><h4 style=\"margin-bottom: 30px\">Hello <<first_name>>,</h4><p style=\"margin-bottom: 10px; font-size: 14px\">We have not imported the employees due to failed validation on one or multiple records. Attached the output file here for your reference. Please take required action for invalid records within the output file.  </p><h5 style=\"margin-bottom: 5px\">Thank you,</h5><h5 style=\"margin-bottom: 5px;margin-top:0px;\">OneTeam360</h5></div></body></html>', '1', 'Active', '7', '2021-06-10 16:56:13');
UPDATE `berzansky_macdonald`.`notification_template` SET `body` = '<html lang=\"en\"><head><!-- Required meta tags --><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /><link href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\" rel=\"stylesheet\" /><style>html,body {font-family: \"Lato\", sans-serif;}</style></head><body><div><h4 style=\"margin-bottom: 30px\">Hello <<first_name>>,</h4><p style=\"margin-bottom: 10px; font-size: 14px\"> We have partially imported the employees from the file that had valid data formats and all these employees have been sent welcome emails from OneTeam360 successfully.</p><p style=\"font-size: 14px\"> We have not imported the employees that failed the validation process. Attached the output file here for your reference. Please take required action for invalid records within the output file. </p><h5 style=\"margin-bottom: 5px\">Thank you,</h5><h5 style=\"margin-bottom: 5px;margin-top:0px;\">OneTeam360</h5></div></body></html>' WHERE (`notification_template_id` = '21');

ALTER TABLE `notification_queue_recipient` 
ADD COLUMN `attachment` TEXT NULL DEFAULT NULL AFTER `recipient_email`;

ALTER TABLE `bulk_import_log`  ADD COLUMN `uploaded_file_name` VARCHAR(250) NULL DEFAULT NULL AFTER `uploaded_date`








