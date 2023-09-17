
module.exports = {
  custom: {
    port                   : process.env.port,
    JWT_SECRET_KEY         : process.env.JWT_SECRET_KEY,
    SENDGRID_API_KEY       : process.env.SENDGRID_API_KEY,
    EMAIL_USERNAME         : process.env.EMAIL_USERNAME,
    JWT_LOGIN_EXPIRY       : process.env.JWT_LOGIN_EXPIRY,
    JWT_RESET_PASS_EXPIRY  : process.env.JWT_RESET_PASS_EXPIRY,
    JWT_CREATE_PASS_EXPIRY : process.env.JWT_CREATE_PASS_EXPIRY,
    REDIS_PORT_NO          : process.env.REDIS_PORT_NO,
    REDIS_HOST             : process.env.REDIS_HOST
  }
};
