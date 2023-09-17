const {
  getDateUTC,
  getDateUTCFormat,
  getDateTimeSpecificTimeZone,
} = require('../utils/common/getDateTime');
const { commonListing, escapeSqlSearch } = require('../services/utils');
const messages = require('../utils/constants/message');
const {
  ACCOUNT_CONFIG_CODE,
  RESPONSE_STATUS,
  CHECKIN_STATUS,
  PERMISSIONS,
  NOTIFICATION_ENTITIES,
} = require('../utils/constants/enums');
const EmployeeCheckInValidations = require('../validations/EmployeeCheckInValidations');
const { sendNotification } = require('../services/sendNotification');

const getAllowMulCheckInValue = async function (req, user_id) {
  let config_sql;
  if(req.isExposedApi){
    config_sql = ` 
    SELECT 
      account_configuration_detail.value 
    FROM 
      ${process.env.DB_NAME}.account_configuration 
      INNER JOIN ${process.env.DB_NAME}.account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id 
    WHERE 
      account_configuration.account_id  = ${req.account.account_id} 
      AND account_configuration_detail.code = $1 `;
  }else{
    config_sql = ` 
    SELECT 
      account_configuration_detail.value 
    FROM 
      ${process.env.DB_NAME}.account_user 
      INNER JOIN ${process.env.DB_NAME}.account_configuration ON account_user.account_id = account_configuration.account_id 
      INNER JOIN ${process.env.DB_NAME}.account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id 
    WHERE 
      account_user.user_id = ${user_id} 
      AND account_configuration_detail.code = $1 `;
  }

  const rawResultConfig = await sails.sendNativeQuery(escapeSqlSearch(config_sql), [
    ACCOUNT_CONFIG_CODE.allow_multiple_checkin,
  ])
.usingConnection(req.dynamic_connection);

  const allow_multiple_checkin = rawResultConfig.rows[0];
  return allow_multiple_checkin.value;
};

const getJobType = async function (req, employee_profile_id) {
  let results = '';
  let sql = `SELECT ejt.job_type_id, jt.name, jt.color FROM 
  employee_job_type as ejt
  LEFT JOIN job_type as jt ON ejt.job_type_id = jt.job_type_id
  WHERE employee_profile_id = ${employee_profile_id}`;
  const rawResult = await sails
    .sendNativeQuery(sql)
    .usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData = [];
  for (let i of results) {
    responseData.push({
      job_type_id : i.job_type_id,
      name        : i.name,
      color       : i.color,
    });
  }
  return responseData;
};

const findQuerySortData=(findQuery,key,sql,sortFields)=>{
  if (findQuery.sort.includes(key)) {
    let sortBy = findQuery.sort;
    sortBy = sortBy.replace(key, sortFields[key]);
    sql = sql + ` ORDER BY ${sortBy} `;
  }
  return sql;
};

const checkInRequestsData=async(checkInRequests,res,data)=>{
  return checkInRequests.length > 0 ? res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success) : res.ok(data, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
};

const handleAutoReject=async(allow_multiple_checkin,item,req,checkInReq)=>{
  if (
    allow_multiple_checkin === '0' &&
    item.request_status === CHECKIN_STATUS.APPROVED
  ) {
    await EmployeeCheckIn.update(
      {
        employee_profile_id : checkInReq.employee_profile_id,
        employee_checkin_id : { '!=': item.employee_checkin_id },
        request_status      : CHECKIN_STATUS.PENDING,
      },
      {
        request_status: CHECKIN_STATUS.AUTO_REJECTED,
      }
    )
      .fetch()
      .usingConnection(req.dynamic_connection);
  }
};

const itemRequestStatus=(item)=>{
  return item.request_status === CHECKIN_STATUS.REJECTED ? NOTIFICATION_ENTITIES.REJECT_CHECKIN_REQUEST : '';
};

const notificationEntity=async(item,chk)=>{
  return item.request_status === CHECKIN_STATUS.APPROVED ? NOTIFICATION_ENTITIES.ACCEPT_CHECKIN_REQUEST : chk;
};

