SET
  foreign_key_checks = 0;

ALTER TABLE
  `notification_template` DROP FOREIGN KEY `permissionId`;

ALTER TABLE
  `notification_template` DROP COLUMN `permission_id`,
  DROP INDEX `permissionId`;

;

TRUNCATE `notification_queue`;

TRUNCATE `notification_queue_recipient`;

TRUNCATE `notification_template`;

SET
  foreign_key_checks = 1;

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Password Creation</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-create-password-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">We are excited to have you get started your journey with us. Kindly click on the below link to get onboarded with us.</p>
                    <a style="color:#d26934;" href="<<link>>">Password Creation link </a>
                    <p style="font-size: 15px"> If you need any assistance in the process, please email us at below mentioned email ID. </p>
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
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_email>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>'
WHERE
  (`notification_template_id` = '1');

UPDATE
  `notification_template`
SET
  `body` = '<!doctype html>
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Reset Password</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-reset-password-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">Please reset your password using the below given link.</p>
                    <a style="color:#d26934;" href="<<link>>">Reset Password</a>
                    <p style="margin-bottom:20px;font-size:15px">If you need any assistance in the process, please email us at below mentioned email ID.</p>
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
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_email>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>'
WHERE
  (`notification_template_id` = '2');

UPDATE
  `notification_template`
SET
  `body` = '
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
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">A note is added by <strong><<employee_name>></strong> on your profile.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;"><strong>Note Type:</strong></td>
                        <td style="padding: 10px 10px 10px 10px;"><<note_type>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Description:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase;"><<note_description>></td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                        </td>
                      </tr>
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
WHERE
  (`notification_template_id` = '3');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">New Task Assigned</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-task-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">A new task has been assigned to you by <strong><<employee_name>></strong>. Below are the details regarding the same.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;"><strong>Title:</strong></td>
                        <td style="padding: 10px 10px 10px 10px;"><<task_title>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Description:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase;"><<task_description>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Start Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase;"><<start_date>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>End Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase;"><<end_date>></td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                        </td>
                      </tr>
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
WHERE
  (`notification_template_id` = '4');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Task Completed</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-task-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px"><strong><<employee_name>></strong> has marked the task as completed on <strong><<date_time_of_task_competition>></strong>. Below are the details regarding the task.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;"><strong>Title:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; vertical-align: top;"><<task_title>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Description:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<task_description>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Start Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<start_date>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>End Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<end_date>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Completion Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<completion_date>></td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                        </td>
                      </tr>
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
WHERE
  (`notification_template_id` = '5');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">A task needs your attention!</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-task-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">This is to remind you that your task is due tomorrow. Below are the task details that is due tomorrow. Kindly mark it as completed or get in touch with task creator <strong><<employee_name>></strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;"><strong>Title:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; vertical-align: top;"><<task_title>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Description:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<task_description>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Start Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<start_date>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>End Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<end_date>></td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                        </td>
                      </tr>
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
WHERE
  (`notification_template_id` = '6');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">A certificate expiring soon!</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-certificate-1-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">This is to remind you that your certificate is about to expire <strong><<duration>></strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;"><strong>Certificate:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; vertical-align: top;"><<crt_type>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Description:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<crt_description>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Issue Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<crt_issue_date>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Expiry Date:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase; vertical-align: top;"><<crt_expiry_date>></td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                        </td>
                      </tr>
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
WHERE
  (`notification_template_id` = '13');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Congratulations, you are 
          one level up!</h1>
      </td>
    </tr>
    
    <tr>
      <td style="max-width: 620px; width: 620px;">
        <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0"style="background:#ffffff; text-align:left;">
          <tr>
      <td colspan="2" class="container" style="font-size: 15px; vertical-align: bottom; display: block; Margin: 0 auto; max-width: 620px; width: 620px;">
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-emp-level-up-bg.png" alt="" style="display: block;">
      </td>
    </tr>
          <tr>
            <td style="padding:30px; background-color: #d7e4f3;">
              <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">Congratulations on advancing to the next level. We are delighted to share the details on your new level and total points at <strong><<account_name>></strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top; width: 100px;"><strong>Total Points:</strong></td>
                        <td style="padding: 10px 10px 10px 10px;  vertical-align: top;"><<points>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Previous Level:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase;  vertical-align: top;"><<old_level_name>></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 10px 10px 0px; vertical-align: top;"><strong>Latest Level:</strong></td>
                        <td style="padding: 10px 10px 10px 10px; text-transform: uppercase;  vertical-align: top;"><<new_level_name>></td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                        </td>
                      </tr>
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
WHERE
  (`notification_template_id` = '17');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Employee Import Successful</h1>
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
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> ,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">We have imported all the employees from the file that you had uploaded. All employees have been sent welcome emails from OneTeam360 successfully.</p>
                    <p style="margin-bottom:20px;font-size:15px">We have attached the imported file here for your reference.</p>
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
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>'
WHERE
  (`notification_template_id` = '20');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Employee Partial Import</h1>
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
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> ,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">We have partially imported the employees from the file that had valid data formats and all these employees have been sent welcome emails from OneTeam360 successfully.</p>
                    <p style="margin-bottom:20px;font-size:15px">We have not imported the employees that failed the validation process. Attached the output file here for your reference. Please take required action for invalid records within the output file.</p>
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
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>'
WHERE
  (`notification_template_id` = '21');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Employee Import Failed</h1>
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
                    <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> ,</strong></h4>
                    <p style="margin-bottom:20px;font-size:15px">We have not imported the employees due to failed validation on one or multiple records. Attached the output file here for your reference. Please take required action for invalid records within the output file.</p>
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
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>'
WHERE
  (`notification_template_id` = '22');

UPDATE
  `notification_template`
SET
  `body` = '
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
        <h1 style="margin-top: 10px; text-align: center; margin-bottom: 0; font-weight: 900; text-transform: uppercase; font-size: 25px;">Daily Report Digest</h1>
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
                    <p style="margin-bottom:20px;font-size:15px">See below for summaries of your daily reports.</p>
                    <<dynamic_template>>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                  </td>
                </tr>
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
      <td style="vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 15px; text-align: left;">
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
        <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p>
        <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
      </td>
    </tr>
  </table>
</body>

</html>'
WHERE
  (`notification_template_id` = '23');

UPDATE
  `notification_template`
SET
  `subject` = `Congratulations, you\'re \r one level up!`
WHERE
  (`notification_template_id` = '17');

UPDATE
  `notification_template`
SET
  `subject` = 'Employee Import Notifications - Partial Import'
WHERE
  (`notification_template_id` = '21');

UPDATE
  `notification_template`
SET
  `subject` = 'Daily Report Digest - <<current_date>>'
WHERE
  (`notification_template_id` = '23');

  UPDATE `notification_template` SET `subject` = 'Competition Ending Today! Hurry Up', 
  `body` = 'It’s the last day of your competition - <<competition_name>>. Give it your best.' 
  WHERE (`notification_template_id` = '19');
