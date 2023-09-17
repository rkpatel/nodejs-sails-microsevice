const EmployeeFeedbackValidations = require('../validations/EmployeeFeedbackValidations');
const messages = require('../utils/constants/message');
const { RESPONSE_STATUS, QUESTION_STATUS, FEEDBACK_CATEGORY, CHECKIN_STATUS} = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
const { getDateUTC, getDateUTCFormat,getCurrentDate,getDateTimeSpecificTimeZone } = require('../utils/common/getDateTime');

const isRatingGiven = (rating) =>{
  return rating > 0 ? true : false;
};

const mngDatas=async(item)=>{
  return item.manager_id ? item.manager_id : null;
};

const locDatas=async(item)=>{
  return item.location_id ? item.location_id : null;
};

const managerIdDatas=async(feedback_category,mng)=>{
  return (feedback_category === FEEDBACK_CATEGORY.manager) ? mng: null;
};

const locationIdDatas=async(feedback_category,loc)=>{
  return (feedback_category === FEEDBACK_CATEGORY.location) ? loc : null;
};

const commentDatas=async(fa)=>{
  return fa.comment ? fa.comment : null;
};

module.exports = {
  findQuestionList: async (req, res) => {
    try {
      let request = req.allParams();

      const isValidate = await EmployeeFeedbackValidations.findQuestionList.validate(request);
      if (!isValidate.error) {
        const {
          feedback_category,
          location_id
        } = req.allParams();

        let sql;

        if(feedback_category === FEEDBACK_CATEGORY.manager){
          sql = `SELECT fq.feedback_question_id, fq.feedback_category, fq.status, fq.question, concat(created_by.first_name, " ", created_by.last_name) as created_by, Date(fq.created_date) as created_date,Date(fq.modified_date) AS modified_date, concat(modified_by_user.first_name, " ", modified_by_user.last_name) as modified_by, fq.is_required,fq.sequence
                  FROM feedback_question fq
                  INNER JOIN ${process.env.DB_NAME}.user created_by
                  ON created_by.user_id = fq.created_by
                  LEFT JOIN ${process.env.DB_NAME}.user modified_by_user
                  ON modified_by_user.user_id = fq.modified_by
                  WHERE fq.feedback_category = '${FEEDBACK_CATEGORY.manager}' AND fq.status = '${QUESTION_STATUS.active}' ORDER BY fq.sequence`;

        }else if(feedback_category === FEEDBACK_CATEGORY.location && location_id){
          sql = `SELECT fq.feedback_question_id, fq.feedback_category, fql.location_id, fq.status, fq.question, concat(created_by.first_name, " ", created_by.last_name) as created_by, Date(fq.created_date) as created_date,Date(fq.modified_date) AS modified_date, concat(modified_by_user.first_name, " ", modified_by_user.last_name) as modified_by, fq.is_required,fq.sequence
                  FROM feedback_question as fq
                  INNER JOIN ${process.env.DB_NAME}.user created_by
                  ON created_by.user_id = fq.created_by
                  LEFT JOIN ${process.env.DB_NAME}.user modified_by_user
                  ON modified_by_user.user_id = fq.modified_by
                  LEFT JOIN feedback_question_location as fql ON fq.feedback_question_id = fql.feedback_question_id
                  WHERE fq.feedback_category = '${FEEDBACK_CATEGORY.location}' AND fql.location_id = ${location_id} AND fq.status = '${QUESTION_STATUS.active}' AND fql.status = '${QUESTION_STATUS.active}' ORDER BY fq.sequence`;
        }

        const rawResult = await sails
            .sendNativeQuery(escapeSqlSearch(sql))
            .usingConnection(req.dynamic_connection);

        const results = rawResult.rows;

        let data = {
          totalResults : results.length,
          questionList : results
        };

        if(results.length > 0){
          return res.ok(
            data,
            messages.GET_RECORD,
            RESPONSE_STATUS.success
          );
        }else {
          return res.ok(
            data,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      }else {
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

  submitFeedback: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = EmployeeFeedbackValidations.submitFeedback.validate(request);
      if (!isValidate.error) {
        const {
          feedback_category, feedback_details
        } = req.allParams();

        const employee_profile_id = req.token.employee_profile_id;
        const _currentDate = getDateUTCFormat('YYYY-MM-DD');

        let sql = `SELECT DISTINCT
        COUNT(feedback_answer_id) as existing_submission_count
        FROM feedback_answer
        WHERE employee_profile_id = ${employee_profile_id} AND DATE(created_date) = '${_currentDate}'`;

        if(feedback_category === FEEDBACK_CATEGORY.manager){
          const manager = feedback_details.map((item) => `'${item.manager_id}'`).join(', ');
          const managerId = '(' + manager + ')';
          sql = sql + `AND manager_id IN ${managerId}`;
        }
        else if(feedback_category === FEEDBACK_CATEGORY.location){
          const location = feedback_details.map((item) => `'${item.location_id}'`).join(', ');
          const locationId = '(' + location + ')';
          sql = sql + `AND location_id IN ${locationId}`;
        }

        const rawResult = await sails
          .sendNativeQuery(escapeSqlSearch(sql))
          .usingConnection(req.dynamic_connection);

        const existingSubmission = rawResult.rows[0];
        if (existingSubmission.existing_submission_count > 0) {
          return res.ok(
            undefined,
            messages.FEEDBACK_SUBMIT_EXISTS,
            RESPONSE_STATUS.warning
          );
        } else {

          const feedbackAnswer_arr = [];

          for(const item of feedback_details){
            let mng= await mngDatas(item);
            let loc= await locDatas(item);

            for(const fa of item.feedback_answer){
              if(fa.feedback_rating_scale_id !== 0){
                feedbackAnswer_arr.push({
                  employee_profile_id      : employee_profile_id,
                  manager_id               : await managerIdDatas(feedback_category,mng) ,
                  location_id              : await locationIdDatas(feedback_category,loc),
                  feedback_question_id     : fa.feedback_question_id,
                  feedback_rating_scale_id : fa.feedback_rating_scale_id,
                  comment                  : await commentDatas(fa),
                  created_by               : req.user.user_id,
                  created_date             : getDateUTC()
                });
              }
            }
          }

          if(feedbackAnswer_arr.length > 0){
            await FeedbackAnswer
            .createEach(feedbackAnswer_arr)
            .usingConnection(req.dynamic_connection);
          }

          return res.ok(undefined, messages.FEEDBACK_SUBMIT_SUCCESS, RESPONSE_STATUS.success);

        }

      } else {
        res.ok(
          isValidate.error,
          messages.FEEDBACK_SUBMIT_FAILURE,
          RESPONSE_STATUS.error
        );
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(
        undefined,
        messages.FEEDBACK_SUBMIT_FAILURE,
        RESPONSE_STATUS.error
      );
    }
  },

  findManager: async (req, res) => {
    try{
      const employee_profile_id = req.token.employee_profile_id;
      let currunt_date = getCurrentDate();
      let sql = `SELECT  
      ei.employee_profile_id, 
      employee_profile.employee_profile_id as manager_id, 
      concat(manager.first_name,' ', manager.last_name) as manager_name, 
      manager.profile_picture_thumbnail_url as manager_profile,
      MAX(ei.created_date) as created_date, 
      (SELECT count(fa.feedback_answer_id) from feedback_answer fa  
      INNER JOIN employee_profile ep
      ON ep.employee_profile_id = fa.manager_id
      where fa.employee_profile_id = ei.employee_profile_id  
      AND ep.user_id = ei.created_by  
      AND Date(fa.created_date) = '${currunt_date}') AS is_rating 
      FROM employee_interaction ei 
      INNER JOIN employee_profile employee_profile
      ON employee_profile.user_id = ei.created_by
      INNER JOIN ${process.env.DB_NAME}.user manager 
      ON manager.user_id = ei.created_by 
      where ei.employee_profile_id = ${employee_profile_id} 
      and Date(ei.created_date) = '${currunt_date}' GROUP BY manager_id ORDER BY is_rating`;

      const managerResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);
      let response = managerResult.rows;
      let manager = [];
      if(response.length > 0 ){
        for (const item of response) {
          manager.push({
            ...item,
            created_date : item.created_date ? getDateTimeSpecificTimeZone(item.created_date,req.timezone,req.dateTimeFormat) : null,
            is_rating    : item.is_rating > 0 ? true : false
          });
        }
      }
      res.ok(manager,messages.GET_RECORD,RESPONSE_STATUS.success);
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },

  findLocationDetail: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await EmployeeFeedbackValidations.findLocationDetail.validate(request);
      if (!isValidate.error) {
        const { location_id } = request;
        let employee_profile_id = req.token.employee_profile_id;
        let currunt_date = getCurrentDate();
        const location = location_id.map((c) => `'${c}'`).join(', ');
        const locationId = '(' + location + ')';

        let locationDetail = [];

        let sql = `SELECT 
          DISTINCT lc.location_id, 
          lc.name AS location_name,
          (
            SELECT 
              MAX(ec.checkin_datetime)
                FROM employee_checkin as ec
              WHERE 
                ec.employee_profile_id = ${employee_profile_id} 
                AND ec.reviewer_status = '${CHECKIN_STATUS.APPROVED}' 
                AND ec.location_id = lc.location_id      
          ) AS checkin_datetime, 
          (
            SELECT 
              COUNT(fa.feedback_answer_id) 
            FROM 
              feedback_answer fa 
            WHERE 
              location_id = lc.location_id
              AND employee_profile_id = ${employee_profile_id} 
              AND DATE(fa.created_date) = '${currunt_date}'
          ) AS is_rating_given_today, 
          (
            SELECT 
              COUNT(fq.feedback_question_id) 
            FROM 
              feedback_question fq 
              LEFT JOIN feedback_question_location AS fql ON fq.feedback_question_id = fql.feedback_question_id 
            WHERE 
              fq.feedback_category = '${FEEDBACK_CATEGORY.location}' 
              AND fql.location_id = lc.location_id
              AND fq.status = '${QUESTION_STATUS.active}' 
              AND fql.status = '${QUESTION_STATUS.active}'
          ) AS active_question_count 
          FROM 
            location AS lc 
            WHERE lc.location_id IN ${locationId} ORDER BY is_rating_given_today 
          `;

        const locationResult = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);
        let response = locationResult.rows;

        if(response.length > 0 ){
          for (const item of response) {
            locationDetail.push({
              ...item,
              checkin_datetime      : item.checkin_datetime ? getDateTimeSpecificTimeZone(item.checkin_datetime,req.timezone,req.dateTimeFormat) : null,
              is_rating_given_today : isRatingGiven(item.is_rating_given_today)
            });
          }
        }

        let data = {
          totalResults   : locationDetail.length,
          locationDetail : locationDetail
        };
        return locationDetail.length > 0 ? res.ok(
          data,
          messages.GET_RECORD,
          RESPONSE_STATUS.success
        ) :  res.ok(
          data,
          messages.DATA_NOT_FOUND,
          RESPONSE_STATUS.success
        );
      }else {
        res.ok(
          isValidate.error,
          messages.GET_RECORD_FAILURE,
          RESPONSE_STATUS.error
        );
      }

    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },

  pendingFeedbackCount: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await EmployeeFeedbackValidations.pendingFeedbackCount.validate(request);
      if (!isValidate.error) {
        const { location_id } = request;
        let employee_profile_id = req.token.employee_profile_id;
        let currunt_date = getCurrentDate();
        const location = location_id.map((c) => `'${c}'`).join(', ');
        const locationId = '(' + location + ')';

        let sql = `
        SELECT
        (
        (
        SELECT COUNT(*) AS cnt FROM (SELECT feedback_question_location.location_id, 
        COUNT(feedback_question.question) active_question_count,
        COUNT(feedback_answer.feedback_answer_id) is_rating_given_today
        FROM feedback_question 
        INNER JOIN feedback_question_location ON feedback_question.feedback_question_id = feedback_question_location.feedback_question_id
        LEFT JOIN feedback_answer ON feedback_question.feedback_question_id = feedback_answer.feedback_question_id 
        AND feedback_answer.employee_profile_id = ${employee_profile_id} 
        AND DATE(feedback_answer.created_date) = '${currunt_date}'
        AND feedback_answer.location_id = feedback_question_location.location_id
        WHERE feedback_question_location.location_id IN ${locationId}  
        AND feedback_question.feedback_category = '${FEEDBACK_CATEGORY.location}' 
        AND feedback_question.status = '${QUESTION_STATUS.active}' 
        AND feedback_question_location.status = '${QUESTION_STATUS.active}'
        GROUP BY feedback_question_location.location_id
        HAVING is_rating_given_today = 0) AS lcount
        )
        +
        (
        SELECT COUNT(*) AS cnt FROM (SELECT 
        DISTINCT employee_profile.employee_profile_id AS manager_id,
        COUNT(feedback_answer.feedback_answer_id) is_rating
        FROM employee_interaction 
        INNER JOIN employee_profile ON employee_profile.user_id = employee_interaction.created_by
        LEFT JOIN feedback_answer ON feedback_answer.employee_profile_id=employee_interaction.employee_profile_id 
        AND DATE(feedback_answer.created_date) = DATE(employee_interaction.created_date)
        AND feedback_answer.manager_id=employee_profile.employee_profile_id
        WHERE  employee_interaction.employee_profile_id = ${employee_profile_id} 
        AND DATE(employee_interaction.created_date) ='${currunt_date}'
        GROUP BY employee_profile.employee_profile_id
        HAVING is_rating = 0) AS mcount
        )
        ) 
        AS pending_count`;

        const result = await sails.sendNativeQuery(`${sql};`).usingConnection(req.dynamic_connection);
        let count = result.rows[0] || 0;

        return res.ok(
          { pendingFeedbackCount: count.pending_count },
            messages.GET_RECORD,
            RESPONSE_STATUS.success
        );

      }else {
        res.ok(
          isValidate.error,
          messages.GET_RECORD_FAILURE,
          RESPONSE_STATUS.error
        );
      }

    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },

  findQuestionListByLocation: async (req, res) => {
    try {
      let request = req.allParams();

      const isValidate = await EmployeeFeedbackValidations.findQuestionListByLocation.validate(request);
      if (!isValidate.error) {
        const {
          location_id
        } = req.allParams();

        let feedbackDetail = [];
        for(const loc of location_id){
          let sql = `SELECT fq.feedback_question_id, fq.status, fq.question,fq.is_required,fq.sequence
          FROM feedback_question as fq
          LEFT JOIN feedback_question_location as fql ON fq.feedback_question_id = fql.feedback_question_id
          WHERE fq.feedback_category = '${FEEDBACK_CATEGORY.location}' AND fql.location_id = ${loc} AND fq.status = '${QUESTION_STATUS.active}' AND fql.status = '${QUESTION_STATUS.active}' ORDER BY fq.sequence`;

          const rawResult = await sails
            .sendNativeQuery(escapeSqlSearch(sql))
            .usingConnection(req.dynamic_connection);

          const results = rawResult.rows;

          feedbackDetail.push({
            location_id    : loc,
            totalQuestions : results.length,
            questionList   : results
          });

        }

        let data = {
          totalResults           : feedbackDetail.length,
          feedbackQuestionDetail : feedbackDetail
        };

        if(feedbackDetail.length > 0){
          return res.ok(
            data,
            messages.GET_RECORD,
            RESPONSE_STATUS.success
          );
        }else {
          return res.ok(
            data,
            messages.DATA_NOT_FOUND,
            RESPONSE_STATUS.success
          );
        }
      }else {
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
  }
};
