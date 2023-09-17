const { getDateUTC, getDateTimeSpecificTimeZone, convertDateUTC, getCurrentDate, formatDate } = require('../utils/common/getDateTime');
const messages = sails.config.globals.messages;
const { ACCOUNT_STATUS, ACCOUNT_CONFIG_CODE, RESPONSE_STATUS, CRON_JOB_CODE, NOTIFICATION_ENTITIES, PERMISSIONS } = require('../utils/constants/enums');
const PointCalculationValidations = require('../validations/PointCalculationValidations');
const { commonListingForPointsCrt, escapeSearch, escapeSqlSearch } = require('../services/utils');
const moment = require('moment');
const {sendNotification} = require('../services/sendNotification');
require('joi');

const checkPermissionExistForUser = (_permissionList, _permission)=>{
  if (_permissionList && _permissionList.length > 0) {
    let index = _permissionList.findIndex(permission => permission.code === _permission);
    return index !== -1;
  }else{
    return false;
  }
};

const totalPointData=async(results,conn,data)=>{
  if(results.length > 0)
  {
    const total_point = results[0].totalPoint;
    if((total_point !== '') && total_point !== null)
    {
      await CompetitionEmployee.update({
        competition_employee_id: data.competition_employee_id
      },{
        total_points: total_point
      }).fetch().usingConnection(conn);
    }
  }
};

const rankResultsData=async(rankResults,conn)=>{
  if(rankResults.length > 0)
  {
    for(const item of rankResults)
    {
      if(item.ranking !== null)
      {
        await CompetitionEmployee.update({competition_employee_id: item.competition_employee_id},{
          rank: item.ranking
        }).fetch().usingConnection(conn);
      }
    }
  }
};

// const dbConnectionString=(results,id)=>{
//   return  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
// };

// const timeZoneDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
// };

// const dateTimeFormatDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
// };

// const dateFormatDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
// };

// const deductPointForNegativeperformanceDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.deduct_points_for_negative_performance);
// };

// const thresholdScoreForPointCalculationDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.threshold_score_for_points_calculation);
// };

// const additionalPointsForPointsCalculationDatas=async(results,id)=>{
//   return  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.additional_points_for_points_calculation);
// };

// const cronPointCalculationDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_points_calculation);
// };

// const deductPointsDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.deduct_points);
// };

// const pointsForPositivePerformance=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.points_for_positive_performance);
// };

// const checkinPointCalculationDatas=async(results,id)=>{
//   return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.checkin_points_calculation);
// };

// const chkDetailsData=async(deduct_points_for_negative_performance)=>{
//   return deduct_points_for_negative_performance.value === 'Yes' ? true : false;
// };

// const chk1DetailsDatas=async(threshold_score_for_points_calculation)=>{
//   return threshold_score_for_points_calculation.value.split(' - ').length >=1 ? threshold_score_for_points_calculation.value.split(' - ')[1] :  process.env.THRESHOLD_SCORE_FOR_POINTS_CALCULATION;
// };

// const tenantDbConnString=async(tenant_db_connection_string)=>{
//   return tenant_db_connection_string ? tenant_db_connection_string.value : '';
// };

// const tenantTimeZoneDatas=async(time_zone)=>{
//   return time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE;
// };

// const tenantDateTimeFormatDatas=async(date_time_format)=>{
//   return date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT;
// };

// const tenantDateFormat=async(date_format)=>{
//   return date_format ? date_format.value : process.env.ACCOUNT_DATEFORMAT;
// };

// const tenantDeductPointForNegativePerformance=async(chk,deduct_points_for_negative_performance)=>{
//   return deduct_points_for_negative_performance ? chk : false;
// };

// const tenantThresholdScoreForPointCalculation=async(threshold_score_for_points_calculation,chk1)=>{
//   return threshold_score_for_points_calculation ? chk1 : process.env.THRESHOLD_SCORE_FOR_POINTS_CALCULATION;
// };

// const tenantAdditionalPointsforPointCalculation=async(additional_points_for_points_calculation)=>{
//   return additional_points_for_points_calculation ? additional_points_for_points_calculation.value : process.env.ADDITIONAL_POINTS_FOR_POINTS_CALCULATION;
// };

// const tenanatCronPointsCalculation=async(cron_points_calculation)=>{
//   return cron_points_calculation ? cron_points_calculation.value : process.env.CRON_POINTS_CALCULATION;
// };

// const tenantDeductPoints=async(deduct_points)=>{
//   return deduct_points ? deduct_points.value : 0;
// };

// const tenantPointsForPositivePerformance=async(points_for_positive_performance)=>{
//   return points_for_positive_performance ? points_for_positive_performance.value : 0;
// };

// const checkinPointsCalculation=async(checkin_points_calculation)=>{
//   return checkin_points_calculation ? checkin_points_calculation.value : 0;
// };

// const accountArrayDataDetails = async(accountIds,results)=>{

//   return accountIds ? accountIds.map(id => {
//     let tenant_db_connection_string = dbConnectionString(results,id);
//     let time_zone = timeZoneDatas(results,id);
//     let date_time_format = dateTimeFormatDatas(results,id);
//     let date_format = dateFormatDatas(results,id);
//     let deduct_points_for_negative_performance =  deductPointForNegativeperformanceDatas(results,id);
//     let threshold_score_for_points_calculation = thresholdScoreForPointCalculationDatas(results,id);
//     let additional_points_for_points_calculation = additionalPointsForPointsCalculationDatas(results,id);
//     let cron_points_calculation = cronPointCalculationDatas(results,id);
//     let deduct_points = deductPointsDatas(results,id);
//     let points_for_positive_performance = pointsForPositivePerformance(results,id);
//     let checkin_points_calculation = checkinPointCalculationDatas(results,id);