const rejectMessage=(item)=>{
  return item.request_status === CHECKIN_STATUS.REJECTED ? messages.CHECKIN_REJECT_SUCCESS : messages.UPDATE_CHECKIN_REQUEST_SUCCESS;
};

const messageDatas=(item,chk1)=>{
  return item.request_status === CHECKIN_STATUS.APPROVED ? messages.CHECKIN_APPROVE_SUCCESS : chk1;
};

const checkMultiCheckInCondition=(loc_id,allow_multiple_checkin,sql)=>{
  if (allow_multiple_checkin === '1') {
    sql =
      sql +
      ` AND request_status IN ('${CHECKIN_STATUS.PENDING}', '${CHECKIN_STATUS.APPROVED}') 
    AND location_id = ${loc_id}`;
  } else if (allow_multiple_checkin === '0') {
    sql =
      sql +
      ` AND ((request_status ='${CHECKIN_STATUS.APPROVED}')
    OR (request_status IN ('${CHECKIN_STATUS.PENDING}', '${CHECKIN_STATUS.APPROVED}') 
    AND location_id = ${loc_id}))`;
  }
  return sql;
};

const getEmployeeID = (req,employee_profile_id)=>{
  return employee_profile_id ? employee_profile_id : req.empProfile.employee_profile_id;
};

