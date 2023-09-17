const messages = require('../utils/constants/message');
const { RESPONSE_STATUS, ACCOUNT_STATUS } = require('../utils/constants/enums');
const SkillQuizValidation = require('../validations/SkillQuizValidation');
const { getDateUTC } = require('../utils/common/getDateTime');
const { escapeSqlSearch } = require('../services/utils');

const getQuestionOptions = async function (req, questionId) {
  let results = '';
  let sql = `SELECT 
    skillquiz_question_option_id, 
    skillquiz_question_id, 
    \`option\`, 
    sequence, 
    isCorrectAnswer, 
    description
    FROM skillquiz_question_option WHERE skillquiz_question_id = ${questionId} AND status = '${ACCOUNT_STATUS.active}'`;

  const rawResult = await sails
    .sendNativeQuery(escapeSqlSearch(sql))
    .usingConnection(req.dynamic_connection);

  results = rawResult.rows;

  const responseData = [];
  results.forEach(item=>{
    responseData.push({
      skillquiz_question_option_id : item.skillquiz_question_option_id,
      skillquiz_question_id        : item.skillquiz_question_id,
      option                       : item.option,
      sequence                     : item.sequence,
      isCorrectAnswer              : item.isCorrectAnswer,
      description                  : item.description,
    });
  });

  return responseData;
};

const quesOptionsData=async(questionOptions,questionOptions_arr,newQuestion,req,correctAnswer,description)=>{
  for (const questionOption of questionOptions) {
    questionOptions_arr.push({
      skillquiz_question_id : newQuestion.skillquiz_question_id,
      option                : questionOption.option,
      sequence              : questionOption.sequence,
      isCorrectAnswer       :
        questionOption.option === correctAnswer
          ? true
          : false,
      description:
        questionOption.option === correctAnswer
          ? description
          : '',
      status       : ACCOUNT_STATUS.active,
      created_by   : req.user.user_id,
      created_date : getDateUTC()
    });
  }

  if (questionOptions_arr.length > 0) {
    await sails.models.skillquizquestionoption
      .createEach(questionOptions_arr)
      .usingConnection(req.dynamic_connection);
  }
};

const quiOptionValueData=async(item,req)=>{
  return item.skillquiz_question_id ?  getQuestionOptions(req, item.skillquiz_question_id) : [];
};

const quizSubmittedOptionId=async(item)=>{
  return item.submitted_option_id ? item.submitted_option_id : '';
};

const skillQuizOptionsValue=async(item,req)=>{
  return item.skillquiz_question_id ?  getQuestionOptions(req, item.skillquiz_question_id) : [];
};

const skillQuizSubmittedId=async(item)=>{
  return item.submitted_option_id ? item.submitted_option_id : 0;
};

const updatedRecordDatas=async(record,draggable_id,droppable_id,updaterecords,condition)=>{
  if(record.sequence === draggable_id){
    return  updaterecords.push({
      ...record,
      sequence: droppable_id
    });
  }
  else{
    return  updaterecords.push({
      ...record,
      sequence: condition ? record.sequence - 1 : record.sequence + 1
    });
  }
};

const sequenceDatas=async(results,updaterecords,draggable_id,droppable_id,condition,req,res)=>{
  if(results && results.length > 0){
    results.forEach((record)=>{
      if((condition && record.sequence >= draggable_id && record.sequence <= droppable_id) || (!condition && record.sequence <= draggable_id && record.sequence >= droppable_id)) {
        updatedRecordDatas(record,draggable_id,droppable_id,updaterecords,condition);
      }
      sails.log('updaterecords', updaterecords);
    });

    for(const item in updaterecords){
      await SkillQuizQuestion.update({ skillquiz_question_id: updaterecords[item].skillquiz_question_id },{
        sequence: updaterecords[item].sequence
      }).usingConnection(req.dynamic_connection);
    }
    return res.ok(undefined,'Sequence updated', RESPONSE_STATUS.success);
  }
  else{
    sails.log('Sequence updated');
    return res.ok(undefined,'Sequence updated', RESPONSE_STATUS.success);

  }
};

