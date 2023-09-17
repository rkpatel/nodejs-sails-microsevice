/***************************************************************************

  Services     : nodemailer

  **************************************************
  Functions
  **************************************************
  sendMail
  **************************************************

***************************************************************************/


let nodemailer = require('nodemailer');
module.exports = {

  /* sendMail() */
  sendMail: async (to, subject, content) => {
    let transporter = nodemailer.createTransport({
      service : 'gmail',
      secure  : true,
      auth    : {
        user : sails.config.custom.EMAIL_USERNAME,
        pass : sails.config.custom.EMAIL_PASSWORD,
      },
    });
    let mailOptions = {
      from    : sails.config.custom.EMAIL_USERNAME,
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
