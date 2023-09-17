const axios = require('axios');

module.exports = {
  addTaskApi: async (req,mailData) => {
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'POST',
      headers : headers,
      data    : {
        ...mailData
      },
      url: `${process.env.APP_BASE_URL}task/`,
    };
    return axios(options);
  },
  deleteMultipleTaskApi: async (req,data) => {
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'DELETE',
      headers : headers,
      data    : {
        ...data
      },
      url: `${process.env.APP_BASE_URL}task/deletemultiple`,
    };
    return axios(options);
  },
  assignAutoCertificate: async (req,data) => {
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'POST',
      headers : headers,
      data    : {
        ...data
      },
      url: `${process.env.APP_BASE_URL}employee/certificate/assignmultipleCrts`,
    };
    return axios(options);
  },
};
