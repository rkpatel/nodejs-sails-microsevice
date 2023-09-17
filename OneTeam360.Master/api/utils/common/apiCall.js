const axios = require('axios');

module.exports = {
  assignAutoCertificate: async (req,data) => {
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'POST',
      headers : headers,
      data    : {
        ...data
      },
      url: `${process.env.APP_BASE_URL}employee/certificate/assignmultiple`,
    };
    return axios(options);
  },
};
