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
      url: `${process.env.APP_BASE_URL}employee/certificate/assignmultipleCrts`,
    };
    return axios(options);
  },
  answerDynamicQuestion: async (req,data) => {
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'POST',
      headers : headers,
      data    : {
        ...data
      },
      url: `${process.env.APP_BASE_URL}/master/dynamicquestion/answer`,
    };
    return axios(options);
  },
  getDynamicQuestion: async (req,data) => {
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'GET',
      headers : headers,
      data    : {
        ...data
      },
      url: `${process.env.APP_BASE_URL}/master/dynamicquestion/getList`,
    };
    return axios(options);
  },
};
