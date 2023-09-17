
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
const ScenarioValidation = require('../validations/ScenarioValidation');
const { RESPONSE_STATUS,SCENARIO_STATUS } = require('../utils/constants/enums');
const { getDateUTC } = require('../utils/common/getDateTime');
const moment = require('moment');

const trainingAndJobDetails=async(trainingCategories,jobTypes,req,scenarioId)=>{
  if(trainingCategories !== undefined && trainingCategories !== null){
    const trainingCategories_arr = trainingCategories.map((training_category_id) => { return { scenario_id: scenarioId, training_category_id: training_category_id, status: SCENARIO_STATUS.active, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
    if (trainingCategories_arr.length > 0) {
      return ScenarioTrainingCategory.createEach(trainingCategories_arr).usingConnection(req.dynamic_connection);
    }
  }

  if(jobTypes !== undefined && jobTypes !== null){
    const jobTypes_arr = jobTypes.map((job_type_id) => { return { scenario_id: scenarioId, job_type_id: job_type_id, status: SCENARIO_STATUS.active, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
    if (jobTypes_arr.length > 0) {
      return ScenarioJobType.createEach(jobTypes_arr).usingConnection(req.dynamic_connection);
    }
  }
};

const scenarioNameData=async(scenarioName,scenarioDetail)=>{
  if(scenarioName === undefined || scenarioName === null || scenarioName === ''){
    scenarioName = scenarioDetail.name;
  }
  return scenarioName;
};

const trainingCategoriesData=async(trainingCategories,id,req)=>{
  if(trainingCategories !== undefined && trainingCategories !== null){
    const scenarioTrainingCategories = await ScenarioTrainingCategory.find({ scenario_id: id, status: SCENARIO_STATUS.active }).usingConnection(req.dynamic_connection);
    let existingTrainingCategories = scenarioTrainingCategories.map(x => x.training_category_id);
    let unionTrainingCategories = [...new Set([...trainingCategories, ...existingTrainingCategories])];
    let addTrainingCategories = unionTrainingCategories.filter(x => !existingTrainingCategories.includes(x));
    let removeTrainingCategories = unionTrainingCategories.filter(x => !trainingCategories.includes(x));

    const trainingCategories_add_arr = addTrainingCategories.map((training_category_id) => { return { scenario_id: id, training_category_id: training_category_id, status: SCENARIO_STATUS.active, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
    if (trainingCategories_add_arr.length > 0) {
      return ScenarioTrainingCategory.createEach(trainingCategories_add_arr).usingConnection(req.dynamic_connection);
    }

    for(let rtrainingcat of removeTrainingCategories){
      return ScenarioTrainingCategory.update({ scenario_id: id, training_category_id: removeTrainingCategories[rtrainingcat] },
      {
        status            : SCENARIO_STATUS.inactive,
        last_updated_by   : req.user.user_id,
        last_updated_date : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
    }
  }
};

const scenarioJobTypeData=async(jobTypes,req,id)=>{
  if(jobTypes !== undefined && jobTypes !== null){
    const scenarioJobTypes = await ScenarioJobType.find({ scenario_id: id, status: SCENARIO_STATUS.active }).usingConnection(req.dynamic_connection);
    let existingJobTypes = scenarioJobTypes.map(x => x.job_type_id);
    let unionJobTypes = [...new Set([...jobTypes, ...existingJobTypes])];
    let addJobTypes = unionJobTypes.filter(x => !existingJobTypes.includes(x));
    let removeJobTypes = unionJobTypes.filter(x => !jobTypes.includes(x));

    const trainingJobType_add_arr = addJobTypes.map((job_type_id) => { return { scenario_id: id, job_type_id: job_type_id, status: SCENARIO_STATUS.active, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
    if (trainingJobType_add_arr.length > 0) {
      return ScenarioJobType.createEach(trainingJobType_add_arr).usingConnection(req.dynamic_connection);
    }

    for(let rjobtype of removeJobTypes){
      return ScenarioJobType.update({ scenario_id: id, job_type_id: removeJobTypes[rjobtype] },
      {
        status            : SCENARIO_STATUS.inactive,
        last_updated_by   : req.user.user_id,
        last_updated_date : getDateUTC()
      }).fetch().usingConnection(req.dynamic_connection);
    }
  }
};

module.exports = {
  add: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await ScenarioValidation.add.validate(request);
      if (!isValidate.error) {
        const { day, name, trainings, trainingCategories, jobTypes} = req.allParams();

        let scenarioName = name;
        if(scenarioName === undefined || scenarioName === null || scenarioName === ''){
          let currentDate = moment().format('MM/DD/YYYY');
          let newscenarioName = `Unnamed - ${currentDate}`;

          const scenarios = await sails.sendNativeQuery(`SELECT Count(*) as scenariocount FROM scenario where name like '%${newscenarioName}%';`).usingConnection(req.dynamic_connection);
          const groupactivities = await sails.sendNativeQuery(`SELECT Count(*) as scenariocount FROM group_activity where scenario like '%${newscenarioName}%';`).usingConnection(req.dynamic_connection);
          const unnamedScenariosCount = (scenarios.rows[0].scenariocount + groupactivities.rows[0].scenariocount) + 1;
          scenarioName = unnamedScenariosCount + '. ' + newscenarioName;
        }

        const newScenario = await Scenario.create({
          day,
          name            : scenarioName,
          created_by      : req.user.user_id,
          last_updated_by : null,
          created_date    : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        const scenarioId = newScenario.scenario_id;

        const trainings_arr = trainings.map((training_id) => { return { scenario_id: scenarioId, training_id: training_id, status: SCENARIO_STATUS.active, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
        if (trainings_arr.length > 0) { await ScenarioTraining.createEach(trainings_arr).usingConnection(req.dynamic_connection); }

        await trainingAndJobDetails(trainingCategories,jobTypes,req,scenarioId);

        return res.ok(scenarioId, messages.ADD_SUCCESS, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.ADD_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await ScenarioValidation.edit.validate(request);
      if (!isValidate.error) {
        const scenarioDetail = await Scenario.findOne({ scenario_id: request.id }).usingConnection(req.dynamic_connection);
        if(scenarioDetail) {
          const { id, day, name, trainings, trainingCategories, jobTypes } = req.allParams();

          let scenarioName = name;
          await scenarioNameData(scenarioName,scenarioDetail);

          const scenarioTrainings = await ScenarioTraining.find({ scenario_id: id, status: SCENARIO_STATUS.active }).usingConnection(req.dynamic_connection);
          let existingTrainings = scenarioTrainings.map(x => x.training_id);
          let unionTrainings = [...new Set([...trainings, ...existingTrainings])];
          let addTrainings = unionTrainings.filter(x => !existingTrainings.includes(x));
          let removeTrainings = unionTrainings.filter(x => !trainings.includes(x));

          const trainings_add_arr = addTrainings.map((training_id) => { return { scenario_id: id, training_id: training_id, status: SCENARIO_STATUS.active, created_by: req.user.user_id, last_updated_by: req.user.user_id, created_date: getDateUTC() }; });
          if (trainings_add_arr.length > 0) { await ScenarioTraining.createEach(trainings_add_arr).usingConnection(req.dynamic_connection); }

          for(let rtraining of removeTrainings){
            await ScenarioTraining.update({ scenario_id: id, training_id: removeTrainings[rtraining] },
            {
              status            : SCENARIO_STATUS.inactive,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
          }

          await trainingCategoriesData(trainingCategories,id,req);
          await scenarioJobTypeData(jobTypes,req,id);

          await Scenario.update({ scenario_id: id },{
            day,
            name              : scenarioName,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          return res.ok(id, messages.UPDATE_SUCCESS, RESPONSE_STATUS.success);
        }
        else {
          return res.ok(scenarioDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        res.ok(isValidate.error, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  findByName: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await ScenarioValidation.nameParamValidation.validate(request);
      if (!isValidate.error) {
        const scenarioDetail = await Scenario.findOne({ name: request.id }).usingConnection(req.dynamic_connection);
        if(scenarioDetail){
          return res.ok(scenarioDetail, messages.GET_RECORD, RESPONSE_STATUS.success);
        }else{
          return res.ok(scenarioDetail, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        return res.ok(isValidate.error, messages.GET_RECORD, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log('err',err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
  findScenarios: async function (req, res) {
    try {
      let results;
      const isValid = ScenarioValidation.getSenarios.validate(req.allParams());
      if (!isValid.error) {
        const { jobTypes } = req.allParams();

        if(jobTypes !== undefined && jobTypes !== null && jobTypes.length > 0){
          let filterJobType = { };
          if(jobTypes.length > 0) {
            filterJobType.job_type_id = jobTypes.map((jobtypeId) => parseInt(jobtypeId));
          }

          const scenarioJobTypes = await ScenarioJobType.find(filterJobType).usingConnection(req.dynamic_connection);
          let filter = {};
          if(scenarioJobTypes.length > 0){
            const scenarioIds = scenarioJobTypes.map((x) => x.scenario_id);
            filter.scenario_id = scenarioIds;
          } else {
            return res.ok(results, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
          }

          results = await Scenario.find(filter).usingConnection(req.dynamic_connection);
        }
        else {
          results = await Scenario.find({
            where: { },
          }).usingConnection(req.dynamic_connection);
        }

        await results.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
        const scenarioList = results.map((item)=>({
          scenario_id : item.scenario_id,
          name        : item.name
        }));
        return res.ok(scenarioList, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
    }
    catch (err) {
      sails.log('err',err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },
  findById: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await ScenarioValidation.idParamValidation.validate(request);
      if (!isValidate.error) {
        const scenarioDetail = await Scenario.findOne({ scenario_id: request.id }).usingConnection(req.dynamic_connection);

        const scenarioTrainings = await ScenarioTraining.find({ scenario_id: request.id, status: SCENARIO_STATUS.active }).usingConnection(req.dynamic_connection);

        const scenarioTrainingCategories = await ScenarioTrainingCategory.find({ scenario_id: request.id, status: SCENARIO_STATUS.active }).usingConnection(req.dynamic_connection);

        const scenarioJobTypes = await ScenarioJobType.find({ scenario_id: request.id, status: SCENARIO_STATUS.active }).usingConnection(req.dynamic_connection);

        let _response = {
          scenarioName               : scenarioDetail.name,
          scenarioDay                : scenarioDetail.day,
          scenarioTrainings          : scenarioTrainings,
          scenarioTrainingCategories : scenarioTrainingCategories,
          scenarioJobTypes           : scenarioJobTypes
        };

        if(_response) {
          return res.ok(_response, messages.GET_RECORD, RESPONSE_STATUS.success);
        }else{
          return res.ok(_response, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
        }
      } else {
        return res.ok(isValidate.error, messages.GET_RECORD, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log('err',err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },
};
