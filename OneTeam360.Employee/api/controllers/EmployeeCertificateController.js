/***************************************************************************

  Controller     : Tenant Employee Profile

***************************************************************************/

const moment = require('moment');
const { PERMISSIONS, ACCOUNT_STATUS, RESPONSE_STATUS, ACCOUNT_CONFIG_CODE, NOTIFICATION_ENTITIES, CRON_JOB_CODE } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const { getDateUTC, getDateTimeSpecificTimeZone, getDateNumber } = require('../utils/common/getDateTime');
const {sendNotification} = require('../services/sendNotification');

const tenantDbConnStringData=(tenant_db_connection_string)=>{
  return tenant_db_connection_string ? tenant_db_connection_string.value : '';
};

const tenantTimeZoneData=(time_zone)=>{
  return time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE;
};

const tenantDateTimeFormatData=(date_time_format)=>{
  return date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT;
};

const tenantDateFormatData=(date_format)=>{
  return date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT;
};

const tenantExpireCertificateDaysLimitData=(expire_certificate_days_limit)=>{
  return expire_certificate_days_limit? expire_certificate_days_limit.value : 30;
};

const cronCertificateReportSubmissioData=(cron_certificate_report_submission)=>{
  return cron_certificate_report_submission ? cron_certificate_report_submission.value : '10:00';
};

const accountArrayData=(accountIds,results)=>{
  return accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let expire_certificate_days_limit = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.expire_certificate_days_limit);
    let cron_certificate_report_submission = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_certificate_report_submission);

    let tenantDbConnString=tenantDbConnStringData(tenant_db_connection_string);
    let tenantTimeZone=tenantTimeZoneData(time_zone);
    let dateTimeFormat=tenantDateTimeFormatData(date_time_format);
    let dateFormat=tenantDateFormatData(date_format);
    let expireCertificateDaysLimit=tenantExpireCertificateDaysLimitData(expire_certificate_days_limit);
    let cronCertificateReportSubmission=cronCertificateReportSubmissioData(cron_certificate_report_submission);

    return {
      account_id                         : id,
      tenant_db_connection_string        : tenantDbConnString ,
      time_zone                          : tenantTimeZone,
      date_time_format                   : dateTimeFormat,
      date_format                        : dateFormat,
      expire_certificate_days_limit      : expireCertificateDaysLimit,
      cron_certificate_report_submission : cronCertificateReportSubmission
    };
  })  : [];
};

const timeZone=(item)=>{
  return item.time_zone ? item.time_zone : '';
};

const startDateData=(cronJob)=>{
  return cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
};

const expireDateData=(sht1)=>{
  return sht1.expiry_date ? getDateTimeSpecificTimeZone(sht1.expiry_date,'YYYY-MM-DD HH:mm:ss') : '';
};

const expireDateData2=(sht2)=>{
  return sht2.expiry_date ? getDateTimeSpecificTimeZone(sht2.expiry_date,'YYYY-MM-DD HH:mm:ss') : '';
};

const resultDetailsData=(result,expire_certificate_days_limit,tenantConnection)=>{
  if(result.length > 0)
  {
    for(const receipient of result)
    {
      let locations = receipient.locations;
      let userId = receipient.user_id;
      const abouttoExpCertEmployeeList =  sails.sendNativeQuery(`SELECT CONCAT(u1.first_name," ",u1.last_name) as name, u1.phone, u1.email, ep.team_member_id,
      ct.name AS certificate, ec.expiry_date, CONCAT(u2.first_name," ",u2.last_name) as added_by
      FROM employee_certificate AS ec
      INNER JOIN certificate_type AS ct ON ec.certificate_type_id = ct.certificate_type_id
      INNER JOIN employee_profile AS ep ON ec.employee_profile_id = ep.employee_profile_id
      INNER JOIN employee_location AS el ON ep.employee_profile_id = el.employee_profile_id
      INNER JOIN ${process.env.DB_NAME}.user AS u1 ON ep.user_id = u1.user_id
      INNER JOIN ${process.env.DB_NAME}.user AS u2 ON ec.added_by = u2.user_id
      where el.location_id IN (${locations}) AND u1.status = 'Active'
      AND ec.expiry_date > NOW() + INTERVAL ${expire_certificate_days_limit} day 
      GROUP BY ec.employee_certificate_id
      ORDER BY ec.expiry_date ASC`).usingConnection(tenantConnection);
      const aboutToExpCertificate = abouttoExpCertEmployeeList.rows;
      const sheet1 = aboutToExpCertificate.map((sht1)=>{
        return {
          'ID'          : sht1.team_member_id,
          'Name'        : sht1.name,
          'Phone'       : sht1.phone,
          'Email'       : sht1.email,
          'Certificate' : sht1.certificate,
          'Expiry Date' : expireDateData(sht1),
          'Added By'    : sht1.added_by,
        };
      });

      const expiredCertEmployeeList =  sails.sendNativeQuery(`SELECT CONCAT(u1.first_name," ",u1.last_name) as name, u1.phone, u1.email, ep.team_member_id,
      ct.name AS certificate, ec.expiry_date, CONCAT(u2.first_name," ",u2.last_name) as added_by
      FROM employee_certificate AS ec
      INNER JOIN certificate_type AS ct ON ec.certificate_type_id = ct.certificate_type_id
      INNER JOIN employee_profile AS ep ON ec.employee_profile_id = ep.employee_profile_id
      INNER JOIN employee_location AS el ON ep.employee_profile_id = el.employee_profile_id
      INNER JOIN ${process.env.DB_NAME}.user AS u1 ON ep.user_id = u1.user_id
      INNER JOIN ${process.env.DB_NAME}.user AS u2 ON ec.added_by = u2.user_id
      where el.location_id IN (${locations}) AND u1.status = 'Active'
      AND ec.expiry_date < NOW() 
      GROUP BY ec.employee_certificate_id
      ORDER BY ec.expiry_date ASC`).usingConnection(tenantConnection);
      const expiredCertificate = expiredCertEmployeeList.rows;
      const sheet2 = expiredCertificate.map((sht2)=>{
        return {
          'ID'          : sht2.team_member_id,
          'Name'        : sht2.name,
          'Phone'       : sht2.phone,
          'Email'       : sht2.email,
          'Certificate' : sht2.certificate,
          'Expiry Date' : expireDateData2(sht2),
          'Added By'    : sht2.added_by,
        };
      });

      return  sendNotification(null,{
        notification_entity : NOTIFICATION_ENTITIES.CERTIFICATE_REPORT_DIGEST,
        timezone            : timezone,
        userId              : userId,
        sheet1Data          : sheet1,
        sheet2Data          : sheet2,
        name                : receipient.user,
        email               : receipient.email,
        employee_profile_id : receipient.employee_profile_id,
        account_id          : item.account_id,
      });
    }
  }
};

