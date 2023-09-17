/* eslint-disable no-unused-vars */

/***************************************************************************

  Controller     : Announcement

  **************************************************
  Functions
  **************************************************

  add
  edit
  find
  **************************************************

***************************************************************************/
const messages = sails.config.globals.messages;
const AnnouncementValidation = require('../validations/AnnouncementValidation');
const { RESPONSE_STATUS, ACCOUNT_STATUS, ANNOUNCEMENT_STATUS, ANNOUNCEMENT_TYPE, ACCOUNT_CONFIG_CODE, NOTIFICATION_ENTITIES, PERMISSIONS} = require('../utils/constants/enums');
const { getDateUTC, formatDate, getDateSpecificTimeZone, getDateTimeSpecificTimeZone } = require('../utils/common/getDateTime');
const { commonListing, escapeSqlSearch } = require('../services/utils');
const moment = require('moment');
const { sendNotification } = require('../services/sendNotification');

const paginate = (array, page_size, page_number) => {
  return array.slice(page_number * page_size, page_number * page_size + page_size);
};

const checkPermissionExistForUser = (_permissionList, _permission)=>{
  if (_permissionList && _permissionList.length > 0) {
    let index = _permissionList.findIndex(permission => permission.code === _permission);
    return index !== -1;
  }else{
    return false;
  }
};

const getEmployeeDetails = async function(req, announcement_id) {
  let results = '';
  let sql = `SELECT
              ep.employee_profile_id,
              CONCAT(u.first_name, " ", u.last_name) AS name,
              (SELECT GROUP_CONCAT(ejt.job_type_id) FROM employee_job_type AS ejt
              WHERE ejt.employee_profile_id = ep.employee_profile_id) AS job_types,
              (SELECT GROUP_CONCAT(el.location_id) FROM employee_location AS el
              WHERE el.employee_profile_id = ep.employee_profile_id) AS locations
              FROM announcement_employee AS ae
              LEFT JOIN employee_profile AS ep ON ep.employee_profile_id = ae.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
              WHERE ae.announcement_id = ${announcement_id} `;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData = [];
  for (let i of results) {
    responseData.push({
      employee_profile_id : i.employee_profile_id,
      name                : i.name,
      job_types           : i.job_types ? i.job_types.split `,`.map(x => +x) : [],
      locations           : i.locations ? i.locations.split `,`.map(x => +x) : [],
    });
  }

  return responseData;
};

const getStatus = function(start_date, end_date, timezone) {
  let cDate = new Date();
  //let currentDate = cDate.toISOString().split('T')[0];

  let currentDate = getDateSpecificTimeZone(getDateUTC(), timezone, 'YYYY-MM-DD');
  let sDate = new Date(start_date);
  let startDate = sDate.toISOString().split('T')[0];
  let eDate = new Date(end_date);
  let endDate = eDate.toISOString().split('T')[0];
  let status = '';

  if (startDate > currentDate) {
    status = ANNOUNCEMENT_STATUS.scheduled;
  } else if (startDate <= currentDate && endDate >= currentDate) {
    status = ANNOUNCEMENT_STATUS.active;
  } else if (endDate < currentDate) {
    status = ANNOUNCEMENT_STATUS.expired;
  } else {
    status = ANNOUNCEMENT_STATUS.inactive;
  }
  return status;
};
const getLocationDetails = async function(req, location_ids){
  let results = '';
  let sql = `SELECT location_id, name FROM location WHERE location_id IN (${location_ids})`;
  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for (let i of results) {
    responseData.push({
      location_id : i.location_id,
      name        : i.name
    });
  }
  return responseData;
};

const getJobTypeDetails = async function(req, job_type_ids){
  let results = '';
  let sql = `SELECT job_type_id, name, color FROM job_type WHERE job_type_id IN (${job_type_ids})`;
  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for (let i of results) {
    responseData.push({
      job_type_id : i.job_type_id,
      name        : i.name,
      color       : i.color
    });
  }
  return responseData;
};

const isDate=async(isTodaysDate,announcement_status)=>{
  if (isTodaysDate) {
    announcement_status= ANNOUNCEMENT_STATUS.active;
  }
  return announcement_status;
};

const jobLocationEmp=async(employees_arr,locations_arr,job_types_arr,req)=>{
  if (employees_arr.length > 0) {
    await AnnouncementEmployee.createEach(employees_arr).usingConnection(req.dynamic_connection);
  }
  if (locations_arr.length > 0) {
    await AnnouncementLocation.createEach(locations_arr).usingConnection(req.dynamic_connection);
  }
  if (job_types_arr.length > 0) {
    await AnnouncementJobType.createEach(job_types_arr).usingConnection(req.dynamic_connection);
  }
};

const emailNotification=async(result)=>{
  return result.email_noti ? true : false;
};

const smsNotification=async(result)=>{
  return result.sms_noti ? true : false;
};

const pushNotification=async(result)=>{
  return result.push_noti ? true : false;
};

const notiEndDate=async(result,req)=>{
  return result.end_date ? formatDate(result.end_date, req.dateFormat) : '';
};

const notiStartDate=async(result,req)=>{
  return result.start_date ? formatDate(result.start_date, req.dateFormat) : '';
};

const jobTypDatas=async(result,req)=>{
  return result.job_types ?  getJobTypeDetails(req, result.job_types) : [];
};

const locDatas=async(result,req)=>{
  return result.locations ?  getLocationDetails(req, result.locations) : [];
};

const jobTypIdDatas=async(result)=>{
  return result.job_types ? result.job_types.split `,`.map(x => +x) : [];
};

const locationIdDatas=async(result)=>{
  return result.locations ? result.locations.split `,`.map(x => +x) : [];
};

const empDatas=async(result,req)=>{
  return result.announcement_id ?  getEmployeeDetails(req, result.announcement_id) : [];
};

const customAnnouncementDatas=async(result,req)=>{
  if (result) {
    return result.map(item => {
      return {
        announcement_id     : item.announcement_id,
        name                : item.name,
        description         : item.description ? item.description : '',
        start_date          : item.start_date ? formatDate(item.start_date, req.dateFormat) : '',
        end_date            : item.end_date ? formatDate(item.end_date, req.dateFormat) : '',
        created_by          : item.created_by,
        created_date        : item.created_date ? formatDate(item.created_date, req.dateFormat) : '',
        announcement_status : item.announcement_status,
        announcement_type   : item.announcement_type
      };
    });
  }
};

const resultLengthData=async(rawResultlength)=>{
  return rawResultlength.rows ? rawResultlength.rows.length : 0;
};

const birthdayResultData=async(rawResultBirth)=>{
  return rawResultBirth.rows ? rawResultBirth.rows : [];
};

const annivResultData=async(rawResultAnniv)=>{
  return rawResultAnniv.rows ? rawResultAnniv.rows : [];
};

const aboardResultData=async(rawResultAboard)=>{
  return rawResultAboard.rows ? rawResultAboard.rows : [];
};

