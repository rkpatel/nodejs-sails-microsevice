/***************************************************************************

  Controller     : Customer

***************************************************************************/
const { commonListing, escapeSearch, escapeSqlSearch, tenantConnection } = require('../services/utils');
const moment = require('moment');
const { Parser } = require('json2csv');
require('../utils/common/getDateTime');
const messages = sails.config.globals.messages;
const { RESPONSE_STATUS, ACCOUNT_STATUS, NOTIFICATION_ENTITIES } = require('../utils/constants/enums');
const {sendNotification} = require('../services/sendNotification');
const { generateTokenPrimaryUser } = require('../services/jwt');
module.exports = {
  list: async function(req,res)  {
    const {sortField, sortOrder} = req.allParams();
    const { andCondition, perPage,  skip } = await commonListing(req.allParams());
    let rows=perPage;
    let sql = `SELECT account.account_id, account.account_guid, account.address, account.name as account_name, account.status as status, account.email as account_email, account.phone as account_phone, account_subscription.account_subscription_id,
      account_subscription.next_payment_date, account_subscription.expiry_date, account_subscription.subscription_status, account_subscription.billing_cycle, MAX(asp.seats) AS seats, s.name AS subscription_name, account_subscription.seats as total_licenses ,CONCAT(primary_users.first_name," ",primary_users.last_name) as primary_contact_name, primary_users.phone as primary_contact_phone, primary_users.email AS primary_users_email, primary_users.password AS primary_users_password, primary_users.status AS primary_users_status, primary_users.user_id as primary_user_id,account_subscription.stripe_product_id, account_subscription.stripe_product_name as subscription
      FROM account
        LEFT JOIN account_subscription ON account.account_id  = account_subscription.account_id
        LEFT JOIN subscription AS s ON account_subscription.subscription_id  = s.subscription_id
        LEFT JOIN account_subscription_product AS asp ON asp.account_subscription_id = account_subscription.account_subscription_id
        LEFT JOIN account_user ON account.account_id  = account_user.account_id
        INNER JOIN (Select * from user where primary_user=$1 ) primary_users ON primary_users.user_id = account_user.user_id `;
    let nativePayload= [];
    if ((andCondition).length > 0) {
      sql = sql + ` WHERE `;
      for (const data of andCondition) {
        Object.keys(data).forEach((prop) => {
          if ((prop === 'account_name') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND account.name LIKE '%${escapeSearch(data[prop])}%'`;
            }
            else {
              sql = sql + ` account.name LIKE '%${escapeSearch(data[prop])}%'`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'account_email') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND account.email LIKE '%${escapeSearch(data[prop])}%'`;
            }
            else {
              sql = sql + ` account.email LIKE '%${escapeSearch(data[prop])}%'`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'account_address') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND account.address LIKE '%${escapeSearch(data[prop])}%'`;
            }
            else {
              sql = sql + ` account.address LIKE '%${escapeSearch(data[prop])}%'`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'billing_cycle') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND account_subscription.billing_cycle LIKE '%${escapeSearch(data[prop])}%'`;
            }
            else {
              sql = sql + ` account_subscription.billing_cycle LIKE '%${escapeSearch(data[prop])}%'`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'status') && (data[prop] !== '')) {
            let statusPayload = data[prop];
            const statusnName = statusPayload.map(c => `'${c}'`).join(', ');
            const statusData = '(' + statusnName + ')';
            if (nativePayload.length > 0) {
              sql = sql + ` AND account.status IN ${statusData}`;
            }
            else {
              sql = sql + ` account.status IN ${statusData}`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'account_phone') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND account.phone LIKE '%${escapeSearch(data[prop])}%' `;
            }
            else {
              sql = sql + ` account.phone LIKE '%${escapeSearch(data[prop])}%' `;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'primary_contact_name') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND (concat(primary_users.first_name,' ', primary_users.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
            }
            else {
              sql = sql + ` (concat(primary_users.first_name,' ', primary_users.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'primary_contact_phone') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND primary_users.phone LIKE '%${escapeSearch(data[prop])}%'`;
            }
            else {
              sql = sql + ` primary_users.phone LIKE '%${escapeSearch(data[prop])}%'`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'total_licenses') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND account_subscription.seats = ${escapeSearch(data[prop])}`;
            }
            else {
              sql = sql + ` account_subscription.seats = ${escapeSearch(data[prop])}`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'subscription_name') && (data[prop] !== '')) {
            if (nativePayload.length > 0) {
              sql = sql + ` AND s.subscription_name = ${escapeSearch(data[prop])}`;
            }
            else {
              sql = sql + ` s.subscription_name = ${escapeSearch(data[prop])}`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'next_payment_date') && (data[prop] !== '')) {
            const createdDate = moment(data[prop]).format('YYYY-MM-DD');
            if (nativePayload.length > 0) {
              sql = sql + ` AND (date(account_subscription.next_payment_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
            }
            else {
              sql = sql + ` (date(account_subscription.next_payment_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'subscription') && (data[prop].length > 0)) {
            let subPayload = data[prop];
            const subName = subPayload.map(c => `'${c}'`).join(', ');
            const subData = '(' + subName + ')';
            if (nativePayload.length > 0) {
              sql = sql + ` AND account_subscription.stripe_product_id IN ${subData}`;
            }
            else {
              sql = sql + ` account_subscription.stripe_product_id IN ${subData}`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'subscription_due')) {
            //subscription due in next month
            const startOfMonth = moment().clone().add(1, 'M').startOf('month').format('YYYY-MM-DD');
            const endOfMonth   = moment().clone().add(1, 'M').endOf('month').format('YYYY-MM-DD');
            if (nativePayload.length > 0) {
              sql = sql + ` AND (date(account_subscription.next_payment_date) BETWEEN ('${startOfMonth}') AND ('${endOfMonth}'))`;
            }
            else {
              sql = sql + ` (date(account_subscription.next_payment_date) BETWEEN ('${startOfMonth}') AND ('${endOfMonth}'))`;
            }
            nativePayload.push(data[prop]);
          }
          if ((prop === 'subscription_expired')) {
            //subscription expired
            const startOfCurrentMonth = moment().clone().startOf('month').format('YYYY-MM-DD');
            const endOfCurrentMonth   = moment().clone().endOf('day').format('YYYY-MM-DD');
            if (nativePayload.length > 0) {
              sql = sql + ` AND (date(account_subscription.expiry_date) BETWEEN ('${startOfCurrentMonth}') AND ('${endOfCurrentMonth}'))`;
            }
            else {
              sql = sql + ` (date(account_subscription.expiry_date) BETWEEN ('${startOfCurrentMonth}') AND ('${endOfCurrentMonth}'))`;
            }
            nativePayload.push(data[prop]);
          }
        });
      }
    }
    sql += ` group by account.account_id `;
    if(sortField && sortOrder){
      if(sortField === 'account_name') {sql += ` ORDER BY  account.name ${sortOrder} `;}
      else if(sortField === 'status') {sql += ` ORDER BY account.status ${sortOrder} `;}
      else if(sortField === 'account_phone') {sql += ` ORDER BY account.phone ${sortOrder} `;}
      else if(sortField === 'account_email') {sql += ` ORDER BY account.email ${sortOrder} `;}
      else if(sortField === 'billing_cycle') {sql += ` ORDER BY account_subscription.billing_cycle ${sortOrder} `;}
      else if(sortField === 'account_address') {sql += ` ORDER BY account.address ${sortOrder} `;}
      else if(sortField === 'primary_contact_name') {sql += ` ORDER BY (concat(primary_users.first_name,' ', primary_users.last_name)) ${sortOrder} `;}
      else if(sortField === 'primary_contact_phone') {sql += ` ORDER BY primary_users.phone ${sortOrder} `;}
      else if(sortField === 'total_licenses') {sql += ` ORDER BY account_subscription.seats ${sortOrder} `;}
      else if(sortField === 'next_payment_date') {sql += ` ORDER BY date(account_subscription.next_payment_date) ${sortOrder} `;}
      else if(sortField === 'subscription') {sql += ` ORDER BY account_subscription.stripe_product_name ${sortOrder} `;}
      else if(sortField === 'subscription_name') {sql += ` ORDER BY s.subscription_name ${sortOrder} `;}

    }
    else{
      sql += ` order by 
      case when account.status = 'Payment Pending' then 0 else 1 end, 
      case when account.status = 'Payment Declined' then 0 else 1 end, 
      case when account.status = 'Active' then 0 else 1 end, 
      case when account.status = 'Inactive' then 0 else 1 end, 
      case when account.status = 'Cancelled' then 0 else 1 end `;
    }
    if(skip !== undefined && rows !== undefined){
      sql += ` LIMIT $2 OFFSET $3 `;
    }
    const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),['Yes',rows,skip]);
    const countQuery = sql.split('LIMIT ');
    const countResult = await sails.sendNativeQuery(`${countQuery[0]};`,[ 'Yes', Number(rows), Number(skip)]);
    let results = rawResult.rows;
    let countresult = countResult.rows.length;
    if(results)
    {
      const customerList = results.map((item)=>({
        account_id              : item.account_id,
        account_guid            : item.account_guid,
        account_name            : item.account_name,
        account_subscription_id : item.account_subscription_id,
        account_email           : (item.account_email) ? (item.account_email) : '',
        account_address         : (item.address) ? (item.address) : '',
        status                  : item.status,
        account_phone           : item.account_phone,
        billing_cycle           : item.billing_cycle,
        total_licenses          : (item.total_licenses) ? item.total_licenses : '-',
        subscription_name       : (item.subscription_name) ? item.subscription_name : '',
        subscription            : (item.subscription) ? item.subscription : '-',
        next_payment_date       : (item.next_payment_date) ? moment.parseZone((item.next_payment_date)).format('MM/DD/YYYY') : '',
        primary_contact_name    : (item.primary_contact_name) ? (item.primary_contact_name) : '',
        primary_contact_phone   : (item.primary_contact_phone) ?  (item.primary_contact_phone): '',
        primary_users_email     : (item.primary_users_email) ?  (item.primary_users_email): '',
        primary_users_status    : (item.primary_users_status) ?  (item.primary_users_status): '',
        credentials             : (item.primary_users_password) ?  'Yes' : 'No',
        primary_user_id         : item.primary_user_id,
      }));
      return res.ok({ customersList: customerList , totalCount: countresult},'Customer Listing',RESPONSE_STATUS.success);
    }
    else{
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
    }
  },

  customerExport: async function(req, res){
    try{
      const { andCondition } = await commonListing(req.allParams());
      let sql = `SELECT account.account_id, account.account_guid, account.name as account_name, account.status as status, account.email as account_email, account.phone as account_phone,
      account_subscription.next_payment_date, account_subscription.seats as total_licenses ,CONCAT(primary_users.first_name," ",primary_users.last_name) as primary_contact_name, primary_users.phone as primary_contact_phone, account_subscription.stripe_product_id, account_subscription.stripe_product_name as subscription, account_subscription.billing_cycle,
      account_subscription.expiry_date
      FROM account
        LEFT JOIN account_subscription
          ON account.account_id  = account_subscription.account_id
        LEFT JOIN account_user
          ON account.account_id  = account_user.account_id
        LEFT JOIN (Select * from user where primary_user=$1 ) primary_users
          ON primary_users.user_id = account_user.user_id `;
      let nativePayload= [];
      if ((andCondition).length > 0) {
        sql = sql + ` WHERE `;
        for (const data of andCondition) {
          Object.keys(data).forEach((prop) => {
            if ((prop === 'account_name') && (data[prop] !== '')) {
              sql = sql + `  account.name LIKE '%${escapeSearch(data[prop])}%'`;
              nativePayload.push(data[prop]);
            }
            if ((prop === 'status') && (data[prop] !== '')) {
              if (nativePayload.length > 0) {
                sql = sql + ` AND account.status = '${data[prop]}' `;
              }
              else {
                sql = sql + ` account.status = '${data[prop]}' `;
              }
              nativePayload.push(data[prop]);
            }
            if ((prop === 'account_phone') && (data[prop] !== '')) {
              if (nativePayload.length > 0) {
                sql = sql + ` AND account.phone LIKE '%${escapeSearch(data[prop])}%') `;
              }
              else {
                sql = sql + ` account.phone LIKE '%${escapeSearch(data[prop])}%') `;
              }
              nativePayload.push(data[prop]);
            }
            if ((prop === 'primary_contact_name') && (data[prop] !== '')) {
              if (nativePayload.length > 0) {
                sql = sql + ` AND (concat(primary_users.first_name,' ', primary_users.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
              }
              else {
                sql = sql + ` (concat(primary_users.first_name,' ', primary_users.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
              }
              nativePayload.push(data[prop]);
            }
            if ((prop === 'primary_contact_phone') && (data[prop] !== '')) {
              if (nativePayload.length > 0) {
                sql = sql + ` AND primary_users.phone LIKE '%${escapeSearch(data[prop])}%'`;
              }
              else {
                sql = sql + ` primary_users.phone LIKE '%${escapeSearch(data[prop])}%'`;
              }
              nativePayload.push(data[prop]);
            }
            if ((prop === 'total_licenses') && (data[prop] !== '')) {
              if (nativePayload.length > 0) {
                sql = sql + ` AND account_subscription.seats = ${escapeSearch(data[prop])}`;
              }
              else {
                sql = sql + ` account_subscription.seats = ${escapeSearch(data[prop])}`;
              }
              nativePayload.push(data[prop]);
            }
            if ((prop === 'next_payment_date') && (data[prop] !== '')) {
              const createdDate = moment(data[prop]).format('YYYY-MM-DD');
              if (nativePayload.length > 0) {
                sql = sql + ` AND (date(account_subscription.next_payment_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
              }
              else {
                sql = sql + ` (date(account_subscription.next_payment_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
              }
              nativePayload.push(data[prop]);
            }
            if ((prop === 'subscription') && (data[prop].length > 0)) {
              let subPayload = data[prop];
              const subName = subPayload.map(c => `'${c}'`).join(', ');
              const subData = '(' + subName + ')';
              if (nativePayload.length > 0) {
                sql = sql + ` AND account_subscription.stripe_product_id IN ${subData}`;
              }
              else {
                sql = sql + ` account_subscription.stripe_product_id IN ${subData}`;
              }
              nativePayload.push(data[prop]);
            }
          });
        }
      }
      sql += ` group by account.account_id `;

      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),['Yes']);
      let results = rawResult.rows;
      if (results.length > 0) {
        const response = await results.map((item)=>{
          return {
            CustomerID      : item.account_id,
            CustomerName    : item.account_name,
            Contact         : item.account_phone,
            PrimaryUserName : (item.primary_contact_name) ? (item.primary_contact_name) : '',
            PrimaryContact
            : (item.primary_contact_phone) ?  (item.primary_contact_phone): '',
            Licenses     : item.total_licenses,
            Subscription : (item.subscription) ? (item.subscription): '',
            BillingCycle : (item.billing_cycle) ? (item.billing_cycle): '',
            Status       : item.status,
            ExpiryDate   : (item.expiry_date) ? moment.parseZone(item.expiry_date).format('MM/DD/YYYY') : ''
          };
        });
        const fileName = process.env.EXPORTED_CUSTOMER_FILE_NAME + moment().utc().format('MM-DD-YYYY_HH:MM:SS');
        const json2csv = new Parser();
        const csv = json2csv.parse(response);
        res.setHeader('Content-Disposition', 'attachment; filename='+fileName+'.csv');
        res.set('Content-Type', 'text/csv');
        return res.status(200).send(csv);
      }
      else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },
  findcustomeractiveemployee: async(req, res) =>{
    try {
      let request = req.allParams();
      const account_id = parseInt(request.account_id);
      const { offset, perPage } = request;

      let connection = await tenantConnection(account_id);
      let sql = `SELECT CONCAT(u.first_name," ",u.last_name) as name, u.phone, u.email, u.status, u.primary_user 
          FROM ${process.env.DB_NAME}.user AS u
          LEFT JOIN ${process.env.DB_NAME}.account_user AS au ON u.user_id = au.user_id
          LEFT JOIN employee_profile AS ep ON ep.user_id = au.user_id
          WHERE au.account_id = '${account_id}' AND u.status='${ACCOUNT_STATUS.active}'`;
      sql = sql + ` limit ${perPage} offset ${offset}`;
      const rawResult = await sails.sendNativeQuery(sql).usingConnection(connection.connection);
      let results = rawResult.rows;

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
  reinvite: async function (req, res) {
    const primary_user_id = req.params.id;
    const employeeResult = await sails.sendNativeQuery(`SELECT u.user_id, u.first_name, u.last_name, u.email
                                                        FROM user as u 
                                                        LEFT JOIN account_user AS au ON u.user_id = au.user_id
                                                        WHERE u.user_id = ${primary_user_id} `);
    const userDetails = employeeResult.rows;
    const userId = userDetails[0].user_id;
    const first_name = userDetails[0].first_name;
    const last_name = userDetails[0].last_name;
    const email = userDetails[0].email;

    const token = await generateTokenPrimaryUser({ id: userId, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, process.env.JWT_CREATE_PASS_EXPIRY);
    const createUrl = `${process.env.FRONTEND_BASEURL}/create-password?token=${token}`;

    await Users.update({ user_id: userId }, {
      reset_password_token: token,
    });
    await sendNotification(req, {
      notification_entity  : NOTIFICATION_ENTITIES.CREATE_PASSWORD_CUSTOMER,
      recipient_email      : email,
      recipient_first_name : first_name,
      recipient_last_name  : last_name,
      receipient_user_id   : userId,
      url                  : createUrl,
    });
    return res.ok(undefined, messages.REINVITE_SUCCESS, RESPONSE_STATUS.success);
  },
};


/*

SELECT account.account_id , account.account_guid, account.name as account_name, account.status as status, account.email as account_email, account.phone as account_phone,
	account_subscription.next_payment_date, account_subscription.seats as total_licenses, CONCAT(user.first_name," ",user.last_name) as primary_contact_name, user.phone as primary_contact_phone
    FROM account
		 JOIN account_subscription
			ON account.account_id  = account_subscription.account_id
		 JOIN account_user
			ON account.account_id  = account_user.account_id
		 JOIN user
			ON user.user_id = account_user.user_id
	where user.primary_user = 'Yes';

*/
