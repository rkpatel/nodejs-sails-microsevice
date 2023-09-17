const messages = sails.config.globals.messages;
const ReportValidation = require('../validations/ReportValidation');
const moment = require('moment');
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const { getDateUTC, convertDateUTC, getDateTimeSpecificTimeZone, getDateSpecificTimeZone, getCurrentTimezoneDate, checkTodaysDate} = require('../utils/common/getDateTime');
const { RESPONSE_STATUS, ACCOUNT_STATUS,  NOTIFICATION_ENTITIES, CRON_JOB_CODE, ACCOUNT_CONFIG_CODE, DAILY_REPORT_PERMISSION } = require('../utils/constants/enums');
const {sendNotification} = require('../services/sendNotification');

const dailyReportDir = process.env.DAILYREPORT_IMG_UPLOAD_DIR_ON_AZURE;

const getImgPath = function (account,file) {
  return `${account.account_guid}/${dailyReportDir}/${file}`;
};

const rResult=async function(rawResult){
  return  rawResult.rows[0] || null;
};

const reportQOptions=async function(f){
  return  f.report_question_option_id !== undefined && f.report_question_option_id !== null;
};
const reportQOptions1=async function(f){
  return  f.report_question_option_id === undefined || f.report_question_option_id === null;
};

const getLocationDetails = async function(req, location_ids){
  let results = '';
  let sql = `SELECT location_id, name FROM location WHERE location_id IN (${location_ids})`;
  const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for(let result of results){
    responseData.push({
      location_id : result.location_id,
      name        : result.name
    });
  }

  return responseData;
};

const getQuestionDetails = async function(req, question_id, question_type_id){
  let results = '';
  let sql = `SELECT q.is_for_dynamic_entity AS is_for_dynamic_entity, q.entity AS entity, q.dynamic_allow_multiple AS dynamic_allow_multiple,
                    qt.title AS question_type_title, qt.field_type AS question_field_type
                    FROM report_question AS q
                    LEFT JOIN question_type AS qt
                    ON q.question_type_id = qt.question_type_id
                    WHERE q.report_question_id  = ${question_id} AND q.question_type_id = ${question_type_id}`;
  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for(let result of results) {
    responseData.push({
      is_for_dynamic_entity : result.is_for_dynamic_entity,
      entity                : result.entity,
      question_type_title   : result.question_type_title,
      question_field_type   : result.question_field_type
    });
  }
  return responseData;
};