const birtdayAnniverssaryAboard=(resultsBirth,resultsAnniv,resultsAboard,_result,data,resultsAuto)=>{
  let birthday = resultsAuto.filter(item => item.announcement_type === ANNOUNCEMENT_TYPE.birthday && item.announcement_status === ANNOUNCEMENT_STATUS.active);
  let workanniv = resultsAuto.filter(item => item.announcement_type === ANNOUNCEMENT_TYPE.anniversary && item.announcement_status === ANNOUNCEMENT_STATUS.active);
  let aboard = resultsAuto.filter(item => item.announcement_type === ANNOUNCEMENT_TYPE.abroad && item.announcement_status === ANNOUNCEMENT_STATUS.active);

  if (resultsBirth && birthday && birthday.length) {
    _result = _result + resultsBirth.length;
    data.birthday = resultsBirth;
  }
  if (resultsAnniv && workanniv && workanniv.length) {
    _result = _result + resultsAnniv.length;
    data.anniversary = resultsAnniv;
  }
  if (resultsAboard && aboard && aboard.length) {
    _result = _result + resultsAboard.length;
    data.aboard = resultsAboard;
  }
  data.totalRecords = _result;
  return data;
};
const jobTypeSql = async(findQuery,sql) => {
  if ((findQuery.andCondition).length > 0) {
    const andPayload = findQuery.andCondition;
    for (const payloadData of andPayload) {
      Object.keys(payloadData).forEach((prop) => {

        if (prop === 'job_types' && (payloadData[prop]).length > 0) {
          sql = sql +` LEFT JOIN  announcement_job_type ON a.announcement_id = announcement_job_type.announcement_id`;
        }
      }
      );}
  }
  return sql;
};

const filterSql = async (filter,sql,findQuery) => {
  if (filter.includes('announcement_status')) {
    sql = sql + ` ORDER BY is_default DESC , end_date ASC `;
  } else if (findQuery.sort.includes('created_by')) {
    let _f = findQuery.sort;
    _f = _f.replace('created_by', 'u.first_name');
    sql = sql + ` ORDER BY is_default DESC, announcement_status_enum.sort_order ASC, end_date ASC,  ${_f} `;
  } else if (findQuery.sort.includes('start_date')) {
    sql = sql + ` ORDER BY is_default DESC, announcement_status_enum.sort_order ASC, ${findQuery.sort} `;
  } else {
    sql = sql + ` ORDER BY is_default DESC, announcement_status_enum.sort_order ASC, end_date ASC,  ${findQuery.sort} `;
  }
  return sql;
};
const startDatCond = async (item,req) => {
  return item.start_date ? formatDate(item.start_date, req.dateFormat) : '';
};
const endDatCond = async (item,req) => {
  return item.end_date ? formatDate(item.end_date, req.dateFormat) : '';
};
const emailNotiCond = async (item) => {
  return item.email_noti ? true : false;
};
const smsNotiCond = async (item) => {
  return item.sms_noti ? true : false;
};
const pushNotiCond = async (item) => {
  return item.push_noti ? true : false;
};
const locationCond = async (item,req) => {
  if(item.locations !== '' && item.locations !== null){
    const locationSql = `select location_id,name from location where location_id IN (${item.locations.split(',')})`;
    let locationList = await sails.sendNativeQuery(escapeSqlSearch(locationSql)).usingConnection(req.dynamic_connection);
    return locationList ? locationList.rows : [];
  } else {
    return [];
  }
};
const jobTypeCond = async (item,req) => {
  if(item.job_types !== '' && item.job_types !== null){
    const jobTypeListSql = `select job_type_id,name from job_type where job_type_id IN (${item.job_types.split(',')})`;
    let jobTypeList = await sails.sendNativeQuery(escapeSqlSearch(jobTypeListSql)).usingConnection(req.dynamic_connection);
    return jobTypeList ? jobTypeList.rows : [];
  } else {
    return [];
  }
};
const annoucementStatus=(start_date,end_date, timezone)=>{
  return start_date ? getStatus(start_date, end_date, timezone) : '';
};

const jobTypeListData=(jobTypeList)=>{
  return jobTypeList.rows ? jobTypeList.rows : [];
};

const handleStatusActivation = (checkExists, timezone) => {
  let chk = checkExists.start_date ? getStatus(checkExists.start_date, checkExists.end_date, timezone) : ANNOUNCEMENT_STATUS.active;
  let set_status = (chk !== ANNOUNCEMENT_STATUS.inactive) ? chk : ANNOUNCEMENT_STATUS.active;
  let _message = messages.ACTIVE_ANNOUNCMENT_SUCCESS;
  return [set_status, _message];
};

const handleMultiCondition=(andPayload,sql,filter)=>{
  for (const payloadData of andPayload) {
    Object.keys(payloadData).forEach((prop) => {
      if ((prop === 'locations') && (payloadData[prop]).length > 0) {
        let locationPayload = payloadData[prop];
        const locationName = locationPayload.map(c => `'${c}'`).join(', ');
        const locationId = '(' + locationName + ')';
        sql = sql + ` AND announcement_location.location_id IN ${locationId}`;
      }
      else if ((prop === 'job_types') && (payloadData[prop]).length > 0) {
        let jobtypePayload = payloadData[prop];
        const jobtypeName = jobtypePayload.map(c => `'${c}'`).join(', ');
        const jobtypeId = '(' + jobtypeName + ')';
        sql = sql + ` AND announcement_job_type.job_type_id IN ${jobtypeId}`;
      }
      else if ((prop === 'name') && (payloadData[prop] !== '')) {
        sql = sql + ` AND a.name LIKE '%${escapeSqlSearch(payloadData[prop])}%'`;
      }
      else if ((prop === 'announcement_status') && (payloadData[prop] !== '')) {
        sql = sql + ` AND a.announcement_status = '${payloadData[prop]}'`;
        filter.push('announcement_status');
      }
      else if ((prop === 'announcement_type') && (payloadData[prop] !== '')) {
        let announcement_type = payloadData[prop];
        if (announcement_type === 'Birthday') {
          announcement_type = ANNOUNCEMENT_TYPE.birthday;
        } else if (announcement_type === 'Work Anniversary') {
          announcement_type = ANNOUNCEMENT_TYPE.anniversary;
        } else if (announcement_type === 'Welcome Aboard') {
          announcement_type = ANNOUNCEMENT_TYPE.abroad;
        }
        sql = sql + ` AND a.announcement_type = '${announcement_type}'`;
      }
      else if((prop === 'created_by') && (payloadData[prop] !== '')){
        sql = sql + ` AND CONCAT(u.first_name, " ", u.last_name) LIKE '%${escapeSqlSearch(payloadData[prop])}%'`;
      }
      else if (prop === 'start_date') {
        if ((payloadData[prop].from_date !== '') && (payloadData[prop].to_date !== '')) {
          const startDate = moment(payloadData[prop].from_date).format('YYYY-MM-DD');
          const endDate = moment(payloadData[prop].to_date).format('YYYY-MM-DD');
          sql = sql + ` AND (a.${prop} BETWEEN ('${startDate}') AND ('${endDate}'))`;
        }
      }
      else if (prop === 'end_date') {
        if ((payloadData[prop].from_date !== '') && (payloadData[prop].to_date !== '')) {
          const startDate1 = moment(payloadData[prop].from_date).format('YYYY-MM-DD');
          const endDate1 = moment(payloadData[prop].to_date).format('YYYY-MM-DD');
          sql = sql + ` AND (a.${prop} BETWEEN ('${startDate1}') AND ('${endDate1}'))`;
        }
      }
    });
  }
  return [sql,filter];
};

