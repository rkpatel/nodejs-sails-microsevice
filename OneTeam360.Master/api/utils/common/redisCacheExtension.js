const { redisClient } = require('../../services/redisClient');
const { RESPONSE_STATUS } = require('../constants/enums');
module.exports = {
  getCache: async (key) => {
    try{
      let res = await redisClient.get(key);
      if(res)
      {
        return new Promise((resolve) => {
          redisClient.get(key, (error, result) => {
            if (error) {throw error;}
            resolve({status: RESPONSE_STATUS.success, data: JSON.parse(result) });
          });
        });
      }
      else{
        return {status: RESPONSE_STATUS.error };
      }
    }catch(error){
      sails.log('ERROR', error);
    }
  },

  setCache: async (data) => {
    try{
      return redisClient.set(data.key, JSON.stringify(data.value));
    }
    catch(error){
      sails.log('ERROR', error);
    }
  },

  keyExists: async (key) => {
    try{
      return redisClient.exists(key);
    }
    catch(error){
      sails.log('ERROR', error);
    }
  },

  deleteCache: async (key) => {
    try{
      return redisClient.del(key);
    }
    catch(error){
      sails.log('ERROR', error);
    }
  }
};
