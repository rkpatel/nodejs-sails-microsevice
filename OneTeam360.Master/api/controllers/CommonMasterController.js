/* eslint-disable no-trailing-spaces */
/* eslint-disable key-spacing */
/* eslint-disable camelcase */
/***************************************************************************

  Controller     : CommonMasterController

  **************************************************
  Functions
  **************************************************

  findTaskType

  **************************************************

***************************************************************************/
let XLSX = require('xlsx');
const moment = require('moment');
const env = sails.config.custom;
const { generateToken } = require('../services/jwt');
const { setCache, getCache, keyExists } = require('../utils/common/redisCacheExtension');
const {sendNotification} = require('../services/sendNotification');
const { uploadDocument } = require('../services/uploadDocument');
const { validateLogin } = require('../services/getUserInfo');
const JobTypeValidations = require('../validations/JobTypeValidations');
const TrainingValidations = require('../validations/TrainingValidations');
const CountryStateValidations = require('../validations/CountryStateValidations');
const fs = require('fs');
const { ACCOUNT_STATUS, RESPONSE_STATUS, MASTERINFO_STATUS, UPLOAD_REQ_FOR, GRADE_STATUS, IMPORT_STATUS, IMPORT_TEMP_STATUS,ACCOUNT_CONFIG_CODE,  NOTIFICATION_ENTITIES, CRON_JOB_CODE, PORTAL_ACCESS_STATUS} = require('../utils/constants/enums');
const validations = require('../utils/constants/validations');
const messages = sails.config.globals.messages;
const { getDateUTC } = require('../utils/common/getDateTime');
const { copyImageFromTempToUrl } = require('../services/azureStorage');
const { escapeSqlSearch } = require('../services/utils');
let xls_utils = XLSX.utils;

const tmpUploadDirOnAzureForBulkImport = process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_BULK_IMPORT;
const uploadDirOnAzureForBulkImport = process.env.IMG_UPLOAD_DIR_ON_AZURE_FOR_BULK_IMPORT;
const getFileUrl = function (imgUrlArr, account, trainingId) {
  let mainUrl = `${process.env.PROFILE_PIC_CDN_URL}/${account.account_guid}/${uploadDirOnAzureForBulkImport}/${trainingId}`;
  const respImgArr = {
    image_url: `${mainUrl}/${imgUrlArr}`,
  };
  return { respImgArr, allUrl: imgUrlArr};
};


