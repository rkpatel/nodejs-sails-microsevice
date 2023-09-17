/* eslint-disable no-trailing-spaces */
/* eslint-disable key-spacing */
/* eslint-disable camelcase */
/***************************************************************************

  Controller     : Training Report

  **************************************************
  Functions
  **************************************************
  find
  findById
  **************************************************

***************************************************************************/
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const messages = sails.config.globals.messages;
const { RESPONSE_STATUS, ACCOUNT_STATUS, PERMISSIONS } = require('../utils/constants/enums');
const moment = require('moment');
const TrainingEmployeeValidation = require('../validations/TrainingEmployeeValidation');
const {  getDateSpecificTimeZone, getDateTimeSpecificTimeZone, getDateUTC } = require('../utils/common/getDateTime');
const XLSX = require('xlsx');
const fs = require('fs');
const {uploadReport} = require('../services/uploadReport');
const TrainingReportValidation = require('../validations/TrainingReportValidation');

const checkPermissionExistForUser = (_permissionList, _permission)=>{
  if (_permissionList && _permissionList.length > 0) {
    let index = _permissionList.findIndex(permission => permission.code === _permission);
    return index !== -1;
  }else{
    return false;
  }
};    

const checkIfArrayExist = (arrayParam) => {
  return ( arrayParam && arrayParam.length > 0 ) ? true : false;
};


const checkJobLocationCountSqlData=(locations,jobTypes,countsql,req)=>{
  if (locations && locations.length > 0 || !checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS)) {
    countsql = countsql + `INNER JOIN employee_location AS el
                    ON el.employee_profile_id = te.employee_profile_id 
                  INNER JOIN location AS l
                    ON l.location_id = el.location_id `;
  }
  if (jobTypes && jobTypes.length > 0) {
    countsql = countsql + `INNER JOIN employee_job_type AS ejt
                      ON ejt.employee_profile_id = te.employee_profile_id
                   INNER JOIN job_type AS jt
                      ON jt.job_type_id = ejt.job_type_id `;
  }
  return countsql;
};

const locationsAndJobType=(locations,sql,jobTypes)=>{
  if (locations && locations.length > 0) {
    sql= sql + `(SELECT GROUP_CONCAT(name)
    FROM location
    WHERE location_id IN (${locations})) as location_name, `;
    
  }
  if (jobTypes && jobTypes.length > 0) {
    sql= sql + `(SELECT GROUP_CONCAT(name)
    FROM job_type
    WHERE job_type_id IN (${jobTypes})) AS job_type_name, `;
  }
  return sql;
};

const checkLocationPermissionExistingUserData=async(locations,sql,countsql,req,employee_profile_id)=>{
  if (locations && locations.length > 0) {
    const locationName = locations.map((c) => `'${c}'`).join(', ');
    const locationData = '(' + locationName + ')';
    sql = sql + ' AND el.location_id IN ' + locationData + '';
    countsql= countsql + ' AND el.location_id IN ' + locationData + '';
  } else {
    if(!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi)){
      const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${employee_profile_id}"`;
      const rawRes = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
      if(rawRes.length > 0){
        sql = sql + ` AND el.location_id IN ( ${rawRes.rows.map(location => location.location_id) } )`;
        countsql= countsql + ` AND el.location_id IN ( ${rawRes.rows.map(location => location.location_id) } )`;
      }
    }
  }
  return [sql,countsql];
};

const jobTypeCountSqlData=(jobTypes,sql,countsql)=>{
  if (jobTypes && jobTypes.length > 0) {
    const jobTypeName = jobTypes.map((c) => `'${c}'`).join(', ');
    const jobTypeData = '(' + jobTypeName + ')';
    sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
    countsql= countsql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
  }
  return [sql,countsql];
};

const checkGradeId=(prop,data1,sql,countsql)=>{
  if ((prop === 'grade_id') && (data1[prop]).length > 0) {
    let locationPayload = data1[prop];
    const locationName = locationPayload.map(c => `'${c}'`).join(', ');
    const locationId = '(' + locationName + ')';
    sql = sql + ` AND te.grade_id IN ${locationId}`;
    countsql= countsql + ` AND te.grade_id IN ${locationId}`;
  }
  return [sql,countsql];
};

const checkTrainingCategoryName=(prop,data1,sql,countsql)=>{
  if ((prop === 'training_category_name') && (data1[prop]).length > 0) {
    let tcPayload = data1[prop];
    const tcName = tcPayload.map(c => `'${escapeSearch(c)}'`).join(', ');
    const tcNamePayload = '(' + tcName + ')';
    sql = sql + ` AND tc.name IN ${tcNamePayload}`;
    countsql= countsql + ` AND tc.name IN ${tcNamePayload}`;
  }
  return [sql,countsql];
};

