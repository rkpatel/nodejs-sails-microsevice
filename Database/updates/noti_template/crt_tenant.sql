INSERT INTO `notification_template` 
(`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) 
VALUES 
('Certificate About to Expire', 'Email Template for Certificate About  to Expire', 'CRT_ABOUT_TO_EXPIRE', 
'Email', 'OneTeam360 - A certificate expiring soon!', 
'<html lang="en">
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
 	<p style="margin-bottom:10px;font-size:14px">This is to remind you that your certificate is about to expire <<duration>>. Kindly take appropriate action on it.</p>
 	<table>
 	  <tr>
 		<td>Name</td>
 		<td><<crt_name>></td>
 	  </tr>
 	  <tr>
 		<td>Type</td>
 		<td><<crt_type>></td>
 	  </tr>
 	  <tr>
 		<td>Description</td>
 		<td><<crt_description>></td>
 	  </tr>
 	  <tr>
 		<td>Issue Date</td>
 		<td><<crt_issue_date>></td>
 	  </tr>
       <tr>
 		<td>Expiry Date</td>
 		<td><<crt_expiry_date>></td>
 	  </tr>
 	</table>
 	<p>Please login to OneTeam360 customer portal by clicking on the <a href="<<customer_portal_link>>">link</a> to view more details.</p>
 	<h5 style="margin-bottom:5px;">Thank you,</h5>
 	<h5 style="margin-bottom:5px;margin-top:0;"><<account_name>></h5>
   </div>
   </body>
 </html>',
 '1', 'Active', '7', '2021-06-10 16:56:13');


INSERT INTO `notification_template` 
(`name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) 
VALUES 
('Certificate About to Expire', 'Push Noti Template for Certificate About  to Expire', 'CRT_ABOUT_TO_EXPIRE', 
'Mobile', 'A certificate needs your attention!', 
'Your certificate is going to expire <<duration>>! Click here to view it.',
 '1', 'Active', '7', '2021-06-10 16:56:13');


INSERT INTO `notification_template` ( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) VALUES ('Competition starts', 'Push Notification when Competition starts', 'COMPETITION_START', 'Mobile', 'Competition Started! All the Best.', 'You have participated in the competition. Please click here to view more details.', '1', 'Active', '7', '2021-06-10 16:56:13');



INSERT INTO `notification_template` 
( `name`, `description`, `code`, `notification_type`, `subject`, `body`, `permission_id`, `status`, `created_by`, `created_date`) 
VALUES ('Competition ends', 'Push Notification when Competition ends', 'COMPETITION_END', 'Mobile', 'Competition Completed! View Your Results.', 
'The competition <<competition_name>> is completed successfully. Please click here to view results.', '1', 'Active', '7', '2021-06-10 16:56:13');
