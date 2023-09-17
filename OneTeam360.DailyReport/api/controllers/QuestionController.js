const messages = sails.config.globals.messages;
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const QuestionValidation = require('../validations/QuestionValidation');
const { RESPONSE_STATUS, ACCOUNT_STATUS } = require('../utils/constants/enums');
const { getDateUTC } = require('../utils/common/getDateTime');

const getQuestionOptions = async function(req, questionId) {
  let results = '';
  let sql = `SELECT question_option_id, option_key, option_value, sequence
              FROM question_option WHERE question_id = ${questionId} AND status = '${ACCOUNT_STATUS.active}'`;
  const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for(let i of results){
    responseData.push({
      question_option_id : i.question_option_id,
      option_key         : i.option_key,
      option_value       : i.option_value,
      sequence           : i.sequence,
    });
  }

  return responseData;
};

const finalResponseData=async(results,req,response)=>{
  for(let item of results){
    const optionsValue =item.question_id ?  getQuestionOptions(req, item.question_id) : [];
    response.push({
      question_id            : item.question_id,
      title                  : item.question_title,
      description            : item.question_description,
      question_type_id       : item.question_type_id,
      is_for_dynamic_entity  : item.is_for_dynamic_entity,
      entity                 : item.entity,
      dynamic_remark         : item.dynamic_remark,
      dynamic_allow_multiple : item.dynamic_allow_multiple,
      created_date           : item.created_date,
      question_type_title    : item.question_type_title,
      question_field_type    : item.question_field_type,
      options                : optionsValue
    });
  }
};

