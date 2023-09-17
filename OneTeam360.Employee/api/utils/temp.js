const { sendMail } = require('../services/sendGridMail');
module.exports = {

  createEmailNotificationTemplate: async (email,subject, employee_name, link, account_name, account_email) => {
    let message = `
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap" rel="stylesheet">
        <style>
          html, body{
            font-family: 'Lato', sans-serif;
          }
        </style>
      </head>
      <body>
        <div>
        <h4 style="margin-bottom:30px;">Hello ${employee_name},</h4>
        <p style="margin-bottom:10px;font-size:14px">We are excited to have you get started your journey with us. Kindly click on the below link to get onboarded with us.</p>
        <a href=${link}>Password Creation link</a>
        <p style="font-size:14px;">If you need any assistance in the process, please email us at below mentioned email ID.</p>
        <h5 style="margin-bottom:5px;">Thank you,</h5>
        <h5 style="margin-bottom:5px;margin-top:0;">${account_name}</h5>
        <h5 style="margin-bottom:0;margin-top:0;">${account_email}</h5>
      </div>
      </body>
    </html>`;

    await sendMail(email, subject, message);

  }

};
