/* eslint-disable eqeqeq */

/***************************************************************************

  Controller     : Competition

  **************************************************
  Functions
  **************************************************

  add
  edit
  find
  **************************************************

***************************************************************************/
const messages = sails.config.globals.messages;
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const CompetitionValidation = require('../validations/CompetitionValidation');
const { RESPONSE_STATUS,COMPETITION_STATUS, STATUS, NOTIFICATION_ENTITIES, CRON_JOB_CODE, ACCOUNT_CONFIG_CODE, ACCOUNT_STATUS} = require('../utils/constants/enums');
const { getDateUTC, getDateTimeSpecificTimeZone, getDateSpecificTimeZone, formatDate, getCurrentDateTimezone } = require('../utils/common/getDateTime');
const moment = require('moment');
const { deleteReference } = require('../services/uploadDocument');
const { sendNotification } = require('../services/sendNotification');


const competitionDir = process.env.COMPETITION_IMG_UPLOAD_DIR_ON_AZURE;

const getImgPath = function (account,competition_file) {
  return `${account.account_guid}/${competitionDir}/${competition_file}`;
};

const getStatus = function (start_date, end_date) {
  let cDate = new Date();
  let currentDate = cDate.toISOString().split('T')[0];
  let sDate = new Date(start_date);
  let startDate = sDate.toISOString().split('T')[0];
  let eDate = new Date(end_date);
  let endDate = eDate.toISOString().split('T')[0];
  let status = '';

  if (startDate > currentDate) {
    status = COMPETITION_STATUS.notstarted;
  } else if(startDate < currentDate && endDate < currentDate) {
    status = COMPETITION_STATUS.completed;
  } else if(startDate <= currentDate ||endDate === currentDate) {
    status = COMPETITION_STATUS.ongoing;
  } else {
    status = COMPETITION_STATUS.completed;
  }
  return status;
};

const getEmployeeDetails = async function(req, competition_id){
  let results = '';
  let sql = `SELECT
              ep.employee_profile_id,
              CONCAT(u.first_name, " ", u.last_name) AS name,
              (SELECT GROUP_CONCAT(ejt.job_type_id) FROM employee_job_type AS ejt
              WHERE ejt.employee_profile_id = ep.employee_profile_id) AS job_types,
              (SELECT GROUP_CONCAT(el.location_id) FROM employee_location AS el
              WHERE el.employee_profile_id = ep.employee_profile_id) AS locations
              FROM competition_employee AS ce
              LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
              WHERE ce.competition_id = ${competition_id}`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for(let i of results){
    responseData.push({
      employee_profile_id : i.employee_profile_id,
      name                : i.name,
      job_types           : i.job_types ? i.job_types.split`,`.map(x=>+x) : [],
      locations           : i.locations ? i.locations.split`,`.map(x=>+x) : [],
    });
  }

  return responseData;
};

// eslint-disable-next-line no-unused-vars
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

const getWinnerEmployeeDetails = async function(req, competition_id, employee_profile_id){
  let results = '';
  let sql = `SELECT
              ep.employee_profile_id,
              CONCAT(u.first_name, " ", u.last_name) AS name,
              u.profile_picture_url
              FROM competition_employee AS ce
              LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
              WHERE ce.competition_id = ${competition_id} AND ce.employee_profile_id IN (${employee_profile_id}) `;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for (let item of results) {
    responseData.push({
      employee_profile_id : item.employee_profile_id,
      name                : item.name,
      profile_picture_url : item.profile_picture_url
    });
  }
  return responseData;
};

const getWinnerEmployeeDetailsById = async function(req, comp_emp){
  let results = '';
  let sql = `SELECT
              ep.employee_profile_id,
              c.name AS competition_name,
              ce.total_points,
              CONCAT(u.first_name, " ", u.last_name) AS name,
              u.profile_picture_url
              FROM competition_employee AS ce
              LEFT JOIN competition AS c ON ce.competition_id = c.competition_id
              LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
              WHERE ce.competition_employee_id IN (${comp_emp}) ORDER BY ce.total_points DESC`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for(let i of results){
    responseData.push({
      employee_profile_id : i.employee_profile_id,
      employee_name       : i.name,
      profile_picture_url : i.profile_picture_url,
      competition_name    : i.competition_name,
      total_points        : i.total_points
    });
  }

  return responseData;
};

// eslint-disable-next-line no-unused-vars
const getTop3Winner = async function(req, competition_id){
  let results = '';
  let sql = `SELECT GROUP_CONCAT(u.first_name, '', u.last_name) AS winners
              FROM
              (SELECT u.first_name, u.last_name
              FROM competition_employee AS ce
              LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
              WHERE ce.competition_id = ${competition_id} AND ce.total_points != 0
              ORDER BY ce.total_points DESC LIMIT 3
              ) AS u`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows[0] || null;
  return results.winners !== null ? results.winners : '';
};

const returnData=async(id,tenant_db_connection_string,time_zone,date_time_format,date_format,cron_competiton_completion)=>{
  return {
    account_id                  : id,
    tenant_db_connection_string : tenant_db_connection_string ? tenant_db_connection_string.value : '',
    time_zone                   : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
    date_time_format            : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
    date_format                 : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
    cron_competiton_completion  : cron_competiton_completion? cron_competiton_completion.value : process.env.CRON_COMP_COMPLETION,
  };
};

const accountArrayDatas=async(accountIds,results)=>{
  return accountIds ? accountIds.map(id => {
    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let cron_competiton_completion = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_competiton_completion);
    return returnData(id,tenant_db_connection_string,time_zone,date_time_format,date_format,cron_competiton_completion);
  })  : [];
};

const timeZoneData=async(item)=>{
  return item.time_zone ? item.time_zone : '';
};

const startDateData=async(cronJob)=>{
  return cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') :  '0000-00-00 00:00:00';
};

