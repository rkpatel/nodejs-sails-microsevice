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
  generateToken: async(payload, expiresIn = '1 day') => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn,
    });
  },
  verify: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  },
};
