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
const TaskTypeValidations = require('../validations/TaskTypeValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  RESPONSE_STATUS, ACCOUNT_STATUS, MASTERINFO_STATUS } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const sql = `Select task_type.task_type_id, task_type.name, task_type.description, task_type.status, task_type.is_default, task_type.created_date, task_type.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = task_type.created_by) as created_by,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = task_type.last_updated_by) as last_updated_by from task_type ORDER BY task_type.created_date DESC`;

const getTaskTypeCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.tasktype}`;
  let tasktypeKeyExists = await keyExists(getKey);
  if(tasktypeKeyExists === 1)
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
    task_type_id : item.task_type_id,
    name : item.name,
    description : (item.description) ? (item.description) : '',
    status: item.status,
    is_default: item.is_default,
    created_by : (item.created_by) ? (item.created_by) : '',
    created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const taskTypListDatas=async(results,req)=>{
  return results.map((item)=>{
    return {
      task_type_id : item.task_type_id,
      name : item.name,
      description : (item.description) ? (item.description) : '',
      status: item.status,
      is_default: item.is_default,
      created_by : (item.created_by) ? (item.created_by) : '',
      created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
      last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
      last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
    };
  });
};

module.exports = {
  add: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await TaskTypeValidations.add.validate(request);
      if (!isValidate.error) {
        const { name, description } = request;
        const taskType = await TaskType.findOne({ name }).usingConnection(req.dynamic_connection);
        if (taskType) {
          return res.ok(undefined, messages.TASK_TYPE_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          await TaskType.create({
            name,
            description,
            status: ACCOUNT_STATUS.active,
            created_by : req.user.user_id,
            created_date: getDateUTC(),
            last_updated_by : null
          }).fetch().usingConnection(req.dynamic_connection);
          await getTaskTypeCache(req);
          return res.ok(undefined, messages.ADD_TASK_TYPE_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.ADD_TASK_TYPE_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.ADD_TASK_TYPE_FAILURE, RESPONSE_STATUS.error);
    }
  },

  edit:async function (req, res) {
    try{
      let request = req.allParams();
      const isValidate = await TaskTypeValidations.edit.validate(request);
      if (!isValidate.error) {
        const { name, description } = request;
        const taskType = await TaskType.findOne({ 
          name, 
          task_type_id: { '!=': req.params.id }
        }).usingConnection(req.dynamic_connection);
        if (taskType) {
          return res.ok(undefined, messages.TASK_TYPE_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          await TaskType.update({ task_type_id: req.params.id },
            {
              name,
              description,
              last_updated_by : req.user.user_id,
              last_updated_date: getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
          await getTaskTypeCache(req);
          return res.ok(undefined, messages.UPDATE_TASK_TYPE_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.UPDATE_TASK_TYPE_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.UPDATE_TASK_TYPE_FAILURE, RESPONSE_STATUS.error);
    }
  },

  find: async function (req, res) {
    try{
      let results;
      const accountDetail = req.account;
      const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.tasktype}`;
      let  tasktypes = await getCache(getKey);
      if ((tasktypes.status === RESPONSE_STATUS.success) && (tasktypes.data !== null)) {
        results = tasktypes.data;
      }
      else {
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        const data = {
          'key': getKey,
          'value': results
        };
        await setCache(data);
      }
      if(results)
      {
        results = await results.filter(data1 => !data1.is_default);
        const taskTypeList = await taskTypListDatas(results,req);
        let data = {
          totalCount : taskTypeList.length,
          results    : taskTypeList
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
      const task_type_id = parseInt(req.params.id);
      const results = await TaskType.findOne({ task_type_id}).usingConnection(req.dynamic_connection);
      if(results)
      {
        let taskTypeList ={
          task_type_id : results.task_type_id,
          name : results.name,
          description : (results.description) ? (results.description) : '',
          status: results.status,
        };
        return res.ok(taskTypeList, messages.GET_RECORD, RESPONSE_STATUS.success);
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

  activateTask: async (req, res) => {
    const isValidate = TaskTypeValidations.updateStatus.validate(req.allParams());
    if (!isValidate.error) {
      const taskTypeId = req.params.id;
      const { status} = req.allParams();
      let resMessage;
      if(status === ACCOUNT_STATUS.active)
      {
        resMessage = messages.TASK_TYPE_ACTIVATE_SUCEESS;
      }
      else
      {
        resMessage = messages.TASK_TYPE_INACTIVATE_SUCEESS;
      }
      await TaskType.update({ task_type_id : taskTypeId },{
        status,
        last_updated_by : req.user.user_id,
        last_updated_date    : getDateUTC()
      }).usingConnection(req.dynamic_connection);
      await getTaskTypeCache(req);
      return res.ok(undefined, resMessage, RESPONSE_STATUS.success);  
    } else {
      return res.ok(isValidate.error, messages.TASK_TYPE_ACTIVATE_FAIL,RESPONSE_STATUS.error);
    }
  },
};
