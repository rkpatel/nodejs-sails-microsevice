/***************************************************************************


Services     : utils

**************************************************
Functions
**************************************************
logger,

**************************************************

***************************************************************************/
const fs = require('fs');
const {  ACCOUNT_CONFIG_CODE } = require('../utils/constants/enums');
const crypto = require('crypto');
module.exports = {
  //I removed logger function for adding audit logs and system logs for apis responses and request from here
  // eslint-disable-next-line no-unused-vars
  logger: async(req, res) => {
    const log = {
      url       : req.baseUrl + req.originalUrl,
      response  : res.message,
      useragent : req.headers['user-agent'],
      ip        : req.ip,
      date      : new Date(),
    };
    if(res.code !== 200)
    {
      await SystemLog.create({
        user_id       : req.user ? req.user.user_id : 0,
        account_id    : req.token ? req.token.tenantId : 0,
        url           : log.url,
        ip_address    : log.ip,
        error_code    : res.code,
        error_message : log.response,
        useragent     : log.useragent,
        stack_trace   : JSON.stringify(res.data)
      }).fetch();
    }
    if (!fs.existsSync('logging')){
      fs.mkdirSync('logging');
    }
    if(!fs.existsSync('logging/auditLogger.txt')) {
      fs.writeFileSync('logging/auditLogger.txt', '[]');
    }
    if(!fs.existsSync('logging/systemLogger.txt')) {
      fs.writeFileSync('logging/systemLogger.txt', '[]');
    }
  },
  generateKey: function() {
    // 16 bytes is likely to be more than enough,
    // but you may tweak it to your needs
    return crypto.randomBytes(6).toString('base64');
  },

  commonListing: async(req) => {
    let {offset, perPage, filters, sortField, sortOrder } = req;
    const filterData = filters;
    let skip = 0;
    let sort = [];
    let andCondition = [];
    let allData = {};
    let rows=0;
    let value;
    if (filterData !== '') {
      let arrayData = filterData;
      for (const property in arrayData) {
        let criteria = property;
        let key = arrayData[property];
        value=((key === '') || (key.length === 0)) ? '' : key;
        allData = { [criteria]: value };
        andCondition.push(allData);
      }
    }
    sort=(((sortField === '') || (sortField === null)) && ((sortOrder === '') || (sortOrder === null))) ? '' : `${sortField} ${sortOrder}`;
    if(offset !== '')
    {
      if(offset > 1)
      {
        skip = offset-1;
      }
    }
    if(perPage !== '')
    {
      rows = perPage;
    }
    return { andCondition, rows, skip, sort };
  },
  escapeSearch: (searchText) => {
    if(!searchText) {return searchText;}
    // eslint-disable-next-line quotes
    return searchText.replace(new RegExp(/'/, 'g'),"\\'");
  },
  escapeSqlSearch: (searchQuery) => {
    if(!searchQuery) {return searchQuery;}
    // eslint-disable-next-line quotes
    return searchQuery.replace(new RegExp(/--|drop|truncate/, 'g'),"");
  },
  tenantConnection: async function(tenantId){
    const accountConf = await AccountConfiguration.findOne({ account_id: tenantId });
    const dbname = await AccountConfigurationDetail.findOne({ account_configuration_id: accountConf.account_configuration_id, code: ACCOUNT_CONFIG_CODE.tenant_db_connection_string });
    let connectionString = dbname.value;
    sails.log('connectionString',connectionString);
    // Grab the MySQL module from the datastore instance
    let rdi = sails.getDatastore('default');
    let mysql = rdi.driver.mysql;
    let tenantConnection = await  mysql.createConnection(connectionString);
    await tenantConnection.connect();
    return {
      connection: tenantConnection
    };
  }
};