const tryCatchFinallyData=async(tenantConnection,currentDate,expire_certificate_days_limit,cronJob)=>{
  let obj1={};
  try{
    /* Fetch all receipient users who have access of monthly certificate expire report get*/
    const getReceipient = await sails.sendNativeQuery(`SELECT CONCAT(u.first_name," ",u.last_name) as user, u.user_id, u.email, ep.employee_profile_id, 
                              (SELECT GROUP_CONCAT(el.location_id) FROM employee_location AS el WHERE el.employee_profile_id = ep.employee_profile_id) AS locations  
                              FROM ${process.env.DB_NAME}.user AS u
                              INNER JOIN employee_profile AS ep ON u.user_id = ep.user_id
                              INNER JOIN role_permission AS rp ON ep.role_id = rp.role_id
                              INNER JOIN permission AS p ON rp.permission_id = p.permission_id AND p.code = '${PERMISSIONS.RECEIVE_CERTIFICATE_REPORT_DIGEST}'
                              where u.status = 'Active' ORDER BY u.user_id ASC`).usingConnection(tenantConnection);
    const result = getReceipient.rows;
    resultDetailsData(result,expire_certificate_days_limit,tenantConnection);

    CronJob.update({ code: CRON_JOB_CODE.monthly_certificate_expire },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
    obj1 = {
      status : 'Success',
      error  : ''
    };
    return obj1;
  }
  catch(error){
    sails.log(error);
    obj1 = {
      status : 'Failure',
      error  : `Error : ${error.message}`
    };
    return obj1;
  }finally {
    CronJobLog.create({
      cron_job_id   : cronJob.cron_job_id,
      status        : obj1.status,
      start_date    : currentDate,
      end_date      : getDateUTC(),
      error_message : obj1.error
    }).usingConnection(tenantConnection);
  }
};

const _monthlyReport =async (curentTimeUTC,checkTenantTimezone ) => {
  sails.log.debug('Report Submission Cron Execution Start');
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
      account_configuration_detail.code IN ($1,$2,$3,$4,$5,$6) and account.status = $7;`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.expire_certificate_days_limit,ACCOUNT_CONFIG_CODE.cron_certificate_report_submission, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountArrayData(accountIds,results);

  for(const item of accountArray)
  {
    let timezone = timeZone(item);

    let expire_certificate_days_limit = item.expire_certificate_days_limit;
    let dateNumber = getDateNumber(curentTimeUTC, timezone,'DD/MM/YYYY');
    let dayNum = dateNumber.split('/')[0];
    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');
    if(!item.tenant_db_connection_string && timezone === '' && dayNum !== item.receive_360feedback_report_on && checkTenantTimezone && tenantTime !== item.cron_certificate_report_submission) {continue;}

    let connectionString = item.tenant_db_connection_string;
    if(connectionString){
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let tenantConnection = await  mysql.createConnection(connectionString);
      await tenantConnection.connect();
      let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.monthly_certificate_expire }).usingConnection(tenantConnection);

      if(cronJob){
        let currentDate = getDateUTC();
        let start_date = startDateData(cronJob);
        sails.log(start_date);

        await tryCatchFinallyData(tenantConnection,currentDate,expire_certificate_days_limit,cronJob);
      }else{
      // No Cron Jon with code Employee Report Expire
        sails.log('No Cron Jon with code certificate expire');
      }


      if(tenantConnection){
        await tenantConnection.end();
      }
    }
  }
};

module.exports = {
  monthlyReport : _monthlyReport,
  trigger       : async (_req,res) => {
    let curentTimeUTC = getDateUTC();
    await _monthlyReport(curentTimeUTC,false);
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  },
};
