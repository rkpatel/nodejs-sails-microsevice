/*
SQLyog Community v12.09 (64 bit)
MySQL - 5.7.14 : Database - masterdb
*********************************************************************
*/


/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

ALTER TABLE `user` CHANGE `date_of_birth` `date_of_birth` DATE NULL;

ALTER TABLE `user` CHANGE `status` `status` ENUM('Invited','Active','Inactive') CHARSET latin1 COLLATE latin1_swedish_ci NOT NULL;

/*Table structure for table `notification_template_master` */

DROP TABLE IF EXISTS `notification_template_master`;

CREATE TABLE `notification_template_master` (
  `notification_template_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `notification_type` enum('SMS','Email','Mobile','InApp') NOT NULL,
  `subject` varchar(100) NOT NULL,
  `body` text NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `default_recipeints` varchar(250) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `last_updated_by` int(11) DEFAULT NULL,
  `last_updated_date` datetime DEFAULT NULL,
  PRIMARY KEY (`notification_template_id`),
  KEY `createdBy_notification_idx` (`created_by`),
  KEY `updatedby_notification_idx` (`last_updated_by`),
  CONSTRAINT `createdBy_notification_idx` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `updatedby_notification_idx` FOREIGN KEY (`last_updated_by`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Data for the table `notification_template_master` */

insert  into `notification_template_master`(`notification_template_id`,`name`,`description`,`code`,`notification_type`,`subject`,`body`,`status`,`default_recipeints`,`created_by`,`created_date`,`last_updated_by`,`last_updated_date`) values (1,'Create Password','Template for Creating Password','CREATE_PASSWORD_ADMIN','Email','OneTeam360 Admin Portal Access','<html lang=\"en\">\n  <head>\n    <!-- Required meta tags -->\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\n    <link\n      href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\"\n      rel=\"stylesheet\"\n    />\n    <style>\n      html,\n      body {\n        font-family: \"Lato\", sans-serif;\n      }\n    </style>\n  </head>\n  <body>\n    <div>\n      <h4 style=\"margin-bottom: 30px\">Hello <<first_name>> <<last_name>>,</h4>\n      <p style=\"margin-bottom: 10px; font-size: 14px\">\n        You have been added as an admin user to manage OneTeam360 administration portal.\r\nPlease create password to complete your setup.\n      </p>\n      <a href=\"<<link>>\">Password Creation link</a>      \n      <h5 style=\"margin-bottom: 5px\">Thank you,</h5>\n      <h5 style=\"margin-bottom: 5px; margin-top: 0\"><<account_name>></h5>\n      <h5 style=\"margin-bottom: 0; margin-top: 0\"><<account_email>></h5>\n    </div>\n  </body>\n</html>','Active','',7,'2021-06-10 16:56:13',166,'2021-11-18 17:59:59'),(2,'Reset Password','Template fot Reset Password','RESET_PASSWORD_ADMIN','Email','Reset Your Password, <<first_name>> <<last_name>>','<html lang=\"en\">\n      <head>\n        <!-- Required meta tags -->\n        <meta charset=\"utf-8\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    \n        <link href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\" rel=\"stylesheet\">\n        <style>\n          html, body{\n            font-family: \"Lato\", sans-serif;\n          }\n        </style>\n      </head>\n      <body>\n      <div>\n        <h4 style=\"margin-bottom:30px;\">Hello  <<first_name>> <<last_name>>,</h4>\n        <p style=\"margin-bottom:10px;font-size:14px\">Please reset your password using the below given link.</p>\n        <a href=\"<<link>>\">Reset Password</a>\n        <p style=\"font-size:14px;\">If you need any assistance in the process, please email us at below mentioned email ID.</p>\n        <h5 style=\"margin-bottom:5px;\">Thank you,</h5>\n        <h5 style=\"margin-bottom:5px;margin-top:0;\"><<account_name>></h5>\n        <h5 style=\"margin-bottom:0;margin-top:0;\"><<account_email>></h5>\n      </div>\n      </body>\n    </html>','Active','',7,'2021-06-10 16:56:13',166,NULL);


/*Table structure for table `notification_queue_master` */

DROP TABLE IF EXISTS `notification_queue_master`;

CREATE TABLE `notification_queue_master` (
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
  CONSTRAINT `notification_template` FOREIGN KEY (`notification_template_id`) REFERENCES `notification_template_master` (`notification_template_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

/*Data for the table `notification_queue_master` */

/*Table structure for table `notification_queue_recipient_master` */

DROP TABLE IF EXISTS `notification_queue_recipient_master`;

CREATE TABLE `notification_queue_recipient_master` (
  `notification_queue_recipient_id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_queue_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_date` datetime DEFAULT NULL,
  `to_cc` enum('To','CC') NOT NULL,
  `recipient_email` text,
  PRIMARY KEY (`notification_queue_recipient_id`)
) /*!50100 TABLESPACE `innodb_system` */ ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

/*Data for the table `notification_queue_recipient_master` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


UPDATE `masterdb_qa`.`notification_template_master` SET `body` = '<html lang=\"en\">\r   <head>\r     <!-- Required meta tags -->\r     <meta charset=\"utf-8\" />\r     <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r \r     <link\r       href=\"https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap\"\r       rel=\"stylesheet\"\r     />\r     <style>\r       html,\r       body {\r         font-family: \"Lato\", sans-serif;\r       }\r     </style>\r   </head>\r   <body>\r     <div>\r       <h4 style=\"margin-bottom: 30px\">Hello <<first_name>> <<last_name>>,</h4>\r       <p style=\"margin-bottom: 10px; font-size: 14px\">\r         We were unable to process your payment for <<currency>> <<amount>> but the card on file was declined.<br/>\r 	This can happen for a number of reasons, but we encourage you to check your payment details and make any necessary updates from the link below.\r       </p>\r       <a href=\"<<link>>\"><<link>></a>   \r 	<p> Thank you and let us know if you have any questions.</p>\r       <h5 style=\"margin-bottom: 5px\">Sincerely,</h5>\r       <h5 style=\"margin-bottom: 5px; margin-top: 0\">Customer Service</h5>\r       <h5 style=\"margin-bottom: 5px; margin-top: 0\">OneTeam360</h5>\r     </div>\r   </body>\r </html>' WHERE (`notification_template_id` = '4');
