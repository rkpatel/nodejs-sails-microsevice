SET SQL_SAFE_UPDATES = 0;

UPDATE `ymca_qa`.`notification_template` SET `body` = '<!doctype html>
 <html lang="en-US"
 
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
                     <!-- <h4 style="margin-bottom:20px; margin-top:0px; text-transform:capitalize">Hello <strong><<first_name>> <<last_name>>,</strong></h4> -->
                     <p style="margin-bottom:20px;font-size:15px"><strong><<employee_name>></strong> assigned you a new task.</p>
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
                       <!-- <tr>
                         <td colspan="2">
                           <p style="margin-bottom: 30px;">Please login to <strong style="color:#d26934;">OneTeam360</strong> <strong>Customer Portal</strong> by clicking on the below button.</p>                     
                         </td>
                       </tr> -->
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
                                         <img src="https://ot360prod.blob.core.windows.net/master/email-template/ot-email-template-task-button.png" alt="">     
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
         <!-- <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;">Thank you,</p>
         <p style="margin-bottom: 5px; margin-top: 0; font-weight: bold; color: #34444c;"><<account_name>></p> -->
         <img src="https://ot360prod.blob.core.windows.net/master/email-template/logo-oneteam-single-new.png" alt="">
       </td>
     </tr>
   </table>
 </body>
 
 </html>' WHERE (`code` = 'TASK_ASSIGNED' AND `notification_type` = 'Email');
SET SQL_SAFE_UPDATES = 1;