const completedCompetitionData=async(completedCompetition,item,tenantConnection,currentDate)=>{
  let obj;
  if(completedCompetition.length > 0){
    for (const index in completedCompetition){
      let competitionEmployees = await CompetitionEmployee.find({where: { competition_id: completedCompetition[index].competition_id }}).usingConnection(tenantConnection);
      if(competitionEmployees.length > 0){

        // Below implementation for sending competition completion Notification to all participants
        let sql1 = `Select employee_profile_id as receipient_employee_profile_id, user_id as receipient_user_id from employee_profile where employee_profile_id IN (${competitionEmployees.map(cEmp => cEmp.employee_profile_id).join(',')});`;

        const rawResult1 = await sails.sendNativeQuery(escapeSqlSearch(sql1)).usingConnection(tenantConnection);
        const participants = rawResult1.rows;

        return sendNotification(null,{
          notification_entity : NOTIFICATION_ENTITIES.COMPETITION_END,
          employees           : participants,
          account_id          : item.account_id,
          competition_id      : completedCompetition[index].competition_id,
          competition_name    : completedCompetition[index].name,
        });
      }
    }
  }

  await CronJob.update({ cron_job_id: cronJob.cron_job_id },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
  obj = {
    status : 'Success',
    error  : ''
  };
  return obj;
};

const tryCatchFinally=async(obj,tenantConnection,item,currentDate,cronJob)=>{
  try{
    let completedCompetition = await Competition.find({
      where: {
        competition_status : COMPETITION_STATUS.ongoing,
        start_date         : { 'like': `${getCurrentDateTimezone(timezone)}%`},
      }
    }).usingConnection(tenantConnection);
    if(completedCompetition.length > 0){
      for (const index in completedCompetition){
        let competitionEmployees = await CompetitionEmployee.find({where: { competition_id: completedCompetition[index].competition_id }}).usingConnection(tenantConnection);
        if(competitionEmployees.length > 0){
          // Below implementation for sending competition completion Notification to all participants
          let sql1 = `Select employee_profile_id as receipient_employee_profile_id,user.email, user.first_name, user.last_name,  user.user_id as receipient_user_id from employee_profile join ${process.env.DB_NAME}.user on employee_profile.user_id = user.user_id  where employee_profile_id IN (${competitionEmployees.map(c => c.employee_profile_id).join(',')});`;

          const rawResult1 = await sails.sendNativeQuery(escapeSqlSearch(sql1)).usingConnection(tenantConnection);
          const participants = rawResult1.rows;
          await sendNotification(null,{
            notification_entity : NOTIFICATION_ENTITIES.COMPETITION_START_TODAY,
            employees           : participants,
            account_id          : item.account_id,
            competition_id      : completedCompetition[index].competition_id,
            competition_name    : completedCompetition[index].name,
          });
        }
      }
    }
    await CronJob.update({ cron_job_id: cronJob.cron_job_id },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
    obj = {
      status : 'Success',
      error  : ''
    };
    //return completedCompetitionData(completedCompetition,item,tenantConnection);
  }catch(error){
    let  newObj = {
      status : 'Failure',
      error  : `Error : ${error.message}`
    };
    sails.log(obj);
    obj=newObj;
    return obj;
  }finally {
    await CronJobLog.create({
      cron_job_id   : cronJob.cron_job_id,
      status        : obj.status,
      start_date    : currentDate,
      end_date      : getDateUTC(),
      error_message : obj.error
    }).usingConnection(tenantConnection);
  }
};

const cronJobDatas=async(cronJob,item,tenantConnection)=>{
  if(cronJob){
    let currentDate = getDateUTC();
    let obj;
    let start_date=await startDateData(cronJob);
    sails.log('start_date',start_date);
    try{
      sails.log('getCurrentDateTimezone',getCurrentDateTimezone(timezone));
      let completedCompetition = await Competition.find({
        where: {
          competition_status : COMPETITION_STATUS.ongoing,
          end_date           : { 'like': `${getCurrentDateTimezone(timezone)}%`},
        }
      }).usingConnection(tenantConnection);

      await completedCompetitionData(completedCompetition,item,tenantConnection,currentDate);
    }catch(error){
      obj = {
        status : 'Failure',
        error  : `Error : ${error.message}`
      };
      return obj;
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
    // No Cron Jon with code Competition Controller
    sails.log('No Cron Jon with code Competition Controller');
  }
};

const competitionCompletionCron = async (checkTenantTimezone) => {

  sails.log.debug('Competition Completion Cron Execution Start');
  let curentTimeUTC = getDateUTC();
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

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.cron_competiton_completion, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let cron_competiton_completion = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_competiton_completion);
    return {
      account_id                  : id,
      tenant_db_connection_string : tenant_db_connection_string ? tenant_db_connection_string.value : '',
      time_zone                   : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
      date_time_format            : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
      date_format                 : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
      cron_competiton_completion  : cron_competiton_completion? cron_competiton_completion.value : process.env.CRON_COMP_COMPLETION,
    };
  })  : [];

  for(const item of accountArray)
  {

    if(!item.tenant_db_connection_string) {continue;}
    let timezone = item.time_zone ? item.time_zone : '';
    if(timezone === '') {continue;}

    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');

    if(checkTenantTimezone && tenantTime !== item.cron_competiton_completion){
      continue;
    }

    // Tenant specific database connection
    let connectionString = item.tenant_db_connection_string;
    if(connectionString){
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let tenantConnection = await  mysql.createConnection(connectionString);
      await tenantConnection.connect();

      let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.completition_completion }).usingConnection(tenantConnection);

      if(cronJob){
        let currentDate = getDateUTC();
        let start_date;
        if(cronJob.last_processing_date){
          start_date = moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss');
          // start_date = cronJob.last_processing_date;
        }else{
          start_date = '0000-00-00 00:00:00';
        }
        let end_date =  currentDate;
        let obj;
        try{
          sails.log('getCurrentDateTimezone',getCurrentDateTimezone(timezone));
          let completedCompetition = await Competition.find({
            where: {
              competition_status : COMPETITION_STATUS.ongoing,
              end_date           : { 'like': `${getCurrentDateTimezone(timezone)}%`},
            }
          }).usingConnection(tenantConnection);

          if(completedCompetition.length > 0){
            for (const index in completedCompetition){
              let competitionEmployees = await CompetitionEmployee.find({where: { competition_id: completedCompetition[index].competition_id }}).usingConnection(tenantConnection);
              if(competitionEmployees.length > 0){

                // Below implementation for sending competition completion Notification to all participants
                let sql = `Select employee_profile_id as receipient_employee_profile_id, user_id as receipient_user_id from employee_profile where employee_profile_id IN (${competitionEmployees.map(item => item.employee_profile_id).join(',')});`;

                const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(tenantConnection);
                const participants = rawResult.rows;

                await sendNotification(null,{
                  notification_entity : NOTIFICATION_ENTITIES.COMPETITION_END,
                  employees           : participants,
                  account_id          : item.account_id,
                  competition_id      : completedCompetition[index].competition_id,
                  competition_name    : completedCompetition[index].name,
                });
              }
            }
          }

          await CronJob.update({ cron_job_id: cronJob.cron_job_id },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
          obj = {
            status : 'Success',
            error  : ''
          };
        }catch(error){
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
        // No Cron Jon with code Competition Controller
        sails.log('No Cron Jon with code Competition Controller');
      }
      if(tenantConnection){
        await tenantConnection.end();
      }
    }
  }

  sails.log.debug('Competition Completion Cron Execution End');
};

