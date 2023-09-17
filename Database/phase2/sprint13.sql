INSERT INTO
    `notification_template` (
        `name`,
        `description`,
        `code`,
        `notification_type`,
        `subject`,
        `body`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        'Check-in Request!',
        'There are pending check-in requests for <<body>> location. Please review it.',
        'CHECKIN_REQUEST',
        'InApp',
        'Check-in Request!',
        'There are pending check-in requests for <<body>> location. Please review it.',
        'Active',
        '8',
        '2021-06-10 16:56:13'
    );

INSERT INTO
    `notification_template` (
        `name`,
        `description`,
        `code`,
        `notification_type`,
        `subject`,
        `body`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        'Check-in Request!',
        'There are pending check-in requests for <<body>> location. Please review it.',
        'CHECKIN_REQUEST',
        'Mobile',
        'Check-in Request!',
        'There are pending check-in requests for <<body>> location. Please review it.',
        'Active',
        '8',
        '2021-06-10 16:56:13'
    );

INSERT INTO
    `cron_job` (`name`, `code`, `description`)
VALUES
    (
        'CheckIn Request',
        'CHECKIN_REQUEST',
        'Cron job for Check In request'
    );

/*Table structure for table `employee_checkin` */

DROP TABLE IF EXISTS `employee_checkin`;