const removeFiles = function (filePath) {
  sails.log('In removeFiles');
  fs.exists(filePath, (exists) => {
    if (exists) {
      fs.unlink(filePath, err => {
        if (err) {
          sails.log('In remove files reject function=',err);
          throw err; }
      });
    }
  });
};
const bulkImportCron = async() =>{
  sails.log.debug('Bulk Import Cron Execution Start');
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
          account_configuration_detail.code IN ($1,$2,$3,$4) and account.status = $5 ;`;

  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql),[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format, ACCOUNT_STATUS.active]);
  const results = rawResult.rows;

  let accountIds = [...new Set(results.map(item => item.account_id))];
  let accountArray = accountIds ? accountIds.map(id => {

    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let time_zone = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.time_zone);
    let date_time_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_time_format);
    let date_format = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.date_format);
    return {
      account_id                  : id,
      tenant_db_connection_string : tenant_db_connection_string ? tenant_db_connection_string.value : '',
      time_zone                   : time_zone ? time_zone.value : process.env.ACCOUNT_TIMEZONE,
      date_time_format            : date_time_format ? date_time_format.value : process.env.ACCOUNT_DATETIMEFORMAT,
      date_format                 : date_format? date_format.value : process.env.ACCOUNT_DATEFORMAT,
    };
  })  : [];

  for(const item of accountArray)
  {

    if(!item.tenant_db_connection_string) {continue;}

    let connectionString = item.tenant_db_connection_string;
    if(connectionString){
      let rdi = sails.getDatastore('default');
      let mysql = rdi.driver.mysql;
      let tenantConnection = await  mysql.createConnection(connectionString);
      await tenantConnection.connect();

      let cronJob = await CronJob.findOne({ code: CRON_JOB_CODE.bulk_import }).usingConnection(tenantConnection);
      if(cronJob){
        let currentDate = getDateUTC();
        let obj;
        let start_date = cronJob.last_processing_date ? moment(cronJob.last_processing_date).format('YYYY-MM-DD HH:mm:ss') : '0000-00-00 00:00:00';
        sails.log(start_date);
        
        try{
        //get the location data
          const location = await Locations.find({
            status : ACCOUNT_STATUS.active
          }).select(['name']).usingConnection(tenantConnection);
          const locations = await location.map((item1)=>{
            return (item1.name).toLowerCase();
          });

          //get the jobtype data
          const jobType = await JobType.find({
            status : ACCOUNT_STATUS.active
          }).select(['name']).usingConnection(tenantConnection);
          const jobTypes = await jobType.map((item1)=>{
            return (item1.name).toLowerCase();
          });

          //get the role
          // const role = await Role.find({is_admin_role : false}).select(['name']).usingConnection(tenantConnection);
          // const roles = await role.map((item1)=>{
          //   return item1.name;
          // });

          //country
          const getCountryKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.country}`;
          let CountryKeyExists = await keyExists(getCountryKey);
          if(CountryKeyExists === 1)
          {
            await deleteCache(getCountryKey);
          }
          const results2 = await Country.find({
            where : {status : ACCOUNT_STATUS.active},
            sort :  [{name :  'ASC'}]
          });
          const dataCountry = {
            'key'   : getCountryKey,
            'value' : results2
          };
          await setCache(dataCountry);
          const countries = await results2.map((item1)=>{
            return item1.name;
          });

          const resultBulkData = await BulkImportLog.find({ status : IMPORT_STATUS.imported }).usingConnection(tenantConnection);
          if((resultBulkData) && (resultBulkData.length > 0))
          {
            let level = await Level.find({ status: ACCOUNT_STATUS.active }).sort(`level ASC`).limit(1).usingConnection(tenantConnection);
            for(const item1 of resultBulkData)
            {
              if((item1.file_name !== '') && (item1.file_name !== undefined))
              {
              //read the file content
                const workbook = XLSX.readFile(`${process.cwd()}/assets/images/${item1.file_name}`);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const range = xls_utils.decode_range(sheet['!ref']);
                let cell_ref;
                let result = {};
                let test = [];
                let responseBulk = [];
                let successCount=0;
                let errorCount=0;
                for (let R = (range.s.r) + 1; R <= range.e.r; ++R) {
                  for (let C = range.s.c; C <= range.e.c; ++C) {
                    let cell_address = { c: C, r: R };
                    /* if an A1-style address is needed, encode the address */
                    cell_ref = XLSX.utils.encode_cell(cell_address);

                    if (typeof (sheet[cell_ref]) === 'undefined') {
                      test.push('');
                    }
                    else{
                      test.push(sheet[cell_ref].w);
                    }
                  }
                  let errorInFile = '';
                  if (test.length > 0) {
                    result = {
                      'first_name'        : test[0],
                      'last_name'         : test[1],
                      'email'             : test[2],
                      'phone'             : ((test[3]).includes('-')) ? (test[3]).replace(/-/g,'') : test[3],
                      'date_of_birth'     : test[4],
                      'date_of_joining'   : test[5],
                      'locations'          : test[6],
                      'job_types'          : test[7],
                      //'role'              : test[8],
                      'emergency_contact_name': test[8],
                      'emergency_contact_relation':test[9],
                      'emergency_contact_number':test[10],
                      'emergency_contact_address':test[11],
                      'emergency_contact_country':test[12],
                      'emergency_contact_state':test[13],
                      'emergency_contact_city':test[14],
                      'emergency_contact_zip':test[15],
                      'team_member_id':test[16]
                    };
                    const addBulkValidate = await CountryStateValidations.bulkAdd.validate(result);
                    if((addBulkValidate.error))
                    {
                      errorInFile += addBulkValidate.error;
                    }
                    if((test[4]!=='') && ((!(moment(test[4], 'MM/DD/YYYY')).isValid()) || (test[4] > moment())))
                    {
                      errorInFile += (errorInFile  === '') ? messages.INVALID_DATE_BIRTH : `, ${messages.INVALID_DATE_BIRTH}`;
                    }
                    else if((test[4]!=='') && ((moment(test[4], 'MM/DD/YYYY')).isValid())){
                      result.date_of_birth = (result.date_of_birth !== '') ? moment(result.date_of_birth, 'MM/DD/YYYY').format('YYYY-MM-DD') : '';
                    }
                    if((test[5]!=='') && (!(moment(test[5], 'MM/DD/YYYY')).isValid()))
                    {
                      errorInFile += (errorInFile  === '') ?  messages.INVALID_DATE_JOINING : `, ${messages.INVALID_DATE_JOINING}`;
                    }
                    else if((test[5] !== '') && (moment(test[5], 'MM/DD/YYYY')).isValid()){
                      result.date_of_joining = (result.date_of_joining !== '') ? moment(result.date_of_joining, 'MM/DD/YYYY').format('YYYY-MM-DD') : '';
                    }

                    const user = await Users.findOne({ email: test[2] });                    
                    if (user) {
                      errorInFile +=  (errorInFile === '') ?  messages.USER_ALREADY_EXISTS : `, ${messages.USER_ALREADY_EXISTS}`;
                    }
                    if(test[6] !== '')
                    {
                      const locationsArray = ((test[6]).includes(',')) ? (test[6]).split(',') : (test[6]).split('|');
                      locationsArray.map((item2) => {
                        if(!locations.includes((item2.trim()).toLowerCase())){
                          errorInFile += (errorInFile  === '')  ?  messages.INVALID_LOCATIONS : `, ${messages.INVALID_LOCATIONS}`;
                        }
                      });
                    }
                    if(test[7] !== '')
                    {
                      const jobTypesArray = ((test[7]).includes(',')) ? (test[7]).split(',') : (test[7]).split('|');
                      jobTypesArray.map((item3) => {
                        if(!jobTypes.includes((item3.trim()).toLowerCase())){ 
                          errorInFile += (errorInFile  === '') ?  messages.INVALID_JOBTYPES : `, ${messages.INVALID_JOBTYPES}`;
                        }
                        
                      });
                    }                
                    if(test[12] !== '')
                    {
                      if(!countries.includes(test[12]))
                      {
                        errorInFile+= (errorInFile === '') ?  messages.INVALID_COUNTRY: `, ${messages.INVALID_COUNTRY}`;
                      }
                    }
                    if((test[13] !== '') && (test[12] !== '')){
                      const countryId= await Country.findOne({ name : test[12]});
                      if(countryId)
                      {
                        const state = await State.find({ country_id : countryId.country_id });

                        const states = state.map((item12)=>{
                          return item12.name;
                        });
                        if(!states.includes(test[13]))
                        {
                          errorInFile+= (errorInFile === '') ?  messages.INVALID_STATE : `, ${messages.INVALID_STATE}`;
                        }
                      }
                    }
                    else if((test[13] !== '') && (test[12] === '')){
                      errorInFile+= (errorInFile === '') ?  messages.INVALID_STATE :`, ${messages.INVALID_STATE}`;
                    }
                    if((test[13] !== '') && (test[14] !== '')){
                      const stateId = await State.findOne({ name : test[13] });
                      if(stateId)
                      {
                        const city = await City.find({ state_id : stateId.state_id });
                        const cities = city.map((item12)=>{
                          return item12.name;
                        });
                        if(!cities.includes(test[14]))
                        {
                          errorInFile+= (errorInFile  === '') ?  messages.INVALID_CITY : `, ${messages.INVALID_CITY}`;
                        }
                      }
                    }
                    else if(((test[12] === '') || (test[13] === '')) && (test[14] !== '')){
                      errorInFile+= (errorInFile  === '' ) ?  messages.INVALID_CITY: `, ${messages.INVALID_CITY}`;
                    }
                    if(test[16] && test[16] !== ''){
                      const employee_team_member_id = await EmployeeProfile.findOne({ team_member_id: test[16] }).usingConnection(tenantConnection);
                      if (employee_team_member_id) {
                        errorInFile +=  (errorInFile === '') ?  messages.TEAM_MEMBER_ID_EXISTS : `, ${messages.TEAM_MEMBER_ID_EXISTS}`;
                      }
                    }
                   
                    if((errorInFile === '') || (errorInFile === 'undefined'))
                    {
                      result.status = IMPORT_TEMP_STATUS.success;
                      successCount++;
                    }
                    else{
                      result.status = IMPORT_TEMP_STATUS.failure;
                      result.error_log = (errorInFile).split('.').join(',');
                      errorCount++;
                    }
                    result.bulk_import_log_id= item1.bulk_import_log_id;
                    responseBulk.push(result);
                    test = [];
                  }

                }
                // update counts in table
                await BulkImportLog.update({ bulk_import_log_id: item1.bulk_import_log_id },
              {
                total_count:responseBulk.length,
                error_count: errorCount,
                success_count: successCount,
                status: IMPORT_STATUS.validated
              }).usingConnection(tenantConnection);
                //remove the file
                removeFiles(`${process.cwd()}/assets/images/${item1.file_name}`);
                //bulk import into table
                if(responseBulk.length >0)
                {
                  await BulkImportTemp.createEach(responseBulk).usingConnection(tenantConnection);
                }
              }
              if(item1.is_accept)
              {
                const bulkImportData = await BulkImportTemp.find({ bulk_import_log_id: item1.bulk_import_log_id, status : IMPORT_TEMP_STATUS.success}).usingConnection(tenantConnection);
                if(bulkImportData)
                {
                  for(const data of bulkImportData){
                    let addData = {
                      first_name : data.first_name,
                      last_name : data.last_name,
                      email : data.email,
                      phone : data.phone,
                      date_of_birth : data.date_of_birth ? data.date_of_birth : null,
                      profile_picture_url           : '',
                      profile_picture_thumbnail_url : '',
                      emergency_contact_name :(data.emergency_contact_name) ? (data.emergency_contact_name): '',
                      emergency_contact_relation: (data.emergency_contact_relation) ? data.emergency_contact_relation : '',
                      emergency_contact_number: (data.emergency_contact_number) ? data.emergency_contact_number : '',
                      emergency_contact_address:(data.emergency_contact_address) ? data.emergency_contact_address : '',
                      emergency_contact_zip : (data.emergency_contact_zip) ? data.emergency_contact_zip : '',
                      created_by                    : item1.uploaded_by,
                      status                        : ACCOUNT_STATUS.invited,
                      created_date                  : getDateUTC()
                    };
                
                    if(data.emergency_contact_country){
                      const country = await Country.findOne({name : data.emergency_contact_country});
                      addData['emergency_contact_country_id'] = country.country_id;
                    }
                    else{
                      addData['emergency_contact_country_id'] = null;
                    }
                    if((data.emergency_contact_state) && (data.emergency_contact_country)){
                      const state = await State.findOne({name : data.emergency_contact_state, country_id: addData.emergency_contact_country_id});
                      addData['emergency_contact_state_id'] = state.state_id;
                    }
                    else{
                      addData['emergency_contact_state_id'] = null;
                    }
                    if((data.emergency_contact_city) && (data.emergency_contact_state)){
                      const city = await City.findOne(
                      {name : data.emergency_contact_city,state_id: addData.emergency_contact_state_id});
                      addData['emergency_contact_city_id'] = city.city_id;
                    }else{
                      addData['emergency_contact_city_id'] = null;
                    }
                    addData['portal_access'] = PORTAL_ACCESS_STATUS.customer;
                    const newUser = await Users.create(addData).fetch();

                    let  userId = newUser.user_id;
                    await AccountUserMapping.create({
                      account_id      : item.account_id,
                      user_id         : userId,
                      created_by      : item1.uploaded_by,
                      last_updated_by : item1.uploaded_by,
                      created_date    : getDateUTC()
                    }).fetch();

                    const role = await Role.findOne({ role_id : 3 }).usingConnection(tenantConnection);

                    let  empProfileResult = await EmployeeProfile.create({
                      user_id         : userId,
                      created_by      : item1.uploaded_by,
                      date_of_joining : data.date_of_joining,
                      role_id         : role.role_id,
                      level_id        : level[0].level_id,
                      points          : 0,
                      status          : ACCOUNT_STATUS.active,
                      last_updated_by :  item1.uploaded_by,
                      team_member_id  : data.team_member_id,
                      created_date    : getDateUTC()
                    }).fetch().usingConnection(tenantConnection);
                    if(data.locations !== '')
                    {
                      const location_id = ((data.locations).includes(',')) ? (data.locations).split(',') : (data.locations).split('|');
                      sails.log('location_id', location_id);
                      if(location_id.length >0)
                      {
                        const loc_arr = await Promise.all((location_id).map(async(locationn) => {
                          const locationId =await Locations.findOne({name: locationn.trim()}).usingConnection(tenantConnection);
                          return { employee_profile_id: empProfileResult.employee_profile_id, location_id: locationId.location_id, created_by: item1.uploaded_by, created_date: getDateUTC() };
                        }));
                        if (loc_arr.length > 0) { await EmpLocation.createEach(loc_arr).usingConnection(tenantConnection); }
                      }

                    }

                    if(data.job_types !== '')
                    {
                      const job_type_id = ((data.job_types).includes(',')) ? (data.job_types).split(',') : (data.job_types).split('|');
                      sails.log('job_type_id', job_type_id);
                      if(job_type_id.length > 0)
                      {
                        const job_arr = await Promise.all((job_type_id).map(async(job) => {
                          const jobtypes=await JobType.findOne({name:job.trim()}).usingConnection(tenantConnection);
                          return {
                            employee_profile_id: empProfileResult.employee_profile_id, job_type_id: jobtypes.job_type_id, created_by: item1.uploaded_by, created_date: getDateUTC()
                          };
                        }));
                        if (job_arr.length > 0) { await EmpJobType.createEach(job_arr).usingConnection(tenantConnection); }
                      }
                    }

                    const token = await generateToken({ id: userId, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, env.JWT_CREATE_PASS_EXPIRY);
                    const createUrl = `${process.env.FRONTEND_BASEURL}/create-password?token=${token}`;
                    await Users.update({ user_id: userId }, {
                      reset_password_token: token,
                    });

                    await sendNotification(null, {
                      notification_entity            : NOTIFICATION_ENTITIES.CREATE_PASSWORD,
                      recipient_email                : data.email,
                      recipient_first_name           : data.first_name,
                      recipient_last_name            : data.last_name,
                      recipient_phone                : data.phone,
                      receipient_user_id             : userId,
                      url                            : createUrl,
                      receipient_employee_profile_id : empProfileResult.employee_profile_id,
                      account_id                     : item.account_id,
                    });
                  }
                }
              }
              // update status in table
              await BulkImportLog.update({ bulk_import_log_id: item1.bulk_import_log_id },
              {
                status: IMPORT_STATUS.completed
              }).usingConnection(tenantConnection);
            }

          }

          //forward mail who uploaded the excel
          const completedRecord = await BulkImportLog.find({
            status : IMPORT_STATUS.completed,
            error_count: 0,
            success_count: {'>' : 0}
          }).usingConnection(tenantConnection);
          if(completedRecord){
            for(const key of completedRecord)
            {
              let user = await Users.findOne({user_id: key.uploaded_by});
              if(user){
                if(user.email === process.env.EXPOSE_API_USER_EMAIL){
                  let sql = `SELECT
                              user.user_id, user.email,user.first_name,user.last_name
                              FROM user
                              INNER JOIN account_user ON account_user.user_id = user.user_id
                              WHERE account_user.account_id = ${item.account_id} AND user.primary_user = 'Yes' 
                              LIMIT 1 `;
  
                  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql));
                  user = rawResult.rows[0];
                }
                const employee = await EmployeeProfile.findOne({user_id:user.user_id}).usingConnection(tenantConnection);
                await sendNotification(null, {
                  notification_entity            : NOTIFICATION_ENTITIES.COMPLETE_ALL_IMPORT,
                  recipient_email                : user.email,
                  recipient_first_name           : user.first_name,
                  recipient_last_name            : user.last_name,
                  receipient_user_id             : user.user_id,
                  receipient_employee_profile_id :employee.employee_profile_id,
                  account_id : item.account_id,
                  attachment : key.file_name
                });
                // update counts in table
                await BulkImportLog.update({ bulk_import_log_id: key.bulk_import_log_id },
              {
                status: IMPORT_STATUS.mailSent
              }).usingConnection(tenantConnection);
              }

            }
          }

          const notComplete = await BulkImportLog.find({
            status : IMPORT_STATUS.completed,
            success_count: 0,
            error_count: {'>' : 0}
          }).usingConnection(tenantConnection);
          if(notComplete){
            for(const key of notComplete)
            {
              const user = await Users.findOne({user_id: key.uploaded_by});
              if(user){
                const employee = await EmployeeProfile.findOne({user_id:user.user_id}).usingConnection(tenantConnection);
                await sendNotification(null, {
                  notification_entity            : NOTIFICATION_ENTITIES.NOT_COMPLETE_IMPORT,
                  recipient_email                : user.email,
                  recipient_first_name           : user.first_name,
                  recipient_last_name            : user.last_name,
                  receipient_user_id             : key.uploaded_by,
                  receipient_employee_profile_id :employee.employee_profile_id,
                  account_id : item.account_id,
                  attachment : key.file_name
                });
                // update counts in table
                await BulkImportLog.update({ bulk_import_log_id: key.bulk_import_log_id },
                {
                  status: IMPORT_STATUS.mailSent
                }).usingConnection(tenantConnection);
              }
            }
          }

          const partialComplete = await BulkImportLog.find({
            status : IMPORT_STATUS.completed,
            error_count: {'>' : 0},
            success_count : {'>' : 0}
          }).usingConnection(tenantConnection);
          if(partialComplete){
            for(const key of partialComplete)
            {
              const user = await Users.findOne({user_id: key.uploaded_by});
              if(user){
                const employee = await EmployeeProfile.findOne({user_id:user.user_id}).usingConnection(tenantConnection);
                await sendNotification(null, {
                  notification_entity            : NOTIFICATION_ENTITIES.COMPLETE_PARTIAL_IMPORT,
                  recipient_email                : user.email,
                  recipient_first_name           : user.first_name,
                  recipient_last_name            : user.last_name,
                  receipient_user_id             : key.uploaded_by,
                  receipient_employee_profile_id :employee.employee_profile_id,
                  account_id : item.account_id,
                  attachment : key.file_name
                });
                // update counts in table
                await BulkImportLog.update({ bulk_import_log_id: key.bulk_import_log_id },
                {
                  status: IMPORT_STATUS.mailSent
                }).usingConnection(tenantConnection);
              }
            }
          }
          await CronJob.update({ code: CRON_JOB_CODE.bulk_import },{ last_processing_date: currentDate }).usingConnection(tenantConnection);
          obj = {
            status : 'Success',
            error  : ''
          };
        }
        catch(error)
        {
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
      // No Cron Jon with code bulk import
        sails.log('No Cron Jon with code bulk import');
      }

      if(tenantConnection){
        await tenantConnection.end();
      }
    }



  }
  sails.log.debug('Bulk Import Cron Execution End');
};

