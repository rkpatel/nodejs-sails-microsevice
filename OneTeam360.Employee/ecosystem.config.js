module.exports = {
  apps: [{
    name   : 'app',
    script : 'app.js',
    env    : {
      NODE_ENV: 'azure',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
