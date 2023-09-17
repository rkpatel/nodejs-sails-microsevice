ALTER TABLE `task` 
ADD COLUMN `entity_type` VARCHAR(45) NULL DEFAULT NULL AFTER `is_group_task`,
ADD COLUMN `entity_id` INT(11) NULL DEFAULT NULL AFTER `entity_type`;


ALTER TABLE `certificate_type` 
ADD COLUMN `auto_assign` TINYINT NULL DEFAULT 0 AFTER `description`;

INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) 
VALUES ('45', 'Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
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

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">You have been assigned the below
                                            certificates. Please check the details on your profile to add them.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
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
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>

</html>', 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ('46', 'Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.',
 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES ('47', 'Certificate Auto Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> certificates have been assigned to you. Please check your profile for more details.', 
'Active', '7', '2021-06-10 16:56:13');



INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('48', 'Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Email', 'Certificates Assigned', '<!doctype html>
<html lang="en-US">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
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

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Certificates Assigned</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin-bottom:20px;font-size:15px">The below certificates are associated with your new job type. Review your profile for details.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <<certificates>>
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
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>

</html>', 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('49', 'Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'Mobile', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details',
 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('50', 'Certificate Auto Job Assgined', 'Template when certificate is auto assigned', 'CERTIFICATE_AUTO_JOB_ASSIGN', 'InApp', 'Certificates Assigned', '<<count>> new certificates were assigned with your new job type(s). Check your profile for details', 
'Active', '7', '2021-06-10 16:56:13');



ALTER TABLE notification_template CONVERT TO CHARACTER SET utf8;
ALTER TABLE notification_queue CONVERT TO CHARACTER SET utf8;


ALTER TABLE `employee_certificate` 
ADD COLUMN `added_by_auto` TINYINT NULL DEFAULT 0 AFTER `added_by`;




INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Email', 'Birthdays This Week', 
'<html lang="en-US">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
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

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Birthdays This Week</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <<body>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                      <td>
                       <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                         <tr>
                           <!-- <td align="center" colspan="2">
                               <a href="<<customer_portal_link>>" target="_blank" style="background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;">View Details</a>
                           </td> -->
                           <td colspan="2">
                             <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                               <tr>
                                 <td style="width: 30%;">&nbsp;</td>
                                   <td style="border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                       <a href="<<customer_portal_link>>" target="_blank">
                                           <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                       </a>
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
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>

</html>', 'Active', '7', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'Mobile', 'Birthdays This Week', '<<body>>',
 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'InApp', 'Birthdays This Week', '<<body>>', 
'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Birthdays This Week', 'Template for birthdays announcement', 'BIRTHDAY_ANNOUNCEMENT', 'SMS', 'Birthdays This Week', '<<body>>. View Details', 
'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Email', 'Work Anniversaries This Week', 
'<html lang="en-US">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
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

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Work Anniversaries This Week</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <<body>>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                      <td>
                       <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                         <tr>
                           <!-- <td align="center" colspan="2">
                               <a href="<<customer_portal_link>>" target="_blank" style="background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;">View Details</a>
                           </td> -->
                           <td colspan="2">
                             <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                               <tr>
                                 <td style="width: 30%;">&nbsp;</td>
                                   <td style="border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                       <a href="<<customer_portal_link>>" target="_blank">
                                           <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                       </a>
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
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>

</html>', 'Active', '7', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'Mobile', 'Work Anniversaries This Week', '<<body>>. Wish them on this occasion.',
 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'InApp', 'Work Anniversaries This Week', '<<body>>. Wish them on this occasion.', 
'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Work Anniversaries This Week', 'Template for Work anniversary announcement', 'WORK_ANNIV_ANNOUNCEMENT', 'SMS', 'Work Anniversaries This Week', '<<body>>. Wish them on this occasion.', 
'Active', '7', '2021-06-10 16:56:13');




INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Email', 'Welcome to the Team – <<employee_name>>', 
'<html lang="en-US">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href=https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap rel="stylesheet">
    <title>Email Template</title>
    <meta name="description" content="Notifications Email Template">
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

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #fff;" bgcolor="#fff"
    leftmargin="0">
    <table style="background-color: #fff; max-width:620px; margin:0 auto;" width="100%" border="0" align="center"
        cellpadding="0" cellspacing="0">
        <tr>
            <td style="text-align:center; max-width: 620px; width: 620px;">
                <h1
                    style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">
                    Welcome to the Team</h1>
            </td>
        </tr>
        <tr>
            <td style="max-width: 620px; width: 620px;">
                <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; text-align:left;">
                    <tr>
                        <td colspan="2" class="container"
                            style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
                            <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png"
                                alt="" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px; background-color: #d7e4f3;">
                            <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p> Reach out and give our new team member a warm welcome! </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p>Name : <<employee_name>>, <<employee_email>></p>
                                        <p>Location : <<location>></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                      <td>
                       <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                         <tr>
                           <!-- <td align="center" colspan="2">
                               <a href="<<customer_portal_link>>" target="_blank" style="background:#ff9b44;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:16px;padding:15px 51px;display:block;">View Details</a>
                           </td> -->
                           <td colspan="2">
                             <table width="100%" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                               <tr>
                                 <td style="width: 30%;">&nbsp;</td>
                                   <td style="border-radius: 2px; text-align: center; width: 40%; height: 48px; width: 208px;" align="center">
                                       <a href="<<customer_portal_link>>" target="_blank">
                                           <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-button.png" alt="">     
                                       </a>
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
            <td
                style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
                <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">
                    <<account_name>>
                </p>
                <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png"
                    alt="">
            </td>
        </tr>
    </table>
</body>

</html>', 'Active', '7', '2021-06-10 16:56:13');

INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'Mobile', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!',
 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'InApp', 'Welcome - <<employee_name>>', '<<employee_name>>. Welcome to the team!', 
'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `status`, `created_by`, `created_date`) VALUES 
('Welcome to the Team', 'Template for Welcome onboard Announcement', 'WORK_ONBOARD_ANNOUNCEMENT', 'SMS', '', 'Welcome New Team Member - <<employee_name>>', 
'Active', '7', '2021-06-10 16:56:13');