const remainingLicense = async function(req, account_id){
  let sql = `SELECT seats FROM account_subscription WHERE account_id = '${account_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  let result = rawResult.rows[0] || null;
  let seat = result.seats;
  
  let userSql = `SELECT COUNT(au.account_user_id) AS cnt 
                 FROM ${process.env.DB_NAME}.account_user AS au
                 LEFT JOIN employee_profile AS ep ON ep.user_id = au.user_id
                 LEFT JOIN ${process.env.DB_NAME}.user AS u ON au.user_id = u.user_id
                 WHERE au.account_id = '${account_id}' AND ep.status='${ACCOUNT_STATUS.active}' AND u.password != ''`;
  const rawUserResult = await sails.sendNativeQuery(userSql).usingConnection(req.dynamic_connection);
  let userResult = rawUserResult.rows[0] || null;
  let totalUserCount = userResult.cnt;
  
  return seat-totalUserCount;
};
const getNumbers = function(name) {
  if(name !== undefined && name !== null && name !== '') {
    let ind = name.match('[a-zA-Z]').index;
    return name.substring(0,ind).trim();
  }
};

const trainingCateId=async (training_category_id,filter)=>{
  if(training_category_id > 0){
    filter.training_category_id = training_category_id;
  }
};

module.exports = {
  imageUpload: async function (req, res) {

    let request = req.allParams();
    let upload = '';
    if(request.requestFor === UPLOAD_REQ_FOR.certificate || request.requestFor === UPLOAD_REQ_FOR.training_explanation || request.requestFor === UPLOAD_REQ_FOR.training_photo || request.requestFor === UPLOAD_REQ_FOR.training_video || request.requestFor === UPLOAD_REQ_FOR.bulk_import_employee || request.requestFor === UPLOAD_REQ_FOR.dailyreport){
      upload = req.file('files');
    }else{
      upload = req.file('images');
    }
    try {

      let fileUID;
      let containerName='';
      let dirName='';
      const isValidLogin =await validateLogin(req,res);
      sails.log('In upload function, file lenth is=', upload._files.length);

      if (!isValidLogin.status || upload._files.length === 0 ) {
        if(upload._files.length === 0 && (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.bulk_import_employee) && (req.isExposedApi)){
          throw new Error(messages.UPLOAD_BULK_IMPORT_NOT_SELECTED);
        } else {
          throw new Error(messages.INVALID_PARAMETER);
        }
      }

      req.dynamic_connection = isValidLogin.connection;
      let data = {};
      if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.task) {
        const account = isValidLogin.account;
        containerName = account.account_guid;
        dirName = process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_TASK;
        data = {
          maxUploadSize : 10,
          requestFor: UPLOAD_REQ_FOR.task
        };
      }else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.employee) {
        containerName = process.env.CONTAINER_NAME;
        dirName = process.env.PROFILE_IMAGE_DIR_INSIDE_MASTER_CONTAINER;
      }else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.certificate) {
        if(!request.employee_profile_id){
          throw new Error(messages.INVALID_PARAMETER);
        }else{
          const account = isValidLogin.account;
          containerName = account.account_guid;
          dirName = `${process.env.EMPLOYEE_DIR_INSIDE_CONTAINER}/${request.employee_profile_id}/${process.env.CERTIFICATE_FILE_DIR_INSIDE_CONTAINER}`;
          data = {
            invalidFileTypeMsg : messages.INVALID_FILE_TYPE,
            maxUploadFileCount : 1,
            maxUploadSize : 25,
            fileAllowedTypes : validations.ALLOWED_CERTIFICATES_IMAGES
          };
        }
      }else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.training_explanation) {
        const account = isValidLogin.account;
        containerName = `${account.account_guid}`;
        dirName = process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_TRAINING;
        data = {
          invalidFileTypeMsg : messages.INVALID_FILE_TYPE,
          maxUploadFileCount : 1,
          maxUploadSize : 25,
          fileAllowedTypes : validations.ALLOWED_TRAINING_IMAGES
        };
      }
      else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.training_photo) {
        const account = isValidLogin.account;
        containerName = `${account.account_guid}`;
        dirName = process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_TRAINING;
        data = {
          invalidFileTypeMsg : messages.INVALID_FILE_TYPE,
          maxUploadFileCount : 1,
          fileAllowedTypes : validations.ALLOWED_TRAINING_IMAGE
        };
      }
      else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.training_video) {
        const account = isValidLogin.account;
        containerName = `${account.account_guid}`;
        dirName = process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_TRAINING;
        data = {
          invalidFileTypeMsg : messages.INVALID_FILE_TYPE,
          maxUploadFileCount : 1,
          maxUploadSize : 500,
          fileAllowedTypes : validations.ALLOWED_TRAINING_VIDEO
        };
      }
      else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.bulk_import_employee) {
        const account = isValidLogin.account;
        containerName = `${account.account_guid}`;
        dirName = process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_BULK_IMPORT;
        data = {
          invalidFileTypeMsg : messages.INVALID_FILE_TYPE_FOR_BULK_IMPORT,
          maxUploadFileCount : 1,
          maxUploadSize : 5,
          fileAllowedTypes : validations.ALLOWED_BULK_IMPORT,
          isThumbnail : false,
          requestFor: UPLOAD_REQ_FOR.bulk_import_employee
        };
      }
      else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.competition) {
        const account = isValidLogin.account;
        containerName = account.account_guid;
        dirName = `${process.env.COMPETITION_IMG_UPLOAD_DIR_ON_AZURE}`;
        data = {
          invalidFileTypeMsg : messages.INVALID_FILE_TYPE,
          maxUploadFileCount : 1,
          maxUploadSize : 5,
          fileAllowedTypes : validations.ALLOWED_COMPETITION_IMAGES,
          isThumbnail : false
        };
      }
      else if (request.requestFor && request.requestFor === UPLOAD_REQ_FOR.dailyreport) {
        const account = isValidLogin.account;
        containerName = account.account_guid;
        dirName = `${process.env.DAILYREPORT_IMG_UPLOAD_DIR_ON_AZURE}`;
        data = {
          invalidFileTypeMsg : messages.INVALID_FILE_TYPE,
          maxUploadFileCount : 10,
          maxUploadSize : 100,
          fileAllowedTypes : validations.ALLOWED_DAILYREPORT_IMAGES,
          requestFor: UPLOAD_REQ_FOR.dailyreport
        };
      }
      fileUID = await uploadDocument(upload, containerName, dirName, data);
      if((request.requestFor === UPLOAD_REQ_FOR.bulk_import_employee) && (fileUID.length > 0)){
        const account_id       = isValidLogin.account.account_id;
        const leftLicense = await remainingLicense(req, account_id);
        const workbook = XLSX.readFile(`${process.cwd()}/assets/images/${fileUID[0]}`);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const range = xls_utils.decode_range(sheet['!ref']);
        let num_rows = range.e.r - range.s.r;
        sails.log('leftLicense', leftLicense);
        sails.log('num_rows', num_rows);
        if(leftLicense >= num_rows) {

          const filename = upload._files[0].stream.filename;
          const account = isValidLogin.account;
          const response = await BulkImportLog.create({
            file_name     : fileUID[0],
            is_accept     : request.is_accept,
            uploaded_file_name :   filename,
            status        : IMPORT_STATUS.imported,
            uploaded_by   : isValidLogin.user.user_id,
            uploaded_date : getDateUTC()
          }).fetch().usingConnection(isValidLogin.connection);

          //get file url
          const bulkFile = getFileUrl(fileUID[0], account, response.bulk_import_log_id);
          let location_path = bulkFile.respImgArr.image_url;

          
          // // Move images to respective bulkimport directory on azure
          await copyImageFromTempToUrl(bulkFile.allUrl, account.account_guid, process.env.IMPORT_FILE_DIR_INSIDE_CONTAINER, response.bulk_import_log_id, tmpUploadDirOnAzureForBulkImport);

          await BulkImportLog.update({ bulk_import_log_id: response.bulk_import_log_id },
          {
            file_path: location_path,
          }).usingConnection(isValidLogin.connection);
          let message = messages.UPLOAD_BULK_IMPORT;
          if(req.isExposedApi){
            message = messages.UPLOAD_BULK_IMPORT_EXPOSE;
          }
          return res.ok(undefined, message, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.EXCEED_EMPLOYEE, RESPONSE_STATUS.error);
        }
      }
      else
      {
        const result = { 'imageName': fileUID };
        return res.ok(result, messages.SUCCESS_UPLOAD, RESPONSE_STATUS.success);
      }

    } catch (err) {
      sails.log('In upload catch functoin=', err);
      clearTimeout(upload.timeouts.untilMaxBufferTimer);
      clearTimeout(upload.timeouts.untilFirstFileTimer);
      return res.ok(undefined, err.message, RESPONSE_STATUS.error);
    }
  },

  findTaskType: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.tasktype}`;
    let tasktypes = await getCache(getKey);
    if ((tasktypes.status === RESPONSE_STATUS.success) && (tasktypes.data !== null)) {
      results = tasktypes.data;
    }
    else {
      results = await TaskType.find({
        where: { status: ACCOUNT_STATUS.active, is_default: false },
      }).usingConnection(req.dynamic_connection);
      const data = {
        'key': `${accountDetail.account_guid}_${MASTERINFO_STATUS.tasktype}`,
        'value': results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active && !data.is_default);

    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const taskTypeList = results.map((item) => ({
      task_type_id: item.task_type_id,
      name: item.name
    }));
    return res.ok(taskTypeList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },
  findTrainingCategory: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingCategory}`;
    const trainingCats = await getCache(getKey);
    if((trainingCats.status === RESPONSE_STATUS.success) && (trainingCats.data !== null))
    {
      results = trainingCats.data;
    }
    else{
      results = await TrainingCategory.find({
        where : {status : ACCOUNT_STATUS.active},
      }).usingConnection(req.dynamic_connection);
      const data = {
        'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingCategory}`,
        'value' :  results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active);
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const trainingCatList = results.map((item)=>({
      training_category_id : item.training_category_id,
      name : item.name
    }));
    return res.ok(trainingCatList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },
  findTrainingGrouping: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingGrouping}`;
    let training = await getCache(getKey);
    if((training.status === RESPONSE_STATUS.success) && (training.data !== null))
    {
      results = training.data;
    }
    else{
      results = await Training.find({
        where : {status : ACCOUNT_STATUS.active},
      }).usingConnection(req.dynamic_connection);
      const data = {
        'key' : getKey,
        'value' :  results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active);
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const trainingList = results.map((item)=>({
      training_category_id : item.training_category_id,
      training_id : item.training_id,
      name : item.name
    }));
    return res.ok(trainingList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },
  findEmployeeList: async function (req, res) {
    let results;
    const dbname = (req.dynamic_connection).config.database;
    let sql = `SELECT employee_profile.employee_profile_id, CONCAT(user.first_name,' ',user.last_name) as name, employee_location.location_id, employee_job_type.job_type_id
    FROM ${dbname}.employee_profile
    LEFT JOIN ${dbname}.employee_location ON employee_profile.employee_profile_id = employee_location.employee_profile_id
    LEFT JOIN ${dbname}.employee_job_type ON employee_profile.employee_profile_id = employee_job_type.employee_profile_id
    JOIN ${process.env.DB_NAME}.user ON user.user_id = employee_profile.user_id`
    + ` WHERE ${dbname}.employee_profile.status = '${ACCOUNT_STATUS.active}' AND ${process.env.DB_NAME}.user.status = '${ACCOUNT_STATUS.active}'`;

    const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
    results = rawResult.rows;

    const responseData=[];
    const tmpArr = [];
    results.forEach(data=>{
      if(tmpArr.includes(data.employee_profile_id)){
        let obj = responseData.filter(val=>val.employee_profile_id===data.employee_profile_id);
        if(obj[0].location_id.findIndex(x => x === data.location_id) < 0) {
          obj[0].location_id = [...obj[0].location_id,data.location_id];
        }
        if(obj[0].job_type_id.findIndex(x => x === data.job_type_id) < 0) {
          obj[0].job_type_id = [...obj[0].job_type_id,data.job_type_id];
        }
      }else{
        responseData.push({
          name                : data.name,
          user_id             : data.user_id,
          task_status         : data.task_status,
          employee_profile_id : data.employee_profile_id,
          location_id         : [data.location_id],
          job_type_id         : [data.job_type_id],
        });
        tmpArr.push(data.employee_profile_id);
      }
    });

    return res.ok(responseData, messages.GET_USERS, RESPONSE_STATUS.success);
  },
  findGrades: async function (_req, res) {
    let results;
    const getKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.grades}`;
    let grades = await getCache(getKey);
    if((grades.status === RESPONSE_STATUS.success) && (grades.data !== null))
    {
      results = grades.data;
    }
    else{
      results = await Grade.find({
        where : {status : GRADE_STATUS.active},
      });
      const data = {
        'key' : getKey,
        'value' :  results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === GRADE_STATUS.active);
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const gradeList = results.map((item)=>({
      grade_id : item.grade_id,
      name : item.name,
      icon_name : item.icon_name
    }));
    return res.ok(gradeList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },
  findJobTypesByEmployeeId: async function (req, res) {
    try {
      let results;
      const isValid = JobTypeValidations.employeeIdParamValidation.validate(req.allParams());
      if (!isValid.error) {
        const employeeProfileId = req.params.id;
        const jobTypeDetails = await EmpJobType.find({employee_profile_id:employeeProfileId}).usingConnection(req.dynamic_connection);
        if(jobTypeDetails && jobTypeDetails.length > 0) {
          const jobTypeIds = jobTypeDetails.map((x) => x.job_type_id);
          results = await JobType.find({job_type_id:jobTypeIds}).usingConnection(req.dynamic_connection);
          await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
          const jobTypeList = results.map((item)=>({
            job_type_id : item.job_type_id,
            name : item.name,
            color : item.color
          }));
          return res.ok(jobTypeList, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          return res.ok(results, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        return res.ok(isValid.error, messages.GET_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch (err) {
      sails.log('err',err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  findTrainingsByJobTypeAndTrainingCategory: async function (req, res) {
    try {
      let results;
      const isValid = TrainingValidations.jobTypeAndTrainingCategory.validate(req.allParams());
      if (!isValid.error) {
        const { job_type_id, training_category_id } = req.allParams();
        let filter = {status:ACCOUNT_STATUS.active};
        if(job_type_id > 0){
          const trainingJobTypes = await TrainingJobType.find({job_type_id:job_type_id}).usingConnection(req.dynamic_connection);
          if(trainingJobTypes.length > 0){
            const trainingIds = trainingJobTypes.map((x) => x.training_id);
            filter.training_id = trainingIds;
          } else {
            return res.ok(results, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
          }
        }
        await trainingCateId(training_category_id,filter);
        results = await Training.find(filter).usingConnection(req.dynamic_connection);
        if(results.length > 0){
          let numbersRegex = /^\d/;
          let resultStartWithNumber = results.filter((item) => numbersRegex.test(item.name)).map((value) => value);
          let array = [];
          if(resultStartWithNumber !== null && resultStartWithNumber.length > 0) {
            array = resultStartWithNumber.map((item)=>({
              key : item.training_id,
              value : item.name,
              numberVal : getNumbers(item.name),
            }));
          }
          
          let orderByNumber = array.sort((a, b) => a.numberVal - b.numberVal);
        
          const startWithNumber = orderByNumber.map((item)=>({
            training_id : item.key,
            name : item.value
          }));

          let resultStartWithString = results.filter((item) => !numbersRegex.test(item.name)).map((value) => value);
          
          let orderByString = await resultStartWithString.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));

          const startWithString = orderByString.map((item)=>({
            training_id : item.training_id,
            name : item.name
          }));

          const trainingList = startWithNumber.concat(startWithString);

          return res.ok(trainingList, messages.GET_RECORD, RESPONSE_STATUS.success);
        }
        return res.ok(results, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      } else {
        return res.ok(isValid.error, messages.GET_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch (err) {
      sails.log('err',err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  findInteractionFactor: async function(req, res){
    let results;
    const accountDetail = req.account;
    const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.interactionFactor}`;
    const interactionFactor = await getCache(getKey);
    if((interactionFactor.status === RESPONSE_STATUS.success) && (interactionFactor.data !== null))
    {
      results = interactionFactor.data;
    }
    else{
      results = await InteractionFactor.find({
        where : {status : ACCOUNT_STATUS.active},
      }).populate('weighted_tier_id').usingConnection(req.dynamic_connection);
      const data = {
        'key' : getKey,
        'value' :  results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active);
    await results.sort((a, b) => {
      return (parseInt(b.weighted_tier_score) - parseInt(a.weighted_tier_score)) || (a.name.normalize().localeCompare(b.name.normalize()));  });
    const interactionFactorList = results.map((item)=>({
      interaction_factor_id : item.interaction_factor_id,
      name : item.name
    }));
    return res.ok(interactionFactorList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },
  findTrainingsByJobTypes: async function (req, res) {
    try {
      let results;
      const isValid = JobTypeValidations.jobTypeIds.validate(req.allParams());
      if (!isValid.error) {
        const { jobTypeIds } = req.allParams();
        let filterJobType = { };
        let filter = { status: ACCOUNT_STATUS.active};
        if(jobTypeIds.length > 0) {
          filterJobType.job_type_id = jobTypeIds.map((jobtypeId) => parseInt(jobtypeId));
        }

        const trainingJobTypes = await TrainingJobType.find(filterJobType).usingConnection(req.dynamic_connection);
        if(trainingJobTypes.length > 0){
          const trainingIds = trainingJobTypes.map((x) => x.training_id);
          filter.training_id = trainingIds;
        } else {
          return res.ok(results, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }

        results = await Training.find(filter).usingConnection(req.dynamic_connection);
        if(results.length > 0){
          await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
          const trainingList = results.map((item)=>{
            return{
              training_category_id : item.training_category_id,
              training_id : item.training_id,
              name : item.name
            };
          });
          return res.ok(trainingList, messages.GET_RECORD, RESPONSE_STATUS.success);
        }
      }
    }
    catch (err) {
      sails.log('err',err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  findQuestionType: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.questionType}`;
    let  questionType = await getCache(getKey);
    if((questionType.status === RESPONSE_STATUS.success) && (questionType.data !== null))
    {
      results = questionType.data;
    }
    else{
      results = await QuestionType.find({
        where: { status: ACCOUNT_STATUS.active },
      }).usingConnection(req.dynamic_connection);
      const data = {
        'key'   : getKey,
        'value' :  results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active);
    const questionTypeList = results.map((item) => ({
      question_type_id : item.question_type_id,
      title            : item.title,
      field_type       : item.field_type
    }));
    return res.ok(questionTypeList,messages.GET_RECORD,RESPONSE_STATUS.success);
  },
  findRelation: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.relation}`;
    let relation = await getCache(getKey);
    if(relation && relation.status === RESPONSE_STATUS.success && relation.data !== null && relation.data.length > 0)    
    {
      results = relation.data;
    }
    else{
      results = await Relation.find({
        sort :  [{relation_id :  'ASC'}]
      }).usingConnection(req.dynamic_connection);
      const data = {
        'key'   : getKey,
        'value' :  results
      };
      await setCache(data);
    }   
    const relationList = results.map((item) => ({
      relation_id    : item.relation_id,
      relation_name  : item.relation_name,
      relation_value : item.relation_value
    }));
    return res.ok(relationList,messages.GET_RECORD,RESPONSE_STATUS.success);
  },
  run:  bulkImportCron,
  trigger: async function (_req, res){
    await bulkImportCron();
    return res.ok(undefined,'Triggered SuccessFully',RESPONSE_STATUS.success);
  }
};
