
/***************************************************************************

  Controller     : Role

  **************************************************

***************************************************************************/
const moment = require('moment');
const messages = sails.config.globals.messages;
const RoleValidations = require('../validations/RoleValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const { NOTIFICATION_ENTITIES, RESPONSE_STATUS, ACCOUNT_STATUS, MASTERINFO_STATUS } = require('../utils/constants/enums');
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const { sendNotification } = require('../services/sendNotification');

const sql = `Select rl.role_id, rl.name, rl.description, rl.status, rl.created_date, 
(select count(distinct employee_profile_id) from employee_profile where status ='Active' AND employee_profile
.role_id = rl.role_id) as assigned_user_count,
rl.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y 
WHERE y.user_id = rl.created_by) as created_by,
(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = 
rl.last_updated_by) as last_updated_by from role as rl LEFT JOIN ${process.env.DB_NAME}.user as created_role ON rl.created_by = created_role.user_id LEFT JOIN ${process.env.DB_NAME}.user as updated_role ON rl.last_updated_by = updated_role.user_id `;

const getRoleCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.role}`;
  let tasktypeKeyExists = await keyExists(getKey);
  if(tasktypeKeyExists === 1)
  {
    await deleteCache(getKey);
  }
  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  let results = rawResult.rows;
  const data = {
    'key'   : getKey,
    'value' : results
  };
  await setCache(data);
  return results.map((item)=>({
    role_id             : item.role_id,
    name                : item.name,
    description         : (item.description) ? (item.description) : '',
    status              : item.status,
    assigned_user_count : item.assigned_user_count,
    created_by          : (item.created_by) ? (item.created_by) : '',
    created_date        : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by     : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date   : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const finalData=async(checkExists,req,respMessage,status,roleId,res)=>{
  if(checkExists){
    await Role.update({role_id: roleId},{
      status,
      last_updated_by   : req.user.user_id,
      last_updated_date : getDateUTC()
    }).usingConnection(req.dynamic_connection);
    await getRoleCache(req);
    return res.ok(undefined, respMessage,RESPONSE_STATUS.success);
  }else{
    return res.ok(undefined, messages.ROLE_NOT_FOUND,RESPONSE_STATUS.error);
  }
};

module.exports = {
  find: async function (req, res) {
    try{
      let nativePayload= [];
      const isValidate = await RoleValidations.list.validate(req.allParams());
      if(!isValidate.error) {
        const {  sortField, sortOrder } = req.allParams();
        const {andCondition, skip, rows} = await commonListing(req.allParams());
        let results;
        let sql12 = `Select rl.role_id, rl.name, rl.description, rl.status, rl.created_date, 
        (select count(distinct employee_profile_id) from employee_profile where status ='Active' AND employee_profile
        .role_id = rl.role_id) as assigned_user_count,
        rl.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y 
        WHERE y.user_id = rl.created_by) as created_by,
        (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = 
        rl.last_updated_by) as last_updated_by from role as rl LEFT JOIN ${process.env.DB_NAME}.user as created_role ON rl.created_by = created_role.user_id LEFT JOIN ${process.env.DB_NAME}.user as updated_role ON rl.last_updated_by = updated_role.user_id `;
        if ((andCondition).length > 0) {
          sql12 = sql12 + ` WHERE `;
          for (const data of andCondition) {
            Object.keys(data).forEach((prop) => {
              if ((prop === 'name') && (data[prop] !== '')) {
                sql12 = sql12 + `  rl.name LIKE '%${escapeSearch(data[prop])}%'`;
                nativePayload.push(data[prop]);
              }
              if ((prop === 'description') && (data[prop] !== '')) {
                if (nativePayload.length > 0) {
                  sql12 = sql12 + ` AND rl.description LIKE '%${escapeSearch(data[prop])}%'`;
                }
                else {
                  sql12 = sql12 + ` rl.description LIKE '%${escapeSearch(data[prop])}%'`;
                }
                nativePayload.push(data[prop]);
              }
              if ((prop === 'created_by') && (data[prop] !== '')) {
                if (nativePayload.length > 0) {
                  sql12 = sql12 + ` AND (concat(created_role.first_name,' ', created_role.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
                }
                else {
                  sql12 = sql12 + ` (concat(created_role.first_name,' ', created_role.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
                }
                nativePayload.push(data[prop]);
              }
              if ((prop === 'last_updated_by') && (data[prop] !== '')) {
                if (nativePayload.length > 0) {
                  sql12 = sql12 + ` AND (CONCAT(updated_role.first_name, " ", updated_role.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
                }
                else {
                  sql12 = sql12 + ` ( CONCAT(updated_role.first_name, " ", updated_role.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
                }
                nativePayload.push(data[prop]);
              }
              if ((prop === 'status') && (data[prop] !== '')) {
                if (nativePayload.length > 0) {
                  sql12 = sql12 + ` AND rl.status = '${data[prop]}' `;
                }
                else {
                  sql12 = sql12 + ` rl.status = '${data[prop]}' `;
                }
                nativePayload.push(data[prop]);
              }
              if ((prop === 'created_date') && (data[prop] !== '')) {
                const createdDate = moment(data[prop]).format('YYYY-MM-DD');
                if (nativePayload.length > 0) {
                  sql12 = sql12 + ` AND (date(rl.created_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
                }
                else {
                  sql12 = sql12 + ` (date(rl.created_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
                }
                nativePayload.push(data[prop]);
              }
              if ((prop === 'last_updated_date') && (data[prop] !== '')) {
                const createdDate = moment(data[prop]).utc().format('YYYY-MM-DD');
                if (nativePayload.length > 0) {
                  sql12 = sql12 + ` AND (date(rl.last_updated_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
                }
                else {
                  sql12 = sql12 + ` (date(rl.last_updated_date) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
                }
                nativePayload.push(data[prop]);
              }
            });
          }
        }

        if(sortField && sortOrder){

          if(sortField === 'name') {sql12 += ` ORDER BY rl.status ASC,date(rl.created_date) DESC, rl.name ${sortOrder} `;}
          else if(sortField === 'created_date') {sql12 += ` ORDER BY rl.status ASC,date(rl.created_date) ${sortOrder} `;}
          else if(sortField === 'description') {sql12 += ` ORDER BY rl.status ASC,date(rl.created_date) DESC, rl.description ${sortOrder} `;}
          else if(sortField === 'status') {sql12 += ` ORDER BY rl.status ${sortOrder},date(rl.created_date) DESC `;}
          else if(sortField === 'last_updated_date') {sql12 += ` ORDER BY rl.status ASC,date(rl.created_date) DESC,rl.last_updated_date ${sortOrder} `;}
          else if(sortField === 'assigned_user_count') {sql12 += ` ORDER BY  rl.status ASC,date(rl.created_date) DESC,(select count(distinct employee_profile_id) from employee_profile where status ='Active' AND employee_profile
        .role_id = rl.role_id) ${sortOrder} `;}
          else if(sortField === 'created_by') {sql12 += ` ORDER BY rl.status ASC,date(rl.created_date) DESC, (concat(created_role.first_name,' ', created_role.last_name)) ${sortOrder} `;}
          else if(sortField === 'last_updated_by') {sql12 += ` ORDER BY rl.status ASC,date(rl.created_date) DESC, (concat(updated_role.first_name,' ', updated_role.last_name)) ${sortOrder} `;}

        }
        else{
          sql12 += `ORDER BY rl.created_date DESC, rl.status ASC `;
        }
        if(skip !== undefined && rows !== undefined){
          sql12 += `LIMIT $1 OFFSET $2 `;
        }
        sails.log(sql12);
        const countQuery = sql12.split('LIMIT ');
        const countRawResult = await sails.sendNativeQuery(`${escapeSqlSearch(countQuery[0])};`,[  Number(rows), Number(skip)]).usingConnection(req.dynamic_connection);

        let count = countRawResult.rows;

        const rawResult = await sails.sendNativeQuery(`${escapeSqlSearch(sql12)};`,[Number(rows),Number(skip)]).usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        if(results)
        {
          const roleList = results.map((item)=>{
            return { role_id             : item.role_id,
              name                : item.name,
              description         : (item.description) ? (item.description) : '',
              status              : item.status,
              assigned_user_count : item.assigned_user_count,
              created_by          : (item.created_by) ? (item.created_by) : '',
              created_date        : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
              last_updated_by     : (item.last_updated_by) ? (item.last_updated_by) : '',
              last_updated_date   : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',};
          });
          let data = {
            totalCount : count.length,
            results    : roleList
          };
          return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
        }
        else{
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      }
      else{
        return res.ok(isValidate.error, messages.GET_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  updateStatus: async (req, res) => {
    try{
      const isValid = RoleValidations.updateStatus.validate(req.allParams());
      if (!isValid.error) {
        const roleId = req.params.id;
        const { status} = req.allParams();
        let canUpdate = true;
        let respMessage = messages.ROLE_ACTIVATED;
        if(status === ACCOUNT_STATUS.inactive ){
          const roleDetails = await EmployeeProfile.find({role_id: roleId}).usingConnection(req.dynamic_connection);
          if(roleDetails && roleDetails.length > 0){
            canUpdate = false;
            sails.log(canUpdate);
            respMessage = messages.ROLE_ASSOCIATED_MSG.replace(/STR_TO_BE_REPLACE/, roleDetails.length);
            return res.ok(undefined, respMessage, RESPONSE_STATUS.warning);
          }else{
            respMessage = messages.ROLE_INACTIVATED;
          }
        }
        if(canUpdate){
          sails.log('canUpdate',canUpdate);
          const checkExists = await Role.findOne({role_id: roleId}).usingConnection(req.dynamic_connection);
          await finalData(checkExists,req,respMessage,status,roleId,res);
        }else{
          return res.ok(undefined, respMessage,RESPONSE_STATUS.error);
        }

      } else {
        return res.ok(isValid.error, messages.ROLE_STATUS_UPDATE_FAIL,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.ROLE_STATUS_UPDATE_FAIL,RESPONSE_STATUS.error);
    }
  },

  modulePermissionList: async (req, res) =>{
    try{
      const module = await PermissionModule.find({status: ACCOUNT_STATUS.active}).sort('sequence ASC').usingConnection(req.dynamic_connection);
      let modules = [];
      if(module.length > 0)
      {
        for(const key of module){
          const permissions = await Permission.find({ permission_module_id: key.permission_module_id}).sort('sequence ASC').usingConnection(req.dynamic_connection);
          if(permissions.length > 0)
          {
            let permission = [];
            for(const item of permissions)
            {
              permission.push({
                'permission_id'        : item.permission_id,
                'permission_module_id' : item.permission_module_id,
                'parent_permission_id' : item.parent_permission_id,
                'name'                 : item.name,
                'code'                 : item.code,
                'description'          : item.description,
                'sequence'             : item.sequence,
              });
            }
            modules.push({
              'module'      : key.name,
              'module_id'   : key.permission_module_id,
              'sequence'    : key.sequence,
              'code'        : key.code,
              'permissions' : permission
            });
          }
        }
        return res.ok(modules, messages.GET_RECORD, RESPONSE_STATUS.success);
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

  add: async (req, res) => {
    try{
      const isValid = RoleValidations.add.validate(req.allParams());
      if (!isValid.error) {
        const { name, description, dashboard, permissions_ids, page } = req.allParams();
        const roles = await Role.findOne({ name }).usingConnection(req.dynamic_connection);
        if (roles) {
          return res.ok(undefined, messages.ROLE_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const role = await Role.create({
            name,
            description,
            dashboard,
            status          : ACCOUNT_STATUS.active,
            created_by      : req.user.user_id,
            created_date    : getDateUTC(),
            last_updated_by : null
          }).fetch().usingConnection(req.dynamic_connection);
          await getRoleCache(req);
          const roleList = permissions_ids.map((permission) =>
          {
            return {
              role_id         : role.role_id,
              permission_id   : permission,
              status          : ACCOUNT_STATUS.active,
              created_by      : req.user.user_id,
              created_date    : getDateUTC(),
              last_updated_by : null
            };
          });
          if (roleList.length > 0) {
            await RolePermission.createEach(roleList).usingConnection(req.dynamic_connection);
          }
          if(page === 'clone')
          {
            return res.ok(undefined, messages.CLONE_ROLE_SUCCESS, RESPONSE_STATUS.success);
          }
          else{
            return res.ok(undefined, messages.ADD_ROLE_SUCCESS, RESPONSE_STATUS.success);
          }
        }
      }else {
        return res.ok(isValid.error, messages.INVALID_PARAMETER,RESPONSE_STATUS.error);
      }
    }
    catch(error){
      sails.log.error(error);
      return res.ok(undefined, messages.SERVER_ERROR,RESPONSE_STATUS.error);
    }
  },

  findById: async (req, res) =>{
    try{
      const isValid = RoleValidations.idParamValidation.validate(req.allParams());
      if(!isValid.error)
      {
        const result = await RolePermission.find({
          role_id: req.params.id
        }).populate('role_id').populate('permission_id').usingConnection(req.dynamic_connection);
        let permission = [];
        if(result.length > 0)
        {
          const response = result.map((item)=>{
            permission.push(item.permission_id.permission_id);
            return {
              name        : item.role_id.name,
              description : item.role_id.description,
              dashboard   : item.role_id.dashboard,
              permission  : permission
            };
          });
          return res.ok(response[0], messages.GET_RECORD,RESPONSE_STATUS.success);
        }
        else{
          return res.ok(undefined, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
        }
      }
      else
      {
        return res.ok(isValid.error, messages.INVALID_PARAMETER,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.SERVER_ERROR,RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) =>{
    try{
      const isValid = RoleValidations.edit.validate(req.allParams());
      if(!isValid.error)
      {
        const { name, description, dashboard, permissions_ids } = req.allParams();
        const role = await Role.findOne({
          name,
          role_id: { '!=': req.params.id }
        }).usingConnection(req.dynamic_connection);
        if (role) {
          return res.ok(undefined, messages.ROLE_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          await Role.update({ role_id: req.params.id },
            {
              name,
              description,
              dashboard,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
          await getRoleCache(req);
          // Remove older mapping of role & permission
          await RolePermission.destroy({ role_id: req.params.id }).usingConnection(req.dynamic_connection);

          const roleList = permissions_ids.map((permission) =>
          {
            return {
              role_id         : req.params.id,
              permission_id   : permission,
              status          : ACCOUNT_STATUS.active,
              created_by      : req.user.user_id,
              created_date    : getDateUTC(),
              last_updated_by : null
            };
          });
          if (roleList.length > 0) {
            await RolePermission.createEach(roleList).usingConnection(req.dynamic_connection);
          }

          let device_tokens = `
            SELECT
              user_login_log.login_date_time, user_login_log.user_id, user_login_log.device_id, employee_profile.role_id
              FROM ${process.env.DB_NAME}.user_login_log
              INNER JOIN
                (SELECT MAX(user_login_log.login_date_time) as max_login_date_time, user_id, device_id 
                FROM ${process.env.DB_NAME}.user_login_log
                where thru_mobile = 1 
                GROUP BY user_login_log.user_id ) tbl
              ON 
                user_login_log.login_date_time = tbl.max_login_date_time 
                AND user_login_log.user_id = tbl.user_id 
              INNER JOIN employee_profile
              ON 
                employee_profile.user_id = user_login_log.user_id
              where employee_profile.role_id = $1`;

          const rawResult = await sails.sendNativeQuery(`${device_tokens};`,[req.params.id]).usingConnection(req.dynamic_connection);
          let results = rawResult.rows;
          sails.log('API RESULT', results);

          await sendNotification(null,{ notification_entity: NOTIFICATION_ENTITIES.TRIGGER_PERMISSION_NOTI, tokens: results.map(item => item.device_id) });

          return res.ok(undefined, messages.UPDATE_ROLE_SUCCESS,RESPONSE_STATUS.success);
        }
      }
      else
      {
        return res.ok(isValid.error, messages.UPDATE_ROLE_FAILED,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.SERVER_ERROR,RESPONSE_STATUS.error);
    }
  }
};