const isCorrectAnswerData=async(correctAnswer,questionOption)=>{
  return correctAnswer === questionOption.option ? true : false;
};

const isDescriptionData=async(description,correctAnswer,questionOption)=>{
  return correctAnswer === questionOption.option ? description : '';
};

const skillAll=async(questionOptions,skillquiz_question_id,correctAnswer,description,req)=>{
  for (const questionOption of questionOptions) {
    const action = questionOption.action;

    if(action === 'Add') {
      return SkillQuizQuestionOption.create({
        skillquiz_question_id : skillquiz_question_id,
        option                : questionOption.option,
        sequence              : questionOption.sequence,
        status                : 'Active',
        isCorrectAnswer       : await isCorrectAnswerData(correctAnswer,questionOption),
        description           : await isDescriptionData(description,correctAnswer,questionOption),
        created_by            : req.user.user_id,
        created_date          : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
    } else if (action === 'Edit') {
      return SkillQuizQuestionOption.update({ skillquiz_question_option_id: questionOption.skillquiz_question_option_id },
          {
            skillquiz_question_id : skillquiz_question_id,
            option                : questionOption.option,
            sequence              : questionOption.sequence,
            isCorrectAnswer       : await isCorrectAnswerData(correctAnswer,questionOption),
            description           : await isDescriptionData(description,correctAnswer,questionOption),
            last_updated_by       : req.user.user_id,
            last_updated_date     : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);
    } else if (action === 'Delete') {
      return SkillQuizQuestionOption.destroy({ skillquiz_question_option_id: questionOption.skillquiz_question_option_id }).fetch().usingConnection(req.dynamic_connection);
    } else if(!action && questionOption.skillquiz_question_option_id){
      return SkillQuizQuestionOption.update({ skillquiz_question_option_id: questionOption.skillquiz_question_option_id },
           {
             sequence        : questionOption.sequence,
             isCorrectAnswer : await isCorrectAnswerData(correctAnswer,questionOption),
           }).usingConnection(req.dynamic_connection);
    }
  }
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();

      //Validate request parameters
      const isValidate = await SkillQuizValidation.add.validate(request);
      if (!isValidate.error) {
        const {
          skill_id,
          question,
          is_required,
          correct_answer,
          description,
          question_options
        } = req.allParams();
        const questionOptions = question_options;
        const queString = question.trim();
        const existingQuestion = await sails.models.skillquizquestion.findOne({ question: queString, skill_id, status: 'Active' }).usingConnection(req.dynamic_connection);
        if (existingQuestion) {
          return res.ok(undefined, messages.SKILL_QUESTION_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const lastRecord = await sails.models.skillquizquestion.find({skill_id, status: 'Active'}).sort('sequence DESC').limit(1).usingConnection(req.dynamic_connection);
          let last_sequence = (lastRecord.length > 0) ? lastRecord[0].sequence+1 : 1;
          sails.log(last_sequence);

          const newQuestion = await sails.models.skillquizquestion
          .create({
            skill_id     : skill_id,
            question     : question,
            is_required  : is_required,
            sequence     : last_sequence,
            status       : ACCOUNT_STATUS.active,
            created_by   : req.user.user_id,
            created_date : getDateUTC()
          })
          .fetch()
          .usingConnection(req.dynamic_connection);

          const questionOptions_arr = [];

          if (questionOptions !== undefined) {
            await quesOptionsData(questionOptions,questionOptions_arr,newQuestion,req,correct_answer,description);
          }

          await Training.update({ training_id: skill_id }, {
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          return res.ok(undefined,messages.ADD_QUESTION_SUCCESS, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(
          isValidate.error,
          messages.ADD_QUESTION_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.ADD_QUESTION_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  delete: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await SkillQuizValidation.delete.validate(request);

      if (!isValidate.error) {
        const questionId = req.params.id;
        const questionDetail = await sails.models.skillquizquestion
          .findOne({
            skillquiz_question_id: questionId,
          })
          .usingConnection(req.dynamic_connection);

        //Update question status to 'Inactive'
        if(questionDetail){
          await sails.models.skillquizquestion
          .update({
            skillquiz_question_id: req.params.id
          },{
            status            : ACCOUNT_STATUS.inactive,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          })
          .usingConnection(req.dynamic_connection);

          res.ok(undefined, messages.DELETE_QUESTION, RESPONSE_STATUS.success);
        } else {
          return res.ok(
            undefined,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }

      } else {
        res.ok(isValidate.error, messages.DELETE_FAIL, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.DELETE_FAIL, RESPONSE_STATUS.error);
    }
  },

  findById: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await SkillQuizValidation.findById.validate(request);
      if (!isValidate.error) {
        const questionId = req.params.id;
        const questionDetail = await sails.models.skillquizquestion
          .findOne({
            skillquiz_question_id: questionId,
          })
          .usingConnection(req.dynamic_connection);

        if (questionDetail) {
          let result;
          let sql = `SELECT DISTINCT
            sq.skillquiz_question_id as skillquiz_question_id,
            sq.question as question,
            sq.is_required as is_required,
            sq.created_date as created_date,
            sq.skill_id as skill_id,
            sq.status as status,
            sq.sequence as sequence,
            sub_quiz.submitted_option_id as submitted_option_id,
            (SELECT sqo.option AS correctAnswer FROM skillquiz_question_option AS sqo WHERE iSCorrectAnswer = 1 AND sqo.skillquiz_question_id = sq.skillquiz_question_id) AS correctAnswer,
            (SELECT description FROM skillquiz_question_option AS sqo WHERE iSCorrectAnswer = 1 AND sqo.skillquiz_question_id = sq.skillquiz_question_id) AS description
            FROM
            skillquiz_question as sq 
            LEFT JOIN skillquiz_submission as sub_quiz
            ON sq.skillquiz_question_id = sub_quiz.skillquiz_question_id
            AND sub_quiz.employee_profile_id = ${req.token.employee_profile_id} 
            WHERE sq.skillquiz_question_id = ${questionId}`;
          const rawResult = await sails
            .sendNativeQuery(escapeSqlSearch(sql))
            .usingConnection(req.dynamic_connection);

          result = rawResult.rows[0];

          let response = [];

          const optionsValue = questionId
                ? await getQuestionOptions(req, questionId)
                : [];

          response.push({
            skillquiz_question_id : result.skillquiz_question_id,
            question              : result.question,
            status                : result.status,
            is_required           : result.is_required,
            created_date          : result.created_date,
            skill_id              : result.skill_id,
            sequence              : result.sequence,
            correctAnswer         : result.correctAnswer,
            description           : result.description,
            options               : optionsValue,
            submitted_option_id   : result.submitted_option_id ? result.submitted_option_id : ''
          });

          return res.ok(
              response,
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
      } else {
        res.ok(
          isValidate.error,
          messages.GET_DATA_FAILED,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  findListById: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await SkillQuizValidation.findListById.validate(request);
      if (!isValidate.error) {
        const skill_id = req.params.id;

        const questionDetail = await sails.models.skillquizquestion.find({
          skill_id,
        }).usingConnection(req.dynamic_connection);

        let results;
        let sql;

        if(questionDetail.length > 0 ){

          sql = `SELECT DISTINCT
                sq.skillquiz_question_id AS skillquiz_question_id,
                sq.question AS question,
                sq.is_required AS is_required,
                sq.created_date AS created_date,
                sq.skill_id AS skill_id,
                sq.sequence AS sequence,
                sub_quiz.submitted_option_id AS submitted_option_id,
                sqo.option AS correctAnswer,
                sqo.description
                FROM skillquiz_question AS sq
                LEFT JOIN skillquiz_question_option AS sqo ON sqo.skillquiz_question_id = sq.skillquiz_question_id 
                LEFT JOIN skillquiz_submission AS sub_quiz
                ON sq.skillquiz_question_id = sub_quiz.skillquiz_question_id
                AND sub_quiz.employee_profile_id =  ${req.token.employee_profile_id} 
                WHERE sq.skill_id = ${skill_id} 
                AND sq.status = '${ACCOUNT_STATUS.active}'
                AND sqo.isCorrectAnswer = 1
                ORDER BY sq.sequence`;


          const rawResult = await sails
              .sendNativeQuery(escapeSqlSearch(sql))
              .usingConnection(req.dynamic_connection);

          results = rawResult.rows;
          if (results.length > 0) {
            let response = [];
            for (const item of results) {
              const optionsValue = await quiOptionValueData(item,req);
              response.push({
                skillquiz_question_id : item.skillquiz_question_id,
                question              : item.question,
                is_required           : item.is_required,
                created_date          : item.created_date,
                skill_id              : item.skill_id,
                sequence              : item.sequence,
                correctAnswer         : item.correctAnswer,
                description           : item.description,
                options               : optionsValue,
                submitted_option_id   : await quizSubmittedOptionId(item)
              });
            }

            let data = {
              totalResults : response.length,
              questionList : response
            };

            return res.ok(
              data,
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
        }else {
          return res.ok(
            undefined,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        res.ok(
          isValidate.error,
          messages.GET_DATA_FAILED,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  findListByTrainingEmployeeId: async (req, res) => {
    try {
      let request = req.allParams();

      const { skill_id, training_employee_id} = req.allParams();
      const isValidate = await SkillQuizValidation.findListByTrainingEmployeeId.validate(request);
      if (!isValidate.error) {
        const questionDetail = await sails.models.skillquizquestion.find({skill_id,}).usingConnection(req.dynamic_connection);

        let results;
        let sql;

        if(questionDetail.length > 0 ){

          sql = `SELECT DISTINCT
                sq.skillquiz_question_id AS skillquiz_question_id,
                sq.question AS question,
                sq.is_required AS is_required,
                sq.created_date AS created_date,
                sq.skill_id AS skill_id,
                sq.sequence AS sequence,
                sub_quiz.submitted_option_id AS submitted_option_id,
                sqo.option AS correctAnswer,
                sqo.description
                FROM skillquiz_question AS sq
                LEFT JOIN skillquiz_question_option AS sqo ON sqo.skillquiz_question_id = sq.skillquiz_question_id 
                LEFT JOIN skillquiz_submission AS sub_quiz ON sq.skillquiz_question_id = sub_quiz.skillquiz_question_id
                AND sub_quiz.training_employee_id = ${training_employee_id} 
                WHERE sq.skill_id = ${skill_id} 
                AND sq.status = '${ACCOUNT_STATUS.active}'
                AND sqo.isCorrectAnswer = 1
                ORDER BY sq.sequence`;


          const rawResult = await sails
              .sendNativeQuery(escapeSqlSearch(sql))
              .usingConnection(req.dynamic_connection);

          results = rawResult.rows;

          if (results.length > 0) {
            let response = [];
            for (const item of results) {
              const optionsValue = await skillQuizOptionsValue(item,req);
              response.push({
                skillquiz_question_id : item.skillquiz_question_id,
                question              : item.question,
                is_required           : item.is_required,
                created_date          : item.created_date,
                skill_id              : item.skill_id,
                sequence              : item.sequence,
                correctAnswer         : item.correctAnswer,
                description           : item.description,
                options               : optionsValue,
                submitted_option_id   : await skillQuizSubmittedId(item)
              });
            }

            let  data = {
              totalResults : response.length,
              questionList : response
            };

            return res.ok(
              data,
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
        }else {
          return res.ok(
            undefined,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      } else {
        res.ok(
          isValidate.error,
          messages.GET_DATA_FAILED,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await SkillQuizValidation.edit.validate(request);
      if (!isValidate.error) {
        const questionDetail = await SkillQuizQuestion.findOne({ skillquiz_question_id: request.id }).usingConnection(req.dynamic_connection);
        if(questionDetail) {
          const {
            skill_id,
            question,
            is_required,
            correctAnswer,
            description,
            questionOptions
          } = req.allParams();

          let skillquiz_question_id = request.id;
          await SkillQuizQuestion.update({ skillquiz_question_id: skillquiz_question_id },
            {
              skill_id,
              question,
              is_required,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);

          if (questionOptions !== undefined) {
            await skillAll(questionOptions,skillquiz_question_id,correctAnswer,description,req);
          }

          await Training.update({ training_id: skill_id }, {
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          return res.ok(undefined, messages.UPDATE_QUESTION_SUCCESS, RESPONSE_STATUS.success);
        } else{
          return res.ok(questionDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else{
        return res.ok(isValidate.error, messages.UPDATE_QUESTION_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      res.ok(undefined, messages.UPDATE_QUESTION_FAILURE, RESPONSE_STATUS.error);
    }
  },

  submitQuestion: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await SkillQuizValidation.submitQuestion.validate(request);
      if (!isValidate.error) {
        const {
          task_id,
          skill_id,
          training_employee_id,
          skillquiz_question_id,
          submitted_option_id
        } = req.allParams();

        const employee_profile_id = req.token.employee_profile_id;
        const optionDetail = await SkillQuizQuestionOption.findOne({ skillquiz_question_option_id: submitted_option_id}).usingConnection(req.dynamic_connection);
        const submissionExist = await SkillQuizSubmission.findOne({ task_id, skill_id, training_employee_id, skillquiz_question_id, employee_profile_id }).usingConnection(req.dynamic_connection);

        if(submissionExist){
          await SkillQuizSubmission
          .update({task_id, skill_id, training_employee_id, skillquiz_question_id, employee_profile_id},{
            submitted_option_id,
            submitted_option_value : optionDetail.option,
            submission_date        : getDateUTC(),
          })
          .usingConnection(req.dynamic_connection);
        }else{
          await SkillQuizSubmission
          .create({
            task_id,
            skill_id,
            training_employee_id,
            employee_profile_id,
            skillquiz_question_id,
            submitted_option_id,
            submitted_option_value : optionDetail.option,
            submission_date        : getDateUTC(),
          })
          .usingConnection(req.dynamic_connection);
        }

        return res.ok(undefined, messages.SUBMIT_QUIZ_SUCCESS, RESPONSE_STATUS.success);

      } else {
        res.ok(
          isValidate.error,
          messages.SUBMIT_QUIZ_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.SUBMIT_QUIZ_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  optionminmax: async function (req, res) {
    try {
      let sql = `SELECT DISTINCT
            adset.code as code, 
            adset.value as value 
            FROM
            ${process.env.DB_NAME}.admin_settings as adset
            WHERE 
            code = 'skill_question_option_min' OR code = 'skill_question_option_max'`;

      const rawResult = await sails
      .sendNativeQuery(escapeSqlSearch(sql))
      .usingConnection(req.dynamic_connection);

      let results = rawResult.rows;

      if (results.length > 0) {
        let optionsResponse = [];
        for (const item of results) {
          optionsResponse.push({
            code  : item.code,
            value : item.value,
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

  sequence: async function(req,res){
    try{
      let sql='SELECT sequence,skillquiz_question_id from skillquiz_question ORDER BY sequence ASC'; // skillquiz_question_id, sorting sequence
      const rawresult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
      const results = rawresult.rows;

      let updaterecords = [];

      let { draggable_id , droppable_id} = req.body;

      let condition;
      if(draggable_id < droppable_id) {condition = true;}
      else {condition = false;}
      sails.log('results', results);

      if(draggable_id!==droppable_id){
        await sequenceDatas(results,updaterecords,draggable_id,droppable_id,condition,req,res);
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
  }
};
