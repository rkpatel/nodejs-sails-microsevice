/***************************************************************************

  Services     : sendGrid

***************************************************************************/

const sgMail = require('@sendgrid/mail');
const fs = require('fs');
module.exports = {

  sendGridMail: async (to,cc, subject, content, {
    fileName, type
  }) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    let msg;
    if((fileName !== undefined) && (type !== undefined))
    {
      msg = {
        to          : to,
        cc          : cc,
        from        : { email: process.env.EMAIL_USERNAME, name: process.env.EMAIL_FROM },
        subject     : subject,
        html        : content,
        attachments : [
          {
            content     : fs.readFileSync(`${process.cwd()}/assets/images/${fileName}`).toString('base64'),
            filename    : fileName,
            type        : type,
            disposition : 'attachment'
          }
        ]
      };
    }
    else
    {
      msg = {
        to      : to,
        cc      : cc,
        from    : { email: process.env.EMAIL_USERNAME, name: process.env.EMAIL_FROM },
        subject : subject,
        html    : content,
      };
    }
    if(process.env.NODE_ENV !== 'local'){
      sgMail
      .send(msg)
      .then(() => {
        sails.log('Email sent');
        if((fileName!== undefined) && (type !== undefined)){
          fs.unlinkSync(`${process.cwd()}/assets/images/${fileName}`);
        }
      })
      .catch((error) => {
        sails.log('error', error);
      });
    }else{
      sails.log('Mails are disabled for Local Environment');
    }

  },
};
