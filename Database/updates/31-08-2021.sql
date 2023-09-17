ALTER TABLE `notification_queue_recipient` 
CHANGE COLUMN `recipient_email` `recipient_email` TEXT NULL DEFAULT NULL ;


ALTER TABLE `masterdb`.`user_login_log` 
CHANGE COLUMN `device_id` `device_id` TEXT NULL DEFAULT NULL ;
