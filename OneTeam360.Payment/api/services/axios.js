/***************************************************************************

  Services     : axios

  **************************************************
  Functions
  **************************************************
  getCacheData,
  setCacheData
  **************************************************

***************************************************************************/
const axios = require('axios');

module.exports = {
  getCacheData: async (url) => {
    await axios.get(url)
    .then(response => {
      return response;
    })
    .catch(error => {
      return error;
    });
  },
  setCacheData: async (url, data) => {
    await axios.post(url, data)
    .then(response => {
      return sails.log('response',response);
    })
    .catch(error => {
      return sails.log('error',error);
    });
  },
};