//     let chk= chkDetailsData(deduct_points_for_negative_performance);
//     let chk1=chk1DetailsDatas(threshold_score_for_points_calculation);

//     return {
//       account_id                               : id,
//       tenant_db_connection_string              : tenantDbConnString(tenant_db_connection_string),
//       time_zone                                : tenantTimeZoneDatas(time_zone),
//       date_time_format                         : tenantDateTimeFormatDatas(date_time_format),
//       date_format                              : tenantDateFormat(date_format),
//       deduct_points_for_negative_performance   : tenantDeductPointForNegativePerformance(chk,deduct_points_for_negative_performance),
//       threshold_score_for_points_calculation   : tenantThresholdScoreForPointCalculation(threshold_score_for_points_calculation,chk1),
//       additional_points_for_points_calculation : tenantAdditionalPointsforPointCalculation(additional_points_for_points_calculation),
//       cron_points_calculation                  : tenanatCronPointsCalculation(cron_points_calculation),
//       deduct_points                            : tenantDeductPoints(deduct_points),
//       points_for_positive_performance          : tenantPointsForPositivePerformance(points_for_positive_performance),
//       checkin_points_calculation               : checkinPointsCalculation(checkin_points_calculation)
//     };
//   })  : [];
// };

// const tymZoneDatas=async(item)=>{
//   return item.time_zone ? item.time_zone : '';
// };

// const startDateConditionData=async(cronJob)=>{
//   return cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
// };

const chkDatas=(deduct_points_for_negative_performance)=>{
  return deduct_points_for_negative_performance.value === 'Yes' ? true : false;
};

const tenantDbConnStr=(tenant_db_connection_string)=>{
  return tenant_db_connection_string ? tenant_db_connection_string.value : '';
};

const tenantTymZones=(time_zone)=>{
  return time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE;
};

const tenantDateTime=(date_time_format)=>{
  return date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT;
};

const tenantDateTimeFormat=(date_format)=>{
  return date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT;
};
const tenantDeductPointForCalculations=(deduct_points_for_negative_performance,chk)=>{
  return deduct_points_for_negative_performance ? chk : process.env.ACCOUNT_DEDUCT_POINTS_FOR_NEGATIVE_PERFORMANCE;
};

const tenantThresholdScoreForPointCalc=(threshold_score_for_points_calculation)=>{
  return threshold_score_for_points_calculation ? threshold_score_for_points_calculation.value : process.env.THRESHOLD_SCORE_FOR_POINTS_CALCULATION;
};

const tenantAddPointForPointCalc=(additional_points_for_points_calculation)=>{
  return additional_points_for_points_calculation ? additional_points_for_points_calculation.value : process.env.ADDITIONAL_POINTS_FOR_POINTS_CALCULATION;
};

const tenantCronPointNotifi=(cron_points_notification)=>{
  return cron_points_notification ? cron_points_notification.value : process.env.CRON_POINTS_CALCULATION_NOTIFICATION;
};

const accountArrayData=(accountIds,results)=>{
  return accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let deduct_points_for_negative_performance =  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.deduct_points_for_negative_performance);
    let threshold_score_for_points_calculation =  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.threshold_score_for_points_calculation);
    let additional_points_for_points_calculation =  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.additional_points_for_points_calculation);
    let cron_points_notification = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_points_notification);

    let chk=chkDatas(deduct_points_for_negative_performance);

    let tenantConnString=tenantDbConnStr(tenant_db_connection_string);
    let tenantTymZone=tenantTymZones(time_zone);
    let tenantDateTym=tenantDateTime(date_time_format);
    let tenantDateTymFormat=tenantDateTimeFormat(date_format);
    let tenantDeductPointForCalculation=tenantDeductPointForCalculations(deduct_points_for_negative_performance,chk);
    let tenantThresholdScoreForPointCal=tenantThresholdScoreForPointCalc(threshold_score_for_points_calculation);
    let tenantAddPointForPointCal=tenantAddPointForPointCalc(additional_points_for_points_calculation);
    let tenantCronPointNoti=tenantCronPointNotifi(cron_points_notification);

    return {
      account_id                               : id,
      tenant_db_connection_string              : tenantConnString,
      time_zone                                : tenantTymZone,
      date_time_format                         : tenantDateTym,
      date_format                              : tenantDateTymFormat,
      deduct_points_for_negative_performance   : tenantDeductPointForCalculation,
      threshold_score_for_points_calculation   : tenantThresholdScoreForPointCal,
      additional_points_for_points_calculation : tenantAddPointForPointCal,
      cron_points_notification                 : tenantCronPointNoti
    };
  })  : [];
};

const timeZoneData=(item)=>{
  return item.time_zone ? item.time_zone : '';
};

const startDateDatas=(cronJob)=>{
  return cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
};

const rowsData=(rawRes)=>{
  return rawRes.rows ? rawRes.rows : [];
};

const empPointChangeData=(rows)=>{
  return rows.filter(r => r.old_points_calc !== r.new_points_calc && r.intraction_point === 0);
};

const empPointChangeInteractionData=(rows)=>{
  return rows.filter(r => r.old_points_calc !== r.new_points_calc && r.intraction_point !== 0);
};

const empLevelChangeData=(rows)=>{
  return rows.filter(p => p.old_level_id_calc !== p.new_level_id_calc && p.old_level < p.new_level);
};

const chkEmpCondition=(employees,item)=>{
  if(employees && employees.length >0){
    return sendNotification(null,{
      notification_entity : NOTIFICATION_ENTITIES.EMPLOYEE_POINTS_UPDATE,
      employees           : employees,
      account_id          : item.account_id,
    });
  }
};

