const axios = require('axios');
const options = {
  maxBodyLength    : Infinity,
  maxContentLength : Infinity
};
module.exports = {
  sendNotification: async (_req,mailData) => {
    return axios.post(`${process.env.APP_BASE_URL}notification/send` , {
      ...mailData
    },options);
  },
};