module.exports = {
  add: async(req, res) => {
    try {
      let request = req.allParams();
      const isValid = await AnnouncementValidation.addEdit.validate(request);
      if (!isValid.error) {
        const { name, short_description, description, start_date, end_date, employees, locations, job_types, email_notification, push_notification, sms_notification } = req.allParams();
        let sDate = new Date(start_date);
        let startDate = sDate.toISOString().split('T')[0];
        let eDate = new Date(end_date);
        let endDate = eDate.toISOString().split('T')[0];

        let announcement_status = ANNOUNCEMENT_STATUS.scheduled;
        if (endDate >= startDate) {
          let isTodaysDate = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD') === startDate;

          announcement_status = await isDate(isTodaysDate,announcement_status);
          const newAnnouncement = await Announcement.create({
            name,
            short_description,
            description,
            start_date,
            end_date,
            email_noti          : email_notification,
            sms_noti            : sms_notification,
            push_noti           : push_notification,
            announcement_status : announcement_status,
            announcement_type   : ANNOUNCEMENT_TYPE.custom,
            status              : ACCOUNT_STATUS.active,
            created_by          : req.user.user_id,
            last_updated_by     : null,
            created_date        : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          const announcementId = newAnnouncement.announcement_id;

          const employees_arr = employees.map((employee_id) => { return { announcement_id: announcementId, employee_profile_id: employee_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
          const locations_arr = locations.map((location_id) => { return { announcement_id: announcementId, location_id: location_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
          const job_types_arr = job_types.map((job_type_id) => { return { announcement_id: announcementId, job_type_id: job_type_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
          await jobLocationEmp(employees_arr,locations_arr,job_types_arr,req);
          const locationSql = `select location_id,name from location where location_id IN (${locations.join(',')})`;
          const jobTypeListSql = `select job_type_id,name from job_type where job_type_id IN (${job_types.join(',')})`;
          const findCreatedUser =   `select concat(first_name,' ',last_name) as created_by from ${process.env.DB_NAME}.user where user_id = ${req.user.user_id}`;
          let locationList = await sails.sendNativeQuery(escapeSqlSearch(locationSql)).usingConnection(req.dynamic_connection);
          let jobTypeList = job_types.length > 0 ? await sails.sendNativeQuery(escapeSqlSearch(jobTypeListSql)).usingConnection(req.dynamic_connection) : [];
          let createdUser = await sails.sendNativeQuery(escapeSqlSearch(findCreatedUser)).usingConnection(req.dynamic_connection);

          let accountsql = `SELECT account_configuration_detail.value, account_configuration_detail.code
                      FROM account_configuration
                      INNER JOIN account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
                      WHERE account_configuration_detail.code IN ($1) AND account_configuration.account_id = $2;`;
          const accountRawResult = await sails.sendNativeQuery(accountsql,[ACCOUNT_CONFIG_CODE.cron_announcement, req.account.account_id]);
          const accountResult = accountRawResult.rows[0] || null;
          const cron_announcement = accountResult.value;
          let currentDateTime = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD HH:mm');
          let splitDate = currentDateTime.split(' ');
          let currentTime = splitDate[1];
          if (isTodaysDate && currentTime >= cron_announcement) {
            // Below implementation for sending announcement start Notification to all employees
            let sql = `Select 
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
                employee_profile.employee_profile_id IN (${employees.join(',')});`;

            const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
            const _employees = rawResult.rows;
            if(!req.isExposedApi){
              await sendNotification(null, {
                notification_entity      : NOTIFICATION_ENTITIES.CUSTOM_ANNOUNCEMENT,
                employees                : _employees,
                account_id               : req.account.account_id,
                announcement_id          : announcementId,
                announcement_title       : name,
                announcement_description : description,
                email_noti               : email_notification,
                push_noti                : push_notification,
                sms_noti                 : sms_notification,
              });
            }
          }
          let data = {
            announcement_id     : newAnnouncement.announcement_id,
            name                : newAnnouncement.name,
            start_date          : start_date,
            end_date            : end_date,
            announcement_status : newAnnouncement.announcement_status,
            announcement_type   : newAnnouncement.announcement_type,
            email_notification  : newAnnouncement.email_noti,
            sms_notification    : newAnnouncement.sms_noti,
            push_notification   : newAnnouncement.push_noti,
            status              : newAnnouncement.status,
            locations           : locationList.rows,
            job_types           : jobTypeList.rows ? jobTypeList.rows: [],
            created_by          : createdUser.rows[0].created_by,
            created_date        : getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,
            req.dateTimeFormat)
          };
          return res.ok(data, messages.ADD_SUCCESS, RESPONSE_STATUS.success);
        } else {
          return res.ok(isValid.error, messages.DATE_FAILURE, RESPONSE_STATUS.error);
        }
      } else {
        return res.ok(isValid.error, messages.ADD_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  list: async(req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await AnnouncementValidation.filter.validate(request);
      if (isValidate.error) {
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
      let filter = [];
      const findQuery = await commonListing(request);
      const {employee_profile_id} = req.allParams();
      let employee_id = employee_profile_id ? employee_profile_id : req.empProfile.employee_profile_id;
      let sql = `
          SELECT DISTINCT a.announcement_id, a.name, a.start_date, a.end_date, a.announcement_status, a.email_noti, a.sms_noti, a.push_noti, 
          CASE WHEN announcement_type = 'birthday' THEN 'Birthday'
          WHEN announcement_type = 'anniversary' THEN 'Work Anniversary'
          WHEN announcement_type = 'abroad' THEN 'Welcome Aboard'
          ELSE 'custom' END AS announcement_type,
          a.status, 
          CONCAT(u.first_name, " ", u.last_name) AS createdby,
          (SELECT GROUP_CONCAT(l.location_id) AS location_name
                FROM announcement_location AS al
                INNER JOIN location AS l ON al.location_id = l.location_id
                WHERE al.announcement_id = a.announcement_id LIMIT 3) AS locations,
          (SELECT GROUP_CONCAT(jt.job_type_id) AS job_type
                FROM announcement_job_type AS ajt
                INNER JOIN job_type AS jt ON ajt.job_type_id = jt.job_type_id
                WHERE ajt.announcement_id = a.announcement_id LIMIT 3) AS job_types
          FROM  announcement AS a
            LEFT JOIN employee_profile AS ep ON a.created_by = ep.user_id
            LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
            LEFT JOIN  announcement_location ON a.announcement_id = announcement_location.announcement_id`;


      sql = await jobTypeSql(findQuery,sql);
      sql = sql + ` LEFT JOIN announcement_status_enum 
            ON announcement_status_enum.announcement_status = a.announcement_status
          where a.status != '${ACCOUNT_STATUS.inactive}'
        `;

      if(!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS)){
        const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = ${employee_id}`;
        const rawRes = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
        if(rawRes.length > 0){
          sql = sql + `AND announcement_location.location_id IN ( ${rawRes.rows.map(location => location.location_id) } )`;
        }
      }

      if ((findQuery.andCondition).length > 0) {
        const andPayload = findQuery.andCondition;

        let values = handleMultiCondition(andPayload,sql,filter);
        sql = values[0];
        filter = values[1];
      }

      sql = await  filterSql(filter,sql,findQuery);
      let lengthsql = `SELECT
        COUNT(DISTINCT a.announcement_id) AS announcement_cnt
      FROM
        announcement AS a
        LEFT JOIN employee_profile AS ep ON a.created_by = ep.user_id
        LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
        INNER JOIN announcement_location ON a.announcement_id = announcement_location.announcement_id`;
      lengthsql = await jobTypeSql(findQuery,lengthsql);

      lengthsql = lengthsql + ` LEFT JOIN announcement_status_enum ON announcement_status_enum.announcement_status = a.announcement_status
        WHERE
        a.status != '${ACCOUNT_STATUS.inactive}'`;

      sql = sql + ` limit ${findQuery.rows} offset ${findQuery.skip}`;
      const rawResultLength = await sails
                    .sendNativeQuery(escapeSqlSearch(lengthsql))
                    .usingConnection(req.dynamic_connection);

      const resultsLength = rawResultLength.rows;
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      let result = rawResult.rows;
      let announcementList = [];
      if (result) {

        for (const item of result) {
          let announcement_type = item.announcement_type;
          announcementList.push({
            announcement_id     : item.announcement_id,
            name                : item.name,
            start_date          : await startDatCond(item,req),
            end_date            : await endDatCond(item,req),
            announcement_status : item.announcement_status,
            announcement_type   : announcement_type,
            email_notification  : await emailNotiCond(item),
            sms_notification    : await smsNotiCond(item),
            push_notification   : await pushNotiCond(item),
            status              : item.status,
            locations           : await locationCond(item,req),
            job_types           : await jobTypeCond(item,req),
            created_by          : item.createdby
          });
        }

      }

      let data = {
        list         : announcementList,
        totalResults : resultsLength.length
      };
      return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);


    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  findById: async(req, res) => {
    try {
      sails.log('req.params.id', req.params.id);
      const announcement_id = parseInt(req.params.id);
      const results = await Announcement.findOne({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);
      if (results) {
        let result;
        let sql = `SELECT a.announcement_id, a.name, a.description,a.announcement_type,a.announcement_status, a.start_date, a.end_date, a.status, a.email_noti, a.sms_noti, a.push_noti,
          CONCAT(u.first_name,' ',u.last_name) as created_by,
          (SELECT
            GROUP_CONCAT(location_id) AS location_id
            FROM announcement_location AS al
            WHERE al.announcement_id = a.announcement_id) AS locations,
          (SELECT
            GROUP_CONCAT(job_type_id) AS job_type_id
            FROM announcement_job_type AS ajt
            WHERE ajt.announcement_id = a.announcement_id) AS job_types
          FROM announcement AS a 
          LEFT JOIN ${process.env.DB_NAME}.user AS u ON a.created_by = u.user_id
          WHERE a.announcement_id = ${announcement_id} AND a.status = '${ACCOUNT_STATUS.active}'`;
        sql = sql + ` ORDER BY a.created_date DESC`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        result = rawResult.rows[0] || null;
        if (result) {
          const employees = await empDatas(result,req);
          const location_ids = await locationIdDatas(result);
          const job_type_ids = await jobTypIdDatas(result);
          let announcement_type = result.announcement_type;
          if (announcement_type === ANNOUNCEMENT_TYPE.birthday) {
            result.announcement_type = 'Birthday';
          } else if (announcement_type === ANNOUNCEMENT_TYPE.anniversary) {
            result.announcement_type = 'Work Anniversary';
          } else if (announcement_type === ANNOUNCEMENT_TYPE.abroad) {
            result.announcement_type = 'Welcome Aboard';
          }
          let lData=await locDatas(result,req);
          let jTData=await jobTypDatas(result,req);
          result.start_date =await notiStartDate(result,req);
          result.end_date = await notiEndDate(result,req);
          result.employees = employees;
          result.locationdata = lData;
          result.jobtypedata = jTData;
          result.locations = location_ids;
          result.job_types = job_type_ids;
          result.email_noti = await emailNotification(result);
          result.sms_noti = await smsNotification(result);
          result.push_noti = await pushNotification(result);

          return res.ok(result, messages.GET_RECORD, RESPONSE_STATUS.success);
        }
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  update: async(req, res) => {
    try {
      let request = req.allParams();
      const isValid = await AnnouncementValidation.addEdit.validate(request);
      if (!isValid.error) {
        let announcement_id = request.id;

        const announcementDetail = await Announcement.findOne({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);

        if (announcementDetail) {
          const { name, short_description, description, start_date, end_date, employees, locations, job_types,email_notification, push_notification, sms_notification } = req.allParams();
          let sDate = new Date(start_date);
          let startDate = sDate.toISOString().split('T')[0];
          let eDate = new Date(end_date);
          let endDate = eDate.toISOString().split('T')[0];

          if (endDate >= startDate) {
            const announcementEmployees = await AnnouncementEmployee.find({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);
            let existingEmployees = announcementEmployees.map(x => x.employee_profile_id);
            let unionEmployee = [...new Set([...employees, ...existingEmployees])];
            let addEmployees = unionEmployee.filter(x => !existingEmployees.includes(x));
            let removeEmployees = unionEmployee.filter(x => !employees.includes(x));

            const announcementLocations = await AnnouncementLocation.find({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);
            let existingLocations = announcementLocations.map(x => x.location_id);
            let unionLocation = [...new Set([...locations, ...existingLocations])];
            let addLocations = unionLocation.filter(x => !existingLocations.includes(x));
            let removeLocations = unionLocation.filter(x => !locations.includes(x));

            const announcementJobTypes = await AnnouncementJobType.find({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);
            let existingJobTypes = announcementJobTypes.map(x => x.job_type_id);
            let unionJobType = [...new Set([...job_types, ...existingJobTypes])];
            let addJobTypes = unionJobType.filter(x => !existingJobTypes.includes(x));
            let removeJobTypes = unionJobType.filter(x => !job_types.includes(x));

            await Announcement.update({ announcement_id: announcement_id }, {
              name,
              short_description,
              description,
              start_date,
              end_date,
              email_noti          : email_notification,
              sms_noti            : sms_notification,
              push_noti           : push_notification,
              announcement_type   : ANNOUNCEMENT_TYPE.custom,
              announcement_status : annoucementStatus(start_date,end_date, req.timezone),
              status              : ACCOUNT_STATUS.active,
              last_updated_by     : req.user.user_id,
              last_updated_date   : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
            const locationSql = `select location_id,name from location where location_id IN (${locations.join(',')})`;
            const jobTypeListSql = `select job_type_id,name from job_type where job_type_id IN (${job_types.join(',')})`;
            const findCreatedUser =   `select concat(first_name,' ',last_name) as created_by from ${process.env.DB_NAME}.user where user_id = ${req.user.user_id}`;
            const findUserSql =   `select concat(first_name,' ',last_name) as created_by, created_date from ${process.env.DB_NAME}.user where user_id = ${announcementDetail.created_by}`;
            let locationList = await sails.sendNativeQuery(escapeSqlSearch(locationSql)).usingConnection(req.dynamic_connection);
            let jobTypeList = job_types.length > 0 ? await sails.sendNativeQuery(escapeSqlSearch(jobTypeListSql)).usingConnection(req.dynamic_connection) : [];
            let createdUser = await sails.sendNativeQuery(escapeSqlSearch(findCreatedUser)).usingConnection(req.dynamic_connection);
            let findUser = await sails.sendNativeQuery(escapeSqlSearch(findUserSql)).usingConnection(req.dynamic_connection);

            const employees_arr = addEmployees.map((employee_id) => { return { announcement_id: announcement_id, employee_profile_id: employee_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
            const locations_arr = addLocations.map((location_id) => { return { announcement_id: announcement_id, location_id: location_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
            const job_types_arr = addJobTypes.map((job_type_id) => { return { announcement_id: announcement_id, job_type_id: job_type_id, created_by: req.user.user_id, created_date: getDateUTC() }; });

            await jobLocationEmp(employees_arr,locations_arr,job_types_arr,req);

            await AnnouncementEmployee.destroy({ announcement_id: announcement_id, employee_profile_id: { in: removeEmployees } }).usingConnection(req.dynamic_connection);
            await AnnouncementLocation.destroy({ announcement_id: announcement_id, location_id: { in: removeLocations } }).usingConnection(req.dynamic_connection);
            await AnnouncementJobType.destroy({ announcement_id: announcement_id, job_type_id: { in: removeJobTypes } }).usingConnection(req.dynamic_connection);

            let isTodaysDate = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD') === startDate;

            let accountsql = `SELECT account_configuration_detail.value, account_configuration_detail.code
                      FROM account_configuration
                      INNER JOIN account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
                      WHERE account_configuration_detail.code IN ($1) AND account_configuration.account_id = $2;`;
            const accountRawResult = await sails.sendNativeQuery(accountsql,[ACCOUNT_CONFIG_CODE.cron_announcement, req.account.account_id]);
            const accountResult = accountRawResult.rows[0] || null;
            const cron_announcement = accountResult.value;
            let currentDateTime = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD HH:mm');
            let splitDate = currentDateTime.split(' ');
            let currentTime = splitDate[1];
            if (isTodaysDate && currentTime >= cron_announcement) {
            // Below implementation for sending announcement start Notification to all employees
              let sql = `Select 
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
                employee_profile.employee_profile_id IN (${employees.join(',')});`;

              const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
              const _employees = rawResult.rows;
              if(!req.isExposedApi){
                await sendNotification(null, {
                  notification_entity      : NOTIFICATION_ENTITIES.CUSTOM_ANNOUNCEMENT,
                  employees                : _employees,
                  account_id               : req.account.account_id,
                  announcement_id          : announcement_id,
                  announcement_title       : name,
                  announcement_description : description,
                  email_noti               : email_notification,
                  push_noti                : push_notification,
                  sms_noti                 : sms_notification,
                });
              }
            }

            let data = {
              announcement_id     : announcement_id,
              name                : name,
              start_date          : start_date,
              end_date            : end_date,
              email_noti          : email_notification,
              sms_noti            : sms_notification,
              push_noti           : push_notification,
              announcement_type   : ANNOUNCEMENT_TYPE.custom,
              announcement_status : annoucementStatus(start_date,end_date, req.timezone),
              status              : ACCOUNT_STATUS.active,
              locations           : locationList.rows,
              job_types           : jobTypeListData(jobTypeList),
              created_by          : findUser.rows[0].created_by,
              created_date        : getDateTimeSpecificTimeZone(findUser.rows[0].created_date,req.timezone,
              req.dateTimeFormat),
              last_updated_by   : createdUser.rows[0].created_by,
              last_updated_date : getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,
              req.dateTimeFormat)
            };
            return res.ok(data, messages.ANN_UPDATE_SUCCESS, RESPONSE_STATUS.success);
          } else {
            res.ok(isValid.error, messages.DATE_FAILURE, RESPONSE_STATUS.error);
          }
        } else {
          return res.ok(announcementDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValid.error, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG_UPDATE, RESPONSE_STATUS.error);
    }
  },
  updateauto: async(req, res) => {
    try {
      let request = req.allParams();
      const isValid = await AnnouncementValidation.EditAuto.validate(request);
      if (!isValid.error) {
        let announcement_id = request.id;

        const announcementDetail = await Announcement.findOne({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);

        if (announcementDetail) {
          const { name, short_description, description, email_noti, push_noti, sms_noti } = req.allParams();

          await Announcement.update({ announcement_id: announcement_id }, {
            name,
            short_description,
            description,
            email_noti,
            sms_noti,
            push_noti,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          return res.ok(announcement_id, messages.ANN_UPDATE_SUCCESS, RESPONSE_STATUS.success);

        } else {
          return res.ok(announcementDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValid.error, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG_UPDATE, RESPONSE_STATUS.error);
    }
  },
  delete: async(req, res) => {
    const isValid = AnnouncementValidation.delete.validate(req.allParams());
    if (!isValid.error) {
      const { id } = req.allParams();

      const checkExists = await Announcement.findOne({ announcement_id: id }).usingConnection(req.dynamic_connection);
      if (checkExists) {
        let chk = checkExists.start_date ? getStatus(checkExists.start_date, checkExists.end_date) : ANNOUNCEMENT_STATUS.active;
        let status = checkExists.announcement_status === ANNOUNCEMENT_STATUS.inactive ? chk : ANNOUNCEMENT_STATUS.inactive;
        await Announcement.update({ announcement_id: id }, {
          announcement_status : status,
          last_updated_by     : req.user.user_id,
          last_updated_date   : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        let _message = 'Announcement inactivated successfully.';
        if (status !== ANNOUNCEMENT_STATUS.inactive) {
          _message = 'Announcement status updated.';
        }

        if(status === ANNOUNCEMENT_STATUS.inactive){
          let announcementDetail = await Announcement.findOne({ announcement_id: id }).usingConnection(req.dynamic_connection);
          let isTodaysDate = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD') === moment(announcementDetail.start_date).format('YYYY-MM-DD');

          let accountsql = `SELECT account_configuration_detail.value, account_configuration_detail.code
                    FROM account_configuration
                    INNER JOIN account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
                    WHERE account_configuration_detail.code IN ($1) AND account_configuration.account_id = $2;`;
          const accountRawResult = await sails.sendNativeQuery(accountsql,[ACCOUNT_CONFIG_CODE.cron_announcement, req.account.account_id]);
          const accountResult = accountRawResult.rows[0] || null;
          const cron_announcement = accountResult.value;
          let currentDateTime = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD HH:mm');
          let splitDate = currentDateTime.split(' ');
          let currentTime = splitDate[1];
          if (isTodaysDate && currentTime >= cron_announcement) {
          // Below implementation for sending announcement start Notification to all employees
            const announcementEmployees = await AnnouncementEmployee.find({ announcement_id: id }).usingConnection(req.dynamic_connection);
            let existingEmployees = announcementEmployees.map(x => x.employee_profile_id);
            let sql = `Select 
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
              employee_profile.employee_profile_id IN (${existingEmployees});`;

            const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
            const _employees = rawResult.rows;
            if(!req.isExposedApi){
              await sendNotification(null, {
                notification_entity      : NOTIFICATION_ENTITIES.CUSTOM_ANNOUNCEMENT,
                employees                : _employees,
                account_id               : req.account.account_id,
                announcement_id          : id,
                announcement_title       : announcementDetail.name,
                announcement_description : announcementDetail.description,
                email_noti               : (announcementDetail.email_notification === 1) ? true : false,
                push_noti                : (announcementDetail.push_notification === 1) ? true : false,
                sms_noti                 : (announcementDetail.sms_notification === 1) ? true : false,
              });
            }
          }
        }
        return res.ok(undefined, _message, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.ANNOUNCMENT_TYPE_NOT_FOUND, RESPONSE_STATUS.error);
      }

    } else {
      return res.ok(isValid.error, messages.DELETE_ANNOUNCMENT_FAIL, RESPONSE_STATUS.error);
    }
  },
  updateStatus: async(req, res) => {
    try {
      const isValid = AnnouncementValidation.updateStatus.validate(req.allParams());
      if (!isValid.error) {
        const { announcement_id, status } = req.allParams();
        const checkExists = await Announcement.findOne({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);
        if (checkExists) {
          let set_status = ANNOUNCEMENT_STATUS.inactive;
          let _message = messages.INACTIVE_ANNOUNCMENT_SUCCESS;
          if(status === ANNOUNCEMENT_STATUS.active){
            let handleStatusActivationResponse = handleStatusActivation(checkExists, req.timezone);
            sails.log(handleStatusActivationResponse);
            set_status = handleStatusActivationResponse[0];
            _message = handleStatusActivationResponse[1];
          }
          await Announcement.update({ announcement_id: announcement_id }, {
            announcement_status : set_status,
            last_updated_by     : req.user.user_id,
            last_updated_date   : getDateUTC()
          }).usingConnection(req.dynamic_connection);

          if(status === ANNOUNCEMENT_STATUS.inactive){
            let announcementDetail = await Announcement.findOne({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);
            let isTodaysDate = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD') === moment(announcementDetail.start_date).format('YYYY-MM-DD');

            let accountsql = `SELECT account_configuration_detail.value, account_configuration_detail.code
                      FROM account_configuration
                      INNER JOIN account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
                      WHERE account_configuration_detail.code IN ($1) AND account_configuration.account_id = $2;`;
            const accountRawResult = await sails.sendNativeQuery(accountsql,[ACCOUNT_CONFIG_CODE.cron_announcement, req.account.account_id]);
            const accountResult = accountRawResult.rows[0] || null;
            const cron_announcement = accountResult.value;
            let currentDateTime = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD HH:mm');
            let splitDate = currentDateTime.split(' ');
            let currentTime = splitDate[1];
            if (isTodaysDate && currentTime >= cron_announcement) {
            // Below implementation for sending announcement start Notification to all employees
              const announcementEmployees = await AnnouncementEmployee.find({ announcement_id: announcement_id }).usingConnection(req.dynamic_connection);
              let existingEmployees = announcementEmployees.map(x => x.employee_profile_id);
              let sql = `Select 
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
                employee_profile.employee_profile_id IN (${existingEmployees});`;

              const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
              const _employees = rawResult.rows;
              if(!req.isExposedApi){
                await sendNotification(null, {
                  notification_entity      : NOTIFICATION_ENTITIES.CUSTOM_ANNOUNCEMENT,
                  employees                : _employees,
                  account_id               : req.account.account_id,
                  announcement_id          : announcement_id,
                  announcement_title       : announcementDetail.name,
                  announcement_description : announcementDetail.description,
                  email_noti               : (announcementDetail.email_notification === 1) ? true : false,
                  push_noti                : (announcementDetail.push_notification === 1) ? true : false,
                  sms_noti                 : (announcementDetail.sms_notification === 1) ? true : false,
                });
              }
            }
          }
          return res.ok(undefined, _message, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.ANNOUNCMENT_TYPE_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        return res.ok(isValid.error, messages.UPDATE_STATUS_FAIL, RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.UPDATE_STATUS_FAIL,RESPONSE_STATUS.error);
    }
  },
  dashboard: async(req, res) => {
    try {
      let request = req.allParams();

      let sql = `
            SELECT DISTINCT a.announcement_id, a.name, LEFT(a.short_description, 45) AS description, a.start_date, a.created_date, a.end_date,
            CONCAT(u.first_name,' ',u.last_name) as created_by,
            a.announcement_type,  announcement_employee.employee_profile_id
            FROM  announcement AS a
            LEFT JOIN ${process.env.DB_NAME}.user AS u ON a.created_by = u.user_id
            LEFT JOIN  announcement_location ON a.announcement_id = announcement_location.announcement_id
            LEFT JOIN  announcement_employee ON a.announcement_id = announcement_employee.announcement_id
            where 
              a.status = '${ACCOUNT_STATUS.active}' 
              AND a.announcement_status = '${ANNOUNCEMENT_STATUS.active}' 
              AND a.announcement_type = '${ANNOUNCEMENT_TYPE.custom}' 
              AND announcement_employee.employee_profile_id = '${req.empProfile.employee_profile_id}'
            `;
      if (request && request.location_id) {
        sql = sql + ` AND announcement_location.location_id = '${request.location_id}' `;
      }
      sql = sql + ` ORDER BY a.announcement_id DESC `;

      const rawResultlength = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      let resultLength = await resultLengthData(rawResultlength);

      sql = sql + ` LIMIT 3 offset 0`;

      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      let result = rawResult.rows;
      let customannouncementList = [];
      customannouncementList = await customAnnouncementDatas(result,req);


      // get date from current timezone date
      let _currentDate = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD');

      let auto_sql = `Select announcement_id, name, description, announcement_type, status, announcement_status from announcement where is_default=1`;

      const rawResultAuto = await sails.sendNativeQuery(`${auto_sql};`).usingConnection(req.dynamic_connection);
      const resultsAuto = rawResultAuto.rows ? rawResultAuto.rows : [];
      let sql_birth = `SELECT ep.employee_profile_id, ep.date_of_joining, u.email, u.first_name, u.last_name, u.date_of_birth, u.profile_picture_thumbnail_url 
        FROM employee_profile ep
        INNER JOIN ${process.env.DB_NAME}.user u 
          ON u.user_id = ep.user_id
        LEFT JOIN employee_location 
          ON employee_location.employee_profile_id = ep.employee_profile_id
        where 
          (datediff(DATE_ADD(u.date_of_birth, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from u.date_of_birth) YEAR),'${_currentDate}')) <= 3 and
          (datediff(DATE_ADD(u.date_of_birth, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from u.date_of_birth) YEAR),'${_currentDate}')) >= -3 and
          u.status = '${ACCOUNT_STATUS.active}' and 
          ep.status = '${ACCOUNT_STATUS.active}' `;
      if (request && request.location_id) {
        sql_birth = sql_birth + ` and employee_location.location_id = ${request.location_id}`;
      }
      sql_birth = sql_birth + ` group by employee_profile_id `;


      let sql_anniv = `SELECT ep.employee_profile_id, ep.date_of_joining, u.email, u.first_name, u.last_name, u.date_of_birth, u.profile_picture_thumbnail_url,
        EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) as experience 
        FROM employee_profile ep
        INNER JOIN ${process.env.DB_NAME}.user u 
          ON u.user_id = ep.user_id
        LEFT JOIN employee_location 
          ON employee_location.employee_profile_id = ep.employee_profile_id
        where 
          (datediff(DATE_ADD(ep.date_of_joining, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) YEAR),'${_currentDate}')) <= 3 and
          (datediff(DATE_ADD(ep.date_of_joining, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) YEAR),'${_currentDate}')) >= -3 and
          u.status = '${ACCOUNT_STATUS.active}' and 
          YEAR(ep.date_of_joining) != YEAR('${_currentDate}') and
          ep.status = '${ACCOUNT_STATUS.active}' `;
      if (request && request.location_id) {
        sql_anniv = sql_anniv + ` and employee_location.location_id = ${request.location_id} `;
      }
      sql_anniv = sql_anniv + ` group by employee_profile_id `;



      let sql_aboard = `SELECT ep.employee_profile_id, ep.date_of_joining, u.email, u.first_name, u.last_name, u.date_of_birth, u.profile_picture_thumbnail_url, u.aboard_date
          FROM employee_profile ep
          INNER JOIN ${process.env.DB_NAME}.user u
            ON u.user_id = ep.user_id
          LEFT JOIN employee_location
            ON employee_location.employee_profile_id = ep.employee_profile_id
          where
          (datediff(DATE_ADD(DATE(u.aboard_date), INTERVAL + 2 DAY),'${_currentDate}')) <= 2 AND
          (datediff(DATE_ADD(DATE(u.aboard_date), INTERVAL + 2 DAY),'${_currentDate}')) >= 0 AND
            u.status = '${ACCOUNT_STATUS.active}' and
            ep.status = '${ACCOUNT_STATUS.active}' `;
      if (request && request.location_id) {
        sql_aboard = sql_aboard + ` and employee_location.location_id = ${request.location_id} `;
      }
      sql_aboard = sql_aboard + ` group by employee_profile_id `;
      const rawResultBirth = await sails.sendNativeQuery(`${sql_birth};`).usingConnection(req.dynamic_connection);
      const resultsBirth = await birthdayResultData(rawResultBirth);

      const rawResultAnniv = await sails.sendNativeQuery(`${sql_anniv};`).usingConnection(req.dynamic_connection);
      const resultsAnniv = await annivResultData(rawResultAnniv);

      const rawResultAboard = await sails.sendNativeQuery(`${sql_aboard};`).usingConnection(req.dynamic_connection);
      const resultsAboard = await aboardResultData(rawResultAboard);

      let _result = resultLength;
      let data = {
        custom      : customannouncementList,
        auto        : resultsAuto,
        birthday    : [],
        anniversary : [],
        aboard      : []
      };

      data = birtdayAnniverssaryAboard(resultsBirth,resultsAnniv,resultsAboard,_result,data,resultsAuto);

      return res.ok(data, messages.GET_ANNOUNCEMENT, RESPONSE_STATUS.success);
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  dashboardList: async(req, res) => {
    try {
      let request = req.allParams();
      const { announcement_type } = request;
      let customannouncementList = [];
      let _result = 0;
      if (!announcement_type || (announcement_type === ANNOUNCEMENT_TYPE.custom)) {
        let sql = `
              SELECT DISTINCT a.announcement_id, a.name, LEFT(a.short_description, 45) AS description, a.start_date,a.created_date, a.end_date,
              a.announcement_type,  announcement_employee.employee_profile_id,
              CONCAT(u.first_name,' ',u.last_name) as created_by
              FROM  announcement AS a
              LEFT JOIN  announcement_location ON a.announcement_id = announcement_location.announcement_id
              LEFT JOIN  announcement_employee ON a.announcement_id = announcement_employee.announcement_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON a.created_by = u.user_id
              where 
                a.status = '${ACCOUNT_STATUS.active}' 
                AND a.announcement_status = '${ANNOUNCEMENT_STATUS.active}' 
                AND a.announcement_type = '${ANNOUNCEMENT_TYPE.custom}' 
                AND announcement_employee.employee_profile_id = '${req.empProfile.employee_profile_id}'
                AND announcement_location.location_id = '${request.location_id}'
                ORDER BY a.announcement_id DESC`;


        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        let result = rawResult.rows;
        if (result) {
          customannouncementList = result.map(cAnnouncement => {
            return {
              announcement_id     : cAnnouncement.announcement_id,
              name                : cAnnouncement.name,
              description         : cAnnouncement.description,
              start_date          : cAnnouncement.start_date ? formatDate(cAnnouncement.start_date, req.dateFormat) : '',
              end_date            : cAnnouncement.end_date ? formatDate(cAnnouncement.end_date, req.dateFormat) : '',
              created_by          : cAnnouncement.created_by,
              created_date        : cAnnouncement.created_date ? formatDate(cAnnouncement.created_date, req.dateFormat) : '',
              announcement_status : cAnnouncement.announcement_status,
              announcement_type   : cAnnouncement.announcement_type
            };
          });
          _result = result ? result.length : [];

        }

      }


      // get date from current timezone date
      let _currentDate = getDateSpecificTimeZone(getDateUTC(), req.timezone, 'YYYY-MM-DD');

      let auto_sql = `Select announcement_id, name, description, announcement_type, status, announcement_status from announcement where is_default=1`;

      const rawResultAuto = await sails.sendNativeQuery(`${auto_sql};`).usingConnection(req.dynamic_connection);
      const resultsAuto = rawResultAuto.rows ? rawResultAuto.rows : [];



      if (!announcement_type || (announcement_type === ANNOUNCEMENT_TYPE.birthday)) {
        let sql_birth = `SELECT ep.employee_profile_id, ep.date_of_joining, u.email, u.first_name, u.last_name, u.date_of_birth, u.profile_picture_thumbnail_url,
        DATE_ADD(u.date_of_birth, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from u.date_of_birth) YEAR),'${_currentDate}' 
        FROM employee_profile ep
          INNER JOIN ${process.env.DB_NAME}.user u 
            ON u.user_id = ep.user_id
          LEFT JOIN employee_location 
            ON employee_location.employee_profile_id = ep.employee_profile_id
          where 
            (datediff(DATE_ADD(u.date_of_birth, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from u.date_of_birth) YEAR),'${_currentDate}')) <= 3 and
            (datediff(DATE_ADD(u.date_of_birth, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from u.date_of_birth) YEAR),'${_currentDate}')) >= -3 and
            u.status = '${ACCOUNT_STATUS.active}' and 
            ep.status = '${ACCOUNT_STATUS.active}' `;
        if (request && request.location_id) {
          sql_birth = sql_birth + ` and employee_location.location_id = ${request.location_id}`;
        }
        sql_birth = sql_birth + ` group by employee_profile_id `;
        const rawResultBirth = await sails.sendNativeQuery(`${sql_birth};`).usingConnection(req.dynamic_connection);
        const resultsBirth = rawResultBirth.rows ? rawResultBirth.rows : [];
        let birthday = resultsAuto.filter(item => item.announcement_type === ANNOUNCEMENT_TYPE.birthday && item.announcement_status === ANNOUNCEMENT_STATUS.active);
        if (resultsBirth && birthday && birthday.length) {
          _result = _result + resultsBirth.length;
          customannouncementList.push(...resultsBirth.map(item => {
            return {
              announcement_id               : birthday[0].announcement_id,
              name                          : birthday[0].name,
              description                   : birthday[0].description,
              start_date                    : birthday[0].start_date ? formatDate(birthday[0].start_date, req.dateFormat) : '',
              end_date                      : birthday[0].end_date ? formatDate(birthday[0].end_date, req.dateFormat) : '',
              created_date                  : formatDate(moment(item[`DATE_ADD(u.date_of_birth, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from u.date_of_birth) YEAR),'${_currentDate}'`]).subtract(3, 'days'), req.dateFormat),
              announcement_status           : birthday[0].announcement_status,
              announcement_type             : birthday[0].announcement_type,
              employee_profile_id           : item.employee_profile_id,
              date_of_birth                 : item.date_of_birth,
              email                         : item.email,
              first_name                    : item.first_name,
              last_name                     : item.last_name,
              profile_picture_thumbnail_url : item.profile_picture_thumbnail_url
            };
          }));
        }
      }

      if (!announcement_type || (announcement_type === ANNOUNCEMENT_TYPE.anniversary)) {
        let sql_anniv = `SELECT ep.employee_profile_id, ep.date_of_joining, u.email, u.first_name, u.last_name, u.date_of_birth, u.profile_picture_thumbnail_url,
        DATE_ADD(ep.date_of_joining, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) YEAR),'${_currentDate}' ,
        EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) as experience
        FROM employee_profile ep
        INNER JOIN ${process.env.DB_NAME}.user u 
          ON u.user_id = ep.user_id
        LEFT JOIN employee_location 
          ON employee_location.employee_profile_id = ep.employee_profile_id
        where 
          (datediff(DATE_ADD(ep.date_of_joining, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) YEAR),'${_currentDate}')) <= 3 and
          (datediff(DATE_ADD(ep.date_of_joining, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) YEAR),'${_currentDate}')) >= -3 and
          u.status = '${ACCOUNT_STATUS.active}' and 
          YEAR(ep.date_of_joining) != YEAR('${_currentDate}') and
          ep.status = '${ACCOUNT_STATUS.active}' `;
        if (request && request.location_id) {
          sql_anniv = sql_anniv + ` and employee_location.location_id = ${request.location_id} `;
        }
        sql_anniv = sql_anniv + ` group by employee_profile_id `;
        const rawResultAnniv = await sails.sendNativeQuery(`${sql_anniv};`).usingConnection(req.dynamic_connection);
        const resultsAnniv = rawResultAnniv.rows ? rawResultAnniv.rows : [];
        let workanniv = resultsAuto.filter(item => item.announcement_type === ANNOUNCEMENT_TYPE.anniversary && item.announcement_status === ANNOUNCEMENT_STATUS.active);
        if (resultsAnniv && workanniv && workanniv.length) {
          _result = _result + resultsAnniv.length;
          customannouncementList.push(...resultsAnniv.map(item => {
            return {
              announcement_id               : workanniv[0].announcement_id,
              name                          : workanniv[0].name,
              description                   : workanniv[0].description,
              start_date                    : workanniv[0].start_date ? formatDate(workanniv[0].start_date, req.dateFormat) : '',
              end_date                      : workanniv[0].end_date ? formatDate(workanniv[0].end_date, req.dateFormat) : '',
              created_date                  : formatDate(moment(item[`DATE_ADD(ep.date_of_joining, INTERVAL EXTRACT(YEAR FROM '${_currentDate}') - EXTRACT(YEAR from ep.date_of_joining) YEAR),'${_currentDate}'`]).subtract(3, 'days'), req.dateFormat),
              announcement_status           : workanniv[0].announcement_status,
              announcement_type             : workanniv[0].announcement_type,
              employee_profile_id           : item.employee_profile_id,
              date_of_joining               : item.date_of_joining,
              email                         : item.email,
              first_name                    : item.first_name,
              last_name                     : item.last_name,
              profile_picture_thumbnail_url : item.profile_picture_thumbnail_url,
              experience                    : item.experience ? item.experience : ''
            };
          }));
        }
      }

      if (!announcement_type || (announcement_type === ANNOUNCEMENT_TYPE.abroad)) {
        let sql_aboard = `SELECT ep.employee_profile_id, ep.date_of_joining, u.email, u.first_name, u.last_name, u.date_of_birth, u.profile_picture_thumbnail_url, u.aboard_date
          FROM employee_profile ep
          INNER JOIN ${process.env.DB_NAME}.user u
            ON u.user_id = ep.user_id
          LEFT JOIN employee_location
            ON employee_location.employee_profile_id = ep.employee_profile_id
          where
          (datediff(DATE_ADD(DATE(u.aboard_date), INTERVAL + 2 DAY),'${_currentDate}')) <= 2 AND
          (datediff(DATE_ADD(DATE(u.aboard_date), INTERVAL + 2 DAY),'${_currentDate}')) >= 0 AND
            u.status = '${ACCOUNT_STATUS.active}' and
            ep.status = '${ACCOUNT_STATUS.active}' `;
        if (request && request.location_id) {
          sql_aboard = sql_aboard + ` and employee_location.location_id = ${request.location_id} `;
        }
        sql_aboard = sql_aboard + ` group by employee_profile_id `;
        const rawResultAboard = await sails.sendNativeQuery(`${sql_aboard};`).usingConnection(req.dynamic_connection);
        const resultsAboard = rawResultAboard.rows ? rawResultAboard.rows : [];
        let aboard = resultsAuto.filter(item => item.announcement_type === ANNOUNCEMENT_TYPE.abroad && item.announcement_status === ANNOUNCEMENT_STATUS.active);
        if (resultsAboard && aboard && aboard.length) {
          _result = _result + resultsAboard.length;
          customannouncementList.push(...resultsAboard.map(item => {
            return {
              announcement_id               : aboard[0].announcement_id,
              name                          : aboard[0].name,
              description                   : aboard[0].description,
              start_date                    : aboard[0].start_date ? formatDate(aboard[0].start_date, req.dateFormat) : '',
              end_date                      : aboard[0].end_date ? formatDate(aboard[0].end_date, req.dateFormat) : '',
              created_date                  : formatDate(_currentDate, req.dateFormat),
              announcement_status           : aboard[0].announcement_status,
              announcement_type             : aboard[0].announcement_type,
              employee_profile_id           : item.employee_profile_id,
              aboard_date                   : item.aboard_date,
              email                         : item.email,
              first_name                    : item.first_name,
              last_name                     : item.last_name,
              profile_picture_thumbnail_url : item.profile_picture_thumbnail_url
            };
          }));
        }
      }

      customannouncementList = customannouncementList.sort((a, b) => {
        let _date1 = moment(a.created_date, req.dateFormat).format('YYYY-MM-DD');
        let _date2 = moment(b.created_date, req.dateFormat).format('YYYY-MM-DD');
        return new Date(_date2) - new Date(_date1);
      });

      if (request.rows) {
        customannouncementList = paginate(customannouncementList, request.rows, (request.offset / request.rows + 1) - 1);
      }

      let data = {
        totalRecords : _result,
        list         : customannouncementList,
      };
      return res.ok(data, messages.GET_ANNOUNCEMENT, RESPONSE_STATUS.success);
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
};
