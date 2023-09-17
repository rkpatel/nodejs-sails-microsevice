SET
  SQL_SAFE_UPDATES = 0;

UPDATE
  `notification_template`
SET
  `body` = '<html lang=""en"">
        <head>
          <!-- Required meta tags -->
          <meta charset=""utf-8"">
          <meta name=""viewport"" content=""width=device-width, initial-scale=1"">
      
          <link href=""https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap"" rel=""stylesheet"">
          <style>
            html, body{
              font-family: ""Lato"", sans-serif;
            }
          </style>
        </head>
        <body>
        <div>
          <h4 style=""margin-bottom:30px;"">Hello  <<first_name>> <<last_name>>,</h4>
          <p style=""margin-bottom:10px;font-size:14px"">A note is added by <<employee_name>>  on your profile.</p>

          <p style=""font-size:14px;"">Note Type - <<note_type>></p>
          <p style=""font-size:14px;"">Description - <<note_description>></p>
		  <br/>
          <p>Please login to OneTeam360 customer portal by clicking on the <a href="<<customer_portal_link>>">link</a> to view more details.</p>
          <h5 style=""margin-bottom:5px;"">Thank you,</h5>
          <h5 style=""margin-bottom:5px;margin-top:0;""><<account_name>></h5>
        </div>
        </body>
      </html>'
WHERE
  (
    `code` = 'ADD_NOTE'
    and `notification_type` = 'Email'
  );

SET
  SQL_SAFE_UPDATES = 1;