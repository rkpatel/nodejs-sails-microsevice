/* eslint-disable no-trailing-spaces */
/* eslint-disable key-spacing */
/* eslint-disable camelcase */
/***************************************************************************

  Controller     : Job Type

  **************************************************
  Functions
  **************************************************

  add
  edit
  delete
  find
  findById
  **************************************************

***************************************************************************/

const messages = sails.config.globals.messages;
const JobTypeValidations = require('../validations/JobTypeValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  JOB_TYPE_STATUS, RESPONSE_STATUS, MASTERINFO_STATUS, LOCATION_STATUS } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');

const sql = `Select JT.job_type_id, JT.name, JT.color,JT.description, JT.status, JT.created_date, JT.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = JT.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = JT.last_updated_by) as last_updated_by FROM job_type as JT ORDER BY JT.created_date DESC`;
 
const getJobTypeCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.jobtype}`;
  let jobtypeKeyExists = await keyExists(getKey);
  if(jobtypeKeyExists === 1)
  {
    await deleteCache(getKey);
  }
  const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
  let results = rawResult.rows;
  const data = {
    'key'   : getKey,
    'value' : results
  };
  await setCache(data);
  return results.map((item)=>({
    job_type_id : item.job_type_id,
    name : item.name,
    description : (item.description) ? (item.description) : '',
    status: item.status,
    color: item.color,
    created_by : (item.created_by) ? (item.created_by) : '',
    created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const jTypDetails=async (jobTypeDetails,canUpdate,respMessage)=>{
  if(jobTypeDetails && jobTypeDetails.length > 0){
    canUpdate = false;
    sails.log(canUpdate);
    respMessage = messages.JOBT_TYPE_ASSOCIATED_MSG.replace(/STR_TO_BE_REPLACE/, jobTypeDetails.length);
    return res.ok(undefined, respMessage, RESPONSE_STATUS.warning);
  }else{
    respMessage = messages.JOB_TYPE_INACTIVATED;
    sails.log(respMessage);
  }
};

module.exports = {
  add: async (req, res) => {
    const isValid = await JobTypeValidations.addEdit.validate(req.allParams());
    if (!isValid.error) {
      const { name, description,color } = req.allParams();
      const jobTypeDetails = await JobType.findOne({name:name}).usingConnection(req.dynamic_connection);
      if(!jobTypeDetails){
        await JobType.create({
          name,
          description,
          color,
          status          : JOB_TYPE_STATUS.active,
          created_by      : req.user.user_id,
          created_date    : getDateUTC(),
          last_updated_by : null
        }).usingConnection(req.dynamic_connection);
        await getJobTypeCache(req);
        return res.ok(undefined, messages.JOB_TYPE_ADDED_SUCCESS,RESPONSE_STATUS.success);
      }else{
        return res.ok(undefined, messages.JOB_TYPE_ALREADY_EXISTS,RESPONSE_STATUS.warning);
      }  
    } else {
      return res.ok(isValid.error, messages.JOB_TYPE_ADD_FAIL,RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) => {
    const isValid = JobTypeValidations.addEdit.validate(req.allParams());
    if (!isValid.error) {
      if (req.params.id) {
        const jobTypeId = req.params.id;
     
        const { name, description ,color} = req.allParams();
        const jobTypeDetails = await JobType.findOne({name:name,job_type_id:{ '!=': jobTypeId }}).usingConnection(req.dynamic_connection);
        if(!jobTypeDetails)
        {
          await JobType.update({job_type_id:jobTypeId},{
            name,
            description,
            color,
            last_updated_by : req.user.user_id,
            last_updated_date    : getDateUTC()
          }).usingConnection(req.dynamic_connection);
          await getJobTypeCache(req);
          return res.ok(undefined, messages.JOB_TYPE_UPDATE_SUCCESS,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined, messages.JOB_TYPE_ALREADY_EXISTS,RESPONSE_STATUS.warning);
        }  
      }else{
        return res.ok(undefined, messages.PARAMETER_MISSING,RESPONSE_STATUS.error);
      }
    } else {
      return res.ok(isValid.error, messages.JOB_TYPE_UPDATE_FAIL,RESPONSE_STATUS.error);
    }
  },

  updateStatus: async (req, res) => {
    const isValid = JobTypeValidations.updateStatus.validate(req.allParams());
    if (!isValid.error) {
      const jobTypeId = req.params.id;
      const { status} = req.allParams();
      let canUpdate = true;
      let respMessage = messages.JOB_TYPE_ACTIVATED;
      if(status===JOB_TYPE_STATUS.inactive ){
        const jobTypeDetails = await EmpJobType.find({job_type_id:jobTypeId}).usingConnection(req.dynamic_connection);
        await jTypDetails(jobTypeDetails,canUpdate,respMessage);
      }
      if(canUpdate){
        const checkExists = await JobType.findOne({job_type_id:jobTypeId}).usingConnection(req.dynamic_connection);
        if(checkExists){
          await JobType.update({job_type_id:jobTypeId},{
            status,
            last_updated_by : req.user.user_id,
            last_updated_date    : getDateUTC()
          }).usingConnection(req.dynamic_connection);
          await getJobTypeCache(req);
          return res.ok(undefined, respMessage,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined, messages.JOB_TYPE_NOT_FOUND,RESPONSE_STATUS.error);
        }
      }else{
        return res.ok(undefined, respMessage,RESPONSE_STATUS.error);
      }       
    } else {
      return res.ok(isValid.error, messages.JOB_TYPE_STATUS_UPDATE_FAIL,RESPONSE_STATUS.error);
    }
  },

  find: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.jobtype}`;
    let  jobtypes = await getCache(getKey);
    if((jobtypes.status === RESPONSE_STATUS.success) && (jobtypes.data !== null))
    {
      results = jobtypes.data;
    }
    else{
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      results = rawResult.rows; 
      const data2 = {
        'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.jobtype}`,
        'value' :  results
      };
      await setCache(data2);
    }
    const jobTypeDetails = results.map((item)=>{
      return { job_type_id : item.job_type_id,
        name : item.name,
        description : (item.description) ? (item.description) : '',
        status: item.status,
        color: item.color,
        created_by : (item.created_by) ? (item.created_by) : '',
        created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
        last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
        last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : ''
      };
    });
    let data = {
      totalCount : jobTypeDetails.length,
      results    : jobTypeDetails
    };
    if(jobTypeDetails.length > 0){   
      return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
    }else{
      return res.ok(jobTypeDetails, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
    }  
  },

  findById: async function (req, res) {
    const isValid = JobTypeValidations.idParamValidation.validate(req.allParams());
    if (!isValid.error) {    
      const jobTypeId = req.params.id;
      const jobTypeDetails = await JobType.findOne({job_type_id:jobTypeId }).usingConnection(req.dynamic_connection);
      if(jobTypeDetails){
        return res.ok(jobTypeDetails, messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(jobTypeDetails, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
      }  
    } else {
      return res.ok(isValid.error, messages.INVALID_PARAMETER,RESPONSE_STATUS.error);
    }
  }, 

  findJobtypesByLocation: async function (req, res) {
    try{
      let request = req.allParams();
      let employee_profile_id;
      if('employee_profile_id' in request){
        employee_profile_id = request.employee_profile_id;
      }else{
        employee_profile_id = req.token.employee_profile_id;
      }

      let sql_jobtype = `SELECT DISTINCT ejt.job_type_id, jt.name AS jobtype_name, jt.color 
      FROM employee_location AS el
      INNER JOIN employee_job_type AS ejt ON el.employee_profile_id = ejt.employee_profile_id
      INNER JOIN job_type AS jt ON ejt.job_type_id = jt.job_type_id 
      WHERE el.location_id IN(
      SELECT el.location_id
      FROM employee_location AS el
      INNER JOIN location AS lc ON lc.location_id = el.location_id AND lc.status = '${LOCATION_STATUS.active}' 
      WHERE el.employee_profile_id = ${employee_profile_id} ) AND jt.status = '${JOB_TYPE_STATUS.active}' ORDER BY ejt.job_type_id`;
  
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql_jobtype)).usingConnection(req.dynamic_connection);
      let jobTypes = rawResult.rows;
      
      await jobTypes.sort((a, b) => a.jobtype_name.normalize().localeCompare(b.jobtype_name.normalize()));
  
      const jobTypeList = jobTypes.map((item)=>({
        job_type_id : item.job_type_id,
        name : item.jobtype_name,
        color: item.color
      }));

      if (jobTypeList.length > 0) {
        return res.ok(
          jobTypeList,
          messages.GET_RECORD,
          RESPONSE_STATUS.success
        );
      } else {
        return res.ok(
          jobTypeList,
          messages.DATA_NOT_FOUND,
          RESPONSE_STATUS.success
        );
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },
};