const checkTrainingName=(prop,data1,sql,countsql)=>{
  if ((prop === 'training_name') && (data1[prop] !== '')) {
    sql = sql + ` AND t.name LIKE '%${escapeSearch(data1[prop])}%'`;
    countsql= countsql + ` AND t.name LIKE '%${escapeSearch(data1[prop])}%'`;
  }
  return [sql,countsql];
};

const checkNotes=(prop,data1,sql,countsql)=>{
  if ((prop === 'notes') && (data1[prop] !== '')) {
    sql = sql + ` AND te.notes LIKE '%${escapeSearch(data1[prop])}%'`;
    countsql= countsql + ` AND te.notes LIKE '%${escapeSearch(data1[prop])}%'`;
  }
  return [sql,countsql];
};

const checkScenarioName=(prop,data1,sql,countsql)=>{
  if ((prop === 'scenario_name') && (data1[prop] !== '')) {
    sql = sql + ` AND ga.scenario LIKE '%${escapeSearch(data1[prop])}%'`;
    countsql= countsql + ` AND ga.scenario LIKE '%${escapeSearch(data1[prop])}%'`;
  }
  return [sql,countsql];
};

const checkCreatedBy=(prop,data1,sql,countsql)=>{
  if ((prop === 'created_by') && (data1[prop] !== '')) {
    sql = sql + ` AND (concat(created_by_user.first_name, " ", created_by_user.last_name) LIKE '%${escapeSearch(data1[prop])}%') `;
    countsql= countsql + ` AND (concat(created_by_user.first_name, " ", created_by_user.last_name) LIKE '%${escapeSearch(data1[prop])}%') `;
  }
  return [sql,countsql];
};

const checkEmployeeName=(prop,data1,sql,countsql)=>{
  if ((prop === 'employee_name') && (data1[prop] !== '')) {
    sql = sql + ` AND (concat(employee_user.first_name, " ", employee_user.last_name) LIKE '%${escapeSearch(data1[prop])}%') `;
    countsql= countsql + ` AND (concat(employee_user.first_name, " ", employee_user.last_name) LIKE '%${escapeSearch(data1[prop])}%') `;
  }
  return [sql,countsql];
};

