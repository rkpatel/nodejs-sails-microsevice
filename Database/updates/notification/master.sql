UPDATE
  `notification_template_master`
SET
  `body` = '<html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
  
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>
        html,
        body {
          font-family: "Lato", sans-serif;
        }
      </style>
    </head>
    <body>
      <div>
        <h4 style="margin-bottom: 30px">Hello <<first_name>> <<last_name>>,</h4>
        <p style="margin-bottom: 10px; font-size: 14px">
            We tried to process your <<currency>> <<amount>> payment, but the card on file was declined.<br/>
            This can happen for a number of reasons, but we encourage you to check your payment details and make any necessary updates from the link below.
        </p>
        <a href="<<link>>"><<link>></a>   
      <p>Thank you and let us know if you have any questions.</p>
        <h5 style="margin-bottom: 5px">Sincerely,</h5>
        <h5 style="margin-bottom: 5px; margin-top: 0">Customer Service</h5>
        <h5 style="margin-bottom: 5px; margin-top: 0">OneTeam360</h5>
      </div>
    </body>
  </html>'
WHERE
  (`notification_template_id` = '4');
UPDATE
  `notification_template_master`
SET
  `body` = '<html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
  
      <link
        href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>
        html,
        body {
          font-family: "Lato", sans-serif;
        }
      </style>
    </head>
    <body>
      <div>
        <h4 style="margin-bottom: 30px">Hello <<first_name>> <<last_name>>,</h4>
        <p style="margin-bottom: 10px; font-size: 14px">
          Thank you for choosing OneTeam360 as your partner for employee engagement. Please use the below link to fill out payment details for your company subscription.
        </p>
        <a href="<<link>>"><<link>></a>   
      <p> We\'re looking forward to helping you save time and eliminate headaches around staff performance.</p>
        <h5 style="margin-bottom: 5px">Sincerely,</h5>
        <h5 style="margin-bottom: 5px; margin-top: 0">Customer Service</h5>
        <h5 style="margin-bottom: 5px; margin-top: 0">OneTeam360</h5>
      </div>
    </body>
  </html>'
WHERE
  (`notification_template_id` = '5');  