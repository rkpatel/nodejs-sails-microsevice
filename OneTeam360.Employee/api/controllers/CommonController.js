/***************************************************************************

  Controller     : Common

***************************************************************************/

const { RESPONSE_STATUS } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;


module.exports = {

  locations: async (req, res) => {
    try{
      let request = req.allParams();
      let { user_id } = req.user;
      let id;
      if('employee_profile_id' in request){
        id = request.employee_profile_id;
      }else{
        let empProfile = await EmployeeProfile.findOne({ user_id }).usingConnection(req.dynamic_connection);
        id = empProfile.employee_profile_id;
      }
      let empLocation = await EmpLocation.find({
        employee_profile_id: id,
      }).populate('employee_profile_id').populate('location_id').usingConnection(req.dynamic_connection);
      let response = empLocation ? empLocation.sort((a, b) => a.location_id.name.localeCompare(b.location_id.name)).map(_emp => {
        return {
          employee_location_id : _emp.employee_location_id,
          location_id          : _emp.location_id.location_id,
          name                 : _emp.location_id.name,
        };
      }) : [];
      res.ok(response,messages.EMPLOYEE_LOCATIONS,RESPONSE_STATUS.success);
    }catch(error) {
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },

  jobTypes: async (req, res) => {
    try{
      let request = req.allParams();
      let { user_id } = req.user;
      let id;
      if('employee_profile_id' in request){
        id = request.employee_profile_id;
      }else{
        let empProfile = await EmployeeProfile.findOne({ user_id }).usingConnection(req.dynamic_connection);
        id = empProfile.employee_profile_id;
      }
      let empJob = await EmpJobType.find({
        employee_profile_id: id,
      }).populate('employee_profile_id').populate('job_type_id').usingConnection(req.dynamic_connection);
      let response = empJob ? empJob.sort((a, b) => a.job_type_id.name.localeCompare(b.job_type_id.name)).map(_emp => {
        return {
          employee_job_type_id : _emp.employee_job_type_id,
          job_type_id          : _emp.job_type_id.job_type_id,
          name                 : _emp.job_type_id.name,
        };
      }) : [];
      res.ok(response,messages.EMPLOYEE_LOCATIONS,RESPONSE_STATUS.success);
    }catch(error) {
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },

  getPermission: async (req, res) =>{
    try{
      let permissions = req.permissions.map(perm => perm.code);
      let permissions_module = req.permissionModuleList.map(perm => perm.code);
      let role; let role_dashboard;
      if(req.empProfile){
        const roleExits= await Role.findOne({ role_id: req.empProfile.role_id}).usingConnection(req.dynamic_connection);
        role = (roleExits.name) ? (roleExits.name) : '';
        role_dashboard = (roleExits.dashboard) ? (roleExits.dashboard): '';
      }
      return res.ok({
        account_status     : req.account.status,
        payment_status     : req.account.payment_status,
        role,
        role_dashboard,
        permissions,
        permissions_module : [...new Set(permissions_module)],
        dateTimeFormat     : req.dateTimeFormat,
        dateFormat         : req.dateFormat,
      }, messages.GET_RECORD, RESPONSE_STATUS.success);
    }catch(error) {
      sails.log.error(error);
      res.ok(undefined,messages.GET_RECORD_FAILURE,RESPONSE_STATUS.error);
    }
  },
  /**
   * This controller function will called when user request for all the swagger.json
   *
   * NOTE : Here we are not using are custom global response as we have to server swagger.json file
   */
  swagger: async (_req, res) => {
    const swaggerJson = require('../../swagger/swagger.json');
    if (!swaggerJson) {
      res
          .status(404)
          .set('content-type', 'application/json')
          .send({message: 'Cannot find swagger.json, has the server generated it?'});
    }
    return res
        .status(200)
        .set('content-type', 'application/json')
        .send(swaggerJson);
  },

  logger: async (_req, res) => {
    const systemLogger = require('../../logging/systemLogger.txt');
    if (!systemLogger) {
      res
          .status(404)
          .set('content-type', 'application/json')
          .send({message: 'Cannot find systemLogger.txt'});
    }
    return res
        .status(200)
        .set('content-type', 'application/json')
        .send(swaggerJson);
  },

  healthCheck: async (req,res) => {
    return res.ok(undefined,messages.HEALTH_OK,RESPONSE_STATUS.success);
  }
  
};
