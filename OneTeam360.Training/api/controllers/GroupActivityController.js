/* eslint-disable eqeqeq */
const messages = sails.config.globals.messages;
const GroupActivityValidation = require('../validations/GroupActivityValidation');
const moment = require('moment');
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const { RESPONSE_STATUS, SCENARIO_STATUS, GROUP_ACTIVITY_STATUS } = require('../utils/constants/enums');
const { getDateUTC, formatDate } = require('../utils/common/getDateTime');
const { addMultiSkillTaskApi } = require('../utils/common/apiCall');

const traininAndEmployeeData=async(trainings,employees,groupActivityId,req)=>{
  if (trainings !== undefined && trainings !== null && trainings.length > 0) {
    const trainings_arr = trainings.map((training) => {
      return { group_activity_id: groupActivityId, training_id: training.training_id, training_category_id: training.training_category_id, created_by: req.user.user_id, created_date: getDateUTC() };
    });
    if (trainings_arr.length > 0) {
      await GroupActivityTraining.createEach(trainings_arr).usingConnection(req.dynamic_connection);
    }
  }

  if (employees !== undefined && employees !== null && employees.length > 0) {
    const employees_arr = employees.map((employee) => {
      return { group_activity_id: groupActivityId, employee_profile_id: employee, created_by: req.user.user_id, created_date: getDateUTC() };
    });
    if (employees_arr.length > 0) {
      await GroupActivityEmployee.createEach(employees_arr).usingConnection(req.dynamic_connection);
    }
  }
};

const trainingEmpJobLocationData=async(trainings,employees,jobTypes,locations,groupActivityId,req)=>{
  await traininAndEmployeeData(trainings,employees,groupActivityId,req);

  if (jobTypes !== undefined && jobTypes !== null && jobTypes.length > 0) {
    const jobType_arr = jobTypes.map((jobtype) => {
      return { group_activity_id: groupActivityId, job_type_id: jobtype, created_by: req.user.user_id, created_date: getDateUTC() };
    });
    if (jobType_arr.length > 0) {
      await GroupActivityJobType.createEach(jobType_arr).usingConnection(req.dynamic_connection);
    }
  }

  if (locations !== undefined && locations !== null && locations.length > 0) {
    const location_arr = locations.map((location) => {
      return { group_activity_id: groupActivityId, location_id: location, created_by: req.user.user_id, created_date: getDateUTC() };
    });
    if (location_arr.length > 0) {
      await GroupActivityLocation.createEach(location_arr).usingConnection(req.dynamic_connection);
    }
  }
};

const empGradesData=async(employeeGrades,remediategrades,trainingEmployees_arr,notes,groupActivityId,req)=>{
  for (const employee of employeeGrades) {
    if (employee !== undefined && employee !== null && employee.grades !== undefined && employee.grades !== null && employee.grades.length > 0) {
      {
        employee.grades.map((grade) => {
          if (grade.grade_id === 3 && remediategrades === false) {
            remediategrades = true;
          }
          return  trainingEmployees_arr.push({ group_activity_id: groupActivityId, training_id: grade.training_id, employee_profile_id: employee.employee_profile_id, grade_id: grade.grade_id, notes: notes, status: GROUP_ACTIVITY_STATUS.active, created_by: req.user.user_id, created_date: getDateUTC() });
        });
      }
    }
  }
};

