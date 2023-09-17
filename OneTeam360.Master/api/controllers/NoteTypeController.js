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
const NoteTypeValidations = require('../validations/NoteTypeValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  RESPONSE_STATUS, ACCOUNT_STATUS, MASTERINFO_STATUS } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const sql = `SELECT note_type.note_type_id, note_type.name, note_type.description, note_type.status, note_type.is_default , impact_multiplier.name as impact_multiplier, weighted_tier.name as weighted_tier, note_type.created_date, note_type.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = note_type.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = note_type.last_updated_by) as last_updated_by FROM note_type INNER JOIN ${process.env.DB_NAME}.weighted_tier ON note_type.weighted_tier_id = weighted_tier.weighted_tier_id INNER JOIN ${process.env.DB_NAME}.impact_multiplier ON note_type.impact_multiplier_id = impact_multiplier.impact_multiplier_id ORDER BY  note_type.created_date DESC`;

const getNoteCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.notetype}`;
  let notetypeKeyExists = await keyExists(getKey);
  if(notetypeKeyExists === 1)
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
    note_type_id      : item.note_type_id,
    name              : item.name,
    description       : (item.description) ? (item.description) : '',
    status            : item.status,
    weighted_tier     : item.weighted_tier,
    impact_multiplier : item.impact_multiplier,
    created_by        : (item.created_by) ? (item.created_by) : '',
    created_date      : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by   : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const noteTypData=async(results,req)=>{
  return results.map((item)=>({
    note_type_id      : item.note_type_id,
    name              : item.name,
    description       : (item.description) ? (item.description) : '',
    status            : item.status,
    weighted_tier     : item.weighted_tier,
    is_default        : item.is_default,
    impact_multiplier : item.impact_multiplier,
    created_by        : (item.created_by) ? (item.created_by) : '',
    created_date      : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone,  req.dateFormat) : '',
    last_updated_by   : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

module.exports = {
  add: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await NoteTypeValidations.add.validate(request);
      if (!isValidate.error) {
        let IsDefaultNotetype;
        const { name, description, weighted_tier_id, impact_multiplier_id, send_notification, notify_management_user } = request;
        const noteType = await NoteType.findOne({ name }).usingConnection(req.dynamic_connection);
        if (noteType) {
          return res.ok(undefined, messages.NOTE_TYPE_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const defaultNotetype = await NoteType.findOne({ is_default: true}).usingConnection(req.dynamic_connection);
          if(defaultNotetype)
          {
            IsDefaultNotetype = false;
          }
          else{
            IsDefaultNotetype = true;
          }
          const newNoteTye = await NoteType.create({
            name,
            description,
            weighted_tier_id,
            impact_multiplier_id,
            is_default      : IsDefaultNotetype,
            send_notification,
            notify_management_user,
            status          : ACCOUNT_STATUS.active,
            created_by      : req.user.user_id,
            created_date    : getDateUTC(),
            last_updated_by : null
          }).fetch().usingConnection(req.dynamic_connection);
          await getNoteCache(req);
          const noteTypeId = newNoteTye.note_type_id;
          return res.ok({ 'note_type_id': noteTypeId,'marked_as_default': !(IsDefaultNotetype) }, messages.ADD_NOTE_TYPE_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.ADD_NOTE_TYPE_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.ADD_NOTE_TYPE_FAILURE, RESPONSE_STATUS.error);
    }
  },

  markAsDefault: async function (req, res) {
    try{
      let notetypeId = req.params.id;
      const noteType = await NoteType.findOne({
        note_type_id: notetypeId
      }).usingConnection(req.dynamic_connection);
      if(noteType)
      {
        await NoteType.update({is_default: true}, {
          is_default: false
        }).fetch().usingConnection(req.dynamic_connection);
        await NoteType.update({note_type_id: notetypeId}, {
          is_default: true
        }).fetch().usingConnection(req.dynamic_connection);
        await getNoteCache(req);
        return res.ok(undefined, messages.UPDATE_NOTE_TYPE_SUCCESS, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch (error) {
      sails.log('error',error);
      return res.ok(undefined, messages.UPDATE_NOTE_TYPE_FAILURE, RESPONSE_STATUS.error);
    }
  },

  edit: async function (req, res) {
    try{
      let request = req.allParams();
      const isValidate = await NoteTypeValidations.edit.validate(request);
      let IsDefaultNotetype;
      if (!isValidate.error) {
        const { name, description, weighted_tier_id, impact_multiplier_id, send_notification, notify_management_user } = request;
        const noteType = await NoteType.findOne({
          name,
          note_type_id: { '!=': req.params.id }
        }).usingConnection(req.dynamic_connection);
        if (noteType) {
          return res.ok(undefined, messages.NOTE_TYPE_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const defaultNotetype = await NoteType.findOne({ is_default: true}).usingConnection(req.dynamic_connection);
          if(defaultNotetype)
          {
            IsDefaultNotetype = false;
          }
          else{
            IsDefaultNotetype = true;
          }
          await NoteType.update({ note_type_id: req.params.id },
            {
              name,
              description,
              weighted_tier_id,
              impact_multiplier_id,
              is_default        : IsDefaultNotetype,
              send_notification,
              notify_management_user,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
          await getNoteCache(req);
          return res.ok({ 'marked_as_default': !(IsDefaultNotetype) }, messages.UPDATE_NOTE_TYPE_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.UPDATE_NOTE_TYPE_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log('error',error);
      return res.ok(undefined, messages.UPDATE_NOTE_TYPE_FAILURE, RESPONSE_STATUS.error);
    }
  },

  find: async function (req, res) {
    try{
      let results;
      const accountDetail = req.account;
      const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.notetype}`;
      let notetype = await getCache(getKey);
      if((notetype.status === RESPONSE_STATUS.success) && (notetype.data !== null))
      {
        results = notetype.data;
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
        let noteTypeList= await noteTypData(results,req);
        let data = {
          totalCount : noteTypeList.length,
          results    : noteTypeList
        };
        return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log('error',error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  findById: async function (req, res) {
    try{
      const note_type_id = parseInt(req.params.id);
      const results = await NoteType.findOne({ note_type_id}).usingConnection(req.dynamic_connection);
      if(results)
      {
        let noteTypeList ={
          note_type_id           : results.note_type_id,
          name                   : results.name,
          description            : (results.description) ? (results.description) : '',
          status                 : results.status,
          weighted_tier_id       : results.weighted_tier_id,
          impact_multiplier_id   : results.impact_multiplier_id,
          send_notification      : results.send_notification,
          notify_management_user : results.notify_management_user,
          is_default             : results.is_default
        };
        return res.ok(noteTypeList, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log('error',error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  activateNoteType: async (req, res) => {
    const isValidate = NoteTypeValidations.updateStatus.validate(req.allParams());
    if (!isValidate.error) {
      const noteTypeId = req.params.id;
      const { status } = req.allParams();
      let resMessage;
      if(status === ACCOUNT_STATUS.active)
      {
        resMessage = messages.NOTE_TYPE_ACTIVATE_SUCEESS;
      }
      else
      {
        resMessage = messages.NOTE_TYPE_INACTIVATE_SUCEESS;
      }
      const results = await NoteType.findOne({ note_type_id: noteTypeId, is_default: true}).usingConnection(req.dynamic_connection);
      if(results)
      {
        resMessage = messages.DEFAULT_NOTE_TYPE_NOT_ACTIVATED;
        return res.ok(undefined, resMessage, RESPONSE_STATUS.warning);
      }
      else
      {
        await NoteType.update({ note_type_id: noteTypeId },{
          status,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        await getNoteCache(req);
        return res.ok(undefined, resMessage, RESPONSE_STATUS.success);
      }
    } else {
      return res.ok(isValidate.error, messages.NOTE_TYPE_ACTIVATE_FAIL,RESPONSE_STATUS.error);
    }
  },
};
