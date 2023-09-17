const { RESPONSE_STATUS, PERMISSIONS, FEEDBACK_CATEGORY, NOTIFICATION_ENTITIES, CRON_JOB_CODE, ACCOUNT_CONFIG_CODE, ACCOUNT_STATUS } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const FeedbackReportValidation = require('../validations/FeedbackReportValidation');
const { getDateUTC, getDayName, getDateTimeSpecificTimeZone, convertDateUTC } = require('../utils/common/getDateTime');
const {sendNotification} = require('../services/sendNotification');
const moment = require('moment');
const XLSX = require('xlsx');
const fs = require('fs');
const {uploadReport} = require('../services/uploadReport');

const checkPermissionExistForUser = (_permissionList, _permission)=>{
  if (_permissionList && _permissionList.length > 0) {
    return _permissionList.includes(_permission);
  }else{
    return false;
  }

};

const _weeklyReport =async (curentTimeUTC) => {
  sails.log.debug('Feedback report of all the managers of my location Cron Execution Start');
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
      account_configuration_detail.code IN ($1,$2,$3,$4,$5,$6) and account.status = $7`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),[
    ACCOUNT_CONFIG_CODE.tenant_db_connection_string,
    ACCOUNT_CONFIG_CODE.time_zone,
    ACCOUNT_CONFIG_CODE.date_time_format,
    ACCOUNT_CONFIG_CODE.date_format,
    ACCOUNT_CONFIG_CODE.cron_360feedback_report_submission,
    ACCOUNT_CONFIG_CODE.receive_360feedback_report_on,
    ACCOUNT_STATUS.active
  ]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let cron_360feedback_report_submission = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_360feedback_report_submission);
    let receive_360feedback_report_on = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.receive_360feedback_report_on);
    return {
      account_id                         : id,
      tenant_db_connection_string        : tenant_db_connection_string ? tenant_db_connection_string.value : '',
      time_zone                          : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
      date_time_format                   : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
      date_format                        : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
      cron_360feedback_report_submission : cron_360feedback_report_submission ? cron_360feedback_report_submission.value : '06:00',
      receive_360feedback_report_on      : receive_360feedback_report_on ? receive_360feedback_report_on.value : 'Monday',
    };
  })  : [];

  for(const item of accountArray)
  {
    if(!item.tenant_db_connection_string) {continue;}
    let timezone = item.time_zone ? item.time_zone : '';
    let dayName = getDayName(curentTimeUTC, timezone,'dddd');
    if(dayName !== item.receive_360feedback_report_on) {continue;}
    if(timezone === '') {continue;}

    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');

    if(tenantTime !== item.cron_360feedback_report_submission){
      continue;
    }
    sails.log(dayName,tenantTime, item.account_id);
    let connectionString = item.tenant_db_connection_string;
    if(connectionString){
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let tenantConnection = await  mysql.createConnection(connectionString);
      await tenantConnection.connect();
      let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.weekly_feedback_report }).usingConnection(tenantConnection);
      if(cronJob){
        let currentDate = getDateUTC();
        let end_date =  currentDate;
        let obj = {};
        let start_date=cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
        sails.log(start_date);
        try{
          /* Fetch all receipient users who have access of weekly feedback report get*/
          const getReceipient = await sails.sendNativeQuery(`SELECT DISTINCT user_id, email, user_name, employee_profile_id, role_id
                                FROM (SELECT 
                                    u.user_id, u.email, CONCAT(u.first_name, ' ', u.last_name) AS user_name, ep.employee_profile_id, ep.role_id
                                    FROM feedback_answer AS fa
                                    INNER JOIN employee_location AS el ON fa.location_id = el.location_id
                                    INNER JOIN employee_profile AS ep ON el.employee_profile_id = ep.employee_profile_id
                                    INNER JOIN role_permission AS rp ON ep.role_id = rp.role_id
                                    INNER JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                                    INNER JOIN permission AS p ON rp.permission_id = p.permission_id AND p.code = '${PERMISSIONS.RECEIVE_WEEKLY_DIGEST}'
                                    WHERE fa.created_date > '${start_date}' AND fa.created_date <= '${end_date}'
                                    AND u.status = 'Active' GROUP BY u.user_id
                                    UNION ALL
                                    SELECT u.user_id, u.email, CONCAT(u.first_name, ' ', u.last_name) AS user_name, ep.employee_profile_id, ep.role_id   
                                    FROM feedback_answer AS fa
                                    INNER JOIN employee_profile AS ep ON fa.manager_id = ep.employee_profile_id
	                                  INNER JOIN employee_location AS el ON el.employee_profile_id = el.employee_profile_id
                                    INNER JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                                    INNER JOIN role_permission AS rp ON ep.role_id = rp.role_id
                                    INNER JOIN permission AS p ON rp.permission_id = p.permission_id AND p.code = '${PERMISSIONS.RECEIVE_WEEKLY_DIGEST}'
                                    WHERE fa.created_date > '${start_date}' AND fa.created_date <= '${end_date}'
                                    AND u.status = 'Active' GROUP BY u.user_id
                                  ) AS re`).usingConnection(tenantConnection);
          const result = getReceipient.rows;

          if(result.length > 0)
          {
            for(const receipient of result)
            {
              let employee_profile_id = receipient.employee_profile_id;
              let employeeLocationData = await sails.sendNativeQuery(`SELECT GROUP_CONCAT(location_id SEPARATOR ",") as location_ids 
                                                                     FROM employee_location where employee_profile_id = '${employee_profile_id}'`).usingConnection(tenantConnection);
              const locationsData = employeeLocationData.rows[0] || '';
              const locationIds = locationsData.location_ids;
              /* Based on receipient fetch thier all location and based on their all locations get last 7 days feedback data associated with manager and location */
              const weeklyData = await sails.sendNativeQuery(`SELECT   
              CONCAT(u.first_name, ' ', u.last_name) AS manager_name, l.name AS location_name, fq.question AS question, 
              fa.feedback_rating_scale_id AS rating, fa.comment AS answer, CONCAT(u1.first_name, ' ', u1.last_name) AS submitted_by, fa.created_date 
              FROM feedback_answer AS fa
              LEFT JOIN feedback_question AS fq ON fa.feedback_question_id = fq.feedback_question_id 
              LEFT JOIN employee_profile AS ep ON fa.manager_id = ep.employee_profile_id
              LEFT JOIN employee_location AS el ON ep.employee_profile_id = el.employee_profile_id 
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
              LEFT JOIN employee_location AS el1 ON fa.location_id = el1.location_id
              LEFT JOIN location AS l ON el1.location_id = l.location_id
              LEFT JOIN employee_profile AS ep1 ON el1.employee_profile_id = ep1.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u1 ON fa.created_by = u1.user_id
              WHERE fa.created_date > '${start_date}' AND fa.created_date <= '${end_date}'
              AND (el.location_id IN (${locationIds}) OR el1.location_id IN (${locationIds}))
              GROUP BY fa.feedback_answer_id
              ORDER BY manager_name ASC, location_name ASC`).usingConnection(tenantConnection);
              const weeklyFeedbackData = weeklyData.rows;

              let managerData = [];
              let managerSubData = [];
              let locationData = [];
              let locationSubData = [];
              let managerName = '';
              let submittedBy = '';
              let locationName = '';
              let submittedDateTime = '';
              let totalCount = weeklyFeedbackData.length;
              let i = 1;
              for(let fdata of weeklyFeedbackData) {
                let queAns = {};
                if (fdata.manager_name !== null && fdata.manager_name !== '' && fdata.manager_name !== undefined) {
                  if ((fdata.manager_name !== managerName && fdata.created_date !== submittedDateTime)) {
                    if(managerSubData.length > 0) {
                      managerData.push(managerSubData);
                    }
                    managerSubData = [];
                  }
                  managerName = fdata.manager_name;

                  queAns = {'managerName': managerName, 'date': submittedDateTime !== '' ? submittedDateTime : fdata.created_date, 'question': fdata.question, 'answer': fdata.answer !== null ? fdata.answer : '', 'rating': fdata.rating, 'submitted_by': fdata.submitted_by};
                  managerSubData.push(queAns);
                } else if (fdata.location_name !== null && fdata.location_name !== '' && fdata.location_name !== undefined) {
                  if ((fdata.location_name !== locationName && fdata.created_date !== submittedDateTime) ||
                     (fdata.submitted_by !== submittedBy && fdata.created_date !== submittedDateTime)) {
                    if(locationSubData.length > 0) {
                      locationData.push(locationSubData);
                    }
                    locationSubData = [];
                  }
                  locationName = fdata.location_name;
                  submittedBy = fdata.submitted_by;
                  queAns = {'locationName': locationName, 'date': submittedDateTime !== '' ? submittedDateTime : fdata.created_date, 'question': fdata.question, 'answer': fdata.answer !== null ? fdata.answer : '', 'rating': fdata.rating, 'submitted_by': fdata.submitted_by};
                  locationSubData.push(queAns);
                }
                submittedDateTime = fdata.created_date;
                if (totalCount === i) {
                  managerData.push(managerSubData);
                  locationData.push(locationSubData);
                }
                i++;
              }
              const actionSql = await sails.sendNativeQuery(`SELECT permission.code, role.name, pm.code as permission_module FROM role_permission rp 
              INNER JOIN permission ON rp.permission_id = permission.permission_id 
              INNER JOIN role ON rp.role_id = role.role_id 
              INNER JOIN permission_module as pm ON permission.permission_module_id = pm.permission_module_id 
              WHERE permission.status = 'Active' AND rp.role_id = ${receipient.role_id}; 
              `).usingConnection(tenantConnection);
              const action = actionSql.rows;

              let resp_permission = [];
              for (const permission of action) {
                resp_permission.push(permission.code);
              }
              let view_non_anonymous_report = checkPermissionExistForUser(resp_permission,PERMISSIONS.VIEW_NONANONYMOUS_FEEDBACK_REPORT);

              await sendNotification(null,{
                notification_entity       : NOTIFICATION_ENTITIES.FEEDBACK_REPORT_DIGEST,
                userId                    : receipient.user_id,
                managerData               : managerData,
                locationData              : locationData,
                view_non_anonymous_report : view_non_anonymous_report,
                name                      : receipient.user_name,
                email                     : receipient.email,
                employee_profile_id       : receipient.employee_profile_id,
                account_id                : item.account_id,
              });
            }
          }
          await CronJob.update({ code: CRON_JOB_CODE.weekly_feedback_report },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
          obj = {
            status : 'Success',
            error  : ''
          };
        }
        catch(error){
          sails.log(error);
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
      // No Cron Jon with code Employee Report Expire
        sails.log('No Cron Jon with code certificate expire');
      }


      if(tenantConnection){
        await tenantConnection.end();
      }
    }
  }
  sails.log.debug('Feedback report of all the managers of my location Cron Execution End');
};

const subMittedOn=(sql,prop)=>{
  const startDate = prop.from_date ? moment(prop.from_date).format('YYYY-MM-DD') : null;
  const endDate = prop.from_date ? moment(prop.to_date).format('YYYY-MM-DD') : null;
  if(prop.from_date && prop.to_date)
  {
    return sql + ` AND (Date(feedback_answer.created_date) BETWEEN ('${startDate}') AND ('${endDate}'))`;
  }else if(prop.from_date){
    return sql + ` AND (Date(feedback_answer.created_date) = ('${startDate}')) `;
  }else if(prop.to_date){
    return sql + ` AND (Date(feedback_answer.created_date) = ('${endDate}')) `;
  }
};

const checkIfArrayExist = (arrayParam) => {
  return ( arrayParam && arrayParam.length > 0 ) ? true : false;
};

const handleMultiCondition=(andPayload,sql,avarageScore)=>{
  for (const payloadData of andPayload) {
    Object.keys(payloadData).forEach((prop) => {
      if (prop === 'manager') {
        sql = sql + ` AND concat(manager.first_name, " " ,manager.last_name) LIKE '%${escapeSearch(payloadData[prop])}%'`;
      }else if (prop === 'location_name') {
        sql = sql + ` AND location.name LIKE '%${escapeSearch(payloadData[prop])}%'`;
      }else if (prop === 'team_member') {
        sql = sql + ` AND concat(user.first_name, " " ,user.last_name) LIKE '%${payloadData[prop]}%'`;
      }else if (prop === 'average_score') {
        avarageScore = `HAVING average_score LIKE '${payloadData[prop]}%'`;
      }else if (prop === 'submitted_on') {
        sql = subMittedOn(sql,payloadData[prop]);
      }
    });
  }
  return [sql, avarageScore];
};

const feedBackResultDatas=async(feedBackResult,req)=>{
  return feedBackResult.rows ? feedBackResult.rows.map(item => {
    return {
      ...item,
      submitted_on: getDateTimeSpecificTimeZone(
        item.submitted_on,
          req.timezone,
          req.dateTimeFormat
      ),
    };
  }) : [];
};


// Created function to reduce complexity of code...
const locationDatas=async(locations,sql,employee_profile_id,req)=>{
  if (locations && locations.length > 0) {
    const locationName = locations.map((c) => `'${c}'`).join(', ');
    const locationData = '(' + locationName + ')';
    return sql + ' AND el.location_id IN ' + locationData + '';
  }
  else if (!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi)){
    const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${employee_profile_id}"`;
    const rawResult = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
    if(rawResult.length > 0){
      return sql + ` AND el.location_id IN ( ${rawResult.rows.map(location => location.location_id) } )`;
    }
  }else{
    return sql;
  }
};


