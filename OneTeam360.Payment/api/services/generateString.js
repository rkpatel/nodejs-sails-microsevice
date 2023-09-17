const crypto = require('crypto');
module.exports={
  generateString: async () =>{
    let token;
    crypto.randomBytes(20, (_err, buffer) => {
      // here we are converting raw buffer data into hexa string
      token = buffer.toString('hex');
      sails.log('token',token);
    });
    return token;
  }
};