const chkEmpIntCondition=(employees_intraction,item)=>{
  if(employees_intraction && employees_intraction.length >0){

    return sendNotification(null,{
      notification_entity : NOTIFICATION_ENTITIES.POINT_CALCULATION_FEEDBACK,
      employees           : employees_intraction,
      account_id          : item.account_id,
    });
  }
};

const chkEmpLevelCondition=(employees_level,item)=>{
  if(employees_level && employees_level.length >0){
    return sendNotification(null,{
      notification_entity : NOTIFICATION_ENTITIES.EMPLOYEE_LEVEL_UPDATE,
      employees           : employees_level,
      account_id          : item.account_id,
    });
  }
};

const tenantConnData=(tenantConnection)=>{
  if(tenantConnection){
    tenantConnection.end();
  }
};

const competitionPointCalculationCron = async function(conn){
  try{

    let currentDate = getCurrentDate();

    const competitionSql = `SELECT * FROM competition WHERE '${currentDate}' between start_date and end_date`;
    const rawResultCompetition = await sails
            .sendNativeQuery(competitionSql)
            .usingConnection(conn);

    const competition = rawResultCompetition.rows;
    if(competition.length > 0)
    {
      for(const item of competition){
        const startDate = moment(item.start_date).utc().format('YYYY-MM-DD');
        const compEmployees = await CompetitionEmployee.find({ competition_id: item.competition_id }).usingConnection(conn);
        if(compEmployees.length >0){
          for(const data of compEmployees){
            const employee_id = data.employee_profile_id;
            const sql = `Select ( (select new_points from employee_point_audit where date(created_date)='${currentDate}' AND employee_profile_id=${employee_id}   order by created_date DESC limit 1) -(select old_points from employee_point_audit where date(created_date)='${startDate}' AND employee_profile_id=${employee_id} order by created_date ASC limit 1)) as totalPoint`;
            const rawResultLength1 = await sails
              .sendNativeQuery(sql)
              .usingConnection(conn);
            const results = rawResultLength1.rows;
            await totalPointData(results,conn,data);
          }
        }
      }
      const rankingsql = `SELECT competition_id, competition_employee_id, 
    employee_profile_id, total_points, (CASE when total_points IS NOT NULL THEN 
    DENSE_RANK() OVER(PARTITION BY competition_id, (CASE WHEN total_points IS NOT NULL THEN 1 ELSE 2 END) ORDER BY total_points DESC) END) as ranking FROM competition_employee ORDER BY total_points DESC`;
      const rawResultLength = await sails
            .sendNativeQuery(rankingsql)
            .usingConnection(conn);
      const rankResults = rawResultLength.rows;
      await rankResultsData(rankResults,conn);
    }
  }
  catch(error)
  {
    sails.log(error);
  }
};

const cronPointCalculation = async (curentTimeUTC,checkTenantTimezone) => {
  sails.log.debug('Points Calculation Cron Execution Start');
  let sql = `SELECT
      account.account_id,
      account_configuration_detail.value,
      account_configuration_detail.code
    from account
    INNER JOIN
      account_configuration ON account.account_id = account_configuration.account_id
    INNER JOIN
      account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
    Where
      account_configuration_detail.code IN ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) and account.status = $12;`;

  const rawResult = await sails.sendNativeQuery(sql,[
    ACCOUNT_CONFIG_CODE.tenant_db_connection_string,
    ACCOUNT_CONFIG_CODE.time_zone,
    ACCOUNT_CONFIG_CODE.date_time_format,
    ACCOUNT_CONFIG_CODE.date_format,
    ACCOUNT_CONFIG_CODE.deduct_points_for_negative_performance,
    ACCOUNT_CONFIG_CODE.threshold_score_for_points_calculation,
    ACCOUNT_CONFIG_CODE.additional_points_for_points_calculation,
    ACCOUNT_CONFIG_CODE.cron_points_calculation,
    ACCOUNT_CONFIG_CODE.deduct_points,
    ACCOUNT_CONFIG_CODE.points_for_positive_performance,
    ACCOUNT_CONFIG_CODE.checkin_points_calculation,
    ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let deduct_points_for_negative_performance =  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.deduct_points_for_negative_performance);
    let threshold_score_for_points_calculation =  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.threshold_score_for_points_calculation);
    let additional_points_for_points_calculation =  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.additional_points_for_points_calculation);
    let cron_points_calculation = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_points_calculation);
    let deduct_points = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.deduct_points);
    let points_for_positive_performance = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.points_for_positive_performance);
    let checkin_points_calculation = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.checkin_points_calculation);

    let chk= deduct_points_for_negative_performance.value === 'Yes' ? true : false;
    let chk1=threshold_score_for_points_calculation.value.split(' - ').length >=1 ? threshold_score_for_points_calculation.value.split(' - ')[1] :  process.env.THRESHOLD_SCORE_FOR_POINTS_CALCULATION;

    return {
      account_id                               : id,
      tenant_db_connection_string              : tenant_db_connection_string ? tenant_db_connection_string.value : '',
      time_zone                                : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
      date_time_format                         : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
      date_format                              : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
      deduct_points_for_negative_performance   : deduct_points_for_negative_performance ?chk : false,
      threshold_score_for_points_calculation   : threshold_score_for_points_calculation ? chk1 : process.env.THRESHOLD_SCORE_FOR_POINTS_CALCULATION,
      additional_points_for_points_calculation : additional_points_for_points_calculation ? additional_points_for_points_calculation.value : process.env.ADDITIONAL_POINTS_FOR_POINTS_CALCULATION,
      cron_points_calculation                  : cron_points_calculation ? cron_points_calculation.value : process.env.CRON_POINTS_CALCULATION,
      deduct_points                            : deduct_points ? deduct_points.value : 0,
      points_for_positive_performance          : points_for_positive_performance ? points_for_positive_performance.value : 0,
      checkin_points_calculation               : checkin_points_calculation ? checkin_points_calculation.value : 0
    };
  })  : [];

  for(const item of accountArray)
  {
    if(!item.tenant_db_connection_string) {continue;}

    let timezone = item.time_zone ? item.time_zone : '';
    if(timezone === '') {continue;}

    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');
    //sails.log('cron_points_calculation -->', tenantTime);
    if(checkTenantTimezone && tenantTime !== item.cron_points_calculation){
      continue;
    }

    // if(tenantTime === item.cron_points_calculation){
    // Tenant specific database connection
    let rdi = sails.getDatastore('default');
    let mysql = rdi.driver.mysql;
    let connectionString = item.tenant_db_connection_string;
    let tenantConnection = await  mysql.createConnection(connectionString);
    await tenantConnection.connect();

    let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.points_calculation }).usingConnection(tenantConnection);

    if(cronJob){
      let currentDate = getDateUTC();
      let end_date =  currentDate;
      let obj;
      let start_date=cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
      sails.log(start_date);
      try{
        sails.log(`${item.deduct_points_for_negative_performance},${item.threshold_score_for_points_calculation},${item.additional_points_for_points_calculation},"${getDateUTC()}","${start_date}","${end_date}",${item.deduct_points},${item.points_for_positive_performance}, ${item.checkin_points_calculation}`);

        await sails.sendNativeQuery(`CALL PointsCalculation(${item.deduct_points_for_negative_performance},${item.threshold_score_for_points_calculation},${item.additional_points_for_points_calculation},"${getDateUTC()}","${start_date}","${end_date}",${item.deduct_points},${item.points_for_positive_performance}, ${item.checkin_points_calculation});`).usingConnection(tenantConnection);

        //total point  and rank calculation of competition
        await competitionPointCalculationCron(tenantConnection);

        await CronJob.update({ cron_job_id: cronJob.cron_job_id },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
        obj = {
          status : 'Success',
          error  : ''
        };
      }catch(error){

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
      // No Cron Jon with code Point Calculation
      sails.log('No Cron Jon with code Point Calculation');
    }

    if(tenantConnection){
      await tenantConnection.end();
    }
  }

  sails.log.debug('Points Calculation Cron Execution End');
};

