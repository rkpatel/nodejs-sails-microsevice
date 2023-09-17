ALTER TABLE `masterdb`.`user`   
  ADD COLUMN `primary_user` ENUM('Yes','No') NULL AFTER `portal_access`;
/*Table structure for table `account` */ 
ALTER TABLE `masterdb`.`account`  
  DROP FOREIGN KEY `last_updated_by_user`;

ALTER TABLE `masterdb`.`account`   
  ADD COLUMN `phone` VARCHAR(20) NOT NULL AFTER `email`,
  ADD COLUMN `country_id` INT NOT NULL AFTER `phone`,
  ADD COLUMN `state_id` INT NOT NULL AFTER `country_id`,
  ADD COLUMN `city_id` INT NOT NULL AFTER `state_id`,
  ADD COLUMN `zip` VARCHAR(20) NOT NULL AFTER `city_id`,
  ADD COLUMN `company_logo_url` VARCHAR(250) NOT NULL AFTER `zip`,
  ADD COLUMN `website_url` VARCHAR(250) NULL AFTER `company_logo_url`,
  ADD COLUMN `stripe_customer_id` VARCHAR(250) NOT NULL AFTER `website_url`; 
/*Table structure for table `account_subscription` */ 

ALTER TABLE `masterdb`.`account_subscription`   
  CHANGE `seats_used` `seats` INT(11) NOT NULL,
  CHANGE `stripe_account_id` `stripe_customer_id` VARCHAR(255) CHARSET latin1 COLLATE latin1_swedish_ci NULL,
  CHANGE `amount` `amount_total` DOUBLE NULL,
  CHANGE `next_payment_date` `next_payment_date` DATE NULL;
ALTER TABLE `masterdb`.`account_subscription`   
  DROP COLUMN `subscription_plan_tier_id`;

ALTER TABLE `masterdb`.`account_subscription` 
ADD COLUMN `stripe_subscription_id` VARCHAR(255) NULL AFTER `account_id`;
ADD COLUMN `stripe_product_id` VARCHAR(250) NULL AFTER `stripe_customer_id`,
ADD COLUMN `stripe_product_name` VARCHAR(255) NULL AFTER `stripe_product_id`; 
ADD COLUMN `stripe_price_id` VARCHAR(250) NULL AFTER `stripe_product_id`,
ADD COLUMN `stripe_payment_intent_id` VARCHAR(250) NULL AFTER `stripe_price_id`,
ADD COLUMN `stripe_payment_method_id` VARCHAR(250) NULL AFTER `stripe_payment_intent_id`,
ADD COLUMN `stripe_latest_invoice_id` VARCHAR(250) NULL AFTER `stripe_payment_method_id`,
ADD COLUMN `stripe_coupon_id` VARCHAR(250) NULL AFTER `stripe_latest_invoice_id`, 
ADD COLUMN `amount_subtotal` DOUBLE NULL AFTER `amount_total`, 
ADD COLUMN `billing_cycle` ENUM('Monthly') CHARSET latin1 COLLATE latin1_swedish_ci NULL AFTER `amount_subtotal`,
ADD COLUMN `currency` VARCHAR(250) NULL AFTER `billing_cycle`,
ADD COLUMN `free_trial` ENUM('Yes','No') CHARSET latin1 COLLATE latin1_swedish_ci NULL AFTER `currency`,
ADD COLUMN `free_trial_days` INT NULL AFTER `free_trial`,
ADD COLUMN `price_per_user` DOUBLE NULL AFTER `free_trial_days`,
ADD COLUMN `payment_start_date` DATE DEFAULT NULL AFTER `next_payment_date`,
ADD COLUMN `created_date` DATETIME NULL AFTER `status`,
ADD COLUMN `created_by` DATETIME NULL AFTER `created_date`; 
ALTER TABLE `masterdb`.`account_subscription`   
  CHANGE `last_payment_status` `payment_status` ENUM('Success','Failure') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL,
  CHANGE `status` `subscription_status` ENUM('Active','Inactive') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;
