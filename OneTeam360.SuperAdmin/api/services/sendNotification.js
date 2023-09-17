const axios = require('axios');

module.exports = {
  sendNotification: async (_req,mailData) => {
    return axios.post(`${process.env.APP_BASE_URL_ADMIN}/notification/send` , {
      ...mailData
    });
  },
};
