const axios = require('axios');

module.exports = {
  addTaskApi: async (req,requestData) => {
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'POST',
      headers : headers,
      data    : {
        ...requestData
      },
      url: `${process.env.APP_BASE_URL}task/`,
    };
    return axios(options);
  },
  addMultiSkillTaskApi: async (req,requestData) => {
    sails.log(requestData);
    const headers = { Authorization: req.headers.authorization };
    const options = {
      method  : 'POST',
      headers : headers,
      data    : {
        ...requestData
      },
      url: `${process.env.APP_BASE_URL}task/addMultiSkillTask`,
    };
    return axios(options);
  }
};