/*Table structure for table `account_subscription_history` */ 

ALTER TABLE `masterdb`.`account_subscription_history`   
  DROP COLUMN `subscription_plan_tier_id`;
ALTER TABLE `masterdb`.`account_subscription_history`
  CHANGE `stripe_account_id` `stripe_customer_id` VARCHAR(250) CHARSET latin1 COLLATE latin1_swedish_ci NULL,
  CHANGE `amount` `amount_total` DOUBLE NULL;    
ALTER TABLE `masterdb`.`account_subscription_history` 
ADD COLUMN `stripe_product_id` VARCHAR(250) NULL AFTER `stripe_customer_id`,
ADD COLUMN `stripe_price_id` VARCHAR(250) NULL AFTER `stripe_product_id`,
ADD COLUMN `stripe_payment_intent_id` VARCHAR(250) NULL AFTER `stripe_price_id`,
ADD COLUMN `stripe_payment_method_id` VARCHAR(250) NULL AFTER `stripe_payment_intent_id`,
ADD COLUMN `stripe_latest_invoice_id` VARCHAR(250) NULL AFTER `stripe_payment_method_id`,
ADD COLUMN `stripe_coupon_id` VARCHAR(250) NULL AFTER `stripe_latest_invoice_id`, 
ADD COLUMN `amount_subtotal` DOUBLE NULL AFTER `amount_total`, 
ADD COLUMN `billing_cycle` ENUM('Monthly') CHARSET latin1 COLLATE latin1_swedish_ci NULL AFTER `amount_subtotal`,
ADD COLUMN `currency` VARCHAR(250) NULL AFTER `billing_cycle`,
ADD COLUMN `free_trial` ENUM('Yes','No') CHARSET latin1 COLLATE latin1_swedish_ci NULL AFTER `currency`,
ADD COLUMN `free_trial_days` INT NULL AFTER `free_trial`,
ADD COLUMN `seats` INT NOT NULL AFTER `free_trial_days`,
ADD COLUMN `price_per_user` DOUBLE NULL AFTER `seats`,
ADD COLUMN `status` ENUM('Active','Inactive') CHARSET latin1 COLLATE latin1_swedish_ci NULL AFTER `last_payment_status`,
ADD COLUMN `next_payment_date` DATE DEFAULT NULL AFTER `price_per_user`,
ADD COLUMN `payment_start_date` DATE DEFAULT NULL AFTER `next_payment_date`,
ADD COLUMN `last_updated_date` DATETIME NULL AFTER `status`,
ADD COLUMN `last_updated_by` INT NULL AFTER `created_date`;

ALTER TABLE `masterdb`.`account_subscription_history` 
  CHANGE `last_payment_status` `payment_status` ENUM('Success','Failure') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL,
  CHANGE `status` `subscription_status` ENUM('Active','Inactive') CHARSET latin1 COLLATE latin1_swedish_ci NULL;
/*Table structure for table `account_billing` */

