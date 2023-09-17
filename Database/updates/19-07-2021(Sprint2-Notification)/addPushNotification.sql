INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('9', 'Add Note', 'Template for Adding note', 'ADD_NOTE', 'MOBILE', 'New Note Added', 'A note is added by <<employee_name>> on your profile. Click here to view details!', '1', 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('10', 'Task Assigned', 'Template when new task assigned', 'TASK_ASSIGNED', 'Mobile', 'New Task Assigned', 'A new task has been assigned to you by <<employee_name>>. Click to view more!', '1', 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('11', 'Task Completed', 'Template when task is completed', 'TASK_COMPLETED', 'Mobile', 'Task Completed', '<<employee_name>> has marked the task as completed on <date time of task competition>. Click here to view details!', '1', 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`notification_template_id`, `name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('12', 'Task overdue reminder', 'Notification to be sent when task will overdue', 'TASK_OVERDUE_REMINDER', 'Mobile', 'A task needs your attention!', 'Your task is getting due tomorrow! Click here to complete task.', '1', 'Active', '7', '2021-06-10 16:56:13');




INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('Employee point update', 'Push Notification when employee Point change', 'EMPLOYEE_POINTS_UPDATE', 'Mobile', 'Points Updated!', 'There is a change in your points. Click here to view your latest points.', '1', 'Active', '7', '2021-06-10 16:56:13');
INSERT INTO `notification_template` (`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('Employee level update', 'Push Notification when employee Level change', 'EMPLOYEE_LEVEL_UPDATE', 'Mobile', 'One level up!', ' Your level just advanced to <new level>. Click here to view your current points & new level.', '1', 'Active', '7', '2021-06-10 16:56:13');

INSERT INTO `notification_template`
 (`name`, `description`, `code`, `notification_type`,
 `subject`, `permission_id`, `status`, `created_by`, `created_date`,`body`)
 VALUES ('Employee level update', 'Push Notification when employee 
Level change', 'EMPLOYEE_LEVEL_UPDATE', 'Email', 'Congratulations, you’re 
one level up!', '1', 'Active', '7', '2021-06-10 16:56:13', '<html lang="en">
      <head>
    	<!-- Required meta tags -->
    	<meta charset="utf-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1">
    
    	<link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap" rel="stylesheet">
    	<style>
    	  html, body{
    		font-family: "Lato", sans-serif;
    	  }
    	</style>
      </head>
      <body>
      <div>
    	<h4 style="margin-bottom:30px;">Hello  <<first_name>> <<last_name>>,</h4>
    	<p style="margin-bottom:10px;font-size:14px">Congratulations on advancing to the next level. We’re delighted to share the details on your new level and total points at <<account_name>>.</p>
    	<table style="border-collapse: collapse; border: 1px solid black;">
    	  <tr style="border: 1px solid black; ">
    		<td style="border: 1px solid black; padding-right: 20px;">Total Points</td>
    		<td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;"><<points>></td>
    	  </tr>
    	  <tr style="border: 1px solid black; ">
    		<td style="border: 1px solid black; padding-right: 20px;">Previous Level</td>
    		<td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;"><<old_level_name>></td>
    	  </tr>
    	  <tr style="border: 1px solid black; ">
    		<td style="border: 1px solid black; padding-right: 20px;">Latest Level</td>
    		<td style="border: 1px solid black; padding-right: 20px; padding-left: 20px;"><<new_level_name>></td>
    	  </tr>
    	</table>
    	<p>Please login to OneTeam360 customer portal by clicking on the <a href="<<customer_portal_link>>">link</a> to view more details.</p>
    	<h5 style="margin-bottom:5px;">Thank you,</h5>
    	<h5 style="margin-bottom:5px;margin-top:0;"><<account_name>></h5>
      </div>
      </body>
    </html>' );


SET SQL_SAFE_UPDATES=0;
UPDATE `notification_template` SET `body` = '<<employee_name>> added a new note to your profile. Click here to view details.' WHERE (`code` = 'ADD_NOTE');
SET SQL_SAFE_UPDATES=1;