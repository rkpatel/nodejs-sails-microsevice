/***************************************************************************

  Services     : jwt

  **************************************************
  Functions
  **************************************************
  generateToken,
  verify
  **************************************************

***************************************************************************/

const jwt = require('jsonwebtoken');
const custom = sails.config.custom;
module.exports = {
  generateToken: (payload, expiresIn = '1 day') => {
    return jwt.sign(payload, custom.JWT_SECRET_KEY, {
      expiresIn,
    });
  },
  verify: (token) => {
    return jwt.verify(token, custom.JWT_SECRET_KEY);
  },
};
