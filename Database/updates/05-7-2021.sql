ALTER TABLE `masterdb`.`account` 
ADD COLUMN `account_email` VARCHAR(250) NOT NULL AFTER `last_updated_date`;
