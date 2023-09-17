/***************************************************************************

  Seed Function
  (sails.config.bootstrap)

  By convention, this is a good place to set up fake data during development.

  For eg:

  if (await User.count() > 0) {
    return;
  }

  await User.createEach([
    { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
    { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
    // etc.
  ]);

***************************************************************************/

module.exports.bootstrap = async (cb) => {

  // add the lines from here
  // bootstrapping all the cronjobs in the cronJobs.js
  //var schedule = require('node-schedule');
  // sails.config.cronjobs.crons().forEach((item) => {
  //   schedule.scheduleJob(item.interval,sails.config.cronjobs[item.method]);
  // });

  // It’s very important to trigger this callback method when you are finished
  // with the bootstrap! (otherwise your server will never lift, since it’s waiting on the bootstrap)
  cb();
};