CREATE TABLE `masterdb`.`account_billing`(  
  `account_billig_id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `account_subscription_id` INT,
  `address` VARCHAR(250) NOT NULL,
  `country_id` INT NOT NULL,
  `state_id` INT NOT NULL,
  `city_id` INT NOT NULL,
  `zip` VARCHAR(20) NOT NULL,
  `created_by` INT,
  `created_date` DATETIME,
  `last_updated_by` INT,
  `last_updated_date` DATETIME,
  PRIMARY KEY (`account_billig_id`),
  CONSTRAINT `account_id` FOREIGN KEY (`account_id`) REFERENCES `masterdb`.`account`(`account_id`) ON UPDATE CASCADE ON DELETE CASCADE
);

/* queries of 17-12-21*/
ALTER TABLE `masterdb`.`account_subscription`
CHANGE `payment_status` `payment_status` ENUM('Success','Failure','Initiated') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE `masterdb`.`account_subscription_history`
ADD COLUMN `stripe_subscription_id` VARCHAR(255) NULL AFTER `account_subscription_id`;

ALTER TABLE `masterdb`.`account_subscription`
CHANGE `created_by` `created_by` INT(11) NULL;

/* queries for 20-12-21*/

/*Notification template*/
INSERT INTO `masterdb`.`notification_template_master`(`notification_template_id`,`name`,`description`,`code`,`notification_type`,`subject`,`body`,`status`,`default_recipeints`,`created_by`,`created_date`,`last_updated_by`,`last_updated_date`) values 
(3,'Create Password Customer','Template for Creating Password for Customer','CREATE_PASSWORD_CUSTOMER','Email','Welcome to OneTeam360!','<html lang=\"en\">\r\n  <head>\r\n    <!-- Required meta tags -->\r\n    <meta charset=\"utf-8\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n\r\n    <link\r\n      href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\"\r\n      rel=\"stylesheet\"\r\n    />\r\n    <style>\r\n      html,\r\n      body {\r\n        font-family: \"Lato\", sans-serif;\r\n      }\r\n    </style>\r\n  </head>\r\n  <body>\r\n    <div>\r\n      <h4 style=\"margin-bottom: 30px\">Hello <<first_name>> <<last_name>>,</h4>\r\n      <p style=\"margin-bottom: 10px; font-size: 14px\">\r\n        You have been set as the primary contact for your company\'s OneTeam360 workspace. Please follow the link below to create your account and begin onboarding your employees.\r\n      </p>\r\n      <a href=\"<<link>>\">Password Creation link</a>   \r\n	<p>If you need help or have any questions, email us anytime!</p>\r\n      <h5 style=\"margin-bottom: 5px\">Sincerely,</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">Customer Service</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">OneTeam360</h5>\r\n    </div>\r\n  </body>\r\n</html>','Active','',7,'2021-12-17 18:44:23',NULL,NULL),
(4,'Customer Payment Declined','Template for Customer Payment Declined','PAYMENT_DECLINED_CUSTOMER','Email','OneTeam360 – Payment Declined','<html lang=\"en\">\r\n  <head>\r\n    <!-- Required meta tags -->\r\n    <meta charset=\"utf-8\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n\r\n    <link\r\n      href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\"\r\n      rel=\"stylesheet\"\r\n    />\r\n    <style>\r\n      html,\r\n      body {\r\n        font-family: \"Lato\", sans-serif;\r\n      }\r\n    </style>\r\n  </head>\r\n  <body>\r\n    <div>\r\n      <h4 style=\"margin-bottom: 30px\">Hello <<first_name>> <<last_name>>,</h4>\r\n      <p style=\"margin-bottom: 10px; font-size: 14px\">\r\n        We were unable to process your payment for <<amount>> but the card on file was declined.<br/>\r\n	This can happen for a number of reasons, but we encourage you to check your payment details and make any necessary updates from the link below.\r\n      </p>\r\n      <a href=\"<<link>>\"><<link>></a>   \r\n	<p> Thank you and let us know if you have any questions.</p>\r\n      <h5 style=\"margin-bottom: 5px\">Sincerely,</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">Customer Service</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">OneTeam360</h5>\r\n    </div>\r\n  </body>\r\n</html>','Active','',7,'2021-12-20 14:50:33',NULL,NULL);

/* queries of 21-12-21 */
ALTER TABLE `masterdb`.`account_subscription`
CHANGE `subscription_status` `subscription_status` ENUM('Active','Inactive','Canceled') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;
ALTER TABLE `masterdb`.`account`   
  CHANGE `company_logo_url` `company_logo_url` VARCHAR(250) CHARSET latin1 COLLATE latin1_swedish_ci NULL;
  
ALTER TABLE `masterdb`.`account`   
  CHANGE `phone` `phone` VARCHAR(20) CHARSET latin1 COLLATE latin1_swedish_ci NULL;
/* queries by Anjali*/
ALTER TABLE `masterdb`.`account`
CHANGE COLUMN `status` `status` ENUM('Payment Pending', 'Payment Declined', 'Active', 'Inactive', 'Cancelled') NOT NULL ;  
/* queries for 22-12-21*/
ALTER TABLE `masterdb`.`account_configuration`   
  CHANGE `code` `code` VARCHAR(250) CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;
ALTER TABLE `masterdb`.`account_configuration_detail`   
  CHANGE `code` `code` VARCHAR(250) CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;
  
INSERT INTO `masterdb`.`notification_template_master`(`notification_template_id`,`name`,`description`,`code`,`notification_type`,`subject`,`body`,`status`,`default_recipeints`,`created_by`,`created_date`,`last_updated_by`,`last_updated_date`) values 
(5,'Payment Link Customer','Template for sending Payment Link to Customer','PAYMENT_LINK_CUSTOMER','Email','OneTeam360 - Add Payment Details','<html lang=\"en\">\r\n  <head>\r\n    <!-- Required meta tags -->\r\n    <meta charset=\"utf-8\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n\r\n    <link\r\n      href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\"\r\n      rel=\"stylesheet\"\r\n    />\r\n    <style>\r\n      html,\r\n      body {\r\n        font-family: \"Lato\", sans-serif;\r\n      }\r\n    </style>\r\n  </head>\r\n  <body>\r\n    <div>\r\n      <h4 style=\"margin-bottom: 30px\">Hello <<first_name>> <<last_name>>,</h4>\r\n      <p style=\"margin-bottom: 10px; font-size: 14px\">\r\n        Thank you for choosing OneTeam360 to build and engage your staff. Please use the below link to fill out payment details for your company subscription.\r\n      </p>\r\n      <a href=\"<<link>>\"><<link>></a>   \r\n	<p> We\'re looking forward to helping you save time and eliminate headaches around staff performance.</p>\r\n      <h5 style=\"margin-bottom: 5px\">Sincerely,</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">Customer Service</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">OneTeam360</h5>\r\n    </div>\r\n  </body>\r\n</html>','Active','',7,'2021-12-22 09:59:54',NULL,NULL),
(6,'Notification to Primary User ','Template for sending notification to Primary User','NOTIFICATION_CUSTOMER','Email','OneTeam360 Notification','<html lang=\"en\">\r\n  <head>\r\n    <!-- Required meta tags -->\r\n    <meta charset=\"utf-8\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n\r\n    <link\r\n      href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\"\r\n      rel=\"stylesheet\"\r\n    />\r\n    <style>\r\n      html,\r\n      body {\r\n        font-family: \"Lato\", sans-serif;\r\n      }\r\n    </style>\r\n  </head>\r\n  <body>\r\n    <div>\r\n      <h4 style=\"margin-bottom: 30px\">Hello <<first_name>> <<last_name>>,</h4>\r\n      <p style=\"margin-bottom: 10px; font-size: 14px\">\r\n        You have been set as the primary contact for your company\'s OneTeam360 workspace. Please log into customer portal to access the features.</p>  \r\n      <h5 style=\"margin-bottom: 5px\">Sincerely,</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">Customer Service</h5>\r\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\">OneTeam360</h5>\r\n    </div>\r\n  </body>\r\n</html>','Active','',7,'2021-12-24 18:00:32',NULL,NULL);

ALTER TABLE `masterdb`.`account`   
  CHANGE `address` `address` VARCHAR(250) CHARSET latin1 COLLATE latin1_swedish_ci NULL,
  CHANGE `country_id` `country_id` INT(11) NULL,
  CHANGE `state_id` `state_id` INT(11) NULL,
  CHANGE `city_id` `city_id` INT(11) NULL,
  CHANGE `zip` `zip` VARCHAR(20) CHARSET latin1 COLLATE latin1_swedish_ci NULL;

ALTER TABLE `masterdb`.`account_billing`
CHANGE COLUMN `address` `address` VARCHAR(250) NULL ,
CHANGE COLUMN `country_id` `country_id` INT(11) NULL ,
CHANGE COLUMN `state_id` `state_id` INT(11) NULL ,
CHANGE COLUMN `city_id` `city_id` INT(11) NULL ,
CHANGE COLUMN `zip` `zip` VARCHAR(20) NULL ;  

ALTER TABLE `masterdb`.`account_subscription_history`
CHANGE `payment_status` `payment_status` ENUM('Success','Failure','Initiated') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER TABLE `masterdb`.`account_subscription_history`
CHANGE `subscription_status` `subscription_status` ENUM('Active','Inactive','Canceled') CHARSET latin1 COLLATE latin1_swedish_ci NULL;
/* 27-12-21 */
ALTER TABLE `masterdb`.`account`   
  ADD COLUMN `source` ENUM('Admin','Public') NULL AFTER `stripe_customer_id`;

ALTER TABLE `masterdb`.`account_subscription`
ADD COLUMN `stripe_sid` VARCHAR(255) NULL AFTER `stripe_latest_invoice_id`;


ALTER TABLE `masterdb`.`account_subscription_history`
ADD COLUMN `stripe_sid` VARCHAR(255) NULL AFTER `stripe_latest_invoice_id`;  
/*28-12-21*/
ALTER TABLE `masterdb`.`account`   
  ADD COLUMN `user_exists` ENUM('','Yes','No') NULL AFTER `source`;
ALTER TABLE `masterdb`.`account`   
  CHANGE `source` `source` ENUM('Admin','Public') CHARSET latin1 COLLATE latin1_swedish_ci DEFAULT 'Public'  NULL;  
/*30-12-21*/
CREATE TABLE `account_update_subscription` (
`account_update_subscription_id` INT(11) NOT NULL AUTO_INCREMENT ,
`account_subscription_id` INT (11),
`stripe_subscription_id` VARCHAR (765),
`seats` INT (11),
`next_payment_date` DATE ,
`payment_start_date` DATE ,
`stripe_product_id` VARCHAR (750),
`stripe_product_name` VARCHAR (765),
`stripe_price_id` VARCHAR (750),
`stripe_latest_invoice_id` VARCHAR (750),
`stripe_sid` VARCHAR (765),
`amount_due` DOUBLE ,
`amount_total` DOUBLE ,
`amount_subtotal` DOUBLE ,
`billing_cycle` CHAR (21),
`created_date` DATETIME ,
`created_by` INT (11),
`last_updated_date` DATETIME NULL,
`last_updated_by` INT (11),
PRIMARY KEY (`account_update_subscription_id`)
);

ALTER TABLE `account_subscription`   
  ADD COLUMN `paymentlinktoken` VARCHAR(10) NULL AFTER `last_updated_by`;

ALTER TABLE `account_update_subscription`   
  ADD COLUMN `currency` VARCHAR(20) NULL AFTER `billing_cycle`;
  
ALTER TABLE `account`
MODIFY COLUMN name varchar(160);  

ALTER TABLE `account_subscription`
CHANGE `billing_cycle` `billing_cycle` ENUM('Monthly','Yearly','Daily') CHARSET latin1 COLLATE latin1_swedish_ci NULL;

/*10-1-2022*/
DROP TABLE IF EXISTS `admin_settings`;

CREATE TABLE `admin_settings` (
  `admin_settings_id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `code` varchar(250) NOT NULL,
  `value` varchar(250) NOT NULL,
  PRIMARY KEY (`admin_settings_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `admin_settings` */

insert  into `admin_settings`(`admin_settings_id`,`name`,`code`,`value`) values (1,'Free Trial Days','free_trial_days','10');