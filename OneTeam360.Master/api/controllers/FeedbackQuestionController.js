const messages = require('../utils/constants/message');
const { RESPONSE_STATUS, QUESTION_STATUS,FEEDBACK_CATEGORY,ACCOUNT_STATUS, FEEDBACK_QUESTION } = require('../utils/constants/enums');
const { getDateUTC,getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const moment = require('moment');
const FeedbackQuestionValidations = require('../validations/FeedbackQuestionValidations');
const { escapeSqlSearch ,  commonListing, escapeSearch} = require('../services/utils');


const getQuestionLocations = async function (req, questionId) {
  let results = '';
  let sql = `SELECT location_id
    FROM feedback_question_location WHERE feedback_question_id = ${questionId} AND status = '${QUESTION_STATUS.active}'`;

  const rawResult = await sails
    .sendNativeQuery(escapeSqlSearch(sql))
    .usingConnection(req.dynamic_connection);

  results = rawResult.rows;

  const responseData = [];
  for (let item of results) {
    responseData.push(item.location_id);
  }
  return responseData;
};
const lastRecordDetails = (lastRecord) => {
  return lastRecord.length > 0 ? lastRecord[0].sequence+1 : 1;
};

const sequenceCondition=async(condition,record)=>{
  return condition ? record.sequence - 1 : record.sequence + 1;
};

const resultsData=async(results,condition,draggable_id,droppable_id,updaterecords,req,res)=>{
  results.forEach((record)=>{
    if((condition && record.sequence >= draggable_id && record.sequence <= droppable_id) || (!condition && record.sequence <= draggable_id && record.sequence >= droppable_id)) {

      // eslint-disable-next-line eqeqeq
      if(record.sequence == draggable_id){
        updaterecords.push({
          ...record,
          sequence: droppable_id
        });
      }
      else{
        updaterecords.push({
          ...record,
          sequence: sequenceCondition(condition,record)
        });
      }
      return updaterecords;
    }
  });

  for(const item in updaterecords){
    return FeedbackQuestion.update({ feedback_question_id: updaterecords[item].feedback_question_id },{
      sequence      : updaterecords[item].sequence,
      modified_by   : req.user.user_id,
      modified_date : getDateUTC()
    }).usingConnection(req.dynamic_connection);
  }
  return res.ok(undefined,messages.UPDATE_SEQUENCE_SUCCESS, RESPONSE_STATUS.success);
};

const statusDatas=(prop,data,sql)=>{
  if ((prop === 'status') && (data[prop] !== '')) {
    sql = sql + ` AND fq.status = '${escapeSearch(data[prop])}'`;
  }
  return sql;
};

const questionDatas=(prop,sql,data)=>{
  if ((prop === 'question') && (data[prop] !== '')) {
    sql = sql + ` AND fq.question LIKE '%${escapeSearch(data[prop])}%'`;
  }
  return sql;
};

const createdByDatas=(prop,sql,data)=>{
  if (prop === 'created_by' && data[prop] !== '') {
    sql = sql + ` AND (concat(created_by.first_name, " ", created_by.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
  }
  return sql;
};

const createdData=(prop,sql,data)=>{
  if (prop === 'created_date') {
    if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
    {
      const createdDate = moment(data[prop]).format('YYYY-MM-DD');
      sql = sql + ` AND (date(fq.${prop}) BETWEEN ('${createdDate}') AND ('${createdDate}'))`;
    }
  }
  return sql;
};

const modifiedDateDatas=(prop,sql,data)=>{
  if (prop === 'modified_date') {
    if((data[prop].from_date !== '') && (data[prop].to_date !== ''))
    {
      const updatedDate = moment(data[prop]).format('YYYY-MM-DD');
      sql = sql + ` AND (date(fq.${prop}) BETWEEN ('${updatedDate}') AND ('${updatedDate}'))`;
    }
  }
  return sql;
};

const modifiedByDatas=(prop,sql,data)=>{
  if (prop === 'modified_by' && data[prop] !== '') {
    sql = sql + ` AND (concat(modified_by_user.first_name, " ", modified_by_user.last_name) LIKE '%${escapeSearch(data[prop])}%') `;
  }
  return sql;
};

const locationDatas=(prop,sql,data)=>{
  if (prop === 'location' && data[prop].length > 0) {
    let locationPayload = data[prop];
    const location = locationPayload
        .map((c) => `'${c}'`)
        .join(', ');
    const locationId = '(' + location + ')';
    sql = sql + ` AND location.location_id IN ${locationId}`;
  }
  return sql;
};

const createdDateDatas=(sortField,sortOrder,sql)=>{
  if(sortField === 'created_date') {sql += ` , fq.created_date ${sortOrder} `;}
  return sql;
};

const feedbackQuestionIdDatas=(sortField,sortOrder,sql)=>{
  if(sortField === 'feedback_question_id') {sql += ` , fq.feedback_question_id ${sortOrder} `;}
  return sql;
};

const locationDataCondition=(feedback_category,item)=>{
  return feedback_category === FEEDBACK_QUESTION.Location ? {location: item.location_name} : { };
};

const createdConditionData=(item,req)=>{
  return (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '';
};

const modifiedConditionData=(item,req)=>{
  return (item.modified_date) ? getDateSpecificTimeZone(item.modified_date, req.timezone, req.dateFormat) : '';
};

const reportResponseData=(result,feedback_category,reportResponse,req)=>{
  for (let item of result) {
    const locationData = locationDataCondition(feedback_category,item);
    reportResponse.push({
      feedback_question_id : item.feedback_question_id,
      feedback_category    : item.feedback_category,
      question             : item.question,
      is_required          : item.is_required,
      status               : item.status,
      sequence             : item.sequence,
      created_by           : item.created_by,
      modified_by          : item.modified_by,
      created_date         : createdConditionData(item,req),
      modified_date        : modifiedConditionData(item,req),
      ...locationData
    });
  }
  return reportResponse;
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();

      const isValidate = await FeedbackQuestionValidations.add.validate(request);
      if (!isValidate.error) {
        const {
          feedback_category,
          question,
          is_required,
          location_id
        } = req.allParams();

        const queString = question.trim().toLowerCase();
        const existingQuestion = await FeedbackQuestion.findOne({ question: queString, feedback_category }).usingConnection(req.dynamic_connection);
        if (existingQuestion) {
          return res.ok(undefined, messages.FEEDBACK_QUESTION_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const lastRecord = await FeedbackQuestion.find({feedback_category}).sort('sequence DESC').limit(1).usingConnection(req.dynamic_connection);
          let last_sequence =lastRecordDetails(lastRecord);

          const newQuestion = await FeedbackQuestion
              .create({
                feedback_category : feedback_category,
                question          : question,
                is_required       : is_required,
                sequence          : last_sequence,
                status            : QUESTION_STATUS.active,
                created_by        : req.user.user_id,
                created_date      : getDateUTC()
              })
              .fetch()
              .usingConnection(req.dynamic_connection);

          if(feedback_category === FEEDBACK_CATEGORY.location && location_id){

            const location_arr = [];
            await location_id.map((loc_id) => {
              location_arr.push({
                feedback_question_id : newQuestion.feedback_question_id,
                location_id          : loc_id,
                status               : QUESTION_STATUS.active
              });
            });

            if (location_arr.length > 0) {
              await FeedbackQuestionLocation
                    .createEach(location_arr)
                    .usingConnection(req.dynamic_connection);
            }
          }

          return res.ok(undefined,messages.ADD_FEEDBACK_QUESTION_SUCCESS, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(
              isValidate.error,
              messages.ADD_FEEDBACK_QUESTION_FAILURE,
              RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
            undefined,
            messages.ADD_FEEDBACK_QUESTION_FAILURE,
            RESPONSE_STATUS.error
      );
    }
  },

  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await FeedbackQuestionValidations.edit.validate(request);
      if (!isValidate.error) {
        const {
          id,
          feedback_category,
          question,
          is_required,
          location_id
        } = req.allParams();

        const queString = question.trim().toLowerCase();
        const existingQuestion = await FeedbackQuestion.findOne({ question: queString, feedback_category, feedback_question_id: { '!=': id }}).usingConnection(req.dynamic_connection);
        if (existingQuestion) {
          return res.ok(undefined, messages.FEEDBACK_QUESTION_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          await FeedbackQuestion
              .update({feedback_question_id: id},{
                feedback_category : feedback_category,
                question          : question,
                is_required       : is_required,
                modified_by       : req.user.user_id,
                modified_date     : getDateUTC()
              })
              .usingConnection(req.dynamic_connection);

          if(feedback_category === FEEDBACK_CATEGORY.location && location_id){

            const queLocations= await FeedbackQuestionLocation.find({ feedback_question_id: id }).usingConnection(req.dynamic_connection);

            if(queLocations.length > 0){
              const queLocations_id = queLocations.map(queLocation => queLocation.location_id);
              const add_location = location_id.filter((f) => !queLocations_id.includes(f));
              const dlt_location = queLocations.filter((f) => !location_id.includes(f.location_id)).map(queLocation => queLocation.location_id);
              const queLocations_inactive = queLocations.filter((f) => {
                if(f.status === QUESTION_STATUS.inactive){
                  return f;
                }}).map(queLocation => queLocation.location_id);

              const add_new_location_arr = [];
              if(add_location.length > 0){
                await add_location.map((lc) => {
                  {add_new_location_arr.push({
                    feedback_question_id : id,
                    location_id          : lc,
                    status               : QUESTION_STATUS.active
                  });}
                });

                if (add_new_location_arr.length > 0) {
                  await FeedbackQuestionLocation
                        .createEach(add_new_location_arr)
                        .usingConnection(req.dynamic_connection);
                }
              }

              if(queLocations_inactive.length > 0){
                const existing_inactive_location = location_id.filter((f) => queLocations_inactive.includes(f));
                if(existing_inactive_location.length > 0){
                  for(const lc of existing_inactive_location){
                    await FeedbackQuestionLocation.update({ feedback_question_id: id, location_id: lc }, { status: QUESTION_STATUS.active })
                    .usingConnection(req.dynamic_connection);
                  }
                }
              }

              if(dlt_location.length > 0){
                for(const lc of dlt_location){
                  await FeedbackQuestionLocation.update({ feedback_question_id: id, location_id: lc }, { status: QUESTION_STATUS.inactive })
                  .usingConnection(req.dynamic_connection);
                }
              }

            }
          }
          return res.ok(undefined,messages.UPDATE_FEEDBACK_QUESTION_SUCCESS, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(
              isValidate.error,
              messages.UPDATE_FEEDBACK_QUESTION_FAILURE,
              RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
            undefined,
            messages.UPDATE_FEEDBACK_QUESTION_FAILURE,
            RESPONSE_STATUS.error
      );
    }
  },

  updateStatus: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await FeedbackQuestionValidations.updateStatus.validate(request);
      if (!isValidate.error) {
        const { id, status } = req.allParams();
        await FeedbackQuestion.update({ feedback_question_id: id },
          { status        : status,
            modified_by   : req.user.user_id,
            modified_date : getDateUTC()
          })
          .fetch()
          .usingConnection(req.dynamic_connection);

        if (status === QUESTION_STATUS.active) {
          res.ok(undefined, messages.FEEDBACK_QUESTION_ACTIVATED, RESPONSE_STATUS.success);
        } else if (status === QUESTION_STATUS.inactive) {
          res.ok(undefined, messages.FEEDBACK_QUESTION_INACTIVATED, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.FEEDBACK_QUESTION_STATUS_UPDATE_FAIL, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.FEEDBACK_QUESTION_STATUS_UPDATE_FAIL, RESPONSE_STATUS.error);
    }
  },

  findById: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await FeedbackQuestionValidations.findById.validate(request);
      if (!isValidate.error) {
        const questionId = req.params.id;
        const questionDetail = await FeedbackQuestion
          .findOne({
            feedback_question_id: questionId,
          })
          .usingConnection(req.dynamic_connection);

        let result = {};

        if (questionDetail) {

          let sql = `SELECT fq.feedback_question_id, fq.feedback_category, fq.status, fq.question, concat(created_by.first_name, " ", created_by.last_name) as created_by, fq.created_date as created_date,fq.modified_date AS modified_date, concat(modified_by_user.first_name, " ", modified_by_user.last_name) as modified_by, fq.is_required,fq.sequence
            FROM feedback_question fq
            INNER JOIN ${process.env.DB_NAME}.user created_by
            ON created_by.user_id = fq.created_by
            LEFT JOIN ${process.env.DB_NAME}.user modified_by_user
            ON modified_by_user.user_id = fq.modified_by
            WHERE fq.feedback_question_id = ${questionId}`;

          const rawResult = await sails
            .sendNativeQuery(escapeSqlSearch(sql))
            .usingConnection(req.dynamic_connection);

          result = rawResult.rows[0];

          if(result.feedback_category === FEEDBACK_CATEGORY.location){
            result.location_id = await getQuestionLocations(req, result.feedback_question_id);
          }
          return res.ok(
              result,
              messages.GET_RECORD,
              RESPONSE_STATUS.success
          );
        } else {
          return res.ok(
            result,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        res.ok(
          isValidate.error,
          messages.GET_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  updateSequence: async function(req,res){
    try{
      let request = req.allParams();
      const isValidate = await FeedbackQuestionValidations.updateSequence.validate(request);
      if (!isValidate.error) {
        sails.log('request',request);
        let {
          draggable_id , droppable_id, feedback_category
        } = req.allParams();

        let sql=`SELECT sequence, feedback_question_id from feedback_question WHERE feedback_category = '${feedback_category}' ORDER BY sequence ASC`; // dynamic_question_id, sorting sequence
        const rawresult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        const results = rawresult.rows;

        let updaterecords = [];

        let condition;
        if(draggable_id < droppable_id) {condition = true;}
        else {condition = false;}

        if(draggable_id!==droppable_id){
          if(results && results.length > 0){
            await resultsData(results,condition,draggable_id,droppable_id,updaterecords,req,res);
          }
          else{
            return res.ok(undefined,messages.UPDATE_SEQUENCE_SUCCESS, RESPONSE_STATUS.success);
          }
        }
        else{
          return res.ok(undefined,messages.UPDATE_SEQUENCE_SUCCESS, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(
              isValidate.error,
              messages.UPDATE_SEQUENCE_FAILURE,
              RESPONSE_STATUS.error
        );
      }
    }
    catch(error)
    {
      sails.log('error in updating sequence',error);
      return res.ok(undefined, messages.UPDATE_SEQUENCE_FAILURE, RESPONSE_STATUS.error);
    }

  },

  findScaleList: async (req, res) => {
    try {
      let results = {};

      let sql = `SELECT feedback_rating_scale_id, name, scale, status
            FROM feedback_rating_scale`;

      const rawResult = await sails
            .sendNativeQuery(escapeSqlSearch(sql))
            .usingConnection(req.dynamic_connection);

      results = rawResult.rows;

      let data = {
        totalResults    : results.length,
        ratingScaleList : results
      };

      if (results.length > 0) {
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

    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  getFeedback: async function (req, res) {
    try{
      let request = req.allParams();
      const isValidate = await FeedbackQuestionValidations.ManLoclist.validate(request);
      if(!isValidate.error) {
        const { feedback_category, sortField, sortOrder,perPage } = request;
        const {andCondition, skip } = await commonListing(request);
        let sql;
        // eslint-disable-next-line eqeqeq
        if(feedback_category == FEEDBACK_QUESTION.Manager){

          sql = `SELECT fq.feedback_question_id, fq.status,fq.question, concat(created_by.first_name, " ", created_by.last_name) as created_by, fq.created_date as created_date,fq.modified_date AS modified_date, concat(modified_by_user.first_name, " ", modified_by_user.last_name) as modified_by, fq.is_required,fq.sequence
           FROM feedback_question fq
           INNER JOIN ${process.env.DB_NAME}.user created_by
           ON created_by.user_id = fq.created_by
           LEFT JOIN ${process.env.DB_NAME}.user modified_by_user
           ON modified_by_user.user_id = fq.modified_by
           WHERE fq.feedback_category = '${FEEDBACK_QUESTION.Manager}' `;

        // eslint-disable-next-line eqeqeq
        } else if(feedback_category == FEEDBACK_QUESTION.Location) {
          sql = `SELECT fq.feedback_question_id,fq.status,GROUP_CONCAT(location.name) as location_name,fq.question, concat(created_by.first_name, " ", created_by.last_name) as created_by, fq.created_date as created_date,fq.modified_date AS modified_date, concat(modified_by_user.first_name, " ", modified_by_user.last_name) as modified_by,fq.is_required,fq.sequence
            FROM feedback_question fq
            INNER JOIN feedback_question_location fql
            ON fql.feedback_question_id = fq.feedback_question_id
            INNER JOIN location location
            ON location.location_id =  fql.location_id
            INNER JOIN ${process.env.DB_NAME}.user created_by
            ON created_by.user_id = fq.created_by
            LEFT JOIN ${process.env.DB_NAME}.user modified_by_user
            ON modified_by_user.user_id = fq.modified_by
            WHERE fq.feedback_category = '${FEEDBACK_QUESTION.Location}' AND fql.status = '${QUESTION_STATUS.active}'`;
        }

        for (const data of andCondition) {
          Object.keys(data).forEach((prop) => {
            let statusData =statusDatas(prop,data,sql);
            sql=statusData;

            let questionData=questionDatas(prop,sql,data);
            sql=questionData;

            let createdByData=createdByDatas(prop,sql,data);
            sql=createdByData;

            let createdDateData=createdData(prop,sql,data);
            sql=createdDateData;

            let modifiedDateData=modifiedDateDatas(prop,sql,data);
            sql=modifiedDateData;

            let modifiedByData=modifiedByDatas(prop,sql,data);
            sql=modifiedByData;

            let locationData=locationDatas(prop,sql,data);
            sql=locationData;
          });
        }
        sql += ` group by fq.feedback_question_id`;
        sql += ` ORDER BY fq.sequence`;
        if(sortField && sortOrder){
          let createdDateData=createdDateDatas(sortField,sortOrder,sql);
          sql=createdDateData;

          let feedbackQuestionIdData=feedbackQuestionIdDatas(sortField,sortOrder,sql);
          sql=feedbackQuestionIdData;
        }
        let countsql = `Select count(fq.feedback_question_id) as count FROM ${sql.split(' FROM ')[1]}`;
        const countRawResult = await sails.sendNativeQuery(`${countsql};`,[ACCOUNT_STATUS.active,]).usingConnection(req.dynamic_connection);
        let count = countRawResult.rows.length;
        sql = sql + ` limit ${perPage} offset ${skip}`;
        const rawResult = await sails.sendNativeQuery(`${sql};`,[ACCOUNT_STATUS.active]).usingConnection(req.dynamic_connection);
        let result = rawResult.rows;
        if (result && result.length > 0) {
          let allData = {};
          let reportResponse = [];

          reportResponse=reportResponseData(result,feedback_category,reportResponse,req);

          allData = {
            totalRecords : count,
            listData     : reportResponse
          };

          return res.ok(allData, messages.GET_RECORD, RESPONSE_STATUS.success);

        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        return res.ok(isValidate.error,messages.LIST_FEEDBACK_QUESTION_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,messages.LIST_CERTIFICATE_FAILURE,RESPONSE_STATUS.error);
    }
  }
};


