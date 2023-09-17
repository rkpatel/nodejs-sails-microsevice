/* eslint-disable no-unused-vars */

/***************************************************************************

  Controller     : Announcement

  **************************************************
  Functions
  **************************************************

  _announcementCron
  **************************************************

***************************************************************************/
const { RESPONSE_STATUS, ACCOUNT_STATUS, ANNOUNCEMENT_STATUS, ANNOUNCEMENT_TYPE, ACCOUNT_CONFIG_CODE, CRON_JOB_CODE, NOTIFICATION_ENTITIES, PERMISSIONS} = require('../utils/constants/enums');
const { getDateUTC, getDateSpecificTimeZone, getDateTimeSpecificTimeZone, getNexttime } = require('../utils/common/getDateTime');
const { escapeSqlSearch } = require('../services/utils');
const moment = require('moment');
const { sendNotification } = require('../services/sendNotification');

const checkTenantConnection = (tenant_db_connection_string) => {
  return tenant_db_connection_string ? tenant_db_connection_string.value : '';
};
const checkTimeZone = (time_zone) => {
  return time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE;
};
const checkDateTimeFormat = (date_time_format) => {
  return date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT;
};
const checkDateFormat = (date_format) => {
  return date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT;
};
const checkCronAnnouncement = (cron_announcement) => {
  return cron_announcement? cron_announcement.value : process.env.CRON_ANNOUNCEMENT;
};
const checkCronAnnouncementOn = (cron_announcement_on) => {
  return cron_announcement_on? cron_announcement_on.value : 'Monday';
};
const lastProcessingDate = async(cronJob) => {
  return cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
};
let getEmployeeWithLocation = async (locationId,tenantConnection) => {

  let empWithLocsql = `SELECT ep.employee_profile_id,ep.user_id,group_concat(el.location_id) AS location_id,l.name, user.first_name, user.last_name,user.email, user.phone ,user.emergency_contact_country_id,country.phone_code
  FROM employee_profile AS ep 
  INNER JOIN employee_location AS el 
  ON el.employee_profile_id = ep.employee_profile_id 
  INNER JOIN ${process.env.DB_NAME}.user AS user 
  ON user.user_id= ep.user_id 
  INNER JOIN ${process.env.DB_NAME}.country as country
  ON user.emergency_contact_country_id = country.country_id
  INNER JOIN location AS l 
  ON el.location_id = l.location_id 
  where l.location_id IN (${locationId}) 
  group by ep.employee_profile_id ;`;
  const rawResultannounceBirth = await sails.sendNativeQuery(empWithLocsql).usingConnection(tenantConnection);
  return rawResultannounceBirth.rows;
};
const startedAnnouncementData = async(startedAnnouncements,tenantConnection,item) => {
  if(startedAnnouncements.length > 0){
    for (const index in startedAnnouncements){

      let announcementsql =  `Select * from announcement_employee
      INNER JOIN announcement
        ON announcement_employee.announcement_id = announcement.announcement_id
      where announcement_employee.announcement_id = ${startedAnnouncements[index].announcement_id}`;
      const announcementrawResult = await sails.sendNativeQuery(escapeSqlSearch(announcementsql)).usingConnection(tenantConnection);
      const announcementEmployees = announcementrawResult.rows;

      if(announcementEmployees.length > 0){

        // Below implementation for sending announcement start Notification to all employees
        let empsql = `Select
                  employee_profile_id as receipient_employee_profile_id,
                  user.user_id as receipient_user_id,
                  user.first_name as recipient_first_name,
                  user.last_name as recipient_last_name,
                  user.phone as recipient_phone,
                  user.email as recipient_email
                from employee_profile
                  INNER JOIN ${process.env.DB_NAME}.user
                    ON user.user_id = employee_profile.user_id
                  where
                  employee_profile.employee_profile_id IN (${announcementEmployees.map(emp => emp.employee_profile_id).join(',')});`;

        const emprawResult = await sails.sendNativeQuery(escapeSqlSearch(empsql)).usingConnection(tenantConnection);
        const employees = emprawResult.rows;

        await sendNotification(null,{
          notification_entity      : NOTIFICATION_ENTITIES.CUSTOM_ANNOUNCEMENT,
          employees                : employees,
          account_id               : item.account_id,
          announcement_id          : startedAnnouncements[index].announcement_id,
          announcement_title       : startedAnnouncements[index].name,
          announcement_description : startedAnnouncements[index].description,
          email_noti               : startedAnnouncements[index].email_noti,
          push_noti                : startedAnnouncements[index].push_noti,
          sms_noti                 : startedAnnouncements[index].sms_noti,
        });
      }
    }
  }
};
const rawResultAutoData = async(rawResultAuto) => {
  return rawResultAuto.rows ? rawResultAuto.rows : [];
};
const rawResultBirthData = async(rawResultBirth) => {
  return rawResultBirth.rows ? rawResultBirth.rows : [];
};
const getLocationData = async (data) => {
  const getLocation = [];
  for (const location of data.birthday) {
    getLocation.push(...location.location_id);
  }
  return getLocation;
};
const resultData = (_result, count) => {
  if (_result) {
    count = 1;
  }
  return count;
};
const sendBithdayNoti = async (resultsBirth,birthday,tenantConnection,data,_employees_birthday,item) => {
  if (resultsBirth && birthday && birthday.length) {

    data.birthday = resultsBirth.map((item3) => {
      return {
        ...item3,
        location_id: item3.location_id.split(',')
      };
    });
    let getLocation = await getLocationData(data);
    const uniq = new Set(getLocation.map(e => JSON.stringify(e)));
    const res = Array.from(uniq).map(e => JSON.parse(e));
    if(res && res.length > 0){
      let employeeLoc = await getEmployeeWithLocation(res,tenantConnection);
      for (const user of employeeLoc) {
        let birthdays = data.birthday.filter(birthuser => {
          let count = 0;
          user.location_id.split(',').forEach(item4 => {
            let _result = birthuser.location_id.includes(item4);

            count = resultData(_result, count);
          });
          return count ? true :false;
        });
        _employees_birthday.push({
          employee        : user,
          birthdayNotiEmp : birthdays
        });
      }
      let Empbirthdaydata = {
        notification_entity : NOTIFICATION_ENTITIES.BIRTHDAY_ANNOUNCEMENT,
        birthdays           : _employees_birthday,
        account_id          : item.account_id,
        account_name        : item.account_name.name,
        announcement_id     : birthday[0].announcement_id,
        email_noti          : birthday[0].email_noti,
        push_noti           : birthday[0].push_noti,
        sms_noti            : birthday[0].sms_noti,
      };
      await sendNotification(null, Empbirthdaydata);
    }
  }
};
const resultAnniversaryData = async (rawResultAnniversary) => {
  return rawResultAnniversary.rows ? rawResultAnniversary.rows : [];
};
const checkConditions = async(item,timezone,checkTenantTimezone,tenantTime, tempDate) => {
  let data = true;
  // if(!item.tenant_db_connection_string && timezone === '' && checkTenantTimezone && tenantTime !== item.cron_announcement) {
  //   data = true;
  // }
  let splitDate = tempDate.split(' ');
  let cronDateTime = `${splitDate[0]} ${item.cron_announcement}`;
  const nextDateTime =  getNexttime('30', cronDateTime);
  let splitCronDateTime = nextDateTime.split(' ');
  let nextMinuteTime = splitCronDateTime[1];

  if(item.tenant_db_connection_string && timezone !== '' && tenantTime >= item.cron_announcement && tenantTime < nextMinuteTime) {
    data = false;
  }
  return data;
};
const getAnnLocationData = async(data) => {
  const getAnnLocation = [];
  for (const location of data.anniversary) {
    getAnnLocation.push(...location.location_id);
  }
  return getAnnLocation;
};
const sendAnniNoti = async(resultsAnniversary,anniversary,tenantConnection,data,_employees_anniversary,item) => {
  if (resultsAnniversary && anniversary && anniversary.length) {

    data.anniversary = resultsAnniversary.map((item6) => {
      let location_id= item6.location_id.split(',');
      return {
        ...item6,
        location_id
      };
    });
    const getAnnLocation = await getAnnLocationData(data);
    const uniqAnny = new Set(getAnnLocation.map(e => JSON.stringify(e)));
    const resAnny = Array.from(uniqAnny).map(e => JSON.parse(e));
    if(resAnny && resAnny.length > 0){
      let annyemployeeLoc = await getEmployeeWithLocation(resAnny,tenantConnection);

      for (const user of annyemployeeLoc) {
        let anniversary1 = data.anniversary.filter(anniuser => {
          let count = 0;
          user.location_id.split(',').forEach(item7 => {
            let _result = anniuser.location_id.includes(item7);
            count = resultData(_result, count);
          });
          return count ? true : false;
        });
        _employees_anniversary.push({
          employee           : user,
          anniversaryNotiEmp : anniversary1
        });
      }
    }
    let Empanniversarydata = {
      notification_entity : NOTIFICATION_ENTITIES.WORK_ANNIV_ANNOUNCEMENT,
      anniversary         : _employees_anniversary,
      account_id          : item.account_id,
      account_name        : item.account_name.name,
      announcement_id     : anniversary[0].announcement_id,
      announcement_title  : anniversary[0].announcement_title,
      email_noti          : anniversary[0].email_noti,
      push_noti           : anniversary[0].push_noti,
      sms_noti            : anniversary[0].sms_noti,
    };
    await sendNotification(null, Empanniversarydata);
  }
};
const resultsAboardData = async(rawResultAboard) => {
  return rawResultAboard.rows ? rawResultAboard.rows : [];
};
const AboardData = async(resultsAboard,aboard,tenantConnection,_employees_aboard,data,item) => {
  if (resultsAboard && resultsAboard.length > 0  && aboard && aboard.length) {
    data.aboard = resultsAboard;


    for (const aboardData of data.aboard) {
      let abordEmp = aboardData;
      let locationsName = aboardData.location_name.split(',');
      let locationIds = aboardData.location_id.split(',');
      let employeeLoc1 = await getEmployeeWithLocation(locationIds,tenantConnection);

      _employees_aboard.push({
        locationsName : locationsName,
        locationIds   : locationIds,
        abordEmp      : abordEmp,
        employees     : employeeLoc1
      });
    }

    let Empaboarddata = {
      notification_entity : NOTIFICATION_ENTITIES.WORK_ONBOARD_ANNOUNCEMENT,
      aboard              : _employees_aboard,
      account_id          : item.account_id,
      account_name        : item.account_name.name,
      announcement_id     : aboard[0].announcement_id,
      email_noti          : aboard[0].email_noti,
      push_noti           : aboard[0].push_noti,
      sms_noti            : aboard[0].sms_noti,
      // });
    };
    await sendNotification(null, Empaboarddata);
  }
};

