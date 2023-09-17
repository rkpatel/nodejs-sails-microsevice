/***************************************************************************

  Model          : EmpFilter
  Database Table : employee_filter

  *************************
  Column      :   type
  employee_location_id : int
  employee_profile_id   : int
  location_id   : int
  created_by : number
  created_date : datetime
  *************************


  *************************

***************************************************************************/

module.exports = {
  tableName  : 'employee_filter',
  primaryKey : 'employee_filter_id',
  attributes : {
    employee_filter_id  : { type: 'number', autoIncrement: true },
    employee_profile_id : { model: 'EmployeeProfile' },
    location            : { type: 'boolean' },
    phone               : { type: 'boolean' },
    job_type            : { type: 'boolean' },
    total_points        : { type: 'boolean' },
    level               : { type: 'boolean' },
    id                  : { type: 'boolean' },
    contact_name        : { type: 'boolean' },
    relation            : { type: 'boolean' },
    emergency_phone     : { type: 'boolean' },
    other_details       : { type: 'string' },
  },
};


