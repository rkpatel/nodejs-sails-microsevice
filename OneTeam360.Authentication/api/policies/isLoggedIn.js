/* eslint-disable no-unused-vars */
/***************************************************************************

isLoggedIn policy

This policy will check if api header contains Authorization header or not.
If contains then will fetch user details and pass as req.user else will send
err response to api.

Note: it is necessary to add isLoggedIn policy in order to add autorization check

***************************************************************************/

const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const { verify, decode } = require('../services/jwt');
const { MASTERINFO_STATUS,RESPONSE_STATUS, ACCOUNT_CONFIG_CODE, PORTAL_ACCESS_STATUS, ACCOUNT_STATUS } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;

module.exports = async (req, res, next) => {
  if (!req.headers || !req.headers.authorization) {
    return res.unAuthorized(undefined, messages.AUTH_TOKEN_MISSING, RESPONSE_STATUS.error);
  }
  const tokenParameter = req.headers.authorization;
  const tkn_prm = tokenParameter.split(' ');
  if ((!tkn_prm[0] || !tkn_prm[1]) || (tkn_prm[0] !== 'Bearer')) {
    return res.unAuthorized(undefined, messages.INVALID_AUTH_TOKEN, RESPONSE_STATUS.error);
  }
  const tokenParam = tkn_prm[1];
  let decodedtoken;

  try{
    decodedtoken = verify(tokenParam);
  }catch(error){
    if(req.url === '/reset-password'){
      return res.ok(undefined,messages.RESET_PASSWORD_TOKEN_EXPIRE, RESPONSE_STATUS.error);
    }else if (req.url === '/create-password'){
      return res.ok(undefined,messages.CREATE_PASSWORD_TOKEN_EXPIRE, RESPONSE_STATUS.error);
    }else if (req.url === '/profile-detail'){
      return res.ok(undefined,messages.CREATE_PASSWORD_TOKEN_EXPIRE, RESPONSE_STATUS.error);
    }
    if(error && error.name === 'TokenExpiredError'){
      if(req.url === '/refreshToken'){
        try{
          let _decoded =  await decode(tokenParam);
          req.payload = _decoded.payload;
          return next();
        }catch(_err){
          return res.unAuthorized({ code: 'TOKEN_EXPIRED' },messages.INVALID_TOKEN, RESPONSE_STATUS.error);
        }
      }else{
        return res.unAuthorized({ code: 'TOKEN_EXPIRED' },messages.INVALID_TOKEN, RESPONSE_STATUS.error);
      }
    // }else if(error && error.name === 'JsonWebTokenError'){
    //   return res.unAuthorized({ code: 'TOKEN_INVALID' },messages.INVALID_TOKEN, RESPONSE_STATUS.error);
    // }
    }else {
      return res.unAuthorized({ code: 'TOKEN_INVALID' },messages.INVALID_TOKEN, RESPONSE_STATUS.error);
    }
  }
  if(decodedtoken){
    if(req.url === '/refreshToken'){
      return res.ok({ token: tokenParameter },messages.TOKEN_VALID, RESPONSE_STATUS.success);
    }

    if('scope' in decodedtoken && (decodedtoken.scope === 'RESET_PASSWORD' || decodedtoken.scope === 'CREATE_PASSWORD')){
      // get account id of logged in user
      // if match with confirue account of user
      const accountUser = await sails.sendNativeQuery(`SELECT account_id FROM ${process.env.DB_NAME}.account_user WHERE user_id = ${decodedtoken.id} `).usingConnection(req.dynamic_connection);
      const accountUserDetails = accountUser.rows;
      const account_id = parseInt(accountUserDetails[0].account_id);
      const admin_account_id = parseInt(process.env.ADMIN_ACCOUNT_ID);
      let user = {};
      if(account_id === admin_account_id) {
        user = await Users.findOne({
          where: {user_id: decodedtoken.id , reset_password_token: tokenParam  }
        });
      } else {
        user = await Users.findOne({
          where: {user_id: decodedtoken.id , reset_password_token: tokenParam, portal_access: PORTAL_ACCESS_STATUS.customer  }
        });
      }

      if (!user) {
        // Token already used for reset Password
        if(decodedtoken.scope === 'RESET_PASSWORD'){
          return res.ok(undefined,messages.RESET_PASSWORD_ALREADY_USED, RESPONSE_STATUS.error);
        }else if(decodedtoken.scope === 'CREATE_PASSWORD'){
          return res.ok(undefined,messages.CREATE_PASSWORD_ALREADY_USED, RESPONSE_STATUS.error);
        }
      }

      if(decodedtoken.scope === 'RESET_PASSWORD' && req && !('password' in req.body)){
        return res.ok(undefined,messages.RESET_PASSWORD_TOKEN_VALID, RESPONSE_STATUS.success);
      }
      req.user = user;
      req.token = decodedtoken;

      const accountUsersql = `Select account.account_guid,account.status as account_status, ac.account_configuration_id, 
      au.account_id, account.name, account.email, account.address, account.onboard_status, asb.payment_status as payment_status,
      (select GROUP_CONCAT(acgd.code SEPARATOR ",") FROM account_configuration_detail acgd 
      WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}')) as account_code,
      (select GROUP_CONCAT(acgd.value SEPARATOR ",") FROM account_configuration_detail acgd 
      WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}')) as account_value
      from account_user au
      INNER JOIN account ON au.account_id = account.account_id
      INNER JOIN account_configuration ac ON au.account_id = ac.account_id  
      INNER JOIN account_subscription asb ON au.account_id = asb.account_id  
      INNER JOIN user u ON au.user_id = u.user_id 
      where au.user_id= ${user.user_id}`;
      const rawAccount = await sails.sendNativeQuery(accountUsersql);
      let results = rawAccount.rows[0];
      let account = {
        account_id     : results.account_id,
        account_guid   : results.account_guid,
        name           : results.name,
        email          : results.email,
        address        : results.address,
        onboard_status : results.onboard_status,
        status         : results.account_status,
        payment_status : results.payment_status
      };
      let connectionString = results.account_value;
      req.account = account;
      req.connectionString = connectionString;
      next();
    }else{
      sails.log('decodedtoken--------->',decodedtoken);
      let connectionString = '';
      let accountTimezone = '';
      let accountDateTime = '';
      let accountDate = '';
      let account;
      let results;
      if('tenantId' in decodedtoken){
        const getKey = `${decodedtoken.tenantGuid}_${MASTERINFO_STATUS.account}`;
        const accountData = await getCache(getKey);
        sails.log('redisaccountData--------->',accountData);
        let account_status = '';
        if((accountData.status === RESPONSE_STATUS.success) && (accountData.data !== null))
        {
          results = accountData.data;
          const accountinfo = await Account.findOne({ account_id: results.account_id });
          sails.log('accountinfoOne--------->',accountinfo);
          account_status = accountinfo.status;
          if(accountinfo.status === ACCOUNT_STATUS.inactive){
            return res.inActivateUser(undefined,messages.ACCOUNT_INACTIVATE_LOGOUT, RESPONSE_STATUS.error);
          }
          if(accountinfo.status === ACCOUNT_STATUS.cancelled){
            const userinfo = await Users.findOne({ user_id: decodedtoken.id });
            if(userinfo.primary_user !== 'Yes'){
              return res.inActivateUser(undefined,messages.ACCOUNT_INACTIVATE_LOGOUT, RESPONSE_STATUS.error);
            }
          }
        }
        else{
          const sqlAccount = `Select distinct account.account_id, account_guid, account.name, address, onboard_status, account.status, 
            ac.account_configuration_id,  asb.payment_status as payment_status,
            (select GROUP_CONCAT(acgd.code SEPARATOR ",") FROM account_configuration_detail acgd 
            WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_code,
            (select GROUP_CONCAT(acgd.value SEPARATOR ",") FROM account_configuration_detail acgd 
            WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_value
            from account 
            INNER JOIN account_configuration ac ON account.account_id = ac.account_id 
            INNER JOIN account_subscription asb ON account.account_id = asb.account_id  
            where account.account_id = ${decodedtoken.tenantId}`;
          sails.log('sqlAccount============>',sqlAccount);

          const rawAccount = await sails.sendNativeQuery(sqlAccount);
          results = rawAccount.rows[0];
          sails.log('results============>',results);
          account_status = results.status;
          const dataAccount = {
            'key'   : `${results.account_guid}_${MASTERINFO_STATUS.account}`,
            'value' : results
          };
          await setCache(dataAccount);
        }

        account = {
          account_id     : results.account_id,
          account_guid   : results.account_guid,
          name           : results.name,
          email          : results.email,
          address        : results.address,
          onboard_status : results.onboard_status,
          status         : account_status,
          payment_status : results.payment_status
        };
        if(account.status === ACCOUNT_STATUS.inactive){
          return res.inActivateUser(undefined,messages.ACCOUNT_INACTIVATE_LOGOUT, RESPONSE_STATUS.error);
        }
        if(account.status === ACCOUNT_STATUS.cancelled){
          const userinfo = await Users.findOne({ user_id: decodedtoken.id });
          if(userinfo.primary_user !== 'Yes'){
            return res.inActivateUser(undefined,messages.ACCOUNT_INACTIVATE_LOGOUT, RESPONSE_STATUS.error);
          }
        }
        let account_code = []; let account_value = [];

        if(results.account_code !== null){
          account_code = (results.account_code).split(',');
        }
        if(results.account_value !== null){
          account_value = (results.account_value).split(',');
        }
        if((account_code.length > 0) && (account_value.length > 0))
        {
          sails.log('account_code============>',account_code);

          for(const item in account_code){
            if((account_code[item]) === ACCOUNT_CONFIG_CODE.tenant_db_connection_string)
            {
              connectionString = account_value[item];
            }
            if((account_code[item]) === ACCOUNT_CONFIG_CODE.time_zone)
            {
              accountTimezone = account_value[item];
            }
            if((account_code[item]) === ACCOUNT_CONFIG_CODE.date_time_format)
            {
              accountDateTime = account_value[item];
            }
            if((account_code[item]) === ACCOUNT_CONFIG_CODE.date_format)
            {
              accountDate = account_value[item];
            }
          }
          if(!accountTimezone)
          {
            accountTimezone = process.env.ACCOUNT_TIMEZONE;
          }
          if(!accountDateTime)
          {
            accountDateTime = process.env.ACCOUNT_DATETIMEFORMAT;
          }
          if(!accountDate)
          {
            accountDate = process.env.ACCOUNT_DATEFORMAT;
          }
        }
      }
      const user = await Users.find({
        where  : {user_id: decodedtoken.id},
        select : ['user_id']
      });
      sails.log('user============>',user);
      if (user.length <= 0) {
        return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
      }
      req.user = {user_id: user[0].user_id};
      req.token = decodedtoken;
      req.account = account;
      req.connectionString = connectionString;
      req.timezone = accountTimezone;
      req.dateTimeFormat = accountDateTime;
      req.dateFormat = accountDate;
      next();
    }
  }else{
    return res.unAuthorized(undefined,messages.INVALID_TOKEN, RESPONSE_STATUS.error);
  }
};
