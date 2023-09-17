const { RESPONSE_STATUS, ACCOUNT_STATUS, CERTIFICATE_STATUS, DEFAULT_TASK_TYPE, PERMISSIONS, ACCOUNT_CONFIG_CODE, NOTIFICATION_ENTITIES, CRON_JOB_CODE } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const CertificateValidations = require('../validations/CertificateValidations');
const { getDateUTC, getCurrentDate, getNextNDaysUTC,  getDateTimeSpecificTimeZone, formatDate } = require('../utils/common/getDateTime');
const { addTaskApi, deleteMultipleTaskApi } = require('../utils/common/apiCall');
const { commonListingForPointsCrt, escapeSearch,commonListing } = require('../services/utils');
const moment = require('moment');
const {sendNotification} = require('../services/sendNotification');
const XLSX = require('xlsx');
const fs = require('fs');
const {uploadReport} = require('../services/uploadReport');
const validations = require('../utils/constants/validations');
const { uploadFile } = require('../services/uploadFile');

const empDir = process.env.EMPLOYEE_DIR_INSIDE_CONTAINER;
const crtDir = process.env.CERTIFICATE_FILE_DIR_INSIDE_CONTAINER;


const getImgPath = function (account,emp_profile_id,certificate) {
  return `${account.account_guid}/${empDir}/${emp_profile_id}/${crtDir}/${certificate}`;
};

const getJobTypeDetails = async function(req, job_type_ids){
  let results = '';
  let sql = `SELECT job_type_id, name, color FROM job_type WHERE job_type_id IN (${job_type_ids})`;
  const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData1=[];
  for(let i of results){
    responseData1.push({
      job_type_id : i.job_type_id,
      name        : i.name,
      color       : i.color
    });
  }
  return responseData1;
};

const addTask = async (req,res,employee_profile_id,desp) => {
  let taskType = await TaskType.find({ name: DEFAULT_TASK_TYPE.REVIEW_CERTIFICATE, status: ACCOUNT_STATUS.active, is_default: true }).usingConnection(req.dynamic_connection);
  if(taskType && taskType.length === 0){
    sails.log.debug('No Default Task Type Found for Review Certificate');
    return res.ok(undefined,messages.NO_DEFAULT_TASK_TYPE,RESPONSE_STATUS.warning);
  }

  let empLocation = await EmpLocation.find({ employee_profile_id }).usingConnection(req.dynamic_connection);
  if(empLocation && empLocation.length === 0) {
    sails.log.debug('No Location found associated with this employee');
    return  res.ok(undefined,messages.NO_LOCATION_ASSOCIATED_EMPLOYEE,RESPONSE_STATUS.warning);
  }
  let locationIds = empLocation.map(location => location.location_id);

  let sql = `
    Select 
      employee_profile.employee_profile_id,employee_profile.role_id from employee_profile
    LEFT JOIN employee_location 
      ON employee_location.employee_profile_id = employee_profile.employee_profile_id
    LEFT JOIN role_permission 
      ON role_permission.role_id = employee_profile.role_id
    LEFT JOIN permission 
      ON permission.permission_id = role_permission.permission_id
    where 
      employee_location.location_id IN (${locationIds.join(',')}) AND 
      employee_profile.employee_profile_id != $1 AND
      employee_profile.status = $2 AND  
      permission.code = $3
    group by employee_profile.employee_profile_id
  `;
  const rawResult = await sails.sendNativeQuery(`${sql};`,[employee_profile_id,ACCOUNT_STATUS.active,PERMISSIONS.REVIEW_CERTIFICATE]).usingConnection(req.dynamic_connection);
  const assignees = rawResult.rows ? rawResult.rows : [];
  if(assignees && assignees.length === 0){
    sails.log.debug('No Employees Found associated with this locations');
    return  res.ok(undefined,messages.NO_EMPLOYEE_ASSOCIATED_LOCATION,RESPONSE_STATUS.warning);
  }
  let _taskAssignees = assignees.map(item => item.employee_profile_id );
  return  addTaskApi(req,{
    title        : 'Certificate Review',
    task_type_id : taskType[0].task_type_id,
    description  : desp,
    start_date   : getCurrentDate(),
    end_date     : getNextNDaysUTC(15),
    is_private   : 0,
    assignees    : _taskAssignees,
  });

};


const getThumbanail = (url) => {
  let arr = url.split('certificate/');
  if(arr && arr.length >= 2){
    let imgname = arr[1].split('.');
    if(imgname[1] === 'pdf'){
      return url;
    }
    return `${arr[0]}certificate/${imgname[0]}_thumbnail.${imgname[1]}`;
  }else{
    return '';
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

const connectionStraingData=async(results,id)=>{
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
};

const timeZone=async(results,id)=>{
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
};

const dateTimeData=async(results,id)=>{
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
};

const dateData=async(results,id)=>{
  return results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
};

const cronCertificateDatas=async(results,id)=>{
  return  results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_certificate_expire);
};

const tenantDbConnectionString=async(tenant_db_connection_string)=>{
  return tenant_db_connection_string ? tenant_db_connection_string.value : '';
};

const timeZoneData=async(time_zone)=>{
  return time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE;
};

const dateTimeFormatData=async(date_time_format)=>{
  return date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT;
};

const dateFormatData=async(date_format)=>{
  return date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT;
};

const cronCertificateExpireData=async(cron_certificate_expire)=>{
  return cron_certificate_expire? cron_certificate_expire.value : process.env.CRON_CERTIFICATE_EXPIRE;
};

const itemTimeZoneData=async(time_zone)=>{
  return time_zone ? time_zone : '';
};

const startDateData=async(last_processing_date)=>{
  return last_processing_date ? moment(last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
};

const expireCrtsData=async(expireCrts)=>{
  return expireCrts ? expireCrts.map(crt => crt.employee_certificate_id) : [];
};

const expireCrtIdsData=async(expireCrtIds,tenantConnection)=>{
  if(expireCrtIds && expireCrtIds.length > 0){
    return EmpCertification.update({ employee_certificate_id: expireCrtIds }, { certificate_status: CERTIFICATE_STATUS.expired }).usingConnection(tenantConnection);
  }
};

const rawResult1Data=async(rawResult1)=>{
  return rawResult1.rows ? rawResult1.rows : [];
};

const results1ChkCondition=async(results1,certificates)=>{
  if(results1){
    certificates.push(...results1);
  }
  return certificates;
};

const crtIssueDate=async(crt,item)=>{
  return crt.issue_date ? formatDate(crt.issue_date,item.date_format) : '';
};

const crtExpireDate=async(crt,item)=>{
  return crt.expiry_date ? formatDate(crt.expiry_date,item.date_format) : '';
};

const certificatesData=async(_certificates,item)=>{
  if(_certificates){
    // Send Mail and Push Notification for Each Certificate
    sails.log('_certificates',_certificates);
    await sendNotification(null,{
      notification_entity : NOTIFICATION_ENTITIES.CRT_ABOUT_TO_EXPIRE,
      certificates        : _certificates,
      account_id          : item.account_id,
    });
  }
};

const _aboutToExpireCrtCron = async (curentTimeUTC,checkTenantTimezone) => {

  sails.log.debug('Certificate About to Expire Cron Execution Start');
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
      account_configuration_detail.code IN ($1,$2,$3,$4,$5) and account.status = $6;`;

  const rawResult = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.cron_certificate_expire, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    let cron_certificate_expire = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.cron_certificate_expire);
    return {
      account_id                  : id,
      tenant_db_connection_string : tenant_db_connection_string ? tenant_db_connection_string.value : '',
      time_zone                   : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
      date_time_format            : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
      date_format                 : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
      cron_certificate_expire     : cron_certificate_expire? cron_certificate_expire.value : process.env.CRON_CERTIFICATE_EXPIRE
    };
  })  : [];

  for(const item of accountArray)
  {
    sails.log('account_id', item.account_id);
    let timezone =await itemTimeZoneData(item.time_zone);
    let tenantTime = getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'HH:mm');

    if(!item.tenant_db_connection_string) {continue;}
    if(timezone === '') {continue;}
    if(tenantTime !== item.cron_certificate_expire) {continue;}

    // Tenant specific database connection
    let connectionString = item.tenant_db_connection_string;
    let rdi = sails.getDatastore('default');
    let mysql = rdi.driver.mysql;
    let tenantConnection = await  mysql.createConnection(connectionString);
    await tenantConnection.connect();

    let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.certificate_aboutToExpire }).usingConnection(tenantConnection);
    //sails.log('cronJob',cronJob);
    if(cronJob){
      let currentDate = getDateUTC();
      let obj;
      let start_date =await startDateData(cronJob.last_processing_date);
      sails.log(start_date);

      try{
        // Update expire certificate status
        const expireCrts = await EmpCertification.find({
          expiry_date: { '<': getCurrentDate()},
        }).usingConnection(tenantConnection);

        const expireCrtIds = await expireCrtsData(expireCrts);

        await expireCrtIdsData(expireCrtIds,tenantConnection);

        // Search for Any About to Expire Certificate
        const durationInDays = [60,30,7,0];

        let certificates = [];

        let sql1 = `
          SELECT 
            DATEDIFF(tbl.max_expiry_date,$3) as duration,employee_certificate_id,employee_certificate.employee_profile_id, 
            certificate_status,expiry_date,employee_certificate.description,
            issue_date,employee_certificate.certificate_type_id,
            user.first_name, user.last_name, user.user_id, user.email, 
            certificate_type.name as crt_name
            FROM employee_certificate 
                INNER JOIN  
                  (SELECT MAX(expiry_date) as max_expiry_date,
                        certificate_type_id,employee_profile_id
                    FROM employee_certificate
                    where status = $1
                      AND certificate_status = $2
                      AND expiry_date IS NOT NULL 
                    group by certificate_type_id,employee_profile_id) tbl 
                ON 
                  employee_certificate.expiry_date = tbl.max_expiry_date AND 
                      employee_certificate.certificate_type_id = tbl.certificate_type_id AND 
                      employee_certificate.employee_profile_id = tbl.employee_profile_id
                LEFT JOIN certificate_type
                ON certificate_type.certificate_type_id = employee_certificate.certificate_type_id 
                  LEFT JOIN employee_profile
                ON employee_profile.employee_profile_id = employee_certificate.employee_profile_id
                LEFT JOIN ${process.env.DB_NAME}.user
                ON user.user_id = employee_profile.user_id 
              where 
              DATEDIFF(tbl.max_expiry_date,$3) IN (${durationInDays.join(',')})
            `;

        const rawResult1 = await sails.sendNativeQuery(`${sql1};`,[ACCOUNT_STATUS.active,CERTIFICATE_STATUS.active,getCurrentDate()]).usingConnection(tenantConnection);
        const results1 = await rawResult1Data(rawResult1);
        await results1ChkCondition(results1,certificates);
        //sails.log.debug(certificates);

        let _certificates = certificates.map(crt => {
          return {
            recipient_email                : crt.email,
            recipient_first_name           : crt.first_name,
            recipient_last_name            : crt.last_name,
            receipient_user_id             : crt.user_id,
            receipient_employee_profile_id : crt.employee_profile_id,
            employee_certificate_id        : crt.employee_certificate_id,
            crt_description                : crt.description,
            duration                       : crt.duration,
            crt_issue_date                 : crt.issue_date ? formatDate(crt.issue_date,item.date_format) : '',
            crt_expiry_date                : crt.expiry_date ? formatDate(crt.expiry_date,item.date_format) : '',
            crt_type                       : crt.crt_name
          };
        });
        //sails.log('come----->', _certificates);
        await certificatesData(_certificates,item);

        await CronJob.update({ code: CRON_JOB_CODE.certificate_aboutToExpire },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
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
      // No Cron Jon with code Certificate About to Expire
      sails.log('No Cron Jon with code Certificate About To Expire');
    }

    if(tenantConnection){
      await tenantConnection.end();
    }
    //}
  }

  sails.log.debug('Certificate About to Expire Cron Execution End');

};

const crtTypRes=async(rawJResult)=>{
  return rawJResult.rows[0] || null;
};

const cAssigned=async(checkAssigned)=>{
  return checkAssigned ? checkAssigned.map(item => `${item.certificate_type_id}`) : [];
};

const eResult=async(rawempResult)=>{
  return rawempResult.rows[0] || null;
};

const cTypResult=async(rawcertificateTypeResult)=>{
  return rawcertificateTypeResult.rows || [];
};

const responseData=async(crtDetails,crtHistory,crtData,certDetailsEnum,req)=>{
  return {
    employee_certificate_id         : crtDetails.employee_certificate_id,
    description                     : crtDetails.description,
    end_date                        : formatDate(crtDetails.end_date,req.dateFormat),
    issue_date                      : formatDate(crtDetails.issue_date,req.dateFormat),
    expiry_date                     : formatDate(crtDetails.expiry_date,req.dateFormat),
    certificate_file_path           : crtDetails.certificate_file_path ? `${process.env.BLOB_STORAGE_CDN_URL}/${crtDetails.certificate_file_path}` : '',
    certificate_thumbnail_file_path : crtDetails.certificate_file_path ? getThumbanail(`${process.env.BLOB_STORAGE_CDN_URL}/${crtDetails.certificate_file_path}`) : '',
    certificate_status              : crtDetails.certificate_status,
    certificate_status_name         : certDetailsEnum ? certDetailsEnum.name : crtDetails.certificate_status,
    certificate_type                : crtData,
    status                          : crtDetails.status,
    previous_status                 : crtHistory && crtHistory.length > 0 ? crtHistory[0].certificate_status : ''
  };
};

const descriptionData=async(description)=>{
  return description ? description : '';
};

const empCrtHistoryDescription=async(empCrtHistory)=>{
  return empCrtHistory.description ? empCrtHistory.description : '';
};

const empCrtDescription=async(empCrt)=>{
  return empCrt.description ? empCrt.description : '';
};

const handleConditionalSortQuery = (sortField, sortOrder, sql) => {
  if(sortField === 'name') {sql += ` ORDER BY user.first_name ${sortOrder} `;}
  else if(sortField === 'team_memer_id') {sql += ` ORDER BY ep.team_member_id ${sortOrder} `;}
  else if(sortField === 'email') {sql += ` ORDER BY user.email ${sortOrder} `;}
  else if(sortField === 'phone') {sql += ` ORDER BY user.phone ${sortOrder} `;}
  else if(sortField === 'certificate_type_name') {sql += ` ORDER BY ct.name ${sortOrder} `;}
  else if(sortField === 'assigned_by') {sql += ` ORDER BY assigned_by_user.first_name ${sortOrder} `;}
  else if(sortField === 'assigned_on') {sql += ` ORDER BY ec.created_date ${sortOrder} `;}
  else if(sortField === 'added_by') {sql += ` ORDER BY added_by_user.first_name ${sortOrder} `;}
  else if(sortField === 'expiry_date') {sql += ` ORDER BY ec.expiry_date ${sortOrder} `;}

  return sql;
};

const handleDateCondition=(sql,prop, data2)=>{
  if((data2[prop].from_date !== '') && (data2[prop].to_date !== '')){
    const startDate = moment(data2[prop].from_date).format('YYYY-MM-DD');
    const endDate = moment(data2[prop].to_date).format('YYYY-MM-DD');
    if (prop === 'assigned_on') {
      sql = sql + ` AND (ec.created_date BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
    }else if(prop === 'expiry_date'){
      sql = sql + ` AND (ec.expiry_date BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
    }
  }
  return sql;
};

const handleMultiplePayloadCondition=(andPayload,sql)=>{
  for (const data2 of andPayload) {
    Object.keys(data2).forEach((prop) => {
      if (prop === 'certificate_type_name') {
        sql = sql + ` AND ct.name LIKE '%${escapeSearch(data2[prop])}%'`;
      }
      else if (prop === 'email') {
        sql = sql + ` AND user.email LIKE '%${data2[prop]}%'`;
      }
      else if (prop === 'assigned_by') {
        sql = sql + ` AND (concat(assigned_by_user.first_name, " ", assigned_by_user.last_name) LIKE '%${escapeSearch(data2[prop])}%') `;
      }
      else if (prop === 'added_by') {
        sql = sql + ` AND (concat(added_by_user.first_name, " ", added_by_user.last_name) LIKE '%${escapeSearch(data2[prop])}%') `;
      }
      else if (prop === 'name') {
        sql = sql + ` AND (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(data2[prop])}%') `;
      }
      else if (prop === 'phone') {
        sql = sql + ` AND user.phone LIKE '%${data2[prop]}%' `;
      }
      else if (prop === 'team_memer_id') {
        sql = sql + ` AND ep.team_member_id LIKE '%${data2[prop]}%' `;
      }
      else if (prop === 'assigned_on' || prop === 'expiry_date') {
        sql = handleDateCondition(sql,prop, data2);
      }
    });
  }
  return sql;
};

