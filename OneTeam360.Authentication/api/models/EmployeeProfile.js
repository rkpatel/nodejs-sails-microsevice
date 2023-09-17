/***************************************************************************

  Model          : Employee_Profile
  Database Table : employee_profile

***************************************************************************/

module.exports = {
  tableName  : 'employee_profile',
  primaryKey : 'employee_profile_id',
  attributes : {
    employee_profile_id : { type: 'number', autoIncrement: true },
    status              : { type: 'string', isIn: ['Inactive', 'Active'] },
    user_id             : { type: 'number' },
    role_id             : { model: 'Role' },
    job_type_id         : { collection: 'JobType', via: 'employee_profile_id', through: 'EmpJobType' },
    location_id         : { collection: 'Locations', via: 'employee_profile_id', through: 'EmpLocation' },
  },
};

