/* eslint-disable no-trailing-spaces */
/* eslint-disable key-spacing */
/* eslint-disable camelcase */
/***************************************************************************

  Controller     : User

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
const CountryValidations = require('../validations/CountryStateValidations');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const { ACCOUNT_STATUS, RESPONSE_STATUS, MASTERINFO_STATUS, ACCOUNT_CONFIG_CODE } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');

const refreshData = async function (req, _tenantId, accountGuid){
  
  //location
  const locationsql = `SELECT location.location_id, location.name, location.parent_location_id, location.address_1, location.address_2, location.zip, location.status, city.name as city, country.name as country, state.name as state, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = location.created_by) as created_by,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = location.last_updated_by) as last_updated_by, location.created_date, location.last_updated_date from location INNER JOIN ${process.env.DB_NAME}.country ON location.country_id = country.country_id INNER JOIN ${process.env.DB_NAME}.state ON location.state_id = state.state_id INNER JOIN ${process.env.DB_NAME}.city ON location.city_id = city.city_id ORDER BY  location.created_date DESC`;
  const getlocationKey =`${accountGuid}_${MASTERINFO_STATUS.location}`;
  let locationKeyExists = await keyExists(getlocationKey);
  if(locationKeyExists === 1)
  {
    await deleteCache(getlocationKey);
  }
  const rawResult = await sails.sendNativeQuery(locationsql).usingConnection(req.dynamic_connection);
  let resultLocation = rawResult.rows;
  const dataLocation = {
    'key'   : getlocationKey,
    'value' : resultLocation
  };
  await setCache(dataLocation);
        
  //job-type
  const jobsql = `Select JT.job_type_id, JT.name, JT.color,JT.description, JT.status, JT.created_date, JT.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = JT.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = JT.last_updated_by) as last_updated_by FROM job_type as JT ORDER BY JT.created_date DESC`;
  const getjobKey =`${accountGuid}_${MASTERINFO_STATUS.jobtype}`;
  let jobtypeKeyExists = await keyExists(getjobKey);
  if(jobtypeKeyExists === 1)
  {
    await deleteCache(getjobKey);
  }
  const rawResultjob = await sails.sendNativeQuery(jobsql).usingConnection(req.dynamic_connection);
  let resultJob = rawResultjob.rows;
  const dataJob = {
    'key'   : getjobKey,
    'value' : resultJob
  };
  await setCache(dataJob);
        
  //level
  const levelsql = `SELECT level.level_id, level.level, level.range, level.description, level.point_range_from, level.point_range_to, level.name, level.status, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = level.created_by) as created_by,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = level.last_updated_by) as last_updated_by, level.created_date, level.last_updated_date from level ORDER BY level.created_date DESC`;
  const getKeyLevel =`${accountGuid}_${MASTERINFO_STATUS.level}`;
  let levelKeyExists = await keyExists(getKeyLevel);
  if(levelKeyExists === 1)
  {
    await deleteCache(getKeyLevel);
  }
  const rawResultLevel = await sails.sendNativeQuery(levelsql).usingConnection(req.dynamic_connection);
  let resultLevel = rawResultLevel.rows;
  const dataLevel = {
    'key'   : getKeyLevel,
    'value' : resultLevel
  };
  await setCache(dataLevel);

  //note-tpe
  const notesql = `SELECT note_type.note_type_id, note_type.name, note_type.description, note_type.status, note_type.is_default , impact_multiplier.name as impact_multiplier, weighted_tier.name as weighted_tier, note_type.created_date, note_type.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = note_type.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = note_type.last_updated_by) as last_updated_by FROM note_type INNER JOIN ${process.env.DB_NAME}.weighted_tier ON note_type.weighted_tier_id = weighted_tier.weighted_tier_id INNER JOIN ${process.env.DB_NAME}.impact_multiplier ON note_type.impact_multiplier_id = impact_multiplier.impact_multiplier_id ORDER BY  note_type.created_date DESC`;
  const getKeyNote =`${accountGuid}_${MASTERINFO_STATUS.notetype}`;
  let notetypeKeyExists = await keyExists(getKeyNote);
  if(notetypeKeyExists === 1)
  {
    await deleteCache(getKeyNote);
  }
  const rawResultNote = await sails.sendNativeQuery(notesql).usingConnection(req.dynamic_connection);
  let resultNote = rawResultNote.rows;
  const dataNote = {
    'key'   : getKeyNote,
    'value' : resultNote
  };
  await setCache(dataNote);

  //role
  const getKeyRole =`${accountGuid}_${MASTERINFO_STATUS.role}`;
  notetypeKeyExists = await keyExists(getKeyRole);
  if(notetypeKeyExists === 1)
  {
    await deleteCache(getKeyRole);
  }
  let  resultRole = await Role.find({is_admin_role : false}).usingConnection(req.dynamic_connection);
  const dataRole = {
    'key'   : getKeyRole,
    'value' : resultRole
  };
  await setCache(dataRole);
        
  //certificateType
  const sqlCertificate = `
            Select CRT.certificate_type_id,CRT.job_type_id,job_type.name as job_type_name,job_type.color as job_type_color,CRT.name,CRT.description,CRT.status,CRT.created_date,CRT.last_updated_date, 
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
              LEFT JOIN job_type
                ON job_type.job_type_id = CRT.job_type_id
            ORDER BY CRT.created_date DESC
          `;
  const getKeyCertificate =`${accountGuid}_${MASTERINFO_STATUS.certificatetype}`;
  let crttypeKeyExists = await keyExists(getKeyCertificate);
  if(crttypeKeyExists === 1)
  {
    await deleteCache(getKeyCertificate);
  }
  const rawResultCertificate = await sails.sendNativeQuery(sqlCertificate).usingConnection(req.dynamic_connection);
  let  resultsCertificate = rawResultCertificate.rows;
  const dataCertificate = {
    'key'   : getKeyCertificate,
    'value' : resultsCertificate
  };
  await setCache(dataCertificate);

  //interaction factor
  const sqlInteration = `Select  interaction_factor_id, interaction_factor.name, weighted_tier.name as weighted_tier, weighted_tier.score as weighted_tier_score, (select GROUP_CONCAT( CONCAT(job_type.color, " | ", job_type.name) SEPARATOR ",") FROM job_type JOIN interaction_factor_job_type ON job_type.job_type_id=interaction_factor_job_type.job_type_id WHERE interaction_factor_job_type.interaction_factor_id = interaction_factor.interaction_factor_id  ) as job_type, interaction_factor.description, interaction_factor.status, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = interaction_factor.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = interaction_factor.last_updated_by) as last_updated_by, interaction_factor.created_date, interaction_factor.last_updated_date FROM interaction_factor JOIN ${process.env.DB_NAME}.weighted_tier ON  interaction_factor.weighted_tier_id = weighted_tier.weighted_tier_id ORDER BY interaction_factor.created_date DESC`;
  const getKeyInteration =`${accountGuid}_${MASTERINFO_STATUS.interactionFactor}`;
  let interactionKeyExists = await keyExists(getKeyInteration);
  if(interactionKeyExists === 1)
  {
    await deleteCache(getKeyInteration);
  }
  const rawResultInteration = await sails.sendNativeQuery(sqlInteration).usingConnection(req.dynamic_connection);
  let resultsInteration = rawResultInteration.rows;
  const dataInteration = {
    'key'   : getKeyInteration,
    'value' : resultsInteration
  };
  await setCache(dataInteration);

  //tasktype
  const sqlTaskType = `Select task_type.task_type_id, task_type.name, task_type.description, task_type.status, task_type.is_default, task_type.created_date, task_type.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = task_type.created_by) as created_by,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = task_type.last_updated_by) as last_updated_by from task_type ORDER BY task_type.created_date DESC`;
  const getKeyTaskType =`${accountGuid}_${MASTERINFO_STATUS.tasktype}`;
  let tasktypeKeyExists = await keyExists(getKeyTaskType);
  if(tasktypeKeyExists === 1)
  {
    await deleteCache(getKeyTaskType);
  }
  const rawResultTaskType = await sails.sendNativeQuery(sqlTaskType).usingConnection(req.dynamic_connection);
  let resultsTaskType = rawResultTaskType.rows;
  const dataTaskType = {
    'key'   : getKeyTaskType,
    'value' : resultsTaskType
  };
  await setCache(dataTaskType);


  //trainingCategory
  const sqlCategory = `Select TC.training_category_id, TC.name, TC.training_category_id, weighted_tier.name as weighted_tier, TC.name, TC.description, TC.status, TC.created_date, TC.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = TC.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = TC.last_updated_by) as last_updated_by FROM training_category as TC INNER JOIN ${process.env.DB_NAME}.weighted_tier ON weighted_tier.weighted_tier_id = TC.weighted_tier_id ORDER BY TC.created_date DESC`;
  const getKeyCategory = `${accountGuid}_${MASTERINFO_STATUS.trainingCategory}`;
  let  trainingCategoryKeyExists = await keyExists(getKeyCategory);
  if (trainingCategoryKeyExists === 1) {
    await deleteCache(getKeyCategory);
  }
  const rawResultCategory = await sails.sendNativeQuery(sqlCategory).usingConnection(req.dynamic_connection);
  let  resultsCategory = rawResultCategory.rows;
  const dataCategory = {
    key: getKeyCategory,
    value: resultsCategory,
  };
  await setCache(dataCategory);

  //training
  const sqlTraining = `Select training.training_id, training.status, training.name, training.description, training_category.name as training_category, training.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = training.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = training.last_updated_by) as last_updated_by, training.created_date,(select  GROUP_CONCAT( JT.name SEPARATOR "," ) FROM job_type JT, training_job_type WHERE JT.job_type_id =  training_job_type.job_type_id AND training.training_id = training_job_type.training_id) as job_type from training join training_category ON training.training_category_id = training_category.training_category_id  ORDER BY training.created_date DESC`;
  const getTrainingKey = `${accountGuid}_${MASTERINFO_STATUS.training}`;
  let TrainingKeyExists = await keyExists(getTrainingKey);
  if(TrainingKeyExists === 1)
  {
    await deleteCache(getTrainingKey);
  }
  const rawResultTraining = await sails.sendNativeQuery(sqlTraining).usingConnection(req.dynamic_connection);
  let  resultTraining = rawResultTraining.rows;
  const dataTraining = {
    'key'   : getTrainingKey,
    'value' : resultTraining
  };
  await setCache(dataTraining);
  return true;
};

const accountResultData=async(accountResults)=>{
  accountResults.map(async (item) => {
    let  AccountKeyExists = await keyExists(`${item.account_guid}_${MASTERINFO_STATUS.account}`);
    if(AccountKeyExists === 1)
    {
      await deleteCache(`${item.account_guid}_${MASTERINFO_STATUS.account}`);
    }
    const dataAccount = {
      'key' : `${item.account_guid}_${MASTERINFO_STATUS.account}`,
      'value' : item
    };
    await setCache(dataAccount);
  });
};

const accounArrayDatas=async(accountIds,results)=>{
  return accountIds ? accountIds.map(id => {
    let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
    let accId=id;
    tenant_db_connection_string=tenant_db_connection_string ? tenant_db_connection_string.value : '';
    return {
      accId,tenant_db_connection_string
    };
  })  : [];
};

module.exports = {
  findCountry: async function (_req, res) {
    let results;
    const getKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.country}`;
    let country = await getCache(getKey);
    if((country.status === RESPONSE_STATUS.success) && (country.data !== null))
    {
      results = country.data;
    }
    else{
      results = await Country.find({
        where : {status : ACCOUNT_STATUS.active},
        sort :  [{name :  'ASC'}]
      });
      const data = {
        'key' : getKey,
        'value' :  results
      };
      await setCache(data);
    }
    const countryList = results.map((item)=>({
      country_id : item.country_id,
      name : item.name,
      country_code :item.country_code
    }));
    return res.ok(countryList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  findStateById: async function (req, res) {
    let request = req.allParams();
    const isValidate = await CountryValidations.idParamValidation.validate(request);
    if (!isValidate.error) {
      let results;
      const getKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.state}`;
      let state = await getCache(getKey);
      if((state.status === RESPONSE_STATUS.success) && (state.data !== null))
      {
        results = state.data;
      }
      else{
        results = await State.find({
          where : {status : ACCOUNT_STATUS.active},
          sort :  [{name :  'ASC'}]
        });
        const data = {
          'key' :getKey,
          'value' :  results
        };
        await setCache(data);
      }
      const result = await results.filter( (obj) => 
        obj.country_id === parseInt(req.params.id)
      );
      const stateList = result.map((item)=>({
        state_id : item.state_id,
        name : item.name,
        state_code: item.state_code
      }));
      return res.ok(stateList, messages.GET_RECORD, RESPONSE_STATUS.success);
    } else {
      res.ok(isValidate.error, messages.INVALID_PARAMETER, RESPONSE_STATUS.error);
    }
  },

  findCityByStateId: async function (req, res) {
    let request = req.allParams();
    const isValidate = await CountryValidations.idParamValidation.validate(request);
    if (!isValidate.error) {
      let results;
      results = await City.find({
        where : {state_id : req.params.id, status : ACCOUNT_STATUS.active},
        sort :  [{name :  'ASC'}]
      });
      const cityList = results.map((item)=>({
        city_id : item.city_id,
        name : item.name
      }));
      return res.ok(cityList, messages.GET_RECORD, RESPONSE_STATUS.success);
    } else {
      res.ok(isValidate.error, messages.INVALID_PARAMETER, RESPONSE_STATUS.error);
    }
  },

  findLocation: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.location}`;
    let locations = await getCache(getKey);
    if((locations.status === RESPONSE_STATUS.success) && (locations.data !== null))
    {
      results = locations.data;
    }
    else{
      const sql = `SELECT location.location_id, location.name, location.parent_location_id, location.address_1, location.address_2, location.zip, location.status, city.name as city, country.name as country, state.name as state, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = location.created_by) as created_by,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = location.last_updated_by) as last_updated_by, location.created_date, location.last_updated_date from location INNER JOIN ${process.env.DB_NAME}.country ON location.country_id = country.country_id INNER JOIN ${process.env.DB_NAME}.state ON location.state_id = state.state_id INNER JOIN ${process.env.DB_NAME}.city ON location.city_id = city.city_id ORDER BY  location.created_date DESC`;
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      results = rawResult.rows;
      const data = {
        'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.location}`,
        'value' :  results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active);
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const locationList = results.map((item)=>({
      location_id : item.location_id,
      name : item.name
    }));
    return res.ok(locationList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  findRole: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.role}`;
    let roles = await getCache(getKey);
    if((roles.status === RESPONSE_STATUS.success) && (roles.data !== null))
    {
      results = roles.data;
    }
    else{
      results = await Role.find().usingConnection(req.dynamic_connection);
      const data = {
        'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.role}`,
        'value' :  results
      };
      await setCache(data);
    }
    
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active);
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const roleList = results.map((item)=>({
      role_id : item.role_id,
      name : item.name
    }));
    return res.ok(roleList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  findLevel: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.level}`;
    let  levels = await getCache(getKey);
    if((levels.status === RESPONSE_STATUS.success) && (levels.data !== null))
    {
      results = levels.data;
    }
    else{
      results = await Level.find({
        where : {status : ACCOUNT_STATUS.active}, 
      }).usingConnection(req.dynamic_connection);
      const data = {
        'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.level}`,
        'value' :  results
      };
      await setCache(data);
    }
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const levelList = results.map((item)=>({
      level_id: item.level_id,
      level: item.level,
      name: item.name
    }));
    
    return res.ok(levelList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  findJobType: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.jobtype}`;
    let jobtypes = await getCache(getKey);
    if((jobtypes.status === RESPONSE_STATUS.success) && (jobtypes.data !== null))
    {
      results = jobtypes.data;
    }
    else{
      results = await JobType.find({
        where : {status : ACCOUNT_STATUS.active},
      }).usingConnection(req.dynamic_connection);
      const data = {
        'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.jobtype}`,
        'value' :  results
      };
      await setCache(data);
    }
    results = await results.filter(data => data.status === ACCOUNT_STATUS.active);
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));

    const jobTypeList = results.map((item)=>({
      job_type_id : item.job_type_id,
      name : item.name,
      color: item.color
    }));
    return res.ok(jobTypeList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  findWeightedTier : async function (_req, res) {
    let results;
    const getKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.weightedTier}`;
    let  weightedTier = await getCache(getKey);
    if((weightedTier.status === RESPONSE_STATUS.success) && (weightedTier.data !== null))
    {
      results = weightedTier.data;
    }
    else{
      results = await WeightedTier.find({
        where : {status : ACCOUNT_STATUS.active}, 
        sort  : 'score DESC'
      });
      const data = {
        'key' : getKey,
        'value' :  results
      };
      await setCache(data);
    }
    await results;
    const weightedTierList = results.map((item)=>({
      weighted_tier_id : item.weighted_tier_id,
      name : item.name
    }));
    return res.ok(weightedTierList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  findImpactMultiplier : async function (_req, res) {
    let results;
    const getKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.impactMultiplier}`;
    let impactMultiplier = await getCache(getKey);
    if((impactMultiplier.status === RESPONSE_STATUS.success) && (impactMultiplier.data !== null))
    {
      results = impactMultiplier.data;
    }
    else{
      results = await ImpactMultiplier.find({
        where : {
          status : ACCOUNT_STATUS.active,
          name : { '!': ['CheckInApproved','ReportSubmission'] }
        }, 
        sort  : 'score DESC'
      });
      const data = {
        'key' : getKey,
        'value' :  results
      };
      await setCache(data);
    }
    await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const impactMultiplierList = results.map((item)=>({
      impact_multiplier_id : item.impact_multiplier_id,
      name : item.name
    }));
    return res.ok(impactMultiplierList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  findNotificationTemplate : async function (req, res) {
    const code = req.query.code;
    const type = req.query.type;
    let request = { code, type };
    const isValidate = await CountryValidations.findNotificationTemplate.validate(request);
    if (!isValidate.error) {
      let results;
      const accountDetail = req.account;
      const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.notificationtemplate}`;
      let notificationtemplates = await getCache(getKey);
      if((notificationtemplates.status === RESPONSE_STATUS.success) && (notificationtemplates.data !== null))
      {
        results = notificationtemplates.data;
      }
      else{
        results = await NotificationTemplate.find({
          where : {status : ACCOUNT_STATUS.active}
        }).usingConnection(req.dynamic_connection);
        const data = {
          'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.notificationtemplate}`,
          'value' :  results
        };
        await setCache(data);
      }
      const result =  await results.filter(obj =>
        obj.code === code && obj.notification_type === type
      );
      const notificationList = result.map((item)=>({
        notification_template_id : item.notification_template_id,
        name : item.name
      }));
      return res.ok(notificationList, messages.GET_RECORD, RESPONSE_STATUS.success);
    }
    else{
      res.ok(isValidate.error, messages.REGISTER_FAILURE, RESPONSE_STATUS.error);
    }
  },

  findTraining: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.training}`;
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
      training_id : item.training_id,
      name : item.name
    }));
    return res.ok(trainingList, messages.GET_RECORD, RESPONSE_STATUS.success);
  },

  refreshMasteCacheData: async function (_req, res) { 
    try{
      //account cache
      const sqlAccount = `Select distinct account.account_id, account_guid, account.name, account.email, address, onboard_status, account.status, 
      ac.account_configuration_id,  
      (select GROUP_CONCAT(acgd.code SEPARATOR ",") FROM account_configuration_detail acgd 
      WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_code,
      (select GROUP_CONCAT(acgd.value SEPARATOR ",") FROM account_configuration_detail acgd 
      WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_value
      from account 
      INNER JOIN account_configuration ac ON account.account_id = ac.account_id `;
      const rawAccount = await sails.sendNativeQuery(sqlAccount);
      const accountResults = rawAccount.rows;
      if(accountResults.length > 0)
      {
        accountResults.map(async (item) => {
          const getAccountKey = `${item.account_guid}_${MASTERINFO_STATUS.account}`;
          let AccountKeyExists = await keyExists(getAccountKey);
          if(AccountKeyExists === 1)
          {
            await deleteCache(getAccountKey);
          }
          const dataAccount = {
            'key' : `${item.account_guid}_${MASTERINFO_STATUS.account}`,
            'value' : item
          };
          await setCache(dataAccount);
        });
      }

      //country
      const getCountryKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.country}`;
      let CountryKeyExists = await keyExists(getCountryKey);
      if(CountryKeyExists === 1)
      {
        await deleteCache(getCountryKey);
      }
      const results = await Country.find({
        where : {status : ACCOUNT_STATUS.active},
        sort :  [{name :  'ASC'}]
      });
      const dataCountry = {
        'key'   : getCountryKey,
        'value' : results
      };
      await setCache(dataCountry);

      //state
      const getStateKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.state}`;
      let  StateKeyExists = await keyExists(getStateKey);
      if(StateKeyExists === 1)
      {
        await deleteCache(getStateKey);
      }
      const resultState = await State.find({
        where : {status : ACCOUNT_STATUS.active},
        sort :  [{name :  'ASC'}]
      });
      const dataState = {
        'key'   : getStateKey,
        'value' : resultState
      };
      await setCache(dataState);


      //weighted-tier
      const getweightedKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.weightedTier}`;
      let WeightedKeyExists = await keyExists(getweightedKey);
      if(WeightedKeyExists === 1)
      {
        await deleteCache(getweightedKey);
      }
      const resultweighted = await WeightedTier.find({
        where : {status : ACCOUNT_STATUS.active}, 
        sort  : 'score DESC'
      });
      const dataWeighted = {
        'key' : getweightedKey,
        'value' :  resultweighted
      };
      await setCache(dataWeighted);
    
      //impact-mulitiplier
      const getmulitiplierKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.impactMultiplier}`;
      let  mulitiplierKeyExists = await keyExists(getmulitiplierKey);
      if(mulitiplierKeyExists === 1)
      {
        await deleteCache(getmulitiplierKey);
      }
      const resultsMultiplier = await ImpactMultiplier.find({
        where : {status : ACCOUNT_STATUS.active}, 
        sort  : 'score DESC'
      });
      const dataImpact = {
        'key' : getmulitiplierKey,
        'value' :  resultsMultiplier
      };
      await setCache(dataImpact);


      //grades
      const getKey =  `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.grades}`;
      let  KeyExists = await keyExists(getKey);
      if(KeyExists === 1)
      {
        await deleteCache(getKey);
      }
      const resultsGrade = await Grade.find({
        where : {status : ACCOUNT_STATUS.active}, 
      });
      const data = {
        'key' : getKey,
        'value' :  resultsGrade
      };
      await setCache(data);
      res.ok(undefined, messages.REFRESH_CACHE, RESPONSE_STATUS.success);
    }
    catch(error)
    {
      sails.log(error);
      res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  },

  refreshSpecificTenantCacheData: async function (req, res) {
    try{
      const tenantId = req.params.id;
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
        account_configuration_detail.code IN ($1,$2,$3,$4,$5,$6,$7) and account.status = $8 and account.account_id = $9;`;

      const rawResult = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.deduct_points_for_negative_performance,ACCOUNT_CONFIG_CODE.threshold_score_for_points_calculation,ACCOUNT_CONFIG_CODE.additional_points_for_points_calculation, ACCOUNT_STATUS.active, tenantId]);
      const results = rawResult.rows;
      let accountIds = [...new Set(results.map(item => item.account_id))];
      let accountArray = accountIds ? accountIds.map(id => {

        let tenant_db_connection_string = results.find(a => a.account_id === id && a.code === ACCOUNT_CONFIG_CODE.tenant_db_connection_string);
        return {
          account_id                               : id,
          tenant_db_connection_string              : tenant_db_connection_string ? tenant_db_connection_string.value : ''
        };
      })  : [];

      for(const item of accountArray)
      {

        if(!item.tenant_db_connection_string) {continue;}

        // Tenant specific database connection
        let connectionString = item.tenant_db_connection_string;
        // Grab the MySQL module from the datastore instance
        let rdi = sails.getDatastore('default');
        let mysql = rdi.driver.mysql;
        let tenantConnection = await  mysql.createConnection(connectionString);
        await tenantConnection.connect();
        
        const accountDetails = await Account.findOne({ account_id : tenantId});
        if(accountDetails)
        {
          await refreshData({
            dynamic_connection: tenantConnection
          }, tenantId, accountDetails.account_guid);
        }
        if(tenantConnection){
          await tenantConnection.end();
        }
      }
      res.ok(undefined, messages.REFRESH_CACHE, RESPONSE_STATUS.success);
    }
    catch(error)
    {
      sails.log(error);
      res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  },

  refreshAllTenantData:async function (_req, res) {
    try{
      //account cache
      const sqlAccount = `Select distinct account.account_id, account_guid, account.name, account.email, address, onboard_status, account.status, 
      ac.account_configuration_id,  
      (select GROUP_CONCAT(acgd.code SEPARATOR ",") FROM account_configuration_detail acgd 
      WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_code,
      (select GROUP_CONCAT(acgd.value SEPARATOR ",") FROM account_configuration_detail acgd 
      WHERE acgd.account_configuration_id = ac.account_configuration_id AND (acgd.code= '${ACCOUNT_CONFIG_CODE.tenant_db_connection_string}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.time_zone}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_time_format}' OR acgd.code= '${ACCOUNT_CONFIG_CODE.date_format}')) as account_value
      from account 
      INNER JOIN account_configuration ac ON account.account_id = ac.account_id `;
      const rawAccount = await sails.sendNativeQuery(sqlAccount);
      const accountResults = rawAccount.rows;
      if(accountResults.length > 0)
      {
        await accountResultData(accountResults);
      }

      //country
      const getCountryKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.country}`;
      let CountryKeyExists = await keyExists(getCountryKey);
      if(CountryKeyExists === 1)
      {
        await deleteCache(getCountryKey);
      }
      const resultsCountry = await Country.find({
        where : {status : ACCOUNT_STATUS.active},
        sort :  [{name :  'ASC'}]
      });
      const dataCountry = {
        'key'   : getCountryKey,
        'value' : resultsCountry
      };
      await setCache(dataCountry);

      //state
      const getStateKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.state}`;
      let StateKeyExists = await keyExists(getStateKey);
      if(StateKeyExists === 1)
      {
        await deleteCache(getStateKey);
      }
      const resultState = await State.find({
        where : {status : ACCOUNT_STATUS.active},
        sort :  [{name :  'ASC'}]
      });
      const dataState = {
        'key'   : getStateKey,
        'value' : resultState
      };
      await setCache(dataState);


      //weighted-tier
      const getweightedKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.weightedTier}`;
      let  WeightedKeyExists = await keyExists(getweightedKey);
      if(WeightedKeyExists === 1)
      {
        await deleteCache(getweightedKey);
      }
      const resultweighted = await WeightedTier.find({
        where : {status : ACCOUNT_STATUS.active}, 
        sort  : 'score DESC'
      });
      const dataWeighted = {
        'key' : getweightedKey,
        'value' :  resultweighted
      };
      await setCache(dataWeighted);
    
      //impact-mulitiplier
      const getmulitiplierKey = `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.impactMultiplier}`;
      let  mulitiplierKeyExists = await keyExists(getmulitiplierKey);
      if(mulitiplierKeyExists === 1)
      {
        await deleteCache(getmulitiplierKey);
      }
      const resultsMultiplier = await ImpactMultiplier.find({
        where : {status : ACCOUNT_STATUS.active}, 
        sort  : 'score DESC'
      });
      const dataImpact = {
        'key' : getmulitiplierKey,
        'value' :  resultsMultiplier
      };
      await setCache(dataImpact);


      //grades
      const getKey =  `${process.env.REDIS_MASTER_PREFIX}_${MASTERINFO_STATUS.grades}`;
      let KeyExists = await keyExists(getKey);
      if(KeyExists === 1)
      {
        await deleteCache(getKey);
      }
      const resultsGrade = await Grade.find({
        where : {status : ACCOUNT_STATUS.active}, 
      });
      const data = {
        'key' : getKey,
        'value' :  resultsGrade
      };
      await setCache(data);
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
        account_configuration_detail.code IN ($1,$2,$3,$4,$5,$6,$7) and account.status = $8 ;`;

      const rawResult = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.tenant_db_connection_string,ACCOUNT_CONFIG_CODE.time_zone,ACCOUNT_CONFIG_CODE.date_time_format,ACCOUNT_CONFIG_CODE.date_format,ACCOUNT_CONFIG_CODE.deduct_points_for_negative_performance,ACCOUNT_CONFIG_CODE.threshold_score_for_points_calculation,ACCOUNT_CONFIG_CODE.additional_points_for_points_calculation, ACCOUNT_STATUS.active]);
      const results = rawResult.rows;
      let accountIds = [...new Set(results.map(item => item.account_id))];
      let accountArray = await accounArrayDatas(accountIds,results);

      for(const item of accountArray)
      {

        if(!item.tenant_db_connection_string) {continue;}

        // Tenant specific database connection
        let connectionString = item.tenant_db_connection_string;
        // Grab the MySQL module from the datastore instance
        let rdi = sails.getDatastore('default');
        let mysql = rdi.driver.mysql;
        let tenantConnection = await  mysql.createConnection(connectionString);
        await tenantConnection.connect();
        
        const accountDetails = await Account.findOne({ account_id : tenantId});
        if(accountDetails)
        {
          await refreshData({
            dynamic_connection: tenantConnection
          }, item.account_id, accountDetails.account_guid);
        } 
        if(tenantConnection){
          await tenantConnection.end();
        }
      }
      res.ok(undefined, messages.REFRESH_CACHE, RESPONSE_STATUS.success);
    }
    catch(error)
    {
      sails.log(error);
      res.ok(undefined, messages.SERVER_ERROR, RESPONSE_STATUS.error);
    }
  }

};