const handleCertificateResponse = (responseDatas,req) => {
  return responseDatas ? responseDatas.map(certificate1 => {
    return {
      team_member_id          : certificate1.team_member_id,
      name                    : certificate1.name,
      phone                   : certificate1.phone,
      email                   : certificate1.email,
      certificate_type_name   : certificate1.certificate_type_name,
      assigned_on             : certificate1.assigned_on ? formatDate(certificate1.assigned_on,req.dateFormat) : '',
      added_by                : certificate1.added_by,
      expiry_date             : certificate1.expiry_date ? formatDate(certificate1.expiry_date,req.dateFormat) : '',
      assigned_by             : certificate1.certificate_type_auto_assign && certificate1.added_by_auto ? 'Auto-Assigned' : certificate1.assigned_by,
      employee_certificate_id : certificate1.employee_certificate_id,
    };
  }) : [];
};

const handleResponseFilter = (response, message, func_name)=>{
  let withoutAboutToEx = [];
  let activeAboutToExpire = [];

  if(response.length > 0){
    if(func_name === 'findCertificates'){
      message = messages.GET_RECORD;
    }else if(func_name === 'exportCertificateReportList'){
      message = messages.EXPORT_REPORT_SUCCESS;
    }
    activeAboutToExpire = response.filter(item => item.aboutToExpire && item.certificate_status === CERTIFICATE_STATUS.active);
    withoutAboutToEx = response.filter(item =>  !activeAboutToExpire.map(i => i.employee_certificate_id).includes(item.employee_certificate_id));
    let index = withoutAboutToEx.findIndex(item => item.certificate_status === CERTIFICATE_STATUS.active);

    if(index === -1){
      withoutAboutToEx = [...response];
    }else{
      withoutAboutToEx.splice(index, 0, ...activeAboutToExpire);
    }
  }

  return [withoutAboutToEx,activeAboutToExpire,message];
};

const locationDatas=async(locations,sql,employee_profile_id,req)=>{
  if (locations && locations.length > 0) {
    const locationName = locations.map((c) => `'${c}'`).join(', ');
    const locationData = '(' + locationName + ')';
    return sql + ' AND el.location_id IN ' + locationData + '';
  }
  else if (!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS) && !(req.isExposedApi)){
    const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${employee_profile_id}"`;
    const rawResult = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
    return sql + ` AND el.location_id IN ( ${rawResult.rows.map(location => location.location_id) } )`;
  }else{
    return sql;
  }
};

const handleTwoLogicalConditions = (param, opr)=>{
  if(opr === 'AND'){
    return (param[0] && param[1]) ? true : false;
  }else if(opr === 'OR'){
    return (param[0] || param[1]) ? true : false;
  }else {
    return false;
  }
};

const handleCertificateList = (certificate_status, withoutAboutToEx)=>{
  let certificateList = [];
  let certiType = '';
  if(certificate_status === 'Assigned'){
    let assignedCertificateList = withoutAboutToEx.map((item) => {
      return {
        'Team Member Id' : item.team_member_id,
        'Team Member'    : item.name,
        'Email'          : item.email,
        'Phone'          : item.phone,
        'Certificates'   : item.certificate_type_name,
        'Assigned On'    : item.assigned_on,
        'Assigned By'    : item.assigned_by
      };
    });
    certificateList = assignedCertificateList;
    certiType = 'AssignedCertificates';
  }

  if(certificate_status === 'Expired' || certificate_status === 'Expiring' ){
    let expCertificateList = withoutAboutToEx.map((item) => {
      return {
        'Team Member Id' : item.id,
        'Team Member'    : item.name,
        'Email'          : item.email,
        'Phone'          : item.phone,
        'Certificates'   : item.certificate_type_name,
        'Expiry Date'    : item.expiry_date,
        'Added By'       : item.added_by,
      };
    });
    certificateList = expCertificateList;
    if(certificate_status === 'Expired'){
      certiType = 'ExpiredCertificates';
    }else if(certificate_status === 'Expiring'){
      certiType = 'ExpiringCertificates';
    }
  }
  return [certificateList,certiType];
};

const checkIfArrayExist = (arrayParam) => {
  return ( arrayParam && arrayParam.length > 0 ) ? true : false;
};

