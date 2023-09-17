
/***************************************************************************

  Controller     : Interaction Factor

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
const InteractionFactorValidations = require('../validations/InteractionFactorValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  RESPONSE_STATUS, ACCOUNT_STATUS, MASTERINFO_STATUS } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const sql = `Select  interaction_factor_id, interaction_factor.name, weighted_tier.name as weighted_tier, weighted_tier.score as weighted_tier_score, (select GROUP_CONCAT( CONCAT(job_type.color, " | ", job_type.name) SEPARATOR ",") FROM job_type JOIN interaction_factor_job_type ON job_type.job_type_id=interaction_factor_job_type.job_type_id WHERE interaction_factor_job_type.interaction_factor_id = interaction_factor.interaction_factor_id  ) as job_type, interaction_factor.description, interaction_factor.status, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = interaction_factor.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = interaction_factor.last_updated_by) as last_updated_by, interaction_factor.created_date, interaction_factor.last_updated_date FROM interaction_factor JOIN ${process.env.DB_NAME}.weighted_tier ON  interaction_factor.weighted_tier_id = weighted_tier.weighted_tier_id ORDER BY interaction_factor.created_date DESC`;

const getInteractionFactorCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.interactionFactor}`;
  let interactionKeyExists = await keyExists(getKey);
  if(interactionKeyExists === 1)
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
    name              : item.name,
    description       : (item.description) ? (item.description) : '',
    status            : item.status,
    weighted_tier     : (item.weighted_tier),
    job_type          : (item.job_type),
    created_by        : (item.created_by) ? (item.created_by) : '',
    created_date      : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone) : '',
    last_updated_by   : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone) : '',
  }));
};

const finalRes=async(job_type_ids,InteractionFactorJobType,req,interactionId)=>{
  if(job_type_ids.length >0){
    const job_arr = job_type_ids.map((job) => {
      return {
        interaction_factor_id : interactionId,
        job_type_id           : job,
        created_by            : req.user.user_id,
        created_date          : getDateUTC()
      };
    });
    if (job_arr.length > 0) {
      await InteractionFactorJobType.createEach(job_arr).usingConnection(req.dynamic_connection);
    }
  }
};

const interactionListData=async(results,req)=>{
  return results.map((item)=>({
    interaction_factor_id : item.interaction_factor_id,
    name                  : item.name,
    description           : item.description ? item.description : '',
    status                : item.status,
    weighted_tier         : (item.weighted_tier),
    job_type              : (item.job_type),
    created_by            : item.created_by ? item.created_by : '',
    created_date          : item.created_date ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by       : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date     : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

module.exports = {
  add: async (req, res) => {
    try{
      let request = req.allParams();
      const isValid = await InteractionFactorValidations.add.validate(request);
      if (!isValid.error) {
        const { name, description, weighted_tier_id, job_type_ids } = request;
        const factorDetails = await InteractionFactor.findOne({name}).usingConnection(req.dynamic_connection);
        if(!factorDetails){
          const response = await InteractionFactor.create({
            name,
            description,
            weighted_tier_id,
            status          : ACCOUNT_STATUS.active,
            created_by      : req.user.user_id,
            created_date    : getDateUTC(),
            last_updated_by : null
          }).fetch().usingConnection(req.dynamic_connection);
          if(job_type_ids.length >0){
            const job_arr = job_type_ids.map((job) => {
              return {
                interaction_factor_id : response.interaction_factor_id, job_type_id           : job,
                created_by            : req.user.user_id,
                created_date          : getDateUTC()
              };
            });
            if (job_arr.length > 0) {
              await InteractionFactorJobType.createEach(job_arr).usingConnection(req.dynamic_connection);
            }
          }
          await getInteractionFactorCache(req);

          return res.ok(undefined, messages.INTERACTIONFACTOR_ADD_SUCCESS,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined, messages.INTERACTIONFACTOR_ALREADY_EXISTS,RESPONSE_STATUS.warning);
        }
      } else {
        return res.ok(isValid.error, messages.INTERACTIONFACTOR_ADD_FAIL,RESPONSE_STATUS.error);
      }}
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.INTERACTIONFACTOR_ADD_FAIL,RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) => {
    try{

      const isValid = InteractionFactorValidations.edit.validate(req.allParams());
      if (!isValid.error) {
        if (req.params.id) {
          const interactionId = req.params.id;

          const { name, description, weighted_tier_id, job_type_ids } = req.allParams();
          const details = await InteractionFactor.findOne({name: name,interaction_factor_id: { '!=': interactionId }}).usingConnection(req.dynamic_connection);
          sails.log(details);
          if(!details)
          {
            await InteractionFactor.update({interaction_factor_id: interactionId},{
              name,
              description,
              weighted_tier_id,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC()
            }).usingConnection(req.dynamic_connection);
            await InteractionFactorJobType.destroy({ interaction_factor_id: interactionId }).usingConnection(req.dynamic_connection);
            if(job_type_ids){
              await finalRes(job_type_ids,InteractionFactorJobType,req,interactionId);
            }
            await getInteractionFactorCache(req);
            return res.ok(undefined, messages.INTERACTIONFACTOR_UPDATE_SUCCESS,RESPONSE_STATUS.success);
          }else{
            return res.ok(undefined, messages.INTERACTIONFACTOR_ALREADY_EXISTS,RESPONSE_STATUS.warning);
          }
        }else{
          return res.ok(undefined, messages.INTERACTIONFACTOR_UPDATE_FAIL, RESPONSE_STATUS.error);
        }
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.INTERACTIONFACTOR_UPDATE_FAIL,RESPONSE_STATUS.error);
    }
  },

  find: async (req, res) => {
    try{
      let results;
      const accountDetail = req.account;
      const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.interactionFactor}`;
      let  interactions = await getCache(getKey);
      if((interactions.status === RESPONSE_STATUS.success) && (interactions.data !== null))
      {
        results = interactions.data;
      }
      else{
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        const data = {
          'key'   : getKey,
          'value' : results
        };
        await setCache(data);
      }
      if(results)
      {
        sails.log(results);
        const interactionsList = await interactionListData(results,req);
        let data = {
          totalCount : interactionsList.length,
          results    : interactionsList
        };
        return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  findById: async function (req, res) {
    try{
      const interaction_factor_id = parseInt(req.params.id);
      const results = await InteractionFactor.findOne({ interaction_factor_id }).usingConnection(req.dynamic_connection);
      let interactionList;
      if(results)
      {
        const jobType = await InteractionFactorJobType.find({interaction_factor_id }).populate('job_type_id').usingConnection(req.dynamic_connection);
        if(jobType.length >0)
        {
          interactionList = jobType.map((item)=>({
            color       : item.job_type_id.color,
            job_type_id : item.job_type_id.job_type_id,
            name        : item.job_type_id.name
          }));
        }
        let interactionFactorList ={
          interaction_factor_id : results.interaction_factor_id,
          name                  : results.name,
          description           : (results.description) ? (results.description) : '',
          status                : results.status,
          weighted_tier_id      : results.weighted_tier_id,
          job_type              : (jobType.length > 0) ? interactionList : []
        };
        return res.ok(interactionFactorList, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  updateStatus: async (req, res) =>{
    try { const isValidate = InteractionFactorValidations.updateStatus.validate(req.allParams());
      if (!isValidate.error) {
        const interactionId = req.params.id;
        const { status } = req.allParams();
        let resMessage;
        if(status === ACCOUNT_STATUS.active)
        {
          resMessage = messages.INTERACTIONFACTOR_ACTIVATE_SUCEESS;
        }
        else
        {
          resMessage = messages.INTERACTIONFACTOR_INACTIVATE_SUCEESS;
        }
        await InteractionFactor.update({ interaction_factor_id: interactionId },{
          status,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        await getInteractionFactorCache(req);
        return res.ok(undefined, resMessage, RESPONSE_STATUS.success);
      } else {
        return res.ok(isValidate.error, messages.INTERACTIONFACTOR_ACTIVATE_FAIL,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.INTERACTIONFACTOR_ACTIVATE_FAIL, RESPONSE_STATUS.error);
    }
  },

  findFactorBasedOnJobType: async (req,res) =>{
    try{
      let employee_id = req.params.id;
      const sqlQuery4 = `SELECT GROUP_CONCAT(job_type_id) as job_type FROM employee_job_type WHERE employee_profile_id = ${employee_id}`;
      const rawResult = await sails
      .sendNativeQuery(sqlQuery4)
      .usingConnection(req.dynamic_connection);
      let result = rawResult.rows;
      let job_type_ids;
      if((result.length > 0) && (result[0].job_type !== null)){
        job_type_ids = '(' +result[0].job_type + ')';
      }
      else
      {
        job_type_ids = '(" ")';
      }
      let sqlFactor =`select * from
      (SELECT 
            interaction_factor.interaction_factor_id, weighted_tier.score,
            interaction_factor.status,
            interaction_factor.name as if_name,
            interaction_factor.description
            FROM 
            interaction_factor  join
            interaction_factor_job_type on
            interaction_factor.interaction_factor_id =  interaction_factor_job_type.interaction_factor_id
            INNER JOIN
        ${process.env.DB_NAME}.weighted_tier 
            ON interaction_factor.weighted_tier_id = weighted_tier.weighted_tier_id
            where  interaction_factor.status = 'Active' and interaction_factor_job_type.job_type_id IN ${job_type_ids}
    UNION DISTINCT
        SELECT 
            interaction_factor.interaction_factor_id, weighted_tier.score,
            interaction_factor.status,
            interaction_factor.name as if_name,
            interaction_factor.description
            FROM 
            interaction_factor left join
            interaction_factor_job_type on
            interaction_factor.interaction_factor_id =  interaction_factor_job_type.interaction_factor_id
            INNER JOIN
               ${process.env.DB_NAME}.weighted_tier 
               ON interaction_factor.weighted_tier_id = weighted_tier.weighted_tier_id
            where  interaction_factor.status = 'Active' and interaction_factor.interaction_factor_id NOT IN 
            (Select interaction_factor_id as ifd from interaction_factor_job_type)
    ) as alii ORDER BY alii.score DESC, alii.if_name ASC`;

      const rawResultFactor = await sails.sendNativeQuery(escapeSqlSearch(sqlFactor)).usingConnection(req.dynamic_connection);
      let  results = rawResultFactor.rows;
      if(results.length > 0)
      {
        const interactionFactorList = results.map((item)=>({
          interaction_factor_id : item.interaction_factor_id,
          name                  : item.if_name,
          description           : item.description
        }));
        return res.ok(interactionFactorList, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  }
};


// SELECT DISTINCT
//         interaction_factor.interaction_factor_id,
//         interaction_factor.status,
//         interaction_factor.name as if_name
//         FROM
//         interaction_factor  join
//         interaction_factor_job_type on
//         interaction_factor.interaction_factor_id =  interaction_factor_job_type.interaction_factor_id
//          where  interaction_factor.status = 'Active' and interaction_factor_job_type.job_type_id IN (8)
