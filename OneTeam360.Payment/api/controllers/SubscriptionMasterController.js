const messages = sails.config.globals.messages;
const SubscriptionMasterValidation = require('../validations/SubscriptionMasterValidation');
const { RESPONSE_STATUS,STATUS, API_ENABLED } = require('../utils/constants/enums');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const getUserId = async(req)=>{
  if(req.user && req.user.user_id){
    return req.user.user_id;
  }
  else{
    const defaultuser = await Users.findOne({ email: process.env.DEFAULT_ADMIN_USER });
    return defaultuser.user_id;
  }
};

const apiEnabledData=async(pdata)=>{
  return pdata.api_enabled && pdata.api_enabled === '1' ? API_ENABLED.YES : API_ENABLED.NO;
};

const intervalData=async(pdata)=>{
  return pdata.interval && pdata.interval === 'day' ? 'Daily' : 'Monthly';
};

const createProduct = async(subscriptionId, products, userId)=>{
  for(const pdata of products) {
    const subscriptionProduct = {
      subscription_id     : subscriptionId,
      stripe_product_id   : pdata.stripe_product_id,
      stripe_product_name : pdata.stripe_product_name,
      stripe_price_id     : pdata.stripe_price_id,
      api_quota           : pdata.api_quota,
      api_enabled         : await apiEnabledData(pdata),
      interval            : await intervalData(pdata),
      created_by          : userId,
      created_date        : getDateUTC()
    };
    await SubscriptionProduct.create(subscriptionProduct);
  }
};

