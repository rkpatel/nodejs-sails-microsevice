const axios = require('axios');

module.exports = {
  addUpdateProductInAzureApi: async (req,requestData) => {
    sails.log('addUpdateProductInAzureApi----------->', req.headers.authorization);
    const options = {
      method : 'POST',
      data   : {
        ...requestData
      },
      url: `${process.env.APP_BASE_URL}payment/public/azure-create-update-product`,
    };
    return axios(options);
  },
  getSubscriptionByProductApi: async (req,requestData) => {
    sails.log('getSubscriptionByProductApi----------->', req.headers.authorization);
    const options = {
      method : 'POST',
      data   : {
        ...requestData
      },
      url: `${process.env.APP_BASE_URL}payment/public/azure-get-subscription-by-product`,
    };
    return axios(options);
  },
  findSecretKeyListApi: async (req,requestData) => {
    sails.log('findSecretKeyListApi----------->', req.headers.authorization);
    const options = {
      method : 'POST',
      data   : {
        ...requestData
      },
      url: `${process.env.APP_BASE_URL}payment/public/azure-secret-key-list`,
    };
    return axios(options);
  },
  addApiInProductApi: async (req,requestData) => {
    sails.log('addApiInProductApi----------->', req.headers.authorization);
    const options = {
      method : 'POST',
      data   : {
        ...requestData
      },
      url: `${process.env.APP_BASE_URL}payment/public/azure-add-api-in-product`,
    };
    return axios(options);
  },
  addPolicyInProductApi: async (req,requestData) => {
    sails.log('addPolicyInProductApi----------->', req.headers.authorization);
    const options = {
      method : 'POST',
      data   : {
        ...requestData
      },
      url: `${process.env.APP_BASE_URL}payment/public/azure-add-policy-in-product`,
    };
    return axios(options);
  }
};
