const AzureAPIValidations = require('../validations/AzureAPIValidations');
const axios = require('axios');
const qs = require('qs');
const { RESPONSE_STATUS, KEY_TYPE } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const { escapeSqlSearch } = require('../services/utils');

const AZURE_API_BASE_URL = `https://management.azure.com/subscriptions/${process.env.AZ_SUBSCRIPTION_ID}/resourceGroups/${process.env.API_MANAGEMENT_RESOURCE_GROUP_NAME}/providers/Microsoft.ApiManagement/service/${process.env.API_MANAGEMENT_SERVICE_NAME}`;

const getAzureAuthToken = async function(){
  let response;
  let data = qs.stringify({
    grant_type    : process.env.API_MANAGEMENT_GRANT_TYPE,
    client_id     : process.env.API_MANAGEMENT_CLIENT_ID,
    client_secret : process.env.API_MANAGEMENT_CLIENT_SECRET,
    resource      : process.env.API_MANAGEMENT_RESOURCE,
  });
  const options = {
    method : 'POST',
    data   : data,
    url    : `https://login.microsoftonline.com/${process.env.API_MANAGEMENT_TENANT_ID}/oauth2/token`,
  };

  await axios(options).then((result) => {
    response = result.data;
  });

  return response.access_token;
};

const getProductSId = async function(account_id){
  const rawResult = await sails.sendNativeQuery(`SELECT azure_product_id, azure_product_sid FROM account WHERE account_id = ${account_id}`);
  const accountData =  rawResult.rows[0] || null;
  return accountData.azure_product_sid;
};
module.exports = {
  createUpdateProduct: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await AzureAPIValidations.createupdateproduct.validate(request);
      if (!isValidate.error) {
        const { account_id, displayname } = req.allParams();
        let auth_token = await getAzureAuthToken();
        const headers = { Authorization: `Bearer ${auth_token}` };

        const options = {
          method  : 'PUT',
          headers : headers,
          url     : `${AZURE_API_BASE_URL}/products/${displayname}?api-version=2021-08-01`,
          data    : {
            'properties': {
              'displayName' : displayname,
              'description' : `${displayname} Customer`,
              'state'       : 'published'
            }
          }
        };

        let response;

        await axios(options).then(async(result)=> {
          response = result.data;
          if(response.name){
            await Account.update(
                    { account_id: account_id },
                    {
                      azure_product_id: response.name
                    }
            ).fetch();
          }
        });

        return res.ok(
              response,
              messages.CREATE_PRODUCT_SUCCESS,
              RESPONSE_STATUS.success
        );
      } else {
        res.ok(
            isValidate.error,
            messages.CREATE_PRODUCT_FAILED,
            RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
          undefined,
          messages.CREATE_PRODUCT_FAILED,
          RESPONSE_STATUS.error
      );
    }
  },
  getSubscriptionByProduct: async (req, res) => {
    try {
      let { account_id }  = req.allParams();
      if(account_id === undefined || account_id === null || account_id === '') {
        account_id = req.account.account_id;
      }

      const rawResult = await sails.sendNativeQuery(`SELECT azure_product_id FROM account WHERE account_id = ${account_id}`);
      const accountData =  rawResult.rows[0] || null;
      const azure_product_id =  accountData.azure_product_id;
      let auth_token = await getAzureAuthToken();
      const headers = { Authorization: `Bearer ${auth_token}` };
      const options = {
        method  : 'GET',
        headers : headers,
        url     : `${AZURE_API_BASE_URL}/products/${azure_product_id}/subscriptions?api-version=2021-08-01`,
      };

      let response;

      await axios(options).then(async(result)=> {
        response = result.data;
        const azure_product_sid = response.value[0].name;
        if(azure_product_sid){
          await sails.sendNativeQuery(`UPDATE account SET azure_product_sid = '${azure_product_sid}' WHERE account_id = ${account_id}`);
        }
      });

      return res.ok(
              response,
              messages.SUBSCRIPTION_PRODUCT_GET_SUCCESSFULL,
              RESPONSE_STATUS.success
      );
    } catch (err) {
      sails.log.error(err);
      return res.ok(
          undefined,
          messages.SUBSCRIPTION_PRODUCT_GET_FAILED,
          RESPONSE_STATUS.error
      );
    }
  },

  addApiInProduct: async (req, res) => {
    try {
      let { account_id }  = req.allParams();
      if(account_id === undefined || account_id === null || account_id === '') {
        account_id = req.account.account_id;
      }

      const rawResult = await sails.sendNativeQuery(`SELECT azure_product_id FROM account WHERE account_id = ${account_id}`);
      const accountData =  rawResult.rows[0] || null;
      const azure_product_id =  accountData.azure_product_id;

      let auth_token = await getAzureAuthToken();
      const headers = { Authorization: `Bearer ${auth_token}` };

      const options = {
        method  : 'GET',
        headers : headers,
        url     : `${AZURE_API_BASE_URL}/apis?api-version=2021-08-01`
      };

      let response;
      let response1;

      await axios(options).then(async(result)=> {
        response = result.data.value;
        for (const value of response) {
          config = {
            method  : 'PUT',
            headers : headers,
            url     : `${AZURE_API_BASE_URL}/products/${azure_product_id}/apis/${value.name}?api-version=2021-08-01`,
          };

          await axios(config).then(async(result1)=> {
            response1 = result1.data;
            sails.log(response1);
          });
        }
      });

      return res.ok(
              response,
              messages.CREATE_PRODUCT_SUCCESS,
              RESPONSE_STATUS.success
      );
    } catch (err) {
      sails.log.error(err);
      return res.ok(
          undefined,
          messages.SUBSCRIPTION_PRODUCT_GET_FAILED,
          RESPONSE_STATUS.error
      );
    }
  },

  findSecretKeyList: async (req, res) => {
    try {
      let { account_id }  = req.allParams();
      if(account_id === undefined || account_id === null || account_id === '') {
        account_id = req.account.account_id;
      }
      const product_sid = await getProductSId(account_id);
      let response;
      let sql = `SELECT azure_primary_api_key, azure_secondary_api_key
                  FROM ${process.env.DB_NAME}.account
                  WHERE azure_product_sid = '${product_sid}' LIMIT 1`;

      const rawResult1 = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      let result = rawResult1.rows[0];

      response = {
        primaryKey   : result.azure_primary_api_key,
        secondaryKey : result.azure_secondary_api_key
      };

      if(!response.primaryKey || !response.secondaryKey){
        let auth_token = await getAzureAuthToken();
        const headers = { Authorization: `Bearer ${auth_token}` };

        const options = {
          method  : 'POST',
          headers : headers,
          url     : `${AZURE_API_BASE_URL}/subscriptions/${product_sid}/listSecrets?api-version=2021-08-01`,
        };

        await axios(options).then(async(resultData) => {
          response = resultData.data;
          if(response.primaryKey && response.secondaryKey){
            await Account.update(
                    { azure_product_sid: product_sid },
                    {
                      azure_primary_api_key   : response.primaryKey,
                      azure_secondary_api_key : response.secondaryKey,
                    }
            ).fetch();
          }
        });
      }

      return res.ok(
              response,
              messages.GET_RECORD,
              RESPONSE_STATUS.success
      );
    } catch (err) {
      sails.log.error(err);
      return res.ok(
          undefined,
          messages.GET_FAILURE,
          RESPONSE_STATUS.error
      );
    }
  },

  regenerateSecretKey: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await AzureAPIValidations.regenerateSecretKey.validate(request);
      if (!isValidate.error) {
        const { key_type } = req.allParams();

        const product_sid = await getProductSId(req.account.account_id);
        let auth_token = await getAzureAuthToken();
        const headers = { Authorization: `Bearer ${auth_token}` };

        let req_key;
        if(key_type === KEY_TYPE.PRIMARY){
          req_key = 'regeneratePrimaryKey';
        }else if(key_type === KEY_TYPE.SECONDARY){
          req_key = 'regenerateSecondaryKey';
        }
        const options = {
          method  : 'POST',
          headers : headers,
          url     : `${AZURE_API_BASE_URL}/subscriptions/${product_sid}/${req_key}?api-version=2021-08-01`,
        };
        sails.log(options);
        let config;
        let response;
        await axios(options).then(async() => {
          config = {
            method  : 'POST',
            headers : headers,
            url     : `${AZURE_API_BASE_URL}/subscriptions/${product_sid}/listSecrets?api-version=2021-08-01`,
          };

          await axios(config).then(async(result)=> {
            response = result.data;
            if(response.primaryKey && response.secondaryKey){
              await Account.update(
                    { azure_product_sid: product_sid },
                    {
                      azure_primary_api_key   : response.primaryKey,
                      azure_secondary_api_key : response.secondaryKey,
                    }
              ).fetch();
            }
          });
        });

        return res.ok(
              response,
              messages.REGENERATE_KEY_SUCCESS,
              RESPONSE_STATUS.success
        );
      } else {
        res.ok(
            isValidate.error,
            messages.REGENERATE_KEY_FAILURE,
            RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
          undefined,
          messages.REGENERATE_KEY_FAILURE,
          RESPONSE_STATUS.error
      );
    }
  },
  addPolicyInProduct: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await AzureAPIValidations.addPolicyInProduct.validate(request);
      if (!isValidate.error) {
        const { account_id, api_quota } = req.allParams();
        let apiSql = `SELECT azure_product_id, azure_primary_api_key, azure_secondary_api_key FROM ${process.env.DB_NAME}.account WHERE account_id = '${account_id}' LIMIT 1`;
        const apiRawResult = await sails.sendNativeQuery(escapeSqlSearch(apiSql)).usingConnection(req.dynamic_connection);
        sails.log(apiRawResult);
        let apiResult = apiRawResult.rows[0];
        const product_id = apiResult.azure_product_id;
        let azure_primary_api_key = apiResult.azure_primary_api_key;
        const rateRenewal   = process.env.API_MANAGEMENT_RATE_RENEWAL_PERIOD;
        const rateCalls    = process.env.API_MANAGEMENT_RATE_CALLS;
        const quotaRenewalPeriod = process.env.API_MANAGEMENT_QUOTA_RENEWAL_PERIOD;

        let auth_token = await getAzureAuthToken();
        const headers = { Authorization: `Bearer ${auth_token}` };
        const value = `<policies><inbound><base /><quota-by-key calls=\"${api_quota}\" counter-key=\"${azure_primary_api_key}\" renewal-period=\"${quotaRenewalPeriod}\" increment-count=\"1\" /><rate-limit-by-key calls=\"${rateCalls}\" renewal-period=\"${rateRenewal}\" counter-key=\"${azure_primary_api_key}\"></rate-limit-by-key></inbound><backend><base /></backend><outbound><base /></outbound><on-error><base /></on-error></policies>`;
        const options = {
          method  : 'PUT',
          headers : headers,
          url     : `${AZURE_API_BASE_URL}/products/${product_id}/policies/policy?api-version=2021-08-01`,
          data    : {
            'properties': {
              'format' : 'xml',
              'value'  : value
            }
          }
        };

        let response;
        sails.log(options);

        await axios(options).then(async(result)=> {
          response = result.data;
          sails.log(response);
        }).catch((error) => {
          sails.log(error);
        });

        return res.ok(
              response,
              messages.ADD_POLICEY_SUCCESS,
              RESPONSE_STATUS.success
        );
      } else {
        res.ok(
            isValidate.error,
            messages.ADD_POLICEY_FAILED,
            RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
          undefined,
          messages.ADD_POLICEY_FAILED,
          RESPONSE_STATUS.error
      );
    }
  },
};