const findTenantConnection = (results,id) => {
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
};
const findTimeZone = (results,id) => {
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
};
const findDateTimeFormate = (results,id) => {
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
};
const findDateFormate = (results,id) => {
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
};
const findCronAnnouncement = (results,id) => {
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_announcement);
};
const findCronAnnouncementOn = (results,id) => {
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_announcement_on);
};
const findAccountName = (results,id) => {
  return results.find(a => a.account_id === id );
};
const timeZoneData = async(item) => {
  return item.time_zone ? item.time_zone : '';
};
const getAboardData = async(resultsAuto) => {
  return resultsAuto.filter(items => items.announcement_type === ANNOUNCEMENT_TYPE.abroad && items.status === ANNOUNCEMENT_STATUS.active);
};
const bithdayData = (resultsAuto) => {
  return resultsAuto.filter(item2 => item2.announcement_type === ANNOUNCEMENT_TYPE.birthday && item2.status === ANNOUNCEMENT_STATUS.active);
};
const anniversaryData = async(resultsAuto) => {
  return resultsAuto.filter(item5 => item5.announcement_type === ANNOUNCEMENT_TYPE.anniversary && item5.status === ANNOUNCEMENT_STATUS.active);
};

const _announcementCron = async (curentTimeUTC,checkTenantTimezone) => {

  sails.log.debug('Announcement Cron Execution Start');
  let sql = `
  SELECT
      account.account_id,
      account.name,
      account_configuration_detail.value,
      account_configuration_detail.code
    from account
    INNER JOIN
      account_configuration ON account.account_id = account_configuration.account_id
    INNER JOIN
      account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
    Where
      account_configuration_detail.code IN ($1,$2,$3,$4,$5,$6) and account.status = $7 ;`;
  const rawResult = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.cron_announcement,ACCOUNT_CONFIG_CODE.cron_announcement_on, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;
  let accountIds = [...new Set(results.map(item => item.account_id))];

  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = findTenantConnection(results,id);
    let time_zone = findTimeZone(results,id);

    let date_time_format = findDateTimeFormate(results,id);
    let date_format = findDateFormate(results,id);
    let cron_announcement = findCronAnnouncement(results,id);
    let cron_announcement_on = findCronAnnouncementOn(results,id);
    let account_name = findAccountName(results,id);
    return {
      account_id                  : id,
      account_name                : account_name,
      tenant_db_connection_string : checkTenantConnection(tenant_db_connection_string),
      time_zone                   : checkTimeZone(time_zone),
      date_time_format            : checkDateTimeFormat(date_time_format),
      date_format                 : checkDateFormat(date_format),
      cron_announcement           : checkCronAnnouncement(cron_announcement),
      cron_announcement_on        : checkCronAnnouncementOn(cron_announcement_on)
    };
  })  : [];

  for(const item of accountArray)
  {

    let timezone = await timeZoneData(item);
    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');

    
    
    // Tenant specific database connection
    let connectionString = item.tenant_db_connection_string;
    let rdi = sails.getDatastore('default');
    let mysql = rdi.driver.mysql;
    let tenantConnection = await  mysql.createConnection(connectionString);
    await tenantConnection.connect();
    
    let CURDATE = getDateSpecificTimeZone(getDateUTC(),timezone,'YYYY-MM-DD');
    
    // start: update announcement status //
    try{
      const curdate = `UPDATE announcement SET announcement.announcement_status = '${ANNOUNCEMENT_STATUS.scheduled}' where announcement.start_date > '${CURDATE}' and announcement_status != '${ANNOUNCEMENT_STATUS.inactive}' `;
      await sails.sendNativeQuery(curdate).usingConnection(tenantConnection);

      const ongoingSql = `Update announcement SET announcement_status = '${ANNOUNCEMENT_STATUS.active}' where start_date <= '${CURDATE}' and end_date >= '${CURDATE}' and announcement_status != '${ANNOUNCEMENT_STATUS.inactive}'`;
      await sails.sendNativeQuery(escapeSqlSearch(ongoingSql)).usingConnection(tenantConnection);

      const CompletedSql = `Update announcement SET announcement_status = '${ANNOUNCEMENT_STATUS.expired}' where end_date < '${CURDATE}' and announcement_status != '${ANNOUNCEMENT_STATUS.inactive}'`;
      await sails.sendNativeQuery(escapeSqlSearch(CompletedSql)).usingConnection(tenantConnection);
    }catch(error){
      sails.log('error',error);
    }  
    // end: update announcement status //
    let cond = await checkConditions(item,timezone,checkTenantTimezone,tenantTime, CURDATE);
  
    if(cond){continue;}
    let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.announcement_trigger }).usingConnection(tenantConnection);

    if(cronJob){
      
      let currentDate = getDateUTC();
      let obj;
      let start_date = await lastProcessingDate(cronJob);
      sails.log(start_date);

      try{
        
        let startedAnnSql = `SELECT * FROM announcement where DATE(start_date) = '${CURDATE}' and (announcement_status = '${ANNOUNCEMENT_STATUS.scheduled}' OR announcement_status = '${ANNOUNCEMENT_STATUS.active}');`;
        let _startedAnnouncements = await sails.sendNativeQuery(startedAnnSql).usingConnection(tenantConnection);
        const startedAnnouncements = _startedAnnouncements.rows;

        await startedAnnouncementData(startedAnnouncements,tenantConnection,item);
        // Get all employee of specific locations;

        let _employees_birthday = [];
        let _employees_anniversary = [];
        let _employees_aboard = [];

        let data = {
          birthday    : [],
          anniversary : [],
          aboard      : []
        };
        // get date from current timezone date
        let _currentDate = getDateSpecificTimeZone(getDateUTC(),timezone,'YYYY-MM-DD');
        let day = moment(_currentDate).format('dddd');
        let auto_sql = `Select announcement_id, name, description, announcement_type, status, announcement_status,push_noti,email_noti,sms_noti from announcement where is_default=1`;
        const rawResultAuto = await sails.sendNativeQuery(`${auto_sql};`).usingConnection(tenantConnection);
        const resultsAuto = await rawResultAutoData(rawResultAuto);
        // start Birthday announcment
        // start Birthday announcment
        if(day === item.cron_announcement_on && tenantTime === item.cron_announcement){
          let curWeekStartDate = _currentDate;
          let curWeekEndDate = moment(_currentDate).add(1, 'w').format('YYYY-MM-DD');
          let sql_birth = `SELECT ep.employee_profile_id,u.user_id, u.email, u.first_name, u.last_name,GROUP_CONCAT(location.location_id) as location_id, u.profile_picture_thumbnail_url, u.phone
           FROM employee_profile AS ep
           INNER JOIN ${process.env.DB_NAME}.user AS u
             ON u.user_id = ep.user_id
           INNER JOIN employee_location
             ON employee_location.employee_profile_id = ep.employee_profile_id
           INNER JOIN location AS location
             ON employee_location.location_id = location.location_id
           where
           Date(date_format(concat(YEAR(CURRENT_DATE()),RIGHT(u.date_of_birth,6)),'%Y-%m-%d')) between date_format(concat(YEAR(CURRENT_DATE()),RIGHT('${curWeekStartDate}',6)),'%Y-%m-%d') and  date_format(concat(YEAR(CURRENT_DATE()),RIGHT('${curWeekEndDate}',6)),'%Y-%m-%d') AND
             u.status = '${ACCOUNT_STATUS.active}' and
             ep.status = '${ACCOUNT_STATUS.active}' group by ep.employee_profile_id`;
          const rawResultBirth = await sails.sendNativeQuery(sql_birth).usingConnection(tenantConnection);

          const resultsBirth = await rawResultBirthData(rawResultBirth);

          let birthday = await bithdayData(resultsAuto);


          await sendBithdayNoti(resultsBirth,birthday,tenantConnection,data,_employees_birthday,item);

          // end birthday announcment

          // start anniversary announcment
          let sql_anniversary = `SELECT ep.employee_profile_id,u.user_id, u.email, u.first_name, u.last_name,GROUP_CONCAT(location.location_id) as location_id, u.profile_picture_thumbnail_url, u.phone
             FROM employee_profile AS ep
             INNER JOIN ${process.env.DB_NAME}.user AS u
               ON u.user_id = ep.user_id
             LEFT JOIN employee_location
               ON employee_location.employee_profile_id = ep.employee_profile_id
             INNER JOIN location AS location
               ON employee_location.location_id = location.location_id
             where
             Date(date_format(concat(YEAR(CURRENT_DATE()),RIGHT(Date(ep.date_of_joining),6)),'%Y-%m-%d')) between date_format(concat(YEAR(CURRENT_DATE()),RIGHT('${curWeekStartDate}',6)),'%Y-%m-%d') and  date_format(concat(YEAR(CURRENT_DATE()),RIGHT('${curWeekEndDate}',6)),'%Y-%m-%d') AND
               u.status = '${ACCOUNT_STATUS.active}' and
               YEAR(ep.date_of_joining) != YEAR('${_currentDate}') and
               ep.status = '${ACCOUNT_STATUS.active}' group by ep.employee_profile_id `;
          const rawResultAnniversary = await sails.sendNativeQuery(sql_anniversary).usingConnection(tenantConnection);

          const resultsAnniversary = await resultAnniversaryData(rawResultAnniversary);
          let anniversary = await anniversaryData(resultsAuto);

          await sendAnniNoti(resultsAnniversary,anniversary,tenantConnection,data,_employees_anniversary,item);
        }
        // end anniversary announcment
        if(tenantTime === '09:00'){
        // start onboard announcment

          let sql_aboard = `SELECT ep.employee_profile_id,u.user_id, u.email, u.first_name, u.last_name,GROUP_CONCAT(location.name) as location_name, GROUP_CONCAT(location.location_id) as location_id, u.phone ,u.profile_picture_thumbnail_url
       FROM employee_profile AS ep
       INNER JOIN ${process.env.DB_NAME}.user AS u
       ON u.user_id = ep.user_id
       LEFT JOIN employee_location
         ON employee_location.employee_profile_id = ep.employee_profile_id
       INNER JOIN location AS location
         ON employee_location.location_id = location.location_id
       where
         u.aboard_date LIKE '%${_currentDate}%' and
         u.status = '${ACCOUNT_STATUS.active}' and
         ep.status = '${ACCOUNT_STATUS.active}' group by ep.employee_profile_id `;

          const rawResultAboard = await sails.sendNativeQuery(`${sql_aboard};`).usingConnection(tenantConnection);

          const resultsAboard = await resultsAboardData(rawResultAboard);

          let aboard = await getAboardData(resultsAuto);
          await AboardData(resultsAboard,aboard,tenantConnection,_employees_aboard,data,item);

        // end onboard announcment
        }

        await CronJob.update({ code: CRON_JOB_CODE.announcement_trigger },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
        obj = {
          status : 'Success',
          error  : ''
        };

      }catch(error){
        sails.log('error',error);
        obj = {
          status : 'Failure',
          error  : `Error : ${error.message}`
        };
      }finally {
        await CronJobLog.create({
          cron_job_id   : cronJob.cron_job_id,
          status        : obj.status,
          start_date    : currentDate,
          end_date      : getDateUTC(),
          error_message : obj.error
        }).usingConnection(tenantConnection);
      }
    }else{
      sails.log('No Cron Jon with code Announcement Trigger');
    }

    if(tenantConnection){
      await tenantConnection.end();
    }
  }

  sails.log.debug('Announcement Cron Execution End');

};

module.exports = {
  announcementCron : _announcementCron,
  trigger          : async(_req, res) => {
    let curentTimeUTC = getDateUTC();
    await _announcementCron(curentTimeUTC, false);
    return res.ok(undefined, 'Triggered SuccessFully', RESPONSE_STATUS.success);
  }
};
