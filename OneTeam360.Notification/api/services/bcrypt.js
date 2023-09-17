/***************************************************************************

  Services     : bcrypt

  **************************************************
  Functions
  **************************************************
  hashPassword,
  comparePassword
  **************************************************

***************************************************************************/

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

module.exports = {
  hashPassword: async (password) => {
    return  bcrypt.hash(password, SALT_ROUNDS);
  },

  comparePassword: async (password, encryptedPassword) => {
    return  bcrypt.compare(password, encryptedPassword);
  },

};
