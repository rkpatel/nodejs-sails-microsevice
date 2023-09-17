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
const LocationValidations = require('../validations/LocationValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  ACCOUNT_STATUS, RESPONSE_STATUS, MASTERINFO_STATUS, LOCATION_STATUS } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const sql = `SELECT location.location_id, location.name, location.parent_location_id, location.address_1, location.address_2, location.zip, location.status, city.name as city, country.name as country, state.name as state, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = location.created_by) as created_by,(select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = location.last_updated_by) as last_updated_by, location.created_date, location.last_updated_date from location INNER JOIN ${process.env.DB_NAME}.country ON location.country_id = country.country_id INNER JOIN ${process.env.DB_NAME}.state ON location.state_id = state.state_id INNER JOIN ${process.env.DB_NAME}.city ON location.city_id = city.city_id ORDER BY  location.created_date DESC`;

const getLocationCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.location}`;
  let locationKeyExists = await keyExists(getKey);
  if(locationKeyExists === 1)
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
    location_id : item.location_id,
    parent_location_id : item.parent_location_id,
    name : item.name,
    description : (item.description) ? (item.description) : '',
    status: item.status,
    address_1: (item.address_1) ? (item.address_1): '',
    address_2: (item.address_2) ? (item.address_2) : '', 
    country_id: item.country, 
    state_id: item.state, 
    city_id: item.city, 
    zip: item.zip,
    created_by : (item.created_by) ? (item.created_by) : '',
    created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone) : '',
    last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone) : '',
  }));
};

const locationListDatas=async(results,req)=>{
  return results.map((item)=>({
    location_id : item.location_id,
    parent_location_id : item.parent_location_id,
    name : item.name,
    description : (item.description) ? (item.description) : '',
    status: item.status,
    address_1: (item.address_1) ? (item.address_1): '',
    address_2: (item.address_2) ? (item.address_2) : '', 
    country_id: item.country, 
    state_id: item.state, 
    city_id: item.city, 
    city_state : `${item.state}, ${item.city}`,
    zip: item.zip,
    created_by : (item.created_by) ? (item.created_by) : '',
    created_date : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

module.exports = {
  add: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await LocationValidations.add.validate(request);
      if (!isValidate.error) {
        const { name, parent_location_id, description, address_1, address_2, country_id, state_id, city_id, zip } = request;
        const location = await Locations.findOne({ name }).usingConnection(req.dynamic_connection);
        if (location) {
          return res.ok(undefined, messages.LOCATION_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          await Locations.create({
            name,
            parent_location_id: (parent_location_id !== '') ? parent_location_id : 0,
            description,
            address_1,
            address_2, 
            country_id, 
            state_id, 
            city_id, 
            zip,
            status: ACCOUNT_STATUS.active,
            created_by : req.user.user_id,
            created_date: getDateUTC(),
            last_updated_by : null
          }).fetch().usingConnection(req.dynamic_connection);
          await getLocationCache(req);
          return res.ok(undefined, messages.ADD_LOCATION_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.ADD_LOCATION_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.ADD_LOCATION_FAILED, RESPONSE_STATUS.error);
    }
  },

  edit:async function (req, res) {
    try{
      let request = req.allParams();
      const isValidate = await LocationValidations.edit.validate(request);
      if (!isValidate.error) {
        const { name, parent_location_id, description, address_1, address_2, country_id, state_id, city_id, zip } = request;
        const location = await Locations.findOne({ 
          name, 
          location_id: { '!=': req.params.id }
        }).usingConnection(req.dynamic_connection);
        if (location) {
          return res.ok(undefined, messages.LOCATION_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          await Locations.update({ location_id: req.params.id },
            {
              name,
              parent_location_id: (parent_location_id !== '') ? parent_location_id : 0,
              description,
              address_1,
              address_2, 
              country_id, 
              state_id, 
              city_id, 
              zip,
              last_updated_by : req.user.user_id,
              last_updated_date: getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
          await getLocationCache(req);
          return res.ok(undefined, messages.UPDATE_LOCATION_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.UPDATE_LOCATION_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.UPDATE_LOCATION_FAILURE, RESPONSE_STATUS.error);
    }
  },

  find: async function (req, res) {
    try{
      let results;
      const accountDetail = req.account;
      const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.location}`;
      let  locations = await getCache(getKey);
      if((locations.status === RESPONSE_STATUS.success) && (locations.data !== null))
      {
        results = locations.data;
      }
      else{
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        const data = {
          'key' : `${accountDetail.account_guid}_${MASTERINFO_STATUS.location}`,
          'value' :  results
        };
        await setCache(data);
      }
      if(results)
      {
        for(const key of results){
          if(key.parent_location_id !== 0){
            const parentLocation = await Locations.findOne({ location_id : key.parent_location_id }).usingConnection(req.dynamic_connection);
            key.parent_location_id = parentLocation.name;
          }
          else
          {
            key.parent_location_id = '';
          }
        }
        
        const locationList = await locationListDatas(results,req);
        let data = {
          totalCount : locationList.length,
          results    : locationList
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
      const location_id = parseInt(req.params.id);
      const results = await Locations.findOne({ location_id}).usingConnection(req.dynamic_connection);
      if(results)
      {
        let locationList ={
          location_id : results.location_id,
          parent_location_id : results.parent_location_id,
          name : results.name,
          description : (results.description) ? (results.description) : '',
          status: results.status,
          address_1: results.address_1,
          address_2: results.address_2, 
          country_id: results.country_id, 
          state_id: results.state_id, 
          city_id: results.city_id, 
          zip: results.zip,
        };
        return res.ok(locationList, messages.GET_RECORD, RESPONSE_STATUS.success);
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

  activateLocation: async (req, res) => {
    try
    {
      const isValidate = LocationValidations.updateStatus.validate(req.allParams());
      if (!isValidate.error) {
        const locationId = req.params.id;
        const { status} = req.allParams();
        let canUpdate = true;
        let respMessage = messages.LOCATION_ACTIVATED;
        if(status === ACCOUNT_STATUS.inactive ){
          const locationDetails = await EmpLocation.find({ location_id : locationId }).usingConnection(req.dynamic_connection);
          if(locationDetails && locationDetails.length > 0){
            canUpdate = false;
            sails.log(canUpdate);
            respMessage = messages.LOCATION_ASSOCIATED_MSG.replace(/STR_TO_BE_REPLACE/, locationDetails.length);
            return res.ok(undefined, respMessage, RESPONSE_STATUS.warning);
          }
          else{
            respMessage = messages.LOCATION_INACTIVATED;
          }
        }
        if(canUpdate){
          await Locations.update({ location_id : locationId },{
            status,
            last_updated_by : req.user.user_id,
            last_updated_date    : getDateUTC()
          }).usingConnection(req.dynamic_connection);
          await getLocationCache(req);
          return res.ok(undefined, respMessage, RESPONSE_STATUS.success);
        }
        else{
          return res.ok(undefined, respMessage, RESPONSE_STATUS.success);
        }  
        
      } else {
        return res.ok(isValidate.error, messages.LOCATION_STATUS_UPDATE_FAIL,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.LOCATION_STATUS_UPDATE_FAIL, RESPONSE_STATUS.error);
    }
  },

  getParentLocation: async(req, res) =>{
    try{
      const locationId = req.params.id;
      let sqlQuery = `with recursive cte (location_id, name, parent_location_id) as (
        select     location_id,
                   name,
                   parent_location_id
        from       location
        where      parent_location_id = ${locationId}
        union all
        select     p.location_id,
                   p.name,
                   p.parent_location_id
        from       location p
        inner join cte
                on p.parent_location_id = cte.location_id
      )
      select location.location_id, location.name, location.parent_location_id from location LEFT JOIN cte ON location.location_id = cte.location_id WHERE cte.location_id IS NULL AND location.location_id != ${locationId} AND location.status ="Active"`;
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sqlQuery)).usingConnection(req.dynamic_connection);
      const results = rawResult.rows;
      if(results) 
      {
        const locationList = results.map((item)=>({
          location_id : item.location_id,
          parent_location_id : item.parent_location_id,
          name : item.name,
        }));
        return res.ok(locationList, messages.GET_RECORD, RESPONSE_STATUS.success);
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

  findCommonLocations: async(req, res) =>{
    try{
      let request = req.allParams();
      const isValidate = await LocationValidations.findCommonLocations.validate(request);
      if(!isValidate.error) {
        const {employee_profile_ids} = req.allParams();
        const distinctIds = [...new Set(employee_profile_ids)];
        const employeeId = distinctIds
                  .map((c) => `'${c}'`)
                  .join(', ');
        const employeeIds = '(' + employeeId + ')';
        const employeeIds_count = distinctIds.length;

        let sqlQuery1 = `SELECT DISTINCT
          el.location_id, 
          lc.name 
          FROM 
            (
              SELECT DISTINCT location_id, employee_profile_id 
              FROM 
                employee_location 
              WHERE 
                employee_profile_id IN ${employeeIds}
            ) AS el 
            INNER JOIN location AS lc ON el.location_id = lc.location_id  
          GROUP BY 
            el.location_id 
          HAVING 
            COUNT(*) >= ${employeeIds_count}
        `;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sqlQuery1)).usingConnection(req.dynamic_connection);
        const results = rawResult.rows;
        
        const commonLocationList = results.map((item)=>({
          location_id : item.location_id,
          name : item.name,
        }));

        let data = {
          totalResults            : commonLocationList.length,
          commonLocationsList     : commonLocationList
        };
  
        if (commonLocationList.length > 0) {
          return res.ok(
            data,
            messages.GET_RECORD,
            RESPONSE_STATUS.success
          );
        } else {
          return res.ok(
            data,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        return res.ok(isValidate.error,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  }, 
};
