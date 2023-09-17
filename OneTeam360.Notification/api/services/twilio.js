const client = require('twilio')(process.env.TWILIO_SID, process.env.RAPIDAPI_KEY);
module.exports = {
  sendSMS: (body, to) => {
    if(process.env.NODE_ENV !== 'local'){
      client.messages
      .create({
        body : body,
        from : process.env.TWILIO_PHONE_NUMBER,
        to   : to
      })
      .then(message => sails.log.debug(message.sid))
      .catch(err => sails.log.error(err));
    }else{
      sails.log('Sending SMS is disabled for Local Environment');
    }
  }
};
