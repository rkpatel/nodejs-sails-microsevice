const {
  RESPONSE_STATUS,
  ACCOUNT_STATUS,
  PERMISSIONS,
  ACCOUNT_CONFIG_CODE,
  NOTIFICATION_ENTITIES,
  CRON_JOB_CODE
} = require('../utils/constants/enums');

const {
  getDateUTC
} = require('../utils/common/getDateTime');
const moment = require('moment');
const { sendNotification } = require('../services/sendNotification');


const timeZoneData=async(item)=>{
  return item.time_zone ? item.time_zone : '';
};

const cronLastProcessingDate=async(cronJob)=>{
  return cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
};

const tenantDbString=(tenant_db_connection_string)=>{
  return tenant_db_connection_string ? tenant_db_connection_string.value : '';
};

const timeZoneDatas=(time_zone)=>{
  return time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE;
};

const dateTimeFormat=(date_time_format)=>{
  return date_time_format
  ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT;
};

const dateFormatDatas=(date_format)=>{
  return date_format
  ? date_format.value
  : process.env.ACCOUNT_DATEFORMAT;
};

const cronCertificateData=(cron_certificate_expire)=>{
  return cron_certificate_expire
  ? cron_certificate_expire.value
  : process.env.CRON_CERTIFICATE_EXPIRE;
};

const allDataCondition=(results,id)=>{
  let tenant_db_connection_string = results.find(
    (a) =>
      a.account_id === id &&
      a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string
  );
  let time_zone = results.find(
    (a) => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone
  );
  let date_time_format = results.find(
    (a) =>
      a.account_id === id &&
      a.code === ACCOUNT_CONFIG_CODE.date_time_format
  );
  let date_format = results.find(
    (a) =>
      a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format
  );
  let cron_certificate_expire = results.find(
    (a) =>
      a.account_id === id &&
      a.code === ACCOUNT_CONFIG_CODE.cron_certificate_expire
  );
  return {
    account_id                  : id,
    tenant_db_connection_string : tenantDbString(tenant_db_connection_string),
    time_zone                   : timeZoneDatas(time_zone),
    date_time_format            : dateTimeFormat(date_time_format),
    date_format                 : dateFormatDatas(date_format),
    cron_certificate_expire     : cronCertificateData(cron_certificate_expire),
  };
};

const _aboutToCheckInRequestCron = async (
) => {
  sails.log.debug('Check-In Request Cron Execution Start');
  let sql = `
    SELECT
        account.account_id,
        account_configuration_detail.value,
        account_configuration_detail.code
      from account
      INNER JOIN
        account_configuration ON account.account_id = account_configuration.account_id
      INNER JOIN
        account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
      Where
        account_configuration_detail.code IN ($1,$2,$3,$4,$5) and account.status = $6 ;`;

  const rawResult = await sails.sendNativeQuery(sql, [
    ACCOUNT_CONFIG_CODE.tenant_db_connection_string,
    ACCOUNT_CONFIG_CODE.time_zone,
    ACCOUNT_CONFIG_CODE.date_time_format,
    ACCOUNT_CONFIG_CODE.date_format,
    ACCOUNT_CONFIG_CODE.cron_certificate_expire,
    ACCOUNT_STATUS.active,
  ]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map((item) => item.account_id))];
  let accountArray = accountIds
    ? accountIds.map((id) => {
      return allDataCondition(results,id);
    })
    : [];
  for (const item of accountArray) {
    let timezone = await timeZoneData(item);
    if (!item.tenant_db_connection_string && timezone === '') {
      sails.log(1);
      continue;
    }

    // Tenant specific database connection
    let connectionString = item.tenant_db_connection_string;
    let rdi = sails.getDatastore('default');
    let mysql = rdi.driver.mysql;
    let tenantConnection = await mysql.createConnection(connectionString);
    await tenantConnection.connect();

    let cronJob = await CronJob.findOne({
      code: CRON_JOB_CODE.CHECKIN_REQUEST,
    }).usingConnection(tenantConnection);

    if (cronJob) {
      let currentDate = getDateUTC();
      let obj;
      let start_date =await cronLastProcessingDate(cronJob);
      sails.log(start_date);

      try {
        let findUserSql = `SELECT u.email, u.user_id, ep.employee_profile_id,l.name,ec.location_id
    FROM ${process.env.DB_NAME}.user AS u
    INNER JOIN employee_profile AS ep ON u.user_id = ep.user_id
    INNER JOIN employee_location el ON ep.employee_profile_id= el.employee_profile_id
    INNER JOIN location l ON el.location_id=l.location_id
    INNER JOIN role_permission AS rp ON ep.role_id = rp.role_id
    INNER JOIN permission AS p ON rp.permission_id = p.permission_id AND p.code = '${PERMISSIONS.REVIEW_CHECK_IN}'
    INNER JOIN employee_checkin ec ON ec.location_id = el.location_id AND ec.employee_profile_id != ep.employee_profile_id
    where u.status = $1 AND ec.request_status='Pending' AND ec.checkin_datetime > '${start_date}' GROUP BY ec.location_id, u.email `;
        const rawUserResult = await sails
    .sendNativeQuery(findUserSql, [ACCOUNT_STATUS.active])
    .usingConnection(tenantConnection);
        let Empdata = {
          notification_entity : NOTIFICATION_ENTITIES.CHECKIN_REQUEST,
          employees           : rawUserResult.rows,
          account_id          : item.account_id,
        };
        await sendNotification(null, Empdata);
        await CronJob.update(
            { code: CRON_JOB_CODE.CHECKIN_REQUEST },
            { last_processing_date: currentDate }
        ).usingConnection(tenantConnection);
        obj = {
          status : 'Success',
          error  : '',
        };
      } catch (error) {
        obj = {
          status : 'Failure',
          error  : `Error : ${error.message}`,
        };
      } finally {
        await CronJobLog.create({
          cron_job_id   : cronJob.cron_job_id,
          status        : obj.status,
          start_date    : currentDate,
          end_date      : getDateUTC(),
          error_message : obj.error,
        }).usingConnection(tenantConnection);
      }
    } else {
      // No Cron Jon with code Certificate About to Expire
      sails.log('No Cron Jon with check-In Request');
    }

    if (tenantConnection) {
      await tenantConnection.end();
    }

    //}
  }

  sails.log.debug('check-In Request Cron Execution End');
};
module.exports = {
  CheckInRequestCron : _aboutToCheckInRequestCron,
  trigger            : async (_req, res) => {
    await _aboutToCheckInRequestCron();
    return res.ok(undefined, 'Triggered SuccessFully', RESPONSE_STATUS.success);
  },
};
