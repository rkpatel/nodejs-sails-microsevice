const { GROUP_ACTIVITY_PERMISSION } = require('./enums');

module.exports = {

  /***************************************************************************
  *                                                                          *
  * Training routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /trainingreport'            : { 'and': [GROUP_ACTIVITY_PERMISSION.Training_List] },
  'POST /trainingsonprofile'        : { 'and': [GROUP_ACTIVITY_PERMISSION.Training_List] },
  'POST /trainingreportlist'        : { 'and': [GROUP_ACTIVITY_PERMISSION.Training_List] },
  'POST /addscenario'               : { 'and': [GROUP_ACTIVITY_PERMISSION.Save_Scenario] },
  'PUT /editscenario/:id'           : { 'and': [GROUP_ACTIVITY_PERMISSION.Save_Scenario] },
  'POST /get-scenariobyname'        : { 'and': [GROUP_ACTIVITY_PERMISSION.Conduct_Group_Activity] },
  'GET /get-scenarios'              : { 'and': [GROUP_ACTIVITY_PERMISSION.Conduct_Group_Activity] },
  'GET /get-scenario/:id'           : { 'and': [GROUP_ACTIVITY_PERMISSION.Conduct_Group_Activity] },
  'POST /training-employee'         : { 'and': [GROUP_ACTIVITY_PERMISSION.Add_Training] },
  'PUT /training-employee/:id'      : { 'and': [GROUP_ACTIVITY_PERMISSION.Delete_Training] },
  'POST /training-employee/re-test' : { 'and': [GROUP_ACTIVITY_PERMISSION.Retest_Training] },
  'POST /addgroupactivity'          : { 'and': [GROUP_ACTIVITY_PERMISSION.Conduct_Group_Activity] },
  'POST /group-activity'            : { 'and': [GROUP_ACTIVITY_PERMISSION.View_Training_Developments_History] },
  'PUT /group-activity/:id'         : { 'and': [GROUP_ACTIVITY_PERMISSION.Delete_Group_Activity] },
  'GET /group-activity/:id'         : { 'and': [GROUP_ACTIVITY_PERMISSION.View_Training_Developments_History] },
};

