const sails = require('sails');
require('dotenv').config();
// Before running any tests...
before(function (done) {
  // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
  this.timeout(40000);

  sails.lift({
    // Your Sails app's configuration files will be loaded automatically,
    // but you can also specify any other special overrides here for testing purposes.

    // For example, we might want to skip the Grunt hook,
    // and disable all logs except errors and warnings:

    hooks: { grunt: false },

    log: { level: 'warn' },

    models: {
      datastore : 'unitTestConnection',
      migrate   : 'safe'
    },

    datastores: {


      unitTestConnection: {
        adapter : 'sails-mysql',
        url     : `${process.env.DB_SYSTEM}://${process.env.DB_USERNAME}@${process.env.DB_HOST}/${process.env.DB_NAME}`,
      }
    }
  }, (err) => {
    if (err) { return done(err); }
    return done();
  });
});

// After all tests have finished...
after((done) => {

  sails.lower(done);

});
