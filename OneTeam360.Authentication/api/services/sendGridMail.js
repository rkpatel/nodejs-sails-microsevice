/***************************************************************************

  Services     : sendGrid

***************************************************************************/

const sgMail = require('@sendgrid/mail');

module.exports = {

  sendMail: async (to, subject, content) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to      : to,
      from    : { email: process.env.EMAIL_USERNAME, name: process.env.EMAIL_FROM },
      subject : subject,
      html    : content,
    };
    sgMail
      .send(msg)
      .then(() => {
        sails.log.debug('Email sent');
      })
      .catch((error) => {
        sails.log.error('error', error);
      });
  },
};
