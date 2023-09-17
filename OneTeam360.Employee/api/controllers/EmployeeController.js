/***************************************************************************

  Controller     : Tenant Employee Profile

***************************************************************************/

let XLSX = require('xlsx');
let xls_utils = XLSX.utils;
const { generateToken } = require('../services/jwt');
const { hashPassword } = require('../services/bcrypt');
const { uploadDocument } = require('../services/uploadDocument');
const { CHECKIN_STATUS, PERMISSIONS, ACCOUNT_STATUS, RESPONSE_STATUS, NOTIFICATION_ENTITIES, PORTAL_ACCESS_STATUS, ANSWER_FORMAT, UPLOAD_REQ_FOR } = require('../utils/constants/enums');
const { commonListing, escapeSearch, escapeSqlSearch } = require('../services/utils');
const EmployeeValidations = require('../validations/EmployeeValidations');
const messages = sails.config.globals.messages;
const fs = require('fs');
const env = sails.config.custom;
const { getDateUTC, formatDate, getDateUTCFormat, getDateTimeSpecificTimeZone } = require('../utils/common/getDateTime');
const {sendNotification} = require('../services/sendNotification');
const { assignAutoCertificate } = require('../utils/common/apiCall');
const validations = require('../utils/constants/validations');
const { uploadFile } = require('../services/uploadFile');

const getJobTypeDetails = async function(req, job_type_ids){
  let results = '';
  let sql = `SELECT job_type_id, name, color FROM job_type WHERE job_type_id IN (${job_type_ids})`;
  const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
  results = rawResult.rows;

  const responseData=[];
  for(let i of results){
    responseData.push({
      job_type_id : i.job_type_id,
      name        : i.name,
      color       : i.color
    });
  }
  return responseData;
};
sails.log(getJobTypeDetails);
const getImgUrl = function (profilePicName, isThumb = false) {
  let profile_pic_name = profilePicName;
  if (isThumb) {
    let arr = profilePicName.split('.');
    profile_pic_name = `${arr[0]}_thumbnail.${arr[1]}`;
  }
  return `${process.env.PROFILE_PIC_CDN_URL}/${process.env.CONTAINER_NAME}/${process.env.PROFILE_IMAGE_DIR_INSIDE_MASTER_CONTAINER}/${profile_pic_name}`;
};

const licenseCount = async function(req, account_id){
  let sql = `SELECT MAX(asp.seats) AS seats FROM account_subscription AS au
             LEFT JOIN account_subscription_product AS asp ON asp.account_subscription_id = au.account_subscription_id
             WHERE account_id = '${account_id}'`;
  const rawResult = await sails.sendNativeQuery(sql);
  let result = rawResult.rows[0] || null;
  let seat = result.seats;

  let userSql = `SELECT COUNT(au.account_user_id) AS cnt 
                 FROM ${process.env.DB_NAME}.account_user AS au
                 LEFT JOIN employee_profile AS ep ON ep.user_id = au.user_id
                 WHERE au.account_id = '${account_id}' AND ep.status='${ACCOUNT_STATUS.active}'`;
  const rawUserResult = await sails.sendNativeQuery(escapeSqlSearch(userSql)).usingConnection(req.dynamic_connection);
  let userResult = rawUserResult.rows[0] || null;
  let totalUserCount = userResult.cnt;

  let countExceed = 'no';
  if(totalUserCount >= seat) {
    countExceed = 'yes';
  }

  return countExceed;
};

const checkSheetUndefined=async(sheet,cell_ref,test)=>{
  if (typeof (sheet[cell_ref]) !== 'undefined') {
    test.push(sheet[cell_ref].w);
  }
  return test;
};

const checkUserCondition=async(user,flag,res,isValidate)=>{
  if (user) {
    flag = false;
    sails.log(flag);
    return res.notFound(undefined, messages.USER_ALREADY_EXISTS);
  }
  else if (isValidate.error) {
    flag = false;
    sails.log(flag);
    return res.badRequest(isValidate.error, messages.UPDATE_FAILURE);
  }
};

const checkDepartmentLocationSkill=async(departments,locations,skills,req,finalres)=>{
  for (let item in departments) {
    return UserDepartments.create({ user_id: finalres.id, department_id: departments[item] }).usingConnection(req.dynamic_connection);
  }
  for (let locData in locations) {
    return UserLocations.create({ user_id: finalres.id, location_id: locations[locData] }).usingConnection(req.dynamic_connection);
  }
  for (let key in skills) {
    return UserSkills.create({ user_id: finalres.id, skill_id: skills[key] }).usingConnection(req.dynamic_connection);
  }
};

const dynamicQuestionDatas=async(item)=>{
  return item.dynamic_question_id !== '' ? item.dynamic_question_id : '';
};

const questionDatas=async(item)=>{
  return item.question !== '' ? item.question : '';
};

const statusDatas=async(item)=>{
  return (item.status !== '') ? item.status : '';
};

const sequenceDatas=async(item)=>{
  return item.sequence !== '' ? item.sequence : '';
};

const otherDynamicFieldDatas=async(otherDynamicFields,results,dynamicFieldList)=>{
  let selected = '';
  for (let x in results) {
    let item = results[x];
    if(otherDynamicFields.includes(item.dynamic_question_id.toString())){
      selected = true;
    }else{
      selected = false;
    }
    dynamicFieldList.push({
      'dynamic_question_id' : await dynamicQuestionDatas(item),
      'question'            : await questionDatas(item),
      'status'              : await statusDatas(item),
      'sequence'            : await sequenceDatas(item),
      'selected'            : selected,
    });
  }
  return dynamicFieldList;
};

const locationDetailsData=(result)=>{
  return  result.location_id ?  result.location_id.sort((a, b) => a.name.normalize().localeCompare(b.name.normalize())): [];
};

const percentageConditionData=(percentage)=>{
  if(percentage < 0){
    percentage = 0;
  }else if(percentage > 100) {
    percentage = 100;
  }
  return percentage;
};

const countryCondition=(result)=>{
  let countryData={};
  if ((result.user_id.emergency_contact_country_id !== null) && (result.user_id.emergency_contact_country_id !== '')) {
    countryData = {
      country_id   : result.user_id.emergency_contact_country_id.country_id,
      name         : result.user_id.emergency_contact_country_id.name,
      country_code : result.user_id.emergency_contact_country_id.country_code
    };
  }
  return countryData;
};

const answerOptionData=(answer_options)=>{
  return answer_options.length > 0 ? answer_options : [];
};

const answerQuestionOptionIdData=(item)=>{
  return (item.dynamic_question_option_id !== null) ? item.dynamic_question_option_id.toString() : item.dynamic_question_option_id;
};

const dynamicQuestionListData=(dynamicQuestionList)=>{
  let dynamicQuestionAnswerData=[];
  if (dynamicQuestionList.length > 0) {
    for (let item of dynamicQuestionList) {
      let answer_options = [];
      if(item.answer_options !== null){
        let  answeroptions = item.answer_options.split('##@##');
        for(let j of answeroptions)
        {
          let obj = {};
          const ansoption = j.split('#$#');
          obj['dynamic_question_option_id'] = ansoption[0];
          obj['dynamic_question_option_value'] = ansoption[1];
          answer_options.push(obj);
        }
      }
      dynamicQuestionAnswerData.push({
        question_id                  : item.question_id,
        question                     : item.question,
        sequence                     : item.sequence,
        required                     : item.required,
        answer_format                : item.answer_format,
        answer                       : item.answer,
        answer_options               : answerOptionData(answer_options),
        answer_question_option_id    : answerQuestionOptionIdData(item),
        answer_question_option_value : item.option_value,
      });
    }
    return dynamicQuestionAnswerData;
  }
};

