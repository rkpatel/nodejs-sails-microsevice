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
const CertificateTypeValidations = require('../validations/CertificateTypeValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  RESPONSE_STATUS, MASTERINFO_STATUS, ACCOUNT_STATUS } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const { assignAutoCertificate } = require('../utils/common/apiCall');

const getJobTypeDetails = async function(req, job_type_ids){
  let results = '';
  let sqlQuery = `SELECT job_type_id, name, color FROM job_type WHERE job_type_id IN (${job_type_ids})`;
  const rawResult = await sails.sendNativeQuery(sqlQuery).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for(let i of results){
    responseData.push({
      job_type_id : i.job_type_id,
      name        : i.name,
      color       : i.color
    });
  }

  return responseData;
};

const getJobTypeNames = async function(req, job_type_ids){
  let results = '';
  let sqlQuery1 = `SELECT GROUP_CONCAT(name SEPARATOR ', ') AS names FROM job_type WHERE job_type_id IN (${job_type_ids})`;
  const rawResult = await sails.sendNativeQuery(sqlQuery1).usingConnection(req.dynamic_connection);
  results = rawResult.rows[0] || null;
  return results.names;
};

const sql = `
    Select CRT.certificate_type_id,CRT.auto_assign,cjt.job_type_id,job_type.name as job_type_name,job_type.color as job_type_color,CRT.name,CRT.description,CRT.status,CRT.created_date,CRT.last_updated_date, 
    (
      select CONCAT(y.first_name, " ", y.last_name) 
      AS name 
      FROM ${process.env.DB_NAME}.user y WHERE y.user_id = CRT.created_by
    ) as created_by,
      (
      select CONCAT(y.first_name, " ", y.last_name) 
      AS name 
      FROM ${process.env.DB_NAME}.user y WHERE y.user_id = CRT.last_updated_by
    ) as last_updated_by 
    FROM certificate_type as CRT 
      LEFT JOIN certificate_job_type AS cjt ON cjt.certificate_type_id = CRT.certificate_type_id
      LEFT JOIN job_type ON job_type.job_type_id = cjt.job_type_id
    ORDER BY CRT.created_date DESC
`;
 
const getCrtTypeCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.certificatetype}`;
  let crttypeKeyExists = await keyExists(getKey);
  if(crttypeKeyExists === 1)
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
    certificate_type_id : item.certificate_type_id,
    job_type_id : item.job_type_id,
    name : item.name,
    description : (item.description) ? (item.description) : '',
    status: item.status,
    auto_assign : item.auto_assign,
    created_by : (item.created_by) ? (item.created_by) : '',
    created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const jobTypes=async(result,req)=>{
  return result.job_types ?  getJobTypeDetails(req, result.job_types) : [];
};

const autoAssign=async(result)=>{
  return result.auto_assign ? true : false;
};

const desc=async(result)=>{
  return result.description ? result.description : '';
};

const createdBy=async(result)=>{
  return result.created_by ? result.created_by : '';
};

const lastUpdatedBy=async(result)=>{
  return result.last_updated_by ? result.last_updated_by : '';
};

const autoAssignExiting=async(auto_assign,assign_existing,req,name,certificate_type_id)=>{
  if(auto_assign && assign_existing){
    assignAutoCertificate(req,{
      certificate_type_id : certificate_type_id,
      certificate_name : name
    });
  }
};

const descData=async(i)=>{
  return (i.description) ? (i.description) : '';
};

const autoAssignData=async(i)=>{
  return i.auto_assign ? true : false;
};

const finalResults=async(results,req,crtTypeDetails)=>{
  for (const i of results) {
    crtTypeDetails.push({
      certificate_type_id : i.certificate_type_id,
      job_type_names : i.job_types ? await getJobTypeNames(req, i.job_types) : '',
      job_types : i.job_types ? await getJobTypeDetails(req, i.job_types) : [],
      name : i.name,
      description : await descData(i),
      status: i.status,
      auto_assign: await autoAssignData(i),
      created_by : (i.created_by) ? `${i.first_name} ${i.last_name}` : '',
      created_date : (i.created_date) ? getDateSpecificTimeZone(i.created_date, req.timezone, req.dateFormat) : '',
      last_updated_by : (i.last_updated_by) ? (i.last_updated_by) : '',
      last_updated_date : (i.last_updated_date) ? getDateSpecificTimeZone(i.last_updated_date, req.timezone, req.dateFormat) : '',
      auto_assign_flag: i.auto_assign ? 'Yes' : 'No',
    });
  }
};
const getCertificate=async(job_types_arr,req)=>{
  if (job_types_arr.length > 0) { await CertificateJobType.createEach(job_types_arr).usingConnection(req.dynamic_connection); }
};

module.exports = {
  add: async (req, res) => {
    try{
      const isValid = await CertificateTypeValidations.addEdit.validate(req.allParams());
      if (!isValid.error) {
        const { name, job_types,description, auto_assign , assign_existing} = req.allParams();
        const certificateTypeDetails = await CertificateType.findOne({ name:name }).usingConnection(req.dynamic_connection);
        if(!certificateTypeDetails){
          const newCertificateType = await CertificateType.create({
            name,
            description,
            auto_assign ,
            status : ACCOUNT_STATUS.active,
            created_by      : req.user.user_id,
            created_date    : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);
          await getCrtTypeCache(req);

          const certificateTypeId = newCertificateType.certificate_type_id;

          const job_types_arr = job_types.map((job_type_id) => { return { certificate_type_id: certificateTypeId, job_type_id: job_type_id, status : ACCOUNT_STATUS.active, created_by: req.user.user_id, created_date: getDateUTC() }; });
          await getCertificate(job_types_arr,req);

          if(auto_assign && assign_existing){
            assignAutoCertificate(req,{
              certificate_type_id : certificateTypeId,
              certificate_name : name
            });
          }

          return res.ok(undefined, messages.CERTIFICATE_TYPE_ADDED_SUCCESS,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined, messages.CERTIFICATE_TYPE_ALREADY_EXISTS,RESPONSE_STATUS.warning);
        }  
      } else {
        return res.ok(isValid.error, messages.CERTIFICATE_TYPE_ADD_FAIL,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.debug(error);
      return res.ok(isValid.error, messages.CERTIFICATE_TYPE_ADD_FAIL,RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) => {
    const isValid = CertificateTypeValidations.addEdit.validate(req.allParams());
    if (!isValid.error) {
      if (req.allParams().certificate_type_id) {
        const { name, description , job_types, certificate_type_id ,auto_assign, assign_existing} = req.allParams();
        const crtTypeDetails = await CertificateType.findOne({ name:name, certificate_type_id:{ '!=': certificate_type_id }}).usingConnection(req.dynamic_connection);
        if(!crtTypeDetails)
        {
          const certificateJobTypes = await CertificateJobType.find({ certificate_type_id: certificate_type_id }).usingConnection(req.dynamic_connection);
          let existingJobTypes = certificateJobTypes.map(x => x.job_type_id);
          let unionJobType = [...new Set([...job_types, ...existingJobTypes])];
          let addJobTypes = unionJobType.filter(x => !existingJobTypes.includes(x));
          let removeJobTypes = unionJobType.filter(x => !job_types.includes(x));
          
          await CertificateType.update({certificate_type_id:certificate_type_id},{
            name,
            description,
            auto_assign,
            last_updated_by : req.user.user_id,
            last_updated_date    : getDateUTC()
          }).usingConnection(req.dynamic_connection);
          await getCrtTypeCache(req);

          const job_types_arr = addJobTypes.map((job_type_id) => { return { certificate_type_id: certificate_type_id, job_type_id: job_type_id, status : ACCOUNT_STATUS.active, created_by: req.user.user_id, created_date: getDateUTC() }; });
          if (job_types_arr.length > 0) { await CertificateJobType.createEach(job_types_arr).usingConnection(req.dynamic_connection); }
          
          await CertificateJobType.destroy({ certificate_type_id: certificate_type_id, job_type_id: { in: removeJobTypes} }).usingConnection(req.dynamic_connection);

          await autoAssignExiting(auto_assign,assign_existing,req,name,certificate_type_id);
        
          return res.ok(undefined, messages.CERTIFICATE_TYPE_UPDATE_SUCCESS,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined, messages.CERTIFICATE_TYPE_ALREADY_EXISTS,RESPONSE_STATUS.warning);
        }
        // }else{
        //   return res.ok(isValid.error, messages.JOB_TYPE_NOT_FOUND,RESPONSE_STATUS.error);
        // }
      }else{
        return res.ok(undefined, messages.PARAMETER_MISSING,RESPONSE_STATUS.error);
      }
    } else {
      return res.ok(isValid.error, messages.CERTIFICATE_TYPE_UPDATE_FAIL,RESPONSE_STATUS.error);
    }
  },

  find: async function (req, res) {
    let results;
    let sqlQuery2 = `SELECT ct.*, first_name, last_name, 
                (SELECT
                  GROUP_CONCAT(job_type_id) AS job_type_id
                  FROM certificate_job_type AS cjt
                  WHERE cjt.certificate_type_id = ct.certificate_type_id) AS job_types
                FROM certificate_type AS ct
                LEFT JOIN ${process.env.DB_NAME}.user 
					        ON user.user_id = ct.created_by`;
    const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sqlQuery2)).usingConnection(req.dynamic_connection);
    results = rawResult.rows;
    let crtTypeDetails = [];
    let data = {};
    if(results)
    {
      await finalResults(results,req,crtTypeDetails);
      data = {
        totalCount : results.length,
        results    : crtTypeDetails
      };
    }
    if(results.length > 0){   
      return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
    }else{
      return res.ok(crtTypeDetails, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
    }  
  },

  findById: async function (req, res) {
    const isValid = CertificateTypeValidations.idParamValidation.validate(req.allParams());
    let result;
    if (!isValid.error) {    
      const {certificate_type_id} = req.allParams();
      let sqlQuery3 = `SELECT ct.*,
                (SELECT
                  GROUP_CONCAT(job_type_id) AS job_type_id
                  FROM certificate_job_type AS cjt
                  WHERE cjt.certificate_type_id = ct.certificate_type_id) AS job_types
                FROM certificate_type AS ct WHERE ct.certificate_type_id = ${certificate_type_id}`;
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sqlQuery3)).usingConnection(req.dynamic_connection);
      result = rawResult.rows[0] || null;
      
      if(result)
      {
        result.job_types =await jobTypes(result,req);
        result.auto_assign=await autoAssign(result);
        result.description =await desc(result);
        result.created_by = await createdBy(result);
        result.created_date = (result.created_date) ? getDateSpecificTimeZone(result.created_date, req.timezone, req.dateFormat) : '';
        result.last_updated_by = await lastUpdatedBy(result);
        result.last_updated_date = (result.last_updated_date) ? getDateSpecificTimeZone(result.last_updated_date, req.timezone, req.dateFormat) : '';
        
        return res.ok(result, messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(result, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
      }  
    } else {
      return res.ok(isValid.error, messages.INVALID_PARAMETER,RESPONSE_STATUS.error);
    }
  },

  updateStatus: async (req, res) => {
    const isValid = CertificateTypeValidations.updateStatus.validate(req.allParams());
    if (!isValid.error) {
      const { certificate_type_id, status} = req.allParams();
      let respMessage = messages.CERTIFICATE_TYPE_ACTIVATED;
      if(status === ACCOUNT_STATUS.inactive ){
        respMessage = messages.CERTIFICATE_TYPE_INACTIVATED;
      } 

      const checkExists = await CertificateType.findOne({certificate_type_id}).usingConnection(req.dynamic_connection);
      if(checkExists){
        await CertificateType.update({certificate_type_id},{
          status,
          last_updated_by : req.user.user_id,
          last_updated_date    : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        await getCrtTypeCache(req);
        return res.ok(undefined, respMessage,RESPONSE_STATUS.success);
      }else{
        return res.ok(undefined, messages.CERTIFICATE_TYPE_NOT_FOUND,RESPONSE_STATUS.error);
      }
      
    } else {
      return res.ok(isValid.error, messages.CERTIFICATE_TYPE_STATUS_UPDATE_FAIL,RESPONSE_STATUS.error);
    }
  },
};