const notificationCron = async (curentTimeUTC,checkTenantTimezone) => {
  sails.log.debug('Points Calculation Notification Cron Execution Start');
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
      account_configuration_detail.code IN ($1,$2,$3,$4,$5,$6,$7,$8) and account.status = $9 ;`;

  const rawResult = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.deduct_points_for_negative_performance,ACCOUNT_CONFIG_CODE.threshold_score_for_points_calculation,ACCOUNT_CONFIG_CODE.additional_points_for_points_calculation,ACCOUNT_CONFIG_CODE.cron_points_notification, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountArrayData(accountIds,results);
  for(const item of accountArray)
  {
    let timezone = timeZoneData(item);
    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');
    if(!item.tenant_db_connection_string && timezone === '' && checkTenantTimezone && tenantTime !== item.cron_points_notification) {continue;}


    // Tenant specific database connection
    let rdi = sails.getDatastore('default');
    let mysql = rdi.driver.mysql;
    let connectionString = item.tenant_db_connection_string;
    let tenantConnection = await  mysql.createConnection(connectionString);
    await tenantConnection.connect();
    let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.points_calculation_notification }).usingConnection(tenantConnection);
    let start_date;
    if(cronJob){
      let currentDate = getDateUTC();
      start_date=startDateDatas(cronJob);
      let end_date =  currentDate;
      sails.log(item.account_id, start_date, end_date);
      let obj;
      try{

        let sqlQuery = `
          SELECT 
               employee_point_audit_old.employee_point_audit_id, 
               employee_point_audit_old.employee_profile_id,
               employee_point_audit_old.emp_user_id, 
               employee_point_audit_old.email,
               employee_point_audit_old.first_name,
               employee_point_audit_old.last_name, 
               employee_point_audit_old.points,
               employee_point_audit_new.intraction_point,
               employee_point_audit_old.old_points_calc,
               employee_point_audit_new.new_points_calc,
               employee_point_audit_old.old_level_id_calc, 
               employee_point_audit_new.new_level_id_calc,
               employee_point_audit_old.old_level_name,
               employee_point_audit_new.new_level_name,
               employee_point_audit_old.old_level,      
               employee_point_audit_new.new_level 
          FROM
              (
               SELECT
                      epa1.employee_point_audit_id, 
                      employee_profile.employee_profile_id,
                      user.user_id AS emp_user_id, 
                      user.email,
                      user.first_name,
                      user.last_name, 
                      employee_profile.points,
                      epa1.old_points AS old_points_calc,
                      epa1.old_level_id AS old_level_id_calc, 
                      level.name AS old_level_name,
                      level.level AS old_level
               FROM employee_point_audit AS epa1
               INNER JOIN LEVEL ON level.level_id = epa1.old_level_id
               INNER JOIN employee_profile ON employee_profile.employee_profile_id = epa1.employee_profile_id
               INNER JOIN masterdb.user ON user.user_id = employee_profile.user_id
               WHERE epa1.created_date > $1 AND epa1.created_date <= $2
               GROUP BY epa1.employee_profile_id
               ORDER BY epa1.employee_point_audit_id ASC
              ) AS employee_point_audit_old
              INNER JOIN 
              (
               SELECT
                      epa2.employee_profile_id AS employee_profile_id,
                      MAX(epa2.interaction_score) AS intraction_point,
                      epa2.old_points AS old_points_calc,
                      MAX(epa2.new_points) AS new_points_calc,
                      epa2.old_level_id AS old_level_id_calc,
                      MAX(epa2.new_level_id) AS new_level_id_calc, 
                      MAX(level.name) AS new_level_name,
                      MAX(level.level) AS new_level
               FROM employee_point_audit AS epa2
               INNER JOIN LEVEL ON level.level_id = epa2.new_level_id
               INNER JOIN employee_profile ON employee_profile.employee_profile_id = epa2.employee_profile_id
               INNER JOIN ${process.env.DB_NAME}.user ON user.user_id = employee_profile.user_id     
               WHERE epa2.created_date > $1 AND epa2.created_date <= $2
               GROUP BY epa2.employee_profile_id
               ORDER BY epa2.employee_point_audit_id DESC
               ) AS employee_point_audit_new

              ON employee_point_audit_old.employee_profile_id = employee_point_audit_new.employee_profile_id
              AND (
                (
                  employee_point_audit_old.old_points_calc != employee_point_audit_new.new_points_calc
	              OR employee_point_audit_old.old_level_id_calc != employee_point_audit_new.new_level_id_calc
                OR employee_point_audit_old.old_level < employee_point_audit_new.new_level
                OR employee_point_audit_new.intraction_point != 0)
           )
        `;
        const rawRes = await sails.sendNativeQuery(`${escapeSqlSearch(sqlQuery)};`,[start_date,end_date]).usingConnection(tenantConnection);
        let rows = rowsData(rawRes);
        //sails.log(rows);
        if(rows && rows.length > 0){
          let employee_point_change = rows.filter(r => r.old_points_calc !== r.new_points_calc && r.intraction_point === 0);
          let employee_point_change_intraction = rows.filter(r => r.old_points_calc !== r.new_points_calc && r.intraction_point !== 0);
          let employee_level_change = rows.filter(p => p.old_level_id_calc !== p.new_level_id_calc && p.old_level < p.new_level);
          let employees = employee_point_change.map(emp => {
            return {
              receipient_employee_profile_id: emp.employee_profile_id
            };
          });
          let employees_intraction = employee_point_change_intraction.map(emp1 => {
            return {
              receipient_employee_profile_id : emp1.employee_profile_id,
              receipient_user_id             : emp1.emp_user_id
            };
          });
          let employees_level = employee_level_change.map(emp2 => {
            return {
              old_level_name                 : emp2.old_level_name,
              new_level_name                 : emp2.new_level_name,
              receipient_employee_profile_id : emp2.employee_profile_id,
              recipient_email                : emp2.email,
              recipient_first_name           : emp2.first_name,
              recipient_last_name            : emp2.last_name,
              receipient_user_id             : emp2.emp_user_id ,
              points                         : emp2.points
            };
          });

          if(employees && employees.length >0){
            await sendNotification(null,{
              notification_entity : NOTIFICATION_ENTITIES.EMPLOYEE_POINTS_UPDATE,
              employees           : employees,
              account_id          : item.account_id,
            });
          }

          if(employees_intraction && employees_intraction.length >0){
            await sendNotification(null,{
              notification_entity : NOTIFICATION_ENTITIES.POINT_CALCULATION_FEEDBACK,
              employees           : employees_intraction,
              account_id          : item.account_id,
            });
          }

          if(employees_level && employees_level.length >0){
            await sendNotification(null,{
              notification_entity : NOTIFICATION_ENTITIES.EMPLOYEE_LEVEL_UPDATE,
              employees           : employees_level,
              account_id          : item.account_id,
            });
          }
        }

        await CronJob.update({ cron_job_id: cronJob.cron_job_id },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
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
      // No Cron Jon with code Point Calculation
      sails.log('No Cron Jon with code Point Calculation Notification');
    }

    tenantConnData(tenantConnection);
    // }
  }

  sails.log.debug('Points Calculation Notification Crno Execution End');
};

const anyConditionDatas=(andCondition,sql)=>{
  for (const conditionData of andCondition) {
    Object.keys(conditionData).forEach((prop) => {
      if (prop === 'job_type') {
        sql = sql + ` INNER JOIN employee_job_type ON employee_job_type.employee_profile_id = employee_point_audit.employee_profile_id
          INNER JOIN job_type ON job_type.job_type_id = employee_job_type.job_type_id
          `;
      }
    });
  }
  return sql;
};

const empProfileIdConds=(employee_profile_id,sql,flag)=>{
  if(employee_profile_id){
    sql +=  ` where employee_point_audit.employee_profile_id = $1 `;
    flag = true;
  }
  return [sql,flag];
};

const condDatas=(employee_profile_id,cond,flag)=>{
  if(employee_profile_id){
    cond = 'AND';
  }else if(!flag){
    cond = 'where ';
    flag = true;
  }else{
    cond = 'AND';
  }
  return [cond,flag];
};

const locationDatas=(prop,sql,conditionData,cond)=>{
  if (prop === 'location') {
    let locationPayload = conditionData[prop].contains;
    const locationName = locationPayload.map(c => `'${c}'`).join(', ');
    const locationData = '(' + locationName + ')';
    sql += ` ${cond} location.name IN ${locationData} `;
  }
  return sql;
};

const jobTypCondDatas=(prop,sql,conditionData,cond)=>{
  if (prop === 'job_type') {
    let jobTypePayload = conditionData[prop].contains;
    const jobTypeName = jobTypePayload.map(c => `'${c}'`).join(', ');
    const jobTypeData = '(' + jobTypeName + ')';
    sql += ` ${cond} job_type.name IN ${jobTypeData} `;
  }
  return sql;
};

const reasonCondDatas=(prop,sql,conditionData,cond)=>{
  if (prop === 'reason') {
    sql = sql + ` ${cond} employee_point_audit.reason LIKE '%${escapeSearch(conditionData[prop].contains)}%'`;
  }
  return sql;
};

const createdDateDatas=(prop,sql,conditionData,cond)=>{
  if (prop === 'created_date') {
    sql = sql + ` ${cond} employee_point_audit.created_date LIKE '%${conditionData[prop].contains}%'`;
  }
  return sql;
};

const createdByDateDatas=(prop,sql,conditionData,cond)=>{
  if (prop === 'created_by') {
    sql = sql + ` ${cond} (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(conditionData[prop].contains)}%') `;
  }
  return sql;
};