CREATE TABLE `employee_checkin` (
    `employee_checkin_id` int(11) NOT NULL AUTO_INCREMENT,
    `employee_profile_id` int(11) NOT NULL,
    `location_id` int(11) NOT NULL,
    `request_status` enum('Pending', 'Approved', 'Rejected', 'CheckedOut') NOT NULL DEFAULT 'Pending',
    `reviewer_status` varchar(15) DEFAULT NULL,
    `reviewed_by` int(11) DEFAULT NULL,
    `checkin_datetime` datetime DEFAULT NULL,
    `checkout_datetime` datetime DEFAULT NULL,
    `reviewed_datetime` datetime DEFAULT NULL,
    PRIMARY KEY (`employee_checkin_id`),
    KEY `employee_checkin_ibfk_1` (`employee_profile_id`),
    KEY `employee_checkin_ibfk_2` (`location_id`),
    KEY `employee_checkin_ibfk_3` (`reviewed_by`),
    CONSTRAINT `employee_checkin_ibfk_1` FOREIGN KEY (`employee_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `employee_checkin_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `employee_checkin_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Certificate Report',
        'Certificate_Report',
        'Certificate Report',
        '10',
        'Active',
        '1',
        '2022-06-07 10:13:36'
    );

INSERT INTO
    `permission`(
        `permission_id`,
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '84',
        '15',
        '0',
        "View Certificate Report",
        "View_Certificate_Report",
        "Allows user to view certificate report menu option within the system.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_id`,
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '85',
        '15',
        '84',
        "Export Certificate Report",
        "Export_Certificate_Report",
        "Allows user to export excel if he has ‘View Certificate Report’ permission.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_id`,
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '86',
        '15',
        '0',
        "Receive Certificate Report Digest",
        "Receive_Certificate_Report_Digest",
        "Allows the user to receive certificate report digest on monthly basis over email.",
        '1',
        "Active"
    );

INSERT INTO
    `permission`(
        `permission_id`,
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`
    )
VALUES
    (
        '87',
        '1',
        '0',
        "Approve/Deny Check-in",
        "Review_Check_in",
        "Allow user to approve/deny check-in of team members.",
        '10',
        "Active"
    );

INSERT INTO
    `notification_template` (
        `name`,
        `description`,
        `code`,
        `notification_type`,
        `subject`,
        `body`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        'Checked-in!',
        'Your check-in at <<location>> was confirmed.',
        'ACCEPT_CHECKIN_REQUEST',
        'InApp',
        'Checked-in!',
        'Your check-in at <<location>> was confirmed.',
        'Active',
        '8',
        '2021-06-10 16:56:13'
    );

INSERT INTO
    `notification_template` (
        `name`,
        `description`,
        `code`,
        `notification_type`,
        `subject`,
        `body`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        'Checked-in!',
        'Your check-in at <<location>> was confirmed.',
        'ACCEPT_CHECKIN_REQUEST',
        'Mobile',
        'Checked-in!',
        'Your check-in at <<location>> was confirmed.',
        'Active',
        '8',
        '2021-06-10 16:56:13'
    );

INSERT INTO
    `notification_template` (
        `name`,
        `description`,
        `code`,
        `notification_type`,
        `subject`,
        `body`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        'Check-in Rejected',
        'Your check-in at <<location>> was rejected. Click here to check-in again!',
        'REJECT_CHECKIN_REQUEST',
        'InApp',
        'Check-in Rejected',
        'Your check-in at <<location>> was rejected. Click here to check-in again!',
        'Active',
        '8',
        '2021-06-10 16:56:13'
    );

INSERT INTO
    `notification_template` (
        `name`,
        `description`,
        `code`,
        `notification_type`,
        `subject`,
        `body`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        'Check-in Rejected',
        'Your check-in at <<location>> was rejected. Click here to check-in again!',
        'REJECT_CHECKIN_REQUEST',
        'Mobile',
        'Check-in Rejected',
        'Your check-in at <<location>> was rejected. Click here to check-in again!',
        'Active',
        '8',
        '2021-06-10 16:56:13'
    );

INSERT INTO `cron_job` (`name`, `code`, `description`) VALUES ('Monthly Expire Certificates', 'MONTHLY_CERTIFICATE_EXPIRE', 'Cron job for send monthly expired and about to expire certificate');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Certificate Report Digest', 'Template when Certificate Report Digest', 'CERTIFICATE_REPORT_DIGEST', 'Email', '<<month>>’s Certificate Report', 
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Monthly Report Digest</h1>
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
                    <p style="margin-bottom:20px;font-size:15px">Your team’s certificate report for the month of <month> is now available in OneTeam360 for review, and an exported version is attached to this email.</p>
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
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<company_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>
</html>', 'Active', '7', '2022-06-12 16:56:13');
ALTER TABLE `employee_checkin`   
  CHANGE `request_status` `request_status` ENUM('Pending','Approved','Rejected','CheckedOut','AutoRejected') CHARSET utf8mb4 DEFAULT 'Pending'  NOT NULL;
  
CREATE TABLE `checkin_status`(  
  `checkin_status_id` INT(10) NOT NULL AUTO_INCREMENT,
  `checkin_status` ENUM('Approved','Rejected'),
  `weighted_tier_id` INT(11),
  `impact_multiplier_id` INT(11) NOT NULL,
  PRIMARY KEY (`checkin_status_id`, `impact_multiplier_id`),
  INDEX (`weighted_tier_id`, `impact_multiplier_id`),
  INDEX (`impact_multiplier_id`),
  FOREIGN KEY (`weighted_tier_id`) REFERENCES `masterdb`.`weighted_tier`(`weighted_tier_id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`impact_multiplier_id`) REFERENCES `masterdb`.`impact_multiplier`(`impact_multiplier_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=INNODB;

insert into `checkin_status` (`checkin_status_id`, `checkin_status`, `weighted_tier_id`, `impact_multiplier_id`) values('1','Approved','4','4');
insert into `checkin_status` (`checkin_status_id`, `checkin_status`, `weighted_tier_id`, `impact_multiplier_id`) values('2','Rejected','4','2');

ALTER TABLE `employee_point_audit` ADD COLUMN `checkin_score` DECIMAL(11,0) NULL AFTER `training_score`;

INSERT INTO
	`cron_job` (`name`, `code`, `description`)
	VALUES
	(
        'CheckOut Request',
        'CHECKOUT',
        'Cron job for Check-out request'
	);
    
ALTER TABLE `announcement` CHANGE `description` `description` LONGTEXT NULL;

ALTER TABLE `note_type` 
ADD COLUMN `notify_management_user` TINYINT NULL DEFAULT 0 AFTER `send_notification`;

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('Note Added!', 'Template for note is added', 'ADD_NOTE_NOTIFY_MANAGER', 'Email', 'Note Added!', '
<!doctype html>
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Add Note</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">
                    <p style="margin-bottom:20px;font-size:15px">A <<Note_type>> note is added to <<added_name>> by <<employee_name>>. Please click here to view details <a href="<<customer_portal_link>>" target="_blank"> link of OT360 platform </a>.</p>
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

</html>', 'Active', '8', '2022-06-21 16:46:13');


UPDATE `notification_template` SET `body` = '
<!doctype html>
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Add Note</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-note-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">
                    <p style="margin-bottom:20px;font-size:15px">A <<Note_type>> note is added to <<added_name>> by <<employee_name>>. Please click here to view details <a href="<<customer_portal_link>>" target="_blank"> link of OT360 platform </a>.</p>
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

</html>'
 WHERE (`notification_template_id` = '71');

  UPDATE `notification_template` SET `body` = '<html lang="en-US">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
    href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap
    rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template" />
    <style type="text/css">
      html,
      body {
        font-family: "Lato", sans-serif;
        color: #34444c;
      }
      a:hover {
        text-decoration: none !important;
      }
      :focus {
        outline: none;
        border: 0;
      }
    </style>
  </head>
  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="margin: 0px; background-color: #fff"
    bgcolor="#fff"
    leftmargin="0"
  >
    <table
      style="background-color: #fff; max-width: 620px; margin: 0 auto"
      width="100%"
      border="0"
      align="center"
      cellpadding="0"
      cellspacing="0"
    >
     <tr>
        <td style="text-align:center; max-width: 620px; width: 620px;padding-bottom: 15px;">
          <h1 style="margin-top: 10px; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 25px;
          margin-bottom: 0;">Birthdays This Week</h1>
        </td>
      </tr>
      <tr>
        <td style="max-width: 620px; width: 620px">
          <table
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
            style="background: #ffffff; text-align: left"
          >
            <tr>
              <td
                colspan="2"
                class="container"
                style="
                  font-size: 15px;
                  vertical-align: bottom;
                  display: block;
                  margin: 0 auto;
                  max-width: 620px;
                  width: 620px;
                "
              >
                <img src="https://ot360dev.blob.core.windows.net/master/email-template/header.png" alt="" style="display: block" />
              </td>
            </tr>
            <tr>
                <td style="text-align:center; max-width: 620px; width: 620px;background-color: #d7e4f3;">
                  <h1 style="margin-top: 10px; text-align: center; font-weight: 900; font-size: 22px;margin-bottom: 0;">Time To Celebrate!</h1>
                </td>
              </tr>
            <tr>
            <tr>
              <td style="padding: 30px; background-color: #d7e4f3">
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td style="line-height: 30px; display: flex; align-items: center;justify-content: center; flex-flow: wrap;gap: 5px;">
                      <<body>>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: #d7e4f3;
                    max-width: 620px;
                    margin: 0 auto;
                  "
                >
                  <tr>
                    <td colspan="2" style="padding-bottom: 20px">
                      <table
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        style="margin: 0 auto"
                      >
                        <tr>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                          <td
                            style="
                              border-radius: 2px;
                              text-align: center;
                              width: 40%;
                              height: 48px;
                              width: 208px;
                              padding-top: 20px;padding-bottom: 20px;
                            "
                            align="center"
                          >
                            <a href="<<customer_portal_link>>" target="_blank">
                              <img
                                src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png"
                                alt=""
                              />
                            </a>
                          </td>
                          <td style="width: 30%;padding-top: 20px;padding-bottom: 20px;">&nbsp;</td>
                        </tr>
                         <tr>
                          <td style="width: 30%">&nbsp;</td>
                          <td style="width: 30%">&nbsp;</td>
                          <td
                            style="
                              width: 30%;
                              text-align: right;
                              padding-right: 20px;
                            "
                          >
                            <img src="https://ot360dev.blob.core.windows.net/master/email-template/birthday_img.png" alt="" />
                          </td>
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
        <td
          style="
            vertical-align: top;
            padding-bottom: 10px;
            padding-top: 10px;
            font-size: 15px;
            text-align: left;
          "
        >
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            Thank you,
          </p>
          <p
            style="
              margin-bottom: 5px;
              margin-top: 0;
              font-weight: bold;
              color: #34444c;
            "
          >
            <<account_name>>
          </p>
          <img
            src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
            alt=""
          />
        </td>
      </tr>
    </table>
  </body>
</html>
' WHERE (`code` = 'BIRTHDAY_ANNOUNCEMENT' AND `notification_type` = 'Email');
