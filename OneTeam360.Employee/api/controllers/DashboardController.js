const DashboardValidations = require('../validations/DashboardValidations');
const messages = sails.config.globals.messages;
const {  RESPONSE_STATUS, ALL_GRADE } = require('../utils/constants/enums');
const { escapeSqlSearch } = require('../services/utils');
module.exports = {

  managerCardSecondTab: async (req, res) => {
    try{
      let request = {id: req.params.id};
      const isValidate = await DashboardValidations.dashboard.validate(request);
      if (!isValidate.error) {
        const location_id = req.params.id;

        //positive index
        const graphSql = `SELECT DISTINCT ET.employee_interaction_id, ET.created_date,
        (select GROUP_CONCAT( CONCAT(employee_interaction_detail.grade_id) SEPARATOR "," ) 
        FROM employee_interaction INNER JOIN employee_interaction_detail 
        ON employee_interaction.employee_interaction_id = 
        employee_interaction_detail.employee_interaction_id 
        WHERE employee_interaction_detail.employee_interaction_id = ET.employee_interaction_id )
        as grade_count FROM employee_interaction as ET INNER JOIN employee_profile ON ET.employee_profile_id = employee_profile.employee_profile_id inner JOIN employee_location el ON  employee_profile.employee_profile_id = el.employee_profile_id
        inner JOIN location ON el.location_id = location.location_id
        WHERE el.location_id = ${location_id} AND (DATE(ET.created_date) >= DATE(NOW()) - INTERVAL 30 DAY)  HAVING grade_count != ''`;
        const rawResultIndex = await sails.sendNativeQuery(escapeSqlSearch(graphSql)).usingConnection(req.dynamic_connection);
        const resultsIndex = rawResultIndex.rows;
        let _results = [];
        if(resultsIndex.length > 0)
        {
          const grade = await Grade.find();
          let response = [];
          let perfinalGrade=[];
          let finalGrade = [];
          let exccedCount =0;
          let meetCount=0;
          let remediateCount=0;
          for(const item of resultsIndex){
            if(item.grade_count !== null)
            {
              const gradeCountTotal= (item.grade_count).split(',');
              for(const data of grade)
              {
                const grade_id = data.grade_id;
                var rgxp = new RegExp(grade_id, 'g');
                const gradeCount= (item.grade_count).match(rgxp);
                if(gradeCount){
                  const gradePer = ((gradeCount.length), parseFloat((gradeCount.length)/(gradeCountTotal.length))*100).toFixed(2);
                  if(data.grade_id === parseInt(ALL_GRADE.EXCEED_EXPECTATION))
                  {
                    exccedCount += gradeCount.length;
                  }
                  if(data.grade_id === parseInt(ALL_GRADE.MEET_EXPECTATION))
                  {
                    meetCount += gradeCount.length;
                  }
                  if(data.grade_id ===  parseInt(ALL_GRADE.REMEDIATE))
                  {
                    remediateCount +=gradeCount.length;
                  }
                  await finalGrade.push(gradePer);
                }
                else{
                  await finalGrade.push('0');
                }
              }
              await perfinalGrade.push(finalGrade);
              // eslint-disable-next-line no-unused-vars
              let sum1=0;
              for(let i of perfinalGrade)
              {
                sum1 += i[0];
              }
              finalGrade=[];
            }
          }
          const paramsResult1 = (exccedCount !== 0) ? ( { [ALL_GRADE.EXCEED_EXPECTATION]: exccedCount }) : {[ALL_GRADE.EXCEED_EXPECTATION]: 0};
          const paramsResult2 = (meetCount !== 0) ? ( { [ALL_GRADE.MEET_EXPECTATION]: meetCount }) : {[ALL_GRADE.MEET_EXPECTATION]: 0};
          const paramsResult3 = (remediateCount !== 0) ? ( { [ALL_GRADE.REMEDIATE]: remediateCount }) : {[ALL_GRADE.REMEDIATE]: 0};
          await response.push(paramsResult1, paramsResult2, paramsResult3);
          let grade1Total = 0;
          let grade2Total = 0;
          let grade3Total = 0;
          for(let i of perfinalGrade)
          {
            const innerLoop = i;
            grade1Total += Number(innerLoop[0]);
            grade2Total += Number(innerLoop[1]);
            grade3Total += Number(innerLoop[2]);
          }
          for(const data of grade)
          {let count; let statistics;
            if(data.grade_id === parseInt(ALL_GRADE.EXCEED_EXPECTATION))
            {
              count = exccedCount;
              statistics = ((grade1Total)/resultsIndex.length).toFixed(2);
            }
            if(data.grade_id === parseInt(ALL_GRADE.MEET_EXPECTATION))
            {
              count = meetCount;
              statistics = ((grade2Total)/resultsIndex.length).toFixed(2);
            }
            if(data.grade_id ===  parseInt(ALL_GRADE.REMEDIATE))
            {
              count = remediateCount;
              statistics = ((grade3Total)/resultsIndex.length).toFixed(2);
            }
            await _results.push({
              id    : data.grade_id,
              name  : data.name,
              count : count,
              statistics
            });
          }
          sails.log(_results);
        }

        //stars of the week
        const starsWeekSql = `SELECT earn_employee.earn_points, earn_employee.employee_profile_id, user.first_name, user.last_name, 
        user.profile_picture_url, user.profile_picture_thumbnail_url, 
        employee_profile.points, level.name as level
          FROM (
          select sum(epa.points_earned) as earn_points, epa.employee_profile_id  from employee_point_audit epa
          where (DATE(epa.created_date) >= DATE(NOW()) - INTERVAL 7 DAY) 
          AND epa.points_earned != 0 group by epa.employee_profile_id  
          ) earn_employee
        JOIN employee_profile 
        ON earn_employee.employee_profile_id = employee_profile.employee_profile_id 
        inner JOIN employee_location el ON  employee_profile.employee_profile_id = el.employee_profile_id
        inner JOIN location ON el.location_id = location.location_id
        INNER JOIN ${process.env.DB_NAME}.user ON employee_profile.user_id = user.user_id 
        inner JOIN level ON employee_profile.level_id = level.level_id
        where el.location_id = ${location_id} order by earn_employee.earn_points DESC limit 5`;
        const starsResult = await sails.sendNativeQuery(escapeSqlSearch(starsWeekSql)).usingConnection(req.dynamic_connection);
        const starsOfTheWeek = starsResult.rows;

        //Leveled up in last month
        const levelupLastMonthSql =`Select el.location_id, temp.created_date, temp.employee_profile_id, new_level_id, old_level_id, user.first_name, user.last_name, 
        user.profile_picture_url, user.profile_picture_thumbnail_url, employee_profile.points, level.name as level
         from
           (Select distinct created_date, employee_profile_id, new_level_id, old_level_id from employee_point_audit 
            where (DATE(created_date) >= DATE(NOW()) - INTERVAL 30 DAY) and (new_level_id > old_level_id) group by employee_profile_id
           ORDER BY (created_date) DESC) 
        as temp INNER JOIN employee_profile ON temp.employee_profile_id = employee_profile.employee_profile_id
        INNER JOIN ${process.env.DB_NAME}.user ON employee_profile.user_id = user.user_id 
        inner JOIN level ON employee_profile.level_id = level.level_id
        inner JOIN employee_location el ON  employee_profile.employee_profile_id = el.employee_profile_id
        inner JOIN location ON el.location_id = location.location_id
        where el.location_id = ${location_id} 
        order by new_level_id DESC`;
        const rawResultLevelUp = await sails.sendNativeQuery(escapeSqlSearch(levelupLastMonthSql)).usingConnection(req.dynamic_connection);
        const resultsLevelUp = rawResultLevelUp.rows;

        //5 points from leveling up
        const rawResultLevel = await sails.sendNativeQuery(`CALL CardLevelIncreasing(@var_output)`).usingConnection(req.dynamic_connection);
        const increasingLevelResult = rawResultLevel.rows;

        let responseEmployee = [];
        if(increasingLevelResult && increasingLevelResult.length > 0)
        {
          let employees = [];
          sails.log(increasingLevelResult[0][0].var_output);
          if(increasingLevelResult[0][0].var_output !== null)
          {
            employees = (increasingLevelResult[0][0].var_output).split(',');
            for( const item of employees){
              const empsql = `SELECT user.first_name, user.last_name, 
              user.profile_picture_url, user.profile_picture_thumbnail_url, 
              employee_profile.points, level.name as level, employee_profile.employee_profile_id FROM employee_profile
              INNER JOIN ${process.env.DB_NAME}.user ON employee_profile.user_id = user.user_id 
              inner JOIN level ON employee_profile.level_id = level.level_id
              inner JOIN employee_location el ON  employee_profile.employee_profile_id = el.employee_profile_id
              inner JOIN location ON el.location_id = location.location_id
              where el.location_id = ${location_id} AND employee_profile.employee_profile_id = ${item}`;
              const empIncrease = await sails.sendNativeQuery(escapeSqlSearch(empsql)).usingConnection(req.dynamic_connection);
              const employeeIncrease = empIncrease.rows;
              if(employeeIncrease.length > 0){
                await responseEmployee.push(employeeIncrease[0]);
              }
            }
          }
        }
        let response = {
          positivityIndex : _results,
          starsOfWeek     : starsOfTheWeek,
          leveledUpMonth  : resultsLevelUp,
          increasingLevel : responseEmployee
        };
        return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(isValidate.error, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }}
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  managerCardFirstTab: async (req, res) => {
    try{
      let request = {id: req.params.id};
      const isValidate = await DashboardValidations.dashboard.validate(request);
      if (!isValidate.error) {
        const location_id = req.params.id;
        //pending interaction for that day
        const pendingInteractionSql = `(select COUNT(distinct earn_employee.employee_profile_id) as interaction_count
        from (
        select employee_profile_id from employee_point_audit epa
        where interaction_score > 0 and date(epa.created_date) = CURDATE()
         ) earn_employee
        INNER JOIN employee_profile ON earn_employee.employee_profile_id = employee_profile.employee_profile_id 
        inner JOIN employee_location el ON  employee_profile.employee_profile_id = el.employee_profile_id
        JOIN location ON el.location_id = location.location_id
        where el.location_id = ${location_id});`;
        const rawResultPendingInteraction = await sails.sendNativeQuery(escapeSqlSearch(pendingInteractionSql)).usingConnection(req.dynamic_connection);
        const resultsPendingInteraction = rawResultPendingInteraction.rows;

        //pending task
        const employeeId = await EmployeeProfile.findOne({ user_id: req.user.user_id }).usingConnection(req.dynamic_connection);

        const pendingCheck = ` AND task.location_id IN ('${location_id}') AND (task.task_status = 'Pending' OR task.task_status = 'Overdue')`;
        const assigned = 2;
        const totalCount = await sails.sendNativeQuery('CALL TaskListCount("' + parseInt(employeeId.employee_profile_id) + '","'+parseInt(assigned)+'","'+pendingCheck+'") ').usingConnection(req.dynamic_connection);
        const taskListCount = totalCount.rows[0].length;

        //total team members
        const teamMemberSql =`SELECT count(distinct employee_profile.employee_profile_id) as emp_count from employee_profile JOIN employee_location as el On employee_profile.employee_profile_id = el.employee_profile_id JOIN location ON el.location_id = location.location_id JOIN ${process.env.DB_NAME}.user ON employee_profile.user_id = user.user_id where location.location_id =${location_id} AND employee_profile.status = 'Active' AND user.status = 'Active'`;
        const rawResultteamMember = await sails.sendNativeQuery(escapeSqlSearch(teamMemberSql)).usingConnection(req.dynamic_connection);
        const resultsTeamMember = rawResultteamMember.rows;

        let response = {
          pendingInteractionCount : (resultsTeamMember[0].emp_count)  - (resultsPendingInteraction[0].interaction_count),
          pendingTaskCount        : taskListCount,
          teamMembersCount        : resultsTeamMember[0].emp_count,
        };
        return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }}
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  employeeCard: async(req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await DashboardValidations.employeeDashboard.validate(request);
      if (!isValidate.error) {
        const { location_id, employee_profile_id} = request;

        //positive index
        const graphSql = `SELECT DISTINCT ET.employee_interaction_id, ET.created_date,
        (select GROUP_CONCAT( CONCAT(employee_interaction_detail.grade_id) SEPARATOR "," ) 
        FROM employee_interaction INNER JOIN employee_interaction_detail 
        ON employee_interaction.employee_interaction_id = 
        employee_interaction_detail.employee_interaction_id 
        WHERE employee_interaction_detail.employee_interaction_id = ET.employee_interaction_id )
        as grade_count FROM employee_interaction as ET INNER JOIN employee_profile ON ET.employee_profile_id = employee_profile.employee_profile_id inner JOIN employee_location el ON  employee_profile.employee_profile_id = el.employee_profile_id
        inner JOIN location ON el.location_id = location.location_id
        WHERE el.location_id = ${location_id} AND ET.employee_profile_id=${employee_profile_id} AND (DATE(ET.created_date) >= DATE(NOW()) - INTERVAL 30 DAY)  HAVING grade_count != ''`;
        const rawResultIndex = await sails.sendNativeQuery(escapeSqlSearch(graphSql)).usingConnection(req.dynamic_connection);
        const resultsIndex = rawResultIndex.rows;
        let _results = [];
        if(resultsIndex.length > 0)
        {
          const grade = await Grade.find();
          let response3 = [] || any;
          let perfinalGrade=[];
          let finalGrade = [];
          let exccedCount =0;
          let meetCount=0;
          let remediateCount=0;
          for(const item of resultsIndex){
            if(item.grade_count !== null)
            {
              const gradeCountTotal= (item.grade_count).split(',');
              for(const data of grade)
              {
                const grade_id = data.grade_id;
                let rgxp = new RegExp(grade_id, 'g');
                const gradeCount= (item.grade_count).match(rgxp);
                if(gradeCount){
                  const gradePer = ((gradeCount.length), parseFloat((gradeCount.length)/(gradeCountTotal.length))*100).toFixed(2);
                  if(data.grade_id === parseInt(ALL_GRADE.EXCEED_EXPECTATION))
                  {
                    exccedCount += gradeCount.length;
                  }
                  if(data.grade_id === parseInt(ALL_GRADE.MEET_EXPECTATION))
                  {
                    meetCount += gradeCount.length;
                  }
                  if(data.grade_id ===  parseInt(ALL_GRADE.REMEDIATE))
                  {
                    remediateCount +=gradeCount.length;
                  }
                  finalGrade.push(gradePer);
                }
                else{
                  finalGrade.push('0');
                }
              }
              perfinalGrade.push(finalGrade);
              // eslint-disable-next-line no-unused-vars
              let sum1=0;
              for(let i of perfinalGrade)
              {
                sum1 += i[0];
              }
              finalGrade=[];
            }
          }
          const paramsResult1 = (exccedCount !== 0) ? ( { [ALL_GRADE.EXCEED_EXPECTATION]: exccedCount }) : {[ALL_GRADE.EXCEED_EXPECTATION]: 0};
          const paramsResult2 = (meetCount !== 0) ? ( { [ALL_GRADE.MEET_EXPECTATION]: meetCount }) : {[ALL_GRADE.MEET_EXPECTATION]: 0};
          const paramsResult3 = (remediateCount !== 0) ? ( { [ALL_GRADE.REMEDIATE]: remediateCount }) : {[ALL_GRADE.REMEDIATE]: 0};
          response3.push(paramsResult1, paramsResult2, paramsResult3);
          let grade1Total = 0;
          let grade2Total = 0;
          let grade3Total = 0;
          for(let item of perfinalGrade)
          {
            grade1Total += Number(item[0]);
            grade2Total += Number(item[1]);
            grade3Total += Number(item[2]);
          }
          for(const data of grade)
          {let count; let statistics;
            if(data.grade_id === parseInt(ALL_GRADE.EXCEED_EXPECTATION))
            {
              count = exccedCount;
              statistics = ((grade1Total)/resultsIndex.length).toFixed(2);
            }
            if(data.grade_id === parseInt(ALL_GRADE.MEET_EXPECTATION))
            {
              count = meetCount;
              statistics = ((grade2Total)/resultsIndex.length).toFixed(2);
            }
            if(data.grade_id ===  parseInt(ALL_GRADE.REMEDIATE))
            {
              count = remediateCount;
              statistics = ((grade3Total)/resultsIndex.length).toFixed(2);
            }
            _results.push({
              id    : data.grade_id,
              name  : data.name,
              count : count,
              statistics
            });
          }
          sails.log(_results);
        }
        let response = {
          positivityIndex: _results,
        };
        return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
      } else {
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
      }}
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
    }
  }
};
