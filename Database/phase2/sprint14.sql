INSERT INTO `permission_module`(`permission_module_id`,`parent_permission_module_id`,`name`,`code`,`description`,`sequence`,`status`,`created_by`,`created_date`) values ('17','0','360 Feedback Report','360_Feedback_Report','360 Feedback Report','15','Active','1','2022-06-23 19:45:34');
insert  into `permission`(`permission_id`,`permission_module_id`,`parent_permission_id`,`name`,`code`,`description`,`sequence`,`status`,`created_by`,`created_date`) values 
('88','13','0','View All Locations','View_All_Locations','Allow user to view all locations','3','Active',NULL,NULL),
('89','13','0','View All Job Types','View_All_JobTypes','Allow user to view all job types','4','Active',NULL,NULL),
('90','7','0','360 Feedback Management','360_Feedback_Management','Allows user to operate 360 feedback management if s/he has view system management permission','12','Active',NULL,NULL),
('91','17','0','View Manager Report','View_Manager_Report','Allow user to view manager report if s/he has permission','1','Active',NULL,NULL),
('92','17','0','View Location Report','View_Location_Report','Allow user to view location report if s/he has permission','2','Active',NULL,NULL),
('93','17','0','Receive Weekly Digest','Receive_Weekly_Digest','Allow user to receive weekly 360 feedback report digest over email','3','Active',NULL,NULL),
('94','17','0','View non-Anonymous Feedback Report','View_nonAnonymous_Feedback_Report','Allow user to view 360 feedback report in non-anonymous manner','4','Active',NULL,NULL);
/*Table structure for table `feedback_question` */

DROP TABLE IF EXISTS `feedback_question`;
CREATE TABLE `feedback_question` (
  `feedback_question_id` int(11) NOT NULL AUTO_INCREMENT,
  `feedback_category` enum('Manager','Location') NOT NULL,
  `question` text NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive') NOT NULL,
  `sequence` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT NULL,
  PRIMARY KEY (`feedback_question_id`),
  KEY `feedback_question_ibfk_1` (`created_by`),
  KEY `feedback_question_ibfk_2` (`modified_by`),
  CONSTRAINT `feedback_question_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_question_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_question_location` */

DROP TABLE IF EXISTS `feedback_question_location`;
CREATE TABLE `feedback_question_location` (
  `feedback_question_location_id` int(11) NOT NULL AUTO_INCREMENT,
  `feedback_question_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`feedback_question_location_id`),
  KEY `feedback_question_location_ibfk_1` (`feedback_question_id`),
  KEY `feedback_question_location_ibfk_2` (`location_id`),
  CONSTRAINT `feedback_question_location_ibfk_1` FOREIGN KEY (`feedback_question_id`) REFERENCES `feedback_question` (`feedback_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_question_location_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_rating_scale` */

DROP TABLE IF EXISTS `feedback_rating_scale`;
CREATE TABLE `feedback_rating_scale` (
  `feedback_rating_scale_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `scale` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_by` int(11) DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT NULL,
  PRIMARY KEY (`feedback_rating_scale_id`),
  KEY `feedback_rating_scale_ibfk_1` (`created_by`),
  KEY `feedback_rating_scale_ibfk_2` (`modified_by`),
  CONSTRAINT `feedback_rating_scale_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_rating_scale_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `feedback_answer` */

DROP TABLE IF EXISTS `feedback_answer`;
CREATE TABLE `feedback_answer` (
  `feedback_answer_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_profile_id` int(11) NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `feedback_question_id` int(11) NOT NULL,
  `feedback_rating_scale_id` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`feedback_answer_id`),
  KEY `feedback_answer_ibfk_1` (`employee_profile_id`),
  KEY `feedback_answer_ibfk_2` (`manager_id`),
  KEY `feedback_answer_ibfk_3` (`location_id`),
  KEY `feedback_answer_ibfk_4` (`feedback_question_id`),
  KEY `feedback_answer_ibfk_5` (`feedback_rating_scale_id`),
  KEY `feedback_answer_ibfk_6` (`created_by`),
  CONSTRAINT `feedback_answer_ibfk_1` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_2` FOREIGN KEY (`manager_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_4` FOREIGN KEY (`feedback_question_id`) REFERENCES `feedback_question` (`feedback_question_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_5` FOREIGN KEY (`feedback_rating_scale_id`) REFERENCES `feedback_rating_scale` (`feedback_rating_scale_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `feedback_answer_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `masterdb`.`user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Very Unsatisfied', 'Very Unsatisfied', 1, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Unsatisfied', 'Unsatisfied', 2, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Normal', 'Normal', 3, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Satisfied', 'Satisfied', 4, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');
INSERT INTO `feedback_rating_scale` (`name`, `description`, `scale`, `status`, `created_by`, `created_date`, `modified_by`, `modified_date`) VALUES ( 'Very Satisfied', 'Very Satisfied', 5, 'Active', 8, '2022-06-04 05:23:41', 8, '2022-06-04 05:23:41');

INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Weekly Feedback Report', 'WEEKLY_FEEDBACK_REPORT', 'Cron job for send weekly feedback report');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Weekly Feedback Report', 'Template for Weekly Feedback Report', 'FEEDBACK_REPORT_DIGEST', 'Email', '360 Feedback Report – Last Week', 
'<!doctype html>
<html lang="en-US">

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
  <title>Email Template</title>
  <meta name="description" content="Notifications Email Template">
  <style type="text/css">
   html, body{
         font-family: "Lato", sans-serif;
         color: #34444c;
       }
    a:hover {text-decoration: none !important;}
    :focus {outline: none;border: 0;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff" leftmargin="0">
  <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center; max-width: 620px; width: 620px;">
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Weekly FeedBack Report Digest</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-bulk-import-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<user_name>> ,</strong></h4>
                    <<dynamic_template>>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        <td style="width: 20%;">&nbsp;</td>
                          <td style="border-radius: 2px; text-align: center; width: 60%;" align="center">
                          <p>Click <a href="<<customer_portal_link>>" target="_blank">here</a> to view full details of each report.</p>
                          </td>
                          <td style="width: 30%;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '7', '2022-06-12 16:56:13');


UPDATE `notification_template` SET `subject` = 'Daily Score Available', `body` = 'Visit your profile to see today’s updated points.' WHERE (`code` = 'EMPLOYEE_POINTS_UPDATE' AND `notification_type` = 'InApp');
UPDATE `notification_template` SET `subject` = 'Daily Score Available', `body` = 'Visit your profile to see today’s updated points.' WHERE (`code` = 'EMPLOYEE_POINTS_UPDATE' AND `notification_type` = 'Mobile');


ALTER TABLE `announcement`   
  ADD COLUMN `short_description` TEXT NULL AFTER `name`;

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Employee point update', 'Push Notification when employee Point change', 'POINT_CALCULATION_FEEDBACK', 'InApp', 'Daily Score Available', 'Click here to give us feedback and view your updated points.', 'Active', '131', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Employee point update', 'Push Notification when employee Point change', 'POINT_CALCULATION_FEEDBACK', 'Mobile', 'Daily Score Available', 'Click here to give us feedback and view your updated points.', 'Active', '131', '2021-06-10 16:56:13');
ALTER TABLE `report_submission_detail` 
ADD COLUMN `notes` TEXT NULL AFTER `answer`;

ALTER TABLE `report_submission` 
ADD COLUMN `status` ENUM('submitted', 'draft') NULL AFTER `reported_date`;