const empNameDatas=(prop,sql,conditionData,cond)=>{
  if (prop === 'employee_name') {
    sql = sql + ` ${cond} (concat(employee_user.first_name, " ", employee_user.last_name) LIKE '%${escapeSearch(conditionData[prop].contains)}%') `;
  }
  return sql;
};

const teamMemberIdDatas=(prop,sql,conditionData,cond)=>{
  if (prop === 'team_member_id') {
    sql = sql + ` ${cond} employee_profile.team_member_id LIKE '%${escapeSearch(conditionData[prop].contains)}%'`;
  }
  return sql;
};

const includezerosDatas=(includezeros,sql,employee_profile_id,flag)=>{
  if(includezeros === false){
    let cond = '';
    if(employee_profile_id){
      cond = 'AND';
    }else if(!flag){
      cond = 'where ';
      flag = true;
    }else{
      cond = 'AND';
    }
    sql = sql + ` ${cond} (interaction_score != 0 or note_score != 0 or training_score != 0 or points_earned != 0 or checkin_score != 0) `;
  }
  return [sql,flag];
};

const createdDateFromToDatas=(created_date_from,created_date_to,req,sql,flag,employee_profile_id)=>{
  if(created_date_from && created_date_to){
    let cond = '';
    if(employee_profile_id){
      cond = 'AND';
    }else if(!flag){
      cond = 'where ';
      flag = true;
    }else{
      cond = 'AND';
    }
    sql += ` ${cond} employee_point_audit.created_date BETWEEN "${convertDateUTC(created_date_from,req.timezone,'UTC','YYYY-MM-DD HH:mm:ss')}" AND "${convertDateUTC(created_date_to,req.timezone,'UTC','YYYY-MM-DD HH:mm:ss')}" `;
  }
  return [sql,flag];
};

