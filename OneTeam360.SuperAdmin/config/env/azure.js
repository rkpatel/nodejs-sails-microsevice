

module.exports = {
  custom: {
    port                   : process.env.port,
    JWT_SECRET_KEY         : process.env.JWT_SECRET_KEY_ADMIN,
    JWT_LOGIN_EXPIRY       : process.env.JWT_LOGIN_EXPIRY_ADMIN,
    JWT_RESET_PASS_EXPIRY  : process.env.JWT_RESET_PASS_EXPIRY_ADMIN,
    JWT_CREATE_PASS_EXPIRY : process.env.JWT_CREATE_PASS_EXPIRY_ADMIN,
    REDIS_PORT_NO          : process.env.REDIS_PORT_NO,
    REDIS_HOST             : process.env.REDIS_HOST
  }
};
