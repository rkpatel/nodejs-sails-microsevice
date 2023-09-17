/***************************************************************************

  Services     : sendGrid

  **************************************************
  Functions
  **************************************************
  sendMail
  **************************************************

***************************************************************************/

const sgMail = require('@sendgrid/mail');
const custom = sails.config.custom;

module.exports = {

  sendMail: async (to, subject, content) => {
    sgMail.setApiKey(custom.SENDGRID_API_KEY);
    const msg = {
      to      : to, // Change to your recipient
      from    : custom.EMAIL_USERNAME, // Change to your verified sender
      subject : subject,
      text    : content,
      html    : `<strong>${content}</strong>`,
    };
    sgMail
  .send(msg)
  .then(() => {
    sails.log('Email sent');
  })
  .catch((error) => {
    sails.log('error',error);
  });
  },
};