const checkCreatedDate=(prop,data1,sql,countsql)=>{
  if (prop === 'created_date') {
    if((data1[prop].from_date !== '') && (data1[prop].to_date !== ''))
    {
      const startDate = moment(data1[prop].from_date).format('YYYY-MM-DD');
      const endDate = moment(data1[prop].to_date).format('YYYY-MM-DD');
      sql = sql + ` AND (te.${prop} BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
      countsql= countsql + ` AND (te.${prop} BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
    }
  }
  return [sql,countsql];
};

const checkTeamMemberId=(prop,data1,sql,countsql)=>{
  if ((prop === 'team_member_id') && (data1[prop] !== '')) {
    sql = sql + ` AND emp.team_member_id LIKE '%${escapeSearch(data1[prop])}%'`;
    countsql= countsql + ` AND emp.team_member_id LIKE '%${escapeSearch(data1[prop])}%'`;
  }
  return [sql,countsql];
};

const checkAllConditions=(sortField,sql,countsql,sortOrder)=>{
  if(sortField === 'employee_name'){
    sql = sql + ` ORDER BY employee_user.first_name ${sortOrder} `;
    countsql = countsql + ` ORDER BY employee_user.first_name ${sortOrder} `;
  }else if(sortField === 'training_name'){
    sql = sql + ` ORDER BY t.name  ${sortOrder}`;
    countsql = countsql + ` ORDER BY t.name  ${sortOrder}`;
  }else if(sortField === 'training_category_name'){
    sql = sql + ` ORDER BY tc.name  ${sortOrder}`;
    countsql = countsql + ` ORDER BY tc.name  ${sortOrder}`;
  }else if(sortField === 'grade_name'){
    sql = sql + ` ORDER BY g.name  ${sortOrder}`;
    countsql = countsql + ` ORDER BY g.name  ${sortOrder}`;
  }else if(sortField === 'conducted_by'){
    sql = sql + ` ORDER BY created_by_user.first_name  ${sortOrder}`;
    countsql = countsql + ` ORDER BY created_by_user.first_name  ${sortOrder}`;
  }else if(sortField === 'scenario_name'){
    sql = sql + ` ORDER BY ga.scenario  ${sortOrder}`;
    countsql = countsql + ` ORDER BY ga.scenario  ${sortOrder}`;
  }else if(sortField === 'conducted_date'){
    sql = sql + ` ORDER BY te.created_date  ${sortOrder}`;
    countsql = countsql + ` ORDER BY te.created_date  ${sortOrder}`;
  }else if(sortField === 'notes'){
    sql = sql + ` ORDER BY te.notes  ${sortOrder}`;
    countsql = countsql + ` ORDER BY te.notes  ${sortOrder}`;
  }
  else if(sortField === 'team_member_id'){
    sql = sql + ` ORDER BY emp.team_member_id  ${sortOrder}`;
    countsql = countsql + ` ORDER BY emp.team_member_id  ${sortOrder}`;
  }
  return [sql,countsql];
};

const conductedDateData=(item,req)=>{
  return item.conducted_date ? getDateSpecificTimeZone(item.conducted_date, req.timezone, req.dateFormat) : '';
};

module.exports = {
  find: async function (req, res) {
    const { locations, jobTypes } = req.allParams();
    const dbname = req.dynamic_connection.config.database;
    const employee_profile_id = req.token.employee_profile_id;
    let results;
    let sql = `SELECT DISTINCT
    te.training_id as training_id,
    te.employee_profile_id as employee_profile_id,
    te.training_employee_id as training_employee_id,
    te.group_activity_id as group_activity_id,
      (SELECT CONCAT(x.first_name, " ", x.last_name) AS name FROM ${process.env.DB_NAME}.user x WHERE x.user_id = emp.user_id) as employee_name,
      t.name as training_name,
      tc.name as training_category_name,
      te.created_date as conducted_date,
      g.name as grade_name,
      g.icon_name as icon_name,
      (SELECT CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = te.created_by) as conducted_by,
      te.notes as notes,
      ga.scenario as scenario_name,
      (SELECT GROUP_CONCAT(name)
     FROM location
     WHERE location_id IN (
          SELECT DISTINCT location_id
          FROM employee_location
          WHERE employee_profile_id = te.employee_profile_id)) as location_name,
    (SELECT GROUP_CONCAT(name)
     FROM job_type
     WHERE job_type_id IN (
          SELECT DISTINCT job_type_id
          FROM employee_job_type
          WHERE employee_profile_id = te.employee_profile_id)) as job_type_name
    FROM ${dbname}.training_employee te
    INNER JOIN ${dbname}.training t
      ON t.training_id = te.training_id
    INNER JOIN ${dbname}.training_category tc
      ON tc.training_category_id = t.training_category_id
    INNER JOIN ${process.env.DB_NAME}.grade g
      ON g.grade_id = te.grade_id
    INNER JOIN ${dbname}.employee_profile emp
      ON emp.employee_profile_id = te.employee_profile_id
    LEFT JOIN ${dbname}.employee_location el
      ON el.employee_profile_id = te.employee_profile_id
    LEFT JOIN ${dbname}.employee_job_type ejt
      ON ejt.employee_profile_id = te.employee_profile_id
    LEFT JOIN ${dbname}.group_activity ga
    ON ga.group_activity_id = te.group_activity_id WHERE te.status = '${ACCOUNT_STATUS.active}'`;
    if (locations && locations.length > 0) {
      const locationName = locations.map((c) => `'${c}'`).join(', ');
      const locationData = '(' + locationName + ')';
      sql = sql + ' AND el.location_id IN ' + locationData + '';
    } else {
      if(!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS)){
        const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${employee_profile_id}"`;
        const rawRes = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
        sql = sql + ` AND el.location_id IN ( ${rawRes.rows.map(location => location.location_id) } )`;
      }
    }

    if (jobTypes && jobTypes.length > 0) {
      const jobTypeName = jobTypes.map((c) => `'${c}'`).join(', ');
      const jobTypeData = '(' + jobTypeName + ')';
      sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
    }
    sql = sql + ` ORDER BY te.created_date DESC`;
    
    const rawResult = await sails
      .sendNativeQuery(escapeSqlSearch(sql))
      .usingConnection(req.dynamic_connection);
    results = rawResult.rows;

    let data = {
      list: results,
      totalResult: results.length,
    };
    return res.ok(data, messages.GET_USERS, RESPONSE_STATUS.success);
  },

  findWithPagination: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await TrainingReportValidation.findWithPagination.validate(request);
      if (!isValidate.error) {
        const { locations, job_types, sortOrder, sortField, employee_profile_id } = req.allParams();
        const findQuery = await commonListing(req.allParams());
        let employee_id = employee_profile_id ? employee_profile_id : req.empProfile.employee_profile_id;
        let results;
        let countsql = `SELECT DISTINCT
        te.training_id as training_id,
        te.employee_profile_id as employee_profile_id,`;
        countsql =   locationsAndJobType(locations,countsql,job_types);
        countsql = countsql + `te.training_employee_id as training_employee_id FROM training_employee te
        INNER JOIN training t
          ON t.training_id = te.training_id
        INNER JOIN training_category tc
          ON tc.training_category_id = t.training_category_id
        INNER JOIN ${process.env.DB_NAME}.grade g
          ON g.grade_id = te.grade_id
        INNER JOIN ${process.env.DB_NAME}.user created_by_user
          ON created_by_user.user_id = te.created_by
        INNER JOIN employee_profile emp
          ON emp.employee_profile_id = te.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user employee_user
          ON employee_user.user_id = emp.user_id `;
    
        countsql = checkJobLocationCountSqlData(locations,job_types,countsql,req);
        
        countsql = countsql + `LEFT JOIN group_activity ga
        ON ga.group_activity_id = te.group_activity_id WHERE te.status = '${ACCOUNT_STATUS.active}'`;
        let sql = `SELECT DISTINCT
        te.training_id as training_id,
        te.employee_profile_id as employee_profile_id,
        te.training_employee_id as training_employee_id,
        te.group_activity_id as group_activity_id,
          CONCAT(employee_user.first_name, " ", employee_user.last_name) as employee_name,
          CONCAT(created_by_user.first_name, " ", created_by_user.last_name) as conducted_by,
          t.name as training_name,
          tc.name as training_category_name,
          te.created_date as conducted_date,
          g.name as grade_name,
          g.icon_name as icon_name,
          emp.team_member_id as team_member_id,
          te.notes as notes,
          ga.scenario as scenario_name, `;
    
        sql = locationsAndJobType(locations,sql,job_types);
    
        sql = sql + `IF(task.task_status='Completed', 'Yes', 'No') quiz_appeared
        FROM training_employee te
        INNER JOIN training t
          ON t.training_id = te.training_id
        INNER JOIN training_category tc
          ON tc.training_category_id = t.training_category_id
        INNER JOIN ${process.env.DB_NAME}.grade g
          ON g.grade_id = te.grade_id
        INNER JOIN ${process.env.DB_NAME}.user AS created_by_user
          ON created_by_user.user_id = te.created_by
        INNER JOIN employee_profile emp
          ON emp.employee_profile_id = te.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user AS employee_user
          ON employee_user.user_id = emp.user_id `;
        if (checkIfArrayExist(locations) || !checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS)) {
          sql = sql + `INNER JOIN employee_location AS el
                        ON el.employee_profile_id = te.employee_profile_id 
                      INNER JOIN location AS l
                        ON l.location_id = el.location_id `;
        }
        if (checkIfArrayExist(job_types)) {
          sql = sql + `INNER JOIN employee_job_type AS ejt
                          ON ejt.employee_profile_id = te.employee_profile_id
                       INNER JOIN job_type AS jt
                          ON jt.job_type_id = ejt.job_type_id `;
        }
        sql = sql + `LEFT JOIN group_activity ga
        ON ga.group_activity_id = te.group_activity_id 
        LEFT JOIN task ON te.training_employee_id = task.training_employee_id
        WHERE te.status = '${ACCOUNT_STATUS.active}'`;
    
        let checkLocationPermissionExistingUserDataRes = await checkLocationPermissionExistingUserData(locations,sql,countsql,req,employee_id);
        sql = checkLocationPermissionExistingUserDataRes[0];
        countsql = checkLocationPermissionExistingUserDataRes[1];
        
        let jobTypeCountSqlDataRes = jobTypeCountSqlData(job_types,sql,countsql);
        sql = jobTypeCountSqlDataRes[0];
        countsql = jobTypeCountSqlDataRes[1];
    
        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data1 of andPayload) {
            Object.keys(data1).forEach((prop) => {
              let checkGradeIdResult = checkGradeId(prop,data1,sql,countsql);
              sql = checkGradeIdResult[0];
              countsql = checkGradeIdResult[1];
    
              let checkTrainingCategoryNameRes = checkTrainingCategoryName(prop,data1,sql,countsql);
              sql = checkTrainingCategoryNameRes[0];
              countsql = checkTrainingCategoryNameRes[1];
    
              let checkTrainingNameRes = checkTrainingName(prop,data1,sql,countsql);
              sql = checkTrainingNameRes[0];
              countsql = checkTrainingNameRes[1];
    
              let checkNotesRes = checkNotes(prop,data1,sql,countsql);
              sql = checkNotesRes[0];
              countsql = checkNotesRes[1];
    
              let checkScenarioNameRes = checkScenarioName(prop,data1,sql,countsql);
              sql = checkScenarioNameRes[0];
              countsql = checkScenarioNameRes[1];
    
              let checkCreatedByRes = checkCreatedBy(prop,data1,sql,countsql);
              sql = checkCreatedByRes[0];
              countsql = checkCreatedByRes[1];
    
              let checkEmployeeNameRes = checkEmployeeName(prop,data1,sql,countsql);
              sql = checkEmployeeNameRes[0];
              countsql = checkEmployeeNameRes[1];
    
              let checkCreatedDateRes = checkCreatedDate(prop,data1,sql,countsql);
              sql = checkCreatedDateRes[0];
              countsql = checkCreatedDateRes[1];
    
              let checkTeamMemberIdRes = checkTeamMemberId(prop,data1,sql,countsql);
              sql = checkTeamMemberIdRes[0];
              countsql = checkTeamMemberIdRes[1];
            });
          }
        }
        let checkAllConditionsRes = checkAllConditions(sortField,sql,countsql,sortOrder);
        sql = checkAllConditionsRes[0];        
        countsql = checkAllConditionsRes[1];
        const rawResultLength = await sails
          .sendNativeQuery(escapeSqlSearch(countsql))
          .usingConnection(req.dynamic_connection);
        let resultsLength = rawResultLength.rows;
    
        sql = sql + ` limit ${findQuery.rows} offset ${findQuery.skip}`;
        const rawResult = await sails
        .sendNativeQuery(escapeSqlSearch(sql))
        .usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        results = resultsLength.length > 0 ? results.map(item => {
          return {
            ...item,
            conducted_date :  conductedDateData(item,req)
          };
        }) : [];
        let data = {
          list: results,
          totalResult: resultsLength.length,
        };
        return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
      }else {
        res.ok(
          isValidate.error,
          messages.GET_DATA_FAILED,
          RESPONSE_STATUS.error
        );
      }
    }catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  findByEmployeeId: async function (req, res) {
    let request = req.allParams();
    const { employee_profile_id } = request;
    const dbname = req.dynamic_connection.config.database;
    let results;
    let sql = `SELECT DISTINCT
    te.training_employee_id as training_employee_id,
    te.employee_profile_id as employee_profile_id,
    te.group_activity_id as group_activity_id,
      (SELECT CONCAT(x.first_name, " ", x.last_name) AS name FROM ${process.env.DB_NAME}.user x WHERE x.user_id = emp.user_id) as employee_name,
      t.name as training_name,
      tc.name as training_category_name,
      te.created_date as conducted_date,
      g.name as grade_name,
      g.icon_name as icon_name,
      (SELECT CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = te.created_by) as conducted_by,
      te.notes as notes,
      ga.scenario as scenario_name,
      ga.day as day
    FROM ${dbname}.training_employee te
    INNER JOIN ${dbname}.training t
      ON t.training_id = te.training_id
    INNER JOIN ${dbname}.training_category tc
      ON tc.training_category_id = t.training_category_id
    INNER JOIN ${process.env.DB_NAME}.grade g
      ON g.grade_id = te.grade_id
    INNER JOIN ${dbname}.employee_profile emp
      ON emp.employee_profile_id = te.employee_profile_id
    LEFT JOIN ${dbname}.employee_location el
      ON el.employee_profile_id = te.employee_profile_id
    LEFT JOIN ${dbname}.employee_job_type ejt
      ON ejt.employee_profile_id = te.employee_profile_id
    LEFT JOIN ${dbname}.group_activity ga
    ON ga.group_activity_id = te.group_activity_id
    WHERE te.employee_profile_id = ${employee_profile_id}
    AND te.status = '${ACCOUNT_STATUS.active}'`;
    sql = sql + ` ORDER BY te.created_date DESC`;
    const rawResult = await sails
      .sendNativeQuery(escapeSqlSearch(sql))
      .usingConnection(req.dynamic_connection);
    results = rawResult.rows;

    let data = {
      list: results,
      totalResult: results.length,
    };
    return res.ok(data, messages.GET_USERS, RESPONSE_STATUS.success);
  },

  findLazyLoading: async function (req, res) {
    try {
      let request = req.allParams();
      const { employee_profile_id } = request;
      const dbname = req.dynamic_connection.config.database;
      const findQuery = await commonListing(request);
      if (request.employee_profile_id) {
        request = _.omit(request, 'employee_profile_id');
      }
      let results;
      let filterCount = 1;
      let filterValues = [];
      const isValidate = await TrainingEmployeeValidation.filter.validate(request);
      if (!isValidate.error) {
        let sql = `SELECT DISTINCT
          te.training_id as training_id,
          te.employee_profile_id as employee_profile_id,
          te.training_employee_id as training_employee_id,
          te.group_activity_id as group_activity_id,
          CONCAT(created_by_user.first_name, " ", created_by_user.last_name) AS conducted_by,
            te.created_date as conducted_date,
            t.name as training_name,
            g.name as grade_name,
            g.icon_name as icon_name,
            ga.scenario as scenario_name,
          IF(task.task_status='Completed', 'Yes', 'No') quiz_appeared
          FROM ${dbname}.training_employee te
          INNER JOIN ${dbname}.training t
            ON t.training_id = te.training_id
          INNER JOIN ${process.env.DB_NAME}.grade g
            ON g.grade_id = te.grade_id
          INNER JOIN ${process.env.DB_NAME}.user AS created_by_user
            ON created_by_user.user_id = te.created_by
          LEFT JOIN ${dbname}.group_activity ga
          ON ga.group_activity_id = te.group_activity_id 
          LEFT JOIN task ON te.training_employee_id = task.training_employee_id
          WHERE te.employee_profile_id = ${employee_profile_id}
          AND te.status = '${ACCOUNT_STATUS.active}' `;

        let joinCondition = ``;
        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              if ((prop === 'grade_id') && (data[prop]).length > 0) {
                let gradePayload = data[prop];
                const gradeName = gradePayload.map(c => `${c}`).join(', ');
                const gradeId = `(`+ gradeName + `)`;
                joinCondition = joinCondition + ` AND te.grade_id IN ${gradeId}`;
              }
              if ((prop === 'training_name') && (data[prop] !== '')) {
                joinCondition = joinCondition + ` AND t.name LIKE $`+filterCount+``;
                filterValues.push('%'+escapeSearch(data[prop])+'%');
                filterCount++;
              }
              if ((prop === 'created_by') && (data[prop] !== '')) {
                joinCondition = joinCondition + ` AND (concat(created_by_user.first_name,' ', created_by_user.last_name) LIKE $`+filterCount+`) `;
                filterValues.push('%'+escapeSearch(data[prop])+'%');
                filterCount++;
              }
              if (prop === 'created_date') {
                if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
                {
                  const startDate = moment(data[prop].from_date).format('YYYY-MM-DD');
                  const endDate = moment(data[prop].to_date).format('YYYY-MM-DD');
                  joinCondition = joinCondition + ` AND (te.${prop} BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
                }
              }
            });
          }
        }
        sql = (await sql) + joinCondition + ` ORDER BY ${findQuery.sort} `;
        const lengthsql = `SELECT COUNT(DISTINCT te.training_employee_id) AS cnt 
                          FROM ${dbname}.training_employee te
                            INNER JOIN ${dbname}.training t
                              ON t.training_id = te.training_id
                            INNER JOIN ${process.env.DB_NAME}.user AS created_by_user
                              ON created_by_user.user_id = te.created_by
                            WHERE te.employee_profile_id = ${employee_profile_id}
                              AND te.status = '${ACCOUNT_STATUS.active}'
                              AND te.grade_id IS NOT NULL
                            ${joinCondition}`;
        
        const rawResultLength = await sails.sendNativeQuery(escapeSqlSearch(lengthsql), filterValues).usingConnection(req.dynamic_connection);
        const resultsLength = rawResultLength.rows;
        sql = sql + `limit ${findQuery.rows} offset ${findQuery.skip}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql), filterValues).usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        if(results.length > 0)
        {
          const response = await results.map(item => {
            const conductedDate=item.conducted_date ? getDateSpecificTimeZone(item.conducted_date,req.dateFormat) : '';
            return {
              // ...item,
              // conductedDate
              training_id: item.training_id,
              employee_profile_id:item.employee_profile_id,
              training_employee_id:item.training_employee_id,
              group_activity_id: item.group_activity_id,
              conducted_by: item.conducted_by,
              training_name: item.training_name,
              grade_name: item.grade_name,
              icon_name: item.icon_name,
              scenario_name: item.scenario_name,
              quiz_appeared:item.quiz_appeared,
              conducted_date: conductedDate
            };
          });
          let data = {
            list: response,
            totalResult: resultsLength[0].cnt,
          };
          return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
        }
        else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }

      }
      else{
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  exportTrainingReportList: async function (req, res) {
    try{
      let request = req.allParams();
      const isValidate = await TrainingReportValidation.findWithPagination.validate(request);
      if (!isValidate.error) {
        const { locations, job_types, sortOrder, sortField, employee_profile_id } = req.allParams();
        const findQuery = await commonListing(req.allParams());
        let employee_id = employee_profile_id ? employee_profile_id : req.empProfile.employee_profile_id;
        let results;
    
        let sql = `SELECT DISTINCT
        te.training_id as training_id,
        te.employee_profile_id as employee_profile_id,
        te.training_employee_id as training_employee_id,
        te.group_activity_id as group_activity_id,
          CONCAT(employee_user.first_name, " ", employee_user.last_name) as employee_name,
          CONCAT(created_by_user.first_name, " ", created_by_user.last_name) as conducted_by,
          t.name as training_name,
          tc.name as training_category_name,
          te.created_date as conducted_date,
          g.name as grade_name,
          g.icon_name as icon_name,
          emp.team_member_id as team_member_id,
          te.notes as notes,
          ga.scenario as scenario_name, `;
        if (locations && locations.length > 0) {
          sql = sql + `GROUP_CONCAT(DISTINCT l.name) AS location_name, `;
        }
        if (job_types && job_types.length > 0) {
          sql = sql + `GROUP_CONCAT(DISTINCT jt.name) AS job_type_name, `;
        }
    
        sql = sql + `IF(task.task_status='Completed', 'Yes', 'No') quiz_appeared
        FROM training_employee te
        INNER JOIN training t
          ON t.training_id = te.training_id
        INNER JOIN training_category tc
          ON tc.training_category_id = t.training_category_id
        INNER JOIN ${process.env.DB_NAME}.grade g
          ON g.grade_id = te.grade_id
        INNER JOIN ${process.env.DB_NAME}.user AS created_by_user
          ON created_by_user.user_id = te.created_by
        INNER JOIN employee_profile emp
          ON emp.employee_profile_id = te.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user AS employee_user
          ON employee_user.user_id = emp.user_id `;
        if (locations && locations.length > 0 || (!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi)) ) {
          sql = sql + `INNER JOIN employee_location AS el
                        ON el.employee_profile_id = te.employee_profile_id 
                      INNER JOIN location AS l
                        ON l.location_id = el.location_id `;
        }
        if (job_types && job_types.length > 0) {
          sql = sql + `INNER JOIN employee_job_type AS ejt
                          ON ejt.employee_profile_id = te.employee_profile_id
                       INNER JOIN job_type AS jt
                          ON jt.job_type_id = ejt.job_type_id `;
        }
        sql = sql + `LEFT JOIN group_activity ga
        ON ga.group_activity_id = te.group_activity_id 
        LEFT JOIN task ON te.training_employee_id = task.training_employee_id
        WHERE te.status = '${ACCOUNT_STATUS.active}'`;
    
        if (locations && locations.length > 0) {
          const locationName = locations.map((c) => `'${c}'`).join(', ');
          const locationData = '(' + locationName + ')';
          sql = sql + ' AND el.location_id IN ' + locationData + '';
        } else {
          if(!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi)){
            const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${employee_id}"`;
            const rawRes = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
            if(rawRes.rows.length > 0){
              sql = sql + ` AND el.location_id IN ( ${rawRes.rows.map(location => location.location_id) } )`;
            }
          }
        }
    
        if (job_types && job_types.length > 0) {
          const jobTypeName = job_types.map((c) => `'${c}'`).join(', ');
          const jobTypeData = '(' + jobTypeName + ')';
          sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
        }
    
        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data1 of andPayload) {
            Object.keys(data1).forEach((prop) => {
              if ((prop === 'grade_id') && (data1[prop]).length > 0) {
                let locationPayload = data1[prop];
                const locationName = locationPayload.map(c => `'${c}'`).join(', ');
                const locationId = '(' + locationName + ')';
                sql = sql + ` AND te.grade_id IN ${locationId}`;
              }
              if ((prop === 'training_category_name') && (data1[prop]).length > 0) {
                let tcPayload = data1[prop];
                const tcName = tcPayload.map(c => `'${escapeSearch(c)}'`).join(', ');
                const tcNamePayload = '(' + tcName + ')';
                sql = sql + ` AND tc.name IN ${tcNamePayload}`;
               
              }
              if ((prop === 'training_name') && (data1[prop] !== '')) {
                sql = sql + ` AND t.name LIKE '%${escapeSearch(data1[prop])}%'`;
                
              }
              if ((prop === 'notes') && (data1[prop] !== '')) {
                sql = sql + ` AND te.notes LIKE '%${escapeSearch(data1[prop])}%'`;
               
              }
              if ((prop === 'scenario_name') && (data1[prop] !== '')) {
                sql = sql + ` AND ga.scenario LIKE '%${escapeSearch(data1[prop])}%'`;
               
              }
              if ((prop === 'created_by') && (data1[prop] !== '')) {
                sql = sql + ` AND (concat(created_by_user.first_name, " ", created_by_user.last_name) LIKE '%${escapeSearch(data1[prop])}%') `;
               
              }
              if ((prop === 'employee_name') && (data1[prop] !== '')) {
                sql = sql + ` AND (concat(employee_user.first_name, " ", employee_user.last_name) LIKE '%${escapeSearch(data1[prop])}%') `;
                
              }
    
              if (prop === 'created_date') {
                if((data1[prop].from_date !== '') && (data1[prop].to_date !== ''))
                {
                  const startDate = moment(data1[prop].from_date).format('YYYY-MM-DD');
                  const endDate = moment(data1[prop].to_date).format('YYYY-MM-DD');
                  sql = sql + ` AND (te.${prop} BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
                  
                }
              }
              if ((prop === 'team_member_id') && (data1[prop] !== '')) {
                sql = sql + ` AND emp.team_member_id LIKE '%${escapeSearch(data1[prop])}%'`;
                
              }
            });
          }
        }
    
        if(sortField === 'employee_name'){
          sql = sql + ` ORDER BY employee_user.first_name ${sortOrder} `;
        }else if(sortField === 'training_name'){
          sql = sql + ` ORDER BY t.name  ${sortOrder}`;
        }else if(sortField === 'training_category_name'){
          sql = sql + ` ORDER BY tc.name  ${sortOrder}`;
        }else if(sortField === 'grade_name'){
          sql = sql + ` ORDER BY g.name  ${sortOrder}`;
        }else if(sortField === 'conducted_by'){
          sql = sql + ` ORDER BY created_by_user.first_name  ${sortOrder}`;
        }else if(sortField === 'scenario_name'){
          sql = sql + ` ORDER BY ga.scenario  ${sortOrder}`;
        }else if(sortField === 'conducted_date'){
          sql = sql + ` ORDER BY te.created_date  ${sortOrder}`; 
        }else if(sortField === 'notes'){
          sql = sql + ` ORDER BY te.notes  ${sortOrder}`;
        }
        else if(sortField === 'team_member_id'){
          sql = sql + ` ORDER BY emp.team_member_id  ${sortOrder}`;
        }
        
        sql = sql + ` limit ${findQuery.rows} offset ${findQuery.skip}`;
        
        const rawResult = await sails
        .sendNativeQuery(escapeSqlSearch(sql))
        .usingConnection(req.dynamic_connection);
        results = rawResult.rows;
    
        let TrainingReportDetails = [];
       
        if(results.length > 0 ){
          for (const item of results) {
            if(item.training_id){
              TrainingReportDetails.push({
                'Skill Assessment ID'       : item.training_id,
                'ID'   : item.team_member_id,
                'Team Member' : item.employee_name,
                'Location' : item.location_name ? item.location_name : null,
                'Job Type' : item.job_type_name ? item.job_type_name : null,
                'Skills' : item.training_name,
                'Note' : item.notes,
                'Score' : item.grade_name,
                'Date' :  item.conducted_date ? getDateTimeSpecificTimeZone(
                  item.conducted_date,
                    req.timezone,
                    req.dateTimeFormat
                ): '',
                'Added By' : item.conducted_by,
                'Multi Skill Assessment' : item.scenario_name,
              });
            }
          }       
        }
        
        if(TrainingReportDetails.length > 0){
          let curentTimeUTC = getDateUTC();
          !fs.existsSync(`${process.cwd()}/assets/reports/`) && fs.mkdirSync(`${process.cwd()}/assets/reports/`, { recursive: true });
          let fileName = `SkillAssessmentReport_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD-YYYY_HH_mm_ss')}`;
          let sheetName = `SkillAssessmentReport_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD')}`;
          let TrainingReportSheet = XLSX.utils.json_to_sheet(TrainingReportDetails);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, TrainingReportSheet, sheetName );
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
  
          return res.ok(data, messages.EXPORT_REPORT_SUCCESS, RESPONSE_STATUS.success);
        }else{
          res.ok(undefined,messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
        }
        
      } else{
        res.ok(isValidate.error, messages.EXPORT_REPORT_FAILURE, RESPONSE_STATUS.error);
      }  
    } catch(error) {
      sails.log.error(error);
      return res.ok(undefined, messages.EXPORT_REPORT_FAILURE, RESPONSE_STATUS.error);
    }
  }
};
