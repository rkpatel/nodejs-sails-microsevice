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
const DynamicQuestionValidations = require('../validations/DynamicQuestionValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const moment = require('moment');
const {  RESPONSE_STATUS, ACCOUNT_STATUS, ANSWER_FORMAT } = require('../utils/constants/enums');
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');

const answerOption=async (answer_options)=>{
  return answer_options.length > 0 ? answer_options : [];
};

const createdDates=async (item,req)=>{
  return item.created_date ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '';
};

const quesOptionData=async(questionOptions,dynamic_question_id,questionOptions_arr,req)=>{
  for (const quetion of questionOptions) {
    questionOptions_arr.push({ dynamic_question_id: dynamic_question_id, option_value: quetion.option_value, sequence: quetion.sequence, created_by: req.user.user_id, created_date: getDateUTC(),  last_updated_by: req.user.user_id });
  }
};

const lastSequence=async(lastRecord)=>{
  return lastRecord.length > 0 ? lastRecord[0].sequence+1 : 1;
};

const updatedRecordsData=async(results,draggable_id,updaterecords,droppable_id,condition)=>{
  return results.forEach((record)=>{
    if((condition && record.sequence >= draggable_id && record.sequence <= droppable_id) || (!condition && record.sequence <= draggable_id && record.sequence >= droppable_id)) {
      // eslint-disable-next-line eqeqeq
      if(record.sequence == draggable_id){
        updaterecords.push({
          ...record,
          sequence : droppable_id
        });
      }
      else{
        
        updaterecords.push({
          ...record,
          sequence : condition ? record.sequence - 1 : record.sequence + 1 
        });
      } 
    }    
    sails.log('updaterecords', updaterecords);
  });
};

const addOptionData=async(questionOptions)=>{
  return questionOptions && questionOptions.length ? questionOptions.filter(item => item.action === 'Add') : [];
};

const editOptionData=async(questionOptions)=>{
  return questionOptions && questionOptions.length ? questionOptions.filter(item => item.action === 'Edit') : [];
};
const deleteOptionData=async(questionOptions)=>{
  return questionOptions && questionOptions.length ? questionOptions.filter(item => item.action === 'Delete') : [];
};

const loopEditData=async(editOption,req)=>{
  for(const index in editOption){
    return DynamicQuestionOption.update({ dynamic_question_option_id: editOption[index].dynamic_question_option_id },{
      option_value      : editOption[index].option_value,
      sequence          : editOption[index].sequence,
      last_updated_by   : req.user.user_id,
      last_updated_date : getDateUTC()
    }).fetch().usingConnection(req.dynamic_connection);
  }
};

const loopDestroyData=async(deleteOption,req)=>{
  for(const index in deleteOption){
    return DynamicQuestionOption.destroy({dynamic_question_option_id: deleteOption[index].dynamic_question_option_id}).fetch().usingConnection(req.dynamic_connection);
  }
};

const statusConditionData=(prop,data,sql)=>{
  if ((prop === 'status') && (data[prop] !== '')) {
    sql = sql + ` AND dq.status = '${escapeSearch(data[prop])}'`;
  }
  return sql;
};

const questionConditionData=(prop,data,sql)=>{
  if ((prop === 'question') && (data[prop] !== '')) {
    sql = sql + ` AND dq.question LIKE '%${escapeSearch(data[prop])}%'`;
  }
  return sql;
};

const answerFormatConditionData=(prop,data,sql)=>{
  if ((prop === 'answer_format') && (data[prop] !== '')) {
    sql = sql + ` AND dq.answer_format = '${data[prop]}'`;
  }
  return sql;
};

const createdByConditionData=(prop,data,sql)=>{
  if (prop === 'created_by' && data[prop] !== '') {
    sql = sql + ` AND (concat(u1.first_name, " ", u1.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
  }
  return sql;
};

const createdDateConditionData=(prop,data,sql)=>{
  if (prop === 'created_date') {
    if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
    {
      const createdDate = moment(data[prop]).format('YYYY-MM-DD');
      sql = sql + ` AND (date(dq.${prop}) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;               
    }
  }
  return sql;  
};

const updatedDateConditionData=(prop,data,sql)=>{
  if (prop === 'updated_by' && data[prop] !== '') {
    sql = sql + ` AND (concat(u2.first_name, " ", u2.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
  }
  return sql;
};

const lastUpdatedDateConditionData=(prop,data,sql)=>{
  if (prop === 'last_updated_date') {
    if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
    {
      const updatedDate = moment(data[prop]).format('YYYY-MM-DD');
      sql = sql + ` AND (date(dq.${prop}) BETWEEN ('${updatedDate}') AND ('${updatedDate}'))`;               
    }
  }
  return sql;
};

const createdDateDatas=(item,req)=>{
  return (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '';
};

const lastUpdatedDateDatas=(item,req)=>{
  return (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '';
};

const finalReportResponseData=(result,req,reportResponse,resultsLength)=>{
  for (let item of result) {
    reportResponse.push({
      dynamic_question_id   : item.dynamic_question_id,
      question              : item.question,
      required              : item.required,
      answer_format         : item.answer_format,
      status                : item.status,
      sequence              : item.sequence,
      answer_options        : item.answer_options,
      created_by            : item.created_by,
      updated_by            : item.updated_by,
      created_date          : createdDateDatas(item,req),
      last_updated_date     : lastUpdatedDateDatas(item,req),
    });
  }
  let newData={};
  newData = {
    totalRecords : resultsLength.length,
    listData     : reportResponse
  };
  return newData;
};

module.exports = {
  add: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await DynamicQuestionValidations.add.validate(request);
      if (!isValidate.error) {
        const { question, required, answer_format, questionOptions } = request;
        const queString = question.trim();
        const dynamicQuestion = await DynamicQuestion.findOne({ question: queString }).usingConnection(req.dynamic_connection);
        if (dynamicQuestion) {
          return res.ok(undefined, messages.DYNAMIC_QUESTION_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const lastRecord = await DynamicQuestion.find().sort('sequence DESC').limit(1).usingConnection(req.dynamic_connection);
          let last_sequence = await lastSequence(lastRecord);

          const newQuestion = await DynamicQuestion.create({
            question : queString,
            required,
            answer_format,
            status: ACCOUNT_STATUS.active,
            sequence: last_sequence,
            created_by : req.user.user_id,
            created_date: getDateUTC(),
            last_updated_by : null
          }).fetch().usingConnection(req.dynamic_connection);

          const dynamic_question_id = newQuestion.dynamic_question_id;

          const questionOptions_arr = [];
  
          if(answer_format === ANSWER_FORMAT.multiple_choice && questionOptions !== undefined) {
            await quesOptionData(questionOptions,dynamic_question_id,questionOptions_arr,req);
  
            if (questionOptions_arr.length > 0) { await DynamicQuestionOption.createEach(questionOptions_arr).usingConnection(req.dynamic_connection); }
          }
          return res.ok(undefined, messages.ADD_DYNAMIC_QUESTION_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        res.ok(isValidate.error, messages.ADD_DYNAMIC_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.ADD_DYNAMIC_QUESTION_FAILURE, RESPONSE_STATUS.error);
    }
  },

  find: async function (req, res) {
    try{
      let request = req.allParams();
      let {  perPage } = request;
      const isValidate = await DynamicQuestionValidations.filter.validate(request);
      if (!isValidate.error) {
        let result;
        const findQuery = await commonListing(request);
        let sql = `SELECT dq.dynamic_question_id, dq.question, dq.required, dq.answer_format, dq.status, dq.sequence, 
                  GROUP_CONCAT(dqo.option_value) AS answer_options,
                  CONCAT(u1.first_name, " ", u1.last_name) AS created_by,
                  CONCAT(u2.first_name, " ", u2.last_name) AS updated_by,
                  dq.created_date, dq.last_updated_date
                  FROM dynamic_question AS dq 
                  LEFT JOIN dynamic_question_option AS dqo ON dqo.dynamic_question_id = dq.dynamic_question_id 
                  LEFT JOIN ${process.env.DB_NAME}.user as u1 ON u1.user_id = dq.created_by
                  LEFT JOIN ${process.env.DB_NAME}.user as u2 ON u2.user_id = dq.last_updated_by`;
        
        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          sql = sql + ` WHERE 1=1 `;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              let statusData=statusConditionData(prop,data,sql);
              sql=statusData;
              let questionData=questionConditionData(prop,data,sql);
              sql=questionData;
              let ansFormatData=answerFormatConditionData(prop,data,sql);
              sql=ansFormatData;
              let createdByData=createdByConditionData(prop,data,sql);
              sql=createdByData;
              let createdDateData=createdDateConditionData(prop,data,sql);
              sql=createdDateData;           
              let updatedDateData=updatedDateConditionData(prop,data,sql);
              sql=updatedDateData;
              let lastUpdatedDateData=lastUpdatedDateConditionData(prop,data,sql);
              sql=lastUpdatedDateData;
            });
          }
        }
        if(findQuery.sort === 'status DESC')
        {
          findQuery.sort = `dq.status DESC`;
        }
        else if(findQuery.sort === 'status ASC')
        {
          findQuery.sort = `dq.status ASC`;
        }

        
        sql = sql + ` GROUP BY dq.dynamic_question_id ORDER BY ${findQuery.sort} `;

        const lengthsql = sql;
        const rawResultLength = await sails.sendNativeQuery(escapeSqlSearch(lengthsql)).usingConnection(req.dynamic_connection);
        const resultsLength = rawResultLength.rows;
        sql = sql + ` limit ${perPage} offset ${findQuery.skip}`;
        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        result = rawResult.rows;

        if (result) {
          let allData = {};
          let reportResponse = [];
          allData=finalReportResponseData(result,req,reportResponse,resultsLength);
  
          return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);
  
        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      
      } else {
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  updateStatus: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await DynamicQuestionValidations.updatestatus.validate(request);
      if (!isValidate.error) {
        const { id, status } = req.allParams();
        await DynamicQuestion.update({ dynamic_question_id: id }, { status: status })
          .fetch()
          .usingConnection(req.dynamic_connection);

        if (status === ACCOUNT_STATUS.active) {
          res.ok(undefined, messages.DYNAMIC_QUESTION_ACTIVED, RESPONSE_STATUS.success);
        } else if (status === ACCOUNT_STATUS.inactive) {
          res.ok(undefined, messages.DYNAMIC_QUESTION_INACTIVED, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.DYNAMIC_QUESTION_FAIL, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.DYNAMIC_QUESTION_FAIL, RESPONSE_STATUS.error);
    }
  },

  findById: async function (req, res) {
    try {
      const dynamic_question_id = parseInt(req.params.id);
      const QuestionDetail = await DynamicQuestion.findOne({dynamic_question_id}).usingConnection(req.dynamic_connection);
      let results;
      if (QuestionDetail) {
        let sql = `SELECT
                  dq.question, dq.required, dq.answer_format, dq.status, dq.sequence, 
                  CONCAT(user.first_name, " ", user.last_name) AS created_by, dq.created_date
                  FROM dynamic_question As dq
                  LEFT JOIN ${process.env.DB_NAME}.user ON user.user_id = dq.created_by
                  WHERE dq.dynamic_question_id = ${dynamic_question_id}`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows[0] || null;

        if (results) {
          let questionSql = `SELECT dqo.dynamic_question_option_id, dqo.dynamic_question_id, dqo.option_value, dqo.sequence, dqo.created_date, dqo.last_updated_date,
          CONCAT(u1.first_name, " ", u1.last_name) AS created_by, CONCAT(u2.first_name, " ", u2.last_name) AS updated_by 
          FROM dynamic_question_option As dqo
          LEFT JOIN ${process.env.DB_NAME}.user as u1 ON u1.user_id = dqo.created_by
          LEFT JOIN ${process.env.DB_NAME}.user as u2 ON u2.user_id = dqo.last_updated_by
          WHERE dqo.dynamic_question_id = '${dynamic_question_id}'
          ORDER BY dqo.sequence ASC`;

          const rawQuestionsResult = await sails.sendNativeQuery(escapeSqlSearch(questionSql)).usingConnection(req.dynamic_connection);
          const questionsResults = rawQuestionsResult.rows;

          const optionsResponse = [];
          for (const questionsResult of questionsResults) {
            optionsResponse.push({
              dynamic_question_option_id : questionsResult.dynamic_question_option_id,
              dynamic_question_id : questionsResult.dynamic_question_id,
              option_value     : questionsResult.option_value,
              sequence         : questionsResult.sequence,
              created_by       : questionsResult.created_by,
              created_date     : questionsResult.created_date,
              updated_by       : questionsResult.updated_by,
              updated_date     : questionsResult.last_updated_date,
            });
          }
          results.options = optionsResponse;
          return res.ok(results, messages.GET_RECORD, RESPONSE_STATUS.success);

        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  optionminmax: async function (_req, res) {
    try {
      const optionDetail = await AdminSettings.find({where: { code: ['dynamic_question_option_min', 'dynamic_question_option_max']}});
      if (optionDetail) {
        let optionsResponse = [];
        for (const option of optionDetail) { 
          optionsResponse.push({
            code : option.code,
            value : option.value,
          });
        }
        return res.ok(optionsResponse, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
  edit: async function (req, res) {
    try{
      let request = req.allParams();
      const isValidate = await DynamicQuestionValidations.edit.validate(request);
      if (!isValidate.error) {
        const { question, required, answer_format, questionOptions } = request;
        const dynamicquestion = await DynamicQuestion.findOne({
          question,
          dynamic_question_id: { '!=': req.params.id }
        }).usingConnection(req.dynamic_connection);

        if (dynamicquestion) {
          return res.ok(undefined, messages.DYNAMIC_QUESTION_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{

          let result = await DynamicQuestion.update({ dynamic_question_id: req.params.id },
            {
              question,
              required,
              answer_format,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);

          if(answer_format === ANSWER_FORMAT.multiple_choice && questionOptions !== undefined) {
            // Three array , add,edit,delete
            let addOption =await addOptionData(questionOptions);
            let editOption =  await editOptionData(questionOptions);
            let deleteOption =  await deleteOptionData(questionOptions);

            // Loop edit
            await loopEditData(editOption,req);

            // Loop Destroy
            await loopDestroyData(deleteOption,req);

            // Loop addoption add
            for(const index in addOption){
              await DynamicQuestionOption.create({
                dynamic_question_id : req.params.id,
                option_value        : addOption[index].option_value,
                sequence            : addOption[index].sequence,
                created_by          : req.user.user_id,
                created_date        : getDateUTC()
              }).fetch().usingConnection(req.dynamic_connection);
            }

          }

          
          return res.ok(result, messages.UPDATE_DYNAMIC_QUESTION_TYPE_SUCCESS, RESPONSE_STATUS.success);
        }
      }
      else
      {
        return res.ok(isValidate.error, messages.UPDATE_DYNAMIC_QUESTION_TYPE_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log('error in edit dynamic question',error);
      return res.ok(undefined, messages.UPDATE_DYNAMIC_QUESTION_TYPE_FAILURE, RESPONSE_STATUS.error);
    }
  },

  sequence: async function(req,res){
    try{
      let sql='SELECT sequence,dynamic_question_id from dynamic_question ORDER BY sequence ASC'; // dynamic_question_id, sorting sequence
      const rawresult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      const results = rawresult.rows;

      let updaterecords = [];
      
      let { draggable_id , droppable_id} = req.body;

      let condition;
      if(draggable_id < droppable_id) {condition = true;}
      else {condition = false;} 
      sails.log('results', results);

      if(draggable_id!==droppable_id){
        if(results && results.length > 0){
          await updatedRecordsData(results,draggable_id,updaterecords,droppable_id,condition);  

          for(const item in updaterecords){
            await DynamicQuestion.update({ dynamic_question_id : updaterecords[item].dynamic_question_id },{
              sequence: updaterecords[item].sequence
            }).usingConnection(req.dynamic_connection);
          }

          return res.ok(undefined,'Sequence updated', RESPONSE_STATUS.success);
        }
        else{
          sails.log('Sequence updated');
          return res.ok(undefined,'Sequence updated', RESPONSE_STATUS.success);

        }
      }
      else{
        return res.ok(undefined,'Sequence updated', RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log('error in updating sequence',error);
      return res.ok(undefined, 'Sequence udpate failed', RESPONSE_STATUS.error);
    }
  
  },
  answer: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await DynamicQuestionValidations.answer.validate(request);
      if (!isValidate.error) {
        const { dynamic_questions,employee_profile_id } = request;


        for(const dynamic_question of dynamic_questions){
          let obj = {
            dynamic_question_id : dynamic_question.dynamic_question_id,
            employee_profile_id : employee_profile_id,
            answer : dynamic_question.answer,
            created_by : req.user.user_id,
            created_date : getDateUTC()
          };

          
          if('dynamic_question_option_id' in dynamic_question && dynamic_question.dynamic_question_option_id !== undefined){
            obj.dynamic_question_option_id = dynamic_question.dynamic_question_option_id;
          }else{
            obj.dynamic_question_option_id = null;
          }

          await DynamicQuestionAnswer.create(obj).fetch().usingConnection(req.dynamic_connection);
        }


        return res.ok(undefined, messages.ADD_DYNAMIC_QUESTION_ANSWER_SUCCESS, RESPONSE_STATUS.success);

      }
      else
      {
        res.ok(isValidate.error, messages.ADD_DYNAMIC_QUESTION_ANSWER_FAILURE, RESPONSE_STATUS.error);
      }
    }
    catch (error) {
      sails.log.error(error);
      return res.ok(undefined, messages.ADD_DYNAMIC_QUESTION_ANSWER_FAILURE, RESPONSE_STATUS.error);
    }
  },
  
  getList: async function (req, res) {
    try{
      let result;
      let sql = `SELECT dq.dynamic_question_id, dq.question, dq.required, dq.answer_format, dq.status, dq.sequence, 
                  GROUP_CONCAT(dqo.option_value,"#$#",dqo.dynamic_question_option_id SEPARATOR '##@##') AS answer_options,
                  CONCAT(u1.first_name, " ", u1.last_name) AS created_by,
                  CONCAT(u2.first_name, " ", u2.last_name) AS updated_by,
                  dq.created_date, dq.last_updated_date
                  FROM dynamic_question AS dq 
                  LEFT JOIN dynamic_question_option AS dqo ON dqo.dynamic_question_id = dq.dynamic_question_id 
                  LEFT JOIN ${process.env.DB_NAME}.user as u1 ON u1.user_id = dq.created_by
                  LEFT JOIN ${process.env.DB_NAME}.user as u2 ON u2.user_id = dq.last_updated_by
                  where dq.status = 'Active'
                  GROUP BY dq.dynamic_question_id ORDER BY dq.sequence`;
        
      const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      result = rawResult.rows;

      if (result) {
        let reportResponse = [];
        let answeroptions = [];
        
        for (let item of result) { 
          let answer_options = [];
          if(item.answer_options !== null){
            answeroptions = item.answer_options.split('##@##');
            for(let i of answeroptions)
            {   
              let obj = {};                       
              const ansoption = i.split('#$#');
              obj['dynamic_question_option_id'] = ansoption[1];
              obj['dynamic_question_option_value'] = ansoption[0];              
              answer_options.push(obj);
            } 
          }
          reportResponse.push({
            dynamic_question_id   : item.dynamic_question_id,
            question              : item.question,
            required              : item.required,
            answer_format         : item.answer_format,
            status                : item.status,
            sequence              : item.sequence,
            answer_options        : await answerOption(answer_options),
            created_by            : item.created_by,
            updated_by            : item.updated_by,
            created_date          : await createdDates(item,req),
            last_updated_date     : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
          });
        }
  
        return res.ok(reportResponse, messages.GET_RECORD, RESPONSE_STATUS.success);
  
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
      
    }
    catch(error)
    {
      sails.log.error(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  getSubmittedAnswer: async function (req, res) {
    try{
      const employee_profile_id = parseInt(req.params.id);
      const QuestionList = await DynamicQuestionAnswer.find({employee_profile_id}).usingConnection(req.dynamic_connection);
      let results;

      if (QuestionList.length> 0) {
        let sql = `SELECT
        edqa.dynamic_question_id AS question_id,
        dq.question as question, 
        dq.sequence as sequence,
        dq.required as required,
        dq.answer_format as answer_format, 
        edqa.dynamic_question_option_id as dynamic_question_option_id,
        edqa.answer as answer
        FROM 
        employee_dynamic_question_answer as edqa
        LEFT JOIN dynamic_question as dq
        ON edqa.dynamic_question_id = dq.dynamic_question_id
        WHERE edqa.employee_profile_id = ${employee_profile_id}`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;
        
        if (results.length > 0) {
          let response = [];
          for (let i of results) {
            response.push({
              question_id             : i.question_id,
              question                : i.question,
              sequence                : i.sequence,
              required                : i.required,
              answer_format           : i.answer_format,
              answer                  : i.answer,
              question_option_id      : i.dynamic_question_option_id,
            });               
          }
          return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }

      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    } catch(err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  } 
};
