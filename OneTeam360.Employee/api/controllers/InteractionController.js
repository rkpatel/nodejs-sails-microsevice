/***************************************************************************

  Controller     : Tenant Employee Profile notes

***************************************************************************/

const { RESPONSE_STATUS, ALL_GRADE } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const InteractionValidations = require('../validations/InteractionValidations');
const { getDateUTC } = require('../utils/common/getDateTime');

const paramsResult1Datas=(exccedCount)=>{
  return (exccedCount !== 0) ? ( { [ALL_GRADE.EXCEED_EXPECTATION]: exccedCount }) : {[ALL_GRADE.EXCEED_EXPECTATION]: 0};
};

const paramsResult2Datas=(meetCount)=>{
  return (meetCount !== 0) ? ( { [ALL_GRADE.MEET_EXPECTATION]: meetCount }) : {[ALL_GRADE.MEET_EXPECTATION]: 0};
};

const paramsResult3Datas=(meetCount,remediateCount)=>{
  return (meetCount !== 0) ? ( { [ALL_GRADE.REMEDIATE]: remediateCount }) : {[ALL_GRADE.REMEDIATE]: 0};
};

const finalGradeDatas=(gradeCount,exccedCount,meetCount,remediateCount,finalGrade,gradeCountTotal,data)=>{

  if(gradeCount){
    const gradePer = ((gradeCount.length), parseFloat((gradeCount.length)/(gradeCountTotal.length))*100).toFixed(2);
    finalGrade.push(gradePer);
  }
  else{
    finalGrade.push('0');
  }
  return finalGrade;
};

const perfinalGradeData=(results,exccedCount,meetCount,remediateCount,finalGrade,perfinalGrade,grade)=>{
  for(const item of results){
    if(item.grade_count !== null)
    {
      const gradeCountTotal= (item.grade_count).split(',');
      let finalGradeData=[];
      for(const data of grade)
      {
        const grade_id = data.grade_id;
        let rgxp = new RegExp(grade_id, 'g');
        const gradeCount= (item.grade_count).match(rgxp);
        if(data.grade_id === parseInt(ALL_GRADE.EXCEED_EXPECTATION) && gradeCount !== null)
        {
          exccedCount += gradeCount.length;
        }
        if(data.grade_id === parseInt(ALL_GRADE.MEET_EXPECTATION) && gradeCount !== null)
        {
          meetCount += gradeCount.length;
        }
        if(data.grade_id ===  parseInt(ALL_GRADE.REMEDIATE) && gradeCount !== null)
        {
          remediateCount +=gradeCount.length;
        }
        finalGradeData=finalGradeDatas(gradeCount,exccedCount,meetCount,remediateCount,finalGrade,gradeCountTotal,data);
      }
      perfinalGrade.push(finalGradeData);
      perfinalGrade.push(exccedCount);
      perfinalGrade.push(meetCount);
      perfinalGrade.push(remediateCount);
      // eslint-disable-next-line no-unused-vars
      let sum1=0;
      for(let i of perfinalGrade)
      {
        sum1 += i[0];
      }
      finalGrade=[];
      sails.log(finalGrade);
    }
    return perfinalGrade;
  }
};

const gradeResultData=(grade,remediateCount,grade1Total,grade2Total,grade3Total,exccedCount,results,_results,meetCount)=>{
  for(const data of grade)
  {
    let count; let statistics;
    if(data.grade_id === parseInt(ALL_GRADE.EXCEED_EXPECTATION))
    {
      count = exccedCount;
      statistics = ((grade1Total)/results.length).toFixed(2);
    }
    if(data.grade_id === parseInt(ALL_GRADE.MEET_EXPECTATION))
    {
      count = meetCount;
      statistics = ((grade2Total)/results.length).toFixed(2);
    }
    if(data.grade_id ===  parseInt(ALL_GRADE.REMEDIATE))
    {
      count = remediateCount;
      statistics = ((grade3Total)/results.length).toFixed(2);
    }
    _results.push({
      id    : data.grade_id,
      name  : data.name,
      count : count,
      statistics
    });
  }
  return _results;
};

