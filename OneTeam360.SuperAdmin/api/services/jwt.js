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
module.exports = {
  generateToken: (payload, expiresIn = '1d') => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY_ADMIN, {
      expiresIn,
    });
  },
  verify: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN);
  },
  verifyimpersonate: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  },
  generateTokenPrimaryUser: (payload, expiresIn = '1d') => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn,
    });
  },
};