module.exports = {
  add: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await SubscriptionMasterValidation.add.validate(request);
      if (!isValidate.error) {
        const { subscription_name, products } = request;
        const userId = await getUserId(req);
        const existingname = await Subscription.findOne({ name: subscription_name });
        if (!existingname) {
          const createSubscription = {
            name         : subscription_name,
            status       : STATUS.active,
            created_by   : userId,
            created_date : getDateUTC()
          };
          const newSubscription = await Subscription.create(createSubscription).fetch();
          const newSubscriptionId = newSubscription.subscription_id;
          if(products){
            for(const pdata of products) {
              const subscriptionProduct = {
                subscription_id     : newSubscriptionId,
                stripe_product_id   : pdata.stripe_product_id,
                stripe_product_name : pdata.stripe_product_name,
                stripe_price_id     : pdata.stripe_price_id,
                api_quota           : pdata.api_quota,
                api_enabled         : await apiEnabledData(pdata),
                interval            : await intervalData(pdata),
                created_by          : userId,
                created_date        : getDateUTC()
              };
              await SubscriptionProduct.create(subscriptionProduct);
            }
          }
        } else {
          return res.ok(isValidate.error, messages.SUBSCRIPTION_EXISTS, RESPONSE_STATUS.error);
        }
        return res.ok(undefined, messages.ADD_SUBSCRIPTION_SUCCESS, RESPONSE_STATUS.success);
      }
      else
      {
        return res.ok(isValidate.error, messages.ADD_SUBSCRIPTION_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.ADD_SUBSCRIPTION_FAILED, RESPONSE_STATUS.error);
    }
  },
  edit: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await SubscriptionMasterValidation.edit.validate(request);
      if (!isValidate.error) {
        const { subscription_name, products } = request;
        const subscription = await Subscription.findOne({subscription_id: req.params.id});
        const existingname = await Subscription.find({
          where: {
            subscription_id : { '!=': req.params.id },
            name            : subscription_name,
          }
        });

        if (existingname.length === 0) {
          if(subscription){
            const userId = await getUserId(req);
            await Subscription.update({ subscription_id: req.params.id },
              {
                name              : subscription_name,
                last_updated_by   : userId,
                last_updated_date : getDateUTC()
              });
            if(products){
              await SubscriptionProduct.destroy({ subscription_id: req.params.id });
              const userId1 = await getUserId(req);
              const subscriptionId = req.params.id;
              await createProduct(subscriptionId, products, userId1);
            }
          }
          return res.ok(undefined, messages.UPDATE_SUBSCRIPTION_SUCCESS, RESPONSE_STATUS.success);
        } else {
          return res.ok(isValidate.error, messages.SUBSCRIPTION_EXISTS, RESPONSE_STATUS.error);
        }
      }
      else
      {
        return res.ok(isValidate.error, messages.UPDATE_SUBSCRIPTION_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.UPDATE_SUBSCRIPTION_FAILED, RESPONSE_STATUS.error);
    }
  },
  findById: async function (req, res) {
    try {
      const subscription_id = parseInt(req.params.id);
      const results = await Subscription.findOne({ subscription_id: subscription_id});
      let products = [];
      if(results)
      {
        const productList = await SubscriptionProduct.find({ subscription_id});
        if(productList.length > 0 ){
          for (let item of productList) {
            products.push({
              subscription_product_id : item.subscription_product_id,
              subscription_id         : item.subscription_id,
              stripe_product_id       : item.stripe_product_id,
              stripe_product_name     : item.stripe_product_name,
              stripe_price_id         : item.stripe_price_id,
              api_quota               : item.api_quota,
              interval                : item.interval,
              api_enabled             : (item.api_enabled && item.api_enabled === 'Yes') ? API_ENABLED.YES : API_ENABLED.NO,
            });
          }
        }
        let SubscriptionList ={
          subscription_id : results.subscription_id,
          name            : results.name,
          status          : results.status,
          products        : products,
        };
        return res.ok(SubscriptionList, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },
  list: async function (req, res) {
    try{
      let request = req.allParams();
      let {  perPage } = request;
      const isValidate = await SubscriptionMasterValidation.filter.validate(request);
      if (!isValidate.error) {
        let result;
        const findQuery = await commonListing(request);
        let sql = `SELECT s.subscription_id, s.name, s.status,
                  CONCAT(u1.first_name, " ", u1.last_name) AS created_by, CONCAT(u1.first_name, " ", u1.last_name) AS modified_by,
                  (SELECT COUNT(subscription_id) AS cnt FROM account_subscription AS asu where asu.subscription_id = s.subscription_id) AS customer_count,
                  s.created_date, s.last_updated_date AS modified_date
                  FROM subscription AS s 
                  LEFT JOIN user as u1 ON u1.user_id = s.created_by
                  LEFT JOIN user as u2 ON u2.user_id = s.last_updated_by`;

        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          sql = sql + ` WHERE 1=1 `;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              if ((prop === 'status') && (data[prop] !== '')) {
                sql = sql + ` AND s.status = '${escapeSearch(data[prop])}'`;
              }
              if ((prop === 'name') && (data[prop] !== '')) {
                sql = sql + ` AND s.name LIKE '%${escapeSearch(data[prop])}%'`;
              }
              if (prop === 'created_by' && data[prop] !== '') {
                sql = sql + ` AND (concat(u1.first_name, " ", u1.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
              }
              if (prop === 'modified_by' && data[prop] !== '') {
                sql = sql + ` AND (concat(u2.first_name, " ", u2.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
              }
              if (prop === 'created_date') {
                if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
                {
                  const createdDate = moment(data[prop]).format('YYYY-MM-DD');
                  sql = sql + ` AND (date(s.${prop}) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
                }
              }
              if (prop === 'modified_date') {
                if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
                {
                  const createdDate = moment(data[prop]).format('YYYY-MM-DD');
                  sql = sql + ` AND (date(s.${prop}) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
                }
              }
            });
          }
        }
        if(findQuery.sort === 'status DESC')
        {
          findQuery.sort = `s.status DESC`;
        }
        else if(findQuery.sort === 'status ASC')
        {
          findQuery.sort = `s.status ASC`;
        }
        sql = sql + ` ORDER BY ${findQuery.sort} `;
        const lengthsql = sql;
        const rawResultLength = await sails.sendNativeQuery(escapeSqlSearch(lengthsql));
        const resultsLength = rawResultLength.rows;
        sql = sql + ` limit ${perPage} offset ${findQuery.skip}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql));
        result = rawResult.rows;

        if (result) {
          let allData = {};
          let reportResponse = [];
          for (let item of result) {
            reportResponse.push({
              subscription_id : item.subscription_id,
              name            : item.name,
              status          : item.status,
              created_by      : item.created_by,
              modified_by     : item.modified_by,
              customer_count  : item.customer_count,
              created_date    : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
              modified_date   : (item.modified_date) ? getDateSpecificTimeZone(item.modified_date, req.timezone, req.dateFormat) : ''
            });
          }

          allData = {
            totalRecords : resultsLength.length,
            listData     : reportResponse
          };

          return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);

        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }

      } else {
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },
  listProducts: async(_req, res) =>{
    try{
      const products = await stripe.products.list({limit: 100, active: true});
      const productData = products.data;
      const prices = await stripe.prices.list({limit: 100});
      let pricesdata = prices.data;
      let price_id = '';
      let productsId = '';
      let interval = '';
      let priceWiseProducts = {};
      let internalWiseProducts = {};
      let currencyWiseProducts = {};
      let currency = '';
      for(const pdata of pricesdata) {
        price_id = pdata.id;
        productsId = pdata.product;
        interval = (pdata.recurring !== null) ? pdata.recurring.interval : '';
        priceWiseProducts[productsId] =  price_id;
        internalWiseProducts[productsId] = interval;
        currency = (pdata.currency !== null) ? pdata.currency : '';
        currencyWiseProducts[productsId] = currency;
      }
      let productArr = [];
      let apiproductArr = [];
      let finalProducts = {};
      if (products) {
        for (const data of productData) {
          if(data.metadata.api_quota){
            apiproductArr.push({
              stripe_product_id   : data.id,
              stripe_product_name : data.name,
              stripe_price_id     : priceWiseProducts[data.id],
              interval            : internalWiseProducts[data.id],
              currency            : currencyWiseProducts[data.id],
              api_quota           : data.metadata.api_quota,
              api_enabled         : data.metadata.api_enabled,
            });
          }else{
            productArr.push({
              stripe_product_id   : data.id,
              stripe_product_name : data.name,
              stripe_price_id     : priceWiseProducts[data.id],
              interval            : internalWiseProducts[data.id],
              currency            : currencyWiseProducts[data.id]
            });
          }
        }
        finalProducts = {apiproduct: apiproductArr , basicproduct: productArr};
      }
      return res.ok(
        finalProducts,
        messages.SUBSCRIPTION_GET_SUCCESSFULL,
        RESPONSE_STATUS.success);
    }catch (err) {
      sails.log.error(err);
      return res.ok(
      undefined,
      messages.SOMETHING_WENT_WRONG,
      RESPONSE_STATUS.error
      );
    }
  },
  listSubscription: async function (req, res) {
    try{
      let result;
      let sql = `SELECT s.subscription_id, s.name, 
                 GROUP_CONCAT(sp.subscription_product_id SEPARATOR',') AS subscription_product_id, 
                 GROUP_CONCAT(sp.stripe_product_id SEPARATOR',') AS stripe_product_id, 
                 GROUP_CONCAT(sp.stripe_price_id SEPARATOR',') AS stripe_price_id, 
                 GROUP_CONCAT(sp.stripe_product_name SEPARATOR',') AS stripe_product_name,
                 GROUP_CONCAT(sp.api_enabled SEPARATOR',') AS api_enabled,
                 GROUP_CONCAT(sp.api_quota SEPARATOR',') AS api_quota, 
                 GROUP_CONCAT(sp.interval SEPARATOR',') AS intervals
                 FROM subscription AS s 
                 LEFT JOIN subscription_product AS sp ON s.subscription_id = sp.subscription_id
                 WHERE s.status = 'Active'
                 GROUP BY sp.subscription_id`;
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql));
      result = rawResult.rows;

      if (result) {
        let reportResponse = [];
        for (let item of result) {
          let stripe_product_id = item.stripe_product_id;
          let stripeProductIdArray = stripe_product_id.split(',');
          let price_id = item.stripe_price_id;
          let priceIdArray = price_id.split(',');
          let stripe_product_name = item.stripe_product_name;
          let stripeProductNameArray = stripe_product_name.split(',');
          let subscription_product_id = item.subscription_product_id;
          let subscriptionProductIdArray = subscription_product_id.split(',');
          let api_enabled = item.api_enabled;
          let apiEnabledArray = api_enabled.split(',');
          let api_quota = item.api_quota;
          let apiQuotaArray = api_quota.split(',');
          let interval = item.intervals;
          let intervalArray = interval.split(',');

          let productObject = priceIdArray.map((value, index) => (
            {
              'stripe_price_id'         : value,
              'stripe_product_id'       : stripeProductIdArray[index],
              'stripe_product_name'     : stripeProductNameArray[index],
              'subscription_product_id' : subscriptionProductIdArray[index],
              'api_enabled'             : apiEnabledArray[index],
              'api_quota'               : apiQuotaArray[index],
              'interval'                : intervalArray[index]
            }
          ));

          reportResponse.push({
            subscription_id : item.subscription_id,
            name            : item.name,
            products        : productObject,
          });
        }

        return res.ok(reportResponse, messages.GET_RECORD, RESPONSE_STATUS.success);

      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },
  updatestatus: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await SubscriptionMasterValidation.updatestatus.validate(request);
      if (!isValidate.error) {
        const { subscription_id, status } = request;
        let sql = `SELECT COUNT(account_subscription_id) AS cnt FROM account_subscription WHERE subscription_id = ${subscription_id}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql));
        let result = rawResult.rows[0] || null;

        if(result.cnt === 0) {
          const userId = await getUserId(req);
          await Subscription.update({ subscription_id: subscription_id },
          {
            status            : status,
            last_updated_by   : userId,
            last_updated_date : getDateUTC()
          });
          if(status === 'Inactive') {
            return res.ok(undefined, messages.UPDATE_SUBSCRIPTION_INACTIVE_SUCCESS, RESPONSE_STATUS.success);
          } else {
            return res.ok(undefined, messages.UPDATE_SUBSCRIPTION_ACTIVE_SUCCESS, RESPONSE_STATUS.success);
          }
        } else {
          return res.ok(undefined, messages.CANT_UPDATE_SUBSCRIPTION_STATUS, RESPONSE_STATUS.error);
        }
      }
      else
      {
        return res.ok(isValidate.error, messages.UPDATE_SUBSCRIPTION_STATUS_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.UPDATE_SUBSCRIPTION_FAILED, RESPONSE_STATUS.error);
    }
  },
};
