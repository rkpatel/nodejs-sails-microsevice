/***************************************************************************

  Services     : sendGrid

***************************************************************************/

const sgMail = require('@sendgrid/mail');

module.exports = {
  sendGridMail: async (to,cc, subject, content) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to      : to,
      cc      : cc,
      from    : { email: process.env.EMAIL_USERNAME_ADMIN, name: process.env.EMAIL_FROM_ADMIN },
      subject : subject,
      html    : content,
    };
    sgMail
      .send(msg)
      .then(() => {
        sails.log('Email sent');
      })
      .catch((error) => {
        sails.log('error', error);
      });
    //}else{
    //  sails.log('Mails are disabled for Local Environment');
    //}

  },
};
