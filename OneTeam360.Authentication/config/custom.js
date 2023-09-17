/***************************************************************************

  sails.config.custom
  Any other custom config this Sails app should use during development.

***************************************************************************/

module.exports.custom = {
  port                 : process.env.port,
  JWT_SECRET_KEY       : process.env.JWT_SECRET_KEY,
  JWT_SECRET_KEY_ADMIN : process.env.JWT_SECRET_KEY_ADMIN,
  SENDGRID_API_KEY     : process.env.SENDGRID_API_KEY,
  EMAIL_USERNAME       : process.env.EMAIL_USERNAME,
  DB_SYSTEM            : process.env.DB_SYSTEM,
  DB_USERNAME          : process.env.DB_USERNAME,
  DB_PASSWORD          : process.env.DB_PASSWORD,
  DB_HOST              : process.env.DB_HOST,
  DB_NAME              : process.env.DB_NAME,
};