module.exports = {
  add: async(req, res) => {
    try {
      let request = req.allParams();
      request = _.omit(request, 'jobTypes', 'locations');
      const isValidate = await GroupActivityValidation.add.validate(request);
      if (!isValidate.error) {
        const { day, name, trainings, jobTypes, locations, employees, employeeGrades, notes } = req.allParams();

        let scenarioName = name;
        if (scenarioName === undefined || scenarioName === null || scenarioName === '') {
          let currentDate = moment().format('MM/DD/YYYY');
          let newscenarioName = `Unnamed - ${currentDate}`;

          const scenarios = await sails.sendNativeQuery(`SELECT Count(*) as scenariocount FROM scenario where name like '%${newscenarioName}%';`).usingConnection(req.dynamic_connection);
          const groupactivities = await sails.sendNativeQuery(`SELECT Count(*) as scenariocount FROM group_activity where scenario like '%${newscenarioName}%';`).usingConnection(req.dynamic_connection);
          const unnamedScenariosCount = (scenarios.rows[0].scenariocount + groupactivities.rows[0].scenariocount) + 1;
          scenarioName = unnamedScenariosCount + '. ' + newscenarioName;
        }

        const groupActivity = await GroupActivity.create({
          scenario        : scenarioName,
          day,
          notes,
          status          : GROUP_ACTIVITY_STATUS.active,
          created_by      : req.user.user_id,
          last_updated_by : req.user.user_id,
          created_date    : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        const groupActivityId = groupActivity.group_activity_id;
        await trainingEmpJobLocationData(trainings,employees,jobTypes,locations,groupActivityId,req);

        const trainingEmployees_arr = [];
        let remediategrades = false;

        await empGradesData(employeeGrades,remediategrades,trainingEmployees_arr,notes,groupActivityId,req);

        if (trainingEmployees_arr.length > 0) { await TrainingEmployee.createEach(trainingEmployees_arr).usingConnection(req.dynamic_connection); }

        if (remediategrades === true) {
          await addMultiSkillTaskApi(req, { groupActivityId: groupActivityId });
        }

        return res.ok(groupActivityId, messages.ADD_GROUP_ACTIVITY, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.ADD_GROUP_ACTIVITY_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.SOMETHING_WENT_WRONG, RESPONSE_STATUS.error);
    }
  },

  find: async(req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await GroupActivityValidation.filter.validate(request);
      if (!isValidate.error) {
        const findQuery = await commonListing(request);
        let sql = '';
        let filterCount = 1;
        let filterValues = [];
        if ((findQuery.andCondition).length > 0) {
          const andPayload = findQuery.andCondition;
          for (const data of andPayload) {
            Object.keys(data).forEach((prop) => {
              if ((prop === 'day') && (data[prop] !== '')) {
                sql = sql + `AND GA.${prop} LIKE $` + filterCount + ``;
                filterValues.push('%' + escapeSearch(data[prop]) + '%');
                filterCount++;
              }
              if ((prop === 'scenario') && (data[prop] !== '')) {
                sql = sql + ` AND GA.${prop} LIKE $` + filterCount + ``;
                filterValues.push('%' + escapeSearch(data[prop]) + '%');
                filterCount++;
              }
              if ((prop === 'training') && ((data[prop]).length > 0)) {
                let taskPayload = data[prop];
                if (taskPayload !== undefined && taskPayload !== null && taskPayload.length > 0) {
                  const taskName = taskPayload.map(c => `'${c}'`).join(', ');
                  const taskId = '(' + taskName + ')';
                  sql = sql + ` AND group_activity_training.training_id IN ${taskId}`;
                }
              }
              if ((prop === 'location') && (data[prop]).length > 0) {
                let locationPayload = data[prop];
                if (locationPayload !== undefined && locationPayload !== null && locationPayload.length > 0) {
                  const locationName = locationPayload.map(c => `'${c}'`).join(', ');
                  const locationId = '(' + locationName + ')';
                  sql = sql + ` AND group_activity_location.location_id IN ${locationId}`;
                }
              }
              if ((prop === 'job_type') && ((data[prop]).length > 0)) {
                let jobtypePayload = data[prop];
                if (jobtypePayload !== undefined && jobtypePayload !== null && jobtypePayload.length > 0) {
                  const jobtypeName = jobtypePayload.map(c => `'${c}'`).join(', ');
                  const jobtypeIds = '(' + jobtypeName + ')';
                  sql = sql + ` AND group_activity_job_type.job_type_id IN ${jobtypeIds}`;
                }
              }
              if ((prop === 'participants') && (data[prop] !== '')) {
                sql = sql + ` AND (SELECT Count(employee_profile.employee_profile_id) FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id) = ${data[prop]}`;
              }
              if ((prop === 'created_date') && (data[prop] !== '')) {
                if ((data[prop].from_date !== '' && data[prop].from_date !== undefined) && (data[prop].to_date !== '' && data[prop].to_date !== undefined)) {
                  const startDate = moment(data[prop].from_date).format('YYYY-MM-DD');
                  const endDate = moment(data[prop].to_date).format('YYYY-MM-DD');
                  sql = sql + ` AND (GA.${prop} BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
                } else if (data[prop].from_date !== '' && data[prop].from_date !== undefined) {
                  const startDate = moment(data[prop].from_date).format('YYYY-MM-DD');
                  const endDate = moment(data[prop].from_date).format('YYYY-MM-DD');
                  sql = sql + ` AND (GA.${prop} BETWEEN ('${startDate} 00:00') AND ('${endDate} 23:59'))`;
                }
              }
              if ((prop === 'created_by') && (data[prop] !== '')) {
                sql = sql + ` AND (concat(user.first_name,' ', user.last_name) LIKE $` + filterCount + `) `;
                filterValues.push('%' + escapeSearch(data[prop]) + '%');
                filterCount++;
              }
            });
          }
        }

        let results;
        let andQuery = ' ';
        if (sql !== '') {
          andQuery = sql;
        }

        if (findQuery.sort == 'participants DESC') {
          findQuery.sort = '(SELECT Count(employee_profile.employee_profile_id) FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id) DESC';
        } else if (findQuery.sort == 'participants ASC') {
          findQuery.sort = '(SELECT Count(employee_profile.employee_profile_id) FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id) ASC';
        }

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch('CALL GroupActivityList( "' + parseInt(findQuery.rows) + '", "' + parseInt(findQuery.skip) + '", "' + andQuery + '","' + findQuery.sort + '") '), filterValues).usingConnection(req.dynamic_connection);
        results = rawResult.rows[0];

        if (results !== undefined && results !== null && results.length > 0) {
          const response = await results.map((item) => {
            const participants = (item.employee_profile).split(',');
            return {
              group_activity_id : (item.group_activity_id),
              title             : (item.day) ? (item.day) : '',
              scenario          : (item.scenario) ? (item.scenario) : '',
              job_type          : (item.job_type),
              location          : (item.location),
              training          : item.training,
              participants      : participants.length,
              conducted_date    : item.created_date ? formatDate(item.created_date, req.dateFormat) : '',
              conducted_by      : (item.created_by),
            };
          });

          const totalCount = await sails.sendNativeQuery('CALL GroupActivityCount("' + andQuery + '")', filterValues).usingConnection(req.dynamic_connection);
          const listCount = totalCount.rows[0].length;
          let data = {
            total_count : listCount,
            result      : response
          };
          return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }
      } else {
        res.ok(isValidate.error, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_DATA_FAILED, RESPONSE_STATUS.error);
    }
  },

  delete: async(req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await GroupActivityValidation.delete.validate(request);
      if (!isValidate.error) {
        const group_activity_id = req.params.id;
        await GroupActivity.update({
          group_activity_id
        }, {
          status            : SCENARIO_STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        await TrainingEmployee.update({
          group_activity_id: group_activity_id
        }, {
          status            : SCENARIO_STATUS.inactive,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).usingConnection(req.dynamic_connection);
        res.ok(undefined, messages.DELETE_GROUP_ACTIVITY, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.DELETE_FAIL, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.DELETE_FAIL, RESPONSE_STATUS.error);
    }
  },

  findById: async(req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await GroupActivityValidation.delete.validate(request);
      if (!isValidate.error) {
        const group_activity_id = req.params.id;
        const result = await GroupActivity.findOne({
          group_activity_id
        }).usingConnection(req.dynamic_connection);
        if (result) {
          let grade = [];
          const location = await GroupActivityLocation.find({ group_activity_id }).usingConnection(req.dynamic_connection);
          const jobType = await GroupActivityJobType.find({ group_activity_id }).usingConnection(req.dynamic_connection);
          const training = await GroupActivityTraining.find({ group_activity_id }).usingConnection(req.dynamic_connection);
          const employee = await GroupActivityEmployee.find({ group_activity_id }).usingConnection(req.dynamic_connection);
          for (const item of employee) {
            const gradeId = await TrainingEmployee.find({
              where  : { group_activity_id, employee_profile_id: item.employee_profile_id },
              select : ['grade_id', 'training_id']
            }).usingConnection(req.dynamic_connection);
            const userId = await EmployeeProfile.findOne({ employee_profile_id: item.employee_profile_id }).usingConnection(req.dynamic_connection);
            const userName = await Users.findOne({ user_id: userId.user_id });
            grade.push({
              employee: {
                employee_profile_id : item.employee_profile_id,
                employee_name       : `${userName.first_name} ${userName.last_name}`
              },
              grades: gradeId
            });
          }
          let response = {
            day      : result.day,
            scenario : result.scenario,
            notes    : result.notes,
            location,
            jobType,
            training,
            employee,
            grade
          };
          res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
        } else {
          res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
        }

      } else {
        res.ok(isValidate.error, messages.GET_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log.error(err);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },
};