module.exports = {
  findManagerFeedbackReport: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await FeedbackReportValidation.findManagerFeedbackReport.validate(request);
      if(!isValidate.error) {
        const { locations, job_types,low_rating , employee_profile_id } = request;
        const findQuery = await commonListing(req.allParams());

        let sql = `SELECT 
            concat(manager.first_name, " " ,manager.last_name) as manager ,
            concat(user.first_name, " " ,user.last_name) as team_member,
            manager_profile.employee_profile_id as manager_id ,
            employee_profile.employee_profile_id as employee_profile_id ,
            feedback_answer.created_date as submitted_on,
              (
                select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas 
                where fas.employee_profile_id = feedback_answer.employee_profile_id 
                AND fas.manager_id = feedback_answer.manager_id
                AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
              )as feedback_rating_count_below_three,
              ROUND((SUM(feedback_answer.feedback_rating_scale_id)/(COUNT(feedback_answer.feedback_question_id))),2) AS average_score
        FROM feedback_answer AS feedback_answer
        INNER JOIN feedback_question AS feedback_question ON feedback_question.feedback_question_id = feedback_answer.feedback_question_id
        INNER JOIN employee_profile AS employee_profile ON employee_profile.employee_profile_id = feedback_answer.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user AS user ON user.user_id = employee_profile.user_id
        INNER JOIN employee_profile AS manager_profile ON manager_profile.employee_profile_id = feedback_answer.manager_id
        INNER JOIN ${process.env.DB_NAME}.user AS manager ON manager.user_id = manager_profile.user_id`;
        if ((locations !== null && locations !== '' && locations !== undefined && checkIfArrayExist(locations)) || (!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi))) {
          sql= sql + ` INNER JOIN employee_location AS el ON el.employee_profile_id = manager_profile.employee_profile_id `;
        }

        if (job_types !== null && job_types !== '' && job_types !== undefined && checkIfArrayExist(job_types)) {
          sql= sql + ` INNER JOIN employee_job_type AS ejt ON ejt.employee_profile_id = manager_profile.employee_profile_id`;
        }
        sql = sql + ` where feedback_question.feedback_category = '${FEEDBACK_CATEGORY.manager}'`;
        if (locations !== null && locations !== '' && locations !== undefined && checkIfArrayExist(locations)) {
          sql = await locationDatas(locations,sql,employee_profile_id,req);
        }
        if (job_types !== null && job_types !== '' && job_types !== undefined && checkIfArrayExist(job_types)) {
          const jobTypeName = job_types.map((c) => `'${c}'`).join(', ');
          const jobTypeData = '(' + jobTypeName + ')';
          sql= sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
        }

        if(low_rating){
          sql= sql + ` AND (
            select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas
            where fas.employee_profile_id = feedback_answer.employee_profile_id
            AND fas.manager_id = feedback_answer.manager_id
            AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
                  ) > 0`;
        }

        let avarageScore = '';
        const andPayload = findQuery.andCondition;
        let values = handleMultiCondition(andPayload,sql,avarageScore);
        sql = values[0];
        avarageScore = values[1];

        sql = sql + ` group by feedback_answer.employee_profile_id,feedback_answer.manager_id, DATE(feedback_answer.created_date) ${avarageScore}`;

        const feedBackResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);

        let response = await feedBackResultDatas(feedBackResult,req);

        let data = {
          feedbackList : response,
          totalResult  : response.length
        };
        res.ok(data,messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.FEEDBACK_REPORT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },
  findLocationFeedbackReport: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await FeedbackReportValidation.findLocationFeedbackReport.validate(request);
      if(!isValidate.error) {
        const { locations, job_types, low_rating , employee_profile_id } = request;
        const findQuery = await commonListing(req.allParams());

        let sql = `SELECT 
            location.name as location_name,location.location_id as location_id,
            concat(user.first_name, " " ,user.last_name) as team_member,
            employee_profile.employee_profile_id as employee_profile_id ,
            feedback_answer.created_date as submitted_on,
            (
              select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas 
              where fas.employee_profile_id = feedback_answer.employee_profile_id 
              AND fas.location_id = feedback_answer.location_id
              AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
            )as feedback_rating_count_below_three,
            ROUND((SUM(feedback_answer.feedback_rating_scale_id)/(COUNT(feedback_answer.feedback_question_id))),2) AS average_score
        FROM feedback_answer AS feedback_answer
        INNER JOIN feedback_question AS feedback_question ON feedback_question.feedback_question_id = feedback_answer.feedback_question_id
        INNER JOIN location AS location ON  location.location_id = feedback_answer.location_id
        INNER JOIN employee_profile AS employee_profile ON employee_profile.employee_profile_id = feedback_answer.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user AS user ON user.user_id = employee_profile.user_id `;
        if ((locations !== null && locations !== '' && locations !== undefined && checkIfArrayExist(locations)) || (!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi))) {
          sql = sql + ` INNER JOIN employee_location AS el ON el.employee_profile_id = employee_profile.employee_profile_id `;
        }

        if (job_types !== null && job_types !== '' && job_types !== undefined && checkIfArrayExist(job_types)) {
          sql = sql + ` INNER JOIN employee_job_type AS ejt ON ejt.employee_profile_id = employee_profile.employee_profile_id `;
        }

        sql = sql + `where feedback_question.feedback_category = '${FEEDBACK_CATEGORY.location}'`;

        if (locations !== null && locations !== '' && locations !== undefined && checkIfArrayExist(locations)) {
          sql = await locationDatas(locations,sql,employee_profile_id,req);
        }

        if (job_types !== null && job_types !== '' && job_types !== undefined && checkIfArrayExist(job_types)) {
          const jobTypeName = job_types.map((c) => `'${c}'`).join(', ');
          const jobTypeData = '(' + jobTypeName + ')';
          sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
        }

        if(low_rating){
          sql = sql + ` AND (
            select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas 
            where fas.employee_profile_id = feedback_answer.employee_profile_id 
            AND fas.location_id = feedback_answer.location_id
            AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
                  ) > 0`;
        }
        let avarageScore = '';
        const andPayload = findQuery.andCondition;

        let values = handleMultiCondition(andPayload,sql,avarageScore);
        sql = values[0];
        avarageScore = values[1];

        sql = sql + ` group by feedback_answer.employee_profile_id,feedback_answer.location_id, DATE(feedback_answer.created_date) ${avarageScore}`;

        const feedBackResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);

        let response = feedBackResult.rows ? feedBackResult.rows.map(item => {
          let submitted_on= getDateTimeSpecificTimeZone(
            item.submitted_on,
              req.timezone,
              req.dateTimeFormat
          );
          return {
            ...item,
            submitted_on
          };
        }) : [];

        let data = {
          feedbackList : response,
          totalResult  : response.length
        };
        res.ok(data,messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.FEEDBACK_REPORT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },
  findManagerFeedbackReportById: async(req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await FeedbackReportValidation.findManagerFeedbackByIdReport.validate(request);
      if(!isValidate.error) {
        const { manager_id,team_member_id, submitted_on} = request;
        const getUser = async (id) =>{
          let userSql = `select concat(user.first_name, ' ', user.last_name) as name,user.profile_picture_thumbnail_url as profile_picture_thumbnail_url
      from employee_profile AS employee_profile
      INNER JOIN ${process.env.DB_NAME}.user as user
      ON user.user_id = employee_profile.user_id
      where employee_profile.employee_profile_id = ${id}`;
          const profileResult = await sails.sendNativeQuery(`${userSql};`).usingConnection(req.dynamic_connection);
          let employee =[];
          if(profileResult.rows.length){
            employee = profileResult.rows[0];
          }
          return employee;
        };
        let sql = `select 
                  feedback_question.feedback_question_id,
                  feedback_question.question, 
                  feedback_question.is_required as required,
                  feedback_answer.comment, 
                  frs.scale, 
                  frs.name AS scale_name
                  from feedback_question AS feedback_question
                  INNER JOIN feedback_answer AS feedback_answer
                  ON feedback_answer.feedback_question_id = feedback_question.feedback_question_id
                  INNER JOIN feedback_rating_scale AS frs
                  ON frs.feedback_rating_scale_id = feedback_answer.feedback_rating_scale_id
                  where feedback_answer.employee_profile_id = ${team_member_id} AND feedback_answer.manager_id = ${manager_id}`;

        const startDate = convertDateUTC(submitted_on, req.timezone, 'UTC', 'YYYY-MM-DD');
        sql = sql +  ` AND Date(feedback_answer.created_date) = '${startDate}' `;
        sql = sql +  `group by feedback_question.feedback_question_id
                  order by feedback_question.sequence`;
        const feedBackResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);
        let response = feedBackResult.rows;
        const getManager = await getUser(manager_id);
        const getTeamMember = await getUser(team_member_id);
        const  scoreSum = response.reduce((partialSum, a) => partialSum + a.scale, 0);
        const score = parseFloat((scoreSum / response.length).toFixed(2));
        const data = {
          manager           : getManager.name,
          manager_image     : getManager.profile_picture_thumbnail_url,
          team_member       : getTeamMember.name,
          team_member_image : getTeamMember.profile_picture_thumbnail_url,
          submitted_on      : submitted_on,
          score,
          feedback_result   : response
        };
        res.ok(data,messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.FEEDBACK_REPORT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },
  findLocationFeedbackReportById: async(req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await FeedbackReportValidation.findLocationFeedbackByIdReport.validate(request);
      if(!isValidate.error) {
        const { location_id,team_member_id, submitted_on} = request;
        const getUser = async (id) =>{
          let userSql = `select concat(user.first_name, ' ', user.last_name) as name,user.profile_picture_thumbnail_url as profile_picture_thumbnail_url 
      from employee_profile AS employee_profile
      INNER JOIN ${process.env.DB_NAME}.user as user
      ON user.user_id = employee_profile.user_id
      where employee_profile.employee_profile_id = ${id}`;
          const profileResult = await sails.sendNativeQuery(`${userSql};`).usingConnection(req.dynamic_connection);
          let employee =[];
          if(profileResult.rows.length){
            employee = profileResult.rows[0];
          }
          return employee;
        };
        let sql = `select
    feedback_question.feedback_question_id,
    feedback_question.question,
    feedback_question.is_required as required,
    feedback_answer.comment,
    frs.scale,
    frs.name AS scale_name
    from feedback_question AS feedback_question
    INNER JOIN feedback_answer AS feedback_answer
    ON feedback_answer.feedback_question_id = feedback_question.feedback_question_id
    INNER JOIN feedback_rating_scale AS frs
    ON frs.feedback_rating_scale_id = feedback_answer.feedback_rating_scale_id
    where feedback_answer.employee_profile_id = ${team_member_id} 
    AND feedback_answer.location_id = ${location_id}`;
        const submitted_date = moment(submitted_on,'YYYY-DD-MM HH:mm').format('YYYY-MM-DD HH:mm');
        const startDate = convertDateUTC(submitted_date, req.timezone, 'UTC', 'YYYY-MM-DD');
        sql = sql +  ` AND Date(feedback_answer.created_date) = '${startDate}' `;
        sql = sql +  `group by feedback_question.feedback_question_id
    order by feedback_question.sequence`;
        const feedBackResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);
        let response = feedBackResult.rows;
        const getTeamMember = await getUser(team_member_id);
        let locationSql = `select location.name as name 
  from location AS location
  where location.location_id = ${location_id}`;
        const locationResult = await sails.sendNativeQuery(`${locationSql};`).usingConnection(req.dynamic_connection);

        const  scoreSum = response.reduce((partialSum, a) => partialSum + a.scale, 0);
        const score =  parseFloat((scoreSum / response.length).toFixed(2));

        const data = {
          location          : locationResult.rows[0].name,
          team_member       : getTeamMember.name,
          team_member_image : getTeamMember.profile_picture_thumbnail_url,
          submitted_on      : submitted_on,
          score,
          feedback_result   : response
        };

        res.ok(data,messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.FEEDBACK_REPORT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },
  weeklyReport : _weeklyReport,
  trigger      : async (_req,res) => {
    sails.log(_req.url);
    let curentTimeUTC = getDateUTC();
    await _weeklyReport(curentTimeUTC);
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  },

  exportManagerFeedbackReport: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await FeedbackReportValidation.findManagerFeedbackReport.validate(request);
      if(!isValidate.error) {
        const { locations, job_types, low_rating , employee_profile_id } = request;
        const findQuery = await commonListing(req.allParams());

        let sql = `SELECT 
            concat(manager.first_name, " " ,manager.last_name) as manager ,
            concat(user.first_name, " " ,user.last_name) as team_member,
            manager_profile.employee_profile_id as manager_id ,
            employee_profile.employee_profile_id as team_member_id,
            feedback_answer.created_date as submitted_on,
              (
                select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas 
                where fas.employee_profile_id = feedback_answer.employee_profile_id 
                AND fas.manager_id = feedback_answer.manager_id
                AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
              )as feedback_rating_count_below_three,
              ROUND((SUM(feedback_answer.feedback_rating_scale_id)/(COUNT(feedback_answer.feedback_question_id))),2) AS average_score
        FROM feedback_answer AS feedback_answer
        INNER JOIN feedback_question AS feedback_question ON feedback_question.feedback_question_id = feedback_answer.feedback_question_id
        INNER JOIN employee_profile AS employee_profile ON employee_profile.employee_profile_id = feedback_answer.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user AS user ON user.user_id = employee_profile.user_id
        INNER JOIN employee_profile AS manager_profile ON manager_profile.employee_profile_id = feedback_answer.manager_id
        INNER JOIN ${process.env.DB_NAME}.user AS manager ON manager.user_id = manager_profile.user_id`;

        if (checkIfArrayExist(locations) || (!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi))) {
          sql = sql + ` INNER JOIN employee_location AS el ON el.employee_profile_id = manager_profile.employee_profile_id `;
        }

        if (checkIfArrayExist(job_types)) {
          sql = sql + ` INNER JOIN employee_job_type AS ejt ON ejt.employee_profile_id = manager_profile.employee_profile_id`;
        }
        sql = sql + ` where feedback_question.feedback_category = '${FEEDBACK_CATEGORY.manager}'`;

        sql = await locationDatas(locations,sql,employee_profile_id,req);

        if (checkIfArrayExist(job_types)) {
          const jobTypeName = job_types.map((c) => `'${c}'`).join(', ');
          const jobTypeData = '(' + jobTypeName + ')';
          sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
        }

        if(low_rating){
          sql = sql + ` AND (
            select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas 
            where fas.employee_profile_id = feedback_answer.employee_profile_id 
            AND fas.manager_id = feedback_answer.manager_id
            AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
                  ) > 0`;
        }
        let avarageScore = '';
        const andPayload = findQuery.andCondition;

        let values = handleMultiCondition(andPayload,sql,avarageScore);
        sql = values[0];
        avarageScore = values[1];

        sql = sql + ` group by feedback_answer.employee_profile_id,feedback_answer.manager_id, DATE(feedback_answer.created_date) ${avarageScore}`;

        const feedBackResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);
        let response = feedBackResult.rows;

        let feedbackReportDetails = (response.length > 0 ) ? response.map(item => {
          return {
            'Manager'        : item.manager,
            'Submitted By'   : item.team_member,
            'Average Rating' : item.average_score,
            'Submitted On'   : getDateTimeSpecificTimeZone(
              item.submitted_on,
                req.timezone,
                req.dateTimeFormat
            ),
          };
        }) : [];

        if(feedbackReportDetails.length > 0){
          let curentTimeUTC = getDateUTC();
          !fs.existsSync(`${process.cwd()}/assets/reports/`) && fs.mkdirSync(`${process.cwd()}/assets/reports/`, { recursive: true });
          let fileName = `360Feedback-Manager_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD-YYYY_HH_mm_ss')}`;
          let sheetName = `360Feedback-Manager_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD-YYYY')}`;
          let feedbackReportSheet = XLSX.utils.json_to_sheet(feedbackReportDetails);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, feedbackReportSheet, sheetName );
          let fileLocation = `${process.cwd()}/assets/reports/`+fileName+'.xlsx';
          XLSX.writeFile(wb, fileLocation);

          let uploadFileName = `${fileName}.xlsx`;
          let containerName = req.account.account_guid;
          let dirName = `${process.env.EXPORTED_EXCEL_REPORT_DIR}`;

          await uploadReport(fileLocation, uploadFileName, containerName, dirName);

          let downLink = `${process.env.BLOB_STORAGE_CDN_URL}/${containerName}/${dirName}/${uploadFileName}`;

          let data = {
            report_download_link: downLink
          };

          res.ok(data,messages.EXPORT_REPORT_SUCCESS,RESPONSE_STATUS.success);
        }else{
          res.ok(undefined,messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
        }
      }else{
        return res.ok(isValidate.error,messages.EXPORT_REPORT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.EXPORT_REPORT_FAILURE,RESPONSE_STATUS.error);
    }
  },
  exportLocationFeedbackReport: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await FeedbackReportValidation.findLocationFeedbackReport.validate(request);
      if(!isValidate.error) {
        const { locations, job_types, low_rating , employee_profile_id } = request;
        const findQuery = await commonListing(req.allParams());

        let sql = `SELECT 
            location.name as location_name,location.location_id as location_id,
            concat(user.first_name, " " ,user.last_name) as team_member,
            employee_profile.employee_profile_id as team_member_id ,
            feedback_answer.created_date as submitted_on,
            (
              select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas 
              where fas.employee_profile_id = feedback_answer.employee_profile_id 
              AND fas.location_id = feedback_answer.location_id
              AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
            )as feedback_rating_count_below_three,
            ROUND((SUM(feedback_answer.feedback_rating_scale_id)/(COUNT(feedback_answer.feedback_question_id))),2) AS average_score
        FROM feedback_answer AS feedback_answer
        INNER JOIN feedback_question AS feedback_question ON feedback_question.feedback_question_id = feedback_answer.feedback_question_id
        INNER JOIN location AS location ON  location.location_id = feedback_answer.location_id
        INNER JOIN employee_profile AS employee_profile ON employee_profile.employee_profile_id = feedback_answer.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user AS user ON user.user_id = employee_profile.user_id `;
        if (checkIfArrayExist(locations) || (!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi))) {
          sql = sql + ` INNER JOIN employee_location AS el ON el.employee_profile_id = employee_profile.employee_profile_id `;
        }

        if (checkIfArrayExist(job_types)) {
          sql = sql + ` INNER JOIN employee_job_type AS ejt ON ejt.employee_profile_id = employee_profile.employee_profile_id `;
        }

        sql = sql + `where feedback_question.feedback_category = '${FEEDBACK_CATEGORY.location}'`;

        sql = await locationDatas(locations,sql,employee_profile_id,req);

        if (checkIfArrayExist(job_types)) {
          const jobTypeName = job_types.map((c) => `'${c}'`).join(', ');
          const jobTypeData = '(' + jobTypeName + ')';
          sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
        }

        if(low_rating){
          sql = sql + ` AND (
            select COUNT(fas.feedback_answer_id)  from feedback_answer AS fas 
            where fas.employee_profile_id = feedback_answer.employee_profile_id 
            AND fas.location_id = feedback_answer.location_id
            AND Date(fas.created_date) = Date(feedback_answer.created_date) AND fas.feedback_rating_scale_id < 3
                  ) > 0`;
        }
        let avarageScore = '';
        const andPayload = findQuery.andCondition;

        let values = handleMultiCondition(andPayload,sql,avarageScore);
        sql = values[0];
        avarageScore = values[1];

        sql = sql + ` group by feedback_answer.employee_profile_id,feedback_answer.location_id, DATE(feedback_answer.created_date) ${avarageScore}`;

        const feedBackResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);

        let response = feedBackResult.rows;

        let feedbackReportDetails = (response.length > 0 ) ? response.map(item => {
          return {
            'Location'       : item.location_name,
            'Submitted By'   : item.team_member,
            'Average Rating' : item.average_score,
            'Submitted On'   : getDateTimeSpecificTimeZone(
                item.submitted_on,
                  req.timezone,
                  req.dateTimeFormat
            ),
          };
        }) : [];

        if(feedbackReportDetails.length > 0){
          let curentTimeUTC = getDateUTC();
          !fs.existsSync(`${process.cwd()}/assets/reports/`) && fs.mkdirSync(`${process.cwd()}/assets/reports/`, { recursive: true });
          let fileName = `360Feedback-Location_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD-YYYY_HH_mm_ss')}`;
          let sheetName = `360Feedback-Location_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD-YYYY')}`;
          let feedbackReportSheet = XLSX.utils.json_to_sheet(feedbackReportDetails);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, feedbackReportSheet, sheetName );
          let fileLocation = `${process.cwd()}/assets/reports/`+fileName+'.xlsx';
          XLSX.writeFile(wb, fileLocation);

          let uploadFileName = `${fileName}.xlsx`;
          let containerName = req.account.account_guid;
          let dirName = `${process.env.EXPORTED_EXCEL_REPORT_DIR}`;

          await uploadReport(fileLocation, uploadFileName, containerName, dirName);

          let downLink = `${process.env.BLOB_STORAGE_CDN_URL}/${containerName}/${dirName}/${uploadFileName}`;

          let data = {
            report_download_link: downLink
          };

          res.ok(data,messages.EXPORT_REPORT_SUCCESS,RESPONSE_STATUS.success);
        }else{
          res.ok(undefined,messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
        }
      }else{
        return res.ok(isValidate.error,messages.EXPORT_REPORT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.EXPORT_REPORT_FAILURE,RESPONSE_STATUS.error);
    }
  },
};
