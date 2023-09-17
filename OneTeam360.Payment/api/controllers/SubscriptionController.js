const messages = sails.config.globals.messages;
const { setCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const SubscriptionValidation = require('../validations/SubscriptionValidation');
const { getCurrentDate, getDateUTC, getTimeStampToDate, datetoTimestamp, getDate } = require('../utils/common/getDateTime');
const { STATUS, PAYMENT_STATUS, SUBSCRIPTION_STATUS, RESPONSE_STATUS, NOTIFICATION_ENTITIES, ACCOUNT_STATUS, MASTERINFO_STATUS,ACCOUNT_CONFIG_CODE,} = require('../utils/constants/enums');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {sendNotification} = require('../services/sendNotification');
const { generateToken } = require('../services/jwt');
const { tenantConnection, escapeSqlSearch } = require('../services/utils');
const {generateString}=require('../services/generateString');
const fs = require('fs');
const path = require('path');
const { addUpdateProductInAzureApi, getSubscriptionByProductApi, findSecretKeyListApi, addApiInProductApi, addPolicyInProductApi } = require('../utils/common/apiCall');

const createDynamicDB = async ({
  account_id,
}) => {
  try{

    let acc_sql = `
      Select 
        account.name as account_name, account.account_id, account_configuration.account_configuration_id 
      from account 
        INNER JOIN 
          account_configuration 
        ON account.account_id = account_configuration.account_id where account.account_id=${account_id};`;

    let adminuseridSql = `select user_id from ${process.env.DB_NAME}.user where email='${process.env.DEFAULT_ADMIN_USER}';`;
    let useridSql = `select account_user.user_id from account_user
    JOIN (Select * from user where primary_user='yes') primary_users
      On primary_users.user_id = account_user.user_id
    where account_id = '${account_id}'`;

    let adminuserresults = await sails.sendNativeQuery(adminuseridSql);

    let accountresults = await sails.sendNativeQuery(acc_sql);
    let useridSqlresults = await sails.sendNativeQuery(useridSql);


    if(!adminuserresults.rows && !adminuserresults.rows.length) {return null;}
    if(!accountresults.rows && !accountresults.rows.length) {return null;}
    if(!useridSqlresults.rows && !useridSqlresults.rows.length) {return null;}

    let admin_user_id = adminuserresults.rows[0].user_id;
    let _account = accountresults.rows[0];
    let user_id = useridSqlresults.rows[0].user_id;

    let DB_SYSTEM = process.env.DB_SYSTEM;
    let DB_USERNAME = process.env.DB_USERNAME;
    let DB_HOST = process.env.DB_HOST;
    let DB_PASSWORD = process.env.DB_PASSWORD;

    /**
     *  Create tenant DB Connection String
     */
    let database_name = `tenant_${account_id}`;
    let tenant_db_connection_string = `${DB_SYSTEM}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${database_name}`;

    /**
     *  Insert tenant DB Connection string in account_configuration_detail
     */

    let accountconf = [];
    accountconf.push({
      account_configuration_id : _account.account_configuration_id,
      name                     : 'DB Connection String',
      code                     : 'tenant_db_connection_string',
      value                    : tenant_db_connection_string,
      default_value            : tenant_db_connection_string,
      description              : 'Database connection String',
      status                   : ACCOUNT_STATUS.active,
      created_by               : user_id,
      last_updated_by          : user_id,
      created_date             : getDateUTC()
    });
    await AccountConfigurationDetail.createEach(accountconf).fetch();

    /**
     *  Create Connection dynamic data
     */
    let createdatabasesql = `CREATE DATABASE IF NOT EXISTS ${database_name}`;
    await sails.sendNativeQuery(createdatabasesql);

    /**
     *  Run Sql Dumb in dynamically created database
     */
    let rdi = sails.getDatastore('default');
    let sql = fs.readFileSync(path.join(__dirname, '../../TenantDBCreation.sql')).toString();

    sql = sql.replace(/masterdb/g,process.env.DB_NAME);
    // }

    // Grab the MySQL module from the datastore instance
    let mysql = rdi.driver.mysql;
    let conn = mysql.createConnection({
      host               : DB_HOST,
      user               : DB_USERNAME,
      password           : DB_PASSWORD,
      database           : database_name,
      debug              : false,
      multipleStatements : true
    });
    conn.connect();
    conn.query(sql,async  (error) => {
      if (error) {
        sails.log('come in error in script');
        sails.log(error);
        throw error;
      }else{
        sails.log('Connection successfull to tenant db');
        /**
         * Add Employee profile for Prime user of the account.
         */
        sails.log({
          user_id            : user_id,
          role_id            : 1,
          date_of_joining    : getCurrentDate(),
          points             : 0,
          status             : ACCOUNT_STATUS.active,
          level_id           : 1,
          employee_import_Id : 0,
          created_by         : admin_user_id,
          last_updated_by    : admin_user_id,
          created_date       : getDateUTC()
        });
        await EmployeeProfile.create({
          user_id            : user_id,
          role_id            : 1,
          date_of_joining    : getCurrentDate(),
          points             : 0,
          status             : ACCOUNT_STATUS.active,
          level_id           : 1,
          employee_import_Id : 0,
          created_by         : admin_user_id,
          last_updated_by    : admin_user_id,
          created_date       : getDateUTC()
        }).fetch().usingConnection(conn);

        let userSql = `select user_id FROM ${process.env.DB_NAME}.user WHERE email = '${process.env.EXPOSE_API_USER_EMAIL}'`;
        let userSqlresults = await sails.sendNativeQuery(userSql);
        sails.log('userSqlresults',userSqlresults);
        let systemUserId = userSqlresults.rows[0] || null;

        if(systemUserId){
          await EmployeeProfile.create({
            user_id            : systemUserId.user_id,
            role_id            : 2,
            date_of_joining    : getCurrentDate(),
            points             : 0,
            status             : ACCOUNT_STATUS.inactive,
            level_id           : 1,
            employee_import_Id : 0,
            created_by         : admin_user_id,
            last_updated_by    : admin_user_id,
            created_date       : getDateUTC()
          }).fetch().usingConnection(conn);
        }
        sails.log('in last ------>',{
          user_id            : user_id,
          role_id            : 1,
          date_of_joining    : getCurrentDate(),
          points             : 0,
          status             : ACCOUNT_STATUS.active,
          level_id           : 1,
          employee_import_Id : 0,
          created_by         : admin_user_id,
          last_updated_by    : admin_user_id,
          created_date       : getDateUTC()
        });
        conn.end();
      }
    });

  }catch(error){
    sails.log('Error in Creating Dynamic DB : ', error);
  }
};

const getSubscriptionDetails = async function(_req, account_subscription_id){
  let sql = `SELECT asu.account_subscription_id, asu.subscription_id, asu.account_id, asu.stripe_customer_id, asu.stripe_subscription_id, MAX(asp.seats) AS seats, asu.next_payment_date, asu.payment_start_date,
 asu.stripe_payment_intent_id, asu.stripe_payment_method_id, asu.stripe_latest_invoice_id,
  asu.stripe_coupon_id, asu.amount_total, asu.amount_subtotal, asu.billing_cycle, asu.currency, asu.free_trial, asu.free_trial_days, asu.price_per_user,
  asu.payment_status, asu.expiry_date, asu.subscription_status, asu.created_date, asu.created_by, asu.last_updated_date, asu.last_updated_by, asu.paymentlinktoken
  FROM account_subscription AS asu 
  LEFT JOIN account_subscription_product AS asp ON asp.account_subscription_id = asu.account_subscription_id
  WHERE asu.account_subscription_id = '${account_subscription_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};

const getUpdatedSubscriptionDetails = async function(account_subscription_id){
  let sql = `SELECT ausp.subscription_product_id, ausp.seats, ausp.stripe_sid, sp.stripe_price_id 
            FROM account_update_subscription_product AS ausp
            INNER JOIN subscription_product AS sp ON ausp.subscription_product_id = sp.subscription_product_id
            WHERE ausp.account_subscription_id = '${account_subscription_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows || null;
};

const getMaxApiQuotaValue = async function(subscription_id){
  let sql = `SELECT MAX(api_quota) as api_quota FROM subscription_product WHERE subscription_id = '${subscription_id}' GROUP BY subscription_id`;
  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows || null;
};

const getSubscriptionDetailsByStripeId = async function(_req, stripe_id){
  let sql = `SELECT a.stripe_customer_id, a.name AS customer_name, asu.account_subscription_id, asu.subscription_id, asu.account_id, asu.stripe_subscription_id, MAX(asp.seats) AS seats, GROUP_CONCAT(asp.seats SEPARATOR',') AS seat, asu.next_payment_date, asu.payment_start_date,
            GROUP_CONCAT(sp.stripe_product_id SEPARATOR',') AS stripe_product_id, GROUP_CONCAT(sp.stripe_price_id SEPARATOR',') AS stripe_price_id, GROUP_CONCAT(asp.stripe_sid SEPARATOR',') AS stripe_sid, asu.stripe_payment_intent_id, asu.stripe_payment_method_id, asu.stripe_latest_invoice_id,
            asu.stripe_coupon_id, asu.amount_total, asu.amount_subtotal, sp.interval AS billing_cycle, asu.currency, asu.free_trial, asu.free_trial_days, asu.price_per_user, MAX(sp.api_quota) AS api_quota,
            asu.payment_status,a.user_exists, asu.expiry_date, asu.subscription_status, asu.created_date, asu.created_by, asu.last_updated_date, asu.last_updated_by 
            FROM account AS a 
            LEFT JOIN account_subscription AS asu ON a.account_id = asu.account_id
            LEFT JOIN account_subscription_product AS asp ON asp.account_subscription_id = asu.account_subscription_id
            LEFT JOIN subscription_product AS sp ON sp.subscription_product_id = asp.subscription_product_id
            WHERE (a.stripe_customer_id = '${stripe_id}' OR asu.stripe_subscription_id = '${stripe_id}')
            GROUP BY asu.account_subscription_id`;

  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};

const addAppLog = async function(user_id, account_id, customer_id, title, request, response, status) {
  await AppLog.create({
    user_id,
    account_id,
    customer_id,
    title,
    request,
    response,
    status,
    created_date: getDateUTC()
  }).fetch();
};

const createSubscriptionHistory = async function(req, stripe_customer_id, title){
  let sql = `SELECT asu.account_subscription_id, asu.account_id, asu.subscription_id ,asu.stripe_subscription_id, GROUP_CONCAT(asp.seats SEPARATOR',') AS seats, asu.next_payment_date, asu.payment_start_date, 
            GROUP_CONCAT(sp.stripe_product_id SEPARATOR',') AS stripe_product_id, GROUP_CONCAT(sp.stripe_price_id SEPARATOR',') AS stripe_price_id, asu.stripe_payment_intent_id, asu.stripe_payment_method_id, 
            asu.stripe_latest_invoice_id, GROUP_CONCAT(asp.stripe_sid SEPARATOR',') AS stripe_sid, asu.stripe_coupon_id, asu.amount_total, asu.amount_subtotal, asu.billing_cycle, asu.currency, asu.free_trial, 
            asu.free_trial_days, asu.price_per_user, asu.payment_status, asu.expiry_date, asu.subscription_status 
            FROM account_subscription AS asu
            LEFT JOIN account_subscription_product AS asp ON asp.account_subscription_id = asu.account_subscription_id
            LEFT JOIN subscription_product AS sp ON sp.subscription_product_id = asp.subscription_product_id
            WHERE stripe_customer_id = '${stripe_customer_id}'
            GROUP BY asu.account_subscription_id`;

  const rawResult = await sails.sendNativeQuery(sql);
  let results = rawResult.rows[0] || null;
  let userId = '';
  if(req.user){
    if(req.user.user_id){
      userId = req.user.user_id;
    }
  }
  else{
    const defaultuser = await Users.findOne({ email: process.env.DEFAULT_ADMIN_USER });
    userId = defaultuser.user_id;
  }
  let historyReq = {
    account_subscription_id  : results.account_subscription_id,
    subscription_id          : results.subscription_id,
    stripe_subscription_id   : results.stripe_subscription_id,
    seats                    : results.seats,
    next_payment_date        : results.next_payment_date,
    payment_start_date       : results.payment_start_date,
    stripe_product_id        : results.stripe_product_id,
    stripe_price_id          : results.stripe_price_id,
    stripe_payment_intent_id : results.stripe_payment_intent_id,
    stripe_payment_method_id : results.stripe_payment_method_id,
    stripe_latest_invoice_id : results.stripe_latest_invoice_id,
    stripe_sid               : results.stripe_sid,
    stripe_coupon_id         : results.stripe_coupon_id,
    amount_total             : results.amount_total,
    amount_subtotal          : results.amount_subtotal,
    billing_cycle            : results.billing_cycle,
    currency                 : results.currency,
    free_trial               : results.free_trial,
    free_trial_days          : results.free_trial_days,
    price_per_user           : results.price_per_user,
    payment_status           : results.payment_status,
    expiry_date              : results.expiry_date,
    subscription_status      : results.subscription_status,
    created_date             : getDateUTC(),
    created_by               : userId
  };

  let newSubscriptionHistory = {};
  let account_subscription_history_id = '';
  try{
    newSubscriptionHistory = await AccountSubscriptionHistory.create(historyReq).fetch();
    account_subscription_history_id = newSubscriptionHistory.account_subscription_history_id;
    await addAppLog(userId, results.account_id, stripe_customer_id, title, JSON.stringify({'request': historyReq}), JSON.stringify({'error': ''}), 'success');
  } catch(e){
    const error = e;
    await addAppLog(userId, results.account_id, stripe_customer_id, title, JSON.stringify({'request': historyReq}), JSON.stringify({'error': error}), 'error');
  }
  return account_subscription_history_id;
};
const getCustomerDetails = async function(_req, account_id){
  let sql = `SELECT a.account_id, a.name, a.account_guid, a.address, a.onboard_status, a.status AS account_status, a.email AS account_email, a.phone AS account_phone, a.city_id as account_city_id,
                    a.state_id AS account_state_id, a.country_id AS account_country_id, a.zip AS account_zip, a.website_url AS account_website_url, a.company_logo_url AS account_company_logo_url,
                    stripe_customer_id, au.account_user_id, au.user_id, account_owner, u.email AS user_email, first_name, last_name, u.phone AS user_phone, u.status AS user_status, portal_access, primary_user
            FROM account AS a 
            LEFT JOIN account_user AS au ON a.account_id = au.account_id
            LEFT JOIN user AS u ON au.user_id = u.user_id
            WHERE a.account_id = '${account_id}' and u.primary_user = 'Yes'`;

  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};
const getCustomerSubscriptionDetails = async function(_req, account_id){
  let sql = `SELECT a.account_id, a.name, a.account_guid, a.address, a.onboard_status, a.status AS account_status, a.email AS account_email, a.phone AS account_phone, a.city_id as account_city_id,
                    a.state_id AS account_state_id, a.country_id AS account_country_id, a.zip AS account_zip, a.website_url AS account_website_url, a.company_logo_url AS account_company_logo_url,
                    asu.account_subscription_id, asu.subscription_id, asu.stripe_customer_id, asu.stripe_subscription_id, MAX(asp.seats) AS seats, GROUP_CONCAT(asp.seats SEPARATOR',') AS seat, asu.next_payment_date, asu.payment_start_date, 
                    GROUP_CONCAT(sp.stripe_product_id SEPARATOR',') AS stripe_product_id, GROUP_CONCAT(sp.stripe_price_id SEPARATOR',') AS stripe_price_id, GROUP_CONCAT(sp.stripe_product_name SEPARATOR',') AS stripe_product_name, 
                    GROUP_CONCAT(sp.subscription_product_id SEPARATOR',') AS subscription_product_id, GROUP_CONCAT(asp.account_subscription_product_id SEPARATOR',') AS account_subscription_product_id, asu.stripe_payment_intent_id, asu.stripe_payment_method_id, asu.stripe_latest_invoice_id, 
                    GROUP_CONCAT(IFNULL(asp.stripe_sid, 0) SEPARATOR',') AS stripe_sid, asu.stripe_coupon_id, asu.amount_total, asu.amount_subtotal, asu.billing_cycle, asu.currency, asu.free_trial, asu.free_trial_days, asu.price_per_user,
                    asu.payment_status, asu.expiry_date, asu.subscription_status, asu.account_subscription_id, ab.address AS billing_address, ab.country_id AS billing_country_id, 
                    ab.state_id AS billing_state_id, ab.city_id AS billing_city_id, ab.zip AS billing_zip, a.address AS customer_address, a.country_id AS customer_country_id, 
                    a.state_id AS customer_state_id, a.city_id AS customer_city_id, a.zip AS customer_zip, a.is_address_same_as_billing   
            FROM account AS a 
            LEFT JOIN account_subscription AS asu ON a.account_id = asu.account_id
            LEFT JOIN account_billing AS ab ON ab.account_id = asu.account_id
            LEFT JOIN account_subscription_product AS asp ON asp.account_subscription_id = asu.account_subscription_id
            LEFT JOIN subscription AS s ON s.subscription_id = asu.subscription_id
            LEFT JOIN subscription_product AS sp ON sp.subscription_id = s.subscription_id
            WHERE a.account_id = '${account_id}' GROUP BY asu.account_subscription_id`;
  sails.log(sql);
  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};
const getpaymentStatus = async function(_req, account_subscription_id){
  let sql = `SELECT a.status AS account_status, asb.payment_status AS payment_status, asb.subscription_status AS subscription_status FROM account AS a 
  LEFT JOIN account_subscription asb ON a.account_id = asb.account_id WHERE asb.account_subscription_id = '${account_subscription_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};

const delay = async function(time){
  return new Promise(resolve => setTimeout(resolve, time));
};

const sendEmail = async function (req, account_id, userexists){
  await delay(600000);
  const accountDetails = await getCustomerDetails(req, account_id);
  if(accountDetails && userexists)
  {
    if(userexists === 'No' || accountDetails.user_status === STATUS.invited){
      const token = generateToken({ id: accountDetails.user_id, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, process.env.JWT_CREATE_PASS_EXPIRY);
      const createUrl = `${process.env.FRONTEND_BASEURL}/create-password?token=${token}`;
      await Users.update({ user_id: accountDetails.user_id }, {
        reset_password_token: token,
      });
      await sendNotification(req, {
        notification_entity  : NOTIFICATION_ENTITIES.CREATE_PASSWORD_CUSTOMER,
        recipient_email      : accountDetails.user_email,
        recipient_first_name : accountDetails.first_name,
        recipient_last_name  : accountDetails.last_name,
        receipient_user_id   : accountDetails.user_id,
        url                  : createUrl,
      });
    }
    else{
      await sendNotification(req, {
        notification_entity  : NOTIFICATION_ENTITIES.NOTIFICATION_CUSTOMER,
        recipient_email      : accountDetails.user_email,
        recipient_first_name : accountDetails.first_name,
        recipient_last_name  : accountDetails.last_name,
        receipient_user_id   : accountDetails.user_id
      });
    }
    await Account.update({ account_id: account_id }, {user_exists: ''}).fetch();
  }
};
const getSubscriptionDetailsfromTemp = async function(_req, account_subscription_id){
  let sql = `SELECT asu.account_subscription_id, asu.subscription_id, asu.stripe_subscription_id, MAX(asp.seats) AS seats, GROUP_CONCAT(asp.seats SEPARATOR',') AS seat, asu.next_payment_date, asu.payment_start_date,
 GROUP_CONCAT(sp.stripe_product_id SEPARATOR',') AS stripe_product_id, GROUP_CONCAT(sp.stripe_price_id SEPARATOR',') AS stripe_price_id, asu.stripe_latest_invoice_id,
 asu.stripe_coupon_id, asu.amount_total, asu.amount_subtotal, sp.interval AS billing_cycle, asu.currency, MAX(sp.api_quota) AS api_quota,
 asu.created_date, asu.created_by, asu.last_updated_date, asu.last_updated_by, s.name AS subscription_name
 FROM account_update_subscription AS asu 
 LEFT JOIN account_update_subscription_product AS asp ON asp.account_subscription_id = asu.account_subscription_id
 LEFT JOIN subscription AS s ON asu.subscription_id = s.subscription_id
 LEFT JOIN subscription_product AS sp ON sp.subscription_product_id = asp.subscription_product_id
 WHERE asu.account_subscription_id = '${account_subscription_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  return rawResult.rows[0] || null;
};

const updateAccountCache = async function (account_id) {
  const accountDetails = await sails.sendNativeQuery(`Select account.account_guid, account.account_id from  account where account.account_id = ${account_id}`);
  const resultAccount = accountDetails.rows;
  const getKey = `${resultAccount[0].account_guid}_${MASTERINFO_STATUS.account}`;
  let accountKeyExists = await keyExists(getKey);
  if(accountKeyExists === 1)
  {
    await deleteCache(getKey);
    const sqlAccount = `Select distinct account.account_id, account_guid, account.name, address, onboard_status, account.status, 
              ac.account_configuration_id,  asb.payment_status as payment_status,
              (select GROUP_CONCAT(acgd.code SEPARATOR ",") FROM account_configuration_detail acgd 
              WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_code,
              (select GROUP_CONCAT(acgd.value SEPARATOR ",") FROM account_configuration_detail acgd 
              WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_value
              from account 
              INNER JOIN account_configuration ac ON account.account_id = ac.account_id 
              INNER JOIN account_subscription asb ON account.account_id = asb.account_id  
              where account.account_id = ${resultAccount[0].account_id}`;
    const rawAccount = await sails.sendNativeQuery(sqlAccount);
    let results = rawAccount.rows[0];

    const dataAccount = {
      'key'   : `${results.account_guid}_${MASTERINFO_STATUS.account}`,
      'value' : results
    };
    await setCache(dataAccount);
  }

};

const updateSid = async function (account_subscription_id, subscription_id, stripe_product_id, stripe_sid) {
  let sql = `SELECT subscription_product_id FROM subscription_product WHERE subscription_id = '${subscription_id}' AND stripe_product_id = '${stripe_product_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  const spid =  rawResult.rows[0] || null;
  const subscription_product_id = spid.subscription_product_id;
  let sql1 = `UPDATE account_subscription_product SET stripe_sid = '${stripe_sid}' WHERE account_subscription_id = '${account_subscription_id}' AND subscription_product_id = '${subscription_product_id}'`;
  await sails.sendNativeQuery(sql1);
};
const accountUpdatesubscriptionSid = async function (account_subscription_id, subscription_id, stripe_product_id, stripe_sid) {
  let sql = `SELECT subscription_product_id FROM subscription_product WHERE subscription_id = '${subscription_id}' AND stripe_product_id = '${stripe_product_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  const spid =  rawResult.rows[0] || null;
  const subscription_product_id = spid.subscription_product_id;
  let sql1 = `UPDATE account_update_subscription_product SET stripe_sid = '${stripe_sid}' WHERE account_subscription_id = '${account_subscription_id}' AND subscription_product_id = '${subscription_product_id}'`;
  await sails.sendNativeQuery(sql1);
};

const getUserId = async(user)=>{
  let userId = '';
  if(user.user_id){
    userId = user.user_id;
  } else {
    const defaultuser = await Users.findOne({ email: process.env.DEFAULT_ADMIN_USER });
    userId = defaultuser.user_id;
  }
  return userId;
};
const line1 = async(addressRequest, address)=>{
  if(address !== undefined && address !== null && address !== '') {
    addressRequest.line1 = address;
  }
  return addressRequest;
};

const postal_code = async(addressRequest, zip)=>{
  if(zip !== undefined && zip !== null && zip !== '') {
    addressRequest.postal_code = zip;
  }
  return addressRequest;
};

const cityName = async(addressRequest, city_name)=>{
  if(city_name !== undefined && city_name !== null && city_name !== '') {
    addressRequest.city = city_name;
  }
  return addressRequest;
};

const stateName = async(addressRequest, state_name)=>{
  if(state_name !== undefined && state_name !== null && state_name !== '') {
    addressRequest.state = state_name;
  }
  return addressRequest;
};

const countryName = async(addressRequest, country_name)=>{
  if(country_name !== undefined && country_name !== null && country_name !== '') {
    addressRequest.country = country_name;
  }
  return addressRequest;
};

const getAddress = async(customerRequest, addressRequest)=>{
  if(Object.keys(addressRequest).length > 0) {
    customerRequest.address = addressRequest;
  }
  return customerRequest;
};

const createAccountProduct = async(products, accountSubscriptionId, user_id)=>{
  const subscription_product_arr = products.map((item) => {
    return {
      account_subscription_id : accountSubscriptionId,
      subscription_product_id : item.subscription_product_id,
      seats                   : item.seats,
      created_by              : user_id,
      created_date            : getDateUTC()
    };
  });
  if (subscription_product_arr.length > 0) {
    await AccountSubscriptionProduct.createEach(subscription_product_arr).fetch();
  }
};
const createUpdateAccountProduct = async(products, accountSubscriptionId, user_id)=>{
  const subscription_product_arr = products.map((item1) => {
    return {
      account_subscription_id : accountSubscriptionId,
      subscription_product_id : item1.subscription_product_id,
      seats                   : item1.seats,
      created_by              : user_id,
      created_date            : getDateUTC()
    };
  });
  if (subscription_product_arr.length > 0) {
    await AccountUpdateSubscriptionProduct.createEach(subscription_product_arr).fetch();
  }
};
const quoteReq = async(quoteRequest, stripe_coupon_id)=>{
  if(stripe_coupon_id !== '' && stripe_coupon_id !== null && stripe_coupon_id !== undefined) {
    quoteRequest.discounts  = [{ coupon: stripe_coupon_id },];
  }
  return quoteRequest;
};

const updateAddress = async(updateAddressRequest, address)=>{
  if(address !== undefined && address !== null && address !== '') {
    updateAddressRequest.address = address;
  } else {
    updateAddressRequest.address = '';
  }
  return updateAddressRequest;
};

const updateCountryID = async(updateAddressRequest, country_id)=>{
  if(country_id !== undefined && country_id !== null && country_id !== '') {
    updateAddressRequest.country_id = country_id;
  } else {
    updateAddressRequest.country_id = 0;
  }
  return updateAddressRequest;
};

const updateStateId = async(updateAddressRequest, state_id)=>{
  if(state_id !== undefined && state_id !== null && state_id !== '') {
    updateAddressRequest.state_id = state_id;
  } else {
    updateAddressRequest.state_id = 0;
  }
  return updateAddressRequest;
};

const updateCityId = async(updateAddressRequest, city_id)=>{
  if(city_id !== undefined && city_id !== null && city_id !== '') {
    updateAddressRequest.city_id = city_id;
  } else {
    updateAddressRequest.city_id = 0;
  }
  return updateAddressRequest;
};

const updateZip = async(updateAddressRequest, zip)=>{
  if(zip !== undefined && zip !== null && zip !== '') {
    updateAddressRequest.zip = zip;
  }
  return updateAddressRequest;
};

const expiryDate = async(quote)=>{
  return quote.expires_at ? getTimeStampToDate(quote.expires_at*1000,'YYYY-MM-DD') : '';
};

const subscriptionReq = async(subscrptionRequest, stripe_coupon_id)=>{
  if(stripe_coupon_id !== undefined && stripe_coupon_id !== null && stripe_coupon_id !== '') {
    subscrptionRequest.coupon = stripe_coupon_id;
  }
  return subscrptionRequest;
};
const trialEnd = async(subscription)=>{
  return subscription.trial_end ? getTimeStampToDate(subscription.trial_end*1000,'YYYY-MM-DD') : '';
};

const currentPeriodStart = async(subscription)=>{
  return subscription.current_period_start ? getTimeStampToDate(subscription.current_period_start*1000,'YYYY-MM-DD') : '';
};
const currentPeriodEnd = async(subscription)=>{
  return subscription.current_period_end ? getTimeStampToDate(subscription.current_period_end*1000,'YYYY-MM-DD') : '';
};

const createProductinAzure = async(req, priceIdArray, customer_name, account_id, api_quota)=>{
  if(priceIdArray.length >= 2) {
    let customerName = customer_name.replace(/\s/g, '');
    await addUpdateProductInAzureApi(req,{
      displayname : customerName,
      account_id  : account_id
    });
    await getSubscriptionByProductApi(req, {account_id: account_id});
    await findSecretKeyListApi(req, {account_id: account_id});
    await addApiInProductApi(req, {account_id: account_id});
    await addPolicyInProductApi(req, {account_id: account_id, api_quota: api_quota});
  }
};

const updateSubReq = async(old_seats, seats, old_subscription_id, subscription_id, products, stripe_customer_id, stripe_coupon_id, amount_subtotal,
  amount_total, currency, expiry_date, updateSubscriptionRequest) => {
  if(old_seats !== seats || old_subscription_id !== subscription_id) {
    let product_arr = products.map((products_item) => {
      return {
        price    : products_item.stripe_price_id,
        quantity : products_item.seats
      };
    });

    let quoteRequest = {
      customer   : stripe_customer_id,
      line_items : product_arr,
    };
    await quoteReq(quoteRequest, stripe_coupon_id);
    let quote = await stripe.quotes.create(quoteRequest);

    updateSubscriptionRequest.amount_subtotal = quote.amount_subtotal/100;
    updateSubscriptionRequest.amount_total = quote.amount_total/100;
    updateSubscriptionRequest.currency = quote.currency;
    updateSubscriptionRequest.price_per_user = (quote.amount_total/100)/seats;
    updateSubscriptionRequest.expiry_date = await expiryDate(quote);
  } else {
    updateSubscriptionRequest.amount_subtotal = amount_subtotal;
    updateSubscriptionRequest.amount_total = amount_total;
    updateSubscriptionRequest.currency = currency;
    updateSubscriptionRequest.expiry_date = expiry_date;
  }
  return updateSubscriptionRequest;
};

const updateSubProReq = async(old_subscription_id, subscription_id, products, account_subscription_id, user_id) => {
  if(old_subscription_id !== subscription_id) {
    await AccountSubscriptionProduct.destroy({ account_subscription_id: account_subscription_id }).fetch();
    await createAccountProduct(products, account_subscription_id, user_id);
  } else {
    for (const p1 of products) {
      await AccountSubscriptionProduct.update({account_subscription_id: account_subscription_id, subscription_product_id: p1.subscription_product_id}, {seats: p1.seats}).fetch();
    }
  }
  return true;
};

const createAccountProductAfterPayment = async(products, accountSubscriptionId, user_id)=>{
  const subscription_product_arr = products.map((item) => {
    return {
      account_subscription_id : accountSubscriptionId,
      subscription_product_id : item.subscription_product_id,
      seats                   : item.seats,
      stripe_sid              : item.stripe_sid,
      created_by              : user_id,
      created_date            : getDateUTC()
    };
  });
  sails.log('after update final subscription_product_arr--->',subscription_product_arr);
  if (subscription_product_arr.length > 0) {
    await AccountSubscriptionProduct.createEach(subscription_product_arr).fetch();
  }
};

const updateSubProAfterPayment = async(old_subscription_id, subscription_id, products, account_subscription_id, user_id) => {
  sails.log('old_subscription_id--->',old_subscription_id);
  sails.log('subscription_id--->',subscription_id);
  sails.log('account_subscription_id--->',account_subscription_id,products);
  if(old_subscription_id !== subscription_id) {
    await AccountSubscriptionProduct.destroy({ account_subscription_id: account_subscription_id }).fetch();
    await createAccountProductAfterPayment(products, account_subscription_id, user_id);
  } else {
    for (const p1 of products) {
      await AccountSubscriptionProduct.update({account_subscription_id: account_subscription_id, subscription_product_id: p1.subscription_product_id}, {seats: p1.seats}).fetch();
    }
  }
  return true;
};

const periodStart = async(retriveSubscription)=>{
  return retriveSubscription.current_period_start ? getTimeStampToDate(retriveSubscription.current_period_start*1000,'YYYY-MM-DD') : '';
};

const periodEnd = async(retriveSubscription)=>{
  return retriveSubscription.current_period_end ? getTimeStampToDate(retriveSubscription.current_period_end*1000,'YYYY-MM-DD') : '';
};

module.exports = {
  add: async(req, res) =>{
    let request = req.allParams();
    const isValidate = await SubscriptionValidation.add.validate(request);
    if (!isValidate.error) {
      try{
        const { account_subscription_id, account_id, stripe_customer_id, subscription_id, products, stripe_coupon_id, amount_total, amount_subtotal, billing_cycle, currency, free_trial,
          free_trial_days, price_per_user, payment_start_date, next_payment_date, expiry_date, address, country_id, state_id, city_id, zip, city_name, country_name, state_name, is_address_same_as_billing} = req.allParams();

        let userId = await getUserId(req.user);

        let updateData = {
          is_address_same_as_billing : is_address_same_as_billing,
          last_updated_by            : userId,
          last_updated_date          : getDateUTC()
        };
        await Account.update({ account_id: account_id }, updateData).fetch();

        const customerDetails = await Account.findOne({ account_id: account_id });
        const customerName = customerDetails.name;
        const customerEmail = customerDetails.email;
        const customerPhone = customerDetails.phone;
        let customerRequest = {};
        customerRequest.name = customerName;
        customerRequest.email = customerEmail;
        customerRequest.phone = customerPhone;
        let addressRequest = {};

        await line1(addressRequest, address);
        await postal_code(addressRequest, zip);
        await cityName(addressRequest, city_name);
        await stateName(addressRequest, state_name);
        await countryName(addressRequest, country_name);
        await getAddress(customerRequest, addressRequest);

        try{
          await stripe.customers.update(stripe_customer_id, customerRequest);
          await addAppLog(userId, account_id, stripe_customer_id, 'Add - Billing address update', JSON.stringify({'request': customerRequest}), JSON.stringify({'error': ''}), 'success');
        } catch (err) {
          const error = err;
          await addAppLog(userId, account_id, stripe_customer_id, 'Add - Billing address update', JSON.stringify({'request': customerRequest}), JSON.stringify({'error': error}), 'error');
        }

        if(account_subscription_id !== undefined ) {
          const subscriptionDetails = await getSubscriptionDetailsByStripeId(req, stripe_customer_id);
          let old_subscription_id = subscriptionDetails.subscription_id;
          let old_seats = subscriptionDetails.seats;
          let seats = products[0].seats;  // Get basic prodcut seat count
          let updateSubscriptionRequest = {
            subscription_id     : subscription_id,
            stripe_coupon_id    : stripe_coupon_id,
            billing_cycle       : billing_cycle,
            free_trial          : free_trial,
            free_trial_days     : free_trial_days,
            price_per_user      : price_per_user,
            payment_start_date  : payment_start_date,
            next_payment_date   : next_payment_date,
            payment_status      : PAYMENT_STATUS.initiated,
            subscription_status : SUBSCRIPTION_STATUS.inactive,
            created_by          : userId,
            last_updated_by     : null,
            created_date        : getDateUTC()
          };
          // If payment is not made for this customer and on payment pending scenario if admin is tryig to make it payment for this customer in this case then
          // if seats or subscription is change then we need to recalculate quote again
          await updateSubReq(old_seats, seats, old_subscription_id, subscription_id, products, stripe_customer_id, stripe_coupon_id, amount_subtotal, amount_total, currency, expiry_date, updateSubscriptionRequest);
          // Put log here
          try{
            await AccountSubscription.update({ account_subscription_id: account_subscription_id }, updateSubscriptionRequest).fetch();
            // If subscription change then update product accordingly
            await updateSubProReq(old_subscription_id, subscription_id, products, account_subscription_id, userId);

            await addAppLog(userId, account_id, stripe_customer_id, 'Add - Update subscription details ', JSON.stringify({'request': updateSubscriptionRequest}), JSON.stringify({'error': ''}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'Add - Update subscription details ', JSON.stringify({'request': updateSubscriptionRequest}), JSON.stringify({'error': error}), 'error');
          }
          let updateAddressRequest = {};

          await updateAddress(updateAddressRequest, address);
          await updateCountryID(updateAddressRequest, country_id);
          await updateStateId(updateAddressRequest, state_id);
          await updateCityId(updateAddressRequest, city_id);
          await updateZip(updateAddressRequest, zip);
          updateAddressRequest.last_updated_by = userId;
          updateAddressRequest.last_updated_date = getDateUTC();
          await AccountBilling.update({ account_subscription_id: account_subscription_id },updateAddressRequest).fetch();

          await updateAccountCache(account_id);
          const response = {
            account_subscription_id: account_subscription_id
          };
          return res.ok(response, messages.ADD_SUBSCRIPTION, RESPONSE_STATUS.success);
        } else {
          const createSubscriptionRequest = {
            account_id,
            stripe_customer_id,
            subscription_id,
            stripe_coupon_id,
            seats               : 1,
            amount_total        : amount_total,
            amount_subtotal     : amount_subtotal,
            billing_cycle,
            currency,
            free_trial,
            free_trial_days,
            price_per_user      : price_per_user,
            payment_start_date,
            next_payment_date,
            expiry_date,
            payment_status      : PAYMENT_STATUS.initiated,
            subscription_status : SUBSCRIPTION_STATUS.inactive,
            created_by          : userId,
            created_date        : getDateUTC()
          };

          // Put log here
          let accountSubscriptionId = '';
          try{
            const newSubscription = await AccountSubscription.create(createSubscriptionRequest).fetch();
            accountSubscriptionId = newSubscription.account_subscription_id;
            await createAccountProduct(products, accountSubscriptionId, userId);
            await addAppLog(userId, account_id, stripe_customer_id, 'Add - add subscription details ', JSON.stringify({'request': createSubscriptionRequest}), JSON.stringify({'account_subscription_id': accountSubscriptionId}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'Add - add subscription details ', JSON.stringify({'request': createSubscriptionRequest}), JSON.stringify({'error': error}), 'error');
          }

          const newBillingAddress = await AccountBilling.create({
            account_id,
            account_subscription_id : accountSubscriptionId,
            address,
            country_id,
            state_id,
            city_id,
            zip,
            created_by              : userId,
            last_updated_by         : null,
            created_date            : getDateUTC()
          }).fetch();

          const account_billig_id = newBillingAddress.account_billig_id;

          const response = {
            account_subscription_id : accountSubscriptionId,
            account_billig_id       : account_billig_id
          };
          await updateAccountCache(account_id);
          return res.ok(response, messages.ADD_SUBSCRIPTION, RESPONSE_STATUS.success);
        }
      }catch (err) {
        sails.log.error(err);
        return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
        );
      }
    } else {
      sails.log(isValidate.error);
      res.ok(
        undefined,
        messages.SUBSCRIPTION_ADD_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  update: async(req, res) =>{
    try {
      let request = req.allParams();
      const isValidate = await SubscriptionValidation.update.validate(request);
      if (!isValidate.error) {

        const {payment_intent, customerId, status} = req.allParams();
        const customer_id = customerId;
        const subscriptionDetails = await getSubscriptionDetailsByStripeId(req, customer_id);
        const account_subscription_id = subscriptionDetails.account_subscription_id;
        const subscription_id = subscriptionDetails.subscription_id;
        let old_stripe_coupon_id = subscriptionDetails.stripe_coupon_id;
        const account_id = subscriptionDetails.account_id;
        const stripe_payment_method_id = subscriptionDetails.stripe_payment_method_id;
        let customer_name = subscriptionDetails.customer_name;
        const results = await getSubscriptionDetailsfromTemp(req, account_subscription_id);
        const new_subscription_id = results.subscription_id;
        const stripe_subscription_id = results.stripe_subscription_id;
        const stripe_product_id = results.stripe_product_id;
        const stripe_price_id = results.stripe_price_id;
        let new_stripe_coupon_id = results.stripe_coupon_id;
        let priceIdArray = (stripe_price_id.indexOf(',') !== -1) ? stripe_price_id.split(',') : [stripe_price_id];
        const seats = results.seats;
        const stripe_latest_invoice_id = results.stripe_latest_invoice_id;
        const amounttotal = results.amount_total;
        const amountsubtotal = results.amount_subtotal;
        const billing_cycle = results.billing_cycle;
        const payment_start_date = results.payment_start_date;
        let api_quota = results.api_quota;
        try{
          let userId = await getUserId(req.user);

          let invoiceRequest = {};
          //invoiceRequest.paid_out_of_band = true;
          // Put log here
          try{
            const retriveInvoiceData = await stripe.invoices.retrieve(stripe_latest_invoice_id);
            const invoiceStatus = retriveInvoiceData.status;
            if(invoiceStatus !== 'paid') {
              await stripe.invoices.pay(stripe_latest_invoice_id, invoiceRequest);  // confirm payment
              await addAppLog(userId, account_id, customer_id, 'Update - invoice pay in stripe ', JSON.stringify({'request': invoiceRequest}), JSON.stringify({'error': ''}), 'success');
              if(old_stripe_coupon_id !== new_stripe_coupon_id) {
                try{
                  await AccountSubscription.update({ account_subscription_id: account_subscription_id },{
                    stripe_coupon_id: new_stripe_coupon_id,
                  }).fetch();
                  await addAppLog(userId, account_id, customer_id, 'Update - update 1 coupon id in account subscription table in db', JSON.stringify({'request': {stripe_coupon_id: new_stripe_coupon_id,}}), JSON.stringify({'error': ''}), 'success');
                } catch(e){
                  const error = e;
                  await addAppLog(userId, account_id, customer_id, 'Update - update 2 coupon id in account subscription table in db', JSON.stringify({'request': {stripe_coupon_id: new_stripe_coupon_id,}}), JSON.stringify({'error': error}), 'error');
                }
              }

            }
          } catch(e){
            const error = e;
            // when payment declined in that case update latest invoide id in account subcription table so when customer open link from payment
            // declined mail then it will fetch latest invocie of it.
            let updateAccountSubReq0 = {
              stripe_latest_invoice_id : stripe_latest_invoice_id,
              last_updated_by          : userId,
              last_updated_date        : getDateUTC()
            };

            await AccountSubscription.update({ account_subscription_id: account_subscription_id },updateAccountSubReq0).fetch();
            await addAppLog(userId, account_id, customer_id, 'Update - invoice pay in stripe ', JSON.stringify({'request': invoiceRequest}), JSON.stringify({'error': error}), 'error');
            await stripe.subscriptions.update(stripe_subscription_id,{coupon: old_stripe_coupon_id});
            return res.ok(undefined, error.message, RESPONSE_STATUS.error);
          }
          // Put log here
          if(status !== undefined && status !== null && status !== '' && status.toLowerCase() === 'inactive') {
            const stripe_invoice_id = subscriptionDetails.stripe_latest_invoice_id;
            try{
              await stripe.invoices.pay(stripe_invoice_id, invoiceRequest);
              await addAppLog(userId, account_id, customer_id, 'Update - invoice pay in stripe in inactive mode ', JSON.stringify({'request': invoiceRequest}), JSON.stringify({'error': ''}), 'success');
            } catch(e){
              const error = e;
              await addAppLog(userId, account_id, customer_id, 'Update - invoice pay in stripe in inactive mode ', JSON.stringify({'request': invoiceRequest}), JSON.stringify({'error': error}), 'error');
            }

            // Put log here
            try{
              await stripe.subscriptions.update(
                subscriptionDetails.stripe_subscription_id,
                {
                  pause_collection: '',
                }
              );
              await addAppLog(userId, account_id, customer_id, 'Update - unpause collection for subscription in stripe ', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': ''}), 'success');
            } catch(e){
              const error = e;
              await addAppLog(userId, account_id, customer_id, 'Update - unpause collection for subscription in stripe ', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': error}), 'error');
            }
          }

          const retrieveUpcoming = await stripe.invoices.retrieveUpcoming({ customer: customer_id});
          const total = retrieveUpcoming.total/100;
          const subtotal = retrieveUpcoming.subtotal/100;
          const period_end = getTimeStampToDate(retrieveUpcoming.period_end*1000,'YYYY-MM-DD');
          let updateAccountSubReq1 = {
            next_payment_date   : period_end,
            expiry_date         : period_end,
            subscription_id     : new_subscription_id,
            amount_total        : total,
            amount_subtotal     : subtotal,
            subscription_status : SUBSCRIPTION_STATUS.active,
            last_updated_by     : userId,
            paymentlinktoken    : '',
            last_updated_date   : getDateUTC()
          };

          let updateAccountReq = {
            status            : ACCOUNT_STATUS.active,
            last_updated_by   : userId,
            last_updated_date : getDateUTC()
          };

          // Put log here
          try{
            await AccountSubscription.update({ account_subscription_id: account_subscription_id },updateAccountSubReq1).fetch();
            const latestSubscriptionDetails = await stripe.subscriptions.retrieve(stripe_subscription_id);
            const items = latestSubscriptionDetails.items.data;

            let priceID = '';
            let pricewiseSid = items.map((it) => {
              priceID = it.price.id;
              const sID = it.id;
              return {
                priceId : priceID,
                sId     : sID
              };
            });

            const updatesubProducts =  await getUpdatedSubscriptionDetails(account_subscription_id);
            let prodArr = updatesubProducts.map((products_item) => {
              const index = pricewiseSid.findIndex((person) => {
                return person.priceId === products_item.stripe_price_id;
              });
              return {
                subscription_product_id : products_item.subscription_product_id,
                seats                   : products_item.seats,
                stripe_sid              : pricewiseSid[index].sId
              };
            });
            sails.log('prodArr----->',prodArr);
            await updateSubProAfterPayment(subscription_id, new_subscription_id, prodArr, account_subscription_id, userId);
            await Account.update({account_id: account_id }, updateAccountReq).fetch();
            await addAppLog(userId, account_id, customer_id, 'Update - update account subscription and account table in db', JSON.stringify({'request': updateAccountReq, 'request1': updateAccountSubReq1}), JSON.stringify({'error': ''}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, customer_id, 'Update - update account subscription and account table in db ', JSON.stringify({'request': updateAccountReq, 'request1': updateAccountSubReq1}), JSON.stringify({'error': error}), 'error');
          }

          let updateAccountSubHistoryReq = {
            account_subscription_id  : account_subscription_id,
            subscription_id          : new_subscription_id,
            stripe_subscription_id   : stripe_subscription_id,
            seats                    : seats,
            next_payment_date        : period_end,
            payment_start_date       : payment_start_date,
            stripe_product_id        : stripe_product_id,
            stripe_price_id          : stripe_price_id,
            stripe_payment_intent_id : payment_intent,
            stripe_payment_method_id : stripe_payment_method_id,
            stripe_latest_invoice_id : stripe_latest_invoice_id,
            billing_cycle            : billing_cycle,
            amount_total             : amounttotal,
            amount_subtotal          : amountsubtotal,
            payment_status           : PAYMENT_STATUS.success,
            expiry_date              : period_end,
            subscription_status      : SUBSCRIPTION_STATUS.active,
            created_date             : getDateUTC(),
            created_by               : userId
          };

          // Put log here
          try{
            await AccountSubscriptionHistory.create(updateAccountSubHistoryReq).fetch();
            await addAppLog(userId, account_id, customer_id, 'Update - create history for it ', JSON.stringify({'request': updateAccountSubHistoryReq}), JSON.stringify({'error': ''}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, customer_id, 'Update - create history for it ', JSON.stringify({'request': updateAccountSubHistoryReq}), JSON.stringify({'error': error}), 'error');
          }

          // put azure api logic here
          if(priceIdArray.length > 1 && api_quota !== 0) {
            sails.log('api_quota', api_quota);
            await createProductinAzure(req, priceIdArray, customer_name, account_id, api_quota);
            let sql = `
                SELECT
                    account.account_id,
                    account_configuration_detail.value,
                    account_configuration_detail.code
                  from account
                  INNER JOIN account_configuration ON account.account_id = account_configuration.account_id
                  INNER JOIN account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
                  WHERE account_configuration_detail.code = $1 and account.account_id = $2 ;`;

            const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,account_id]);
            const results = rawResult.rows[0] || null;

            let connectionString = results.value;
            if(connectionString){
              let rdi = sails.getDatastore('default');
              let mysql = rdi.driver.mysql;
              let tenantConnection = await  mysql.createConnection(connectionString);
              await tenantConnection.connect();
              let userSql = `select user_id FROM ${process.env.DB_NAME}.user WHERE email = '${process.env.EXPOSE_API_USER_EMAIL}'`;
              let userSqlresults = await sails.sendNativeQuery(userSql);
              let systemUserId = userSqlresults.rows[0] || null;
              if(systemUserId){
                await EmployeeProfile.create({
                  user_id            : systemUserId.user_id,
                  role_id            : 2,
                  date_of_joining    : getCurrentDate(),
                  points             : 0,
                  status             : ACCOUNT_STATUS.inactive,
                  level_id           : 1,
                  employee_import_Id : 0,
                  created_by         : userId,
                  last_updated_by    : userId,
                  created_date       : getDateUTC()
                }).fetch().usingConnection(tenantConnection);
              }

              if(tenantConnection){
                await tenantConnection.end();
              }
            }
          }
          const data = {
            account_id: subscriptionDetails.account_id
          };
          await updateAccountCache(account_id);
          return res.ok(data, messages.UPDATE_SUBSCRIPTION, RESPONSE_STATUS.success);
        }catch (error) {
          sails.log(error);
          return res.ok(undefined, error.message, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValidate.error, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG_UPDATE, RESPONSE_STATUS.error);
    }
  },

  addinstripe: async(req, res) =>{
    let request = req.allParams();
    const { payment_intent, customerId} = request;
    const isValidate = await SubscriptionValidation.addinstripe.validate(request);
    if (!isValidate.error) {
      try{
        let customer_id = customerId;
        let userId = await getUserId(req.user);

        if(customer_id !== ''){
          const subscriptionDetails = await getSubscriptionDetailsByStripeId(req, customer_id);
          const userexists = subscriptionDetails.user_exists;
          let customer_name = subscriptionDetails.customer_name;
          let subscription_id = subscriptionDetails.subscription_id;
          let account_subscription_id = subscriptionDetails.account_subscription_id;
          let payment_method = subscriptionDetails.stripe_payment_method_id;
          let free_trial = subscriptionDetails.free_trial;
          let trial_days = subscriptionDetails.free_trial_days;
          let price_id = subscriptionDetails.stripe_price_id;
          let priceIdArray = price_id.split(',');
          let stripe_coupon_id = subscriptionDetails.stripe_coupon_id;
          let seat = subscriptionDetails.seats;
          let seats = subscriptionDetails.seat;
          let seatArray = seats.split(',');
          let api_quota = subscriptionDetails.api_quota;
          let account_id = subscriptionDetails.account_id;
          let itemObject = priceIdArray.map((value, index) => ({'price': value, 'quantity': seatArray[index] }));
          let subscrptionRequest = {};
          let stripeSubscriptionItem = '';
          let stripeProductWiseSid = '';
          // If free subscription add
          if(free_trial.toLowerCase() === 'yes') {
            let stripe_subscription_id = '';
            let free_latest_invoice = '';
            let subscriptionStatus = '';
            let trial_end = '';
            let subscription = '';

            subscrptionRequest = {
              default_payment_method     : payment_method,
              customer                   : customer_id,
              trial_period_days          : trial_days,
              off_session                : 'true',
              enable_incomplete_payments : 'false',
              collection_method          : 'charge_automatically',
              // pass here that array of item ----
              items                      : itemObject
            };
            await subscriptionReq(subscrptionRequest, stripe_coupon_id);

            try{
              subscription = await stripe.subscriptions.create(subscrptionRequest);
              // Put log here
              stripe_subscription_id = subscription.id;
              free_latest_invoice = subscription.latest_invoice;
              subscriptionStatus = subscription.status;
              trial_end = await trialEnd(subscription);
              stripeSubscriptionItem = subscription.items.data;
              stripeProductWiseSid = stripeSubscriptionItem.map((value1) => ({'stripe_product_id': value1.price.product, 'stripe_sid': value1.id }));
              for (const value2 of stripeProductWiseSid) {
                await updateSid(account_subscription_id, subscription_id, value2.stripe_product_id, value2.stripe_sid);
              }
              await addAppLog(userId, account_id, customer_id, 'AddInStripe - Free trail subscription added in stripe', JSON.stringify({'request': subscrptionRequest}), JSON.stringify({'error': ''}), 'success');
            } catch(e){
              const error = e;
              await addAppLog(userId, account_id, customer_id, 'AddInStripe - Free trail subscription added in stripe', JSON.stringify({'request': subscrptionRequest}), JSON.stringify({'error': error}), 'error');
            }

            if(subscriptionStatus === 'trialing') {
              let trailAccountSubscriptionUpdateReq = {
                stripe_subscription_id   : stripe_subscription_id,
                stripe_latest_invoice_id : free_latest_invoice,
                payment_start_date       : trial_end,
                next_payment_date        : trial_end,
                expiry_date              : trial_end,
                payment_status           : PAYMENT_STATUS.success,
                subscription_status      : SUBSCRIPTION_STATUS.active,
                paymentlinktoken         : '',
                last_updated_date        : getDateUTC()
              };

              let trailAccountUpdateRequest = {
                status            : ACCOUNT_STATUS.active,
                last_updated_by   : userId,
                last_updated_date : getDateUTC()
              };

              // Put log here
              try{
                await AccountSubscription.update({ stripe_customer_id: customer_id },trailAccountSubscriptionUpdateReq).fetch();
                await Account.update({ account_id: account_id }, trailAccountUpdateRequest).fetch();
                await addAppLog(userId, account_id, customer_id, 'AddInStripe - Account and Account subscription update table in free trial mode', JSON.stringify({'request': trailAccountSubscriptionUpdateReq, 'request1': trailAccountUpdateRequest}), JSON.stringify({'error': ''}), 'success');
              } catch(e){
                const error = e;
                await addAppLog(userId, account_id, customer_id, 'AddInStripe - Account and Account subscription update table  in free trial mode', JSON.stringify({'request': trailAccountSubscriptionUpdateReq, 'request1': trailAccountUpdateRequest}), JSON.stringify({'error': error}), 'error');
              }
              await updateAccountCache(account_id);
            }


            // Put log here
            // check in history how to pass 2 product data ----
            await createSubscriptionHistory(req, customer_id, 'AddInStripe - Create history for free trail mode');

            const subscriptionData = {
              account_id           : account_id,
              subscription_id      : subscription.id,
              current_period_start : await currentPeriodStart(subscription),
              current_period_end   : await currentPeriodEnd(subscription),
              latest_invoice       : subscription.latest_invoice,
              status               : subscription.status,
            };
            createDynamicDB({ account_id: account_id });
            if(priceIdArray.length > 1 && api_quota !== 0) {
              await createProductinAzure(req, priceIdArray, customer_name, account_id, api_quota);
            }
            sendEmail(req, account_id, userexists);
            return res.ok(
              subscriptionData,
              messages.ADD_SUBSCRIPTION,
              RESPONSE_STATUS.success);
          } else {

            let latest_invoice = '';
            let stripeSubscriptionId = '';
            let current_period_start = '';
            let current_period_end = '';
            let subscription;
            subscrptionRequest = {
              default_payment_method : payment_method,
              customer               : customer_id,
              payment_behavior       : 'default_incomplete',
              items                  : itemObject
            };
            await subscriptionReq(subscrptionRequest, stripe_coupon_id);

            try{
              // update new payment method as default mathod for customer
              subscription = await stripe.subscriptions.create(subscrptionRequest);
              latest_invoice = subscription.latest_invoice;
              stripeSubscriptionId = subscription.id;
              current_period_start = await currentPeriodStart(subscription);
              current_period_end = await currentPeriodEnd(subscription);

              stripeSubscriptionItem = subscription.items.data;
              stripeProductWiseSid = stripeSubscriptionItem.map((value1) => ({'stripe_product_id': value1.price.product, 'stripe_sid': value1.id }));
              for (const value2 of stripeProductWiseSid) {
                await updateSid(account_subscription_id, subscription_id, value2.stripe_product_id, value2.stripe_sid);
              }
              await addAppLog(userId, account_id, customer_id, 'AddInStripe - Paid subscription create in stripe', JSON.stringify({'request': subscrptionRequest}), JSON.stringify({'error': ''}), 'success');
            } catch(e){
              const error = e;
              await addAppLog(userId, account_id, customer_id, 'AddInStripe - Paid subscription create in stripe', JSON.stringify({'request': subscrptionRequest}), JSON.stringify({'error': error}), 'error');
            }
            // Put log here

            let invoiceRequest = {};
            //invoiceRequest.paid_out_of_band = true;
            // Put log here
            try{
              // update new payment method as default mathod for customer
              await stripe.invoices.pay(latest_invoice, invoiceRequest);
              await addAppLog(userId, account_id, customer_id, 'AddInStripe - Paid Invoice in stripe', JSON.stringify({'request': invoiceRequest}), JSON.stringify({'error': ''}), 'success');
            } catch(e){
              const error = e;
              await addAppLog(userId, account_id, customer_id, 'AddInStripe - Paid Invoice in stripe', JSON.stringify({'request': invoiceRequest}), JSON.stringify({'error': error}), 'error');
            }

            const retriveSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            let subscription_Status = retriveSubscription.status;

            if(subscription_Status === 'active') {
              let paidAccountSubscriptionUpdateReq = {
                stripe_subscription_id   : stripeSubscriptionId,
                stripe_payment_intent_id : payment_intent,
                stripe_latest_invoice_id : latest_invoice,
                payment_start_date       : current_period_start,
                next_payment_date        : current_period_end,
                expiry_date              : current_period_end,
                payment_status           : PAYMENT_STATUS.success,
                subscription_status      : SUBSCRIPTION_STATUS.active,
                paymentlinktoken         : '',
                last_updated_date        : getDateUTC()
              };
              let paidAccountUpdateRequest = {
                status            : ACCOUNT_STATUS.active,
                last_updated_by   : userId,
                last_updated_date : getDateUTC()
              };

              // Put log here
              try{
                await AccountSubscription.update({ stripe_customer_id: customer_id }, paidAccountSubscriptionUpdateReq).fetch();
                await Account.update({ account_id: account_id }, paidAccountUpdateRequest).fetch();
                await addAppLog(userId, account_id, customer_id, 'AddInStripe - Account and Account subscription update table in paid mode', JSON.stringify({'request': paidAccountSubscriptionUpdateReq, 'request1': paidAccountUpdateRequest}), JSON.stringify({'error': ''}), 'success');
              } catch(e){
                const error = e;
                await addAppLog(userId, account_id, customer_id, 'AddInStripe - Account and Account subscription update table in paid mode', JSON.stringify({'request': paidAccountSubscriptionUpdateReq, 'request1': paidAccountUpdateRequest}), JSON.stringify({'error': error}), 'error');
              }

              await updateAccountCache(account_id);
            }
            const subscriptionData = {
              account_id           : account_id,
              subscription_id      : retriveSubscription.id,
              current_period_start : periodStart(retriveSubscription),
              current_period_end   : periodEnd(retriveSubscription),
              latest_invoice       : retriveSubscription.latest_invoice,
              status               : retriveSubscription.status,
            };

            await createSubscriptionHistory(req, customer_id, 'AddInStripe - Create history for paid mode');
            createDynamicDB({ account_id: account_id });
            if(priceIdArray.length > 1 && api_quota !== 0) {
              await createProductinAzure(req, priceIdArray, customer_name, account_id, api_quota);
            }
            sendEmail(req, account_id, userexists);
            return res.ok(
              subscriptionData,
              messages.ADD_SUBSCRIPTION,
              RESPONSE_STATUS.success);
          }
        }
      }catch (err) {
        sails.log.error(err);
        return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
        );
      }
    } else {
      res.ok(
        isValidate.error,
        messages.VALIDATION_FAILED,
        RESPONSE_STATUS.error
      );
    }
  },

  updateinstripe: async(req, res) =>{
    let request = req.allParams();
    const { stripe_subscription_id, subscription_id, products, free_trial, stripe_coupon_id, trial_end_date, free_trial_days, status, billing_cycle, address, country_id, state_id, city_id, zip, city_name, country_name, state_name, is_address_same_as_billing} = request;
    const isValidate = await SubscriptionValidation.updateinstripe.validate(request);
    if (!isValidate.error) {
      try{
        let updateRequest = {};
        let userId = await getUserId(req.user);

        const subscriptionDetails = await getSubscriptionDetailsByStripeId(req, stripe_subscription_id);
        const stripe_payment_method_id = subscriptionDetails.stripe_payment_method_id;
        const stripe_customer_id = subscriptionDetails.stripe_customer_id;
        const account_subscription_id = subscriptionDetails.account_subscription_id;
        const old_subscription_id = subscriptionDetails.subscription_id;
        const coupon_id = subscriptionDetails.stripe_coupon_id;
        const old_seats = subscriptionDetails.seats;
        let seats = products[0].seats;  // Get basic product seat count
        const account_id = subscriptionDetails.account_id;
        let seat = subscriptionDetails.seat;
        let seatArray = seat.split(',');
        sails.log(seatArray);
        const stripe_sid = subscriptionDetails.stripe_sid;
        let sidArray = (stripe_sid.indexOf(',') !== -1) ? stripe_sid.split(',') : [stripe_sid];
        let price_id = subscriptionDetails.stripe_price_id;
        let priceIdArray = (price_id.indexOf(',') !== -1) ? price_id.split(',') : [price_id];
        let prodArr = [];
        let api_quota = subscriptionDetails.api_quota;
        // -- prepare product array item array based on product come
        let decreaseSubscription = (products.length < priceIdArray.length) ? true : false;
        sails.log('decreaseSubscription',decreaseSubscription);
        if(old_subscription_id !== subscription_id){
          sails.log('come in change subscription id');
          // if subscription plan change with one product to two product plan
          if(decreaseSubscription === false) {
            prodArr = products.map((products_item, index) => {
              return (sidArray[index] !== undefined && sidArray[index] !== null && sidArray[index] !== '') ? { 'id': sidArray[index], price: products_item.stripe_price_id, quantity: products_item.seats } : { price: products_item.stripe_price_id, quantity: products_item.seats };
            });
          } else {
            const dind = seatArray.indexOf('1');
            const sind = (dind === 0) ? 1 : 0;
            let singleArr = products.map((products_item) => {
              return {
                id       : sidArray[sind],
                price    : products_item.stripe_price_id,
                quantity : products_item.seats };
            });

            let delArr = {
              deleted  : true,
              id       : sidArray[dind],
              quantity : 1
            };
            prodArr = singleArr.concat(delArr);
          }
        }else{
          sails.log('come in same subscription id');
          prodArr = products.map((products_item) => {
            const index = priceIdArray.indexOf(products_item.stripe_price_id);
            return {
              id       : sidArray[index],
              price    : products_item.stripe_price_id,
              quantity : products_item.seats
            };
          });
        }
        // update address code start
        let updateData = {
          is_address_same_as_billing : is_address_same_as_billing,
          last_updated_by            : userId,
          last_updated_date          : getDateUTC()
        };
        await Account.update({ account_id: account_id }, updateData).fetch();

        const customerDetails = await Account.findOne({ account_id: account_id });
        const customerName = customerDetails.name;
        const customerEmail = customerDetails.email;
        const customerPhone = customerDetails.phone;

        const accountBilling = await AccountBilling.findOne({ account_subscription_id: account_subscription_id });
        if(accountBilling) {
          let updateAddressRequest = {};
          if(address !== undefined && address !== null && address !== '') {
            updateAddressRequest.address = address;
          } else {
            updateAddressRequest.address = '';
          }
          if(country_id !== undefined && country_id !== null && country_id !== '') {
            updateAddressRequest.country_id = country_id;
          } else {
            updateAddressRequest.country_id = 0;
          }
          if(state_id !== undefined && state_id !== null && state_id !== '') {
            updateAddressRequest.state_id = state_id;
          } else {
            updateAddressRequest.state_id = 0;
          }
          if(city_id !== undefined && city_id !== null && city_id !== '') {
            updateAddressRequest.city_id = city_id;
          } else {
            updateAddressRequest.city_id = 0;
          }
          if(zip !== undefined && zip !== null && zip !== '') {
            updateAddressRequest.zip = zip;
          }
          updateAddressRequest.last_updated_by = userId;
          updateAddressRequest.last_updated_date = getDateUTC();
          await AccountBilling.update({ account_subscription_id: account_subscription_id },updateAddressRequest).fetch();
        } else {
          let insertRequest = {};
          if(address !== undefined && address !== null && address !== '') {
            insertRequest.address = address;
          } else {
            insertRequest.address = '';
          }
          if(country_id !== undefined && country_id !== null && country_id !== '') {
            insertRequest.country_id = country_id;
          } else {
            insertRequest.country_id = 0;
          }
          if(state_id !== undefined && state_id !== null && state_id !== '') {
            insertRequest.state_id = state_id;
          } else {
            insertRequest.state_id = 0;
          }
          if(city_id !== undefined && city_id !== null && city_id !== '') {
            insertRequest.city_id = city_id;
          } else {
            insertRequest.city_id = 0;
          }
          if(zip !== undefined && zip !== null && zip !== '') {
            insertRequest.zip = zip;
          } else {
            insertRequest.zip = 0;
          }
          insertRequest.account_subscription_id = account_subscription_id;
          insertRequest.account_id = account_id;
          insertRequest.created_by = userId;
          insertRequest.last_updated_by = null;
          insertRequest.created_date = getDateUTC();
          await AccountBilling.create(insertRequest).fetch();
        }

        let customerRequest = {};
        customerRequest.name = customerName;
        customerRequest.email = customerEmail;
        customerRequest.phone = customerPhone;
        let addressRequest = {};
        if(address !== undefined && address !== null && address !== '') {
          addressRequest.line1 = address;
        }

        if(zip !== undefined && zip !== null && zip !== '') {
          addressRequest.postal_code = zip;
        }

        if(city_name !== undefined && city_name !== null && city_name !== '') {
          addressRequest.city = city_name;
        }

        if(state_name !== undefined && state_name !== null && state_name !== '') {
          addressRequest.state = state_name;
        }

        if(country_name !== undefined && country_name !== null && country_name !== '') {
          addressRequest.country = country_name;
        }

        if(Object.keys(addressRequest).length > 0) {
          customerRequest.address = addressRequest;
        }

        try{
          await stripe.customers.update(stripe_customer_id, customerRequest);
          await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update customer address in stripe', JSON.stringify({'request': customerRequest}), JSON.stringify({'error': ''}), 'success');
        } catch(e){
          const error = e;
          await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update customer address in stripe', JSON.stringify({'request': customerRequest}), JSON.stringify({'error': error}), 'error');
        }


        if(stripe_coupon_id !== undefined && stripe_coupon_id !== null && stripe_coupon_id !== '' && coupon_id !== stripe_coupon_id) {
          // When coupon code is updated then first update coupon code in subscription and then update subscription with product item.
          await stripe.subscriptions.update(stripe_subscription_id,{coupon: stripe_coupon_id});
          // Put log here
          // try{
          //   await AccountSubscription.update({ account_subscription_id: account_subscription_id },{
          //     stripe_coupon_id: stripe_coupon_id,
          //   }).fetch();
          //   await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update coupon id in account subscription table in db', JSON.stringify({'request': {stripe_coupon_id: stripe_coupon_id,}}), JSON.stringify({'error': ''}), 'success');
          // } catch(e){
          //   const error = e;
          //   await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update coupon id in account subscription table in db', JSON.stringify({'request': {stripe_coupon_id: stripe_coupon_id,}}), JSON.stringify({'error': error}), 'error');
          // }
        }

        // when trial is free or switch subscription from two product to one product
        if(free_trial.toLowerCase() === 'yes' || decreaseSubscription === true) {
          let trial_end = datetoTimestamp(subscriptionDetails.next_payment_date);
          if(trial_end_date !== undefined && trial_end_date !== null && trial_end_date !== '') {
            trial_end = datetoTimestamp(trial_end_date);
          }
          updateRequest.items = prodArr;
          updateRequest.off_session = 'true';
          updateRequest.proration_behavior = 'create_prorations';
          updateRequest.default_tax_rates = '';
          updateRequest.collection_method = 'charge_automatically';
          updateRequest.billing_thresholds = '';
          updateRequest.enable_incomplete_payments = 'false';
          updateRequest.default_payment_method = stripe_payment_method_id;
          updateRequest.default_source = '';
          if(free_trial.toLowerCase() === 'yes') {
            updateRequest.trial_end = trial_end;
          }
        } else {
          // When coupon has changed from previous one then in case go to this condition
          // -- based on product add and remove added below condition other wise add create proration and automatically changred set
          updateRequest.items = prodArr;
          if((stripe_coupon_id !== undefined && stripe_coupon_id !== null && stripe_coupon_id !== '' && coupon_id !== stripe_coupon_id) || (old_seats <= seats)) {
            updateRequest.proration_behavior = 'always_invoice';
            updateRequest.payment_behavior = 'pending_if_incomplete';
          }
        }
        sails.log(updateRequest);
        if(status.toLowerCase() === 'inactive'){
          // Put log here
          try{
            await stripe.subscriptions.update(stripe_subscription_id,{pause_collection: '',});
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - remove pause collection from subcription in stripe', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': ''}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - remove pause collection from subcription in stripe', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': error}), 'error');
          }
        }

        // Put log here
        let updateSubscription = {};
        let stripeSubscriptionItem = '';
        let stripeProductWiseSid = '';
        try{
          updateSubscription = await stripe.subscriptions.update(stripe_subscription_id,updateRequest);
          await AccountUpdateSubscriptionProduct.destroy({ account_subscription_id: account_subscription_id }).fetch();
          await createUpdateAccountProduct(products, account_subscription_id, req.user.user_id);

          stripeSubscriptionItem = updateSubscription.items.data;
          stripeProductWiseSid = stripeSubscriptionItem.map((value1) => ({'stripe_product_id': value1.price.product, 'stripe_sid': value1.id }));
          for (const value2 of stripeProductWiseSid) {
            await accountUpdatesubscriptionSid(account_subscription_id, subscription_id, value2.stripe_product_id, value2.stripe_sid);
          }
          await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update subscription in stripe ', JSON.stringify({'request': updateRequest}), JSON.stringify({'error': ''}), 'success');
        } catch(e){
          const error = e;
          await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update subscription in stripe', JSON.stringify({'request': updateRequest}), JSON.stringify({'error': error}), 'error');
        }


        if(status.toLowerCase() === 'inactive'){
          // Put log here
          try{
            await stripe.subscriptions.update(stripe_subscription_id,{pause_collection: {behavior: 'void',},});
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - add pause collection for subscription in stripe', JSON.stringify({'request': {pause_collection: {behavior: 'void',},}}), JSON.stringify({'error': ''}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - add pause collection for subscription in stripe', JSON.stringify({'request': {pause_collection: {behavior: 'void',},}}), JSON.stringify({'error': error}), 'error');
          }
        }


        // When period is in free trial mode or When seats is decrease then doesn't require payment
        // In above cases account subscription and account subscription history table will updated.
        if(free_trial.toLowerCase() === 'yes' || (old_seats > seats && old_subscription_id === subscription_id)) {
        //if(free_trial.toLowerCase() === 'yes') {
          const retrieveUpcoming = await stripe.invoices.retrieveUpcoming({ customer: stripe_customer_id});
          const total = retrieveUpcoming.total/100;
          const subtotal = retrieveUpcoming.subtotal/100;
          const next_payment_date = getTimeStampToDate(retrieveUpcoming.period_end*1000,'YYYY-MM-DD');

          let updateAccountSubReq = {
            seats              : seats,
            subscription_id    : subscription_id,
            free_trial_days    : free_trial_days,
            payment_start_date : next_payment_date,
            next_payment_date  : next_payment_date,
            expiry_date        : next_payment_date,
            stripe_coupon_id   : stripe_coupon_id,
            amount_total       : total,
            amount_subtotal    : subtotal,
            last_updated_by    : userId,
            last_updated_date  : getDateUTC()
          };

          // Put log here
          let freeTrialUpdateSubscriptionHisReq = {
            account_subscription_id  : account_subscription_id,
            subscription_id          : subscription_id,
            stripe_subscription_id   : stripe_subscription_id,
            seats                    : seats,
            next_payment_date        : next_payment_date,
            payment_start_date       : subscriptionDetails.payment_start_date,
            stripe_latest_invoice_id : updateSubscription.latest_invoice,
            billing_cycle            : billing_cycle,
            amount_total             : total,
            amount_subtotal          : subtotal,
            expiry_date              : next_payment_date,
            payment_status           : 'Success',
            subscription_status      : SUBSCRIPTION_STATUS.active,
            created_date             : getDateUTC(),
            created_by               : userId
          };

          // Put log here
          try{
            await AccountSubscription.update({ account_subscription_id: account_subscription_id },updateAccountSubReq).fetch();
            const latestSubscriptionDetails = await stripe.subscriptions.retrieve(stripe_subscription_id);
            const items = latestSubscriptionDetails.items.data;
            let priceID = '';
            let pricewiseSidArr1 = items.map((it) => {
              priceID = it.price.id;
              const sID = it.id;
              return {
                priceId : priceID,
                sId     : sID
              };
            });
            sails.log('inside -----> ',pricewiseSidArr1);
            // If subscription change then update product accordingly
            const updatesubProducts =  await getUpdatedSubscriptionDetails(account_subscription_id);
            let prodArr = updatesubProducts.map((products_item) => {
              const index = pricewiseSidArr1.findIndex((person) => {
                return person.priceId === products_item.stripe_price_id;
              });
              return {
                subscription_product_id : products_item.subscription_product_id,
                seats                   : products_item.seats,
                stripe_sid              : pricewiseSidArr1[index].sId
              };
            });
            sails.log('prodArr in free trial----->',prodArr);
            await updateSubProAfterPayment(old_subscription_id, subscription_id, prodArr, account_subscription_id, userId);
            await AccountSubscriptionHistory.create(freeTrialUpdateSubscriptionHisReq).fetch();
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update account subscription and create history in table for free trail', JSON.stringify({'request': updateAccountSubReq, 'request1': freeTrialUpdateSubscriptionHisReq}), JSON.stringify({'error': ''}), 'success');

            // put azure api logic here
            let updatedQuota = await getMaxApiQuotaValue(subscription_id);
            sails.log('outside -----> ',pricewiseSidArr1);
            if(pricewiseSidArr1.length > 1 && updatedQuota.api_quota !== 0) {
              await createProductinAzure(req, priceIdArray, customerName, account_id, api_quota);
            }
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - update account subscription and create history in table for free trail', JSON.stringify({'request': updateAccountSubReq, 'request1': freeTrialUpdateSubscriptionHisReq}), JSON.stringify({'error': error}), 'error');
          }
        }

        const latestInvoice = updateSubscription.latest_invoice;
        const retriveInvoiceData = await stripe.invoices.retrieve(latestInvoice);
        const currency = retriveInvoiceData.currency;

        // If amount is 0 then update account and account subscriptions table as well.
        let latest_amont_total = (retriveInvoiceData.total)/100;
        if(latest_amont_total <= 0 || decreaseSubscription === true) {
          let updateAccountSubReq1 = {
            seats,
            subscription_id     : subscription_id,
            next_payment_date   : updateSubscription.current_period_end ? getTimeStampToDate(updateSubscription.current_period_end*1000,'YYYY-MM-DD') : '',
            expiry_date         : updateSubscription.current_period_end ? getTimeStampToDate(updateSubscription.current_period_end*1000,'YYYY-MM-DD') : '',
            stripe_coupon_id    : stripe_coupon_id,
            amount_total        : (retriveInvoiceData.total)/100,
            amount_subtotal     : (retriveInvoiceData.subtotal)/100,
            subscription_status : SUBSCRIPTION_STATUS.active,
            last_updated_by     : userId,
            paymentlinktoken    : '',
            last_updated_date   : getDateUTC()
          };

          let updateAccountReq = {
            status            : ACCOUNT_STATUS.active,
            last_updated_by   : userId,
            last_updated_date : getDateUTC()
          };

          // Put log here
          try{
            await AccountSubscription.update({ account_subscription_id: account_subscription_id },updateAccountSubReq1).fetch();
            // If subscription change then update product accordingly
            const latestSubscriptionDetails = await stripe.subscriptions.retrieve(stripe_subscription_id);
            sails.log('latestSubscriptionDetails----> amount is less than or equal to ', latestSubscriptionDetails);
            const items = latestSubscriptionDetails.items.data;
            let priceID = '';
            let pricewiseSid2 = items.map((it) => {
              priceID = it.price.id;
              const sID = it.id;
              return {
                priceId : priceID,
                sId     : sID
              };
            });
            sails.log('pricewiseSid--->',pricewiseSid2);
            // If subscription change then update product accordingly
            const updatesubProducts =  await getUpdatedSubscriptionDetails(account_subscription_id);
            let prodArr = updatesubProducts.map((products_item) => {
              const index = pricewiseSid2.findIndex((person) => {
                return person.priceId === products_item.stripe_price_id;
              });
              return {
                subscription_product_id : products_item.subscription_product_id,
                seats                   : products_item.seats,
                stripe_sid              : pricewiseSid2[index].sId
              };
            });
            sails.log('prodArr----->',prodArr);
            await updateSubProAfterPayment(old_subscription_id, subscription_id, prodArr, account_subscription_id, userId);
            await Account.update({account_id: account_id }, updateAccountReq).fetch();
            await addAppLog(userId, account_id, stripe_customer_id, 'Updateinstripe - update account subscription and account table in db case of amount is 0', JSON.stringify({'request': updateAccountReq, 'request1': updateAccountSubReq1}), JSON.stringify({'error': ''}), 'success');

            // put azure api logic here
            let updatedQuota = await getMaxApiQuotaValue(subscription_id);
            if(pricewiseSid2.length > 1 && updatedQuota.api_quota !== 0) {
              sails.log('come in minus amount');
              await createProductinAzure(req, priceIdArray, customerName, account_id, api_quota);
            }
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'Updateinstripe - update account subscription and account table in db case of amount is 0', JSON.stringify({'request': updateAccountReq, 'request1': updateAccountSubReq1}), JSON.stringify({'error': error}), 'error');
          }
        }

        const AccountUpdateSubscriptionDetails = await AccountUpdateSubscription.findOne({ account_subscription_id: account_subscription_id, stripe_subscription_id: stripe_subscription_id  });
        let accountUpdateSubReq = {
          account_subscription_id  : account_subscription_id,
          subscription_id          : subscription_id,
          stripe_subscription_id   : stripe_subscription_id,
          billing_cycle            : billing_cycle,
          currency                 : currency,
          stripe_latest_invoice_id : latestInvoice,
          stripe_coupon_id         : stripe_coupon_id,
          amount_due               : (retriveInvoiceData.amount_due)/100,
          amount_subtotal          : (retriveInvoiceData.subtotal)/100,
          amount_total             : (retriveInvoiceData.total)/100,
          created                  : retriveInvoiceData.created ? getTimeStampToDate( retriveInvoiceData.created*1000,'YYYY-MM-DD') : '',
          payment_start_date       : retriveInvoiceData.period_start ? getTimeStampToDate( retriveInvoiceData.period_start*1000,'YYYY-MM-DD') : '',
          next_payment_date        : retriveInvoiceData.period_end ? getTimeStampToDate( retriveInvoiceData.period_end*1000,'YYYY-MM-DD') : ''
        };
        if(AccountUpdateSubscriptionDetails) {
          const account_update_subscription_id = AccountUpdateSubscriptionDetails.account_update_subscription_id;
          try{
            await AccountUpdateSubscription.update({ account_update_subscription_id: account_update_subscription_id },accountUpdateSubReq).fetch();
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - account update subscription table update in db', JSON.stringify({'request': accountUpdateSubReq}), JSON.stringify({'error': ''}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - account update subscription table update in db', JSON.stringify({'request': accountUpdateSubReq}), JSON.stringify({'error': error}), 'error');
          }

          const data = {
            'account_update_subscription_id' : account_update_subscription_id,
            'total_payment'                  : latest_amont_total
          };
          return res.ok(
            data,
            messages.STRIPE_UPDATE_SUBSCRIPTION,
            RESPONSE_STATUS.success);
        } else {
          accountUpdateSubReq.created_date = getDateUTC();
          accountUpdateSubReq.created_by   = userId;

          let AccountUpdateSubscriptionDetail = {};
          // Put log here
          try{
            AccountUpdateSubscriptionDetail = await AccountUpdateSubscription.create(accountUpdateSubReq).fetch();
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - account update subscription table create in db', JSON.stringify({'request': accountUpdateSubReq}), JSON.stringify({'error': ''}), 'success');
          } catch(e){
            const error = e;
            await addAppLog(userId, account_id, stripe_customer_id, 'UpdateInStripe - account update subscription table create in db', JSON.stringify({'request': accountUpdateSubReq}), JSON.stringify({'error': error}), 'error');
          }

          const account_update_subscription_id = AccountUpdateSubscriptionDetail.account_update_subscription_id;
          const data = {
            'account_update_subscription_id' : account_update_subscription_id,
            'total_payment'                  : latest_amont_total
          };
          return res.ok(
            data,
            messages.STRIPE_UPDATE_SUBSCRIPTION,
            RESPONSE_STATUS.success);
        }
      }catch (err) {
        sails.log.error(err);
        return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
        );
      }
    } else {
      sails.log(isValidate.error);
      res.ok(
        undefined,
        messages.SUBSCRIPTION_EDIT_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  updatebillingdetails: async(req, res) =>{
    let request = req.allParams();
    const { account_id, account_subscription_id, address, country_id, state_id, city_id, zip, city_name, country_name, state_name, is_address_same_as_billing} = request;
    try {
      let userId = await getUserId(req.user);

      let updateData = {
        is_address_same_as_billing,
        last_updated_by   : userId,
        last_updated_date : getDateUTC()
      };
      await Account.update({ account_id: account_id }, updateData).fetch();

      const customerDetail = await sails.models.account.findOne({account_id: account_id});
      const customerName = customerDetail.name;
      const customerEmail = customerDetail.email;
      const customerPhone = customerDetail.phone;
      const stripe_customer_id = customerDetail.stripe_customer_id;

      const accountBilling = await AccountBilling.findOne({ account_id: account_id });
      if(accountBilling){
        let updateRequest = {};
        if (account_subscription_id !== undefined && account_subscription_id !== null && account_subscription_id !== ''){
          updateRequest.account_subscription_id = account_subscription_id;
        }
        if(address !== undefined && address !== null && address !== '') {
          updateRequest.address = address;
        } else {
          updateRequest.address = '';
        }
        if(country_id !== undefined && country_id !== null && country_id !== '') {
          updateRequest.country_id = country_id;
        } else {
          updateRequest.country_id = 0;
        }
        if(state_id !== undefined && state_id !== null && state_id !== '') {
          updateRequest.state_id = state_id;
        } else {
          updateRequest.state_id = 0;
        }
        if(city_id !== undefined && city_id !== null && city_id !== '') {
          updateRequest.city_id = city_id;
        } else {
          updateRequest.city_id = 0;
        }
        if(zip !== undefined && zip !== null && zip !== '') {
          updateRequest.zip = zip;
        }
        updateRequest.last_updated_by = userId;
        updateRequest.last_updated_date = getDateUTC();
        await AccountBilling.update({ account_id: account_id },updateRequest).fetch();
      } else {
        let insertRequest = {};
        if(address !== undefined && address !== null && address !== '') {
          insertRequest.address = address;
        } else {
          insertRequest.address = '';
        }
        if(country_id !== undefined && country_id !== null && country_id !== '') {
          insertRequest.country_id = country_id;
        } else {
          insertRequest.country_id = 0;
        }
        if(state_id !== undefined && state_id !== null && state_id !== '') {
          insertRequest.state_id = state_id;
        } else {
          insertRequest.state_id = 0;
        }
        if(city_id !== undefined && city_id !== null && city_id !== '') {
          insertRequest.city_id = city_id;
        } else {
          insertRequest.city_id = 0;
        }
        if(zip !== undefined && zip !== null && zip !== '') {
          insertRequest.zip = zip;
        } else {
          insertRequest.zip = 0;
        }
        if (account_subscription_id !== undefined && account_subscription_id !== null && account_subscription_id !== ''){
          insertRequest.account_subscription_id = account_subscription_id;
        }
        insertRequest.account_id = account_id;
        insertRequest.created_by = userId;
        insertRequest.last_updated_by = null;
        insertRequest.created_date = getDateUTC();
        await AccountBilling.create(insertRequest).fetch();
      }

      let customerRequest = {};
      customerRequest.name = customerName;
      customerRequest.email = customerEmail;
      customerRequest.phone = customerPhone;
      let addressRequest = {};
      if(address !== undefined && address !== null && address !== '') {
        addressRequest.line1 = address;
      }

      if(zip !== undefined && zip !== null && zip !== '') {
        addressRequest.postal_code = zip;
      }

      if(city_name !== undefined && city_name !== null && city_name !== '') {
        addressRequest.city = city_name;
      }

      if(state_name !== undefined && state_name !== null && state_name !== '') {
        addressRequest.state = state_name;
      }

      if(country_name !== undefined && country_name !== null && country_name !== '') {
        addressRequest.country = country_name;
      }

      if(Object.keys(addressRequest).length > 0) {
        customerRequest.address = addressRequest;
      }

      try{
        await stripe.customers.update(stripe_customer_id, customerRequest);
      } catch(e){
        const error = e;
        await addAppLog(userId, account_id, stripe_customer_id, 'customer address update error in stripe', JSON.stringify({'request': customerRequest}), JSON.stringify({'error': error}), 'error');
      }


      return res.ok(
            undefined,
            messages.UPDATE_BILLING_DETAILS,
            RESPONSE_STATUS.success);
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
      );
    }
  },

  list: async(_req, res) =>{
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
      if (products) {
        for (const data of productData) {
          productArr.push({
            id       : data.id,
            name     : data.name,
            price_id : priceWiseProducts[data.id],
            interval : internalWiseProducts[data.id],
            currency : currencyWiseProducts[data.id]
          });
        }
      }
      return res.ok(
        productArr,
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

  graduatedprice: async(req, res) =>{
    try{
      const price_id = req.params.price_id;
      await stripe.products.list({active: true});
      const price = await stripe.prices.retrieve(
        price_id,
        {
          'expand': ['tiers'],
        },
      );

      const tiersData = price.tiers;
      return res.ok(
        tiersData,
        messages.SUBSCRIPTION_PRICE_GET_SUCCESSFULL,
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

  find: async(req, res) =>{
    try {
      let request = req.allParams();
      const method = request.method;
      const status = request.status;
      const paymentlinktoken = request.paymentlinktoken;
      const account_subscription_id = request.subscription_id;
      const subDetails = await getSubscriptionDetails(req,account_subscription_id);
      const subscription_id = subDetails.subscription_id;
      let subscriptionMaster = await Subscription.findOne({ subscription_id });
      const accountDetails = await Account.findOne({ account_id: subDetails.account_id });
      if(paymentlinktoken !== undefined && paymentlinktoken !== 'undefined' && paymentlinktoken !== null && paymentlinktoken !== ''){
        if(paymentlinktoken === subDetails.paymentlinktoken){
          if(method !== undefined && method !== null && method !== '' && method === 'update') {
            const results = await getSubscriptionDetailsfromTemp(req, account_subscription_id);
            if((status !== undefined && status !== null && status !== '') && (status.toLowerCase() === 'inactive' || status.toLowerCase() === 'payment_declined')){
              let tempTotal = results.amount_total;
              let tempAmountSubtotal = results.amount_subtotal;
              const latest_invoice = subDetails.stripe_latest_invoice_id;
              const retriveInvoiceData = await stripe.invoices.retrieve(latest_invoice);
              let amountTotal = retriveInvoiceData.amount_due/100;
              let amountSubtotal = retriveInvoiceData.subtotal/100;
              results.amount_total = (status.toLowerCase() === 'inactive') ? tempTotal+amountTotal : amountTotal;
              results.amount_subtotal = (status.toLowerCase() === 'inactive') ?  tempAmountSubtotal+amountSubtotal : amountSubtotal;
              results.next_payment_date = retriveInvoiceData.period_end ? getTimeStampToDate( retriveInvoiceData.period_end*1000,'YYYY-MM-DD') : '';
            }
            results.stripe_customer_id = subDetails.stripe_customer_id;
            results.customer_name = accountDetails.name;
            results.subscription_name = subscriptionMaster.name;
            if(results)
            {
              const stripe_subscription_id = results.stripe_subscription_id;
              const subscriptionDetails = await getSubscriptionDetailsByStripeId(req, stripe_subscription_id);
              results.account_id = subscriptionDetails.account_id;
              return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);
            } else {
              return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
            }
          }
          else{
            if(subDetails)
            {
              if((status !== undefined && status !== null && status !== '') && (status.toLowerCase() === 'inactive' || status.toLowerCase() === 'payment_declined')){
                if(status.toLowerCase() === 'inactive') {
                  const latest_invoice = subDetails.stripe_latest_invoice_id;
                  const retriveInvoiceData = await stripe.invoices.retrieve(latest_invoice);
                  if(retriveInvoiceData.status === 'draft' || retriveInvoiceData.status === 'open' || retriveInvoiceData.status === 'uncollectible') {
                    subDetails.amount_total = retriveInvoiceData.amount_due/100;
                    subDetails.amount_subtotal = retriveInvoiceData.subtotal/100;
                    subDetails.next_payment_date = retriveInvoiceData.period_end ? getTimeStampToDate( retriveInvoiceData.period_end*1000,'YYYY-MM-DD') : '';
                  } else {
                    return res.ok(undefined, messages.INVOICE_IS_PAID, RESPONSE_STATUS.error);
                  }
                } else {
                  const results = await getSubscriptionDetailsfromTemp(req, account_subscription_id);
                  const retriveTempInvoiceData = await stripe.invoices.retrieve(results.stripe_latest_invoice_id);
                  const invoiceStatus = retriveTempInvoiceData.status;
                  if(invoiceStatus === 'draft' || invoiceStatus === 'open' || invoiceStatus === 'uncollectible') {
                    subDetails.seats = results.seats;
                    subDetails.amount_total = results.amount_total;
                    subDetails.amount_subtotal = results.amount_subtotal;
                    subDetails.next_payment_date = results.next_payment_date ? results.next_payment_date : '';
                  } else {
                    return res.ok(undefined, messages.INVOICE_IS_PAID, RESPONSE_STATUS.error);
                  }
                }

              }
              subDetails.customer_name = accountDetails.name;
              subDetails.subscription_name = subscriptionMaster.name;
              return res.ok(subDetails, messages.GET_RECORD, RESPONSE_STATUS.success);
            } else {
              return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
            }
          }
        }
        else{
          if(accountDetails.status === ACCOUNT_STATUS.payment_pending){
            return res.ok(undefined, messages.PAYMENT_LINK_EXPIRED, RESPONSE_STATUS.error);
          }else{
            return res.ok(undefined, messages.PAYMENT_LINK_USED, RESPONSE_STATUS.error);
          }

        }
      }else{
        if(method !== undefined && method !== null && method !== '' && method === 'update') {
          const results = await getSubscriptionDetailsfromTemp(req, account_subscription_id);
          if(results)
          {
            const stripe_subscription_id = results.stripe_subscription_id;
            const subscriptionDetails = await getSubscriptionDetailsByStripeId(req, stripe_subscription_id);
            results.account_id = subscriptionDetails.account_id;
            results.stripe_customer_id = subscriptionDetails.stripe_customer_id;
            results.customer_name = accountDetails.name;
            if(status !== undefined && status !== null && status !== '' && status.toLowerCase() === 'inactive') {
              let tempTotal = results.amount_total;
              let tempAmountSubtotal = results.amount_subtotal;
              const latest_invoice = subDetails.stripe_latest_invoice_id;
              const retriveInvoiceData = await stripe.invoices.retrieve(latest_invoice);
              let amountTotal = retriveInvoiceData.amount_due/100;
              let amountSubtotal = retriveInvoiceData.subtotal/100;
              results.amount_total = tempTotal+amountTotal;
              results.amount_subtotal = tempAmountSubtotal+amountSubtotal;
            }
            return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);
          } else {
            return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
          }
        }
        else{
          if(subDetails)
          {
            if((status !== undefined && status !== null && status !== '') && (status.toLowerCase() === 'inactive' || status.toLowerCase() === 'payment_declined')){
              const latest_invoice = subDetails.stripe_latest_invoice_id;
              const retriveInvoiceData = await stripe.invoices.retrieve(latest_invoice);
              subDetails.amount_total = retriveInvoiceData.amount_due/100;
              subDetails.amount_subtotal = retriveInvoiceData.subtotal/100;
              subDetails.next_payment_date = retriveInvoiceData.period_end ? getTimeStampToDate( retriveInvoiceData.period_end*1000,'YYYY-MM-DD') : '';
            }
            subDetails.customer_name = accountDetails.name;
            subDetails.subscription_name = subscriptionMaster.name;
            return res.ok(subDetails, messages.GET_RECORD, RESPONSE_STATUS.success);
          } else {
            return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
          }
        }
      }

    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },

  findcustomersubscription: async(req, res) =>{
    try {
      const account_id = req.params.id;
      const results = await getCustomerSubscriptionDetails(req, account_id);
      results.active_user_count = null;
      results.remaining_user_count = null;

      let stripe_product_id = results.stripe_product_id;
      let stripeProductIdArray = (stripe_product_id.indexOf(',') !== -1) ? stripe_product_id.split(',') : [stripe_product_id];
      let price_id = results.stripe_price_id;
      let priceIdArray = price_id.split(',');
      let stripe_product_name = results.stripe_product_name;
      let stripeProductNameArray = (stripe_product_name.indexOf(',') !== -1) ? stripe_product_name.split(',') : [stripe_product_name];
      let seats = results.seat;
      let seatArray = (seats.indexOf(',') !== -1) ? seats.split(',') : [seats];
      let stripe_sid = results.stripe_sid;
      let stripeSidArray = (stripe_sid !== '' || stripe_sid !== null) ? stripe_sid.split(',') : [1,1];
      let subscription_product_id = results.subscription_product_id;
      let subscriptionProductIdArray = (subscription_product_id.indexOf(',') !== -1) ? subscription_product_id.split(',') : [subscription_product_id];
      let account_subscription_product_id = results.account_subscription_product_id;
      let accountSubscriptionProductIdArray = (account_subscription_product_id.indexOf(',') !== -1) ? account_subscription_product_id.split(',') : [account_subscription_product_id];

      let productObject = priceIdArray.map((value, index) => (
        {
          'stripe_price_id'                 : value,
          'stripe_product_id'               : stripeProductIdArray[index],
          'stripe_product_name'             : stripeProductNameArray[index],
          'stripe_sid'                      : stripeSidArray[index],
          'subscription_product_id'         : subscriptionProductIdArray[index],
          'account_subscription_product_id' : accountSubscriptionProductIdArray[index],
          'seats'                           : seatArray[index]
        }
      ));
      results.products = productObject;
      let connection = await tenantConnection(account_id);
      if(connection.connection !== null && connection.connection !== '') {
        let sql = `SELECT COUNT(au.account_user_id) AS active_user_count 
          FROM ${process.env.DB_NAME}.account_user AS au
          LEFT JOIN employee_profile AS ep ON ep.user_id = au.user_id
          WHERE au.account_id = '${account_id}' AND ep.status='${ACCOUNT_STATUS.active}'`;
        const rawResult = await sails.sendNativeQuery(sql).usingConnection(connection.connection);
        let result = rawResult.rows[0] || null;
        results.active_user_count = result.active_user_count;
        results.remaining_user_count = results.seats - result.active_user_count;
      }

      if(results)
      {
        return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },

  paymentintentinstripe: async(req, res) =>{
    try {
      let request = req.allParams();
      const method = request.method;
      const account_subscription_id = request.account_subscription_id;
      let subscriptionDetails;
      let account_id;
      let customer;
      if(method !== undefined && method !== null && method !== '' && method === 'update') {
        subscriptionDetails = await getSubscriptionDetailsfromTemp(req, account_subscription_id);
        let subId = subscriptionDetails.account_subscription_id;
        const subDetails =  await getSubscriptionDetails(req, subId);
        account_id = subDetails.account_id;
        customer = subDetails.stripe_customer_id;
      }
      else{
        subscriptionDetails = await getSubscriptionDetails(req, account_subscription_id);
        account_id = subscriptionDetails.account_id;
        customer = subscriptionDetails.stripe_customer_id;
      }
      let amount = parseInt((subscriptionDetails.amount_total*100).toFixed(2));
      let currency = subscriptionDetails.currency;
      const accountBilling = await AccountBilling.findOne({ account_subscription_id: account_subscription_id });
      let address = accountBilling.address;
      if(address === null || address === ''){

        address = '12, street';

      }
      let country_id = accountBilling.country_id;
      let country_name = 'US';
      if(country_id !== null && country_id !== 0){
        const country = await Country.findOne({ country_id: country_id });
        country_name = country.name;
      }

      let state_id = accountBilling.state_id;
      let state_name = 'CA';
      if(state_id !== null && state_id !== 0) {
        const state = await State.findOne({ state_id: state_id });
        state_name = state.name;
      }

      let city_id = accountBilling.city_id;
      let city_name = 'Irivine';
      if(city_id !== null && city_id !== 0) {
        const city = await City.findOne({ city_id: city_id });
        city_name = city.name;
      }

      let zip = (accountBilling.zip !== null) ? accountBilling.zip : '48322';

      const account = await Account.findOne({ account_id: account_id });
      let name = account.name;

      let description = '';
      description=  (method !== undefined && method !== null && method !== '' && method === 'update') ? 'Update' : 'Add';
      const paymentIntent = await stripe.paymentIntents.create({
        amount             : amount,
        currency           : currency,
        setup_future_usage : 'off_session',
        customer           : customer,
        shipping           : {
          name    : name,
          address : {
            line1       : address,
            postal_code : zip,
            city        : city_name,
            state       : state_name,
            country     : country_name,
          },
        },
        description               : `${description} Subscription Payment Initiated`,
        automatic_payment_methods : {
          enabled: true,
        },
      });

      const data = {
        payment_intent : paymentIntent.id,
        client_secret  : paymentIntent.client_secret
      };

      return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },


  findinstripe: async(req, res) =>{
    try{
      const subscriptionId = req.params.id;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const subscriptionData = {
        sId                                 : subscription.items.data[0].id,
        subscription_created                : subscription.created ? getTimeStampToDate(subscription.created*1000,'YYYY-MM-DD') : '',
        subscription_current_period_start   : subscription.current_period_start ? getTimeStampToDate(subscription.current_period_start*1000,'YYYY-MM-DD') : '',
        subscription_current_period_end     : subscription.current_period_end ? getTimeStampToDate(subscription.current_period_end*1000,'YYYY-MM-DD') : '',
        subscription_default_payment_method : subscription.default_payment_method,
        subscription_coupon                 : (subscription.discount !== null) ? subscription.discount.coupon.id : '',
        subscription_days_until_due         : subscription.days_until_due,
        subscription_latest_invoice         : subscription.latest_invoice,
        subscription_product                : subscription.plan.product,
        subscription_price                  : subscription.plan.id,
        subscription_interval               : subscription.plan.interval,
        subscription_currency               : subscription.plan.currency,
        subscription_trial_period_days      : subscription.plan.trial_period_days,
        subscription_quantity               : subscription.quantity
      };

      return res.ok(
        subscriptionData,
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

  cancel: async(req, res) =>{
    try{
      const account_id = req.params.id;
      const results = await getCustomerSubscriptionDetails(req, account_id);
      const subscriptionId = results.stripe_subscription_id;
      const stripe_customer_id = results.stripe_customer_id;
      let userId = await getUserId(req.user);

      let deleted = {};
      try{
        deleted = await stripe.subscriptions.update(subscriptionId, {cancel_at_period_end: true});
        await addAppLog(userId, account_id, stripe_customer_id, 'Cancel - cancel subscription at the time of period end ', JSON.stringify({'request': {cancel_at_period_end: true}}), JSON.stringify({'error': ''}), 'success');
      } catch(e){
        const error = e;
        await addAppLog(userId, account_id, stripe_customer_id, 'Cancel - cancel subscription at the time of period end  ', JSON.stringify({'request': {cancel_at_period_end: true}}), JSON.stringify({'error': error}), 'error');
      }

      let accountAccountSubscriptionUpdateReq = {
        subscription_status : SUBSCRIPTION_STATUS.canceled,
        last_updated_by     : req.user.user_id,
        last_updated_date   : getDateUTC()
      };


      let accountUpdateReq = {
        status            : ACCOUNT_STATUS.cancelled_requested,
        last_updated_by   : req.user.user_id,
        last_updated_date : getDateUTC()
      };

      try{
        await AccountSubscription.update({ stripe_customer_id: stripe_customer_id },accountAccountSubscriptionUpdateReq).fetch();
        await Account.update({ account_id: account_id },accountUpdateReq).fetch();
        await addAppLog(userId, account_id, stripe_customer_id, 'Cancel - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': ''}), 'success');
      } catch(e){
        const error = e;
        await addAppLog(userId, account_id, stripe_customer_id, 'Cancel - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': error}), 'error');
      }

      await updateAccountCache(account_id);
      await createSubscriptionHistory(req, stripe_customer_id, 'Cancel - cancel the subscription');
      //}
      const expirydate = getDate(results.expiry_date,'YYYY-MM-DD');
      const currentdate = getCurrentDate();
      let accountexpire = '';
      if(expirydate > currentdate){
        accountexpire ='No';
      }else{
        accountexpire ='Yes';
      }
      const cancelData = {
        latest_invoice  : deleted.latest_invoice,
        status          : SUBSCRIPTION_STATUS.canceled,
        account_expired : accountexpire
      };

      return res.ok(
        cancelData,
        messages.SUBSCRIPTION_CANCELLED_SUCCESSFULLY,
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

  inactive: async(req, res) =>{
    try{
      const account_id = req.params.id;
      const results = await getCustomerSubscriptionDetails(req, account_id);
      const subscriptionId = results.stripe_subscription_id;
      const stripe_customer_id = results.stripe_customer_id;
      let userId = await getUserId(req.user);
      let deleted = {};
      try{
        deleted = await stripe.subscriptions.update(
          subscriptionId,
          {
            pause_collection: {
              behavior: 'keep_as_draft',
            },
          }
        );
        await addAppLog(userId, account_id, stripe_customer_id, 'Inactive - pause subscription', JSON.stringify({'request': {pause_collection: {behavior: 'keep_as_draft'}}}), JSON.stringify({'error': ''}), 'success');
      } catch(e){
        const error = e;
        await addAppLog(userId, account_id, stripe_customer_id, 'Inactive - pause subscription', JSON.stringify({'request': {pause_collection: {behavior: 'keep_as_draft'}}}), JSON.stringify({'error': error}), 'error');
      }

      if(deleted.pause_collection){

        let accountAccountSubscriptionUpdateReq = {
          subscription_status : SUBSCRIPTION_STATUS.inactive,
          last_updated_by     : req.user.user_id,
          last_updated_date   : getDateUTC()
        };

        let accountUpdateReq = {
          status            : ACCOUNT_STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        };

        try{
          await AccountSubscription.update({ stripe_customer_id: stripe_customer_id },accountAccountSubscriptionUpdateReq).fetch();
          await Account.update({ account_id: account_id },accountUpdateReq).fetch();
          await addAppLog(userId, account_id, stripe_customer_id, 'Inactive - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': ''}), 'success');
        } catch(e){
          const error = e;
          await addAppLog(userId, account_id, stripe_customer_id, 'Inactive - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': error}), 'error');
        }

        await updateAccountCache(account_id);
        await createSubscriptionHistory(req, stripe_customer_id, 'Inactive - Inactive the scubscription history');
      }
      const cancelData = {
        latest_invoice : deleted.latest_invoice,
        status         : SUBSCRIPTION_STATUS.inactive,
      };

      return res.ok(
        cancelData,
        messages.CUSTOMER_INACTIVATED_SUCCESSFULLY,
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

  active: async(req, res) =>{
    try{
      const account_id = req.params.id;
      const results = await getCustomerSubscriptionDetails(req, account_id);
      const subscriptionId = results.stripe_subscription_id;
      const stripe_customer_id = results.stripe_customer_id;
      const retriveSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      let latest_invoice = retriveSubscription.latest_invoice;
      let retriveInvoiceData = await stripe.invoices.retrieve(latest_invoice);
      let invoiceStatus = retriveInvoiceData.status;
      let nextpaymentdate = getDate(results.next_payment_date,'YYYY-MM-DD');
      let currentdate = getCurrentDate();
      let amountremaining = retriveInvoiceData.amount_remaining;
      if(invoiceStatus === 'open') {
        const invoice = await stripe.invoices.list({
          customer : stripe_customer_id,
          limit    : 1,
          status   : 'draft'
        });
        latest_invoice = invoice.data[0].id;
        let draftInvoiceData = await stripe.invoices.retrieve(latest_invoice);
        amountremaining = draftInvoiceData.amount_remaining;
      }

      let userId = await getUserId(req.user);

      if(amountremaining === 0 && nextpaymentdate > currentdate){
        let subscription = {};

        try{
          subscription = await stripe.subscriptions.update(
            subscriptionId,
            {
              pause_collection: '',
            }
          );

          await addAppLog(userId, account_id, stripe_customer_id, 'Active - pause subscription', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': ''}), 'success');
        } catch(e){
          const error = e;
          await addAppLog(userId, account_id, stripe_customer_id, 'Active - pause subscription', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': error}), 'error');
        }

        let accountAccountSubscriptionUpdateReq = {
          subscription_status : SUBSCRIPTION_STATUS.active,
          last_updated_by     : req.user.user_id,
          last_updated_date   : getDateUTC()
        };

        let accountUpdateReq = {
          status            : ACCOUNT_STATUS.active,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        };

        try{
          await AccountSubscription.update({ stripe_customer_id: stripe_customer_id },accountAccountSubscriptionUpdateReq).fetch();
          await Account.update({ account_id: account_id },accountUpdateReq).fetch();
          await addAppLog(userId, account_id, stripe_customer_id, 'Active - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': ''}), 'success');
        } catch(e){
          const error = e;
          await addAppLog(userId, account_id, stripe_customer_id, 'Active - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': error}), 'error');
        }

        await updateAccountCache(account_id);
        await createSubscriptionHistory(req, stripe_customer_id, 'Active - active the subscription history');
        const Data = {
          latest_invoice          : subscription.latest_invoice,
          subscription_status     : SUBSCRIPTION_STATUS.active,
          account_status          : ACCOUNT_STATUS.active,
          account_subscription_id : results.account_subscription_id
        };
        return res.ok(
          Data,
          messages.CUSTOMER_ACTIVATED_SUCCESSFULLY,
          RESPONSE_STATUS.success);
      }else{
        await AccountSubscription.update({ account_id: account_id },{
          stripe_latest_invoice_id: latest_invoice
        }).fetch();
        const Data = {
          latest_invoice          : latest_invoice,
          amountremaining         : amountremaining/100,
          subscription_status     : SUBSCRIPTION_STATUS.inactive,
          account_status          : ACCOUNT_STATUS.inactive,
          account_subscription_id : results.account_subscription_id
        };
        return res.ok(
          Data,
          messages.CUSTOMER_ACTIVATED_SUCCESSFULLY,
          RESPONSE_STATUS.success);
      }
    }catch (err) {
      sails.log.error(err);
      return res.ok(
      undefined,
      messages.SOMETHING_WENT_WRONG,
      RESPONSE_STATUS.error
      );
    }
  },

  findbycustomer: async(req, res) =>{
    sails.log(req.allParams());
    try{

      return res.ok(
        undefined,
        messages.CUSTOMER_ADD_SUCCESS,
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
  sendPaymentLink: async(req, res) =>{
    try {
      let request = req.allParams();
      const account_id = request.account_id;
      const account_subscription_id = request.subscription_id;
      const method = request.method;
      const status = request.status;
      const results = await getCustomerDetails(req, account_id);
      if(results)
      {
        let userId = await getUserId(req.user);

        const token = await generateString();
        await AccountSubscription.update({ account_subscription_id: account_subscription_id },{
          paymentlinktoken: token
        }).fetch();
        const queryparam = Buffer.from(
          `subid=${account_subscription_id}&method=${method}&pt=${token}&status=${status}`
        ).toString('base64'); // encode a string
        const paymentlinkUrl = `${process.env.FRONTEND_BASEURL}/payment?id=${queryparam}`;
        sails.log('paymentlinkUrl --->', paymentlinkUrl);
        let mailBody = {
          notification_entity  : NOTIFICATION_ENTITIES.PAYMENT_LINK_CUSTOMER,
          recipient_email      : results.user_email,
          recipient_first_name : results.first_name,
          recipient_last_name  : results.last_name,
          receipient_user_id   : results.user_id,
          url                  : paymentlinkUrl,
        };
        try{
          await sendNotification(req, mailBody);
          await addAppLog(userId, account_id, results.stripe_customer_id, 'Send Payment Link - mail send', JSON.stringify({'request': mailBody}), JSON.stringify({'error': ''}), 'success');
        } catch(e){
          const error = e;
          await addAppLog(userId, account_id, results.stripe_customer_id, 'Send Payment Link - mail send', JSON.stringify({'request': mailBody}), JSON.stringify({'error': error}), 'error');
        }
        return res.ok(undefined, messages.PAYMENT_LINK_SUCCESS, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  paymentstatus: async(req, res) =>{
    try {
      const account_subscription_id = req.params.id;
      const results = await getpaymentStatus(req, account_subscription_id);
      if(results)
      {
        const status = { account_status: results.account_status, subscription_status: results.subscription_status, payment_status: results.payment_status };
        return res.ok(status, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  updateactivestatus: async(req, res) =>{
    try {
      let request = req.allParams();
      const status = request.status;

      let customer_id = request.customerId;
      const subscriptionDetails = await getSubscriptionDetailsByStripeId(req, customer_id);
      const account_id = subscriptionDetails.account_id;
      const account_subscription_id = subscriptionDetails.account_subscription_id;
      const latest_invoice = subscriptionDetails.stripe_latest_invoice_id;
      const stripe_payment_method_id = subscriptionDetails.stripe_payment_method_id;
      let userId = await getUserId(req.user);

      if(status !== undefined && status !== null && status !== '' && status.toLowerCase() === 'inactive'){

        try{
          await stripe.subscriptions.update(
            subscriptionDetails.stripe_subscription_id,
            {
              pause_collection: '',
            }
          );

          await addAppLog(userId, account_id, customer_id, 'Update Active Status - subscription unpause in stripe', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': ''}), 'success');
        } catch(e){
          const error = e;
          await addAppLog(userId, account_id, customer_id, 'Update Active Status - subscription unpause in stripe', JSON.stringify({'request': {pause_collection: '',}}), JSON.stringify({'error': error}), 'error');
        }
      }

      let paidinvoicedata  = {};
      try{
        const retriveInvoiceData = await stripe.invoices.retrieve(latest_invoice);
        const invoiceStatus = retriveInvoiceData.status;

        if(invoiceStatus !== 'paid') {
          paidinvoicedata = await stripe.invoices.pay(latest_invoice);
          await addAppLog(userId, account_id, customer_id, 'Update Active Status - invoice pay', JSON.stringify({'request': latest_invoice}), JSON.stringify({'error': ''}), 'success');
        }
      } catch(e){
        const error = e;
        await addAppLog(userId, account_id, customer_id, 'Update Active Status - invoice pay', JSON.stringify({'request': latest_invoice}), JSON.stringify({'error': error}), 'error');
      }

      const subscriptionId = paidinvoicedata.subscription;
      const retriveSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      const next_payment_date = getTimeStampToDate(retriveSubscription.current_period_end*1000,'YYYY-MM-DD');
      const product_id = retriveSubscription.plan.product;
      const product = await stripe.products.retrieve(product_id);
      const invoice = await stripe.invoices.retrieveUpcoming({customer: customer_id,});
      const amount_total = invoice.total/100;
      const amount_subtotal = invoice.subtotal/100;

      let accountAccountSubscriptionUpdateReq = {
        stripe_product_id        : product_id,
        stripe_product_name      : product.name,
        seats                    : retriveSubscription.quantity,
        stripe_price_id          : retriveSubscription.plan.id,
        amount_total             : amount_total,
        amount_subtotal          : amount_subtotal,
        stripe_payment_method_id : stripe_payment_method_id,
        next_payment_date        : next_payment_date,
        expiry_date              : next_payment_date,
        subscription_status      : SUBSCRIPTION_STATUS.active,
        last_updated_by          : userId,
        paymentlinktoken         : '',
        last_updated_date        : getDateUTC()
      };

      let accountUpdateReq = {
        status            : ACCOUNT_STATUS.active,
        last_updated_by   : userId,
        last_updated_date : getDateUTC()
      };

      try{
        await AccountSubscription.update({ account_subscription_id: account_subscription_id },accountAccountSubscriptionUpdateReq).fetch();
        await Account.update({ account_id: account_id },accountUpdateReq).fetch();
        await addAppLog(userId, account_id, customer_id, 'Update Active Status - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': ''}), 'success');
      } catch(e){
        const error = e;
        await addAppLog(userId, account_id, customer_id, 'Update Active Status - account subscription and account table update ', JSON.stringify({'request': accountAccountSubscriptionUpdateReq, 'request1': accountUpdateReq}), JSON.stringify({'error': error}), 'error');
      }
      await updateAccountCache(account_id);
      // detach old payment method id after adding new payment method.
      // await stripe.paymentMethods.detach(old_stripe_payment_method_id);

      // update new payment method as default mathod for customer
      // await stripe.customers.update(
      // customer_id,
      //   {
      //     invoice_settings: {
      //       default_payment_method: paymentMethod
      //     },
      //     expand: ['sources']
      //   }
      // );

      await createSubscriptionHistory(req, customer_id, 'UpdateActiveStatus - active the subscription status');
      const Data = {
        account_id          : subscriptionDetails.account_id,
        subscription_status : SUBSCRIPTION_STATUS.active,
        account_status      : ACCOUNT_STATUS.active
      };
      return res.ok(
          Data,
          messages.CUSTOMER_ACTIVATED_SUCCESSFULLY,
          RESPONSE_STATUS.success);
    } catch (err) {
      sails.log(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  freetrialdays: async(_req, res) =>{
    try{
      const freetrial = await AdminSettings.findOne({ code: 'free_trial_days' });
      const Data = {
        free_trial_days: freetrial.value
      };
      return res.ok(
        Data,
        messages.GET_RECORD,
        RESPONSE_STATUS.success);
    }
    catch (err) {
      sails.log(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
};
