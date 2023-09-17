/* eslint-disable no-unused-vars */
const {
  getDateUTC
} = require('../utils/common/getDateTime');
const {
  ACCOUNT_STATUS,
  RESPONSE_STATUS,
  ACCOUNT_CONFIG_CODE,
  CRON_JOB_CODE,
} = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');

const tenantString = (results,id) =>{
  return results.find(
    (a) =>
      a.account_id === id &&
      a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string
  );
};

const timeZone=(results,id)=>{
  return results.find(
    (a) => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone
  );
};

const dateTimeFormatData=(results,id)=>{
  return results.find(
    (a) =>
      a.account_id === id &&
      a.code === ACCOUNT_CONFIG_CODE.date_time_format
  );
};

const dateFormat=(results,id)=>{
  return results.find(
    (a) =>
      a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format
  );
};

const cronCheckInData=(results,id)=>{
  return results.find(
    (a) =>
      a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_checkin
  );
};

const allDatas=(id,tenant_db_connection_string,time_zone,date_time_format,date_format,cron_checkin)=>{
  return {
    account_id                  : id,
    tenant_db_connection_string : tenant_db_connection_string
        ? tenant_db_connection_string.value
        : '',
    time_zone        : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
    date_time_format : date_time_format
        ? date_time_format.value
        : process.env.ACCOUNT_DATETIMEFORMAT,
    date_format: date_format
        ? date_format.value
        : process.env.ACCOUNT_DATEFORMAT,
    checkin_duration: cron_checkin ? cron_checkin.value : '12:00',
  };
};

const empCheckInDatas=async(result1,currentDate,tenantConnection)=>{
  if (result1.length > 0) {
    for (const resultItem of result1) {
      await EmployeeCheckIn.update(
        { employee_checkin_id: resultItem.employee_checkin_id },
        {
          request_status    : 'CheckedOut',
          checkout_datetime : currentDate,
        }
      )
        .fetch()
        .usingConnection(tenantConnection);
    }
  }
};

const tenantConnectionEndData=async(tenantConnection)=>{
  if (tenantConnection) {
    return tenantConnection.end();
  }
};

const triggerCheckoutCron = async (_curentTimeUTC) => {
  let sql = `
    SELECT
        account.account_id,
        account_configuration_detail.code,
        account_configuration_detail.value
      from account
      INNER JOIN
        account_configuration ON account.account_id = account_configuration.account_id
      INNER JOIN
        account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
      Where
        account_configuration_detail.code IN ($1,$2,$3,$4,$5) and account.status = $6`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql), [
    ACCOUNT_CONFIG_CODE.tenant_db_connection_string,
    ACCOUNT_CONFIG_CODE.time_zone,
    ACCOUNT_CONFIG_CODE.date_time_format,
    ACCOUNT_CONFIG_CODE.date_format,
    ACCOUNT_CONFIG_CODE.cron_checkin,
    ACCOUNT_STATUS.active,
  ]);
  const results = rawResult.rows;
  let accountIds = [...new Set(results.map((item) => item.account_id))];
  let accountArray = accountIds
    ? accountIds.map((id) => {
      let tenant_db_connection_string = tenantString(results,id);
      let time_zone = timeZone(results,id);
      let date_time_format = dateTimeFormatData(results,id);
      let date_format = dateFormat(results,id);
      let cron_checkin = cronCheckInData(results,id);
      return allDatas(id,tenant_db_connection_string,time_zone,date_time_format,date_format,cron_checkin);
    })
    : [];
  for (const item of accountArray) {
    if (!item.tenant_db_connection_string) {
      continue;
    }
    let connectionString = item.tenant_db_connection_string;
    if (connectionString) {
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let tenantConnection = await mysql.createConnection(connectionString);
      await tenantConnection.connect();
      let cronJob = await CronJob.findOne({
        code: CRON_JOB_CODE.checkout,
      }).usingConnection(tenantConnection);

      if (cronJob) {
        let currentDate = getDateUTC();
        const checkin_duration = item.checkin_duration.split(':');
        const checkin_duration_minutes =
          Number(checkin_duration[0]) * 60 + Number(checkin_duration[1]);
        try {
          let sqlQuery = `SELECT DISTINCT
          employee_checkin.employee_checkin_id
          FROM employee_checkin
          INNER JOIN employee_profile
              ON employee_checkin.employee_profile_id = employee_profile.employee_profile_id
          INNER JOIN ${process.env.DB_NAME}.account_user
              ON account_user.user_id = employee_profile.user_id 
          WHERE 
          account_user.account_id = ${item.account_id}
          AND employee_checkin.request_status IN ('Pending', 'Approved')
          AND TIMESTAMPDIFF(MINUTE, employee_checkin.checkin_datetime, '${currentDate}') >= ${checkin_duration_minutes}`;

          const rawResults = await sails
            .sendNativeQuery(escapeSqlSearch(sqlQuery))
            .usingConnection(tenantConnection);

          const result1 = rawResults.rows;
          await empCheckInDatas(result1,currentDate,tenantConnection);

          await CronJob.update(
            { code: CRON_JOB_CODE.checkout },
            { last_processing_date: currentDate }
          ).usingConnection(tenantConnection);

        } catch (error) {
          sails.log(error);
        }
      } else {
        sails.log('No Cron Job with code CHECKOUT');
      }

      await tenantConnectionEndData(tenantConnection);
    }
  }
};

module.exports = {
  checkoutCron    : triggerCheckoutCron,
  triggerCheckout : async (_req, res) => {
    let curentTimeUTC = getDateUTC();
    await triggerCheckoutCron(curentTimeUTC);
    return res.ok(
      undefined,
      'Checkout Cron Triggered Successfully',
      RESPONSE_STATUS.success
    );
  }
};