const createdDateConds=(sortField,sortOrder,sql)=>{
  if(sortField === 'created_date') {
    sql += ` employee_point_audit.created_date ${sortOrder} `;
  }
  return sql;
};

const reasonConds=(sortField,sortOrder,sql)=>{
  if(sortField === 'reason') {sql += ` employee_point_audit.reason ${sortOrder} `;}
  return sql;
};

const createdByConds=(sortField,sortOrder,sql)=>{
  if(sortField === 'created_by') {sql += ` user.first_name ${sortOrder} `;}
  return sql;
};

const empNameConds=(sortField,sortOrder,sql)=>{
  if(sortField === 'employee_name') {sql += ` employee_user.first_name ${sortOrder} `;}
  return sql;
};

const teamMemberIdConds=(sortField,sortOrder,sql)=>{
  if(sortField === 'team_member_id') {sql += ` employee_profile.team_member_id ${sortOrder} `;}
  return sql;
};

const skipSqlConds=(skip,sql,rows)=>{
  if(skip !== undefined && rows !== undefined){
    sql += ` LIMIT $2 OFFSET $3 `;
  }
  return sql;
};

const countDatas=(countRawResult)=>{
  return countRawResult.rows && countRawResult.rows.length ? countRawResult.rows.length : 0;
};

const responseDatas=(rawResult)=>{
  return rawResult.rows ? rawResult.rows: [];
};

const chkResLengthDatas=(response,message)=>{
  if(response.length > 0){
    message = messages.GET_RECORD;
  }
  return message;
};

const itemCreatedDateData=(item,req)=>{
  return (item.created_date) ? getDateTimeSpecificTimeZone(item.created_date, req.timezone, req.dateTimeFormat) : '';
};

