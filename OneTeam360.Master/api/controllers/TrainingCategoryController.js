/* eslint-disable no-trailing-spaces */
/* eslint-disable key-spacing */
/* eslint-disable camelcase */
/***************************************************************************

  Controller     : Training Category

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
const TrainingCategoryValidations = require('../validations/TrainingCategoryValidations');
const {
  getDateUTC,
  getDateSpecificTimeZone,
} = require('../utils/common/getDateTime');
const { setCache, getCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {
  RESPONSE_STATUS,
  ACCOUNT_STATUS,
  MASTERINFO_STATUS,
} = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const sql = `Select TC.training_category_id, TC.name, TC.training_category_id, weighted_tier.name as weighted_tier, TC.name, TC.description, TC.status, TC.created_date, TC.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = TC.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = TC.last_updated_by) as last_updated_by FROM training_category as TC INNER JOIN ${process.env.DB_NAME}.weighted_tier ON weighted_tier.weighted_tier_id = TC.weighted_tier_id ORDER BY TC.created_date DESC`;

const getTrainingCategoryCache = async function (req) {
  const accountDetail = req.account;
  const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingCategory}`;
  let trainingCategoryKeyExists = await keyExists(getKey);
  if (trainingCategoryKeyExists === 1) {
    await deleteCache(getKey);
  }
  const rawResult = await sails
    .sendNativeQuery(sql)
    .usingConnection(req.dynamic_connection);
  let results = rawResult.rows;
  const data = {
    key: getKey,
    value: results,
  };
  await setCache(data);
  return results.map((item) => ({
    training_category_id: item.training_category_id,
    name: item.name,
    description: item.description ? item.description : '',
    status: item.status,
    weighted_tier: item.weighted_tier,
    created_by: item.created_by ? item.created_by : '',
    created_date: item.created_date
      ? getDateSpecificTimeZone(
          item.created_date,
          req.timezone,
          req.dateFormat
      )
      : '',
    last_updated_by: item.last_updated_by
      ? item.last_updated_by
      : item.created_by,
    last_updated_date: item.last_updated_date
      ? getDateSpecificTimeZone(
          item.last_updated_date,
          req.timezone,
          req.dateFormat
      )
      : getDateSpecificTimeZone(
          item.created_date,
          req.timezone,
          req.dateFormat
      ),
  }));
};

const trainingReponseMessage=async(trainings,canUpdate,respMessage)=>{
  if (trainings && trainings.length > 0) {
    canUpdate = false;
    sails.log(canUpdate);
    respMessage = messages.TRAINING_CATEGORY_ASSOCIATED_MSG.replace(
      /STR_TO_BE_REPLACE/,
      trainings.length
    );
    return respMessage;
  } else {
    respMessage = messages.TRAINING_CATEGORY_INACTIVATE_SUCEESS;
    return respMessage;
  }
};

const trainingDatas=async(results,req)=>{
  return results.map((item) => ({
    training_category_id: item.training_category_id,
    name: item.name,
    description: item.description ? item.description : '',
    status: item.status,
    weighted_tier: item.weighted_tier,
    created_by: item.created_by ? item.created_by : '',
    created_date: item.created_date
      ? getDateSpecificTimeZone(
          item.created_date,
          req.timezone,
          req.dateFormat
      )
      : '',
    last_updated_by: item.last_updated_by
      ? item.last_updated_by
      : item.created_by,
    last_updated_date: item.last_updated_date
      ? getDateSpecificTimeZone(
          item.last_updated_date,
          req.timezone,
          req.dateFormat
      )
      : getDateSpecificTimeZone(
          item.created_date,
          req.timezone,
          req.dateFormat
      )
  }));
};

module.exports = {
  add: async (req, res) => {
    let request = req.allParams();
    const isValid = await TrainingCategoryValidations.add.validate(request);
    if (!isValid.error) {
      const { name, description, weighted_tier_id } = request;
      const trainingCategoryDetails = await TrainingCategory.findOne({
        name,
      }).usingConnection(req.dynamic_connection);
      if (!trainingCategoryDetails) {
        await TrainingCategory.create({
          name,
          description,
          weighted_tier_id,
          status: ACCOUNT_STATUS.active,
          created_by: req.user.user_id,
          created_date: getDateUTC(),
          last_updated_by: null,
        }).usingConnection(req.dynamic_connection);
        await getTrainingCategoryCache(req);
        return res.ok(
          undefined,
          messages.TRAINING_CATEGORY_ADD_SUCCESS,
          RESPONSE_STATUS.success
        );
      } else {
        return res.ok(
          undefined,
          messages.TRAINING_CATEGORY_ALREADY_EXISTS,
          RESPONSE_STATUS.warning
        );
      }
    } else {
      return res.ok(
        isValid.error,
        messages.TRAINING_CATEGORY_ADD_FAIL,
        RESPONSE_STATUS.error
      );
    }
  },

  edit: async (req, res) => {
    let request = req.allParams();
    const isValid = TrainingCategoryValidations.edit.validate(request);
    if (!isValid.error) {
      if (req.params.id) {
        const trainingCategoryId = req.params.id;

        const { name, description, weighted_tier_id } = request;
        const trainingCategoryDetails = await TrainingCategory.findOne({
          name: name,
          training_category_id: { '!=': trainingCategoryId },
        }).usingConnection(req.dynamic_connection);
        if (!trainingCategoryDetails) {
          await TrainingCategory.update(
            { training_category_id: trainingCategoryId },
            {
              name,
              description,
              weighted_tier_id,
              last_updated_by: req.user.user_id,
              last_updated_date: getDateUTC(),
            }
          ).usingConnection(req.dynamic_connection);
          await getTrainingCategoryCache(req);
          return res.ok(
            undefined,
            messages.TRAINING_CATEGORY_UPDATE_SUCCESS,
            RESPONSE_STATUS.success
          );
        } else {
          return res.ok(
            undefined,
            messages.TRAINING_CATEGORY_ALREADY_EXISTS,
            RESPONSE_STATUS.warning
          );
        }
      } else {
        return res.ok(
          undefined,
          messages.PARAMETER_MISSING,
          RESPONSE_STATUS.error
        );
      }
    } else {
      return res.ok(
        isValid.error,
        messages.TRAINING_CATEGORY_UPDATE_FAIL,
        RESPONSE_STATUS.error
      );
    }
  },

  updateStatus: async (req, res) => {
    const isValid = TrainingCategoryValidations.updateStatus.validate(
      req.allParams()
    );
    if (!isValid.error) {
      const trainingCategoryId = req.params.id;
      const { status } = req.allParams();
      let canUpdate = true;
      let respMessage = messages.TRAINING_CATEGORY_ACTIVATE_SUCEESS;
      if (status === ACCOUNT_STATUS.inactive) {
        sails.log('status === ACCOUNT_STATUS.inactive',status , ACCOUNT_STATUS.inactive);
        const trainings = await Training.find({
          training_category_id: trainingCategoryId,
        }).usingConnection(req.dynamic_connection);

        await trainingReponseMessage(trainings,canUpdate,respMessage);
      }
      if (canUpdate) {
        const checkExists = await TrainingCategory.findOne({
          training_category_id: trainingCategoryId,
        }).usingConnection(req.dynamic_connection);
        if (checkExists) {
          await TrainingCategory.update(
            { training_category_id: trainingCategoryId },
            {
              status,
              last_updated_by: req.user.user_id,
              last_updated_date: getDateUTC(),
            }
          ).usingConnection(req.dynamic_connection);
          await getTrainingCategoryCache(req);
          return res.ok(undefined, respMessage, RESPONSE_STATUS.success);
        } else {
          return res.ok(
            undefined,
            messages.TRAINING_CATEGORY_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        return res.ok(undefined, respMessage, RESPONSE_STATUS.error);
      }
    } else {
      return res.ok(
        isValid.error,
        messages.TRAINING_CATEGORY_STATUS_UPDATE_FAIL,
        RESPONSE_STATUS.error
      );
    }
  },

  find: async function (req, res) {
    let results;
    const accountDetail = req.account;
    const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingCategory}`;
    let  trainingCats = await getCache(getKey);
    if ((trainingCats.status === RESPONSE_STATUS.success)  && (trainingCats.data !== null)) {
      results = trainingCats.data;
    } else {
      const rawResult = await sails
        .sendNativeQuery(escapeSqlSearch(sql))
        .usingConnection(req.dynamic_connection);
      results = rawResult.rows;
      const data = {
        key: `${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingCategory}`,
        value: results,
      };
      await setCache(data);
    }
    if (results) {
      const trainingCategoryDetails = await trainingDatas(results,req);

      sails.log('trainingCategoryDetails',trainingCategoryDetails);

      return res.ok(
        trainingCategoryDetails,
        messages.GET_RECORD,
        RESPONSE_STATUS.success
      );
    } else {
      return res.ok(
        undefined,
        messages.DATA_NOT_FOUND,
        RESPONSE_STATUS.success
      );
    }
  },

  findById: async function (req, res) {
    try {
      const training_category_id = parseInt(req.params.id);
      const results = await TrainingCategory.findOne({
        training_category_id,
      }).usingConnection(req.dynamic_connection);
      if (results) {
        let trainingCategoryList = {
          training_category_id: results.training_category_id,
          name: results.name,
          description: results.description ? results.description : '',
          status: results.status,
          weighted_tier_id: results.weighted_tier_id,
        };
        return res.ok(
          trainingCategoryList,
          messages.GET_RECORD,
          RESPONSE_STATUS.success
        );
      } else {
        return res.ok(
          undefined,
          messages.DATA_NOT_FOUND,
          RESPONSE_STATUS.success
        );
      }
    } catch (error) {
      sails.log('error',error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },
};
