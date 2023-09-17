/***************************************************************************

  Services     : sendGrid

***************************************************************************/

const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
module.exports = {
  sendGridMailTask: async (to,cc, subject, content, data ) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    let msg;
    if((data.response !== undefined))
    {
      const attachments = data.response.map((file) => {
        const filename = path.basename(file.image_url);
        const attachment = fs.readFileSync(`../OneTeam360.Master/assets/images/${filename}`).toString('base64');
        const extension = path.extname(file.image_url);
        return {
          filename    : filename,
          disposition : 'attachment',
          type        : `image/${extension}`,
          content     : attachment,
        };
      });
      msg = {
        to          : to,
        cc          : cc,
        from        : { email: process.env.EMAIL_USERNAME, name: process.env.EMAIL_FROM },
        subject     : subject,
        html        : content,
        attachments : attachments
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
      })
      .catch((error) => {
        sails.log('error', error);
      });
    }else{
      sails.log('Mails are disabled for Local Environment');
    }

  },
};