const resData=async(data,sql)=>{
  Object.keys(data).forEach((prop) => {
    if (prop === 'title' && data[prop] !== '') {
      sql = sql + ` AND q.title LIKE '%${escapeSearch(data[prop])}%'`;
    }
  });
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await QuestionValidation.add.validate(request);
      if (!isValidate.error) {
        const { title, description, question_type_id, is_for_dynamic_entity, entity, dynamic_remark, dynamic_allow_multiple, questionOptions } = req.allParams();
        const newQuestion = await Question.create({
          title,
          description,
          question_type_id,
          is_for_dynamic_entity,
          entity,
          dynamic_remark,
          dynamic_allow_multiple,
          status          : ACCOUNT_STATUS.active,
          created_by      : req.user.user_id,
          last_updated_by : req.user.user_id,
          created_date    : getDateUTC(),
        }).fetch().usingConnection(req.dynamic_connection);

        const questionId = newQuestion.question_id;

        const questionOptions_arr = [];

        if(questionOptions !== undefined) {
          for (const quetion of questionOptions) {
            questionOptions_arr.push({ question_id: questionId, option_key: quetion.option_key, option_value: quetion.option_value, sequence: quetion.sequence, status: ACCOUNT_STATUS.active, created_by: req.user.user_id, created_date: getDateUTC(),  last_updated_by: req.user.user_id });
          }

          if (questionOptions_arr.length > 0) { await QuestionOption.createEach(questionOptions_arr).usingConnection(req.dynamic_connection); }
        }

        return res.ok({question_id: questionId}, messages.ADD_QUESTION_SUCCESS, RESPONSE_STATUS.success);
      }   else {
        res.ok(isValidate.error, messages.ADD_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    }   catch (err) {
      sails.log.error(err);
      return res.ok(undefined,messages.SOMETHING_WENT_WRONG,RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await QuestionValidation.edit.validate(request);
      if (!isValidate.error) {
        const QuestionDetail = await Question.findOne({ question_id: request.id }).usingConnection(req.dynamic_connection);
        if(QuestionDetail) {
          const { id, title, description, question_type_id, is_for_dynamic_entity, entity, dynamic_remark, dynamic_allow_multiple, questionOptions } = req.allParams();

          const queOptions = await QuestionOption.find({ question_id: id, status: ACCOUNT_STATUS.active }).usingConnection(req.dynamic_connection);
          const existingQuestionOptions = queOptions.map(x => x.question_option_id);
          const requestQuestionOptions = questionOptions.filter(f => f.question_option_id !== undefined).map(x => x.question_option_id);
          const addQuestionOptions = questionOptions.filter(f => f.question_option_id === undefined);
          const updateQuestionOptions = questionOptions.filter(f => f.question_option_id !== undefined);
          const removeQuestionOptions = existingQuestionOptions.filter(x => !requestQuestionOptions.includes(x));

          const questionoption_add_arr = addQuestionOptions.map((x) => { return { question_id: id, option_key: x.option_key, option_value: x.option_value, sequence: x.sequence, status: ACCOUNT_STATUS.active, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
          if (questionoption_add_arr.length > 0) { await QuestionOption.createEach(questionoption_add_arr).usingConnection(req.dynamic_connection); }

          for(let uqueoption of updateQuestionOptions){
            const updateQuestionData = uqueoption;
            await QuestionOption.update({ question_option_id: updateQuestionData.question_option_id },
                        {
                          option_key        : updateQuestionData.option_key,
                          option_value      : updateQuestionData.option_value,
                          sequence          : updateQuestionData.sequence,
                          last_updated_by   : req.user.user_id,
                          last_updated_date : getDateUTC()
                        }).fetch().usingConnection(req.dynamic_connection);
          }

          for(let rqueoption of removeQuestionOptions){
            await QuestionOption.update({ question_option_id: removeQuestionOptions[rqueoption] },
                        {
                          status            : ACCOUNT_STATUS.inactive,
                          last_updated_by   : req.user.user_id,
                          last_updated_date : getDateUTC()
                        }).fetch().usingConnection(req.dynamic_connection);
          }

          const updateQuestion = await Question.update({ question_id: id },{
            title,
            description,
            question_type_id,
            is_for_dynamic_entity,
            entity,
            dynamic_remark,
            dynamic_allow_multiple,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          return res.ok(updateQuestion, messages.UPDATE_QUESTION_SUCCESS, RESPONSE_STATUS.success);
        } else {
          return res.ok(QuestionDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValidate.error, messages.UPDATE_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
    }
  },

  delete: async (req, res) =>{
    try{
      let request = req.allParams();
      const isValidate = await QuestionValidation.delete.validate(request);
      if (!isValidate.error) {
        const question_id = req.params.id;
        await Question.update({
          question_id
        },{
          status            : ACCOUNT_STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).usingConnection(req.dynamic_connection);

        res.ok(undefined, messages.DELETE_QUESTION, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.DELETE_FAIL, RESPONSE_STATUS.error);
      }
    }
    catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.DELETE_FAIL, RESPONSE_STATUS.error);
    }
  },

  predefinedQuestions: async (req, res) => {
    try {
      let request = req.allParams();
      const findQuery = await commonListing(request);
      let results;
      const isValidate = await QuestionValidation.filter.validate(request);
      if (!isValidate.error) {
        let sql = `SELECT DISTINCT
                q.question_id as question_id,
                q.title as question_title,
                q.description as question_description,
                q.question_type_id as question_type_id,
                q.is_for_dynamic_entity as is_for_dynamic_entity,
                q.entity as entity,
                q.dynamic_remark as dynamic_remark,
                q.dynamic_allow_multiple as dynamic_allow_multiple,
                q.created_date as created_date,
                qt.title as question_type_title,
                qt.field_type as question_field_type FROM
                question AS q
                LEFT JOIN question_type AS qt
                ON q.question_type_id = qt.question_type_id
                WHERE q.status = '${ACCOUNT_STATUS.active}'`;

        if (findQuery.andCondition.length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data of andPayload) {
            await resData(data,sql);
          }
        }
        sql = sql + ` ORDER BY ${findQuery.sort} `;

        const lengthsql = sql;
        const rawResultLength = await sails
                .sendNativeQuery(escapeSqlSearch(lengthsql))
                .usingConnection(req.dynamic_connection);

        const resultsLength = rawResultLength.rows;
        sql = sql + `limit ${findQuery.rows} offset ${findQuery.skip}`;

        const rawResult = await sails
                .sendNativeQuery(sql)
                .usingConnection(req.dynamic_connection);

        results = rawResult.rows;

        if (results.length > 0) {
          let response = [];
          await finalResponseData(results,req,response);

          let data = {
            list        : response,
            totalResult : resultsLength.length,
          };
          return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else{
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch (err){
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  findById: async (req, res) => {
    try {
      const question_id = parseInt(req.params.id);
      const QuestionDetail = await Question.findOne({question_id}).usingConnection(req.dynamic_connection);
      if (QuestionDetail) {
        let results;
        let sql = `SELECT DISTINCT
                  q.question_id AS question_id,
                  q.title AS question_title,
                  q.description AS question_description,
                  q.question_type_id AS question_type_id,
                  q.is_for_dynamic_entity AS is_for_dynamic_entity,
                  q.entity AS entity,
                  q.dynamic_remark AS dynamic_remark,
                  q.dynamic_allow_multiple AS dynamic_allow_multiple,
                  q.created_date AS created_date,
                  qt.title AS question_type_title,
                  qt.field_type AS question_field_type FROM
                  question AS q
                  LEFT JOIN question_type AS qt
                  ON q.question_type_id = qt.question_type_id
                  WHERE q.question_id = ${question_id} AND q.status = '${ACCOUNT_STATUS.active}'`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);

        results = rawResult.rows;

        if (results.length > 0) {
          let response = [];
          for (let item of results) {
            const optionsValue = item.question_id
              ? await getQuestionOptions(req, item.question_id)
              : [];
            response.push({
              question_id            : item.question_id,
              title                  : item.question_title,
              description            : item.question_description,
              question_type_id       : item.question_type_id,
              is_for_dynamic_entity  : item.is_for_dynamic_entity,
              entity                 : item.entity,
              dynamic_remark         : item.dynamic_remark,
              dynamic_allow_multiple : item.dynamic_allow_multiple,
              created_date           : item.created_date,
              field_type             : item.question_field_type,
              options                : optionsValue,
            });
          }

          return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          return res.ok(
            undefined,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        return res.ok(
          undefined,
          messages.DATA_NOT_FOUND,
          RESPONSE_STATUS.success
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  findByIds: async (req, res) => {
    try {
      let request = req.allParams();
      const questionsIds = request.questionsIds;
      let templateLit=questionsIds.map((c) => `'${c}'`).join(',');
      let results;
      let sql = `SELECT DISTINCT
              q.question_id AS question_id,
              q.title AS question_title,
              q.description AS question_description,
              q.question_type_id AS question_type_id,
              q.is_for_dynamic_entity AS is_for_dynamic_entity,
              q.entity AS entity,
              q.dynamic_remark AS dynamic_remark,
              q.dynamic_allow_multiple AS dynamic_allow_multiple,
              q.created_date AS created_date,
              qt.title AS question_type_title,
              qt.field_type AS question_field_type FROM
              question AS q
              LEFT JOIN question_type AS qt
              ON q.question_type_id = qt.question_type_id
              WHERE q.question_id IN (${templateLit}) AND q.status = '${ACCOUNT_STATUS.active}'`;

      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);

      results = rawResult.rows;

      if (results.length > 0) {
        let response = [];
        for (let item of results) {
          const optionsValue = item.question_id
              ? await getQuestionOptions(req, item.question_id)
              : [];
          response.push({
            question_id            : item.question_id,
            title                  : item.question_title,
            description            : item.question_description,
            question_type_id       : item.question_type_id,
            is_for_dynamic_entity  : item.is_for_dynamic_entity,
            entity                 : item.entity,
            dynamic_remark         : item.dynamic_remark,
            dynamic_allow_multiple : item.dynamic_allow_multiple,
            created_date           : item.created_date,
            field_type             : item.field_type,
            options                : optionsValue,
          });
        }

        return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(
            undefined,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  }
};
