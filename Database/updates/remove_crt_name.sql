SET
	SQL_SAFE_UPDATES = 0;

ALTER TABLE
	`employee_certificate` DROP COLUMN `name`;

ALTER TABLE
	`employee_certificate_history` DROP COLUMN `name`;

UPDATE
	`notification_template`
SET
	`body` = '<html lang="en">
    <head>
  	<!-- Required meta tags -->
  	<meta charset="utf-8">
  	<meta name="viewport" content="width=device-width, initial-scale=1">
  
  	<link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap" rel="stylesheet">
  	<style>
  	  html, body{
  		font-family: "Lato", sans-serif;
  	  }
       table, th, td {
         border: 1px solid black;
         border-collapse: collapse;
       }
  	</style>
    </head>
    <body>
    <div>
  	<h4 style="margin-bottom:30px;">Hello  <<first_name>> <<last_name>>,</h4>
  	<p style="margin-bottom:10px;font-size:14px">This is to remind you that your certificate is about to expire <<duration>>. Click <a href="<<customer_portal_link>>">here</a> to view details.</p>
  	<table>
  	  <tr>
  		<td>Certificate</td>
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
  	<h5 style="margin-bottom:5px;">Thank you,</h5>
  	<h5 style="margin-bottom:5px;margin-top:0;"><<account_name>></h5>
    </div>
    </body>
  </html>'
WHERE
	(
		`code` = 'CRT_ABOUT_TO_EXPIRE'
		and `notification_type` = 'Email'
	);

SET
	SQL_SAFE_UPDATES = 1;