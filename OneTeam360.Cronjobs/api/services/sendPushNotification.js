let admin = require('firebase-admin');

let serviceAccount;
if(process.env.ENV === 'production'){
  serviceAccount = require('../../oneteam360-mobile-app-firebase-adminsdk-44qn7-38116f511f.json');
}else{
  serviceAccount = require('../../ot360-9838f-firebase-adminsdk-lvh9c-e203c0fb60.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const sendPushNotification = async (payload, fcm_id) => {

  if(process.env.NODE_ENV === 'local'){
    return null;
  }

  let options = {
    priority          : 'high',
    content_available : true,
    timeToLive        : 60 * 60 * 24
  };
  admin.messaging().sendToDevice(fcm_id, payload, options)
        .then((response) => {
          sails.log.debug('Successfully sent notification:', JSON.stringify(response));
        })
        .catch((error) => {
          sails.log.debug('Error sending notification:', JSON.stringify(error));
        });
};

module.exports = {
  sendPushNotification
};