const getReportQuestionOptions = async function (req, reportQuestionId) {
  let results = '';
  let sql = `SELECT report_question_option_id, option_key, option_value, sequence
              FROM report_question_option WHERE report_question_id = ${reportQuestionId} AND status = '${ACCOUNT_STATUS.active}'`;
  const rawResult = await sails
    .sendNativeQuery(escapeSqlSearch(sql))
    .usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData = [];
  for (let result of results) {
    responseData.push({
      report_question_option_id : result.report_question_option_id,
      option_key                : result.option_key,
      option_value              : result.option_value,
      sequence                  : result.sequence,
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
  for(let result of results){
    responseData.push({
      job_type_id : result.job_type_id,
      name        : result.name,
      color       : result.color
    });
  }

  return responseData;
};

const qResponse=async function(questionsResponse){
  return questionsResponse ? questionsResponse : [];
};

const getEntityDetails = async function(tenantConnection, optionId) {
  const optionIds = optionId.split(',');
  let result = '<ul style="padding-left: 20px;">';
  for (const item of optionIds){
    const entity = item.split('-');
    const entityType= entity[0];
    if(entityType === 'employee')
    {
      const rawData = await sails.sendNativeQuery(`Select Concat(user.first_name," ",user.last_name) as name from employee_profile inner join ${process.env.DB_NAME}.user on employee_profile.user_id = user.user_id where employee_profile.employee_profile_id = ${entity[1]}`).usingConnection(tenantConnection);
      const employee = rawData.rows;
      if(employee.length > 0)
      {
        result += `<li>${employee[0].name}</li>`;
      }
    }
    else if(entityType === 'task'){
      const rawData = await sails.sendNativeQuery(`Select title from task where task_id = ${entity[1]}`).usingConnection(tenantConnection);
      const task = rawData.rows;
      if(task.length > 0)
      {
        result += `<li>${task[0].title}</li>`;
      }
    }
    else if(entityType === 'note'){
      const rawData = await sails.sendNativeQuery(`SELECT note_type.name, note_type.note_type_id, employee_note.description,
      (select count(distinct employee_note.employee_note_id) from employee_note
      where employee_note.note_type_id = note_type.note_type_id
      ) as note_cut
       FROM employee_note
      join note_type on employee_note.note_type_id = note_type.note_type_id
      where employee_note.employee_note_id = ${entity[1]}`).usingConnection(tenantConnection);
      const note = rawData.rows;
      if(note.length > 0)
      {
        result += `<li>${note[0].name} (${note[0].description})</li>`;
      }
    }
  }
  result += `</ul>`;
  return result;
};

const getReportOptions = async function(tenantConnection, optionId) {
  let results = '';
  const optionIds = optionId.split(',');
  for (const item of optionIds){
    const rawResult = await ReportQuestionOption.find({
      report_question_option_id : item,
      status                    : ACCOUNT_STATUS.active
    }).usingConnection(tenantConnection);
    if(rawResult.length > 0)
    {
      if(results !== '')
      {
        results += (results === 'undefined') ? rawResult[0].option_value: `, ${rawResult[0].option_value}`;
      }
      else{
        results += rawResult[0].option_value;
      }
    }
  }

  return results;
};

const _dailyReport =async (curentTimeUTC,checkTenantTimezone) => {
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
      account_configuration_detail.code IN ($1,$2,$3,$4,$5) and account.status = $6 ;`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.cron_report_submission, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let cron_report_submission = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_report_submission);
    return {
      account_id                  : id,
      tenant_db_connection_string : tenant_db_connection_string ? tenant_db_connection_string.value : '',
      time_zone                   : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
      date_time_format            : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
      date_format                 : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
      cron_report_submission      : cron_report_submission? cron_report_submission.value : process.env.cron_report_submission
    };
  })  : [];

  for(const item of accountArray)
  {

    if(!item.tenant_db_connection_string) {continue;}

    let timezone = item.time_zone ? item.time_zone : '';
    if(timezone === '') {continue;}

    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');

    if(checkTenantTimezone && tenantTime !== item.cron_report_submission){
      continue;
    }
    let connectionString = item.tenant_db_connection_string;
    if(connectionString){
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let tenantConnection = await  mysql.createConnection(connectionString);
      await tenantConnection.connect();
      let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.employee_report_submission }).usingConnection(tenantConnection);

      if(cronJob){
        let currentDate = getDateUTC();
        let end_date =  currentDate;
        let obj; const reportsId=[] || any;
        let start_date=cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') :  '0000-00-00 00:00:00';
        try{
          let receipients =[];
          const rawResult1 = await sails.sendNativeQuery(`Select group_concat(report_submission_id SEPARATOR "," ) as report_submission, location.name, location.location_id
          from report_submission rs join location on rs.location_id = location.location_id where
          reported_date > '${start_date}' AND reported_date <= '${end_date}'
          group by rs.location_id`).usingConnection(tenantConnection);
          const result = rawResult1.rows;
          if(result.length > 0)
          {
            let questioArray = []; let locationwise=[];
            for(const data of result){
              let reportData = [];
              //reports & multiple questions
              const reportSubmissionIds = (data.report_submission).split(',');
              for(let reportSubmissionId of reportSubmissionIds){
                const report_submission_id = reportSubmissionId;
                const questionSql = `select rsd.report_submission_detail_id, report.name as report, report.report_id, CONCAT(user.first_name, ' ', user.last_name) as user_name, rsd.answer,
                rq.title as question,   rq.question_type_id,
                (select GROUP_CONCAT(rsdo.report_question_option_id SEPARATOR ",") FROM report_submission_detail_option
                as rsdo WHERE rsdo.report_question_id = rsd.report_question_id and rsdo.report_submission_detail_id
                =rsd.report_submission_detail_id ) as detail_options,
                (select GROUP_CONCAT(CONCAT(rsed.entity,"-", rsed.entity_id) SEPARATOR ",") FROM report_submission_entity_detail
                as rsed WHERE rsed.report_question_id = rsd.report_question_id
                and rsed.report_submission_detail_id = rsd.report_submission_detail_id ) as entity_detail
                FROM report_submission 
                LEFT JOIN report ON report_submission.report_id = report.report_id
                LEFT JOIN report_submission_detail AS rsd ON rsd.report_submission_id = report_submission.report_submission_id
                join employee_profile as ep on report_submission.employee_profile_id = ep.employee_profile_id
                join ${process.env.DB_NAME}.user ON ep.user_id = user.user_id
                left join report_question as rq on rsd.report_question_id = rq.report_question_id
                left join question_type as qt on rq.question_type_id = qt.question_type_id
                where report_submission.report_submission_id = ${report_submission_id} AND report.status = 'Active'`;
                const rawQuestion = await sails.sendNativeQuery(escapeSqlSearch(questionSql)).usingConnection(tenantConnection);
                const questions = rawQuestion.rows;
                if(questions.length > 0)
                {
                  for(const key of questions){
                    reportsId.push(key.report_id);
                    data.report = key.report;
                    data.submitted_by = key.user_name;
                    let optionsValue;
                    if((key.detail_options !== '') && (key.detail_options !== null)){
                      optionsValue = key.detail_options ? await getReportOptions(tenantConnection, key.detail_options) : [];
                    }
                    else if(key.question_type_id === 6)
                    {
                      optionsValue = (key.answer !== '') ? 'Yes' : 'No';
                    }
                    else if((key.answer !== '') && (key.answer !== null))
                    {
                      optionsValue = key.answer ? key.answer : [];
                    }
                    else if((key.entity_detail !== '') && (key.entity_detail !== null))
                    {
                      optionsValue = key.entity_detail ? await getEntityDetails(tenantConnection, key.entity_detail) : [];
                    }
                    questioArray.push({
                      question : key.question,
                      answer   : optionsValue,
                    });
                  }
                }
                reportData.push({
                  report_name  : data.report,
                  location     : data.name,
                  submitted_by : data.submitted_by,
                  questions    : questioArray
                });
                questioArray = [];
              }
              locationwise.push({
                location_id : data.location_id,
                reports     : reportData,
              });
            }
            //receipient
            let locationIds=[];
            for(const location of locationwise)
            {
              locationIds.push(location.location_id);
            }
            const locationName = locationIds.map((c) => `'${c}'`).join(', ');
            const locationId = '(' + locationName + ')';

            const receipient = await sails.sendNativeQuery(`select CONCAT(user.first_name," ",user.last_name) as user, ep.employee_profile_id, user.user_id, user.email, el.location_id  from location
            inner join employee_location el on location.location_id= el.location_id
            inner join employee_profile ep on el.employee_profile_id = ep.employee_profile_id
            INNER JOIN role_permission rp ON ep.role_id = rp.role_id
            INNER JOIN permission p ON rp.permission_id = p.permission_id AND p.code = '${DAILY_REPORT_PERMISSION.Receive_Daily_Report_Digest}'
            inner join ${process.env.DB_NAME}.user on ep.user_id = user.user_id
            where user.status = 'Active' AND location.location_id IN ${locationId}`).usingConnection(tenantConnection);
            const resultReceipient = receipient.rows;
            if(resultReceipient.length >0)
            {
              receipients = resultReceipient;
            }
            let dataReceive = [...new Set(receipients.map(receipient1 => receipient1.employee_profile_id))];
            let employee;
            for(let receive of dataReceive)
            {
              let finalResponse = [];
              employee = receipients.filter(r => r.employee_profile_id === receive);
              const employeeLocation = await sails.sendNativeQuery(`Select location_id from employee_location where employee_profile_id= ${receive}`).usingConnection(tenantConnection);
              const resultLocation = employeeLocation.rows;
              const receivers = employee.map((index)=>{
                return index.location_id;
              });
              for(let receiver of receivers){
                let finalReport = locationwise.filter((items) =>
                  items.location_id === receiver
                ).map((index)=>{
                  return index.reports;
                });
                finalReport[0].forEach((item2)=>{
                  finalResponse.push(item2);
                });
              }
              const receiverLocation =[...new Set(resultLocation.map(resultLoc => resultLoc.location_id))];
              const locationRec = receiverLocation.map((c) => `'${c}'`).join(', ');
              const locIdRec = '(' + locationRec + ')';
              const missingData = await sails.sendNativeQuery(`SELECT r.report_id, r.name, rl.report_location_id, rl.location_id,l.name AS location
              FROM report AS r
              LEFT JOIN report_location AS rl ON r.report_id = rl.report_id
              LEFT JOIN location AS l ON rl.location_id = l.location_id
              WHERE 
              r.status = 'Active' AND
              rl.report_location_id NOT IN(SELECT report_location_id
              FROM report_location AS rl
              JOIN report_submission AS rs ON rl.location_id = rs.location_id AND rl.report_id = rs.report_id 
              WHERE DATE(rs.reported_date) = CURDATE() GROUP BY rl.report_location_id)
              AND rl.location_id IN ${locIdRec} 
              ORDER BY r.name ASC`).usingConnection(tenantConnection);
              const missingRepports = missingData.rows;
              sails.log('missingRepports',missingRepports);
              finalResponse.sort((a, b) => a.report_name.normalize().localeCompare(b.report_name.normalize()));
              await sendNotification(null,{
                notification_entity : NOTIFICATION_ENTITIES.EMPLOYEE_REPORT_SUBMISSION,
                reports             : finalResponse,
                missingReports      : (missingRepports.length > 0) ? missingRepports: [],
                account_id          : item.account_id,
                receipient          : employee[0]
              });
            }

          }
          await CronJob.update({ code: CRON_JOB_CODE.employee_report_submission },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
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
        sails.log('No Cron Jon with code Employee Report Expire');
      }


      if(tenantConnection){
        await tenantConnection.end();
      }
    }
  }
};

const checkPermissionExistForUser = (_permissionList, _permission)=>{
  if (_permissionList && _permissionList.length > 0) {
    let index = _permissionList.findIndex(permission => permission.code === _permission);
    return index !== -1;
  }else{
    return false;
  }
};

const rQuesOption=async(reportQuestionOptions,reportQuestionId,req)=>{
  const reportQuestionOptions_arr = [];
  for (const reportQuetion of reportQuestionOptions) {
    reportQuestionOptions_arr.push({
      report_question_id : reportQuestionId,
      option_key         : reportQuetion.option_key,
      option_value       : reportQuetion.option_value,
      sequence           : reportQuetion.sequence,
      status             : ACCOUNT_STATUS.active,
      created_by         : req.user.user_id,
      created_date       : getDateUTC(),
      last_updated_by    : req.user.user_id,
    });
  }

  if (reportQuestionOptions_arr.length > 0) {
    await ReportQuestionOption.createEach(
      reportQuestionOptions_arr
    ).usingConnection(req.dynamic_connection);
  }
};

const dataPayload=async(andPayload,filterSql,jobTypeSql)=>{
  for (const data of andPayload) {
    Object.keys(data).forEach((prop) => {
      if (prop === 'employee_name' && (data[prop]).length > 0) {
        filterSql = filterSql + ` AND CONCAT(u.first_name, " ", u.last_name) LIKE '%${escapeSearch(data[prop])}%' `;
      }
      if ((prop === 'job_types') && (data[prop]).length > 0) {
        jobTypeSql = 'LEFT JOIN employee_job_type AS ejtt ON  ejtt.employee_profile_id = ep.employee_profile_id';
        sails.log(jobTypeSql);
        let jobTypePayload = data[prop];
        const jobTypeId = jobTypePayload.map(c => `${c}`).join(', ');
        filterSql = filterSql + ` AND ejtt.job_type_id IN (${jobTypeId})`;
      }
    });
  }
};

const finalData=async(results,req,responseData)=>{
  for (let item of results) {
    responseData.push({
      entity_id     : item.employee_profile_id,
      employee_name : item.employee_name,
      job_types     : item.job_types ? await getJobTypeDetails(req, item.job_types) : ''
    });
  }
};

const nameCreatedBy=async(prop,data,sql)=>{
  if (prop === 'name' && data[prop] !== '') {
    return sql + ` AND rpt.name LIKE '%${escapeSearch(data[prop])}%' `;
  }
  if (prop === 'created_by' && data[prop] !== '') {
    return sql + ` AND (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
  }
};

const locationCondition=async(data,prop,sql)=>{
  if (prop === 'location' && data[prop].length > 0) {
    let locationPayload = data[prop];
    const locationName = locationPayload.map((c) => `'${c}'`).join(', ');
    const locationId = '(' + locationName + ')';
    return sql + ` AND rl.location_id IN ${locationId} `;
  }
};

const anyPayloadDatas=async(findQuery,sql)=>{
  const andPayload = findQuery.andCondition;
  for (const data of andPayload) {
    Object.keys(data).forEach(async(prop) => {
      await nameCreatedBy(prop,data,sql);
      await locationCondition(data,prop,sql);
      if (prop === 'created_date') {
        if (data[prop].from_date !== '' && data[prop].to_date !== '') {
          const startDate = moment(data[prop].from_date).utc().format('YYYY-MM-DD HH:mm');
          const endDate = moment(data[prop].to_date).add(1, 'days').utc().format('YYYY-MM-DD HH:mm');
          return sql +  ` AND (rpt.${prop} BETWEEN ('${startDate}') AND ('${endDate}')) `;
        }
      }
    });
  }
};

const locationsAssignPayloadData=(prop,data,sql)=>{
  if ((prop === 'locations') && (data[prop]).length > 0) {
    let locationPayload = data[prop];
    const locationName = locationPayload.map(c => `'${c}'`).join(', ');
    const locationId = '(' + locationName + ')';
    sql = sql + ` AND rl.location_id IN ${locationId}`;
  }
  return sql;
};

const lastSubmittedAssignPayloadData=(prop,data,sql,req)=>{
  if (prop === 'last_submitted_on') {
    if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
    {
      const startDate =   moment(data[prop].from_date).format('YYYY-MM-DD');
      const endDate = moment(data[prop].to_date).add(1, 'days').format('YYYY-MM-DD');
      sql = sql + ` AND rs.reported_date BETWEEN '${convertDateUTC(startDate,req.timezone,'UTC','YYYY-MM-DD HH:mm:ss')}' AND '${convertDateUTC(endDate,req.timezone,'UTC','YYYY-MM-DD HH:mm:ss')}'`;
    }
  }
  return sql;
};

const reportNameLastUser=(data,prop,sql)=>{
  if ((prop === 'report_name') && (data[prop] !== '')) {
    sql = sql + ` AND r.name LIKE '%${escapeSearch(data[prop])}%'`;
  }
  if ((prop === 'last_submitted_user') && (data[prop] !== '')) {
    sql = sql + ` AND CONCAT(u.first_name, ' ', u.last_name) LIKE '%${escapeSearch(data[prop])}%'`;
  }
  return sql;
};

const assignReportLocationFilterData=(prop1,alldata,locationFilter)=>{
  return ((prop1 === 'locations') && (alldata[prop1]).length > 0) ? true : locationFilter;
};

const assignAnyPayloadDatas=(findQuery,sql,req)=>{
  if ((findQuery.andCondition).length > 0) {
    const andPayload = findQuery.andCondition;
    for (const data of andPayload) {
      Object.keys(data).forEach((prop) => {
        sql = locationsAssignPayloadData(prop,data,sql);
        sql = reportNameLastUser(data,prop,sql);
        sql = lastSubmittedAssignPayloadData(prop,data,sql,req);
      });
    }
  }
  return sql;
};

const lastSubmittedAssignReportListData=async(item,req)=>{
  return (item.last_submitted_on) ? getDateTimeSpecificTimeZone(item.last_submitted_on, req.timezone, req.dateTimeFormat) : '';
};

const noteTypeListQuery=async(prop,data,filterSql)=>{
  if ((prop === 'note_type') && data[prop] !== undefined && data[prop] !== null && data[prop] !== '') {
    return filterSql + ` AND en.note_type_id = '${data[prop]}' `;
  }
};

const empNameListQuery=async(prop,data,filterSql)=>{
  if (prop === 'employee_name' && (data[prop]).length > 0) {
    return filterSql + ` AND CONCAT(u.first_name, " ", u.last_name) LIKE '%${escapeSearch(data[prop])}%' `;
  }
};

const noteListQuery=async(prop,data,filterSql)=>{
  if (prop === 'note' && (data[prop]).length > 0) {
    return filterSql + ` AND en.description LIKE '%${escapeSearch(data[prop])}%' `;
  }
};

const createdByListQuery=async(prop,data,filterSql)=>{
  if (prop === 'created_by' && (data[prop]).length > 0) {
    return filterSql + ` AND CONCAT(uu.first_name, " ", uu.last_name) LIKE '%${escapeSearch(data[prop])}%' `;
  }
};

const createdOnListQuery=async(prop,data,filterSql)=>{
  if (prop === 'created_on' && (data[prop]).length > 0) {
    return filterSql + ` AND DATE(en.created_date) = '${data[prop]}' `;
  }
};

const noteListQueryData=async(findQuery,filterSql)=>{
  if ((findQuery.andCondition).length > 0) {
    const andPayload = findQuery.andCondition;
    for (const data of andPayload) {
      Object.keys(data).forEach((prop) => {
        noteTypeListQuery(prop,data,filterSql);
        empNameListQuery(prop,data,filterSql);
        noteListQuery(prop,data,filterSql);
        createdByListQuery(prop,data,filterSql);
        createdOnListQuery(prop,data,filterSql);
      });
    }
  }
};

const updateReportQuestionDataCondition=async(updateReportQuestionData,updateObj)=>{
  if(updateReportQuestionData.question_id !== undefined && updateReportQuestionData.question_id !== null){
    updateObj.question_id = updateReportQuestionData.question_id;
  }
  return updateObj;
};

const addReportData=async(reportquestionoption_add_arr,req)=>{
  if (reportquestionoption_add_arr.length > 0) {
    return ReportQuestionOption.createEach(
    reportquestionoption_add_arr
    ).usingConnection(req.dynamic_connection);
  }
};

const updateReportData=async(updateReportQuestionOptions,req)=>{
  for (let updateReportQuestionOptionData of updateReportQuestionOptions) {
    return ReportQuestionOption.update(
    {
      report_question_option_id:
        updateReportQuestionOptionData.report_question_option_id,
    },
    {
      option_key        : updateReportQuestionOptionData.option_key,
      option_value      : updateReportQuestionOptionData.option_value,
      sequence          : updateReportQuestionOptionData.sequence,
      last_updated_by   : req.user.user_id,
      last_updated_date : getDateUTC(),
    }
    )
    .fetch()
    .usingConnection(req.dynamic_connection);
  }
};

const reportQuestionOptionData=async(removeReportQuestionOptions,req)=>{
  for (let removeReportQuestionOption of removeReportQuestionOptions) {
    return ReportQuestionOption.update(
    {
      report_question_option_id: removeReportQuestionOption,
    },
    {
      status            : ACCOUNT_STATUS.inactive,
      last_updated_by   : req.user.user_id,
      last_updated_date : getDateUTC(),
    }
    )
    .fetch()
    .usingConnection(req.dynamic_connection);
  }
};

const checkLocationAddData=async(location_add_arr,req)=>{
  if (location_add_arr.length > 0) {
    return ReportLocation.createEach(location_add_arr).usingConnection(req.dynamic_connection);
  }
};

const removeLocationsData=async(removeLocations,req)=>{
  for(let removeLocation of removeLocations){
    await ReportLocation.destroy({ report_id: id, location_id: removeLocation }).fetch().usingConnection(req.dynamic_connection);
  }
};

const reportQuesData=async(ReportQuestion,req,id)=>{
  return  ReportQuestion.find({ report_id: id }).usingConnection(req.dynamic_connection);
};

const rptQuestionsData=async(rptQuestions)=>{
  return rptQuestions.map(x => x.report_question_id);
};

const reqReportQuesData=async(reportQuestions)=>{
  return reportQuestions.filter(f => f.report_question_id !== undefined && f.report_question_id !== null).map(x => x.report_question_id);
};

const addReportQuesData=async(reportQuestions)=>{
  return reportQuestions.filter(f => f.report_question_id === undefined || f.report_question_id === null);
};

const updateReportQuesData=async(reportQuestions)=>{
  return reportQuestions.filter(f => f.report_question_id !== undefined && f.report_question_id !== null);
};

const removeReportQuesData=async(existingReportQuestions,requestReportQuestions)=>{
  return existingReportQuestions.filter(x => !requestReportQuestions.includes(x));
};

const reportQuestionDatas=async(reportQuestionOptions,reportQuestionId,req)=>{
  if (
    reportQuestionOptions !== undefined &&
    reportQuestionOptions !== null
  ) {
    const reportQuestionOptions_arr = [];
    for (const reportQuetion of reportQuestionOptions) {
      reportQuestionOptions_arr.push({
        report_question_id : reportQuestionId,
        option_key         : reportQuetion.option_key,
        option_value       : reportQuetion.option_value,
        sequence           : reportQuetion.sequence,
        status             : ACCOUNT_STATUS.active,
        created_by         : req.user.user_id,
        created_date       : getDateUTC(),
        last_updated_by    : req.user.user_id,
      });
    }

    if (reportQuestionOptions_arr.length > 0) {
      return ReportQuestionOption.createEach(
        reportQuestionOptions_arr
      ).usingConnection(req.dynamic_connection);
    }
  }
};

const updateReportQuestionResultDatas=async(updateReportQuestions,req)=>{
  for (let updateReportQuestionData of updateReportQuestions) {
    let updateObj = {
      title                 : updateReportQuestionData.title,
      description           : updateReportQuestionData.description,
      question_type_id      : updateReportQuestionData.question_type_id,
      is_for_dynamic_entity :
      updateReportQuestionData.is_for_dynamic_entity,
      entity                 : updateReportQuestionData.entity,
      dynamic_remark         : updateReportQuestionData.dynamic_remark,
      dynamic_allow_multiple :
      updateReportQuestionData.dynamic_allow_multiple,
      sequence          : updateReportQuestionData.sequence,
      is_required       : updateReportQuestionData.is_required,
      last_updated_by   : req.user.user_id,
      last_updated_date : getDateUTC(),
    };
    await updateReportQuestionDataCondition(updateReportQuestionData,updateObj);
    await ReportQuestion.update(
    {
      report_question_id: updateReportQuestionData.report_question_id,
    },
    updateObj
    )
    .fetch()
    .usingConnection(req.dynamic_connection);

    const reportQuestionOptions =
    updateReportQuestionData.reportQuestionOptions;
    if (
      reportQuestionOptions !== undefined &&
    reportQuestionOptions !== null
    ) {
      const rptQueOptions = await ReportQuestionOption.find({
        report_question_id: updateReportQuestionData.report_question_id,
      }).usingConnection(req.dynamic_connection);
      const existingReportQuestionOptions = rptQueOptions.map(
      (x) => x.report_question_option_id
      );
      const requestReportQuestionOptions = reportQuestionOptions
      .filter((f) => f.report_question_option_id !== undefined && f.report_question_option_id !== null)
      .map((x) => x.report_question_option_id);
      const addReportQuestionOptions = reportQuestionOptions.filter(
      (f) => f.report_question_option_id === undefined || f.report_question_option_id === null
      );
      const updateReportQuestionOptions = reportQuestionOptions.filter(
      (f) => f.report_question_option_id !== undefined && f.report_question_option_id !== null
      );
      const removeReportQuestionOptions =
      existingReportQuestionOptions.filter(
        (x) => !requestReportQuestionOptions.includes(x)
      );

      const reportquestionoption_add_arr = addReportQuestionOptions.map(
      (x) => {
        return {
          report_question_id:
            updateReportQuestionData.report_question_id,
          option_key      : x.option_key,
          option_value    : x.option_value,
          sequence        : x.sequence,
          status          : ACCOUNT_STATUS.active,
          created_by      : req.user.user_id,
          created_date    : getDateUTC(),
          last_updated_by : req.user.user_id,
        };
      }
      );
      await addReportData(reportquestionoption_add_arr,req);
      await updateReportData(updateReportQuestionOptions,req);
      await reportQuestionOptionData(removeReportQuestionOptions,req);
    }
  }
};

const removeQuestionData=async(removeReportQuestions,req)=>{
  for (let removeReportQuestion of removeReportQuestions) {
    return ReportQuestion.update(
      { report_question_id: removeReportQuestion },
      {
        status            : ACCOUNT_STATUS.inactive,
        last_updated_by   : req.user.user_id,
        last_updated_date : getDateUTC(),
      }
    )
      .fetch()
      .usingConnection(req.dynamic_connection);
  }
};

const taskStatusData=async(prop,data,filterSql)=>{
  if (prop === 'task_status' && (data[prop]).length > 0) {
    let value = data[prop];
    if(value === 'Pending') {
      return filterSql + ` AND (t.task_status = 'Pending' OR  t.task_status = 'Overdue') `;
    } else if(value === 'Completed'){
      return filterSql + ` AND t.task_status = '${data[prop]}' `;
    }
  }
};

const taskTypeData=async(prop,data,filterSql)=>{
  if ((prop === 'task_type') && ((data[prop]).length > 0)) {
    let taskPayload = data[prop];
    const taskName = taskPayload.map(c => `'${c}'`).join(', ');
    const taskId = '(' + taskName + ')';
    return filterSql + ` AND t.task_type_id IN ${taskId}`;
  }
};

const taskByData=async(prop,data,filterSql)=>{
  if (prop === 'task_title' && (data[prop]).length > 0) {
    return filterSql + ` AND t.title LIKE '%${escapeSearch(data[prop])}%' `;
  }
};

const createdByDatas=async(prop,data,filterSql)=>{
  if (prop === 'created_by' && (data[prop]).length > 0) {
    return filterSql + ` AND CONCAT(u.first_name, " ", u.last_name) LIKE '%${escapeSearch(data[prop])}%' `;
  }
};

const assigneData=async(prop,data,filterSql)=>{
  if (prop === 'assigne' && (data[prop]).length > 0) {
    return filterSql + ` AND CONCAT(uu.first_name, " ", uu.last_name) LIKE '%${escapeSearch(data[prop])}%' `;
  }
};

const createdData=async(prop,data,filterSql)=>{
  if (prop === 'created_on' && (data[prop]).length > 0) {
    return filterSql + ` AND DATE(t.created_date) = '${data[prop]}' `;
  }
};

const dueOnData=async(prop,data,filterSql)=>{
  if (prop === 'due_on' && (data[prop]).length > 0) {
    return filterSql + ` AND t.end_date = '${data[prop]}' `;
  }
};

const taskStatus=async(item)=>{
  return (item.task_status !== 'Overdue') ? item.task_status : 'Pending';
};

const createdOnData=async(item,req)=>{
  return item.created_on ? getDateSpecificTimeZone(item.created_on,  req.timezone,req.dateFormat) : '';
};

const responseResultData=async(results,allData,res,resultsLength,req)=>{
  if (results) {
    let responseData = [];
    for (let item of results) {
      responseData.push({
        entity_id           : item.task_id,
        task_status         : await taskStatus(item),
        task_type           : item.task_type,
        task_title          : item.task_title,
        created_by          : item.created_by,
        assigne             : item.assigne,
        created_on          : await createdOnData(item,req),
        due_on              : item.due_on,
        image_url           : item.image_url,
        image_thumbnail_url : item.image_thumbnail_url
      });
    }

    allData = {
      totalRecords : resultsLength.length,
      taskListData : responseData
    };

    return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);

  } else {
    return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
  }
};

const subResultsData=async(subResults,entityResponse)=>{
  for (let subItem of subResults) {
    if(subItem.task_id !== null) {
      entityResponse.push({
        task_id             : subItem.task_id,
        task_title          : subItem.title,
        task_description    : subItem.description,
        task_type           : subItem.task_type,
        remarks             : subItem.remarks,
        image_url           : subItem.image_url,
        image_thumbnail_url : subItem.image_thumbnail_url
      });
    }
  }
  return entityResponse;
};


const subResultsData2=async(entityResponse,subResults)=>{
  for (let subItemEmployee of subResults) {
    if(subItemEmployee.employee_profile_id !== null) {
      entityResponse.push({
        employee_profile_id : subItemEmployee.employee_profile_id,
        employee_name       : subItemEmployee.employee_name,
        remarks             : subItemEmployee.remarks
      });
    }
  }
  return entityResponse;
};


const subResultsData3=async(subResults,entityResponse)=>{
  for (let subItemNote of subResults) {
    if(subItemNote.employee_profile_id !== null) {
      entityResponse.push({
        employee_profile_id : subItemNote.employee_profile_id,
        employee_name       : subItemNote.employee_name,
        note                : subItemNote.description,
        note_type           : subItemNote.note_type_name,
        remarks             : subItemNote.remarks
      });
    }
  }
  return entityResponse;
};


const qresultData=async(qresults,optionResponse)=>{
  for (let qItem of qresults) {
    optionResponse.push({
      report_question_option_id : qItem.report_question_option_id,
      option_key                : qItem.option_key,
      option_value              : qItem.option_value,
      sequence                  : qItem.sequence
    });
  }
  return optionResponse;
};

const checkBoxesCondition=async(questionAnswer,question_type_title,question_option,subResults)=>{
  if(question_type_title === 'Checkboxes' && question_option !== null) {
    let question_option_array = question_option.split(',').map((value) => parseInt(value));
    questionAnswer = question_option_array;
  }  else {
    questionAnswer = parseInt(subResults.question_option);
  }
  return questionAnswer;
};

const handleEntityResponse = async(entity,subsql,questionAnswer,entityResponse,req,subResults,report_submission_detail_id) => {
  if(entity === 'task') {
    subsql = `SELECT
      rse.remarks, t.task_id, t.title, t.description, tt.name AS task_type, ti.image_url, ti.image_thumbnail_url
      FROM report_submission AS rs
      LEFT JOIN report_submission_detail AS rsd ON rsd.report_submission_id = rs.report_submission_id
      LEFT JOIN report_submission_entity_detail AS rse ON rse.report_submission_detail_id = rsd.report_submission_detail_id AND rse.report_question_id = rsd.report_question_id
      LEFT JOIN task AS t ON rse.entity_id = t.task_id
      LEFT JOIN task_type AS tt ON tt.task_type_id = t.task_type_id
      LEFT JOIN task_image AS ti ON ti.task_id = t.task_id
      WHERE rsd.report_submission_detail_id = ${report_submission_detail_id} GROUP BY t.task_id`;
    sails.log(subsql);
    const subRawResult = await sails.sendNativeQuery(escapeSqlSearch(subsql)).usingConnection(req.dynamic_connection);
    subResults = subRawResult.rows;
    questionAnswer = await subResultsData(subResults,entityResponse);
  }else if (entity === 'employee') {
    subsql = `SELECT
      rse.remarks, ep.employee_profile_id, CONCAT(u.first_name, ' ', u.last_name) AS employee_name
      FROM report_submission AS rs
      LEFT JOIN report_submission_detail AS rsd ON rsd.report_submission_id = rs.report_submission_id
      LEFT JOIN report_submission_entity_detail AS rse ON rse.report_submission_detail_id = rsd.report_submission_detail_id AND rse.report_question_id = rsd.report_question_id
      LEFT JOIN employee_profile AS ep ON rse.entity_id = ep.employee_profile_id
      LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
      WHERE rsd.report_submission_detail_id = ${report_submission_detail_id}`;
    const subRawResult = await sails.sendNativeQuery(escapeSqlSearch(subsql)).usingConnection(req.dynamic_connection);
    subResults = subRawResult.rows;
    questionAnswer = await subResultsData2(entityResponse,subResults);
  }else if (entity === 'note') {
    subsql = `SELECT
      rse.remarks, ep.employee_profile_id, CONCAT(u.first_name, ' ', u.last_name) AS employee_name, nt.name AS note_type_name, en.description
      FROM report_submission AS rs
      LEFT JOIN report_submission_detail AS rsd ON rsd.report_submission_id = rs.report_submission_id
      LEFT JOIN report_submission_entity_detail AS rse ON rse.report_submission_detail_id = rsd.report_submission_detail_id AND rse.report_question_id = rsd.report_question_id
      LEFT JOIN employee_note AS en ON rse.entity_id = en.employee_note_id
      LEFT JOIN note_type AS nt ON nt.note_type_id = en.note_type_id
      LEFT JOIN employee_profile AS ep ON en.employee_profile_id = ep.employee_profile_id
      LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
      WHERE rsd.report_submission_detail_id = ${report_submission_detail_id}`;
    const subRawResult = await sails.sendNativeQuery(escapeSqlSearch(subsql)).usingConnection(req.dynamic_connection);
    subResults = subRawResult.rows;
    questionAnswer = await subResultsData3(subResults,entityResponse);
  }

  return questionAnswer;
};

const attachementData=async(questionAnswer,answer,question_type_title)=>{
  if(question_type_title === 'Attachment') {
    if(answer !== undefined && answer !== null && answer !== ''){
      questionAnswer = `${process.env.PROFILE_PIC_CDN_URL}/${answer}`;
    } else {
      questionAnswer = '';
    }
  }
  return questionAnswer;
};

const optionResponseData=async(optionResponse)=>{
  return (optionResponse) ? optionResponse : '';
};

const reportSubmissionData=async(reportSubmissionResult,req)=>{
  return reportSubmissionResult.report_locations ?  getLocationDetails(req, reportSubmissionResult.report_locations) : '';
};

const reportResponseLastSubmittedOnData=(item,req)=>{
  return (item.last_submitted_on) ? getDateTimeSpecificTimeZone(item.last_submitted_on, req.timezone, req.dateTimeFormat) : '';
};

const reportResponseArrayDatas=(results,reportResponse,req,resultsLength)=>{
  for (let item of results) {
    reportResponse.push({
      report_submission_id : item.report_submission_id,
      reportId             : item.report_id,
      report_name          : item.report_name,
      location             : item.location_name,
      last_submitted_user  : item.last_submitted_user,
      last_submitted_on    : reportResponseLastSubmittedOnData(item,req)
    });
  }
  let newData={};
  newData = {
    totalRecords : resultsLength.length,
    listData     : reportResponse
  };
  return newData;
};

const submitReportLocationFilter=(prop,data,sql)=>{
  if ((prop === 'locations') && (data[prop]).length > 0) {
    let locationPayload = data[prop];
    const locationName = locationPayload.map(c => `'${c}'`).join(', ');
    const locationId = '(' + locationName + ')';
    sql = sql + ` AND rs.location_id IN ${locationId}`;
  }
  return sql;
};

const submitReportNameFilter=(prop,data,sql)=>{
  if ((prop === 'report_name') && (data[prop] !== '')) {
    sql = sql + ` AND r.name LIKE '%${escapeSearch(data[prop])}%'`;
  }
  return sql;
};

const submitLastSubmitFilter=(prop,data,sql)=>{
  if ((prop === 'last_submitted_user') && (data[prop] !== '')) {
    sql = sql + ` AND CONCAT(u.first_name, ' ', u.last_name) LIKE '%${escapeSearch(data[prop])}%'`;
  }
  return sql;
};

const submitLastSubmittedOnFilter=(prop,data,sql,req)=>{
  if (prop === 'last_submitted_on') {
    if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
    {
      const startDate = moment(data[prop].from_date).format('YYYY-MM-DD');
      const endDate = moment(data[prop].to_date).add(1, 'days').format('YYYY-MM-DD');
      sql = sql + ` AND rs.reported_date BETWEEN '${convertDateUTC(startDate,req.timezone,'UTC','YYYY-MM-DD HH:mm:ss')}' AND '${convertDateUTC(endDate,req.timezone,'UTC','YYYY-MM-DD HH:mm:ss')}'`;
    }
  }
  return sql;
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await ReportValidation.add.validate(request);
      if (!isValidate.error) {
        const { name, locations, reportQuestions } = req.allParams();
        const newReport = await Report.create({
          name,
          status          : ACCOUNT_STATUS.active,
          created_by      : req.user.user_id,
          last_updated_by : req.user.user_id,
          created_date    : getDateUTC(),
        }).fetch().usingConnection(req.dynamic_connection);

        const reportId = newReport.report_id;

        if (locations !== undefined && locations !== null) {
          const locations_arr = locations.map((location_id) => { return { report_id: reportId, location_id: location_id, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
          if (locations_arr.length > 0) {
            await ReportLocation.createEach(locations_arr).usingConnection(req.dynamic_connection);
          }
        }
        sails.log(reportQuestions);
        for (let reportQuestion of reportQuestions) {
          const newReportQuestion = await ReportQuestion.create({
            report_id              : reportId,
            title                  : reportQuestion.title,
            description            : reportQuestion.description,
            question_id            : reportQuestion.question_id,
            question_type_id       : reportQuestion.question_type_id,
            is_for_dynamic_entity  : reportQuestion.is_for_dynamic_entity,
            entity                 : reportQuestion.entity,
            dynamic_remark         : reportQuestion.dynamic_remark,
            dynamic_allow_multiple : reportQuestion.dynamic_allow_multiple,
            sequence               : reportQuestion.sequence,
            is_required            : reportQuestion.is_required,
            status                 : ACCOUNT_STATUS.active,
            created_by             : req.user.user_id,
            last_updated_by        : req.user.user_id,
            created_date           : getDateUTC(),
          })
            .fetch()
            .usingConnection(req.dynamic_connection);

          const reportQuestionId = newReportQuestion.report_question_id;

          const reportQuestionOptions = reportQuestion.reportQuestionOptions;
          if (
            reportQuestionOptions !== null &&
            reportQuestionOptions !== undefined
          ) {
            await rQuesOption(reportQuestionOptions,reportQuestionId,req);
          }
        }

        return res.ok(
          reportId,
          messages.ADD_REPORT_SUCCESS,
          RESPONSE_STATUS.success
        );
      } else {
        res.ok(
          isValidate.error,
          messages.ADD_REPORT_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.SOMETHING_WENT_WRONG,
        RESPONSE_STATUS.error
      );
    }
  },

  find: async function (req, res) {
    try {
      let request = req.allParams();
      const findQuery = await commonListing(request);
      let results;
      const isValidate = await ReportValidation.filter.validate(request);
      if (!isValidate.error) {

        let sql = `SELECT DISTINCT rpt.report_id,
                (SELECT GROUP_CONCAT(name)
                    FROM location
                    WHERE location_id IN (
                        SELECT DISTINCT location_id
                        FROM report_location
                        WHERE report_id = rl.report_id)) as location_name,
                rpt.name as report_name,
                rpt.created_date as created_date,
                rpt.status as status,
                CONCAT(user.first_name, " ", user.last_name) AS created_by
                FROM report As rpt
                LEFT JOIN report_location rl ON rpt.report_id = rl.report_id
                INNER JOIN ${process.env.DB_NAME}.user
                ON user.user_id = rpt.created_by `;


        if(!checkPermissionExistForUser(req.permissions,DAILY_REPORT_PERMISSION.VIEW_ALL_LOCATIONS)){
          const emp_profile_id = req.token.employee_profile_id;
          const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${emp_profile_id}"`;
          const rawRes = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
          sql = sql + `AND rl.location_id IN ( ${rawRes.rows.map(location => location.location_id) } )`;
        }

        if (findQuery.andCondition.length > 0) {
          await anyPayloadDatas(findQuery,sql);
        }

        sql = sql + ` ORDER BY ${findQuery.sort} `;
        const lengthsql = sql;
        const rawResultLength = await sails
          .sendNativeQuery(escapeSqlSearch(lengthsql))
          .usingConnection(req.dynamic_connection);

        const resultsLength = rawResultLength.rows;
        sql = sql + `limit ${findQuery.rows} offset ${findQuery.skip} `;

        const rawResult = await sails
          .sendNativeQuery(escapeSqlSearch(sql))
          .usingConnection(req.dynamic_connection);

        results = rawResult.rows;

        if (results.length > 0) {
          const response = await results.map((item) => {
            return {
              report_id    : item.report_id,
              name         : item.report_name,
              location     : item.location_name,
              status       : item.status,
              created_date : item.created_date ? getDateSpecificTimeZone(item.created_date,req.dateFormat) : '',
              created_by   : item.created_by,
            };
          });
          let data = {
            list        : response,
            totalResult : resultsLength.length,
          };
          return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
    } catch(err) {
      sails.log(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await ReportValidation.edit.validate(request);
      if (!isValidate.error) {
        const ReportDetail = await Report.findOne({ report_id: request.id }).usingConnection(req.dynamic_connection);
        if(ReportDetail) {
          const { id, name, locations, reportQuestions } = req.allParams();

          const rptLocations = await ReportLocation.find({ report_id: id }).usingConnection(req.dynamic_connection);
          let existingLocations = rptLocations.map(x => x.location_id);
          let unionLocations = [...new Set([...locations, ...existingLocations])];
          let addLocations = unionLocations.filter(x => !existingLocations.includes(x));
          let removeLocations = unionLocations.filter(x => !locations.includes(x));

          const location_add_arr = addLocations.map((location_id) => { return { report_id: id, location_id: location_id, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
          await checkLocationAddData(location_add_arr,req);

          await removeLocationsData(removeLocations,req);

          const rptQuestions = await reportQuesData(ReportQuestion,req,id);
          const existingReportQuestions = await rptQuestionsData(rptQuestions);
          const requestReportQuestions = await reqReportQuesData(reportQuestions);
          const addReportQuestions = await addReportQuesData(reportQuestions);
          const updateReportQuestions = await updateReportQuesData(reportQuestions);
          const removeReportQuestions = await removeReportQuesData(existingReportQuestions,requestReportQuestions);

          for (let reportQuestion of addReportQuestions){
            const newReportQuestion = await ReportQuestion.create({
              report_id              : id,
              title                  : reportQuestion.title,
              description            : reportQuestion.description,
              question_id            : reportQuestion.question_id,
              question_type_id       : reportQuestion.question_type_id,
              is_for_dynamic_entity  : reportQuestion.is_for_dynamic_entity,
              entity                 : reportQuestion.entity,
              dynamic_remark         : reportQuestion.dynamic_remark,
              dynamic_allow_multiple : reportQuestion.dynamic_allow_multiple,
              sequence               : reportQuestion.sequence,
              is_required            : reportQuestion.is_required,
              status                 : ACCOUNT_STATUS.active,
              created_by             : req.user.user_id,
              last_updated_by        : req.user.user_id,
              created_date           : getDateUTC(),
            })
              .fetch()
              .usingConnection(req.dynamic_connection);

            const reportQuestionId = newReportQuestion.report_question_id;

            const reportQuestionOptions = reportQuestion.reportQuestionOptions;
            await reportQuestionDatas(reportQuestionOptions,reportQuestionId,req);
          }

          await updateReportQuestionResultDatas(updateReportQuestions,req);

          await removeQuestionData(removeReportQuestions,req);

          await Report.update({ report_id: id },{
            name,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          return res.ok(id, messages.UPDATE_REPORT_SUCCESS, RESPONSE_STATUS.success);
        } else {
          return res.ok(ReportDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValidate.error, messages.UPDATE_REPORT_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
    }
  },

  CheckReportExist: async function (req, res) {
    try {
      let request = req.allParams();
      const { reportId, locationIds, reportName } = request;
      const isValidate = await ReportValidation.CheckReportExistValidation.validate(request);
      let locId=locationIds.map((c) => `'${c}'`).join(', ');
      if (!isValidate.error) {
        let sql = `SELECT DISTINCT
                    rpt.report_id as report_id,
                    rpt.name as report_name
                      FROM report AS rpt
                      WHERE rpt.report_id IN
                      (SELECT DISTINCT rl.report_id FROM
                      report_location AS rl WHERE rl.location_id IN (${locId}))
                      AND rpt.name = '${escapeSearch(reportName)}' `;

        if(reportId !== null && reportId !== undefined && reportId !== ''){
          sql = sql + `AND rpt.report_id <> '${reportId}'`;
        }

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        let results = rawResult.rows;
        if (results.length > 0) {
          return res.ok(undefined, messages.REPORT_ALREADY_EXIST, RESPONSE_STATUS.warning);
        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        return res.ok(isValidate.error, messages.GET_RECORD, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  findDailyReport: async function (req, res) {
    let results;
    results = await Report.find({
      where: { status: ACCOUNT_STATUS.active },
    }).usingConnection(req.dynamic_connection);

    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const dailyReportList = results.map((item) => ({
      report_id : item.report_id,
      name      : item.name,
    }));
    return res.ok(dailyReportList,messages.GET_RECORD,RESPONSE_STATUS.success);
  },

  dailyReportGroupingList: async (req, res) => {
    try {
      let results;
      let reportDetailsResults;
      let response = [];
      let sql = `SELECT
              location_id as location_id,
              name as location_name
              FROM location
              WHERE location_id IN
                (SELECT DISTINCT location_id
                FROM report_location)`;
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      results = rawResult.rows;

      for (let result of results) {
        const locationId = result.location_id;
        const locationName = result.location_name;
        let reportSql = `SELECT
                      rpt.name as report_name,
                      rpt.report_id as report_id
                        FROM report_location AS rpl
                      LEFT JOIN report AS rpt ON
                        rpl.report_id = rpt.report_id
                        WHERE rpl.location_id = ${locationId}`;
        const rawReportResult = await sails.sendNativeQuery(escapeSqlSearch(reportSql)).usingConnection(req.dynamic_connection);

        let reportDetailsArr = [];
        reportDetailsResults = rawReportResult.rows;
        if(reportDetailsResults) {
          for (let reportDetailsResult of reportDetailsResults) {
            reportDetailsArr.push({
              report_id   : reportDetailsResult.report_id,
              report_name : reportDetailsResult.report_name,
            });
          }
          response.push({
            location_id   : locationId,
            location_name : locationName,
            reports       : reportDetailsArr
          });
        }
      }
      return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  activate: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await ReportValidation.delete.validate(request);
      if (!isValidate.error) {
        const { report_id, status } = req.allParams();
        await Report.update({ report_id: report_id }, { status: status })
          .fetch()
          .usingConnection(req.dynamic_connection);

        if (status === ACCOUNT_STATUS.active) {
          res.ok(undefined, messages.ACTIVE_REPORT, RESPONSE_STATUS.success);
        } else if (status === ACCOUNT_STATUS.inactive) {
          res.ok(undefined, messages.INACTIVE_REPORT, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.DELETE_FAIL, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.DELETE_FAIL, RESPONSE_STATUS.error);
    }
  },

  findById: async function (req, res) {
    try {
      const report_id = parseInt(req.params.id);
      const ReportDetail = await Report.findOne({report_id}).usingConnection(req.dynamic_connection);
      if (ReportDetail) {
        let results;
        let sql = `SELECT
                  rpt.name as report_name,
                  (SELECT GROUP_CONCAT(location_id)
                      FROM report_location
                      WHERE report_id = ${report_id}) as locations,
                  rpt.created_date as created_date,
                  CONCAT(user.first_name, " ", user.last_name) AS created_by
                  FROM report As rpt
                  INNER JOIN ${process.env.DB_NAME}.user
                  ON user.user_id = rpt.created_by
                  WHERE rpt.report_id = ${report_id} AND rpt.status = '${ACCOUNT_STATUS.active}'`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = await rResult(rawResult);

        if (results) {
          let questionSql = `SELECT DISTINCT
          q.report_question_id as report_question_id, q.title as question_title, q.description as question_description, q.question_type_id as question_type_id,
          q.is_for_dynamic_entity as is_for_dynamic_entity, q.entity as entity, q.dynamic_remark as dynamic_remark, q.is_required as is_required,
          q.dynamic_allow_multiple as dynamic_allow_multiple, q.created_date as created_date, qt.title as question_type_title, qt.field_type as question_field_type,
          q.question_id as question_id,
          rsd.notes
          FROM report_question AS q
          LEFT JOIN question_type AS qt ON q.question_type_id = qt.question_type_id
          LEFT JOIN report_submission_detail AS rsd ON rsd.report_question_id = q.report_question_id
          WHERE q.report_id = ${report_id} AND q.status = '${ACCOUNT_STATUS.active}'
          ORDER BY q.sequence ASC`;

          const rawQuestionsResult = await sails.sendNativeQuery(escapeSqlSearch(questionSql)).usingConnection(req.dynamic_connection);
          const questionsResults = rawQuestionsResult.rows;
          let questionsResponse = [];
          for (let questionsResult of questionsResults) {
            const optionsValue = questionsResult.report_question_id ? await getReportQuestionOptions(req, questionsResult.report_question_id) : [];
            questionsResponse.push({
              question_id            : questionsResult.question_id,
              report_question_id     : questionsResult.report_question_id,
              title                  : questionsResult.question_title,
              description            : questionsResult.question_description,
              question_type_id       : questionsResult.question_type_id,
              is_required            : questionsResult.is_required === 1,
              is_for_dynamic_entity  : questionsResult.is_for_dynamic_entity,
              entity                 : questionsResult.entity,
              dynamic_remark         : questionsResult.dynamic_remark,
              dynamic_allow_multiple : questionsResult.dynamic_allow_multiple,
              created_date           : questionsResult.created_date,
              field_type             : questionsResult.field_type,
              options                : optionsValue,
              notes                  : questionsResult.notes,
              isReportQuestion       : true,
              is_predefined          : questionsResult.question_id !== null
            });
          }

          results.name = results.report_name;
          results.locations = results.locations ? await getLocationDetails(req, results.locations) : '';
          results.questions = await qResponse(questionsResponse);

          return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);

        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  assignedReportList: async function (req, res) {
    try {
      let results;
      let request = req.allParams();
      const { offset, perPage, flag } = request;
      const findQuery = await commonListing(request);
      let locationFilter = false;
      if ((findQuery.andCondition).length > 0) {
        const andPayload = findQuery.andCondition;
        for (const alldata of andPayload) {
          Object.keys(alldata).forEach((prop1) => {
            locationFilter = assignReportLocationFilterData(prop1,alldata,locationFilter);
          });
        }
      }

      let sql = `SELECT
              r.report_id AS report_id,
              r.name AS report_name,
              rs.employee_profile_id AS last_submitted_by,
              l.name AS location_name,
              rl.location_id,
              CONCAT(u.first_name, ' ', u.last_name) AS last_submitted_user,
              rs.reported_date AS last_submitted_on,
              rs.report_submission_id,
              rs.status
              FROM report AS r
              LEFT JOIN report_location AS rl ON r.report_id = rl.report_id
              LEFT JOIN location AS l ON rl.location_id = l.location_id
              LEFT JOIN report_submission AS rs ON rs.report_id = r.report_id AND rs.location_id = rl.location_id
              AND rs.report_submission_id =
                      (
                        SELECT MAX(report_submission_id)
                        FROM report_submission AS rss
                        WHERE rss.report_id = rs.report_id AND rss.location_id = rs.location_id
                      )
              LEFT JOIN employee_profile AS epp ON rs.employee_profile_id = epp.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON epp.user_id = u.user_id
              WHERE r.status = '${ACCOUNT_STATUS.active}' AND (rs.status = 'draft' OR rs.status IS NULL) `;

      if(locationFilter === false)
      {
        sql = sql + ` AND rl.location_id IN (SELECT location_id
                    FROM employee_location AS el
                    LEFT JOIN employee_profile AS ep ON el.employee_profile_id = ep.employee_profile_id
                    LEFT JOIN ${process.env.DB_NAME}.user AS us ON ep.user_id = us.user_id
                    WHERE us.user_id = ${req.user.user_id})`;
      }
      if(flag === 'dashboard') {
        sql = sql + `AND (rs.report_submission_id IS NULL OR
                    (rs.report_submission_id NOT IN (SELECT rsi.report_submission_id
                    FROM report_submission AS rsi
                    LEFT JOIN employee_profile AS ep ON rsi.employee_profile_id = ep.employee_profile_id
                    LEFT JOIN ${process.env.DB_NAME}.user AS us ON ep.user_id = us.user_id
                    WHERE us.user_id = ${req.user.user_id} AND DATE(rsi.reported_date) = '${getCurrentTimezoneDate(req.timezone)}')))`;
      }

      sql = assignAnyPayloadDatas(findQuery,sql,req);

      sql=flag === 'dashboard' ? sql + ` ORDER BY r.name ASC ` : sql + ` ORDER BY ${findQuery.sort} `;

      const lengthsql = sql;
      const totalRecords = await sails.sendNativeQuery(escapeSqlSearch(lengthsql)).usingConnection(req.dynamic_connection);
      const resultsLength = totalRecords.rows;
      sql = sql + `limit ${perPage} offset ${offset}`;

      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      results = rawResult.rows;

      if (results) {
        let allData = {};
        let reportResponse = [];
        for (let item of results) {
          reportResponse.push({
            reportId             : item.report_id,
            report_submission_id : item.report_submission_id,
            report_name          : item.report_name,
            location             : item.location_name,
            location_id          : item.location_id,
            status               : item.status,
            last_submitted_user  : item.last_submitted_user,
            last_submitted_on    : await lastSubmittedAssignReportListData(item,req),
            is_submitted         : await checkTodaysDate(getDateSpecificTimeZone(item.last_submitted_on, req.timezone, req.dateFormat),getDateSpecificTimeZone(getDateUTC(), req.timezone, req.dateFormat))
          });
        }

        allData = {
          totalRecords : resultsLength.length,
          listData     : reportResponse
        };

        return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);

      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  submitReport: async function (req, res) {
    try {
      let request = req.allParams();
      const isValid = await ReportValidation.submitReport.validate(request);
      if (!isValid.error) {
        const { report_id, location_id, reportAnswers , status} = req.allParams();
        const employee_profile_id = req.token.employee_profile_id;
        let submitId;
        const isExist = await ReportSubmission.findOne({report_id,location_id,employee_profile_id}).usingConnection(req.dynamic_connection);
        if(isExist){
          submitId = isExist.report_submission_id;
          await ReportSubmissionDetail.destroy({ report_submission_id: isExist.report_submission_id}).usingConnection(req.dynamic_connection);

          await ReportSubmission.update({ report_submission_id: isExist.report_submission_id }, {
            status        : status,
            reported_date : getDateUTC()
          }).usingConnection(req.dynamic_connection);

          const report_submission_id = isExist.report_submission_id;

          if(report_submission_id) {
            for (const data of reportAnswers) {
              const report_question_id = data.report_question_id;
              const question_type_id = data.question_type_id;
              const getQuestionDetail = (report_question_id && question_type_id) ? await getQuestionDetails(req, report_question_id, question_type_id) : [];
              const questionDetail = getQuestionDetail[0];
              const is_for_dynamic_entity = questionDetail.is_for_dynamic_entity;

              if(is_for_dynamic_entity === 1) {
                const entityName = questionDetail.entity;
                const reportSubmissionDetail = await ReportSubmissionDetail.create({
                  report_submission_id : report_submission_id,
                  report_id            : report_id,
                  report_question_id   : report_question_id,
                }).fetch().usingConnection(req.dynamic_connection);
                const report_submission_detail_id = reportSubmissionDetail.report_submission_detail_id;

                const entity = data.entity;
                if(entity !== undefined && entity !== null && entity.length > 0) {
                  for (const en of entity) {
                    await ReportSubmissionEntityDetail.create({
                      report_submission_detail_id : report_submission_detail_id,
                      report_question_id          : report_question_id,
                      entity                      : entityName,
                      entity_id                   : en.entity_id,
                      remarks                     : en.entity_remarks
                    }).fetch().usingConnection(req.dynamic_connection);
                  }
                }
              } else {
                const question_field_type = questionDetail.question_field_type;
                if(question_field_type === 'TextField' || question_field_type === 'FileAttachment') {
                  let answer = '';
                  if(data.answer !== undefined && data.answer !== null) {
                    if(question_field_type === 'FileAttachment') {
                      answer = data.answer ? getImgPath(req.account,data.answer) : '';
                    } else {
                      answer = data.answer;
                    }
                  }
                  await ReportSubmissionDetail.create({
                    report_submission_id : report_submission_id,
                    report_id            : report_id,
                    report_question_id   : report_question_id,
                    answer               : answer,
                    notes                : data.notes
                  }).fetch().usingConnection(req.dynamic_connection);

                } else if(question_field_type === 'RadioButton' || question_field_type === 'Checkbox') {

                  const reportSubmissionDetail = await ReportSubmissionDetail.create({
                    report_submission_id : report_submission_id,
                    report_id            : report_id,
                    report_question_id   : report_question_id,
                    notes                : data.notes
                  }).fetch().usingConnection(req.dynamic_connection);
                  const report_submission_detail_id = reportSubmissionDetail.report_submission_detail_id;

                  if(question_field_type === 'RadioButton') {
                    const report_question_option_id = data.report_question_option_id;

                    if(report_question_option_id !== undefined && report_question_option_id !== null && report_question_option_id !== '') {
                      await ReportSubmissionDetailOption.create({
                        report_submission_detail_id : report_submission_detail_id,
                        report_question_id          : report_question_id,
                        report_question_option_id   : report_question_option_id
                      }).fetch().usingConnection(req.dynamic_connection);
                    }
                  } else if(question_field_type === 'Checkbox') {
                    const questions = data.report_question_option_id;
                    if(questions !== undefined && questions !== null && questions.length > 0) {
                      const options_arr = questions.map((report_question_option_id) => { return { report_submission_detail_id: report_submission_detail_id, report_question_id: report_question_id, report_question_option_id: report_question_option_id }; });
                      if (options_arr.length > 0) { await ReportSubmissionDetailOption.createEach(options_arr).usingConnection(req.dynamic_connection); }
                    }
                  }
                }
              }
            }
          } else {
            res.ok(isValid.error, messages.SUBMIT_REPORT_FAILURE, RESPONSE_STATUS.error);
          }
        } else {

          const reportSubmission = await ReportSubmission.create({
            report_id,
            location_id,
            employee_profile_id : employee_profile_id,
            status              : status,
            reported_date       : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);
          submitId = reportSubmission.report_submission_id;
          const report_submission_id = reportSubmission.report_submission_id;

          if(report_submission_id) {
            for (const data of reportAnswers) {
              const report_question_id = data.report_question_id;
              const question_type_id = data.question_type_id;
              const getQuestionDetail = (report_question_id && question_type_id) ? await getQuestionDetails(req, report_question_id, question_type_id) : [];
              const questionDetail = getQuestionDetail[0];
              const is_for_dynamic_entity = questionDetail.is_for_dynamic_entity;

              if(is_for_dynamic_entity === 1) {
                const entityName = questionDetail.entity;
                const reportSubmissionDetail = await ReportSubmissionDetail.create({
                  report_submission_id : report_submission_id,
                  report_id            : report_id,
                  report_question_id   : report_question_id,
                }).fetch().usingConnection(req.dynamic_connection);
                const report_submission_detail_id = reportSubmissionDetail.report_submission_detail_id;

                const entity = data.entity;
                if(entity !== undefined && entity !== null && entity.length > 0) {
                  for (const en of entity) {
                    await ReportSubmissionEntityDetail.create({
                      report_submission_detail_id : report_submission_detail_id,
                      report_question_id          : report_question_id,
                      entity                      : entityName,
                      entity_id                   : en.entity_id,
                      remarks                     : en.entity_remarks
                    }).fetch().usingConnection(req.dynamic_connection);
                  }
                }
              } else {
                const question_field_type = questionDetail.question_field_type;
                if(question_field_type === 'TextField' || question_field_type === 'FileAttachment') {
                  let answer = '';
                  if(data.answer !== undefined && data.answer !== null) {
                    if(question_field_type === 'FileAttachment') {
                      answer = data.answer ? getImgPath(req.account,data.answer) : '';
                    } else {
                      answer = data.answer;
                    }
                  }
                  await ReportSubmissionDetail.create({
                    report_submission_id : report_submission_id,
                    report_id            : report_id,
                    report_question_id   : report_question_id,
                    answer               : answer,
                    notes                : data.notes
                  }).fetch().usingConnection(req.dynamic_connection);

                } else if(question_field_type === 'RadioButton' || question_field_type === 'Checkbox') {

                  const reportSubmissionDetail = await ReportSubmissionDetail.create({
                    report_submission_id : report_submission_id,
                    report_id            : report_id,
                    report_question_id   : report_question_id,
                    notes                : data.notes
                  }).fetch().usingConnection(req.dynamic_connection);
                  const report_submission_detail_id = reportSubmissionDetail.report_submission_detail_id;

                  if(question_field_type === 'RadioButton') {
                    const report_question_option_id = data.report_question_option_id;

                    if(report_question_option_id !== undefined && report_question_option_id !== null && report_question_option_id !== '') {
                      await ReportSubmissionDetailOption.create({
                        report_submission_detail_id : report_submission_detail_id,
                        report_question_id          : report_question_id,
                        report_question_option_id   : report_question_option_id
                      }).fetch().usingConnection(req.dynamic_connection);
                    }
                  } else if(question_field_type === 'Checkbox') {
                    const questions = data.report_question_option_id;
                    if(questions !== undefined && questions !== null && questions.length > 0) {
                      const options_arr = questions.map((report_question_option_id) => { return { report_submission_detail_id: report_submission_detail_id, report_question_id: report_question_id, report_question_option_id: report_question_option_id }; });
                      if (options_arr.length > 0) { await ReportSubmissionDetailOption.createEach(options_arr).usingConnection(req.dynamic_connection); }
                    }
                  }
                }
              }
            }
          } else {
            res.ok(isValid.error, messages.SUBMIT_REPORT_FAILURE, RESPONSE_STATUS.error);
          }
        }
        let message;
        if(status === 'draft'){
          message = messages.SAVE_AS_DRAFT_REPORT_SUCCESS;
        } else {
          message = messages.SUBMIT_REPORT_SUCCESS;

        }
        return res.ok(submitId, message, RESPONSE_STATUS.success);
      } else {
        res.ok(isValid.error, messages.SUBMIT_REPORT_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  submittedReportHistoryList: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await ReportValidation.submittedReportHistoryList.validate(request);
      if (!isValidate.error) {
        let results;
        const { offset, perPage } = request;
        const findQuery = await commonListing(request);
        let locationFilter = false;
        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const alldata of andPayload) {
            Object.keys(alldata).forEach((prop1) => {
              if((prop1 === 'locations')  && (alldata[prop1]).length > 0)
              {locationFilter = true;}
            });
          }
        }

        let sql = `SELECT
                l.name AS location_name,
                r.name AS report_name,
                CONCAT(u.first_name, ' ', u.last_name) AS last_submitted_user,
                rs.reported_date AS last_submitted_on,
                rs.report_submission_id,
                rs.report_id
                FROM report_submission AS rs
                LEFT JOIN report AS r ON rs.report_id = r.report_id
                LEFT JOIN location AS l ON rs.location_id = l.location_id
                LEFT JOIN employee_profile AS ep ON rs.employee_profile_id = ep.employee_profile_id
                LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                WHERE 1=1`;
        if(locationFilter === false && !(req.isExposedApi))
        {
          sql = sql + ` AND rs.location_id IN (SELECT location_id
                              FROM employee_location AS el
                              LEFT JOIN employee_profile AS ep ON el.employee_profile_id = ep.employee_profile_id
                              LEFT JOIN ${process.env.DB_NAME}.user AS us ON ep.user_id = us.user_id
                              WHERE us.user_id = ${req.user.user_id})`;
        }

        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              const locationFilterData=submitReportLocationFilter(prop,data,sql);
              sql=locationFilterData;

              const reportNameFilterData=submitReportNameFilter(prop,data,sql);
              sql=reportNameFilterData;

              const lastSubmitFilterData=submitLastSubmitFilter(prop,data,sql);
              sql=lastSubmitFilterData;

              const lastSubmittedOnFilterData=submitLastSubmittedOnFilter(prop,data,sql,req);
              sql=lastSubmittedOnFilterData;
            });
          }
        }
        sql = sql + ` ORDER BY ${findQuery.sort} `;
        const lengthsql = sql;
        const totalRecords = await sails.sendNativeQuery(escapeSqlSearch(lengthsql)).usingConnection(req.dynamic_connection);
        const resultsLength = totalRecords.rows;
        sql = sql + `limit ${perPage} offset ${offset}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;

        if (results) {
          let allData = {};
          let reportResponse = [];
          allData= reportResponseArrayDatas(results,reportResponse,req,resultsLength);

          return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);

        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  findBySubmittedReportId: async function (req, res) {
    try {
      let results;
      let sql;
      let rsql;
      let reportSubmissionResult;
      const report_submission_id = parseInt(req.params.id);
      const reportSubmissionDetail = await ReportSubmission.findOne({report_submission_id}).usingConnection(req.dynamic_connection);
      if (reportSubmissionDetail) {

        rsql = `SELECT rs.report_id, r.name AS report_name, l.location_id AS report_submitted_location_id, l.name AS report_submitted_location_name,
        (SELECT GROUP_CONCAT(location_id) FROM report_location WHERE report_id = rs.report_id) as report_locations,
        rs.reported_date AS submitted_on
        FROM report_submission AS rs
        LEFT JOIN report AS r ON rs.report_id = r.report_id
        LEFT JOIN location AS l ON rs.location_id = l.location_id
        WHERE rs.report_submission_id = ${report_submission_id} AND r.status = '${ACCOUNT_STATUS.active}'`;

        const reportResult = await sails.sendNativeQuery(escapeSqlSearch(rsql)).usingConnection(req.dynamic_connection);
        reportSubmissionResult = reportResult.rows[0] || null;

        if(reportSubmissionResult) {

          sql = `SELECT
                  rs.report_submission_id, q.report_question_id, q.is_required As is_required, q.dynamic_remark AS dynamic_remark, q.question_type_id AS question_type_id,
                  q.title as question_title, q.description as question_description, q.is_for_dynamic_entity AS is_for_dynamic_entity, q.entity AS entity, q.dynamic_allow_multiple AS dynamic_allow_multiple,
                  qt.title AS question_type_title, qt.field_type AS question_field_type,
                  rsd.report_submission_detail_id, rsd.answer,rsd.notes
                  FROM report_submission AS rs
                  LEFT JOIN report AS r ON rs.report_id = r.report_id
                  LEFT JOIN location AS l ON rs.location_id = l.location_id
                  LEFT JOIN report_submission_detail AS rsd ON rsd.report_submission_id = rs.report_submission_id
                  LEFT JOIN report_question AS q ON q.report_question_id = rsd.report_question_id
                  LEFT JOIN question_type AS qt ON q.question_type_id = qt.question_type_id
                  WHERE rs.report_submission_id = ${report_submission_id} AND r.status = '${ACCOUNT_STATUS.active}'`;

          const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
          results = rawResult.rows;

          let reportResponse = [];
          for (let item of results) {
            let subsql;
            let subResults;
            let questionAnswer = null;
            let entityResponse = [];
            let optionResponse = [];

            const report_submission_detail_id = item.report_submission_detail_id;
            const is_for_dynamic_entity = item.is_for_dynamic_entity;
            const entity = (item.entity).toLowerCase();
            const answer = item.answer;

            if(is_for_dynamic_entity === 1) {
              questionAnswer = await handleEntityResponse(entity,subsql,questionAnswer,entityResponse,req,subResults,report_submission_detail_id);
            } else {
              const question_type_title = item.question_type_title;
              const question_field_type = item.question_field_type;
              // await questionTypeTitleData(answer,report_submission_detail_id,question_type_title,optionResponse,questionAnswer,item,req,subsql,subResults,question_field_type);
              if((question_type_title === 'Number' || question_type_title === 'Short answer') && question_field_type === 'TextField') {
                questionAnswer = answer;
              } else if(question_type_title === 'Multiple Choice' || question_type_title === 'Checkboxes') {
                let report_question_id = item.report_question_id;
                let qsql = `SELECT report_question_option_id, option_key, option_value, sequence
                      FROM report_question_option
                      WHERE report_question_id = ${report_question_id} AND status = '${ACCOUNT_STATUS.active}'`;

                const qrawResult = await sails.sendNativeQuery(qsql).usingConnection(req.dynamic_connection);
                let qresults = qrawResult.rows;

                optionResponse= await qresultData(qresults,optionResponse);

                subsql = `SELECT
                  GROUP_CONCAT(rsdo.report_question_option_id) AS question_option
                  FROM report_submission AS rs
                  LEFT JOIN report_submission_detail AS rsd ON rsd.report_submission_id = rs.report_submission_id
                  LEFT JOIN report_submission_detail_option AS rsdo ON rsdo.report_submission_detail_id = rsd.report_submission_detail_id AND rsdo.report_question_id = rsd.report_question_id
                  WHERE rsd.report_submission_detail_id = ${report_submission_detail_id}`;
                const subRawResult = await sails.sendNativeQuery(escapeSqlSearch(subsql)).usingConnection(req.dynamic_connection);
                subResults = subRawResult.rows[0] || null;

                const question_option = subResults.question_option;
                questionAnswer= await checkBoxesCondition(questionAnswer,question_type_title,question_option,subResults);
              }
              questionAnswer= await attachementData(questionAnswer,answer,question_type_title);
            }

            reportResponse.push({
              report_question_id     : item.report_question_id,
              title                  : item.question_title,
              description            : item.question_description,
              is_for_dynamic_entity  : item.is_for_dynamic_entity,
              dynamic_allow_multiple : item.dynamic_allow_multiple,
              dynamic_remark         : item.dynamic_remark,
              is_required            : item.is_required,
              entity                 : item.entity,
              question_type_id       : item.question_type_id,
              question_type_title    : item.question_type_title,
              question_field_type    : item.question_field_type,
              options                : await optionResponseData(optionResponse),
              answers                : questionAnswer,
              notes                  : item.notes
            });
          }

          reportSubmissionResult.report_locations = await reportSubmissionData(reportSubmissionResult,req);
          reportSubmissionResult.submitted_on = reportSubmissionResult.last_submitted_on;
          reportSubmissionResult.question_answer = reportResponse;
        }

        return res.ok(reportSubmissionResult, messages.GET_RECORD, RESPONSE_STATUS.success);

      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  deleteQuestion: async function (req, res) {
    try {
      let request = req.allParams();
      const { report_id, question_id } = request;
      const isValidate = await ReportValidation.deleteQuestion.validate(
        request
      );
      if (!isValidate.error) {
        await ReportQuestion.destroy({
          report_id   : report_id,
          question_id : question_id,
        }).usingConnection(req.dynamic_connection);

        res.ok(undefined, messages.DELETE_QUESTION, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.ADD_REPORT_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
    }
  },

  getReportQuestionById: async function (req, res) {
    try {
      const report_question_id = parseInt(req.params.id);
      const ReportQuestionDetail = await ReportQuestion.findOne({
        report_question_id,
      }).usingConnection(req.dynamic_connection);
      if (ReportQuestionDetail) {
        let results;
        let sql = `SELECT DISTINCT
                  rq.report_question_id AS report_question_id,
                  rq.title AS report_question_title,
                  rq.description AS report_question_description,
                  rq.question_type_id AS question_type_id,
                  rq.is_for_dynamic_entity AS is_for_dynamic_entity,
                  rq.entity AS entity,
                  rq.dynamic_remark AS dynamic_remark,
                  rq.dynamic_allow_multiple AS dynamic_allow_multiple,
                  rq.sequence AS sequence,
                  rq.is_required AS is_required,
                  rq.created_date AS created_date,
                  qt.title AS question_type_title,
                  qt.field_type AS question_field_type FROM
                  report_question AS rq
                  LEFT JOIN question_type AS qt
                  ON rq.question_type_id = qt.question_type_id
                  WHERE report_question_id = ${report_question_id} AND rq.status = '${ACCOUNT_STATUS.active}'`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);

        results = rawResult.rows;

        if (results.length > 0) {
          let response = [];
          for (let item of results) {
            const optionsValue = item.report_question_id
              ? await getReportQuestionOptions(req, item.report_question_id)
              : [];
            response.push({
              question_id            : item.report_question_id,
              title                  : item.report_question_title,
              description            : item.report_question_description,
              question_type_id       : item.question_type_id,
              is_for_dynamic_entity  : item.is_for_dynamic_entity,
              entity                 : item.entity,
              dynamic_remark         : item.dynamic_remark,
              dynamic_allow_multiple : item.dynamic_allow_multiple,
              sequence               : item.sequence,
              is_required            : item.is_required,
              created_date           : item.created_date,
              field_type             : item.question_field_type,
              options                : optionsValue,
            });
          }

          return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  updateReportQuestion: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await ReportValidation.updateReportQuestion.validate(request);
      if (!isValidate.error) {
        const ReportQuestionDetail = await ReportQuestion.findOne({ report_question_id: request.id }).usingConnection(req.dynamic_connection);
        if (ReportQuestionDetail) {
          const {
            id,
            title,
            description,
            question_type_id,
            is_for_dynamic_entity,
            entity,
            dynamic_remark,
            dynamic_allow_multiple,
            sequence,
            is_required,
            questionOptions,
          } = req.allParams();

          const reportQuestionOptions = questionOptions;
          const rptQueOptions = await ReportQuestionOption.find({ report_question_id: id, status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
          const existingReportQuestionOptions = rptQueOptions.map(x => x.report_question_option_id);
          const requestReportQuestionOptions = reportQuestionOptions
            .filter((f) => reportQOptions(f))
            .map((x) => x.report_question_option_id);
          const addReportQuestionOptions = reportQuestionOptions.filter(
            (f) =>reportQOptions1(f)
          );
          const updateReportQuestionOptions = reportQuestionOptions.filter(
            (f) => reportQOptions(f)
          );
          const removeReportQuestionOptions =
            existingReportQuestionOptions.filter(
              (x) => !requestReportQuestionOptions.includes(x)
            );

          const reportquestionoption_add_arr = addReportQuestionOptions.map(
            (x) => {
              return {
                report_question_id : id,
                option_key         : x.option_key,
                option_value       : x.option_value,
                sequence           : x.sequence,
                status             : ACCOUNT_STATUS.active,
                created_by         : req.user.user_id,
                created_date       : getDateUTC(),
                last_updated_by    : req.user.user_id,
              };
            }
          );
          if (reportquestionoption_add_arr.length > 0) {
            await ReportQuestionOption.createEach(reportquestionoption_add_arr).usingConnection(req.dynamic_connection);
          }

          for (let updateReportQuestionOptionData of updateReportQuestionOptions) {
            await ReportQuestionOption.update(
              {
                report_question_option_id:
                  updateReportQuestionOptionData.report_question_option_id,
              },
              {
                option_key        : updateReportQuestionOptionData.option_key,
                option_value      : updateReportQuestionOptionData.option_value,
                sequence          : updateReportQuestionOptionData.sequence,
                last_updated_by   : req.user.user_id,
                last_updated_date : getDateUTC(),
              }
            )
              .fetch()
              .usingConnection(req.dynamic_connection);
          }

          for (let removeReportQuestionOption of removeReportQuestionOptions) {
            await ReportQuestionOption.update(
              {
                report_question_option_id: removeReportQuestionOption,
              },
              {
                status            : ACCOUNT_STATUS.inactive,
                last_updated_by   : req.user.user_id,
                last_updated_date : getDateUTC(),
              }
            )
              .fetch()
              .usingConnection(req.dynamic_connection);
          }

          const updateReportQuestion = await ReportQuestion.update(
            { report_question_id: id },
            {
              title,
              description,
              question_type_id,
              is_for_dynamic_entity,
              entity,
              dynamic_remark,
              dynamic_allow_multiple,
              sequence,
              is_required,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC(),
            }
          )
            .fetch()
            .usingConnection(req.dynamic_connection);

          return res.ok(updateReportQuestion, messages.UPDATE_QUESTION_SUCCESS, RESPONSE_STATUS.success);
        } else {
          return res.ok(ReportQuestionDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValidate.error, messages.UPDATE_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
    }
  },
  employeeList: async function (req, res) {
    try {
      let results;
      let request = req.allParams();
      let allData = {};
      let filterSql = '';
      let jobTypeSql = '';
      const { locationIds, offset, perPage } = request;
      const findQuery = await commonListing(request);

      let locId=locationIds.map((c) => `'${c}'`).join(',');
      const isValidate = await ReportValidation.employeeList.validate(request);
      if (!isValidate.error) {

        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          await dataPayload(andPayload,filterSql,jobTypeSql);
        }

        let sql = `SELECT
                ep.employee_profile_id,
                CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
                (SELECT
                  GROUP_CONCAT(jt.job_type_id) AS job_type_id
                  FROM employee_job_type AS ejt
                  INNER JOIN job_type AS jt ON jt.job_type_id = ejt.job_type_id
                  WHERE ejt.employee_profile_id = ep.employee_profile_id) AS job_types
                FROM employee_profile AS ep
                LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                LEFT JOIN employee_location AS el ON el.employee_profile_id = ep.employee_profile_id
                ${jobTypeSql}
                WHERE ep.status = '${ACCOUNT_STATUS.active}' AND el.location_id IN (${locId}) ${filterSql}`;

        sql = sql + ` GROUP BY ep.employee_profile_id ORDER BY employee_name ASC `;
        const lengthsql = sql;
        const totalRecords = await sails.sendNativeQuery(escapeSqlSearch(lengthsql)).usingConnection(req.dynamic_connection);
        const resultsLength = totalRecords.rows;
        sql = sql + `limit ${perPage} offset ${offset}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;

        if (results) {
          let responseData = [];
          await finalData(results,req,responseData);

          allData = {
            totalRecords     : resultsLength.length,
            employeeListData : responseData
          };

          return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);

        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.UPDATE_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  taskList: async function (req, res) {
    try {
      let results;
      let request = req.allParams();
      let allData = {};
      let filterSql = '';
      const { offset, perPage, locationId } = request;
      const findQuery = await commonListing(request);

      const isValidate = await ReportValidation.taskList.validate(request);
      if (!isValidate.error) {

        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              taskStatusData(prop,data,filterSql);
              taskTypeData(prop,data,filterSql);
              taskByData(prop,data,filterSql);
              createdByDatas(prop,data,filterSql);
              assigneData(prop,data,filterSql);
              createdData(prop,data,filterSql);
              dueOnData(prop,data,filterSql);
            });
          }
        }

        let sql = `SELECT
                t.task_id,
                t.task_status,
                tt.name AS task_type,
                t.title AS task_title,
                CONCAT(u.first_name, ' ', u.last_name) AS created_by,
                GROUP_CONCAT(CONCAT(uu.first_name, ' ', uu.last_name)) AS assigne,
                DATE(t.created_date) AS created_on,
                t.end_date AS due_on,
                ti.image_url, ti.image_thumbnail_url
                FROM task AS t
                LEFT JOIN ${process.env.DB_NAME}.user AS u ON t.created_by = u.user_id
                LEFT JOIN task_type AS tt ON tt.task_type_id = t.task_type_id
                LEFT JOIN task_image AS ti ON ti.task_id = t.task_id
                LEFT JOIN task_assignee AS ta ON ta.task_id = t.task_id
                LEFT JOIN employee_profile AS ep ON ta.assigned_to = ep.employee_profile_id
                LEFT JOIN ${process.env.DB_NAME}.user AS uu ON ep.user_id = uu.user_id
                WHERE t.status = '${ACCOUNT_STATUS.active}' AND t.location_id = ${locationId} ${filterSql} GROUP BY t.task_id `;

        sql = sql + ` ORDER BY t.created_date DESC `;
        const lengthsql = sql;
        const totalRecords = await sails.sendNativeQuery(escapeSqlSearch(lengthsql)).usingConnection(req.dynamic_connection);
        const resultsLength = totalRecords.rows;
        sql = sql + `limit ${perPage} offset ${offset}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;

        await responseResultData(results,allData,res,resultsLength,req);
      } else {
        res.ok(isValidate.error, messages.UPDATE_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  noteList: async function (req, res) {
    try {
      let results;
      let request = req.allParams();
      let allData = {};
      let filterSql = '';
      const { offset, perPage, locationId } = request;
      const findQuery = await commonListing(request);

      const isValidate = await ReportValidation.noteList.validate(request);
      if (!isValidate.error) {

        await noteListQueryData(findQuery,filterSql);

        let sql = `SELECT
                en.employee_note_id,
                nt.name AS note_type,
                CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
                en.description AS note,
                CONCAT(uu.first_name, ' ', uu.last_name) AS created_by,
                DATE(en.created_date) AS created_on
                FROM employee_note AS en
                LEFT JOIN note_type AS nt ON nt.note_type_id = en.note_type_id
                LEFT JOIN employee_profile AS ep ON en.employee_profile_id = ep.employee_profile_id
                LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                LEFT JOIN ${process.env.DB_NAME}.user AS uu ON en.created_by = uu.user_id
                WHERE en.status = '${ACCOUNT_STATUS.active}' AND en.location_id = ${locationId} ${filterSql}`;

        sql = sql + ` ORDER BY en.created_date DESC `;
        const lengthsql = sql;
        const totalRecords = await sails.sendNativeQuery(escapeSqlSearch(lengthsql)).usingConnection(req.dynamic_connection);
        const resultsLength = totalRecords.rows;
        sql = sql + `limit ${perPage} offset ${offset}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;

        if (results) {
          let responseData = [];
          for (let item of results) {
            responseData.push({
              entity_id     : item.employee_note_id,
              note_type     : item.note_type,
              employee_name : item.employee_name,
              note          : item.note,
              created_by    : item.created_by,
              created_on    : item.created_on ? getDateSpecificTimeZone(item.created_on,  req.timezone,req.dateFormat) : '',
            });
          }

          allData = {
            totalRecords : resultsLength.length,
            noteListData : responseData
          };

          return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);

        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.UPDATE_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  dailyReport : _dailyReport,
  trigger     : async (_req,res) => {
    let curentTimeUTC = getDateUTC();
    await _dailyReport(curentTimeUTC,false);
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  },
};
