module.exports = {
  custom: {
    port                   : process.env.port,
    JWT_SECRET_KEY         : process.env.JWT_SECRET_KEY,
    JWT_LOGIN_EXPIRY       : process.env.JWT_LOGIN_EXPIRY,
    JWT_RESET_PASS_EXPIRY  : process.env.JWT_RESET_PASS_EXPIRY,
    JWT_CREATE_PASS_EXPIRY : process.env.JWT_CREATE_PASS_EXPIRY
  }
};

