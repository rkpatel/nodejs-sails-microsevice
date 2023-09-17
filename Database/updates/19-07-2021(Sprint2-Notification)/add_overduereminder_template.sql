INSERT INTO `notification_template`
(
`name`,
`description`,
`code`,
`notification_type`,
`subject`,
`body`,
`permission_id`,
`status`,
`created_by`,
`created_date`)
VALUES
(
'Task overdue reminder',
'Notification to be sent when task will overdue',
'TASK_OVERDUE_REMINDER',
'Email',
'A task needs your attention!',
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
	<p style="margin-bottom:10px;font-size:14px">This is to remind you that your task is due tomorrow. Below are the task details that is due tomorrow. Kindly mark it as completed or get in touch with task creator <<employee_name>>.</p>
	<table>
	  <tr>
		<td>Title</td>
		<td><<task_title>></td>
	  </tr>
	  <tr>
		<td>Description</td>
		<td><<task_description>></td>
	  </tr>
	  <tr>
		<td>Start Date</td>
		<td><<start_date>></td>
	  </tr>
	  <tr>
		<td>End Date</td>
		<td><<end_date>></td>
	  </tr>
	</table>
	<p>Please login to OneTeam360 customer portal by clicking on the <a href="<<customer_portal_link>>">link</a> to view more details.</p>
	<h5 style="margin-bottom:5px;">Thank you,</h5>
	<h5 style="margin-bottom:5px;margin-top:0;"><<account_name>></h5>
  </div>
  </body>
</html>',
1,
'Active',
7,
'2021-06-10 16:56:13');