module.exports= {
  pointsAdjustment: async(req,res) => {
    try{
      let request = req.allParams();
      const isValidate = await PointCalculationValidations.pointsAdjustment.validate(request);
      if(!isValidate.error) {
        const { employee_profile_id, points, reason } = request;
        const empDetail = await EmployeeProfile.findOne({ employee_profile_id }).populate('level_id').usingConnection(req.dynamic_connection);
        let current_points = empDetail.points;
        let adjustment_points = points;
        let total_points = current_points + adjustment_points;

        if(total_points < 0){
          total_points = 0;
        }

        let levelsql = `Select level_id from level where $1 Between point_range_from AND point_range_to AND status = $2 LIMIT 1;`;

        const rawResult = await sails.sendNativeQuery(`${levelsql};`,[total_points,ACCOUNT_STATUS.active]).usingConnection(req.dynamic_connection);
        let level =  rawResult.rows && rawResult.rows.length ?  rawResult.rows[0]  : null;

        /** Add Audit log in employee_point_audit */
        if ((level !== null) && (level.level_id !== '')) {
          await EmployeeProfile.update({ employee_profile_id },{
            points            : total_points,
            level_id          : level.level_id,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC(),
          }).usingConnection(req.dynamic_connection);
        }else{
          let sortBy;
          sortBy= total_points <= 0 ? 'ASC' : 'DESC';
          let _level = await Level.find({ status: ACCOUNT_STATUS.active }).sort(`level ${sortBy}`).limit(1).usingConnection(req.dynamic_connection);
          await EmployeeProfile.update({ employee_profile_id },{
            points            : total_points,
            level_id          : _level[0].level_id,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC(),
          }).usingConnection(req.dynamic_connection);
          level = _level[0];
        }
        await EmployeePointsAudit.create({
          employee_profile_id  : employee_profile_id,
          reason,
          interaction_score    : 0,
          note_score           : 0,
          training_score       : 0,
          total_weighted_score : 0,
          points_earned        : adjustment_points,
          old_points           : current_points,
          new_points           : total_points,
          old_level_id         : empDetail.level_id.level_id,
          new_level_id         : level.level_id,
          created_by           : req.user.user_id,
          created_date         : getDateUTC()
        }).usingConnection(req.dynamic_connection);

        res.ok(undefined,messages.POINTS_ADJUST,RESPONSE_STATUS.success);
      }else{
        res.ok(isValidate.error,messages.POINTS_ADJUST_ERROR,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.POINTS_ADJUST_ERROR,RESPONSE_STATUS.error);
    }
  },
  find: async(req,res) => {
    /*
        - List all Points Audit for that employee_profile
    */
    try{
      let request = req.allParams();
      const isValidate = await PointCalculationValidations.list.validate(request);
      if(!isValidate.error) {
        const { employee_profile_id, sortField, sortOrder, created_date_from, created_date_to, includezeros } = request;
        const {andCondition, rows, skip } = await commonListingForPointsCrt(request);

        let flag = false;
        let sql = `
          SELECT  
          employee_point_audit.dailyreport_score,
          employee_point_audit_id,employee_point_audit.employee_profile_id, old_points, new_points, points_earned, interaction_score,employee_point_audit.checkin_score, 
            note_score, training_score, reason, employee_point_audit.created_date , 
            user.first_name , user.last_name, employee_user.first_name  as employee_first_name , 
            employee_user.last_name  as employee_last_name, old_level.name as old_level_name, employee_point_audit.old_level_id,
            new_level.name as new_level_name, employee_point_audit.new_level_id, employee_profile.team_member_id as team_member_id,(select
              GROUP_CONCAT( CONCAT(tec.reviewer_status, " by"," - ", case when tec.reviewer_status = 'Approved' AND tec.reviewed_by IS NULL then 'System' when tec.reviewer_status = 'Rejected' AND tec.reviewed_by IS NULL then 'System' else CONCAT(tuser.first_name, " ", tuser.last_name) end," - ",tl.name) SEPARATOR " , " ) AS tooltip
              FROM employee_checkin tec
              LEFT JOIN employee_profile AS ep ON tec.reviewed_by = ep.employee_profile_id
              LEFT JOIN ${process.env.DB_NAME}.user AS tuser ON ep.user_id = tuser.user_id
              INNER JOIN location tl
              ON tl.location_id = tec.location_id
              WHERE employee_point_audit.checkin_score >= 0 AND
              (tec.reviewer_status = "Approved" OR tec.reviewer_status = "Rejected")
              AND tec.employee_profile_id = employee_point_audit.employee_profile_id
              AND tec.checkin_datetime BETWEEN DATE_SUB(employee_point_audit.created_date, INTERVAL 1 DAY) 
              AND employee_point_audit.created_date)  as checkin_status
          FROM employee_point_audit 
          INNER JOIN ${process.env.DB_NAME}.user ON user.user_id = employee_point_audit.created_by
          INNER JOIN employee_profile ON employee_profile.employee_profile_id = employee_point_audit.employee_profile_id 
          INNER JOIN employee_location ON employee_location.employee_profile_id = employee_point_audit.employee_profile_id
          INNER JOIN location ON employee_location.location_id = location.location_id`;

        sql = anyConditionDatas(andCondition,sql);

        sql = sql + `
          INNER JOIN level AS old_level ON old_level.level_id = employee_point_audit.old_level_id
          INNER JOIN level AS new_level ON new_level.level_id = employee_point_audit.new_level_id
          INNER JOIN ${process.env.DB_NAME}.user AS employee_user ON employee_user.user_id = employee_profile.user_id
          `;

        let empProfileIdCondsRes = empProfileIdConds(employee_profile_id,sql,flag);
        sql = empProfileIdCondsRes[0];
        flag = empProfileIdCondsRes[1];

        if(!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi)){
          const emp_profile_id = req.token.employee_profile_id;
          let cond = '';
          if(employee_profile_id){
            cond = 'AND';
          }
          else if(!flag){
            cond = 'where ';
            flag = true;
          }

          const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${emp_profile_id}"`;
          const rawRes =await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
          if(rawRes.rows.length > 0 ){
            sql = sql + `${cond} location.location_id IN ( ${rawRes.rows.map(location => location.location_id) } )`;
          }
        }

        for (const conditionData of andCondition) {
          Object.keys(conditionData).forEach((prop) => {

            let cond = '';
            let condDataRes=condDatas(employee_profile_id,cond,flag);
            cond=condDataRes[0];
            flag=condDataRes[1];

            let locationData=locationDatas(prop,sql,conditionData,cond);
            sql=locationData;

            let jobTypCondData=jobTypCondDatas(prop,sql,conditionData,cond);
            sql=jobTypCondData;

            let reasonCondData=reasonCondDatas(prop,sql,conditionData,cond);
            sql=reasonCondData;

            let createdDateData=createdDateDatas(prop,sql,conditionData,cond);
            sql=createdDateData;

            let createdByDateData=createdByDateDatas(prop,sql,conditionData,cond);
            sql=createdByDateData;

            let empNameData=empNameDatas(prop,sql,conditionData,cond);
            sql=empNameData;

            let teamMemberIdData=teamMemberIdDatas(prop,sql,conditionData,cond);
            sql=teamMemberIdData;
          });
        }

        let includezerosDatasRes  = includezerosDatas(includezeros,sql,employee_profile_id,flag);
        sql = includezerosDatasRes[0];
        flag = includezerosDatasRes[1];

        let createdDateFromToDatasRes = createdDateFromToDatas(created_date_from,created_date_to,req,sql,flag,employee_profile_id);
        sql = createdDateFromToDatasRes[0];
        flag = createdDateFromToDatasRes[1];

        sql += ` GROUP BY employee_point_audit.employee_point_audit_id `;
        sql += ` ORDER BY  `;

        if(sortField && sortOrder){

          let createdDateCond=createdDateConds(sortField,sortOrder,sql);
          sql=createdDateCond;

          let reasonCond=reasonConds(sortField,sortOrder,sql);
          sql=reasonCond;

          let createdByCond=createdByConds(sortField,sortOrder,sql);
          sql=createdByCond;

          let empNameCond=empNameConds(sortField,sortOrder,sql);
          sql=empNameCond;

          let teamMemberIdCond=teamMemberIdConds(sortField,sortOrder,sql);
          sql=teamMemberIdCond;

          sql += `, employee_point_audit.employee_point_audit_id DESC `;
        }else{
          sql += ` employee_point_audit.employee_point_audit_id DESC `;
        }

        let countsql = `Select count(employee_point_audit.employee_point_audit_id) as count FROM ${sql.split(' FROM ')[2]}`;

        let skipSqlCond=skipSqlConds(skip,sql,rows);
        sql=skipSqlCond;
        const rawResult = await sails.sendNativeQuery(`${escapeSqlSearch(sql)};`,[employee_profile_id,Number(rows),Number(skip)]).usingConnection(req.dynamic_connection);
        const countRawResult = await sails.sendNativeQuery(`${escapeSqlSearch(countsql)};`,[employee_profile_id]).usingConnection(req.dynamic_connection);
        let count =  countDatas(countRawResult);

        let response = responseDatas(rawResult);
        let message = messages.NO_POINTS_ADDED;

        let chkResLengthData=chkResLengthDatas(response,message);
        message=chkResLengthData;

        sails.log('response',response);
        let data = {
          pointList: response.map((item) => {
            item.employee_name = `${item.employee_first_name} ${item.employee_last_name}`;
            item.created_date = itemCreatedDateData(item,req);

            delete item.employee_first_name;
            delete item.employee_last_name;

            item.created_by = `${item.first_name} ${item.last_name}`;
            delete item.first_name;
            delete item.last_name;
            return item;
          }),
          totalResult: count
        };
        res.ok(data,message,RESPONSE_STATUS.success);
      }else{
        res.ok(isValidate.error,messages.LIST_POINTS_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok({},messages.LIST_POINTS_FAILURE,RESPONSE_STATUS.error);
    }
  },
  findInteractionHistory: async(req,res) => {
    /*
        - List all Points Audit for that employee_profile
    */
    try{
      let request = req.allParams();
      const isValidate = await PointCalculationValidations.interactionHistory.validate(request);
      if(!isValidate.error) {
        const { employee_profile_id,date } = request;
        let changeDateFormate = moment(date,'MM/DD/YYYY HH:mm').format('YYYY-MM-DD HH:mm');
        let created_date = convertDateUTC(changeDateFormate,req.timezone,'UTC','YYYY-MM-DD');
        let startDateSql = `select start_date from cron_job_logs where cron_job_id = 1 AND Date(start_date) = '${created_date}'`;
        const startDateRawResult = await sails.sendNativeQuery(startDateSql).usingConnection(req.dynamic_connection);
        let start_date = formatDate(startDateRawResult.rows[0].start_date,'YYYY-MM-DD HH:mm:ss');
        let end_date = formatDate(moment(created_date, 'YYYY-MM-DD').subtract(1, 'days'),'YYYY-MM-DD HH:mm:ss');

        let sql = `
        select
        ei.employee_interaction_id,
        concat(tuser.first_name , ' ' , tuser.last_name) as created_by,ei.notes as Notes, inf.name as interaction_factor, g.name as grade,
        tuser.profile_picture_thumbnail_url,
        ei.created_date
        FROM employee_interaction ei
        INNER JOIN employee_interaction_detail eid
        ON eid.employee_interaction_id = ei.employee_interaction_id
        INNER JOIN employee_profile ep
        ON ep.employee_profile_id = ei.employee_profile_id
        INNER JOIN interaction_factor inf
        ON inf.interaction_factor_id = eid.interaction_factor_id
        INNER JOIN ${process.env.DB_NAME}.grade g
        ON g.grade_id = eid.grade_id
        INNER JOIN ${process.env.DB_NAME}.user tuser
        ON ei.created_by= tuser.user_id
        WHERE ei.created_date BETWEEN '${end_date}' AND '${start_date}' AND ei.employee_profile_id = ${employee_profile_id}`;
        const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);

        let response = rawResult.rows ? rawResult.rows: [];

        let groupData = [];
        const unique = [...new Set(response.map(item => item.employee_interaction_id))];
        for (const uniqueID of unique) {
          let filterData = response.filter((item) => item.employee_interaction_id === uniqueID );
          let formateDate =  filterData.map((item) => {
            return {
              ...item,
              created_date: (item.created_date) ? getDateTimeSpecificTimeZone(item.created_date, req.timezone, req.dateTimeFormat) : ''
            };
          });
          groupData.push({interaction: formateDate});
        }
        let message = messages.NO_INTERACTION_POINTS_ADDED;
        if(response.length > 0){
          message = messages.GET_RECORD;
        }

        res.ok(groupData,message,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.LIST_INTERACTION_POINTS_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.LIST_INTERACTION_POINTS_FAILURE,RESPONSE_STATUS.error);
    }
  },

  pointsCalculationCron     : cronPointCalculation,
  pointsCalculationNotiCron : notificationCron,
  trigger                   : async (_req,res) => {
    let curentTimeUTC = getDateUTC();
    cronPointCalculation(curentTimeUTC,false);
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  },
  triggerNoti: async (_req,res) => {
    let curentTimeUTC = getDateUTC();
    await notificationCron(curentTimeUTC,false);
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  },
};