const checkedAssignDatas=async(res,employee_profile_id,certificate_type_id,req)=>{
  let checkAssigned = await EmpCertification.find({ employee_profile_id, certificate_type_id, status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
  if(checkAssigned.findIndex(crt => crt.certificate_status === CERTIFICATE_STATUS.assigned) !== -1){
    return res.ok(undefined,messages.CERTIFICATE_ALREADY_ADDED,RESPONSE_STATUS.warning);
  }else if(checkAssigned.findIndex(crt => crt.certificate_status === CERTIFICATE_STATUS.active) !== -1){
    return res.ok({ certificate_status: CERTIFICATE_STATUS.active },messages.CERTIFICATE_ALREADY_ADDED,RESPONSE_STATUS.success);
  }
};

const taskTypeDatas=async(taskType,res)=>{
  if(taskType && taskType.length === 0){
    return res.ok(undefined,messages.ASSIGN_CERTIFICATE_TASK_FAILURE,RESPONSE_STATUS.error);
  }
};

const isExpiredActiveData=async(isExpired)=>{
  return isExpired ? CERTIFICATE_STATUS.expired : CERTIFICATE_STATUS.active;
};

const isExpiredInReviewData=async(isExpired)=>{
  return isExpired ? CERTIFICATE_STATUS.expired : CERTIFICATE_STATUS.inreview;
};

const checkTaskDetails=async(task)=>{
  let task_id = 0;
  if(task.data && task.data.status === RESPONSE_STATUS.success){
    // task added successfully
    task_id = task.data.data.task_id;
  }
  return task_id;
};

const expiry_date_data=async(expiry_date)=>{
  return expiry_date ? expiry_date : null;
};

const description_data=async(description)=>{
  return description ? description : '';
};

const task_id_data=async(task_id)=>{
  return task_id ? task_id : 0;
};

const certificate_file_pathData=async(certificate_file,req,employee_profile_id)=>{
  return certificate_file ? getImgPath(req.account,employee_profile_id,certificate_file) : '';
};

const certificateTypeNameDatas=(prop,data1,sql)=>{
  let certificateTypeNameValue = JSON.stringify(data1[prop].contains);
  if (prop === 'certificate_type_name' && certificateTypeNameValue.length !== JSON.stringify({}).length) {
    sql = sql + ` AND certificate_type.name LIKE '%${escapeSearch(data1[prop].contains)}%'`;
  }
  return sql;
};

const expireDateDatas=(prop,data1,sql)=>{
  let expireDateValue = JSON.stringify(data1[prop].contains);
  if (prop === 'expiry_date' && expireDateValue.length !== JSON.stringify({}).length) {
    sql = sql + ` AND employee_certificate.expiry_date LIKE '%${data1[prop].contains}%'`;
  }
  return sql;
};

const addedByDatas=(prop,data1,sql)=>{
  let addedByValue = JSON.stringify(data1[prop].contains);
  if (prop === 'added_by' && addedByValue.length !== JSON.stringify({}).length) {
    sql = sql + ` AND (concat(added_by_user.first_name, " ", added_by_user.last_name) LIKE '%${escapeSearch(data1[prop].contains)}%') `;
  }
  return sql;
};

const approvedByDatas=(prop,data1,sql)=>{
  let approvedByValue = JSON.stringify(data1[prop].contains);
  if (prop === 'approved_by' && approvedByValue.length !== JSON.stringify({}).length) {
    sql = sql + ` AND (concat(approved_by_user.first_name, " ", approved_by_user.last_name) LIKE '%${escapeSearch(data1[prop].contains)}%') `;
  }
  return sql;
};

const certiTypNameDatas=(sortField,sortOrder,sql)=>{
  if(sortField === 'certificate_type_name') {
    sql += ` , certificate_type.name ${sortOrder} `;
  }
  return sql;
};

const descDatas=(sortField,sortOrder,sql)=>{
  if(sortField === 'description') {
    sql += ` , employee_certificate.description ${sortOrder} `;
  }
  return sql;
};

const expiryDateDatas=(sortField,sortOrder,sql)=>{
  if(sortField === 'expiry_date') {
    sql += ` , employee_certificate.expiry_date ${sortOrder} `;
  }
  return sql;
};

const approvByDatas=(sortField,sortOrder,sql)=>{
  if(sortField === 'approved_by') {
    sql += ` , approved_by_user.first_name ${sortOrder} `;
  }
  return sql;
};

const addByDatas=(sortField,sortOrder,sql)=>{
  if(sortField === 'added_by') {
    sql += ` , added_by_user.first_name ${sortOrder} `;
  }
  return sql;
};

const certiFilePathDatas=(certificate)=>{
  return certificate.certificate_file_path ? `${process.env.BLOB_STORAGE_CDN_URL}/${certificate.certificate_file_path}` : '';
};

const certiThumbNailPathDatas=(certificate)=>{
  return certificate.certificate_file_path ? getThumbanail(`${process.env.BLOB_STORAGE_CDN_URL}/${certificate.certificate_file_path}`) : '';
};

const addedByFirstNameData=(certificate)=>{
  return certificate.certificate_type_auto_assign && certificate.added_by_auto ? 'Auto-Assigned' : certificate.added_by_fname;
};

const addedBylastNameData=(certificate)=>{
  return certificate.certificate_type_auto_assign && certificate.added_by_auto ? '' : certificate.added_by_lname;
};

const finalResponseDatas=(rawResult,req)=>{
  return rawResult.rows ? rawResult.rows.map(certificate => {

    let about_to_expire = false;
    if(certificate.expiry_date){
      let diff = moment(certificate.expiry_date).diff(moment(),'days');
      if(diff >= 1 && diff <= 30) {
        about_to_expire = true;
      }
    }

    return {
      employee_certificate_id         : certificate.employee_certificate_id,
      certificate_status              : certificate.certificate_status,
      certificate_status_name         : certificate.certificate_status_name,
      certificate_type_name           : certificate.certificate_type_name,
      certificate_file_path           : certiFilePathDatas(certificate),
      certificate_thumbnail_file_path : certiThumbNailPathDatas(certificate),
      certificate_type_auto_assign    : certificate.certificate_type_auto_assign,
      expiry_date                     : formatDate(certificate.expiry_date,req.dateFormat),
      description                     : certificate.description,
      about_to_expire,
      added_by                        : {
        user_id    : certificate.added_by_user_id,
        first_name : addedByFirstNameData(certificate),
        last_name  : addedBylastNameData(certificate)
      },
      approved_by: {
        user_id    : certificate.approved_by_user_id,
        first_name : certificate.approved_by_fname,
        last_name  : certificate.approved_by_lname,
      }
    };
  }) : [];
};

const withoutAboutToExDatas=(index,withoutAboutToEx,response,activeAboutToExpire)=>{
  if(index === -1){
    withoutAboutToEx = [...response];
  }else{
    withoutAboutToEx.splice(index, 0, ...activeAboutToExpire);
  }
  return withoutAboutToEx;
};

const totalAssignedCertificatesDatas=(withoutAboutToEx)=>{
  return withoutAboutToEx.filter(obj => {
    return (obj.certificate_status === 'Assigned') ?  true :  false;
  }).length;
};
const expireCertificateDaysData=async(expireCertificateDays)=>{
  return expireCertificateDays[0].value ? expireCertificateDays[0].value : 30;
};

const certificateNameData=async(prop,sql,qry)=>{
  if (prop === 'certificate_type_name') {
    sql = sql + qry;
  }
  return sql;
};

const emailData=async(prop,data3,sql)=>{
  if (prop === 'email') {
    sql = sql + ` AND user.email LIKE '%${data3[prop]}%'`;
  }
  return sql;
};

const assignedByData=async(prop,data3,sql)=>{
  if (prop === 'assigned_by') {
    sql = sql + ` AND (concat(assigned_by_user.first_name, " ", assigned_by_user.last_name) LIKE '%${escapeSearch(data3[prop])}%') `;
  }
  return sql;
};

const addedByData=async(prop,data3,sql)=>{
  if (prop === 'added_by') {
    sql = sql + ` AND (concat(added_by_user.first_name, " ", added_by_user.last_name) LIKE '%${escapeSearch(data3[prop])}%') `;
  }
  return sql;
};

const nameData=async(prop,data3,sql)=>{
  if (prop === 'name') {
    sql = sql + ` AND (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(data3[prop])}%') `;
  }
  return sql;
};

const phoneData=async(prop,data3,sql)=>{
  if (prop === 'phone') {
    sql = sql + ` AND user.phone LIKE '%${data3[prop]}%' `;
  }
  return sql;
};

const idData=async(prop,data3,sql)=>{
  if (prop === 'id') {
    sql = sql + ` AND ep.team_member_id LIKE '%${data3[prop]}%' `;
  }
  return sql;
};

const assignedOnData=async(prop,data3,sql)=>{
  if (prop === 'assigned_on') {
    if((data3[prop].from_date !== '') && (data3[prop].to_date !== ''))
    {
      const startDate1 = moment(data3[prop].from_date).format('YYYY-MM-DD');
      const endDate1 = moment(data3[prop].to_date).format('YYYY-MM-DD');
      sql = sql + ` AND (ec.created_date BETWEEN ('${startDate1} 00:00') AND ('${endDate1} 23:59'))`;
    }
    return sql;
  }
};

const expireDateData=async(prop,data3,sql)=>{
  if (prop === 'expiry_date') {
    if((data3[prop].from_date !== '') && (data3[prop].to_date !== ''))
    {
      const startDate2 = moment(data3[prop].from_date).format('YYYY-MM-DD');
      const endDate2 = moment(data3[prop].to_date).format('YYYY-MM-DD');
      sql = sql + ` AND (ec.expiry_date BETWEEN ('${startDate2} 00:00') AND ('${endDate2} 23:59'))`;
    }
    return sql;
  }
};
module.exports = {
  findCertificateTypes: async (req, res) => {

    /*
      Certificate Type dropdown
      Employee associated Job Type (Active)Certificate Type associated Job Type (Active)
    */

    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.types.validate(request);
      if(!isValidate.error) {
        let empProfile = await EmployeeProfile.findOne({ employee_profile_id: request.employee_profile_id }).populate('job_type_id', { status: ACCOUNT_STATUS.active } ).usingConnection(req.dynamic_connection);
        let jobTypes = empProfile.job_type_id ?  empProfile.job_type_id.map(job => job.job_type_id) : [];
        const jobTypeName = jobTypes.map((c) => `'${c}'`).join(', ');
        const jobTypeId = '(' + jobTypeName + ')';

        let sql = `SELECT ct.certificate_type_id, ct.name FROM certificate_type AS ct
                   LEFT JOIN certificate_job_type AS cjt ON cjt.certificate_type_id = ct.certificate_type_id 
                   WHERE ct.status = '${ACCOUNT_STATUS.active}' `;

        if(jobTypeId && jobTypeId !== ''){
          sql += ` AND cjt.job_type_id IN ${jobTypeId} `;
        }

        sql += ` GROUP BY ct.certificate_type_id ORDER BY ct.name ASC`;
        const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
        let results = rawResult.rows;

        let certificateTypes = [];
        if(results)
        {
          for(let i of results){
            certificateTypes.push({
              certificate_type_id : i.certificate_type_id,
              name                : i.name
            });
          }
        }

        res.ok(certificateTypes,messages.CERTIFICATE_TYPES,RESPONSE_STATUS.success);
      }else{
        res.ok(isValidate.error,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },
  assign: async (req, res) => {

    /*
        - add an entry to employee_certificate
        - create a task and send notification
        - add an entry to employee_certificate_history
    */

    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.assign.validate(request);
      if(!isValidate.error) {
        let { certificate_type_id, description, end_date, employee_profile_id, prompt} = request;

        // Check weather certificate_type is active or not
        let crtTypeExist = await CertificateType.findOne({ certificate_type_id, status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
        if(crtTypeExist){


          // If prompt is false, check if certificate type is already existing on employee profile.
          if(!prompt){
            await checkedAssignDatas(res,employee_profile_id,certificate_type_id,req);
          }

          let empCrt = await EmpCertification.create({
            certificate_type_id,
            employee_profile_id,
            description        : await descriptionData(description),
            status             : ACCOUNT_STATUS.active,
            added_by           : req.user.user_id,
            added_by_auto      : false,
            certificate_status : CERTIFICATE_STATUS.assigned,
            end_date           : end_date,
            created_by         : req.user.user_id,
            created_date       : getDateUTC(),
          }).fetch().usingConnection(req.dynamic_connection);

          let taskType = await TaskType.find({ name: DEFAULT_TASK_TYPE.ASSIGN_CERTIFICATE, status: ACCOUNT_STATUS.active, is_default: true }).usingConnection(req.dynamic_connection);
          await taskTypeDatas(taskType,res);

          let task = await addTaskApi(req,{
            title        : 'New Certificate Assigned',
            task_type_id : taskType[0].task_type_id,
            description  : await empCrtDescription(empCrt),
            start_date   : getCurrentDate(),
            end_date     : end_date,
            is_private   : 1,
            assignees    : [empCrt.employee_profile_id],
          });

          if(task.data && task.data.status === RESPONSE_STATUS.success){
            let empCrtHistory = await EmpCertificateHistory.create({
              employee_certificate_id : empCrt.employee_certificate_id,
              employee_profile_id,
              description             : await descriptionData(description),
              status                  : ACCOUNT_STATUS.active,
              task_id                 : task.data.data.task_id,
              end_date                : end_date,
              certificate_status      : CERTIFICATE_STATUS.assigned,
              added_by                : req.user.user_id,
              created_by              : req.user.user_id,
              created_date            : getDateUTC(),
            }).fetch().usingConnection(req.dynamic_connection);

            await EmpCertification.update({employee_certificate_id: empCrt.employee_certificate_id },{ task_id: task.data.data.task_id }).usingConnection(req.dynamic_connection);

            return res.ok({
              description        : await empCrtHistoryDescription(empCrtHistory),
              status             : empCrtHistory.status,
              added_by           : empCrtHistory.added_by,
              certificate_status : empCrtHistory.certificate_status,
              created_by         : empCrtHistory.created_by,
            },messages.ASSIGN_CERTIFICATE,RESPONSE_STATUS.success);
          }else{
            res.ok(task.data,messages.ASSIGN_CERTIFICATE_TASK_FAILURE,RESPONSE_STATUS.error);
          }
        }
      }else{
        res.ok(isValidate.error,messages.ASSIGN_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.ASSIGN_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  assignMultiple: async (req, res) => {

    // Assign same certificate type to multiple employee.

    /*
        - add multiple entry to employee_certificate
        - not create a task in case of auto_assign and send notification
        - add an entry to employee_certificate_history
    */
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.assignMultiple.validate(request);
      if(!isValidate.error) {
        let { certificate_type_id, certificate_name } = request;

        // Check weather certificate_type is active or not
        let crtTypeExist = await CertificateType.findOne({ certificate_type_id, status: ACCOUNT_STATUS.active, auto_assign: true }).usingConnection(req.dynamic_connection);
        if(crtTypeExist){

          // If check if certificate type is already existing on employee profile.
          let emp_profile_idsql = `SELECT GROUP_CONCAT(DISTINCT employee_job_type.employee_profile_id) AS employee_profile_ids
                FROM certificate_job_type 
                  LEFT JOIN employee_job_type
                    ON employee_job_type.job_type_id = certificate_job_type.job_type_id
                  WHERE certificate_type_id = ${certificate_type_id}`;
          const rawJResult = await sails.sendNativeQuery(emp_profile_idsql).usingConnection(req.dynamic_connection);
          let emp_profile_idResult = await empProfileRes(rawJResult);
          let employee_profile_ids = await empProfileId(emp_profile_idResult);

          let checkAssigned = await EmpCertification.find({ employee_profile_id: employee_profile_ids, certificate_type_id, certificate_status: [CERTIFICATE_STATUS.assigned,CERTIFICATE_STATUS.active,CERTIFICATE_STATUS.inreview], status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
          let _checkAssigned = await chkAssigned(checkAssigned);

          let emp_list_ids = employee_profile_ids.filter(item => !_checkAssigned.includes(item));

          let _employee_list =  emp_list_ids.map(item => {
            return {
              certificate_type_id,
              employee_profile_id : item,
              description         : '',
              status              : ACCOUNT_STATUS.active,
              added_by            : req.user.user_id,
              certificate_status  : CERTIFICATE_STATUS.assigned,
              end_date            : null,
              added_by_auto       : true,
              created_by          : req.user.user_id,
              created_date        : getDateUTC(),
            };
          });

          if(_employee_list && _employee_list.length > 0){
            let empsCrt = await EmpCertification.createEach(_employee_list).fetch().usingConnection(req.dynamic_connection);

            let _empCrtHistory = empsCrt.map(item => {
              return {
                employee_certificate_id : item.employee_certificate_id,
                employee_profile_id     : item.employee_profile_id,
                description             : '',
                status                  : ACCOUNT_STATUS.active,
                end_date                : null,
                certificate_status      : CERTIFICATE_STATUS.assigned,
                added_by                : req.user.user_id,
                created_by              : req.user.user_id,
                created_date            : getDateUTC(),
              };
            });

            // Add Multiple Certificate History in database
            await EmpCertificateHistory.createEach(_empCrtHistory).fetch().usingConnection(req.dynamic_connection);

            // get certificate name

            let empSql = `
              Select user.email, user.first_name, user.last_name, user.user_id, employee_profile_id 
                from employee_profile
                  LEFT JOIN ${process.env.DB_NAME}.user ON
                  user.user_id = employee_profile.user_id
                  where employee_profile_id IN (${emp_list_ids.join(',')});`;

            sails.log('empSql',empSql);
            // get email id and user id of all employees
            const rawempResult = await sails.sendNativeQuery(empSql).usingConnection(req.dynamic_connection);
            let empSqlResult = rawempResult.rows || [];

            sails.log('empSqlResult',empSqlResult);


            await sendNotification(req, {
              notification_entity : NOTIFICATION_ENTITIES.CERTIFICATE_AUTO_JOB_ASSIGN,
              account_id          : req.account.account_id,
              recipients          : empSqlResult ? empSqlResult.map((item) => {
                return {
                  employee_profile_id  : item.employee_profile_id,
                  certificate_type_id ,
                  certificate_name     : certificate_name,
                  recipient_email      : item.email,
                  recipient_user_id    : item.user_id,
                  recipient_first_name : item.first_name,
                  recipient_last_name  : item.last_name,
                };
              }) : []
            });

          }
          return res.ok({},messages.ASSIGN_CERTIFICATE,RESPONSE_STATUS.success);
        }else{
          res.ok({},'Certificate Type not exist',RESPONSE_STATUS.error);
        }
      }else{
        res.ok(isValidate.error,messages.ASSIGN_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.ASSIGN_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  assignMultipleCrts: async (req, res) => {

    // Assign multiple certificate type to same employee.

    /*
        - add multiple entry to employee_certificate with same employee id but different certificate types
        - not create a task in case of auto_assign and send notification
        - add an entry to employee_certificate_history
    */
    try{
      sails.log('In controller function assignMultipleCrts');
      let request = req.allParams();
      const isValidate = await CertificateValidations.assignMultipleCrts.validate(request);
      if(!isValidate.error) {
        let { employee_profile_id, job_type_ids, from_empProfile } = request;

        // Get List of Certificate types Linked to this employee job types.
        let crt_type_idsql = `SELECT GROUP_CONCAT(DISTINCT certificate_job_type.certificate_type_id) AS certificate_type_ids
                FROM certificate_job_type 
                  LEFT JOIN employee_job_type
                    ON employee_job_type.job_type_id = certificate_job_type.job_type_id
                  LEFT JOIN certificate_type
                    ON certificate_type.certificate_type_id = certificate_job_type.certificate_type_id
                  WHERE certificate_job_type.job_type_id IN (${job_type_ids.join(',')}) and certificate_type.auto_assign=1 and certificate_type.status!='${ACCOUNT_STATUS.inactive}'`;
        const rawJResult = await sails.sendNativeQuery(crt_type_idsql).usingConnection(req.dynamic_connection);

        let crt_type_idResult =await crtTypRes(rawJResult);
        let certificate_type_ids = crt_type_idResult && crt_type_idResult.certificate_type_ids ? crt_type_idResult.certificate_type_ids.split(',') : [];

        let checkAssigned = await EmpCertification.find({ employee_profile_id: employee_profile_id, certificate_type_id: certificate_type_ids, certificate_status: [CERTIFICATE_STATUS.assigned,CERTIFICATE_STATUS.active,CERTIFICATE_STATUS.inreview], status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
        let _checkAssigned =await cAssigned(checkAssigned);


        let _list = certificate_type_ids.filter(item => !_checkAssigned.includes(item));
        let _employee_list =  _list.map(item => {
          return {
            certificate_type_id : item,
            employee_profile_id : employee_profile_id,
            description         : '',
            status              : ACCOUNT_STATUS.active,
            added_by            : req.user.user_id,
            certificate_status  : CERTIFICATE_STATUS.assigned,
            end_date            : null,
            added_by_auto       : true,
            created_by          : req.user.user_id,
            created_date        : getDateUTC(),
          };
        });

        if(_list && _list.length > 0){
          let empsCrt = await EmpCertification.createEach(_employee_list).fetch().usingConnection(req.dynamic_connection);

          let _empCrtHistory =  empsCrt.map(item1 => {
            return {
              employee_certificate_id : item1.employee_certificate_id,
              employee_profile_id     : item1.employee_profile_id,
              description             : '',
              status                  : ACCOUNT_STATUS.active,
              end_date                : null,
              certificate_status      : CERTIFICATE_STATUS.assigned,
              added_by                : req.user.user_id,
              created_by              : req.user.user_id,
              created_date            : getDateUTC(),
            };
          });

          // Add Multiple Certificate History in database
          let empCrtHistory = await EmpCertificateHistory.createEach(_empCrtHistory).fetch().usingConnection(req.dynamic_connection);

          let empSql = `Select user.email, user.user_id from employee_profile
            INNER JOIN ${process.env.DB_NAME}.user
              ON user.user_id = employee_profile.user_id
            where employee_profile_id = ${employee_profile_id}`;
          const rawempResult = await sails.sendNativeQuery(empSql).usingConnection(req.dynamic_connection);
          let empresult =await eResult(rawempResult);

          let certificateTypeSql = `Select * from certificate_type where certificate_type_id IN (${_list.join(',')}) and status = 'Active'`;
          const rawcertificateTypeResult = await sails.sendNativeQuery(certificateTypeSql).usingConnection(req.dynamic_connection);
          let certificateTyperesult =await cTypResult(rawcertificateTypeResult);

          let notification_entity = NOTIFICATION_ENTITIES.CERTIFICATE_AUTO_ASSIGN;
          if(from_empProfile){
            notification_entity = NOTIFICATION_ENTITIES.CERTIFICATE_AUTO_JOB_ASSIGN;
          }

          sails.log('Notification Send for Auto Assign Certificate');
          await sendNotification(req, {
            notification_entity            : notification_entity,
            account_id                     : req.account.account_id,
            receipient_user_id             : empresult.user_id,
            receipient_employee_profile_id : employee_profile_id,
            recipient_email                : empresult.email,
            certificates                   : certificateTyperesult ? certificateTyperesult.map(item => item.name) : []
          });
          return res.ok({empCrtHistory: empCrtHistory},messages.ASSIGN_CERTIFICATE,RESPONSE_STATUS.success);

        }

        return res.ok({},messages.ASSIGN_CERTIFICATE,RESPONSE_STATUS.success);

      }
      else{
        res.ok(isValidate.error,messages.ASSIGN_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.ASSIGN_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  add: async (req,res) => {

    /*
        - add an entry to employee_certificate
        - below should be the system behavior based on permission.
        - create a task and send notification to all employee associated with location
        - add an entry to employee_certificate_history
    */

    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.add.validate(request);
      if(!isValidate.error) {
        let { certificate_type_id, description, issue_date, expiry_date, employee_profile_id, certificate_file} = request;

        // Check weather certificate_type is active or not
        let crtTypeExist = await CertificateType.findOne({ certificate_type_id, status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
        if(crtTypeExist){
          let isExpired = false;
          if(expiry_date){
            let diff = moment(expiry_date).diff(moment(),'days');
            isExpired = diff < 0;
          }

          let task_id;
          let certificate_status;
          if(checkPermissionExistForUser(req.permissions,PERMISSIONS.REVIEW_CERTIFICATE) /* Review Crt Permission exist */){
            certificate_status = await isExpiredActiveData(isExpired);
          }else {
            certificate_status = await isExpiredInReviewData(isExpired);
            const user = await Users.findOne({ user_id: req.user.user_id});
            // Task should be added to all the users who has permissions to review the certificate for that location
            let task = await addTask(req,res,employee_profile_id,`${user.first_name} ${user.last_name} uploaded ${crtTypeExist.name} for your review. Visit their profile to evaluate.`);
            task_id = await checkTaskDetails(task);
          }
          let empCrt = await EmpCertification.create({
            certificate_type_id,
            employee_profile_id,
            issue_date,
            expiry_date           : await expiry_date_data(expiry_date),
            description           : await description_data(description),
            status                : ACCOUNT_STATUS.active,
            task_id               : await task_id_data(task_id),
            added_by              : req.user.user_id,
            certificate_file_path : await certificate_file_pathData(certificate_file,req,employee_profile_id),
            certificate_status    : certificate_status,
            created_by            : req.user.user_id,
            created_date          : getDateUTC(),
          }).fetch().usingConnection(req.dynamic_connection);

          let empCrtHistory = await EmpCertificateHistory.create({
            employee_certificate_id : empCrt.employee_certificate_id,
            employee_profile_id,
            issue_date,
            expiry_date             : await expiry_date_data(expiry_date),
            description             : await description_data(description),
            status                  : ACCOUNT_STATUS.active,
            task_id                 : await task_id_data(task_id),
            certificate_status      : certificate_status,
            certificate_file_path   : await certificate_file_pathData(certificate_file,req,employee_profile_id),
            added_by                : req.user.user_id,
            created_by              : req.user.user_id,
            created_date            : getDateUTC(),
          }).fetch().usingConnection(req.dynamic_connection);

          const user1 = await Users.findOne({ user_id: req.user.user_id});

          return res.ok({
            employee_certificate_id : empCrtHistory.employee_certificate_id,
            certificate_type        : {
              certificate_type_id : certificate_type_id,
              name                : crtTypeExist.name
            },
            employee_profile_id : empCrtHistory. employee_profile_id,
            issue_date          : formatDate(empCrtHistory.issue_date,req.dateFormat),
            expiry_date         : formatDate(empCrtHistory.expiry_date,req.dateFormat),
            description         : await empCrtHistoryDescription(empCrtHistory),
            created_by          : `${user1.first_name} ${user1.last_name}`,
            added_by            : `${user1.first_name} ${user1.last_name}`,
            created_date        : getDateUTC(empCrtHistory.created_date),
            certificate_status  : empCrtHistory.status

          },messages.ADD_CERTIFICATE,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined,messages.CERTIFICATE_TYPE_NOT_EXIST,RESPONSE_STATUS.error);
        }
      }else{
        return res.ok(isValidate.error,messages.ADD_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.ADD_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  edit: async (req,res) => {
    /*
        - update an entry to employee_certificate
        - add an entry to employee_certificate_history
    */

    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.edit.validate(request);
      if(!isValidate.error) {
        let { employee_certificate_id, certificate_type_id, description, issue_date, end_date, expiry_date, employee_profile_id, certificate_file, requstFor, prompt} = request;

        let crtDetails = await EmpCertification.findOne({ employee_certificate_id }).usingConnection(req.dynamic_connection);
        let certificate_status = crtDetails.certificate_status;
        let task_id = crtDetails.task_id;

        // Check certificate_type exist
        let crtTypeExist = await CertificateType.findOne({ certificate_type_id }).usingConnection(req.dynamic_connection);

        if(crtTypeExist && certificate_status !== CERTIFICATE_STATUS.expired){
          if(certificate_status === CERTIFICATE_STATUS.active){
            if(checkPermissionExistForUser(req.permissions,PERMISSIONS.REVIEW_CERTIFICATE) /* User has permission to review certificate */){
              // certificate should be considered as reviewed and certificate status should be displayed as "Active" on the listing.
              certificate_status = CERTIFICATE_STATUS.active;
            }else{
              certificate_status = CERTIFICATE_STATUS.inreview;
              const user = await Users.findOne({ user_id: req.user.user_id});
              // Task should be added to all the users who has permissions to review the certificate for that location
              let task = await addTask(req,res,employee_profile_id,`${user.first_name} ${user.last_name} uploaded ${crtTypeExist.name} for your review. Visit their profile to evaluate.`);
              if(task.data && task.data.status === RESPONSE_STATUS.success){
                // task added successfully
                task_id = task.data.data.task_id;
              }
            }
            await EmpCertification.update( { employee_certificate_id } ,{
              certificate_type_id,
              issue_date,
              certificate_status,
              expiry_date           : expiry_date ? expiry_date : null,
              description           : description ? description : '',
              task_id               : task_id ? task_id : 0,
              certificate_file_path : certificate_file ? getImgPath(req.account,employee_profile_id,certificate_file) : '',
              last_updated_by       : req.user.user_id,
              last_updated_date     : getDateUTC(),
            }).fetch().usingConnection(req.dynamic_connection);
          }else if(certificate_status === CERTIFICATE_STATUS.assigned){

            if(certificate_type_id !== crtDetails.certificate_type_id){
              // If prompt is false, check if certificate type is already existing on employee profile.
              if(!prompt){
                let checkAssigned = await EmpCertification.find({ employee_profile_id, certificate_type_id, status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
                if(checkAssigned.findIndex(crt => crt.certificate_status === CERTIFICATE_STATUS.assigned) !== -1){
                  return res.ok(undefined,messages.CERTIFICATE_ALREADY_ADDED,RESPONSE_STATUS.warning);
                }else if(checkAssigned.findIndex(crt => crt.certificate_status === CERTIFICATE_STATUS.active) !== -1){
                  return res.ok({ certificate_status: CERTIFICATE_STATUS.active },messages.CERTIFICATE_ALREADY_ADDED,RESPONSE_STATUS.success);
                }
              }
            }

            if(requstFor === 'Edit_Assignment'){

              /* previously added task should be deleted/inactivated */
              let empHistory = await EmpCertificateHistory.find({ employee_certificate_id , certificate_status: [CERTIFICATE_STATUS.assigned,CERTIFICATE_STATUS.inreview] }).usingConnection(req.dynamic_connection);
              if(empHistory && empHistory.length > 0){
                let taskIds = empHistory.map(item => item.task_id);
                taskIds = [...new Set(taskIds)].filter(item => item !== 0);
                let deletetask = await deleteMultipleTaskApi(req,{
                  id: taskIds
                });
                sails.log.debug(deletetask.data);
              }

              let taskType = await TaskType.find({ name: DEFAULT_TASK_TYPE.ASSIGN_CERTIFICATE, status: ACCOUNT_STATUS.active, is_default: true }).usingConnection(req.dynamic_connection);

              if(taskType && taskType.length === 0){
                return res.ok(undefined,messages.ASSIGN_CERTIFICATE_TASK_FAILURE,RESPONSE_STATUS.error);
              }


              let task = await addTaskApi(req,{
                title        : 'New Certificate Assigned',
                task_type_id : taskType[0].task_type_id,
                description  : description ? description : '',
                start_date   : getCurrentDate(),
                end_date     : end_date,
                is_private   : 1,
                assignees    : [employee_profile_id],
              });

              if(task.data && task.data.status === RESPONSE_STATUS.success){
                // task added successfully
                task_id = task.data.data.task_id;
              }

              await EmpCertification.update( { employee_certificate_id } ,{
                certificate_type_id,
                certificate_status,
                end_date          : end_date ? end_date : null,
                description       : description ? description : '',
                task_id           : task_id,
                last_updated_by   : req.user.user_id,
                last_updated_date : getDateUTC(),
              }).fetch().usingConnection(req.dynamic_connection);


            }else if(requstFor === 'Upload_Certificate'){
              if(checkPermissionExistForUser(req.permissions,PERMISSIONS.REVIEW_CERTIFICATE) /* Review Crt Permission exist */){
                certificate_status = CERTIFICATE_STATUS.active;
              }else {
                certificate_status = CERTIFICATE_STATUS.inreview;
                const user = await Users.findOne({ user_id: req.user.user_id});
                // Task should be added to all the users who has permissions to review the certificate for that location
                let task = await addTask(req,res,employee_profile_id,`${user.first_name} ${user.last_name} uploaded ${crtTypeExist.name} for your review. Visit their profile to evaluate.`);
                if(task.data && task.data.status === RESPONSE_STATUS.success){
                  // task added successfully
                  task_id = task.data.data.task_id;
                }
              }
              await EmpCertification.update( { employee_certificate_id } ,{
                certificate_type_id,
                certificate_status,
                end_date              : end_date ? end_date : null,
                expiry_date           : expiry_date ? expiry_date : null,
                issue_date            : issue_date ? issue_date : null,
                description           : description ? description : '',
                task_id               : task_id,
                certificate_file_path : certificate_file ? getImgPath(req.account,employee_profile_id,certificate_file) : '',
                last_updated_by       : req.user.user_id,
                last_updated_date     : getDateUTC(),
              }).fetch().usingConnection(req.dynamic_connection);
            }else{
              return res.ok(undefined,'requestFor paramerter missing',RESPONSE_STATUS.error);
            }
          }

          let empCrtHistory = await EmpCertificateHistory.create({
            employee_certificate_id : employee_certificate_id,
            employee_profile_id,
            issue_date              : issue_date ? issue_date : null,
            expiry_date             : expiry_date ? expiry_date : null,
            description             : description ? description : '',
            status                  : ACCOUNT_STATUS.active,
            task_id                 : task_id ? task_id : 0,
            end_date                : end_date ? end_date : crtDetails.end_date,
            certificate_status      : certificate_status,
            certificate_file_path   : certificate_file ? getImgPath(req.account,employee_profile_id,certificate_file) : '',
            created_by              : req.user.user_id,
            created_date            : getDateUTC(),
          }).fetch().usingConnection(req.dynamic_connection);

          return res.ok({
            employee_certificate_id : empCrtHistory.employee_certificate_id,
            description             : empCrtHistory.description ? empCrtHistory.description : '',
            status                  : empCrtHistory.status,
            added_by                : empCrtHistory.added_by,
            certificate_status      : empCrtHistory.certificate_status,
            created_by              : empCrtHistory.created_by,
          },messages.UPDATE_CERTIFICATE,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined,messages.UPDATE_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
        }
      }else{
        return res.ok(isValidate.error,messages.UPDATE_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.UPDATE_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  delete: async(req,res) => {
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.delete.validate(request);
      if(!isValidate.error) {
        const { employee_certificate_id } = request;
        let crtDetails = await EmpCertification.findOne({ employee_certificate_id }).usingConnection(req.dynamic_connection);

        if(crtDetails.certificate_status === CERTIFICATE_STATUS.inreview || crtDetails.certificate_status === CERTIFICATE_STATUS.assigned){
          let empHistory = await EmpCertificateHistory.find({ employee_certificate_id , certificate_status: [CERTIFICATE_STATUS.assigned,CERTIFICATE_STATUS.inreview] }).usingConnection(req.dynamic_connection);
          if(empHistory && empHistory.length > 0){
            let taskIds = empHistory.map(item => item.task_id);
            taskIds = [...new Set(taskIds)].filter(item => item !== 0);
            let deletetask = await deleteMultipleTaskApi(req,{
              id: taskIds
            });
            sails.log.debug(deletetask.data);
          }
        }

        await EmpCertification.update({ employee_certificate_id },{
          status            : ACCOUNT_STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        return res.ok(undefined,messages.DELETE_CERTIFICATE,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.DELETE_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.debug(error);
      return res.ok(undefined,messages.DELETE_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  find: async (req,res) => {
    /*
        - List all certificates for that employee_profile from employee_certificate
    */
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.list.validate(request);
      if(!isValidate.error) {
        const { employee_profile_id, sortField, sortOrder } = request;
        const {andCondition, rows, skip } = await commonListingForPointsCrt(request);
        let sql = `
          SELECT 
            employee_certificate.employee_certificate_id,
            employee_certificate.certificate_status,
            employee_certificate.added_by_auto, 
            certificate_status_enum.name as certificate_status_name,
            certificate_type.name as certificate_type_name,
            certificate_type.auto_assign as certificate_type_auto_assign,
            employee_certificate.description, 
            employee_certificate.expiry_date, 
            employee_certificate.created_date, 
            employee_certificate.certificate_file_path,
            added_by_user.user_id as added_by_user_id,
            added_by_user.first_name as added_by_fname,
            added_by_user.last_name as added_by_lname,
            approved_by_user.user_id as approved_by_user_id,
            approved_by_user.first_name as approved_by_fname,
            approved_by_user.last_name as approved_by_lname,
            employee_certificate.expiry_date
          FROM employee_certificate
            LEFT JOIN ${process.env.DB_NAME}.user added_by_user 
              ON added_by_user.user_id = employee_certificate.added_by
            LEFT JOIN ${process.env.DB_NAME}.user approved_by_user 
              ON approved_by_user.user_id = employee_certificate.approved_by
            LEFT JOIN certificate_type  
              ON certificate_type.certificate_type_id = employee_certificate.certificate_type_id
            LEFT JOIN certificate_status_enum 
              ON certificate_status_enum.certificate_status = employee_certificate.certificate_status
          where employee_certificate.employee_profile_id = $1 AND employee_certificate.status = $2 AND employee_certificate.certificate_status != $5 `;

        for (const data1 of andCondition) {
          Object.keys(data1).forEach((prop) => {
            let certiTypName= certificateTypeNameDatas(prop,data1,sql);
            sql=certiTypName;
            let expireDateData=expireDateDatas(prop,data1,sql);
            sql=expireDateData;
            let addedByData=addedByDatas(prop,data1,sql);
            sql=addedByData;
            let approvedByData=approvedByDatas(prop,data1,sql);
            sql=approvedByData;
          });
        }

        sql += ` ORDER BY certificate_status_enum.sort_order ASC,employee_certificate.expiry_date ASC,employee_certificate.created_date DESC `;

        if(sortField && sortOrder){
          let certiTypNameData=certiTypNameDatas(sortField,sortOrder,sql);
          sql=certiTypNameData;
          let descData=descDatas(sortField,sortOrder,sql);
          sql=descData;
          let expiryDateData=expiryDateDatas(sortField,sortOrder,sql);
          sql=expiryDateData;
          let approvByData=approvByDatas(sortField,sortOrder,sql);
          sql=approvByData;
          let addByData=addByDatas(sortField,sortOrder,sql);
          sql=addByData;
        }

        let countsql = `Select count(employee_certificate.employee_certificate_id) as count FROM ${sql.split(' FROM ')[1]}`;
        if(skip !== undefined && rows !== undefined){
          sql += `LIMIT $3 OFFSET $4 `;
        }
        const rawResult = await sails.sendNativeQuery(`${sql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);
        const countRawResult = await sails.sendNativeQuery(`${countsql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);

        let count = countRawResult.rows[0].count;

        let response = finalResponseDatas(rawResult,req);
        let message = messages.NO_CERTIFICATE_ADDED;
        let withoutAboutToEx = [];
        let activeAboutToExpire = [];
        if(response.length > 0){
          message = messages.GET_RECORD;
          activeAboutToExpire = response.filter(item => item.aboutToExpire && item.certificate_status === CERTIFICATE_STATUS.active);
          withoutAboutToEx = response.filter(item =>  !activeAboutToExpire.map(i => i.employee_certificate_id).includes(item.employee_certificate_id));
          let index = withoutAboutToEx.findIndex(item => item.certificate_status === CERTIFICATE_STATUS.active);

          withoutAboutToEx=withoutAboutToExDatas(index,withoutAboutToEx,response,activeAboutToExpire);
        }

        const totalAssignedCertificates = totalAssignedCertificatesDatas(withoutAboutToEx);

        let data = {
          totalResult              : count,
          totalAssignedCertificate : totalAssignedCertificates,
          certificateList          : withoutAboutToEx
        };
        res.ok(data,message,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  findCertificates: async (req,res) => {
    /*
        - List all certificates for that employee_profile from employee_certificate
    */
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.filterList.validate(request);
      if(!isValidate.error) {
        let accountsql = `
  SELECT
      account_configuration_detail.value
    from account
    INNER JOIN
      account_configuration ON account.account_id = account_configuration.account_id
    INNER JOIN
      account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
    Where
      account_configuration_detail.code = $1 and account.status= $2 and account.account_id= $3`;
        const rawResultData = await sails.sendNativeQuery(accountsql,[ACCOUNT_CONFIG_CODE.expire_certificate_days_limit, ACCOUNT_STATUS.active, req.account.account_id]);
        const expireCertificateDays = rawResultData.rows;
        const expireCertificateDaysLimit= expireCertificateDays[0].value ? expireCertificateDays[0].value : 30;

        const { employee_profile_id, locations,certificate_status, job_types, sortField, sortOrder } = request;

        const findQuery = await commonListing(req.allParams());
        const rows = findQuery.rows;
        const skip = findQuery.skip;

        let sql = `
        SELECT
          DISTINCT ec.employee_certificate_id,
          ep.team_member_id,
          CONCAT(user.first_name, " ", user.last_name) as name,          
          user.phone,
          user.email,
          ct.name as certificate_type_name,
          ec.created_date as assigned_on,
          ec.expiry_date as expiry_date,
          CONCAT(assigned_by_user.first_name, " ", assigned_by_user.last_name) as assigned_by,          
          CONCAT(added_by_user.first_name, " ", added_by_user.last_name) as added_by,          
          ec.employee_profile_id,
          ec.certificate_status,
          ec.status,
          ct.auto_assign as certificate_type_auto_assign          
          FROM employee_certificate ec
        INNER JOIN ${process.env.DB_NAME}.user assigned_by_user
          ON assigned_by_user.user_id = ec.created_by
        INNER JOIN ${process.env.DB_NAME}.user added_by_user
          ON added_by_user.user_id = ec.added_by
        INNER JOIN employee_profile ep
          ON ep.employee_profile_id = ec.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user user
          ON user.user_id = ep.user_id        
        INNER JOIN certificate_type ct
          ON ct.certificate_type_id = ec.certificate_type_id
        INNER JOIN employee_location el
          ON el.employee_profile_id = ec.employee_profile_id
        INNER JOIN employee_job_type ejt
          ON ejt.employee_profile_id = ec.employee_profile_id
          where ec.status = '${ACCOUNT_STATUS.active}'
           `;

        if(certificate_status === 'Expiring'){
          const startDate = getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,'YYYY-MM-DD');
          const endDate = moment(getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,'YYYY-MM-DD')).add(expireCertificateDaysLimit, 'days').format('YYYY-MM-DD');
          sql = sql + `AND ec.expiry_date between "${startDate}" and "${endDate}"`;
        } else {
          sql = sql + `AND ec.certificate_status = '${certificate_status}' `;
        }

        sql = await locationDatas(locations,sql,employee_profile_id,req);

        if (checkIfArrayExist(job_types)) {
          const jobTypeName = job_types.map((c) => `'${c}'`).join(', ');
          const jobTypeData = '(' + jobTypeName + ')';
          sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
        }
        const andPayload = findQuery.andCondition;

        sql = handleMultiplePayloadCondition(andPayload, sql);

        if(handleTwoLogicalConditions([sortField, sortOrder], 'AND')){
          sql = handleConditionalSortQuery(sortField, sortOrder, sql);
        }

        let countsql;
        countsql = `Select count(DISTINCT ec.employee_certificate_id) as count FROM ${sql.split(' FROM ')[1]}`;

        if(handleTwoLogicalConditions([skip !== undefined, rows !== undefined], 'AND')){
          sql += ` LIMIT $3 OFFSET $4 `;
        }

        const rawResult = await sails.sendNativeQuery(`${sql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);
        const countRawResult = await sails.sendNativeQuery(`${countsql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);

        let count = countRawResult.rows[0].count;

        let response = handleCertificateResponse(rawResult.rows,req);
        let message = messages.NO_CERTIFICATE_ADDED;

        let handleResponseFilterResponse = handleResponseFilter(response, message, 'findCertificates');
        let withoutAboutToEx = handleResponseFilterResponse[0];
        message = handleResponseFilterResponse[2];

        let data = {
          certificateList : withoutAboutToEx,
          totalResult     : count
        };
        res.ok(data,message,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  findCertificatesCount: async (req,res) => {
    /*
        - List all certificates for that employee_profile from employee_certificate
    */
    try{
      let request = req.allParams();
      let accountsql = `
  SELECT
      account_configuration_detail.value
    from account
    INNER JOIN
      account_configuration ON account.account_id = account_configuration.account_id
    INNER JOIN
      account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
    Where
      account_configuration_detail.code = $1 and account.status= $2 and account.account_id= $3`;
      const rawResultData = await sails.sendNativeQuery(accountsql,[ACCOUNT_CONFIG_CODE.expire_certificate_days_limit, ACCOUNT_STATUS.active, req.account.account_id]);
      const expireCertificateDays = rawResultData.rows;
      const expireCertificateDaysLimit= await expireCertificateDaysData(expireCertificateDays);

      const { employee_profile_id, locations, jobTypes } = request;

      const findQuery = await commonListing(req.allParams());
      const rows = findQuery.rows;
      const skip = findQuery.skip;

      let sql = `
        SELECT
         COUNT(DISTINCT ec.employee_certificate_id) as count
          FROM employee_certificate ec
        INNER JOIN employee_profile ep
          ON ep.employee_profile_id = ec.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user user
          ON user.user_id = ep.user_id
        INNER JOIN employee_location el
          ON el.employee_profile_id = ec.employee_profile_id
        INNER JOIN employee_job_type ejt
          ON ejt.employee_profile_id = ec.employee_profile_id
          where ec.status = '${ACCOUNT_STATUS.active}'
           `;
      if (locations && locations.length > 0) {
        const locationName = locations.map((c) => `'${c}'`).join(', ');
        const locationData = '(' + locationName + ')';
        sql = sql + ' AND el.location_id IN ' + locationData + '';

      }
      else {
        if(!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_ALL_LOCATIONS)){
          const getLocation = `SELECT l.location_id FROM employee_location l where l.employee_profile_id = "${employee_profile_id}"`;
          const rawResult = await sails.sendNativeQuery(`${getLocation};`).usingConnection(req.dynamic_connection);
          sql = sql + ` AND el.location_id IN ( ${rawResult.rows.map(location => location.location_id) } )`;
        }
      }
      if (jobTypes && jobTypes.length > 0) {
        const jobTypeName = jobTypes.map((c) => `'${c}'`).join(', ');
        const jobTypeData = '(' + jobTypeName + ')';
        sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
      }
      const andPayload = findQuery.andCondition;
      for (const data3 of andPayload) {
        Object.keys(data3).forEach((prop) => {
          let qry= `AND ct.name LIKE '%${escapeSearch(data3[prop])}%'`;
          certificateNameData(prop,sql,qry);
          emailData(prop,data3,sql);
          assignedByData(prop,data3,sql);
          addedByData(prop,data3,sql);
          nameData(prop,data3,sql);
          phoneData(prop,data3,sql);
          idData(prop,data3,sql);
          assignedOnData(prop,data3,sql);
          expireDateData(prop,data3,sql);
        });
      }

      const startDate = getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,'YYYY-MM-DD');
      const endDate = moment(getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,'YYYY-MM-DD')).add(expireCertificateDaysLimit, 'days').format('YYYY-MM-DD');
      let expiringSql = sql + `AND ec.expiry_date between "${startDate}" and "${endDate}"`;
      let Assignedsql = sql + `AND ec.certificate_status = 'Assigned' `;
      let expiredsql = sql + `AND ec.certificate_status = 'Expired' `;

      const expiringcountRawResult = await sails.sendNativeQuery(`${expiringSql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);
      const AssignedsqlRawResult = await sails.sendNativeQuery(`${Assignedsql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);
      const expiredsqlRawResult = await sails.sendNativeQuery(`${expiredsql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);

      let expiringcount = expiringcountRawResult.rows[0].count;
      let Assignedcount = AssignedsqlRawResult.rows[0].count;
      let expiredcount = expiredsqlRawResult.rows[0].count;


      let data = {
        expiringcount : expiringcount,
        Assignedcount : Assignedcount,
        expiredcount  : expiredcount,
      };

      let  message = messages.GET_RECORD;
      res.ok(data,message,RESPONSE_STATUS.success);
      // }else{
      //   return res.ok(isValidate.error,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      // }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  findById: async (req,res) => {
    /*
        - Get Details of Certificate by employee_certificate_id
    */
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.findById.validate(request);
      if(!isValidate.error) {
        const { employee_certificate_id } = request;
        let crtDetails = await EmpCertification.findOne({ employee_certificate_id }).populate('certificate_type_id').usingConnection(req.dynamic_connection);
        if(!checkPermissionExistForUser(req.permissions,PERMISSIONS.VIEW_EMPLOYEE_PROFILE)){
          if(crtDetails.employee_profile_id.toString() !== req.empProfile.employee_profile_id.toString()){
            return res.unAuthorized(undefined,messages.ROLE_PERMISSION_REQUIRED,RESPONSE_STATUS.error);
          }
        }
        let sql = `
          SELECT certificate_status FROM employee_certificate_history 
            where employee_certificate_id = $1 
            group by certificate_status 
            ORDER BY employee_certificate_history_id DESC LIMIT 1,1 ;`;
        const rawResult = await sails.sendNativeQuery(`${sql};`,[employee_certificate_id]).usingConnection(req.dynamic_connection);
        let crtHistory = rawResult.rows;
        let certDetailsEnum = await CertificateStatusEnum.findOne({ certificate_status: crtDetails.certificate_status }).usingConnection(req.dynamic_connection);
        let crt_type = crtDetails.certificate_type_id;

        let jsql = `SELECT GROUP_CONCAT(job_type_id) AS job_type_id
                  FROM certificate_job_type WHERE certificate_type_id = ${crt_type.certificate_type_id}`;
        const rawJResult = await sails.sendNativeQuery(jsql).usingConnection(req.dynamic_connection);
        let jResult = rawJResult.rows[0] || null;

        let crtData = {
          certificate_type_id : crt_type.certificate_type_id,
          name                : crt_type.name,
          description         : crt_type.description ?  jResult.description : '',
          status              : crt_type.status,
          job_types           : jResult.job_type_id ? await getJobTypeDetails(req, jResult.job_type_id) : []
        };

        let response = await responseData(crtDetails,crtHistory,crtData,certDetailsEnum,req);
        return res.ok(response,messages.CERTIFICATE_DETAIL,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.CERTIFICATE_DETAIL_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.CERTIFICATE_DETAIL_FAILURE,RESPONSE_STATUS.error);
    }
  },
  ListAbouttoExpire: async(req,res) => {
    /*
        - list for showing Alert besides External Certification accordian
    */
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.types.validate(request);
      if(!isValidate.error) {
        const { employee_profile_id } = request;
        let sql = `
        SELECT
          DATEDIFF(tbl.max_expiry_date,CURDATE()) as duration,employee_certificate_id,employee_certificate.employee_profile_id,
          employee_certificate.certificate_status,expiry_date,employee_certificate.description,
          issue_date,employee_certificate.certificate_type_id,
          certificate_type.name as certificate_type_name
          FROM employee_certificate
          INNER JOIN
            (SELECT MAX(expiry_date) as max_expiry_date,
            certificate_type_id,employee_profile_id, certificate_status, created_date
            FROM employee_certificate
            where status = $1
            AND certificate_status = $3
            AND expiry_date IS NOT NULL
            AND employee_profile_id = $2
            group by certificate_type_id,employee_profile_id) tbl
          ON
          employee_certificate.expiry_date = tbl.max_expiry_date AND
          employee_certificate.certificate_type_id = tbl.certificate_type_id AND
          employee_certificate.employee_profile_id = tbl.employee_profile_id AND
          employee_certificate.certificate_status = tbl.certificate_status  
          INNER JOIN certificate_type
            ON certificate_type.certificate_type_id = employee_certificate.certificate_type_id
          where
          DATEDIFF(expiry_date,CURDATE()) <= 30 
          AND DATEDIFF(expiry_date,CURDATE()) >= 0 limit 3;
        `;

        const rawResult = await sails.sendNativeQuery(`${sql};`,[ACCOUNT_STATUS.active,employee_profile_id,CERTIFICATE_STATUS.active,getCurrentDate()]).usingConnection(req.dynamic_connection);

        let response = rawResult.rows ? rawResult.rows.map(certificate => {

          let aboutToExpire = true;
          return {
            certificate_type_name : certificate.certificate_type_name,
            certificate_status    : certificate.certificate_status,
            expiry_date           : formatDate(certificate.expiry_date,req.dateFormat),
            description           : certificate.description,
            aboutToExpire,
          };
        }) : [];

        return res.ok({response},messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  alertAbouttoExpire: async(req,res) => {
    /*
        - count for showing Alert besides External Certification accordian
    */
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.types.validate(request);
      if(!isValidate.error) {
        const { employee_profile_id } = request;
        let sql = `
          Select * from 
          (
            SELECT MAX(expiry_date) as max_expiry_date, certificate_status, certificate_type_id
              FROM employee_certificate 
              where status = $1
                AND employee_profile_id = $2
                AND certificate_status = $3 
                AND expiry_date IS NOT NULL 
              GROUP BY certificate_type_id
          ) ec 
          where 
          DATEDIFF(max_expiry_date,$4) <= 30 
          AND 
          DATEDIFF(max_expiry_date,$4) >= 0;
        `;
        const rawResult = await sails.sendNativeQuery(`${sql};`,[ACCOUNT_STATUS.active,employee_profile_id,CERTIFICATE_STATUS.active,getCurrentDate()]).usingConnection(req.dynamic_connection);
        sails.log(sql);
        const count = rawResult.rows ? rawResult.rows.length : 0;
        return res.ok({count},messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(isValidate.error,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  },
  review: async(req,res) => {
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.review.validate(request);
      const {approved,employee_certificate_id, reject} = request;
      if(!isValidate.error){
        let certificate_status; let message; let approved_by = 0; let status = ACCOUNT_STATUS.active;
        let crtDetails = await EmpCertification.findOne({ employee_certificate_id }).usingConnection(req.dynamic_connection);

        if(approved){
          certificate_status = CERTIFICATE_STATUS.active;
          message = messages.REVIEW_CRT_APPROVED;
          approved_by = req.user.user_id;
        }else{
          let sql = `
          SELECT certificate_status FROM employee_certificate_history 
            where employee_certificate_id = $1 
            group by certificate_status 
            ORDER BY employee_certificate_history_id DESC LIMIT 1,1 ;`;
          const rawResult = await sails.sendNativeQuery(`${sql};`,[employee_certificate_id]).usingConnection(req.dynamic_connection);

          let crtHistory = rawResult.rows;
          let previous_status = await previosStatusData(crtHistory);
          await previosStatusAssignedData(previous_status,reject,certificate_status,message,status,crtDetails,req);
        }

        await EmpCertification.update({ employee_certificate_id  },{
          approved_by,
          certificate_status,
          status,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).usingConnection(req.dynamic_connection);

        if((approved) || (reject && reject === 'Reject'))
        {
          let notification_entity;
          if(approved)
          {
            notification_entity = NOTIFICATION_ENTITIES.CERTIFICATE_APPROVED;
          }
          await rejectCondition(reject,notification_entity);
          const resultEmployee = await sails.sendNativeQuery(`Select user.first_name, user.last_name, ep.employee_profile_id from employee_profile as ep join ${process.env.DB_NAME}.user on ep.user_id = user.user_id where user.user_id = ${req.user.user_id}`).usingConnection(req.dynamic_connection);
          const updatedEmployee = resultEmployee.rows;
          await sendNotification(req,{
            notification_entity,
            employee_certificate_id,
            employee            : updatedEmployee[0],
            employee_profile_id : crtDetails.employee_profile_id,
            account_id          : req.account.account_id,
          });
        }
        await EmpCertificateHistory.create({
          employee_certificate_id : employee_certificate_id,
          employee_profile_id     : crtDetails.employee_profile_id,
          issue_date              : await crtDetailsData(crtDetails),
          expiry_date             : await crtDetailsExpireDate(crtDetails),
          description             : await crtDetailsDescription(crtDetails),
          status                  : status,
          task_id                 : 0,
          end_date                : await crtDetailsEndDate(crtDetails),
          certificate_status      : certificate_status,
          certificate_file_path   : await certificatePathData(crtDetails),
          approved_by,
          created_by              : req.user.user_id,
          created_date            : getDateUTC(),
        }).fetch().usingConnection(req.dynamic_connection);

        res.ok(undefined,message,RESPONSE_STATUS.success);
        // }else{
        //   res.ok(undefined,messages.REVIEW_CRT_NEED_ACCESS,RESPONSE_STATUS.warning);
        // }
      }else{
        res.ok(isValidate.error,messages.REVIEW_CRT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.REVIEW_CRT_FAILURE,RESPONSE_STATUS.error);
    }
  },
  aboutToExpireCrtCron : _aboutToExpireCrtCron,
  trigger              : async (_req,res) => {
    let curentTimeUTC = getDateUTC();
    await _aboutToExpireCrtCron(curentTimeUTC,false);
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  },

  exportCertificateReportList: async (req,res) => {
    /*
        - List all certificates for that employee_profile from employee_certificate
    */
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.filterList.validate(request);
      if(!isValidate.error) {
        let accountsql = `
          SELECT
              account_configuration_detail.value
            from account
            INNER JOIN
              account_configuration ON account.account_id = account_configuration.account_id
            INNER JOIN
              account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id
            Where
              account_configuration_detail.code = $1 and account.status= $2 and account.account_id= $3`;
        const rawResultData = await sails.sendNativeQuery(accountsql,[ACCOUNT_CONFIG_CODE.expire_certificate_days_limit, ACCOUNT_STATUS.active, req.account.account_id]);
        const expireCertificateDays = rawResultData.rows;
        const expireCertificateDaysLimit= expireCertificateDays[0].value ? expireCertificateDays[0].value : 30;

        const { employee_profile_id, locations,certificate_status, job_types, sortField, sortOrder } = request;

        const findQuery = await commonListing(req.allParams());
        const rows = findQuery.rows;
        const skip = findQuery.skip;

        let sql = `
        SELECT
          DISTINCT ec.employee_certificate_id,
          ep.team_member_id,
          CONCAT(user.first_name, " ", user.last_name) as name,          
          user.phone,
          user.email,
          ct.name as certificate_type_name,
          ec.created_date as assigned_on,
          ec.expiry_date as expiry_date,
          CONCAT(assigned_by_user.first_name, " ", assigned_by_user.last_name) as assigned_by,          
          CONCAT(added_by_user.first_name, " ", added_by_user.last_name) as added_by,          
          ec.employee_profile_id,
          ec.certificate_status,
          ec.status,
          ct.auto_assign as certificate_type_auto_assign          
          FROM employee_certificate ec
        INNER JOIN ${process.env.DB_NAME}.user assigned_by_user
          ON assigned_by_user.user_id = ec.created_by
        INNER JOIN ${process.env.DB_NAME}.user added_by_user
          ON added_by_user.user_id = ec.added_by
        INNER JOIN employee_profile ep
          ON ep.employee_profile_id = ec.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user user
          ON user.user_id = ep.user_id        
        INNER JOIN certificate_type ct
          ON ct.certificate_type_id = ec.certificate_type_id
        INNER JOIN employee_location el
          ON el.employee_profile_id = ec.employee_profile_id
        INNER JOIN employee_job_type ejt
          ON ejt.employee_profile_id = ec.employee_profile_id
          where ec.status = '${ACCOUNT_STATUS.active}'
           `;

        if(certificate_status === 'Expiring'){
          const startDate = getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,'YYYY-MM-DD');
          const endDate = moment(getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,'YYYY-MM-DD')).add(expireCertificateDaysLimit, 'days').format('YYYY-MM-DD');
          sql = sql + `AND ec.expiry_date between "${startDate}" and "${endDate}"`;
        } else {
          sql = sql + `AND ec.certificate_status = '${certificate_status}' `;
        }

        sql = await locationDatas(locations,sql,employee_profile_id,req);

        if (checkIfArrayExist(job_types)) {
          const jobTypeName = job_types.map((c) => `'${c}'`).join(', ');
          const jobTypeData = '(' + jobTypeName + ')';
          sql = sql + ' AND ejt.job_type_id IN ' + jobTypeData + '';
        }
        const andPayload = findQuery.andCondition;

        sql = handleMultiplePayloadCondition(andPayload, sql);

        if(handleTwoLogicalConditions([sortField, sortOrder], 'AND')){
          sql = handleConditionalSortQuery(sortField, sortOrder, sql);
        }

        if(handleTwoLogicalConditions([skip !== undefined, rows !== undefined], 'AND')){
          sql += ` LIMIT $3 OFFSET $4 `;
        }

        const rawResult = await sails.sendNativeQuery(`${sql};`,[employee_profile_id,ACCOUNT_STATUS.active,Number(rows),Number(skip),CERTIFICATE_STATUS.rejected]).usingConnection(req.dynamic_connection);

        let response = handleCertificateResponse(rawResult.rows,req);
        let message = messages.NO_CERTIFICATE_ADDED;

        let handleResponseFilterResponse = handleResponseFilter(response, message, 'exportCertificateReportList');
        let withoutAboutToEx = handleResponseFilterResponse[0];
        message = handleResponseFilterResponse[2];

        let handleCertificateListResponse = handleCertificateList(certificate_status,withoutAboutToEx);
        let certificateList = handleCertificateListResponse[0];
        let certiType = handleCertificateListResponse[1];

        if(certificateList.length > 0) {
          let curentTimeUTC = getDateUTC();
          !fs.existsSync(`${process.cwd()}/assets/reports/`) && fs.mkdirSync(`${process.cwd()}/assets/reports/`, { recursive: true });
          let fileName = `${certiType}_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD-YYYY_HH_mm_ss')}`;
          let sheetName = `${certiType}_${getDateTimeSpecificTimeZone(curentTimeUTC,req.timezone,'MM-DD-YYYY')}`;
          let certificateReportSheet = XLSX.utils.json_to_sheet(certificateList);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, certificateReportSheet, sheetName );
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
          res.ok(data,message,RESPONSE_STATUS.success);
        }else {
          res.ok(undefined,message,RESPONSE_STATUS.success);
        }
      }else{
        return res.ok(isValidate.error,messages.EXPORT_REPORT_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.EXPORT_REPORT_FAILURE,RESPONSE_STATUS.error);
    }
  },
  uploadCertificate: async (req,res) => {
    try{
      let request = req.allParams();
      const isValidate = await CertificateValidations.add.validate(request);
      if(!isValidate.error) {
        let { certificate_type_id, description, issue_date, expiry_date, employee_profile_id} = request;
        let upload = req.file('certificate_file');

        // Check weather certificate_type is active or not
        let crtTypeExist = await CertificateType.findOne({ certificate_type_id, status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
        if(crtTypeExist){
          let certificate_file;
          if(upload._files.length !== 0 ){
            let fileUID;
            const account = req.account;
            let containerName = account.account_guid;
            let dirName = `${process.env.EMPLOYEE_DIR_INSIDE_CONTAINER}/${employee_profile_id}/${process.env.CERTIFICATE_FILE_DIR_INSIDE_CONTAINER}`;
            let data = {
              invalidFileTypeMsg : messages.INVALID_CERTIFICATE_FILE_TYPE,
              maxUploadFileCount : 1,
              maxUploadSize      : 25,
              fileAllowedTypes   : validations.ALLOWED_CERTIFICATES_IMAGES
            };
            fileUID = await uploadFile(upload, containerName, dirName, data);
            certificate_file = fileUID;
          }

          let certificate_file_path = await certificate_file_pathData(certificate_file,req,employee_profile_id);

          let isExpired = false;
          if(expiry_date){
            let diff = moment(expiry_date).diff(moment(),'days');
            isExpired = diff < 0;
          }

          let task_id;
          let certificate_status;
          if(checkPermissionExistForUser(req.permissions,PERMISSIONS.REVIEW_CERTIFICATE) /* Review Crt Permission exist */){
            certificate_status = await isExpiredActiveData(isExpired);
          }else {
            certificate_status = await isExpiredInReviewData(isExpired);
            const user = await Users.findOne({ user_id: req.user.user_id});
            // Task should be added to all the users who has permissions to review the certificate for that location
            let task = await addTask(req,res,employee_profile_id,`${user.first_name} ${user.last_name} uploaded ${crtTypeExist.name} for your review. Visit their profile to evaluate.`);
            task_id = await checkTaskDetails(task);
          }
          let empCrt = await EmpCertification.create({
            certificate_type_id,
            employee_profile_id,
            issue_date,
            expiry_date           : await expiry_date_data(expiry_date),
            description           : await description_data(description),
            status                : ACCOUNT_STATUS.active,
            task_id               : await task_id_data(task_id),
            added_by              : req.user.user_id,
            certificate_file_path : certificate_file_path,
            certificate_status    : certificate_status,
            created_by            : req.user.user_id,
            created_date          : getDateUTC(),
          }).fetch().usingConnection(req.dynamic_connection);

          let empCrtHistory = await EmpCertificateHistory.create({
            employee_certificate_id : empCrt.employee_certificate_id,
            employee_profile_id,
            issue_date,
            expiry_date             : await expiry_date_data(expiry_date),
            description             : await description_data(description),
            status                  : ACCOUNT_STATUS.active,
            task_id                 : await task_id_data(task_id),
            certificate_status      : certificate_status,
            certificate_file_path   : certificate_file_path,
            added_by                : req.user.user_id,
            created_by              : req.user.user_id,
            created_date            : getDateUTC(),
          }).fetch().usingConnection(req.dynamic_connection);

          const user1 = await Users.findOne({ user_id: req.user.user_id});

          return res.ok({
            employee_certificate_id : empCrtHistory.employee_certificate_id,
            certificate_type        : {
              certificate_type_id : certificate_type_id,
              name                : crtTypeExist.name
            },
            employee_profile_id             : empCrtHistory. employee_profile_id,
            issue_date                      : formatDate(empCrtHistory.issue_date,req.dateFormat),
            expiry_date                     : formatDate(empCrtHistory.expiry_date,req.dateFormat),
            description                     : await empCrtHistoryDescription(empCrtHistory),
            created_by                      : `${user1.first_name} ${user1.last_name}`,
            added_by                        : `${user1.first_name} ${user1.last_name}`,
            created_date                    : getDateUTC(empCrtHistory.created_date),
            certificate_status              : empCrtHistory.status,
            certificate_file_path           : certificate_file ? `${process.env.BLOB_STORAGE_CDN_URL}/${certificate_file_path}` : '',
            certificate_thumbnail_file_path : certificate_file ? getThumbanail(`${process.env.BLOB_STORAGE_CDN_URL}/${certificate_file_path}`) : '',

          },messages.ADD_CERTIFICATE,RESPONSE_STATUS.success);

        }else{
          return res.ok(undefined,messages.CERTIFICATE_TYPE_NOT_EXIST,RESPONSE_STATUS.error);
        }
      }else{
        return res.ok(isValidate.error,messages.ADD_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,error.message,RESPONSE_STATUS.error);
    }
  },
};