module.exports = {
  add: async (req, res) => {
    let request = req.allParams();
    const isValidate = await EmployeeValidations.Add.validate(request);
    if (isValidate.error) {
      res.ok(isValidate.error, messages.REGISTER_FAILURE, RESPONSE_STATUS.error);
    }
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      date_of_joining,
      location_id,
      job_type_id,
      profile_picture_url,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_number,
      role_id,
      team_member_id,
    } = req.allParams();

    const account_id       = req.token.tenantId;
    const accountUserCount = await licenseCount(req, account_id);
    sails.log('employee creation');

    if(accountUserCount === 'no') {
      //CHECK IF TEAM MEMBER ID ALREADY EXISTS
      if(team_member_id !== '' && team_member_id !== undefined && team_member_id !== null) {
        const teamMemberIdExists = await EmployeeProfile.findOne({ team_member_id: team_member_id }).usingConnection(req.dynamic_connection);
        if(teamMemberIdExists){
          return res.ok(undefined, messages.TEAM_MEMBER_ID_EXISTS, RESPONSE_STATUS.error);
        }
      }
      let empProfileResult;
      const user = await Users.findOne({ email });
      if (user) {
        sails.log('employee creation user exists');

        const accountUser = await sails.sendNativeQuery(`SELECT account_id FROM ${process.env.DB_NAME}.account_user WHERE user_id = ${user.user_id} `).usingConnection(req.dynamic_connection);
        const accountUserDetails = accountUser.rows;
        const admin_account_id = parseInt(process.env.ADMIN_ACCOUNT_ID);
        const existingUserId = user.user_id;
        // check if configure account id is match with loggedin user then allow user to login in customer portal still they have access of admin portal
        if(account_id === admin_account_id && user.portal_access === PORTAL_ACCESS_STATUS.admin && !Object.keys(accountUserDetails).length > 0) {
          await AccountUserMapping.create({
            account_id      : account_id,
            user_id         : existingUserId,
            created_by      : req.user.user_id,
            last_updated_by : req.user.user_id,
            created_date    : getDateUTC()
          });

          let image_data = '';
          let image_data_thumb = '';
          if (profile_picture_url) {
            image_data = getImgUrl(profile_picture_url, false);
            image_data_thumb = getImgUrl(profile_picture_url, true);
          }

          let updateData = {
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            profile_picture_url           : image_data,
            profile_picture_thumbnail_url : image_data_thumb,
            emergency_contact_name,
            emergency_contact_relation,
            emergency_contact_number,
            last_updated_by               : req.user.user_id,
            last_updated_date             : getDateUTC()
          };
          await Users.update({ user_id: existingUserId },updateData).fetch();

          let level = await Level.find({ status: ACCOUNT_STATUS.active }).sort(`level ASC`).limit(1).usingConnection(req.dynamic_connection);

          empProfileResult = await EmployeeProfile.create({
            user_id         : existingUserId,
            created_by      : req.user.user_id,
            date_of_joining,
            role_id,
            level_id        : level[0].level_id,
            points          : 0,
            status          : ACCOUNT_STATUS.active,
            last_updated_by : req.user.user_id,
            created_date    : getDateUTC(),
            team_member_id
          }).fetch().usingConnection(req.dynamic_connection);

          const locArr = location_id.map((location) => { return { employee_profile_id: empProfileResult.employee_profile_id, location_id: location, created_by: req.user.user_id, created_date: getDateUTC() }; });
          const jobArr = job_type_id.map((job) => { return { employee_profile_id: empProfileResult.employee_profile_id, job_type_id: job, created_by: req.user.user_id, created_date: getDateUTC() }; });

          if (locArr.length > 0) { await EmpLocation.createEach(locArr).usingConnection(req.dynamic_connection); }
          if (jobArr.length > 0) { await EmpJobType.createEach(jobArr).usingConnection(req.dynamic_connection); }

          return res.ok(undefined, messages.REGISTER_SUCCESS, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.USER_ALREADY_EXISTS);
        }
      }
      else {
        let image_data = '';
        let image_data_thumb = '';
        if (profile_picture_url) {
          image_data = getImgUrl(profile_picture_url, false);
          image_data_thumb = getImgUrl(profile_picture_url, true);
        }

        let addData = {
          first_name,
          last_name,
          email,
          phone,
          portal_access                 : PORTAL_ACCESS_STATUS.customer,
          date_of_birth,
          profile_picture_url           : image_data,
          profile_picture_thumbnail_url : image_data_thumb,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          created_by                    : req.user.user_id,
          status                        : ACCOUNT_STATUS.invited,
          created_date                  : getDateUTC()
        };
        const newUser = await Users.create(addData).fetch();

        const userId = newUser.user_id;
        await AccountUserMapping.create({
          account_id      : req.token.tenantId,
          user_id         : userId,
          created_by      : req.user.user_id,
          last_updated_by : req.user.user_id,
          created_date    : getDateUTC()
        });

        const account = req.account;

        let level = await Level.find({ status: ACCOUNT_STATUS.active }).sort(`level ASC`).limit(1).usingConnection(req.dynamic_connection);


        empProfileResult = await EmployeeProfile.create({
          user_id         : userId,
          created_by      : req.user.user_id,
          date_of_joining,
          role_id,
          level_id        : level[0].level_id,
          points          : 0,
          status          : ACCOUNT_STATUS.active,
          last_updated_by : req.user.user_id,
          created_date    : getDateUTC(),
          team_member_id
        }).fetch().usingConnection(req.dynamic_connection);
        const locationSql = `select location_id,name from location where location_id IN (${location_id.join(',')})`;
        const jobTypeListSql = `select job_type_id,name from job_type where job_type_id IN (${job_type_id.join(',')})`;
        const roleSql = `select role_id,name from role where role_id = ${role_id}`;
        let roleDetails = await sails.sendNativeQuery(escapeSqlSearch(roleSql)).usingConnection(req.dynamic_connection);
        const findCreatedUser =   `select concat(first_name,' ',last_name) as created_by from ${process.env.DB_NAME}.user where user_id = ${req.user.user_id}`;
        let locationList = await sails.sendNativeQuery(escapeSqlSearch(locationSql)).usingConnection(req.dynamic_connection);
        let jobTypeList = await sails.sendNativeQuery(escapeSqlSearch(jobTypeListSql)).usingConnection(req.dynamic_connection);
        let createdUser = await sails.sendNativeQuery(escapeSqlSearch(findCreatedUser)).usingConnection(req.dynamic_connection);
        const loc_arr = location_id.map((location) => { return { employee_profile_id: empProfileResult.employee_profile_id, location_id: location, created_by: req.user.user_id, created_date: getDateUTC() }; });
        const job_arr = job_type_id.map((job) => { return { employee_profile_id: empProfileResult.employee_profile_id, job_type_id: job, created_by: req.user.user_id, created_date: getDateUTC() }; });

        if (loc_arr.length > 0) { await EmpLocation.createEach(loc_arr).usingConnection(req.dynamic_connection); }
        if (job_arr.length > 0) { await EmpJobType.createEach(job_arr).usingConnection(req.dynamic_connection); }

        const token = await generateToken({ id: userId, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, env.JWT_CREATE_PASS_EXPIRY);
        const createUrl = `${process.env.FRONTEND_BASEURL}/create-password?token=${token}`;
        await Users.update({ user_id: userId }, {
          reset_password_token: token,
        });
        if(!req.isExposedApi){
          await sendNotification(req, {
            notification_entity            : NOTIFICATION_ENTITIES.CREATE_PASSWORD,
            recipient_email                : email,
            recipient_first_name           : first_name,
            recipient_last_name            : last_name,
            recipient_phone                : phone,
            receipient_user_id             : userId,
            url                            : createUrl,
            receipient_employee_profile_id : empProfileResult.employee_profile_id,
            account_id                     : account.account_id,
          });
        }
        let resData = {
          first_name,
          last_name,
          email,
          phone,
          portal_access                 : PORTAL_ACCESS_STATUS.customer,
          date_of_birth,
          date_of_joining,
          profile_picture_url           : image_data,
          profile_picture_thumbnail_url : image_data_thumb,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          created_by                    : createdUser.rows[0].created_by,
          status                        : ACCOUNT_STATUS.invited,
          role                          : roleDetails.rows[0],
          locations                     : locationList.rows,
          job_types                     : jobTypeList.rows,
          created_date                  : getDateTimeSpecificTimeZone(getDateUTC(),req.timezone,
            req.dateTimeFormat)
        };
        return res.ok(resData, messages.REGISTER_SUCCESS, RESPONSE_STATUS.success);
      }
    } else {
      return res.ok(undefined, messages.EXCEED_EMPLOYEE, RESPONSE_STATUS.error);
    }

  },

  edit: async (req, res) => {
    try {
      let request = req.allParams();
      const isValidate = await EmployeeValidations.Edit.validate(request);
      let permissions = req.permissions.map(perm => perm.code);
      let canEditDOH = permissions.includes(PERMISSIONS.EDIT_DATE_OF_HIRE);
      let canEditEmail = permissions.includes(PERMISSIONS.EDIT_EMAIL_ID);
      let canEditMemberId = permissions.includes(PERMISSIONS.EDIT_TEAM_MEMBER_ID);
      if (!isValidate.error) {

        const {
          first_name,
          last_name,
          phone,
          date_of_birth,
          date_of_joining,
          location_id,
          job_type_id,
          email,
          profile_picture_url,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          role_id,
          team_member_id,
          questionAnswers
        } = req.allParams();

        const user = await Users.findOne({ user_id: req.params.id });
        const empProfile = await EmployeeProfile.findOne({ user_id: req.params.id }).usingConnection(req.dynamic_connection);

        if (!user || !empProfile) {
          return res.ok(undefined, messages.USER_NOT_FOUND, RESPONSE_STATUS.error);
        }

        //CHECK IF TEAM MEMBER ID ALREADY EXISTS
        if(team_member_id !== '' && team_member_id !== undefined && team_member_id !== null) {
          const teamMemberIdExists = await EmployeeProfile.findOne({ team_member_id: team_member_id }).usingConnection(req.dynamic_connection);
          if(teamMemberIdExists && empProfile.employee_profile_id !== teamMemberIdExists.employee_profile_id){
            return res.ok(undefined, messages.TEAM_MEMBER_ID_EXISTS, RESPONSE_STATUS.error);
          }
          // Check Permission to Update team member id
          if(empProfile.team_member_id !== team_member_id && !canEditMemberId){
            return res.ok(undefined, messages.PERMISSION_DENIED_TEAM_MEMBER_ID, RESPONSE_STATUS.error);
          }
        }
        // Check Permission to Update Email or date of Hire
        let dob= `${date_of_joining}T00:00:00.000Z`;
        if(empProfile.date_of_joining === dob && !canEditDOH){
          return res.ok(undefined, messages.PERMISSION_DENIED_DOH, RESPONSE_STATUS.error);
        }

        // Check Permission to Update Email or date of Hire
        if(user.email !== email && !canEditEmail){
          return res.ok(undefined, messages.PERMISSION_DENIED_EMAIL, RESPONSE_STATUS.error);
        }

        // Check is user with this new edited email id exist or not
        if(user.email !== email){
          const _user = await Users.findOne({ email: email });
          if(_user){
            return res.ok(undefined, messages.USER_ALREADY_EXISTS, RESPONSE_STATUS.error);
          }
        }

        let image_data = '';
        let image_data_thumb = '';
        if (profile_picture_url) {
          image_data = getImgUrl(profile_picture_url, false);
          image_data_thumb = getImgUrl(profile_picture_url, true);
        }

        let updateData = {
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          profile_picture_url           : image_data,
          profile_picture_thumbnail_url : image_data_thumb,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          last_updated_by               : req.user.user_id,
          last_updated_date             : getDateUTC()
        };
        await Users.update({ user_id: req.params.id },updateData).fetch();

        await AccountUserMapping.update({ user_id: req.params.id }, {
          account_id        : req.token.tenantId,
          user_id           : req.params.id,
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        });

        await EmployeeProfile.update({ user_id: req.params.id }, {
          date_of_joining,
          role_id,
          last_updated_by  : req.user.user_id,
          lastUpdated_date : getDateUTC(),
          team_member_id
        }).usingConnection(req.dynamic_connection);

        let job_type_ids = await EmpJobType.find({ employee_profile_id: empProfile.employee_profile_id }).usingConnection(req.dynamic_connection);
        let jobs = job_type_ids.map(job => job.job_type_id);
        let new_job_types = job_type_id.filter(id => !jobs.includes(id) );

        // Remove older mapping of locations and job types.
        await EmpLocation.destroy({ employee_profile_id: empProfile.employee_profile_id }).usingConnection(req.dynamic_connection);
        await EmpJobType.destroy({ employee_profile_id: empProfile.employee_profile_id }).usingConnection(req.dynamic_connection);

        // Create new mapping of locations and job types.
        const loc_arr = location_id.map((location) => { return { employee_profile_id: empProfile.employee_profile_id, location_id: location, created_by: req.user.user_id, created_date: getDateUTC() }; });
        const job_arr = job_type_id.map((job) => { return { employee_profile_id: empProfile.employee_profile_id, job_type_id: job, created_by: req.user.user_id, created_date: getDateUTC() }; });

        if (loc_arr.length > 0) { await EmpLocation.createEach(loc_arr).usingConnection(req.dynamic_connection); }
        if (job_arr.length > 0) { await EmpJobType.createEach(job_arr).usingConnection(req.dynamic_connection); }

        if(new_job_types && new_job_types.length > 0){
          // Get All Auto Certificates Linked with new_job_types and Assign Certificates to this employees.
          await assignAutoCertificate(req, {
            employee_profile_id : empProfile.employee_profile_id,
            job_type_ids        : new_job_types,
            from_empProfile     : true
          });
        }
        const locationSql = `select location_id,name from location where location_id IN (${location_id.join(',')})`;
        const jobTypeListSql = `select job_type_id,name from job_type where job_type_id IN (${job_type_id.join(',')})`;
        const findCreatedUser =   `select concat(first_name,' ',last_name) as created_by,created_date from ${process.env.DB_NAME}.user where user_id = ${user.created_by}`;
        const findUpdatedUser =   `select concat(first_name,' ',last_name) as created_by from ${process.env.DB_NAME}.user where user_id = ${req.user.user_id}`;
        let locationList = await sails.sendNativeQuery(escapeSqlSearch(locationSql)).usingConnection(req.dynamic_connection);
        let jobTypeList = await sails.sendNativeQuery(escapeSqlSearch(jobTypeListSql)).usingConnection(req.dynamic_connection);
        let createdUser = await sails.sendNativeQuery(escapeSqlSearch(findCreatedUser)).usingConnection(req.dynamic_connection);
        let updatedUser = await sails.sendNativeQuery(escapeSqlSearch(findUpdatedUser)).usingConnection(req.dynamic_connection);
        const roleSql = `select role_id,name from role where role_id = ${role_id}`;
        let roleDetails = await sails.sendNativeQuery(escapeSqlSearch(roleSql)).usingConnection(req.dynamic_connection);
        if(questionAnswers && questionAnswers.length > 0) {
          for(const questionAnswer of questionAnswers) {
            let updateAnswer = {
              dynamic_question_id : questionAnswer.question_id,
              employee_profile_id : empProfile.employee_profile_id,
              answer              : questionAnswer.answer,
              updated_by          : req.user.user_id,
              updated_date        : getDateUTC()
            };

            if (questionAnswer.type === ANSWER_FORMAT.text) {
              updateAnswer.answer = questionAnswer.answer;
            } else {
              if (questionAnswer.question_option_id !== undefined && questionAnswer.question_option_id !== '') {
                updateAnswer.dynamic_question_option_id = questionAnswer.question_option_id;
              }
            }

            const empDynamicQuestionAnswer = await EmpDynamicQuestionAnswer.findOne({ dynamic_question_id: questionAnswer.question_id, employee_profile_id: empProfile.employee_profile_id }).usingConnection(req.dynamic_connection);

            if(empDynamicQuestionAnswer){
              await EmpDynamicQuestionAnswer.update(
                                                    { employee_profile_id: empProfile.employee_profile_id, dynamic_question_id: questionAnswer.question_id},
                                                    updateAnswer)
                                            .usingConnection(req.dynamic_connection);
            } else {
              await EmpDynamicQuestionAnswer.create(updateAnswer).usingConnection(req.dynamic_connection);
            }
          }
        }
        let resData = {
          first_name,
          last_name,
          email,
          phone,
          team_member_id,
          portal_access                 : PORTAL_ACCESS_STATUS.customer,
          date_of_birth,
          date_of_joining,
          profile_picture_url           : image_data,
          profile_picture_thumbnail_url : image_data_thumb,
          emergency_contact_name,
          emergency_contact_relation,
          emergency_contact_number,
          status                        : user.status,
          role                          : roleDetails.rows[0],
          locations                     : locationList.rows,
          job_types                     : jobTypeList.rows,
          created_by                    : createdUser.rows[0].created_by,
          created_date                  : getDateTimeSpecificTimeZone( createdUser.rows[0].created_date,req.timezone,req.dateTimeFormat),
          last_modified_by              : updatedUser.rows[0].created_by,
          last_modified_date            : getDateTimeSpecificTimeZone( getDateUTC(),req.timezone,req.dateTimeFormat)
        };
        return res.ok(resData, messages.UPDATE_SUCCESS, RESPONSE_STATUS.success);

      } else {
        res.ok(isValidate.error, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log('Error',err);
      res.ok(err.error, err.message, RESPONSE_STATUS.error);
    }
  },

  delete: async function (req, res) {
    await EmployeeProfile.destroy({ employee_profile_id: req.params.id }).usingConnection(req.dynamic_connection);
    return res.ok(undefined, messages.DELETE_RECORD);
  },

  find: async function (req, res) {
    try {
      let request = req.allParams();
      const isValidate = await EmployeeValidations.Find.validate(request);
      if (!isValidate.error) {
        let results;
        let nativePayload = [] || any;
        let permissions = req.permissions.map(perm => perm.code);
        const { employee_profile_id } = req.allParams();
        let employee_id = employee_profile_id ? employee_profile_id : req.empProfile.employee_profile_id;
        const findQuery = await commonListing(req.allParams());
        let empLocations = await EmpLocation.find({ employee_profile_id: employee_id }).usingConnection(req.dynamic_connection);
        let locationFilter = true;
        let phoneFilter = true;
        let jobTypeFilter = true;
        let totalPointsFilter = true;
        let levelFilter = true;
        let contactNameFilter = false;
        let relationFilter = false;
        let emergency_phoneFilter = false;
        let otherDetailsFilter = '';
        let otherFilterFields = '';
        let empFilter = await EmpFilter.findOne({employee_profile_id: employee_id}).usingConnection(req.dynamic_connection);

        if(empFilter !== undefined && empFilter !== null && empFilter !== '') {
          let  otherDynamicFields = empFilter.other_details;
          let dynamicFieldList = [];
          if(otherDynamicFields !== '' && otherDynamicFields !== null) {
            otherDynamicFields = otherDynamicFields.split(',');
            let results1 = await DynamicQuestion.find().usingConnection(req.dynamic_connection);
            if(results1 !== undefined && results1 !== '' && results1 !== null) {
              let selected = '';
              for (let x in results1) {
                let item = results1[x];
                if(otherDynamicFields.includes(item.dynamic_question_id.toString())){
                  selected = true;
                }else{
                  selected = false;
                }
                dynamicFieldList.push({
                  'dynamic_question_id' : (item.dynamic_question_id !== '') ? item.dynamic_question_id : '',
                  'question'            : (item.question !== '') ? item.question : '',
                  'status'              : (item.status !== '') ? item.status : '',
                  'sequence'            : (item.sequence !== '') ? item.sequence : '',
                  'selected'            : selected,
                });
              }
            }
          }
          empFilter.dynamicFields = dynamicFieldList;
        }else{
          empFilter ={
            'location'        : true,
            'phone'           : true,
            'job_type'        : true,
            'total_points'    : true,
            'level'           : true,
            'id'              : false,
            'contact_name'    : false,
            'relation'        : false,
            'emergency_phone' : false,
            'other_details'   : '',
            'dynamicFields'   : [],
          };
        }
        locationFilter = empFilter.location;
        phoneFilter = empFilter.phone;
        jobTypeFilter = empFilter.job_type;
        totalPointsFilter = empFilter.total_points;
        levelFilter = empFilter.level;
        contactNameFilter = empFilter.contact_name;
        relationFilter = empFilter.relation;
        emergency_phoneFilter = empFilter.emergency_phone;
        otherDetailsFilter = empFilter.other_details;
        if(otherDetailsFilter !== '' && otherDetailsFilter !== null) {
          otherDetailsFilter = otherDetailsFilter.split(',');
          for(const dyfield of otherDetailsFilter) {
            otherFilterFields = otherFilterFields + `MAX(CASE WHEN ea.dynamic_question_id = '${dyfield}' THEN IF(ea.answer="",o.option_value,ea.answer) END) q${dyfield},`;
          }
        }
        const getUtcDate = getDateUTCFormat('YYYY-MM-DD');
        let isLocationFilterApplied = false;
        let sql = `SELECT distinct user.user_id, user.email, user.date_of_birth ,user.first_name, user.last_name, 
        user.profile_picture_url, user.profile_picture_thumbnail_url, user.status AS user_status, user.password as password`;
        if (contactNameFilter === true) {
          sql = sql + `,user.emergency_contact_name `;
        }
        if (relationFilter === true) {
          sql = sql + `,user.emergency_contact_relation `;
        }
        if (emergency_phoneFilter === true) {
          sql = sql + `,user.emergency_contact_number `;
        }
        if (phoneFilter === true) {
          sql = sql + `,user.phone `;
        }

        if(levelFilter === true) {
          sql = sql + `,level.level_id, level.name as level_name, level.status, level.level `;
        }

        if(locationFilter === true) {
          sql = sql + `,(select  GROUP_CONCAT(location.name SEPARATOR "," ) 
          FROM employee_location as el JOIN employee_profile as ep ON el.employee_profile_id = ep.employee_profile_id
          INNER JOIN location  ON el.location_id = location.location_id WHERE ep.employee_profile_id =employee_profile.employee_profile_id
          ) as locations `;
        }
        if(jobTypeFilter === true) {
          sql = sql + `,(SELECT GROUP_CONCAT(CONCAT (job_type.job_type_id, "||" , job_type.color, "||" , job_type.name)  SEPARATOR "," ) 
          FROM employee_job_type as el JOIN employee_profile as ep ON el.employee_profile_id = ep.employee_profile_id
          INNER JOIN job_type  ON el.job_type_id = job_type.job_type_id WHERE ep.employee_profile_id =employee_profile.employee_profile_id order by job_type.name ASC
          ) as job_types `;
        }
        sql = sql + `,(Select GROUP_CONCAT(certificate_name  SEPARATOR ",") from 
          (
            SELECT MAX(expiry_date) as max_expiry_date, certificate_status, certificate_type.certificate_type_id,certificate_type.name as certificate_name
              FROM employee_certificate 
                INNER JOIN certificate_type ON certificate_type.certificate_type_id = employee_certificate.certificate_type_id
              where employee_certificate.status = 'Active'
                AND employee_certificate.employee_profile_id = employee_profile.employee_profile_id
                AND employee_certificate.certificate_status = 'Active'
                AND employee_certificate.expiry_date IS NOT NULL 
              GROUP BY employee_certificate.certificate_type_id
          ) ec 
          where 
          DATEDIFF(max_expiry_date,CURDATE()) <= 30 
          AND 
          DATEDIFF(max_expiry_date,CURDATE()) >= 0) as certificates,
          IF(COUNT(ech.employee_checkin_id) = 0, 'no', 'yes') AS employee_checkedin `;
        if(totalPointsFilter === true) {
          sql = sql + `,employee_profile.points `;
        }

        sql = sql + `,employee_profile.status as employee_status, employee_profile.date_of_joining, employee_profile.employee_profile_id, ${otherFilterFields} employee_profile.team_member_id `;
        let joinCondition = ` FROM employee_profile `;

        let countSql = `SELECT count(distinct employee_profile.employee_profile_id) AS cnt`;
        if(otherDetailsFilter !== '' && otherDetailsFilter !== undefined && otherDetailsFilter !== null) {
          joinCondition = joinCondition + `LEFT JOIN employee_dynamic_question_answer ea ON employee_profile.employee_profile_id=ea.employee_profile_id
          LEFT JOIN dynamic_question q ON ea.dynamic_question_id=q.dynamic_question_id
          LEFT JOIN dynamic_question_option o ON ea.dynamic_question_option_id=o.dynamic_question_option_id `;
        }

        let checkinLocation = '';
        if ((findQuery.andCondition).length > 0) {
          const andPayload1 = findQuery.andCondition;
          for (const data1 of andPayload1) {
            Object.keys(data1).forEach((prop) => {
              if ((prop === 'location') && (data1[prop]).length > 0) {
                let locationPayload = data1[prop];
                const locationName = locationPayload.map(c => `'${c}'`).join(', ');
                const locationData = '(' + locationName + ')';
                checkinLocation = ` AND ech.location_id IN ${locationData}`;
              }
            });
          }
        }

        joinCondition = joinCondition + `LEFT JOIN employee_checkin ech ON ech.employee_profile_id = employee_profile.employee_profile_id 
        AND ech.request_status = '${CHECKIN_STATUS.APPROVED}' AND DATE(ech.checkin_datetime) = '${getUtcDate}' ${checkinLocation}`;
        if(jobTypeFilter === true) {
          joinCondition = joinCondition + `INNER JOIN employee_job_type ON employee_profile.employee_profile_id = employee_job_type.employee_profile_id `;
        }
        if(locationFilter === true) {
          joinCondition = joinCondition + `INNER JOIN  employee_location ON employee_profile.employee_profile_id = employee_location.employee_profile_id `;
        }

        if(levelFilter === true) {
          joinCondition = joinCondition + `INNER JOIN level ON employee_profile.level_id = level.level_id `;
        }

        joinCondition = joinCondition + `INNER JOIN ${process.env.DB_NAME}.user ON user.user_id = employee_profile.user_id`;

        let havingCondition = '';
        let sortByCheckin = '';
        if ((findQuery.andCondition).length > 0) {
          joinCondition = joinCondition + ` WHERE 1=1`;
          const andPayload = findQuery.andCondition;
          for (const data2 of andPayload) {
            Object.keys(data2).forEach((prop) => {
              if ((prop === 'location') && (data2[prop]).length > 0 && locationFilter === true) {
                if(permissions.includes(PERMISSIONS.VIEW_ALL_EMPLOYEES)){
                  let locationPayload = data2[prop];
                  const locationName = locationPayload.map(c => `'${c}'`).join(', ');
                  const locationData = '(' + locationName + ')';
                  joinCondition = joinCondition + ` AND employee_location.location_id IN ${locationData}`;
                  nativePayload.push(data2[prop]);
                  isLocationFilterApplied = true;
                }else if(permissions.includes(PERMISSIONS.VIEW_EMPLOYEES)){
                  let locationPayload = data2[prop];
                  let empLocationsIds = empLocations ? empLocations.map(item => item.location_id) : [];
                  const locationName = locationPayload.filter(c => {
                    return empLocationsIds.includes(c);
                  }).map(c => `'${c}'`).join(', ');
                  if(locationName && locationName.trim !== ''){
                    const locationData = '(' + locationName + ')';
                    joinCondition = joinCondition + ` AND employee_location.location_id IN ${locationData}`;
                    nativePayload.push(data2[prop]);
                    isLocationFilterApplied = true;
                  }
                }
              }
              if ((prop === 'job_type') && (data2[prop]).length > 0 && jobTypeFilter === true) {
                let locationPayload = data2[prop];
                const locationName = locationPayload.map(c => `'${c}'`).join(', ');
                const locationData = '(' + locationName + ')';
                joinCondition = joinCondition + ` AND employee_job_type.job_type_id IN ${locationData}`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'level') && (data2[prop]).length > 0 && levelFilter === true) {
                let locationPayload = data2[prop];
                const locationName = locationPayload.map(c => `'${c}'`).join(', ');
                const locationData = '(' + locationName + ')';
                joinCondition = joinCondition + ` AND level.level_id IN ${locationData}`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'points') && (data2[prop] !== '') && totalPointsFilter === true) {
                joinCondition = joinCondition + ` AND employee_profile.${prop} LIKE '%${escapeSearch(data2[prop])}%'`;
                nativePayload.push(escapeSearch(data2[prop]));
              }
              if ((prop === 'team_member_id') && (data2[prop] !== '')) {
                joinCondition = joinCondition + ` AND employee_profile.${prop} LIKE '%${escapeSearch(data2[prop])}%'`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'phone') && (data2[prop] !== '') && phoneFilter === true) {
                joinCondition = joinCondition + ` AND user.${prop} LIKE '%${data2[prop]}%'`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'employee_profile.status') && (data2[prop] !== '')) {
                joinCondition = joinCondition + ` AND employee_profile.status = '${data2[prop]}'`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'user.status') && (data2[prop] !== '')) {
                joinCondition = joinCondition + ` AND user.status = '${data2[prop]}'`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'emergency_contact_name') && (data2[prop] !== '')) {
                joinCondition = joinCondition + ` AND user.emergency_contact_name LIKE '%${data2[prop]}%'`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'emergency_contact_relation') && (data2[prop] !== '')) {
                joinCondition = joinCondition + ` AND user.emergency_contact_relation LIKE '%${data2[prop]}%'`;
                nativePayload.push(data2[prop]);
              }
              if ((prop === 'emergency_contact_number') && (data2[prop] !== '')) {
                joinCondition = joinCondition + ` AND user.emergency_contact_number LIKE '%${data2[prop]}%'`;
                nativePayload.push(data2[prop]);
              }
              if (prop === 'dynamic') {
                const dq =  data2[prop];
                const propertyNames = Object.keys(dq);
                if(propertyNames.length !== 0) {
                  havingCondition = ' HAVING ';
                  const propertyValues = Object.values(dq);
                  if(propertyNames.length > 1) {
                    let q = 0;
                    let andcondition = ``;
                    for (let qId of propertyNames) {
                      havingCondition = havingCondition + `COUNT(CASE WHEN ea.dynamic_question_id = '${qId}' AND IF(ea.answer = "", o.option_value, ea.answer) LIKE "%${propertyValues[q]}%" THEN 1 END) > 0`;
                      q++;
                      andcondition = (propertyNames.length !== q) ? ` AND ` : ``;
                      havingCondition = havingCondition + andcondition;
                    }
                  } else {
                    havingCondition = havingCondition + `COUNT(CASE WHEN ea.dynamic_question_id = '${propertyNames[0]}' AND IF(ea.answer = "", o.option_value, ea.answer) LIKE "%${propertyValues[0]}%" THEN 1 END) > 0`;
                  }
                  nativePayload.push(data2[prop]);
                }
              }
              if ((prop === 'employee_checkedin') && (data2[prop] !== '') && data2[prop] === true) {
                joinCondition = joinCondition + ` AND ech.request_status = '${CHECKIN_STATUS.APPROVED}' AND DATE(ech.checkin_datetime) = '${getUtcDate}'`;
                sortByCheckin = `ech.checkin_datetime DESC, user.last_name ASC, `;
                nativePayload.push(data2[prop]);
              }
            });
          }
        }

        if ((findQuery.search && findQuery.search !== '')) {
          joinCondition = joinCondition + ` AND (concat(user.first_name, " ", user.last_name) LIKE '%${escapeSearch(findQuery.search)}%') `;
        }

        if(!isLocationFilterApplied && permissions && !permissions.includes(PERMISSIONS.VIEW_ALL_EMPLOYEES) && permissions.includes(PERMISSIONS.VIEW_EMPLOYEES)){
          let empLocationsIds = empLocations ? empLocations.map(item => `'${item.location_id}'`) : [];
          const _empLocations = empLocationsIds.join(', ');
          const locationData = '(' + _empLocations + ')';
          if(empLocationsIds && empLocationsIds.length){
            if ((findQuery.search && findQuery.search === '')) {
              joinCondition = joinCondition + ` AND employee_location.location_id IN ${locationData} `;
              nativePayload.push(locationData);
            }
          }
        }

        sql =  sql + joinCondition + ` GROUP By employee_profile.employee_profile_id ${havingCondition} ORDER BY ${sortByCheckin} employee_profile.status ASC, ${findQuery.sort} LIMIT ${findQuery.rows} OFFSET ${findQuery.skip}`;

        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        results = rawResult.rows;

        const countQuery = countSql + joinCondition;
        const paginationCount =  await sails.sendNativeQuery(countQuery).usingConnection(req.dynamic_connection);
        const resultsLength = paginationCount.rows;
        let resultCount = await EmployeeProfile.count().usingConnection(req.dynamic_connection);
        sails.log(resultCount);
        let level = {};
        let certificates=[];
        // eslint-disable-next-line no-unused-vars
        let job_types= [];
        let location= [];
        let employeeList = [];
        sails.log(job_types);
        for (let x in results) {
          let employeeData = {};
          let item = results[x];

          employeeData.user = {
            user_id                       : item.user_id,
            email                         : item.email,
            first_name                    : item.first_name,
            last_name                     : item.last_name,
            phone                         : item.phone,
            date_of_birth                 : formatDate(item.date_of_birth,req.dateFormat),
            profile_picture_url           : item.profile_picture_url,
            profile_picture_thumbnail_url : item.profile_picture_thumbnail_url,
            status                        : item.user_status,
            credentials                   : (item.password) ? 'Yes' : 'No'
          };
          if(item.locations !== null && item.locations !== undefined && item.locations !== ''){
            location = (item.locations).split(',');
            employeeData.locations = location;
          }
          if(item.job_types !== null && item.job_types !== undefined && item.job_types !== ''){
            const jobT = item.job_types;
            const job_types_array = [];
            const jobType = jobT.split(',');
            for (const jobitem of jobType) {
              const jobTypeI = jobitem.split('||');
              job_types_array.push({
                job_type_id : (jobTypeI[0] !== '') ? Number(jobTypeI[0]) : '',
                name        : (jobTypeI[2] !== '') ? jobTypeI[2] : '',
                color       : (jobTypeI[1] !== '') ? jobTypeI[1] : ''
              });
            }

            employeeData.jobTypes = job_types_array;
          }
          employeeData.certificates = [];
          if(item.certificates !== null){
            certificates = (item.certificates).split(',');
            employeeData.certificates = certificates;
          }
          if (item.level_id && item.level !== null && item.level !== undefined && item.level !== '' &&
          item.level_name !== null && item.level_name !== undefined && item.level_name !== '') {
            level = {
              level_id : item.level_id,
              level    : item.level,
              name     : item.level_name,
              status   : item.status,
            };
            employeeData.level = level;
          }
          employeeData.status = item.employee_status;
          employeeData.employee_checkedin = item.employee_checkedin;
          if(totalPointsFilter === true) {
            employeeData.points = item.points;
          }
          employeeData.date_of_joining = formatDate(item.date_of_joining,req.dateFormat);
          employeeData.employee_profile_id = item.employee_profile_id;
          employeeData.team_member_id = (item.team_member_id !== null && item.team_member_id !== undefined) ? item.team_member_id : '';
          if (contactNameFilter === true) {
            employeeData.emergency_contact_name = item.emergency_contact_name;
          }
          if (relationFilter === true) {
            employeeData.emergency_contact_relation = item.emergency_contact_relation;
          }
          if (emergency_phoneFilter === true) {
            employeeData.emergency_contact_number = item.emergency_contact_number;
          }

          let other_filter = '';
          if(empFilter !== undefined && empFilter !== null && empFilter !== '') {
            other_filter = empFilter.other_details;
          }

          let questionAnswer = {};
          if(other_filter !== '' && other_filter !== null) {
            other_filter = other_filter.split(',');
            for(const dyfield1 of other_filter) {
              questionAnswer[`${dyfield1}`] = item['q'+`${dyfield1}`];
            }
            employeeData.questionAnswer = questionAnswer;
          }
          employeeList.push(employeeData);
        }

        if (((findQuery.andCondition).length > 0) || findQuery.search !== '') {
          resultCount = employeeList.length;
          sails.log(resultCount);
        }
        let data = {
          userList    : employeeList,
          empFilter   : (empFilter !== undefined && empFilter !== null && empFilter !== '') ? empFilter : {},
          totalResult : resultsLength[0].cnt
        };
        return res.ok(data, messages.GET_USERS, RESPONSE_STATUS.success);
      } else {
        res.ok(isValidate.error, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
      }
    } catch (err) {
      sails.log('Error',err);
      res.ok(undefined, messages.GET_RECORD_FAILURE, RESPONSE_STATUS.error);
    }
  },

  findById: async function (req, res) {
    const employee_profile_id= req.params.id;
    let level = {}; let city = {}; let state = {}; let country = {};
    const result = await EmployeeProfile.findOne({ employee_profile_id: req.params.id }).populate('level_id').populate('role_id').populate('location_id', { select: ['name'] }).populate('job_type_id', { select: ['name','color'] }).usingConnection(req.dynamic_connection);
    const QuestionList = await DynamicQuestion.find({status: ACCOUNT_STATUS.active}).usingConnection(req.dynamic_connection);
    let dynamicQuestionAnswer = [];

    if (result) {
      result.user_id = await Users.findOne({ user_id: result.user_id }).populate('emergency_contact_state_id').populate('emergency_contact_city_id').populate('emergency_contact_country_id');
      let locationdata =locationDetailsData(result);
      if ((result.level_id !== null) && (result.level_id !== '')) {

        /**
         * Level Percentage Calculation
         */
        let start_range = result.level_id.point_range_from;
        let end_range = result.level_id.point_range_to;
        let range = end_range - start_range;
        let current_points = result.points;
        let percentage = ((current_points - start_range)/range) * 100;

        percentageConditionData(percentage);

        level = {
          level_id   : result.level_id.level_id,
          level      : result.level_id.level,
          name       : result.level_id.name,
          status     : result.level_id.status,
          percentage : percentage.toFixed(2)
        };
      }
      if ((result.user_id.emergency_contact_city_id !== null) && (result.user_id.emergency_contact_city_id !== '') ) {
        city = {
          city_id : result.user_id.emergency_contact_city_id.city_id,
          name    : result.user_id.emergency_contact_city_id.name
        };
      }
      if ((result.user_id.emergency_contact_state_id !== null) && (result.user_id.emergency_contact_state_id !== '')) {
        state = {
          state_id   : result.user_id.emergency_contact_state_id.state_id,
          name       : result.user_id.emergency_contact_state_id.name,
          state_code : result.user_id.emergency_contact_state_id.state_code
        };
      }
      country=  countryCondition(result);

      if (QuestionList.length> 0) {
        let sql = `SELECT
        dq.dynamic_question_id AS question_id,
        dq.question AS question, 
        dq.sequence AS sequence,
        dq.required AS required,
        dq.status,
        dq.answer_format AS answer_format,
        GROUP_CONCAT(DISTINCT dqo.dynamic_question_option_id,"#$#",dqo.option_value SEPARATOR '##@##') AS answer_options, 
        edqa.dynamic_question_option_id AS dynamic_question_option_id,
        edqa.employee_profile_id,
        edqa.answer AS answer,(SELECT option_value FROM dynamic_question_option AS dqo WHERE dqo.dynamic_question_option_id = edqa.dynamic_question_option_id) AS option_value
        FROM dynamic_question AS dq
        LEFT JOIN dynamic_question_option AS dqo ON dqo.dynamic_question_id = dq.dynamic_question_id
        LEFT JOIN employee_dynamic_question_answer AS edqa ON edqa.dynamic_question_id = dq.dynamic_question_id
        AND edqa.employee_profile_id = ${employee_profile_id} 
        WHERE (edqa.dynamic_question_id = dq.dynamic_question_id AND dq.status = '${ACCOUNT_STATUS.inactive}') OR 
        (dq.status = '${ACCOUNT_STATUS.active}') GROUP BY dq.dynamic_question_id ORDER BY dq.sequence`;


        const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
        let dynamicQuestionList = rawResult.rows;

        dynamicQuestionAnswer= dynamicQuestionListData(dynamicQuestionList);
      }

      let response = {
        'user': {
          user_id                       : result.user_id.user_id,
          team_member_id                : result.user_id.team_member_id,
          email                         : result.user_id.email,
          first_name                    : result.user_id.first_name,
          last_name                     : result.user_id.last_name,
          phone                         : result.user_id.phone,
          date_of_birth                 : formatDate(result.user_id.date_of_birth,req.dateFormat),
          profile_picture_url           : result.user_id.profile_picture_url,
          profile_picture_thumbnail_url : result.user_id.profile_picture_thumbnail_url,
          emergency_contact_name        : result.user_id.emergency_contact_name,
          emergency_contact_relation    : result.user_id.emergency_contact_relation,
          emergency_contact_number      : result.user_id.emergency_contact_number,
          emergency_contact_address     : result.user_id.emergency_contact_address,
          emergency_contact_city        : city,
          emergency_contact_state       : state,
          emergency_contact_country     : country,
          emergency_contact_zip         : result.user_id.emergency_contact_zip,
          user_status                   : result.user_id.status,
        },
        'role': {
          role_id : result.role_id.role_id,
          name    : result.role_id.name
        },
        'date_of_joining'       : formatDate(result.date_of_joining,req.dateFormat),
        'locations'             : locationdata,
        'level'                 : level,
        'jobTypes'              : result.job_type_id,
        'status'                : result.status,
        'points'                : result.points,
        'employee_profile_id'   : result.employee_profile_id,
        'team_member_id'        : result.team_member_id,
        'dateFormat'            : req.dateFormat,
        'dateTimeFormat'        : req.dateTimeFormat,
        'dynamicQuestionAnswer' : dynamicQuestionAnswer
      };
      return res.ok(response, messages.GET_RECORD, RESPONSE_STATUS.success);
    }
    else {
      return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.error);
    }
  },

  imageUpload: async function (req, res) {
    const upload = req.file('image');
    let fileUID;
    if (upload._files[0]) {
      const fileData = upload._files[0].stream;
      const allowedTypes = messages.ALLOWED_IMAGES;
      if (allowedTypes.indexOf(fileData.headers['content-type']) === -1) {
        return res.ok(undefined, messages.INVALID_FILE_TYPE, RESPONSE_STATUS.error);
      }

      const MAX_IMAGE_UPLOAD_SIZE = process.env.MAX_IMAGE_UPLOAD_SIZE;
      const FILE_SIZE_LIMIT_EXCEEDED = messages.FILE_SIZE_LIMIT_EXCEEDED;
      const ERR_MESSAGE = FILE_SIZE_LIMIT_EXCEEDED.replace(/STR_TO_BE_REPLACE/, MAX_IMAGE_UPLOAD_SIZE);

      if ((fileData.byteCount / 1048576) > MAX_IMAGE_UPLOAD_SIZE) {
        return res.ok(undefined, ERR_MESSAGE, RESPONSE_STATUS.error);
      }

      fileUID = await uploadDocument(upload);
      const result = { 'imageName': fileUID };
      return res.ok(result, messages.SUCCESS_UPLOAD, RESPONSE_STATUS.success);
    }
    else {
      clearTimeout(upload.timeouts.untilMaxBufferTimer);
      clearTimeout(upload.timeouts.untilFirstFileTimer);
      return res.ok(undefined, messages.ADD_FAILURE, RESPONSE_STATUS.success);
    }
  },

  deactivate: async function (req, res) {
    try{
      const isValidate = EmployeeValidations.updateStatus.validate(req.allParams());
      if (!isValidate.error) {
        const employee_profile_id = req.params.id;
        const { status } = req.allParams();
        let resMessage;
        if(status === ACCOUNT_STATUS.active){
          const employeeResult = await sails.sendNativeQuery(`select user.first_name, user.last_name, ep.points, level.name from employee_profile ep
          INNER JOIN level ON ep.level_id = level.level_id
          INNER JOIN ${process.env.DB_NAME}.user ON ep.user_id = user.user_id
          where ep.employee_profile_id = ${employee_profile_id} `).usingConnection(req.dynamic_connection);
          const userDetails = employeeResult.rows;
          resMessage = `${userDetails[0].first_name} ${userDetails[0].last_name} previously earned ${userDetails[0].points} points and was level ${userDetails[0].name}. Would you like them to continue from here or reset to zero?`;
        }
        else if(status === ACCOUNT_STATUS.inactive){
          resMessage =  messages.EMPLOYEE_DEACTIVATE;
          await EmployeeProfile.update({ employee_profile_id },{
            status,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).usingConnection(req.dynamic_connection);
        }

        return res.ok(undefined, resMessage, RESPONSE_STATUS.success);
      } else {
        return res.ok(isValidate.error, messages.UPDATE_FAILURE,RESPONSE_STATUS.success);
      }
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
    }

  },

  import: async function (req, res) {
    const upload = req.file('excelsheet');

    let response = [];
    upload.upload({ dirname: '../../assets/document' }, async (err, files) => {
      if (err) {
        return res.serverError(err, messages.SERVER_ERROR);
      }
      else {
        const fileUID = files[0].fd.replace(/^.*[\\\/]/, '');
        const uploadLocation = process.cwd() + '/assets/document/' + fileUID;
        const tempLocation = process.cwd() + '/.tmp/uploads/' + fileUID;
        //Copy the file to the temp folder so that it becomes available immediately
        fs.createReadStream(uploadLocation).pipe(fs.createWriteStream(tempLocation));

        const workbook = XLSX.readFile(process.cwd() + '/assets/document/' + fileUID);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const range = xls_utils.decode_range(sheet['!ref']);
        let cell_ref;
        let result = {};
        let test = [];
        let flag = true;
        let departments;
        let locations;
        let skills;
        for (let R = (range.s.r) + 1; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            let cell_address = { c: C, r: R };
            /* if an A1-style address is needed, encode the address */
            cell_ref = XLSX.utils.encode_cell(cell_address);
            await checkSheetUndefined(sheet,cell_ref,test);
          }

          if (test.length > 0) {
            result = {
              'name'             : test[2],
              'email'            : test[0],
              'password'         : test[1],
              'role_id'          : test[3],
              'phone'            : test[4],
              'date_of_birth'    : test[5],
              'department_id'    : test[6],
              'image'            : 'null',
              'location_id'      : test[7],
              'date_of_joining'  : test[8],
              'relative_name'    : test[9],
              'relation'         : test[10],
              'relative_phone'   : test[11],
              'relative_address' : test[12],
              'skill_id'         : test[13]
            };
            departments = test[6].split(',');
            locations = test[7].split(',');
            skills = test[13].split(',');
            const isValidate = await EmployeeValidations.bulkAdd.validate(result);
            const user = await User.findOne({ email: result.email }).usingConnection(req.dynamic_connection);
            await checkUserCondition(user,flag,res,isValidate);
            response.push(result);
            test = [];
          }

        }

        if (flag) {
          response.forEach(async (data) => {
            let reqData = {
              'name'             : data.name,
              'email'            : data.email,
              'password'         : await hashPassword(data.password),
              'role_id'          : data.role_id,
              'phone'            : data.phone,
              'date_of_birth'    : data.date_of_birth,
              'image'            : data.image,
              'date_of_joining'  : data.date_of_joining,
              'relative_name'    : data.relative_name,
              'relation'         : data.relation,
              'relative_phone'   : data.relative_phone,
              'relative_address' : data.relative_address,
              'status'           : 1
            };
            const finalres = await User.create(reqData).fetch().usingConnection(req.dynamic_connection);
            await checkDepartmentLocationSkill(departments,locations,skills,req,finalres);
          });
          return res.ok(undefined, messages.REGISTER_SUCCESS);
        }
      }
    });
  },

  activate: async function (req, res) {
    try{
      const isValidate = EmployeeValidations.updateStatus.validate(req.allParams());
      if (!isValidate.error) {
        const employee_profile_id = req.params.id;
        const { status } = req.allParams();
        const account_id       = req.token.tenantId;
        const accountUserCount = await licenseCount(req, account_id);

        if(accountUserCount === 'no') {
          const employeeDetails = await EmployeeProfile.update({ employee_profile_id },{
            status            : ACCOUNT_STATUS.active,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);
          if(status === 'Reset'){
            await EmployeeProfile.update({ employee_profile_id },{
              points            : 0,
              level_id          : 1,
              last_updated_by   : req.user.user_id,
              last_updated_date : getDateUTC()
            }).usingConnection(req.dynamic_connection);
            await EmpCertification.update({ employee_profile_id }, { status: ACCOUNT_STATUS.inactive }).usingConnection(req.dynamic_connection);
            await EmployeeNote.update({ employee_profile_id }, { status: ACCOUNT_STATUS.inactive }).usingConnection(req.dynamic_connection);
            await sails.sendNativeQuery(`Delete from competition_employee WHERE employee_profile_id = ${employee_profile_id};`).usingConnection(req.dynamic_connection);
            await sails.sendNativeQuery(`Update task_assignee SET status='${ACCOUNT_STATUS.inactive}' WHERE assigned_to = ${employee_profile_id};`).usingConnection(req.dynamic_connection);
            await sails.sendNativeQuery(`Update training_employee SET status='${ACCOUNT_STATUS.inactive}' WHERE employee_profile_id = ${employee_profile_id};`).usingConnection(req.dynamic_connection);
            await sails.sendNativeQuery(`Delete from report_submission WHERE employee_profile_id = ${employee_profile_id};`).usingConnection(req.dynamic_connection);
            await sails.sendNativeQuery(`Delete from group_activity_employee WHERE employee_profile_id = ${employee_profile_id};`).usingConnection(req.dynamic_connection);
            await sails.sendNativeQuery(`Delete from employee_point_audit WHERE employee_profile_id = ${employee_profile_id};`).usingConnection(req.dynamic_connection);
          }

          const token = await generateToken({ id: employeeDetails[0].user_id, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, env.JWT_CREATE_PASS_EXPIRY);
          const createUrl = `${process.env.FRONTEND_BASEURL}/create-password?token=${token}`;
          const updatedData = {
            password             : '',
            status               : ACCOUNT_STATUS.invited,
            reset_password_token : token,
          };
          await Users.update({ user_id: employeeDetails[0].user_id }, updatedData).fetch();
          const userResult = await sails.sendNativeQuery(`select user.first_name, user.last_name,  email, user_id from ${process.env.DB_NAME}.user where user_id = ${employeeDetails[0].user_id} `).usingConnection(req.dynamic_connection);
          const users = userResult.rows;

          const account = req.account;
          await sendNotification(req, {
            notification_entity            : NOTIFICATION_ENTITIES.CREATE_PASSWORD,
            recipient_email                : users[0].email,
            recipient_first_name           : users[0].first_name,
            recipient_last_name            : users[0].last_name,
            recipient_phone                : users[0].phone,
            receipient_user_id             : users[0].userId,
            url                            : createUrl,
            receipient_employee_profile_id : employeeDetails[0].employee_profile_id,
            account_id                     : account.account_id,
          });
          return res.ok(undefined, messages.EMPLOYEE_ACTIVATE, RESPONSE_STATUS.success);
        } else {
          return res.ok(undefined, messages.EXCEED_EMPLOYEE, RESPONSE_STATUS.error);
        }
      } else {
        return res.ok(isValidate.error, messages.UPDATE_FAILURE,RESPONSE_STATUS.success);
      }
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.UPDATE_FAILURE, RESPONSE_STATUS.error);
    }

  },
  reinvite: async function (req, res) {
    const employee_profile_id = req.params.id;
    const employeeResult = await sails.sendNativeQuery(`SELECT user.user_id, user.first_name, user.last_name, user.email, user.phone 
                                                        FROM employee_profile ep
                                                        INNER JOIN ${process.env.DB_NAME}.user ON ep.user_id = user.user_id
                                                        WHERE ep.employee_profile_id = ${employee_profile_id} `).usingConnection(req.dynamic_connection);
    const userDetails = employeeResult.rows;
    const userId = userDetails[0].user_id;
    const first_name = userDetails[0].first_name;
    const last_name = userDetails[0].last_name;
    const email = userDetails[0].email;
    const phone = userDetails[0].phone;
    const account_id = req.token.tenantId;

    const token = await generateToken({ id: userId, isLoggedIn: false, scope: 'CREATE_PASSWORD' }, env.JWT_CREATE_PASS_EXPIRY);
    const createUrl = `${process.env.FRONTEND_BASEURL}/create-password?token=${token}`;

    await Users.update({ user_id: userId }, {
      reset_password_token: token,
    });

    await sendNotification(req, {
      notification_entity            : NOTIFICATION_ENTITIES.CREATE_PASSWORD,
      recipient_email                : email,
      recipient_first_name           : first_name,
      recipient_last_name            : last_name,
      recipient_phone                : phone,
      receipient_user_id             : userId,
      url                            : createUrl,
      receipient_employee_profile_id : employee_profile_id,
      account_id                     : account_id,
    });
    return res.ok(undefined, messages.REINVITE_SUCCESS, RESPONSE_STATUS.success);
  },

  filter: async function (req,res) {
    try{
      const isValidate = EmployeeValidations.filter.validate(req.allParams());
      if (!isValidate.error) {
        let { location, phone, job_type, total_points, level, id, contact_name, relation, emergency_phone, other_details } = req.allParams();
        let employee_profile_id = req.empProfile.employee_profile_id;
        let empFilter = await EmpFilter.findOne({ employee_profile_id: employee_profile_id } ).usingConnection(req.dynamic_connection);

        if(empFilter){
          await EmpFilter.update({ employee_profile_id: employee_profile_id  }, {
            location,
            phone,
            job_type,
            total_points,
            level,
            id,
            contact_name,
            relation,
            emergency_phone,
            other_details
          }).usingConnection(req.dynamic_connection);
        }else{
          await EmpFilter.create({
            employee_profile_id: employee_profile_id,
            location,
            phone,
            job_type,
            total_points,
            level,
            id,
            contact_name,
            relation,
            emergency_phone,
            other_details
          }).usingConnection(req.dynamic_connection);
        }
        return res.ok(isValidate.error, messages.UPDATE_FILTER,RESPONSE_STATUS.success);


      } else {
        return res.ok(isValidate.error, messages.UPDATE_FILTER_FAILED,RESPONSE_STATUS.success);
      }
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.UPDATE_FILTER_FAILED, RESPONSE_STATUS.error);
    }
  },
  getfilter: async function (req,res) {
    try{
      let empFilter = await EmpFilter.findOne({employee_profile_id: req.empProfile.employee_profile_id}).usingConnection(req.dynamic_connection);

      if(empFilter !== undefined && empFilter !== '' && empFilter !== null) {
        let  otherDynamicFields = empFilter.other_details;
        otherDynamicFields = otherDynamicFields.split(',');
        let results = await DynamicQuestion.find().usingConnection(req.dynamic_connection);

        let dynamicFieldList = [];
        if(results !== undefined && results !== '' && results !== null) {
          await otherDynamicFieldDatas(otherDynamicFields,results,dynamicFieldList);
        }
        empFilter.dynamicFields = dynamicFieldList;
      } else {
        empFilter ={
          'location'        : true,
          'phone'           : true,
          'job_type'        : true,
          'total_points'    : true,
          'level'           : true,
          'id'              : false,
          'contact_name'    : false,
          'relation'        : false,
          'emergency_phone' : false,
        };
        let results = await DynamicQuestion.find().usingConnection(req.dynamic_connection);

        let dynamicFieldList = [];
        if(results !== undefined && results !== '' && results !== null) {
          for (let x in results) {
            let item = results[x];

            dynamicFieldList.push({
              'dynamic_question_id' : await dynamicQuestionDatas(item),
              'question'            : await questionDatas(item),
              'status'              : await statusDatas(item),
              'sequence'            : await sequenceDatas(item),
              'selected'            : false,
            });
          }
        }
        empFilter.dynamicFields = dynamicFieldList;
      }
      return res.ok(empFilter, messages.GET_FILTER,RESPONSE_STATUS.success);
    }
    catch(err)
    {
      sails.log(err);
      return res.ok(undefined, messages.GET_FILTER_FAILED, RESPONSE_STATUS.error);
    }
  },
  uploadProfilePicture: async (req,res) => {
    try{
      let request = req.allParams();
      const isValidate = await EmployeeValidations.uploadProfilePicture.validate(request);
      if(!isValidate.error) {
        let { user_id } = request;
        let upload = req.file('profile_picture');
        if(upload._files.length !== 0 ){
          let image_data = '';
          let image_data_thumb = '';
          let containerName = process.env.CONTAINER_NAME;
          let dirName = process.env.PROFILE_IMAGE_DIR_INSIDE_MASTER_CONTAINER;
          let data = {
            invalidFileTypeMsg : messages.INVALID_PROFILE_PIC_TYPE,
            maxUploadFileCount : 1,
            fileAllowedTypes   : validations.ALLOWED_IMAGES,
            requestFor         : UPLOAD_REQ_FOR.profile_picture
          };
          let fileUID = await uploadFile(upload, containerName, dirName, data);
          if (fileUID.length > 0) {
            image_data = getImgUrl(fileUID[0], false);
            image_data_thumb = getImgUrl(fileUID[0], true);
          }

          await Users.update({ user_id: user_id },{
            profile_picture_url           : image_data,
            profile_picture_thumbnail_url : image_data_thumb,
            last_updated_by               : req.user.user_id,
            last_updated_date             : getDateUTC()
          }).fetch();

          return res.ok(undefined, messages.PROFILE_PIC_UPLOAD_SUCCESS,RESPONSE_STATUS.success);
        }else{
          return res.ok(undefined,messages.PROFILE_PIC_NOT_SELECTED,RESPONSE_STATUS.error);
        }
      }else{
        return res.ok(isValidate.error,messages.PROFILE_PIC_UPLOAD_FAILURE,RESPONSE_STATUS.error);
      }
    }catch(error){
      sails.log.error(error);
      return res.ok(undefined,error.message,RESPONSE_STATUS.error);
    }
  },
};