const handleListFilter = (andPayload,sql) => {
  for (const data of andPayload) {
    Object.keys(data).forEach((prop) => {
      if (prop === 'name' && data[prop] !== '') {
        sql =
          sql +
          ` AND (concat(us.first_name, ' ', us.last_name) LIKE '%${escapeSqlSearch(
            data[prop]
          )}%') `;
      }else if (prop === 'job_type' && data[prop].length > 0) {
        let jobtypePayload = data[prop];
        const jobtypeName = jobtypePayload
          .map((c) => `'${c}'`)
          .join(', ');
        const jobtypeId = '(' + jobtypeName + ')';
        sql = sql + ` AND jt.job_type_id IN ${jobtypeId}`;
      }else if (prop === 'location' && data[prop].length > 0) {
        let locationPayload = data[prop];
        const location = locationPayload
          .map((c) => `'${c}'`)
          .join(', ');
        const locationId = '(' + location + ')';
        sql = sql + ` AND ec.location_id IN ${locationId}`;
      }else if (prop === 'phone' && data[prop] !== '') {
        sql = sql + ` AND us.phone = '${data[prop]}'`;
      }else if (prop === 'total_points' && data[prop] !== '') {
        sql = sql + ` AND ep.points = '${data[prop]}'`;
      }
    });
  }
  return sql;
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await EmployeeCheckInValidations.add.validate(request);
      if (!isValidate.error) {
        const { location_id, employee_profile_id } = req.allParams();
        const user_id = req.user.user_id;
        let employee_id = getEmployeeID(req,employee_profile_id);
        const _currentDate = getDateUTCFormat('YYYY-MM-DD');

        const allow_multiple_checkin = await getAllowMulCheckInValue(
          req,
          user_id
        );

        const empCheckIn_arr = [];
        for (const loc_id of location_id) {
          let sql = `SELECT DISTINCT
          employee_profile_id
          FROM employee_checkin
          WHERE employee_profile_id = ${employee_id} AND DATE(checkin_datetime) = '${_currentDate}'`;

          sql = checkMultiCheckInCondition(loc_id,allow_multiple_checkin,sql);

          const rawResult = await sails
            .sendNativeQuery(escapeSqlSearch(sql))
            .usingConnection(req.dynamic_connection);

          const existingRequest = rawResult.rows;

          if (existingRequest.length > 0) {
            return res.ok(
              undefined,
              messages.CHECKIN_REQUEST_EXISTS,
              RESPONSE_STATUS.warning
            );
          } else {
            let permissions = req.permissions.map((perm) => perm.code);
            // Check if user have review checkIn permission
            let canReviewCheckIn = employee_profile_id && employee_profile_id !==null && employee_profile_id !==undefined ? false: permissions.includes(
  PERMISSIONS.REVIEW_CHECK_IN
            );
            await empCheckIn_arr.push({
              location_id         : loc_id,
              employee_profile_id : employee_id,
              request_status      : canReviewCheckIn
                ? CHECKIN_STATUS.APPROVED
                : CHECKIN_STATUS.PENDING,
              checkin_datetime : getDateUTC(),
              reviewer_status  : canReviewCheckIn
              ? CHECKIN_STATUS.APPROVED
              : null,
              reviewed_datetime: canReviewCheckIn
              ? getDateUTC()
              : null,
            });
          }
        }

        if(empCheckIn_arr.length === location_id.length){
          await EmployeeCheckIn
          .createEach(empCheckIn_arr)
          .usingConnection(req.dynamic_connection);

          return res.ok(
            undefined,
            messages.ADD_CHECKIN_REQUEST_SUCCESS,
            RESPONSE_STATUS.success
          );
        }
      } else {
        res.ok(
          isValidate.error,
          messages.ADD_CHECKIN_REQUEST_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.ADD_CHECKIN_REQUEST_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  findById: async (req, res) => {
    try {
      const location_id = req.params.id;
      const employee_profile_id = req.token.employee_profile_id;
      const _currentDate = getDateUTCFormat('YYYY-MM-DD');
      const user_id = req.user.user_id;
      const allow_multiple_checkin_value = await getAllowMulCheckInValue(
        req,
        user_id
      );

      let sql = `SELECT DISTINCT
        employee_checkin_id, employee_profile_id, location_id, 
        request_status, checkin_datetime, checkout_datetime
        FROM employee_checkin
        WHERE employee_profile_id = ${employee_profile_id} AND location_id = ${location_id} 
        AND DATE(checkin_datetime) = '${_currentDate}' ORDER BY employee_checkin_id DESC;`;

      const rawResult = await sails
        .sendNativeQuery(escapeSqlSearch(sql))
        .usingConnection(req.dynamic_connection);
      sails.log('employee_profile_id',employee_profile_id);

      sails.log('rawResult',rawResult);

      const checkInRequest = rawResult.rows[0];
      sails.log('checkInRequest',checkInRequest);
      let response = {};
      if (checkInRequest) {
        response = {
          employee_checkin_id : checkInRequest.employee_checkin_id,
          employee_profile_id : checkInRequest.employee_profile_id,
          location_id         : checkInRequest.location_id,
          request_status      : checkInRequest.request_status,
          checkin_datetime    : getDateTimeSpecificTimeZone(
            checkInRequest.checkin_datetime,
            req.timezone,
            'YYYY-MM-DD HH:mm:ss'
          ),
          checkout_datetime: checkInRequest.checkout_datetime
            ? getDateTimeSpecificTimeZone(
                checkInRequest.checkout_datetime,
                req.timezone,
                'YYYY-MM-DD HH:mm:ss'
            )
            : null
        };
      }

      let sql_checkedInLocation = `SELECT DISTINCT
      lc.name as location_name, lc.location_id, ec.employee_checkin_id
      FROM employee_checkin as ec
      LEFT JOIN location as lc ON ec.location_id = lc.location_id
      WHERE employee_profile_id = ${employee_profile_id} AND request_status ='${CHECKIN_STATUS.APPROVED}'`;

      const rawResult_checkedInLocation = await sails
      .sendNativeQuery(escapeSqlSearch(sql_checkedInLocation))
      .usingConnection(req.dynamic_connection);
      const checkedInLocation_response = rawResult_checkedInLocation.rows;

      let checkedInLocation = [];

      if(checkedInLocation_response.length > 0){
        for(const item of checkedInLocation_response){
          checkedInLocation.push({
            location_id         : item.location_id,
            location_name       : item.location_name,
            employee_checkin_id : item.employee_checkin_id
          });
        }
      }

      let sql_checkInPendingLocation = `SELECT DISTINCT 
        location_id
        FROM employee_checkin 
        WHERE employee_profile_id = ${employee_profile_id} AND request_status ='${CHECKIN_STATUS.PENDING}'`;

      const rawResult_checkInPendingLocation = await sails
      .sendNativeQuery(escapeSqlSearch(sql_checkInPendingLocation))
      .usingConnection(req.dynamic_connection);
      const checkInPendingLocation_response = rawResult_checkInPendingLocation.rows;

      let checkInPendingLocation = [];

      if(checkInPendingLocation_response.length > 0){
        for(const item of checkInPendingLocation_response){
          checkInPendingLocation.push(
            item.location_id
          );
        }
      }

      let data = {
        checkin_details             : response,
        allow_multiple_checkin      : (allow_multiple_checkin_value === '1') ? true : false,
        checkedIn_in_any_location   : (checkedInLocation.length > 0) ? true : false,
        checkedIn_in_location       : checkedInLocation,
        checkIn_pending_in_location : checkInPendingLocation
      };

      if(checkInRequest){
        return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else {
        return res.ok(data, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.GET_RECORD_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  findListById: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await EmployeeCheckInValidations.findListById.validate(
        request
      );
      if (!isValidate.error) {
        const findQuery = await commonListing(request);
        const employee_profile_id = req.token.employee_profile_id;
        const { location_id } = req.allParams();
        const location = location_id.map((c) => `'${c}'`).join(', ');
        const locationId = '(' + location + ')';

        const _currentDate = getDateUTCFormat('YYYY-MM-DD');

        let sql = `SELECT DISTINCT
        ec.employee_checkin_id, ec.employee_profile_id, ec.location_id,lc.name AS location_name, us.first_name, us.last_name, us.phone, ep.points, 
        ec.request_status, ec.checkin_datetime,  us.profile_picture_thumbnail_url
        FROM employee_checkin AS ec
        LEFT JOIN employee_profile AS ep ON ec.employee_profile_id = ep.employee_profile_id
        LEFT JOIN ${process.env.DB_NAME}.user AS us ON ep.user_id = us.user_id
        LEFT JOIN location AS lc ON  ec.location_id =  lc.location_id
        LEFT JOIN employee_job_type AS ejt ON ec.employee_profile_id = ejt.employee_profile_id
        LEFT JOIN job_type AS jt ON ejt.job_type_id = jt.job_type_id
        WHERE ec.location_id IN ${locationId} AND ec.request_status = 'Pending'
        AND DATE(ec.checkin_datetime) = '${_currentDate}' AND ec.employee_profile_id != ${employee_profile_id}`;

        if (findQuery.andCondition.length > 0) {
          const andPayload = findQuery.andCondition;
          sql = handleListFilter(andPayload, sql);
        }

        const sortFields = {
          name         : 'us.first_name',
          location     : 'lc.name',
          phone        : 'us.phone',
          job_type     : 'jt.name',
          total_points : 'ep.points',
        };

        Object.keys(sortFields).forEach(async(key) => {
          sql = findQuerySortData(findQuery,key,sql,sortFields);
        });

        sql = sql + ` limit ${findQuery.rows} offset ${findQuery.skip}`;

        const rawResult = await sails
          .sendNativeQuery(escapeSqlSearch(sql))
          .usingConnection(req.dynamic_connection);

        const results = rawResult.rows;
        const checkInRequests = [];

        if (results.length > 0) {
          for (let item of results) {
            const jobTypes = await getJobType(req, item.employee_profile_id);
            checkInRequests.push({
              employee_checkin_id : item.employee_checkin_id,
              employee_profile_id : item.employee_profile_id,
              first_name          : item.first_name,
              last_name           : item.last_name,
              phone               : item.phone,
              total_points        : item.points,
              location_id         : item.location_id,
              location            : item.location_name,
              job_types           : jobTypes,
              request_status      : item.request_status,
              checkin_datetime    : getDateTimeSpecificTimeZone(
                item.checkin_datetime,
                req.timezone,
                'YYYY-MM-DD HH:mm:ss'
              ),
              profile_picture_thumbnail_url: item.profile_picture_thumbnail_url
            });
          }
        }
        let  data = {
          totalResults    : checkInRequests.length,
          checkInRequests : checkInRequests,
        };

        await checkInRequestsData(checkInRequests,res,data);

      } else {
        res.ok(
          isValidate.error,
          messages.GET_RECORD_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.GET_RECORD_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await EmployeeCheckInValidations.edit.validate(
        request
      );

      if (!isValidate.error) {
        const { checkInRequests } = req.allParams();
        let message;
        let count_approve = 0;
        let count_reject = 0;
        if (checkInRequests.length > 0) {
          for (let item of checkInRequests) {
            if (item.request_status === CHECKIN_STATUS.CHECKEDOUT) {
              await EmployeeCheckIn.update(
                { employee_checkin_id: item.employee_checkin_id },
                {
                  request_status    : item.request_status,
                  reviewed_by       : req.token.employee_profile_id,
                  reviewed_datetime : getDateUTC(),
                  checkout_datetime : getDateUTC(),
                }
              )
                .fetch()
                .usingConnection(req.dynamic_connection);

              message = messages.CHECKOUT_SUCCESS;
            } else {
              const user_id = req.user.user_id;
              const allow_multiple_checkin = await getAllowMulCheckInValue(
                req,
                user_id
              );

              const checkInReq = await EmployeeCheckIn.findOne({
                employee_checkin_id: item.employee_checkin_id,
              })
                .populate('location_id')
                .usingConnection(req.dynamic_connection);
              let empProfile = await EmployeeProfile.findOne({
                employee_profile_id: checkInReq.employee_profile_id,
              }).usingConnection(req.dynamic_connection);

              await EmployeeCheckIn.update(
                { employee_checkin_id: item.employee_checkin_id },
                {
                  request_status    : item.request_status,
                  reviewer_status   : item.request_status,
                  reviewed_by       : req.token.employee_profile_id,
                  reviewed_datetime : getDateUTC(),
                }
              )
                .fetch()
                .usingConnection(req.dynamic_connection);

              if(item.request_status === 'Approved'){
                count_approve = count_approve + 1;
              }else if(item.request_status === 'Rejected'){
                count_reject = count_reject + 1;
              }
              await handleAutoReject(allow_multiple_checkin,item,req,checkInReq);

              let chk =itemRequestStatus(item);
              const mailData = {
                employee_profile_id : checkInReq.employee_profile_id,
                notification_entity : notificationEntity(item,chk),
                status              : item.request_status,
                location_name       : checkInReq.location_id.name,
                location_id         : checkInReq.location_id.location_id,
                account_id          : req.account.account_id,
                user_id             : empProfile.user_id,
              };
              if(!req.isExposedApi){
                await sendNotification(null, mailData);
              }

            }
          }
        }

        if(count_approve > 0 && count_reject === 0){
          message = messages.CHECKIN_APPROVE_SUCCESS;
        }else if(count_approve === 0 && count_reject > 0){
          message = messages.CHECKIN_REJECT_SUCCESS;
        }else if(count_approve > 0 && count_reject > 0){
          message = messages.REVIEW_CHECKIN_REQUEST_SUCCESS;
        }
        
        return res.ok(undefined, message, RESPONSE_STATUS.success);
      } else {
        return res.ok(
          isValidate.error,
          messages.REVIEW_CHECKIN_REQUEST_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      res.ok(
        undefined,
        messages.REVIEW_CHECKIN_REQUEST_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  pendingRequestCount: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate =
        await EmployeeCheckInValidations.pendingRequestCount.validate(request);
      if (!isValidate.error) {
        const { location_id } = req.allParams();
        const employee_profile_id = req.token.employee_profile_id;
        const location = location_id.map((c) => `'${c}'`).join(', ');
        const locationId = '(' + location + ')';

        const _currentDate = getDateUTCFormat('YYYY-MM-DD');

        let sql = `SELECT DISTINCT employee_checkin_id FROM employee_checkin
        WHERE location_id IN ${locationId} AND request_status = 'Pending'
        AND DATE(checkin_datetime) = '${_currentDate}'  AND employee_profile_id != ${employee_profile_id}`;

        const rawResult = await sails
          .sendNativeQuery(escapeSqlSearch(sql))
          .usingConnection(req.dynamic_connection);

        const results = rawResult.rows;

        let data = {
          pending_checkin_count: results.length,
        };

        return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        res.ok(
          isValidate.error,
          messages.GET_RECORD_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.GET_RECORD_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },
};