module.exports = {
  add: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await InteractionValidations.add.validate(request);
      if(!isValidate.error) {
        const { employee_profile_id, notes, interaction_factors } = req.allParams();
        const points = await EmployeeProfile.findOne({employee_profile_id }).usingConnection(req.dynamic_connection);
        const EmpInteraction =  await EmployeeInteraction.create({
          employee_profile_id,
          points       : points.points,
          notes,
          created_by   : req.user.user_id,
          created_date : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        const emp_interaction_details = interaction_factors.map((item) => {
          return {
            employee_interaction_id : EmpInteraction.employee_interaction_id, interaction_factor_id   : item.interaction_factor_id,
            grade_id                : item.grade_id
          };
        });
        if (emp_interaction_details.length > 0) {
          await EmployeeInteractionDetail.createEach(emp_interaction_details).usingConnection(req.dynamic_connection);
        }
        res.ok(undefined, messages.ADD_EMPLOYEE_INTERACTION_SUCCESS, RESPONSE_STATUS.success);
      }else{
        res.ok(isValidate.error,messages.ADD_EMPLOYEE_INTERACTION_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.ADD_EMPLOYEE_INTERACTION_FAILURE,RESPONSE_STATUS.error);
    }
  },

  graph: async (req, res) => {
    try{
      let request = req.allParams();
      const isValidate = await InteractionValidations.graph.validate(request);
      if(!isValidate.error) {
        const {level_id, employee_profile_id} = request;
        const level = await Level.findOne({ level_id }).usingConnection(req.dynamic_connection);
        const startRange = level.point_range_from;
        const endRange = level.point_range_to;
        const lastLevel = await Level.find({
          where : { status: 'Active'},
          sort  : 'level_id DESC',
          limit : 1
        }).usingConnection(req.dynamic_connection);
        let sql = `select GROUP_CONCAT( 
          CONCAT(employee_interaction_detail.grade_id) SEPARATOR "," ) as grade_count
          FROM employee_interaction INNER JOIN employee_interaction_detail 
          ON employee_interaction.employee_interaction_id = employee_interaction_detail.employee_interaction_id WHERE employee_profile_id = ${employee_profile_id} AND `;
        if(lastLevel[0].level_id === level_id){
          sql = sql + `(points > ${startRange}) `;
        }
        else{
          sql= sql + `(points BETWEEN ${startRange} AND ${endRange}) `;
        }
        sql = sql + ` HAVING grade_count != '' `;
        const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
        let results = rawResult.rows;
        if(results.length > 0)
        {
          const grade = await Grade.find();
          let Response = [] || any;
          let perfinalGrade=[];
          let finalGrade = [];
          let exccedCount =0;
          let meetCount=0;
          let remediateCount=0;

          perfinalGrade=perfinalGradeData(results,exccedCount,meetCount,remediateCount,finalGrade,perfinalGrade,grade);
          const paramsResult1 = paramsResult1Datas(exccedCount);
          const paramsResult2 = paramsResult2Datas(meetCount);
          const paramsResult3 = paramsResult3Datas(meetCount,remediateCount);
          Response.push(paramsResult1, paramsResult2, paramsResult3);
          let grade1Total = 0;
          let grade2Total = 0;
          let grade3Total = 0;
          let finalgradedata=perfinalGrade[0];
          if(finalgradedata && finalgradedata.length > 0){
            grade1Total += Number(finalgradedata[0]);
            grade2Total += Number(finalgradedata[1]);
            grade3Total += Number(finalgradedata[2]);
          }
          exccedCount= perfinalGrade[1];
          meetCount = perfinalGrade[2];
          remediateCount = perfinalGrade[3];
          let _results = [];
          _results=gradeResultData(grade,remediateCount,grade1Total,grade2Total,grade3Total,exccedCount,results,_results,meetCount);

          res.ok(_results,messages.GET_RECORD,RESPONSE_STATUS.success);
        }
        else{
          res.ok(undefined,messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
        }
      }
      else{
        res.ok(isValidate.error,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
      }
    }
    catch(error){
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  }
};
