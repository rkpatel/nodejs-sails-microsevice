
/***************************************************************************

  Controller     : Scenario

  **************************************************
  Functions
  **************************************************

  add
  edit
  find
  **************************************************

***************************************************************************/
const messages = sails.config.globals.messages;
const TrainingEmployeeValidation = require('../validations/TrainingEmployeeValidation');
const { RESPONSE_STATUS,SCENARIO_STATUS, AUTOMATED_TASK_ENTITY_TYPE, ACCOUNT_CONFIG_CODE } = require('../utils/constants/enums');
const { getDateUTC, getCurrentDate, getAutomatedTaskDueDate } = require('../utils/common/getDateTime');
const { addTaskApi } = require('../utils/common/apiCall');
const dueDays = async (account) => {
  let sql = `
  SELECT account_configuration_detail.value, account_configuration_detail.default_value
  FROM account_configuration_detail
  LEFT JOIN account_configuration ON account_configuration_detail.account_configuration_id = account_configuration.account_configuration_id
  WHERE account_configuration_detail.code IN ($1) AND account_configuration.account_id = $2 `;

  const rawResult = await sails.sendNativeQuery(sql,[ACCOUNT_CONFIG_CODE.automated_task_due_date_days, account]);
  const results = rawResult.rows;
  return results[0].value !== '' &&  results[0].value !== null && results[0].value !== undefined ? results[0].value : results[0].default_value;
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await  TrainingEmployeeValidation.add.validate(request);
      if (!isValidate.error) {
        const { employee_profile_id, job_type_id, training_id, grade_id, notes } = req.allParams();
        const newTrainingEmployee = await TrainingEmployee.create({
          employee_profile_id,
          job_type_id,
          training_id,
          grade_id,
          group_activity_id : null,
          notes             : (notes) ? (notes) : '',
          status            : SCENARIO_STATUS.active,
          created_by        : req.user.user_id,
          last_updated_by   : null,
          created_date      : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        const training_employee_id = newTrainingEmployee.training_employee_id;

        if(grade_id === 3) {
          const account = req.account.account_id;
          const due_day = await dueDays(account);

          const trainings = `SELECT name FROM training where training_id = ${training_id}`;
          const rawResult = await sails.sendNativeQuery(trainings).usingConnection(req.dynamic_connection);
          const trainingResult = rawResult.rows[0] || null;
          const training_title = trainingResult.name;

          const taskTypeQuery = `SELECT task_type_id FROM task_type where name = 'Retest Skill'`;
          const taskTypeRow = await sails.sendNativeQuery(taskTypeQuery).usingConnection(req.dynamic_connection);
          const typeResult = taskTypeRow.rows[0] || null;
          const retest_task_type_id = typeResult.task_type_id;


          await addTaskApi(req,{
            title                : `Review Skill - ${training_title}`,
            task_type_id         : retest_task_type_id,
            description          : 'Review Skill',
            start_date           : getCurrentDate(),
            end_date             : getAutomatedTaskDueDate(due_day),
            is_private           : 1,
            entity_type          : AUTOMATED_TASK_ENTITY_TYPE.TRAINING,
            entity_id            : training_id,
            training_employee_id : training_employee_id,
            assignees            : [employee_profile_id],
          });
        }

        return res.ok(undefined, messages.ADD_TRAINING_EMPLOYEE_SUCCESS, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.ADD_TRAINING_EMPLOYEE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.ADD_TRAINING_EMPLOYEE_FAILURE, RESPONSE_STATUS.error);
    }
  },

  delete: async(req, res) =>{
    try{
      let request = req.allParams();
      const isValidate = await  TrainingEmployeeValidation.delete.validate(request);
      if (!isValidate.error) {
        await TrainingEmployee.update({ training_employee_id: req.params.id },{
          status            : SCENARIO_STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        return res.ok(undefined, messages.DELETE_TRAINING_EMPLOYEE_SUCCESS, RESPONSE_STATUS.success);
      }
      else{
        res.ok(isValidate.error, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.DELETE_TRAINING_EMPLOYEE_FAILED, RESPONSE_STATUS.error);
    }
  },

  reTestTraining: async(req, res) =>{
    try {
      let request = req.allParams();
      const isValidate = await  TrainingEmployeeValidation.reTest.validate(request);
      if (!isValidate.error) {
        const { training_employee_id, grade_id, notes } = req.allParams();
        const TrainingEmployeeData = await TrainingEmployee.findOne({training_employee_id}).usingConnection(req.dynamic_connection);
        const newTrainingEmployee = await TrainingEmployee.create({
          employee_profile_id : TrainingEmployeeData.employee_profile_id,
          job_type_id         : (TrainingEmployeeData.job_type_id) ? (TrainingEmployeeData.job_type_id): null,
          training_id         : TrainingEmployeeData.training_id,
          grade_id,
          notes               : (notes) ? (notes) : '',
          is_retest           : true,
          group_activity_id   : null,
          status              : SCENARIO_STATUS.active,
          created_by          : req.user.user_id,
          last_updated_by     : null,
          created_date        : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        const new_training_employee_id = newTrainingEmployee.training_employee_id;
        if(grade_id === 3) {
          let training_id = TrainingEmployeeData.training_id;
          let employee_profile_id = TrainingEmployeeData.employee_profile_id;
          const account = req.account.account_id;
          const due_day = await dueDays(account);

          const trainings = `SELECT name FROM training where training_id = ${training_id}`;
          const rawResult = await sails.sendNativeQuery(trainings).usingConnection(req.dynamic_connection);
          const trainingResult = rawResult.rows[0] || null;
          const training_title = trainingResult.name;

          const taskTypeQuery = `SELECT task_type_id FROM task_type where name = 'Retest Skill'`;
          const taskTypeRow = await sails.sendNativeQuery(taskTypeQuery).usingConnection(req.dynamic_connection);
          const typeResult = taskTypeRow.rows[0] || null;
          const retest_task_type_id = typeResult.task_type_id;

          await addTaskApi(req,{
            title                : `Review Skill - ${training_title}`,
            task_type_id         : retest_task_type_id,
            description          : 'Review Skill',
            start_date           : getCurrentDate(),
            end_date             : getAutomatedTaskDueDate(due_day),
            is_private           : 1,
            entity_type          : AUTOMATED_TASK_ENTITY_TYPE.TRAINING,
            entity_id            : training_id,
            training_employee_id : new_training_employee_id,
            assignees            : [employee_profile_id],
          });
        }

        return res.ok(undefined, messages.RETEST_TRAINING_EMPLOYEE_SUCCESS, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.RETEST_TRAINING_EMPLOYEE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.RETEST_TRAINING_EMPLOYEE_FAILURE, RESPONSE_STATUS.error);
    }
  },
  findById: async function (req, res) {
    const isValid = TrainingEmployeeValidation.findById.validate(req.allParams());
    if (!isValid.error) {
      const training_employee_id = req.params.id;
      const TrainingEmployeeData = await TrainingEmployee.findOne({training_employee_id}).usingConnection(req.dynamic_connection);
      if(TrainingEmployeeData){
        return res.ok(TrainingEmployeeData, messages.GET_RECORD,RESPONSE_STATUS.success);
      }else{
        return res.ok(TrainingEmployeeData, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
      }
    } else {
      return res.ok(isValid.error, messages.INVALID_PARAMETER,RESPONSE_STATUS.error);
    }
  }

};
