/***************************************************************************

  Services     : nodemailer

  **************************************************
  Functions
  **************************************************
  sendMail
  **************************************************

***************************************************************************/


var nodemailer = require('nodemailer');
module.exports = {

  /* sendMail() */
  sendMail: async (to, subject, content) => {
    let transporter = nodemailer.createTransport({
      service : 'gmail',
      secure  : true,
      auth    : {
        user : process.env.EMAIL_USERNAME_ADMIN,
        pass : process.env.EMAIL_PASSWORD_ADMIN,
      },
    });
    let mailOptions = {
      from    : process.env.EMAIL_USERNAME_ADMIN,
      to      : to,
      subject : subject,
      html    : content,
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        sails.console.error(err);
      }
    });
  },
};
