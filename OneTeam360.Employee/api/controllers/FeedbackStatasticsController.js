/* eslint-disable eqeqeq */
const messages = sails.config.globals.messages;
const moment = require('moment');

const {
  RESPONSE_STATUS,
  PERIODS
} = require('../utils/constants/enums');
const StatasticsValidations = require('../validations/StatasticsValidations');
module.exports = {
  viewStatastics: async (req,res) => {
    try {
      let request = req.allParams();
      const isValidate = await StatasticsValidations.viewStatastics.validate(request);
      if (!isValidate.error) {
        let { period, employee_profile_id } = request;
        let employee_id = employee_profile_id ? employee_profile_id : req.token.employee_profile_id;
        const feedbackRatingScale = `SELECT feedback_rating_scale_id,name FROM feedback_rating_scale WHERE status = 'Active'`;
        const rawfeedbackScaleResult = await sails
            .sendNativeQuery(feedbackRatingScale)
            .usingConnection(req.dynamic_connection);

        let sql = `
            select
              feedback_answer.feedback_question_id,
              feedback_answer.feedback_rating_scale_id,
              feedback_question.question,
              feedback_rating_scale.name
          from feedback_answer feedback_answer
          INNER JOIN feedback_question feedback_question ON feedback_question.feedback_question_id =  feedback_answer.feedback_question_id
          INNER JOIN feedback_rating_scale feedback_rating_scale ON feedback_rating_scale.feedback_rating_scale_id = feedback_answer.feedback_rating_scale_id
          INNER JOIN employee_profile employee_profile
          ON employee_profile.employee_profile_id = feedback_answer.manager_id
          WHERE employee_profile.employee_profile_id = ${employee_id} 
          `;
        let startDate = moment().format('YYYY-MM-DD');

        if(period == PERIODS.LAST_WEEK){
          let endDate = moment().subtract(14, 'days').format('YYYY-MM-DD');
          sql = sql + ` AND Date(feedback_answer.created_date) between '${endDate}' AND '${startDate}'`;
        } else if(period == PERIODS.LAST_MONTH){
          let endDate = moment().subtract(37, 'days').format('YYYY-MM-DD');
          sql = sql + ` AND Date(feedback_answer.created_date) between '${endDate}' AND '${startDate}'`;
        } else if(period == PERIODS.LAST_SIX_MONTH){
          let endDate = moment().subtract(187, 'days').format('YYYY-MM-DD');
          sql = sql + ` AND Date(feedback_answer.created_date) between '${endDate}' AND '${startDate}'`;
        } else if(period == PERIODS.LAST_YEAR){
          let endDate = moment().subtract(372, 'days').format('YYYY-MM-DD');
          sql = sql + ` AND Date(feedback_answer.created_date) between '${endDate}' AND '${startDate}'`;
        }

        sql = sql + ` ORDER BY feedback_question.sequence, feedback_rating_scale.feedback_rating_scale_id`;
        const rawResult = await sails
              .sendNativeQuery(sql)
              .usingConnection(req.dynamic_connection);

        let response = rawResult.rows;
        let uniqueObjArray = [
          ...new Map(response.map((item) => [item['feedback_question_id'], item])).values(),
        ];
        let rateScale = rawfeedbackScaleResult.rows;
        let feedBack = [];
        for (const  item of uniqueObjArray) {
          let rate = [];
          const interaction = response.filter((item1) => item1.feedback_question_id == item.feedback_question_id);
          for (const scaleRate of rateScale) {
            let scalData = interaction.filter((interactionData) => scaleRate.feedback_rating_scale_id == interactionData.feedback_rating_scale_id);
            let scalCalc = scalData.length * 100/ interaction.length;
            rate.push({scale: Math.round(scalCalc), scaleCount: scalData.length});
          }
          feedBack.push({
            question          : item.question,
            total_interaction : interaction.length,
            rating            : rate
          });
        }
        let message = messages.NO_FEEDBACK_RECORD;
        if (response.length > 0) {
          message = messages.GET_RECORD;
        }

        res.ok(feedBack, message, RESPONSE_STATUS.success);
      } else {
        res.ok(
              isValidate.error,
              messages.GET_RECORD_FAILURE,
              RESPONSE_STATUS.error
        );
      }
    } catch (error) {
      sails.log.error(error);
      res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  checkFeedbackAvailability: async (req,res) => {
    try {
      const employee_profile_id = req.token.employee_profile_id;
      let startDate = moment().format('YYYY-MM-DD');
      let endDate = moment().subtract(372, 'days').format('YYYY-MM-DD');
      let sql = `
            select
            COUNT(feedback_answer_id) AS feedback_count
            from feedback_answer
            WHERE manager_id = ${employee_profile_id} 
            AND (Date(created_date) between '${endDate}' AND '${startDate}')`;

      const rawResult = await sails
              .sendNativeQuery(sql)
              .usingConnection(req.dynamic_connection);

      let response = rawResult.rows[0];

      let feedback = {
        IsFeedbackDataAvailable: response.feedback_count > 0 ? true : false
      };

      let message = messages.NO_FEEDBACK_RECORD;
      if (response.feedback_count > 0) {
        message = messages.GET_RECORD;
      }

      res.ok(feedback, message, RESPONSE_STATUS.success);
    } catch (error) {
      sails.log.error(error);
      res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  }

};
