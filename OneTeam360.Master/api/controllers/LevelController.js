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
const LevelValidations = require('../validations/LevelValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  ACCOUNT_STATUS, RESPONSE_STATUS, MASTERINFO_STATUS } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const sql = `SELECT level.level_id, level.level, level.range, level.description, level.point_range_from, level.point_range_to, level.name, level.status, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = level.created_by) as created_by,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = level.last_updated_by) as last_updated_by, level.created_date, level.last_updated_date from level ORDER BY level.level_id ASC `;

const getLevelCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.level}`;
  let levelKeyExists = await keyExists(getKey);
  if(levelKeyExists === 1)
  {
    await deleteCache(getKey);
  }
  const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
  let  results = rawResult.rows;
  const data = {
    'key'   : getKey,
    'value' : results
  };
  await setCache(data);
  return results.map((item)=>({
    level_id : item.level_id,
    name : item.name,
    level:item.level,
    description : (item.description) ? (item.description) : '',
    point_range_from : (item.point_range_from),
    point_range_to : (item.point_range_to),
    range : item.range,
    status: item.status,
    created_by : (item.created_by) ? (item.created_by) : '',
    created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const recalculateLevelsForEmployees = async (req) => {
  let result = await sails.sendNativeQuery(`CALL LevelUpdation("${getDateUTC()}");`).usingConnection(req.dynamic_connection);
  sails.log('LevelUpdation Output',result);
  return result;
};

const findLevelData=async(findLevel,req)=>{
  let previousSequence1;
  for(const item of findLevel)
  {
    if(item.level_id > req.params.id)
    {
      if(item.level !==1)
      {
        previousSequence1 = await Level.findOne({and: [
          { level : ((item.level)-1) },
          { status : 'Active' }
        ]}).usingConnection(req.dynamic_connection);
        return Level.update({level_id : item.level_id},{
          point_range_from :  (previousSequence1.point_range_to)+1,
          point_range_to :  (previousSequence1.point_range_to)+(item.range)
        }).fetch().usingConnection(req.dynamic_connection);
      } 
    }
  }  
};

const resData=async(results,req)=>{
  return results.map((item)=>({
    level_id : item.level_id,
    level:item.level,
    name : item.name,
    description : item.description ? item.description : '',
    point_range_from : (item.point_range_from),
    point_range_to : (item.point_range_to),
    range : item.range,
    status: item.status,
    created_by : (item.created_by) ? (item.created_by) : '',
    created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const itemLevelCondition=async(item,req,level_id)=>{
  if(item.level_id > level_id)
  {
    return Level.update({level_id : item.level_id},{
      level: (item.level)+1,
    }).fetch().usingConnection(req.dynamic_connection);
  }
};

const levelUpdateData=async(req,level_id)=>{
  let previousSequence;
  let points_range_from=0;
  const findLevelUpdated = await Level.find().usingConnection(req.dynamic_connection);
  for(const item of findLevelUpdated)
  {
    if(item.level_id > level_id)
    {
      if(item.level ===1)
      {
        points_range_from=  points_range_from+item.range;
        sails.log(points_range_from);
      }
      if(item.level !== 1)
      {
        previousSequence = await Level.findOne({
          and: [
            { level : ((item.level)-1) },
            { status : 'Active' }
          ]}).usingConnection(req.dynamic_connection);
      }
      return Level.update({level_id : item.level_id},{
        point_range_from :  (previousSequence.point_range_to)+1,
        point_range_to :  (previousSequence.point_range_to)+(item.range)
      }).fetch().usingConnection(req.dynamic_connection);
    }
  }
};

const levelData=async(findLevel,level_id,req)=>{
  for(const item of findLevel)
  {
    if(item.level_id > level_id)
    {
      if(item.level !== 1)
      {
        return Level.update({level_id : item.level_id},{
          level: (item.level)-1,
        }).fetch().usingConnection(req.dynamic_connection);
      }
    }
  }
};

const findLevelUpdatedData=async(item,level_id,req,points_range_from,points_range_to)=>{
  let previousSequence1;
  if(item.level_id > level_id)
  {
    if(item.level ===1)
    {
      points_range_from =0;
      points_range_to = points_range_from+item.range;
    }
    if(item.level !== 1)
    {
      previousSequence1 = await Level.findOne({
        and: [
          { level : ((item.level)-1) },
          { status : 'Active' }
        ]}).usingConnection(req.dynamic_connection);
      points_range_from =  (previousSequence1.point_range_to)+1;
      points_range_to =  (previousSequence1.point_range_to)+(item.range);
    }
    return Level.update({level_id : item.level_id},{
      point_range_from : points_range_from,
      point_range_to :  points_range_to
    }).fetch().usingConnection(req.dynamic_connection);
    
  }
};

module.exports = {
  add: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await LevelValidations.add.validate(request);
      if (!isValidate.error) {
        const { name, description, range, points_range_from, points_range_to } = request;
        const level= await Level.findOne({ name }).usingConnection(req.dynamic_connection);
        if (level) {
          return res.ok(undefined, messages.LEVEL_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const sqlQuery = `select level_id, row_number() over ( order by point_range_to desc) level from level where status = 'Active' order by point_range_to desc`;
          const rawResult = await sails.sendNativeQuery(sqlQuery).usingConnection(req.dynamic_connection);
          let sequence;
          if((rawResult.rows.length) === 0)
          {
            sequence = parseInt(0+1);
          }
          else{
            sequence = parseInt(((rawResult.rows).length)+1);
          }
          await Level.create({
            level: sequence,
            name,
            description,
            range,
            point_range_from : points_range_from,
            point_range_to : points_range_to,
            status: ACCOUNT_STATUS.active,
            created_by : req.user.user_id,
            created_date: getDateUTC(),
            last_updated_by : null
          }).fetch().usingConnection(req.dynamic_connection);
          await getLevelCache(req);
          await recalculateLevelsForEmployees(req);
          return res.ok(undefined, messages.ADD_LEVEL_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.ADD_LEVEL_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.ADD_LEVEL_FAILED, RESPONSE_STATUS.error);
    }
  },

  edit:async function (req, res) {
    try{
      let request = req.allParams();
      const isValidate = await LevelValidations.edit.validate(request);
      if (!isValidate.error) {
        const { name, description, range, points_range_from, points_range_to } = request;
        const level = await Level.findOne({ 
          name, 
          level_id: { '!=': req.params.id }
        }).usingConnection(req.dynamic_connection);
        {if (level) {
          return res.ok(undefined, messages.LEVEL_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const levelIdData = await Level.findOne({ 
            level_id:  req.params.id
          }).usingConnection(req.dynamic_connection);
          if((levelIdData.point_range_from === points_range_from) && (levelIdData.point_range_to === points_range_to)){
            await Level.update({ level_id: req.params.id },
              {
                name,
                description,
                last_updated_by : req.user.user_id,
                last_updated_date: getDateUTC()
              }).fetch().usingConnection(req.dynamic_connection);      
          }
          else{
            await Level.update({ level_id: req.params.id },
              {
                name,
                description,
                range,
                sequence :levelIdData.sequence,
                point_range_from : points_range_from,
                point_range_to : points_range_to,
                last_updated_by : req.user.user_id,
                last_updated_date: getDateUTC()
              }).fetch().usingConnection(req.dynamic_connection);
            const findLevel = await Level.find().usingConnection(req.dynamic_connection);
            await findLevelData(findLevel,req);   
          }
          await getLevelCache(req);
          await recalculateLevelsForEmployees(req);
          return res.ok(undefined, messages.UPDATE_LEVEL_SUCCESS, RESPONSE_STATUS.success);
        }}
      }
      else
      {
        res.ok(isValidate.error, messages.UPDATE_LEVEL_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.UPDATE_LEVEL_FAILURE, RESPONSE_STATUS.error);
    }
  },

  find: async function (req, res) {
    try{
      let results;
      const accountDetail = req.account;
      const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.level}`;
      let levels = await getCache(getKey);
      if((levels.status === RESPONSE_STATUS.success) && (levels.data !== null))
      {
        results = levels.data;
      }
      else{
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        const data = {
          'key' : getKey,
          'value' :  results
        };
        await setCache(data);
      }
      if(results)
      {
        let levelList=  await resData(results,req);
        let data = {
          totalCount : levelList.length,
          results    : levelList
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

  findById : async function (req, res) {
    try{
      const level_id = parseInt(req.params.id);
      const item = await Level.findOne({ level_id}).usingConnection(req.dynamic_connection);
      if(item)
      {
        let levelList ={
          level_id : item.level_id,
          name : item.name,
          level: item.level,
          range : item.range,
          description : (item.description) ? (item.description) : '',
          points_range_from : (item.point_range_from),
          points_range_to : (item.point_range_to),
          status: item.status
        };
        return res.ok(levelList, messages.GET_RECORD, RESPONSE_STATUS.success);
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

  updateStatus: async (req, res) => {
    try
    {
      const isValidate = LevelValidations.updateStatus.validate(req.allParams());
      if (!isValidate.error) {
        const level_id = req.params.id;
        const { status } = req.allParams();
        let resMessage;
        await Level.update({ level_id },{
          status,
          last_updated_by : req.user.user_id,
          last_updated_date    : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        if(status === ACCOUNT_STATUS.active)
        {
          resMessage = messages.LEVEL_ACTIVATED;
          const getCurrentlevel = await Level.findOne({ level_id}).usingConnection(req.dynamic_connection);
          sails.log(getCurrentlevel);
          const findLevel = await Level.find().usingConnection(req.dynamic_connection);
          for(const item of findLevel)
          {
            await itemLevelCondition(item,req,level_id);
          } 
          await levelUpdateData(req,level_id);
        }
        else
        {
          resMessage = messages.LEVEL_INACTIVATED;
          const getCurrentlevel = await Level.findOne({ level_id}).usingConnection(req.dynamic_connection);
          sails.log(getCurrentlevel);
          const findLevel = await Level.find().usingConnection(req.dynamic_connection);
          await levelData(findLevel,level_id,req);
          
          const findLevelUpdated = await Level.find().usingConnection(req.dynamic_connection);
          let points_range_from; let points_range_to;
          for(const item of findLevelUpdated)
          {
            await findLevelUpdatedData(item,level_id,req,points_range_from,points_range_to);
          }
        }
        await getLevelCache(req);
        await recalculateLevelsForEmployees(req);
        return res.ok(undefined, resMessage, RESPONSE_STATUS.success);
      } else {
        return res.ok(isValidate.error, messages.LEVEL_STATUS_UPDATE_FAIL,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.LEVEL_STATUS_UPDATE_FAIL, RESPONSE_STATUS.error);
    }
  },

  findMaxRange : async(req, res) => {
    try { 
      const maxRange = await Level.find({
        where:  {status : ACCOUNT_STATUS.active},
        sort  : 'point_range_to DESC',
        limit :1
      }).usingConnection(req.dynamic_connection);
      let maxRangeCount;
      if(maxRange.length > 0)
      {
        maxRangeCount = parseInt((maxRange[0].point_range_to)+1);
      }
      else{
        maxRangeCount = 0;
      }
      return res.ok({maxRange : maxRangeCount}, messages.GET_RECORD, RESPONSE_STATUS.success);
    }
    catch(error){
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  }
};