const competitionStartCron = async (checkTenantTimezone) => {

  sails.log.debug('Competition Start Cron Execution Start');
  let curentTimeUTC = getDateUTC();
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
        account_configuration_detail.code IN ($1,$2,$3,$4,$5) and account.status = $6;`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,  ACCOUNT_CONFIG_CODE.cron_competiton_completion, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let cron_competiton_completion = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_competiton_completion);
    return {
      account_id                  : id,
      tenant_db_connection_string : tenant_db_connection_string ? tenant_db_connection_string.value : '',
      time_zone                   : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
      date_time_format            : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
      date_format                 : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
      cron_competiton_completion  : cron_competiton_completion? cron_competiton_completion.value : process.env.CRON_COMP_COMPLETION,
    };
  })  : [];

  for(const item of accountArray)
  {
    if(!item.tenant_db_connection_string) {continue;}
    let timezone = item.time_zone ? item.time_zone : '';
    if(timezone === '') {continue;}
    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');

    if(checkTenantTimezone && tenantTime !== item.cron_competiton_completion){
      continue;
    }

    // Tenant specific database connection
    let connectionString = item.tenant_db_connection_string;
    if(connectionString){

      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let tenantConnection = await  mysql.createConnection(connectionString);
      await tenantConnection.connect();

      let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.start_competition }).usingConnection(tenantConnection);

      if(cronJob){
        let currentDate = getDateUTC();
        let start_date= moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss');
        let obj;

        if(cronJob.last_processing_date){
          return start_date;
        }

        try{

          let completedCompetition = await Competition.find({
            where: {
              competition_status : COMPETITION_STATUS.ongoing,
              start_date         : { 'like': `${getCurrentDateTimezone(timezone)}%`},
            }
          }).usingConnection(tenantConnection);

          if(completedCompetition.length > 0){
            for (const index in completedCompetition){
              let competitionEmployees = await CompetitionEmployee.find({where: { competition_id: completedCompetition[index].competition_id }}).usingConnection(tenantConnection);
              if(competitionEmployees.length > 0){

                // Below implementation for sending competition completion Notification to all participants
                let sql = `Select employee_profile_id as receipient_employee_profile_id,user.email, user.first_name, user.last_name,  user.user_id as receipient_user_id from employee_profile join ${process.env.DB_NAME}.user on employee_profile.user_id = user.user_id  where employee_profile_id IN (${competitionEmployees.map(item => item.employee_profile_id).join(',')});`;

                const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(tenantConnection);
                const participants = rawResult.rows;

                await sendNotification(null,{
                  notification_entity : NOTIFICATION_ENTITIES.COMPETITION_START_TODAY,
                  employees           : participants,
                  account_id          : item.account_id,
                  competition_id      : completedCompetition[index].competition_id,
                  competition_name    : completedCompetition[index].name,
                });
              }
            }
          }

          await CronJob.update({ cron_job_id: cronJob.cron_job_id },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
          obj = {
            status : 'Success',
            error  : ''
          };
        }catch(error){
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
        // No Cron Jon with code Competition Controller
        sails.log('No Cron Jon with code Competition Controller');
      }
      if(tenantConnection){
        await tenantConnection.end();
      }
    }
    // }
  }

  sails.log.debug('Competition Start Cron Execution End');
};

const bannerImage=async(competition_file,req)=>{
  return competition_file ? getImgPath(req.account,competition_file) : '';
};

const cometitionStatus=async(start_date,end_date)=>{
  return start_date ? getStatus(start_date, end_date) : '';
};

const empDetails=async(result,req)=>{
  return result.competition_id ?  getEmployeeDetails(req, result.competition_id) : [];
};

const locationID=async(result)=>{
  return result.locations ? result.locations.split`,`.map(x=>+x) : [];
};

const jobTypId=async(result)=>{
  return result.job_types ? result.job_types.split`,`.map(x=>+x) : [];
};

const cardStartDate=async(cardsresult,req)=>{
  return cardsresult.start_date ? formatDate(cardsresult.start_date, req.dateFormat) : '';
};

const cardEndDate=async(cardsresult,req)=>{
  return cardsresult.end_date ? formatDate(cardsresult.end_date, req.dateFormat) : '';
};

const cardPoint=async(cardsresult)=>{
  return cardsresult.yourpoints !== null ? cardsresult.yourpoints : '';
};

const locDetails=async(i)=>{
  return i.locations ? i.locations.split(',') : [];
};

const jTypes=async(i,req)=>{
  return i.job_types ?  getJobTypeDetails(req, i.job_types) : [];
};

const startDateResult=async(result,req)=>{
  return result.start_date ? formatDate(result.start_date,req.dateFormat) : '';
};

const endDateResult=async(result,req)=>{
  return result.end_date ? formatDate(result.end_date,req.dateFormat) : '';
};

const competitionIsRemoveFileCondition=async(competition_file,isRemoveFile,competition_id,req,competitionUpdate,name,description,start_date,end_date)=>{
  if(((competition_file === undefined) || (competition_file === '')) && ((isRemoveFile === undefined) || (isRemoveFile === ''))){
    return Competition.update({ competition_id: competition_id },{
      name,
      description,
      start_date,
      end_date,
      banner_image_url   : await bannerImage(competition_file,req),
      competition_status : await cometitionStatus(start_date,end_date),
      status             : STATUS.active,
      last_updated_by    : req.user.user_id,
      last_updated_date  : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);
  } else if ((isRemoveFile) && ((competition_file === undefined) || (competition_file === ''))) {
    return competitionUpdate;
  } else if ((isRemoveFile) && competition_file !== undefined && competition_file !== '') {
    return competitionUpdate;
  } else if(((isRemoveFile === undefined) || (isRemoveFile === '')) && competition_file !== undefined && competition_file !== '') {
    return competitionUpdate;
  } else if(((isRemoveFile === false)  && competition_file !== undefined && competition_file !== '')) {
    return competitionUpdate;
  }
};

const empJobLocationConditionData=async(competition_id,req,addEmployees,addLocations,addJobTypes)=>{
  const employees_arr = addEmployees.map((employee_id) => {
    return { competition_id: competition_id, employee_profile_id: employee_id, created_by: req.user.user_id, created_date: getDateUTC() };
  });
  if (employees_arr.length > 0) {
    return CompetitionEmployee.createEach(employees_arr).usingConnection(req.dynamic_connection);
  }

  const locations_arr = addLocations.map((location_id) => {
    return { competition_id: competition_id, location_id: location_id, created_by: req.user.user_id, created_date: getDateUTC() };
  });
  if (locations_arr.length > 0) {
    return CompetitionLocation.createEach(locations_arr).usingConnection(req.dynamic_connection);
  }

  const job_types_arr = addJobTypes.map((job_type_id) => {
    return { competition_id: competition_id, job_type_id: job_type_id, created_by: req.user.user_id, created_date: getDateUTC() };
  });
  if (job_types_arr.length > 0) {
    return CompetitionJobType.createEach(job_types_arr).usingConnection(req.dynamic_connection);
  }
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValid = await CompetitionValidation.addEdit.validate(request);
      if (!isValid.error) {
        const { name, description, start_date, end_date, competition_file, employees, locations, job_types } = req.allParams();
        let sDate = new Date(start_date);
        let startDate = sDate.toISOString().split('T')[0];
        let eDate = new Date(end_date);
        let endDate = eDate.toISOString().split('T')[0];
        if (endDate >= startDate) {
          const newCompetition = await Competition.create({
            name,
            description,
            start_date,
            end_date,
            banner_image_url   : await bannerImage(competition_file,req),
            competition_status : await cometitionStatus(start_date,end_date),
            status             : STATUS.active,
            created_by         : req.user.user_id,
            last_updated_by    : null,
            created_date       : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          const competitionId = newCompetition.competition_id;

          const employees_arr = employees.map((employee_id) => { return { competition_id: competitionId, employee_profile_id: employee_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
          if (employees_arr.length > 0) { await CompetitionEmployee.createEach(employees_arr).usingConnection(req.dynamic_connection); }

          const locations_arr = locations.map((location_id) => { return { competition_id: competitionId, location_id: location_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
          if (locations_arr.length > 0) { await CompetitionLocation.createEach(locations_arr).usingConnection(req.dynamic_connection); }

          const job_types_arr = job_types.map((job_type_id) => { return { competition_id: competitionId, job_type_id: job_type_id, created_by: req.user.user_id, created_date: getDateUTC() }; });
          if (job_types_arr.length > 0) { await CompetitionJobType.createEach(job_types_arr).usingConnection(req.dynamic_connection); }


          let sql = `Select employee_profile_id as receipient_employee_profile_id, user_id as receipient_user_id from employee_profile where employee_profile_id IN (${employees.join(',')});`;

          const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
          const _emp = rawResult.rows;

          await sendNotification(null,{
            notification_entity : NOTIFICATION_ENTITIES.COMPETITION_START,
            employees           : _emp,
            account_id          : req.account.account_id,
            competition_id      : competitionId
          });

          return res.ok(competitionId, messages.ADD_SUCCESS, RESPONSE_STATUS.success);
        }  else {
          res.ok(isValid.error, messages.DATE_FAILURE, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValid.error, messages.ADD_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  update: async (req, res) => {
    try {
      let request = req.allParams();
      let competitionDir1;
      const isValid = await CompetitionValidation.addEdit.validate(request);
      if (!isValid.error) {
        let competition_id = request.id;

        const competitionDetail = await Competition.findOne({ competition_id: competition_id}).usingConnection(req.dynamic_connection);

        if(competitionDetail) {
          const { name, description, start_date, end_date, competition_file, employees, locations, job_types } = req.allParams();
          const competition_banner_url = competitionDetail.banner_image_url;
          competitionDir1 = process.env.COMPETITION_IMG_UPLOAD_DIR_ON_AZURE;
          const imageDir = competition_banner_url.split(`/${competitionDir1}/`);

          let isRemoveFile = request.removed_file;

          if(isRemoveFile) {
            await deleteReference( imageDir[1], imageDir[0], competitionDir1);
          }

          let sDate = new Date(start_date);
          let startDate = sDate.toISOString().split('T')[0];
          let eDate = new Date(end_date);
          let endDate = eDate.toISOString().split('T')[0];


          if (endDate >= startDate) {
            const competitionEmployees = await CompetitionEmployee.find({ competition_id: competition_id }).usingConnection(req.dynamic_connection);
            let existingEmployees = competitionEmployees.map(x => x.employee_profile_id);
            let unionEmployee = [...new Set([...employees, ...existingEmployees])];
            let addEmployees = unionEmployee.filter(x => !existingEmployees.includes(x));
            let removeEmployees = unionEmployee.filter(x => !employees.includes(x));

            const competitionLocations = await CompetitionLocation.find({ competition_id: competition_id }).usingConnection(req.dynamic_connection);
            let existingLocations = competitionLocations.map(x => x.location_id);
            let unionLocation = [...new Set([...locations, ...existingLocations])];
            let addLocations = unionLocation.filter(x => !existingLocations.includes(x));
            let removeLocations = unionLocation.filter(x => !locations.includes(x));

            const competitionJobTypes = await CompetitionJobType.find({ competition_id: competition_id }).usingConnection(req.dynamic_connection);
            let existingJobTypes = competitionJobTypes.map(x => x.job_type_id);
            let unionJobType = [...new Set([...job_types, ...existingJobTypes])];
            let addJobTypes = unionJobType.filter(x => !existingJobTypes.includes(x));
            let removeJobTypes = unionJobType.filter(x => !job_types.includes(x));
            let competitionUpdate=await Competition.update({ competition_id: competition_id },{
              name,
              description,
              start_date,
              end_date,
              banner_image_url   : await bannerImage(competition_file,req),
              competition_status : await cometitionStatus(start_date,end_date),
              status             : STATUS.active,
              last_updated_by    : req.user.user_id,
              last_updated_date  : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
            await competitionIsRemoveFileCondition(competition_file,isRemoveFile,competition_id,req,competitionUpdate,name,description,start_date, end_date);

            await empJobLocationConditionData(competition_id,req,addEmployees,addLocations,addJobTypes);

            await CompetitionEmployee.destroy({ competition_id: competition_id, employee_profile_id: { in: removeEmployees} }).usingConnection(req.dynamic_connection);
            await CompetitionLocation.destroy({ competition_id: competition_id, location_id: { in: removeLocations} }).usingConnection(req.dynamic_connection);
            await CompetitionJobType.destroy({ competition_id: competition_id, job_type_id: { in: removeJobTypes} }).usingConnection(req.dynamic_connection);

            return res.ok(competition_id, messages.UPDATE_SUCCESS, RESPONSE_STATUS.success);
          }  else {
            res.ok(isValid.error, messages.DATE_FAILURE, RESPONSE_STATUS.error);
          }
        }
        else {
          return res.ok(competitionDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValid.error, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG_UPDATE, RESPONSE_STATUS.error);
    }
  },
  competitionHistoryList: async function (req, res) {
    try {
      let request = req.allParams();
      let { flag } = request;
      const isValidate = await CompetitionValidation.filter.validate(request);
      if (!isValidate.error) {
        await sails.sendNativeQuery(`UPDATE competition SET competition.competition_status = 'Not started' where competition.start_date > CURDATE()`).usingConnection(req.dynamic_connection);

        const ongoingSql = `Update competition SET competition_status = 'Ongoing' where start_date < CURDATE() and end_date > CURDATE()`;
        await sails.sendNativeQuery(escapeSqlSearch(ongoingSql)).usingConnection(req.dynamic_connection);

        const CompletedSql = `Update competition SET competition_status = 'Completed' where end_date < CURDATE()`;
        await sails.sendNativeQuery(escapeSqlSearch(CompletedSql)).usingConnection(req.dynamic_connection);

        let result;
        let data = {};
        const findQuery = await commonListing(request);

        let sql = `SELECT DISTINCT c.competition_id, c.name, c.start_date, c.end_date, c.competition_status, c.status,
                    IF(c.competition_status = '${COMPETITION_STATUS.ongoing}', (SELECT GROUP_CONCAT(u.first_name, ' ', u.last_name) AS winner
                    FROM
                    (SELECT u.first_name, u.last_name
                    FROM competition_employee AS ce
                    LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
                    LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                    WHERE ce.competition_id = c.competition_id AND ce.total_points != 0 ORDER BY ce.total_points DESC LIMIT 3
                    ) AS u),
                    (SELECT GROUP_CONCAT(u.first_name, ' ', u.last_name) AS winner
                    FROM
                    (SELECT u.first_name, u.last_name
                    FROM competition_employee AS ce
                    LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
                    LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                    WHERE ce.competition_id = c.competition_id AND c.competition_status = '${COMPETITION_STATUS.completed}' AND ce.rank = 1
                    ) AS u)) AS winner,
                    (SELECT GROUP_CONCAT(l.name) AS location_name
                    FROM competition_location AS cl
                    INNER JOIN location AS l ON cl.location_id = l.location_id
                    WHERE cl.competition_id = c.competition_id) AS locations,
                    (SELECT COUNT(competition_employee_id)
                    FROM competition_employee AS ce
                    WHERE ce.competition_id = c.competition_id) AS participants_count
                  FROM  competition AS c `;
        if(flag === 'my') {
          sql = sql + ` INNER JOIN competition_employee AS cee ON cee.competition_id = c.competition_id `;
        }
        sql = sql + `JOIN  competition_location ON c.competition_id = competition_location.competition_id
                  JOIN location ON competition_location.location_id = location.location_id
                  WHERE c.status = '${STATUS.active}'`;
        if(flag === 'my') {
          sql = sql + ` AND cee.employee_profile_id = (SELECT employee_profile_id FROM employee_profile AS ep WHERE ep.user_id = ${req.user.user_id})`;
        }
        if ((findQuery.andCondition).length > 0) {
          let winnerfilter = false;
          const andPayload = findQuery.andCondition;

          for (const data1 of andPayload) {
            Object.keys(data1).forEach((prop) => {
              if ((prop === 'locations') && (data1[prop]).length > 0) {
                let locationPayload = data1[prop];
                const locationName = locationPayload.map(c => `'${c}'`).join(', ');
                const locationId = '(' + locationName + ')';
                sql = sql + ` AND competition_location.location_id IN ${locationId}`;
              }
              if ((prop === 'competition_name') && (data1[prop] !== '')) {
                sql = sql + ` AND c.name LIKE '%${escapeSearch(data1[prop])}%'`;
              }
              if ((prop === 'competition_status') && (data1[prop] !== '')) {
                sql = sql + ` AND c.competition_status = '${data1[prop]}'`;
              }
              if (prop === 'start_date') {
                if((data1[prop].from_date !== '') && (data1[prop].to_date !== ''))
                {
                  const startDate = moment(data1[prop].from_date).format('YYYY-MM-DD');
                  const endDate = moment(data1[prop].to_date).format('YYYY-MM-DD');
                  sql = sql + ` AND (c.${prop} BETWEEN ('${startDate}') AND ('${endDate}'))`;
                }
              }
              if (prop === 'end_date') {
                if((data1[prop].from_date !== '') && (data1[prop].to_date !== ''))
                {
                  const startDate = moment(data1[prop].from_date).format('YYYY-MM-DD');
                  const endDate = moment(data1[prop].to_date).format('YYYY-MM-DD');
                  sql = sql + ` AND (c.${prop} BETWEEN ('${startDate}') AND ('${endDate}'))`;
                }
              }
            });
          }

          for (const alldata of andPayload) {
            Object.keys(alldata).forEach((prop1) => {
              if((prop1 === 'winners')  && (alldata[prop1] !== ''))
              {
                sql = sql + ` HAVING winner LIKE '%${escapeSearch(alldata[prop1])}%'`;
                winnerfilter = true;
              }
            });
          }

          for (const alldata1 of andPayload) {
            Object.keys(alldata1).forEach((prop2) => {
              if ((prop2 === 'participants_count')  && (alldata1[prop2] !== '')) {
                if (winnerfilter) {
                  sql = sql + ` AND participants_count = ${alldata1[prop2]} `;
                }else {
                  sql = sql + ` HAVING participants_count = ${alldata1[prop2]} `;
                }
              }
            });
          }
        }
        if(findQuery.sort == 'participants DESC')
        {
          findQuery.sort = `(SELECT COUNT(competition_employee_id)
          FROM competition_employee AS ce
          WHERE ce.competition_id = c.competition_id) DESC`;
        }
        else if(findQuery.sort == 'participants ASC')
        {
          findQuery.sort = `(SELECT COUNT(competition_employee_id)
          FROM competition_employee AS ce
          WHERE ce.competition_id = c.competition_id) ASC`;
        }
        if(findQuery.sort == 'winner DESC')
        {
          findQuery.sort = `winner DESC`;
        }
        else if(findQuery.sort == 'winner ASC')
        {
          findQuery.sort = `winner ASC`;
        }

        if(findQuery.sort == 'c.created_date DESC') {
          sql = sql + ` ORDER BY FIELD(c.competition_status, '${COMPETITION_STATUS.ongoing}', '${COMPETITION_STATUS.notstarted}', '${COMPETITION_STATUS.completed}'), ${findQuery.sort} `;
        } else {
          sql = sql + ` ORDER BY ${findQuery.sort} `;
        }
        const lengthsql = sql;
        const rawResultLength = await sails
        .sendNativeQuery(escapeSqlSearch(lengthsql))
        .usingConnection(req.dynamic_connection);
        const resultsLength = rawResultLength.rows;
        sql = sql + `limit ${findQuery.rows} offset ${findQuery.skip}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        result = rawResult.rows;
        sails.log(sql);
        if(result)
        {
          let competitionList = [];
          for(let i of result){
            competitionList.push({
              competition_id     : i.competition_id,
              name               : i.name,
              start_date         : (i.start_date) ? formatDate(i.start_date,req.dateFormat) : '',
              end_date           : (i.end_date) ? formatDate(i.end_date,req.dateFormat) : '',
              competition_status : i.competition_status,
              status             : i.status,
              winners            : i.winner,
              locations          : i.locations ? i.locations.split(',') : [],
              participants_count : i.participants_count
            });
          }

          data = {
            list         : competitionList,
            totalResults : resultsLength.length
          };
        }

        return res.ok(data, messages.GET_COMPETITION, RESPONSE_STATUS.success);
      }
      else{
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }

    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },
  findById: async (req, res) => {
    try {
      const competition_id = parseInt(req.params.id);
      const results = await Competition.findOne({ competition_id}).usingConnection(req.dynamic_connection);
      if(results)
      {
        let result;
        let sql = `SELECT c.competition_id, c.name, c.description, c.start_date, c.end_date, c.banner_image_url, c.competition_status,
                  (SELECT
                    GROUP_CONCAT(location_id) AS location_id
                    FROM competition_location AS cl
                    WHERE cl.competition_id = c.competition_id) AS locations,
                  (SELECT
                    GROUP_CONCAT(job_type_id) AS job_type_id
                    FROM competition_job_type AS cjt
                    WHERE cjt.competition_id = c.competition_id) AS job_types
                  FROM competition AS c WHERE c.competition_id = '${competition_id}' AND c.status = '${STATUS.active}'`;
        sql = sql + ` ORDER BY c.created_date DESC`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        result = rawResult.rows[0] || null;
        if(result)
        {
          const employees = await empDetails(result,req);
          const location_ids =await locationID(result);
          const job_type_ids =await jobTypId(result);
          const competition_banner_url =  result.banner_image_url ? `${process.env.PROFILE_PIC_CDN_URL}/${result.banner_image_url}` : '';
          result.start_date         = await startDateResult(result,req);
          result.end_date           = await endDateResult(result,req);
          result.employees = employees;
          result.locations = location_ids;
          result.job_types = job_type_ids;
          result.banner_image_url = competition_banner_url;
          result.locationdata = result.locations ? await getLocationDetails(req, result.locations) : [];
          result.jobtypedata = result.job_types ? await getJobTypeDetails(req, result.job_types) : [];
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
  delete: async (req, res) => {
    const isValid = CompetitionValidation.delete.validate(req.allParams());
    if (!isValid.error) {
      const { id } = req.allParams();

      const checkExists = await Competition.findOne({competition_id: id}).usingConnection(req.dynamic_connection);
      if(checkExists){
        await Competition.update({competition_id: id},{
          status            : STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        return res.ok(undefined, messages.DELETE_COMPETITION,RESPONSE_STATUS.success);
      }else{
        return res.ok(undefined, messages.COMPETITION_TYPE_NOT_FOUND,RESPONSE_STATUS.error);
      }

    } else {
      return res.ok(isValid.error, messages.DELETE_COMPETITION_FAIL,RESPONSE_STATUS.error);
    }
  },
  dashboard: async (req, res) => {
    try {
      let request = req.allParams();
      const competition_id = parseInt(request.competition_id);
      const { offset, perPage } = request;
      const results = await Competition.findOne({ competition_id}).usingConnection(req.dynamic_connection);
      const findQuery = await commonListing(request);

      if(results)
      {
        let allData = {};
        let locationSql = '';
        let jobTypeSql = '';
        let filterSql = '';
        let result;
        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              if (prop === 'name') {
                filterSql = filterSql + ` AND CONCAT(u.first_name, " ", u.last_name) LIKE '%${escapeSearch(data[prop])}%' `;
              }
              if ((prop === 'location') && (data[prop]).length > 0) {
                locationSql = 'LEFT JOIN employee_location AS ell ON  ell.employee_profile_id = ep.employee_profile_id';
                sails.log(locationSql);
                let locationPayload = data[prop];
                const locationId = locationPayload.map(c => `${c}`).join(', ');
                filterSql = filterSql + ` AND ell.location_id IN (${locationId})`;
              }
              if ((prop === 'job_type') && (data[prop]).length > 0) {
                jobTypeSql = 'LEFT JOIN employee_job_type AS ejtt ON  ejtt.employee_profile_id = ep.employee_profile_id';
                sails.log(jobTypeSql);
                let jobTypePayload = data[prop];
                const jobTypeId = jobTypePayload.map(c => `${c}`).join(', ');
                filterSql = filterSql + ` AND ejtt.job_type_id IN (${jobTypeId})`;
              }
              if (prop === 'total_points') {
                filterSql = filterSql + ` AND ce.total_points = '${data[prop]}' `;
              }
            });
          }
        }


        let sql = `SELECT ep.employee_profile_id, ep.user_id, CONCAT(u.first_name, " ", u.last_name) AS name, u.profile_picture_thumbnail_url,
                    (SELECT GROUP_CONCAT(l.name) AS location_name
                    FROM employee_location AS el
                    INNER JOIN location AS l ON el.location_id = l.location_id
                    WHERE el.employee_profile_id = ep.employee_profile_id) AS locations,
                    (SELECT
                    GROUP_CONCAT(jt.job_type_id) AS job_type_id
                    FROM employee_job_type AS ejt
                    INNER JOIN job_type AS jt ON jt.job_type_id = ejt.job_type_id
                    WHERE ejt.employee_profile_id = ep.employee_profile_id) AS job_types,
                    ce.total_points, ce.rank AS emp_rank
                    FROM competition_employee AS ce
                    LEFT JOIN competition AS c ON c.competition_id = ce.competition_id
                    LEFT JOIN employee_profile AS ep ON ep.employee_profile_id = ce.employee_profile_id ${locationSql} ${jobTypeSql}
                    LEFT JOIN ${process.env.DB_NAME}.user AS u ON u.user_id = ep.user_id
                    WHERE c.competition_id = '${competition_id}' AND c.status = '${STATUS.active}' ${filterSql}`;

        sql = ( sql) + ` GROUP BY u.user_id ORDER BY emp_rank = 0, ${findQuery.sort}, ce.created_date DESC, NAME ASC `;
        const lengthsql = sql;
        sails.log(sql);
        const totalRecords = await sails.sendNativeQuery(escapeSqlSearch(lengthsql)).usingConnection(req.dynamic_connection);
        const resultsLength = totalRecords.rows;
        sql = sql + `limit ${perPage} offset ${offset}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        result = rawResult.rows;

        if(result)
        {
          let responseData = [];
          for(let i of result){
            responseData.push({
              employee_profile_id           : i.employee_profile_id,
              user_id                       : i.user_id,
              total_points                  : i.total_points,
              rank                          : i.emp_rank,
              name                          : i.name,
              profile_picture_thumbnail_url : i.profile_picture_thumbnail_url,
              locations                     : await locDetails(i),
              job_types                     : await jTypes(i,req)
            });
          }

          allData = {
            totalRecords : resultsLength.length,
            listData     : responseData
          };
        }

        return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
  dashboardCards: async (req, res) => {
    try {
      const competition_id = parseInt(req.params.id);
      const results = await Competition.findOne({ competition_id}).usingConnection(req.dynamic_connection);
      if(results)
      {
        let cardsresult;
        let cardsql = `SELECT COUNT(ce.competition_id) AS totalparticipants,
                        (SELECT ce.total_points AS yourpoints
                          FROM competition_employee AS ce
                          LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
                          WHERE ce.competition_id = ${competition_id} AND ep.user_id = ${req.user.user_id})AS yourpoints,
                        name, description, start_date, end_date,competition_status,
                        (SELECT GROUP_CONCAT(employee_profile_id) AS employee_profile_id
                        FROM competition_employee AS cec
                        WHERE cec.competition_id = c.competition_id AND cec.rank = '1') AS winners
                        FROM competition AS c
                        LEFT JOIN competition_employee AS ce ON ce.competition_id = c.competition_id
                        WHERE ce.competition_id = ${competition_id} AND c.status = '${STATUS.active}' `;
        let sql = (cardsql) + ` ORDER BY ce.total_points DESC`;
        const cardResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        cardsresult = cardResult.rows[0] || null;

        if(cardsresult)
        {
          let differentDays = 0;
          if(cardsresult.competition_status !== 'Completed') {
            let firstDate = new Date(results.end_date);
            let secondDate = new Date();
            let timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());
            differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
          }
          cardsresult.start_date        = await cardStartDate(cardsresult,req);
          cardsresult.end_date          = await cardEndDate(cardsresult,req);
          cardsresult.current_date      = getDateSpecificTimeZone(getDateUTC(),req.timezone, req.dateFormat);
          cardsresult.banner_image_url  = results.banner_image_url ? `${process.env.PROFILE_PIC_CDN_URL}/${results.banner_image_url}` : '';
          cardsresult.yourpoints        = await cardPoint(cardsresult);
          cardsresult.progress          = differentDays;
          cardsresult.winners           = cardsresult.winners ? await getWinnerEmployeeDetails(req, competition_id, cardsresult.winners) : [];

        }
        return res.ok(cardsresult, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  competitionDropDownList: async function (req, res) {
    try {
      let employee_profile_id = req.empProfile.employee_profile_id;
      let results;
      let sql = `SELECT c.competition_id, c.name, DATE(end_date) AS enddate
                  FROM  competition AS c
                  left join competition_employee as cp on c.competition_id = cp.competition_id
                  WHERE c.status = '${STATUS.active}' 
                  AND cp.employee_profile_id = ${employee_profile_id}
                  AND c.competition_status IN('${COMPETITION_STATUS.ongoing}') ORDER BY enddate ASC, c.name ASC`;

      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      results = rawResult.rows;
      const competitionList = results.map((item)=>({
        competition_id : item.competition_id,
        name           : item.name
      }));

      return res.ok(competitionList, messages.GET_DROPDOWN_COMPETITION, RESPONSE_STATUS.success);

    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  historyCards: async (req, res) => {
    try {
      let historyCardsResult;
      let cardSql;
      let latestWinnerSql;
      const flag = req.params.flag;
      if(flag === 'my') {
        cardSql = `SELECT
                    (SELECT COUNT(*) AS ongoing_count
                    FROM competition AS c
                    LEFT JOIN competition_employee AS ce ON ce.competition_id = c.competition_id
                    WHERE c.status = '${STATUS.active}' AND c.competition_status = '${COMPETITION_STATUS.ongoing}'
                    AND ce.employee_profile_id = (SELECT employee_profile_id FROM employee_profile AS ep WHERE ep.user_id = ${req.user.user_id})) AS ongoing_competitions,
                    (SELECT COUNT(*) AS ongoing_count
                    FROM competition AS c
                    LEFT JOIN competition_employee AS ce ON ce.competition_id = c.competition_id
                    WHERE c.status = '${STATUS.active}' AND c.competition_status = '${COMPETITION_STATUS.completed}'
                    AND ce.employee_profile_id = (SELECT employee_profile_id FROM employee_profile AS ep WHERE ep.user_id = ${req.user.user_id})) AS completed_competitions,
                    (SELECT COUNT(*) AS your_total_competitions
                    FROM competition AS c
                    LEFT JOIN competition_employee AS ce ON ce.competition_id = c.competition_id
                    WHERE c.status = '${STATUS.active}'
                    AND ce.employee_profile_id = (SELECT employee_profile_id FROM employee_profile AS ep WHERE ep.user_id = ${req.user.user_id})) AS your_total_competitions`;

        latestWinnerSql = `SELECT GROUP_CONCAT(ce.competition_employee_id) AS latest_winner
                            FROM competition_employee AS ce
                            LEFT JOIN competition AS c ON ce.competition_id = c.competition_id
                            WHERE
                            ce.rank = 1 AND ce.total_points != 0
                            AND c.competition_id IN (SELECT c.competition_id
                                                      FROM competition_employee AS ce
                                                      LEFT JOIN competition AS c ON ce.competition_id = c.competition_id
                                                      INNER JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
                                                      LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                                                      WHERE u.user_id = ${req.user.user_id} AND c.competition_status = '${COMPETITION_STATUS.completed}'
                                                      AND end_date = (SELECT DATE(c.end_date)
                                                                      FROM competition AS c
                                                                      LEFT JOIN competition_employee AS ce ON ce.competition_id = c.competition_id
                                                                      LEFT JOIN employee_profile AS ep ON ce.employee_profile_id = ep.employee_profile_id
                                                                      LEFT JOIN ${process.env.DB_NAME}.user AS u ON ep.user_id = u.user_id
                                                                      WHERE u.user_id = ${req.user.user_id}
                                                                      AND c.STATUS = '${STATUS.active}'
                                                                      AND c.competition_status = '${COMPETITION_STATUS.completed}'
                                                                      ORDER BY c.end_date DESC
                                                                      LIMIT 1)
                                                      ORDER BY c.end_date DESC , c.competition_id DESC)`;

      } else {
        cardSql = `SELECT
                    (SELECT COUNT(*) AS ongoing_count FROM competition WHERE status = '${STATUS.active}' AND competition_status = '${COMPETITION_STATUS.ongoing}') AS ongoing_competitions,
                    (SELECT COUNT(*) AS completed FROM competition WHERE status = '${STATUS.active}' AND competition_status = '${COMPETITION_STATUS.completed}') AS completed_competitions,
                    (SELECT COUNT(*) AS your_total_competitions
                    FROM competition AS c
                    LEFT JOIN competition_employee AS ce ON ce.competition_id = c.competition_id
                    WHERE c.status = '${STATUS.active}'
                    AND ce.employee_profile_id = (SELECT employee_profile_id FROM employee_profile AS ep WHERE ep.user_id = ${req.user.user_id})) AS your_total_competitions`;
        latestWinnerSql = `SELECT GROUP_CONCAT(ce.competition_employee_id) AS latest_winner
                          FROM competition_employee AS ce
                          LEFT JOIN competition AS c ON ce.competition_id = c.competition_id
                          WHERE ce.rank = 1 AND ce.total_points != 0
                          AND  c.competition_id IN (SELECT competition_id FROM competition WHERE competition_status = '${COMPETITION_STATUS.completed}'
                                                    AND end_date = (SELECT DATE(end_date) FROM competition WHERE status = '${STATUS.active}'
                                                                    AND competition_status = '${COMPETITION_STATUS.completed}' ORDER BY end_date DESC LIMIT 1)
                                                    ORDER BY end_date DESC, competition_id DESC)`;

      }

      const cardResult = await sails.sendNativeQuery(escapeSqlSearch(cardSql)).usingConnection(req.dynamic_connection);
      historyCardsResult = cardResult.rows[0] || null;

      const winnerResult = await sails.sendNativeQuery(escapeSqlSearch(latestWinnerSql)).usingConnection(req.dynamic_connection);
      let winnerResults = winnerResult.rows[0] || null;

      if(winnerResults)
      {
        historyCardsResult.latest_winner = winnerResults.latest_winner ? await getWinnerEmployeeDetailsById(req, winnerResults.latest_winner) : [];
      }
      return res.ok(historyCardsResult, messages.GET_RECORD, RESPONSE_STATUS.success);

    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  competitionCompletionCron : competitionCompletionCron,
  competitionStartCron      : competitionStartCron,
  triggerCompetitionCron    : async (_req,res) => {
    competitionCompletionCron(false);
    competitionStartCron(false);
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  },
};
