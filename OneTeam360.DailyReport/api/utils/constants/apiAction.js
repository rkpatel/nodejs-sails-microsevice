const {DAILY_REPORT_PERMISSION} = require('./enums');
module.exports = {
  /***************************************************************************
  *                                                                          *
  * Job Type routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /report/list'                       : { 'and': [DAILY_REPORT_PERMISSION.View_Configured_Report_List] },
  'POST /report/add'                        : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'POST /report/checkexist'                 : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'PUT /report/edit/:id'                    : { 'and': [DAILY_REPORT_PERMISSION.Edit_Report] },
  'GET /report/edit/:id'                    : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'PUT /report/activate'                    : { 'and': [DAILY_REPORT_PERMISSION.Inactivate_Report] },
  'POST /report/assignedreportlist'         : { 'and': [DAILY_REPORT_PERMISSION.View_Assigned_Reports] },
  'POST /report/submitreport'               : { 'and': [DAILY_REPORT_PERMISSION.Submit_Daily_Report] },
  'POST /report/submittedreporthistorylist' : { 'and': [DAILY_REPORT_PERMISSION.View_Report_History] },
  'GET /report/editsubmittedreport/:id'     : { 'or': [DAILY_REPORT_PERMISSION.View_Report_History,DAILY_REPORT_PERMISSION.Submit_Daily_Report] },
  'POST /report/deletequestion'             : { 'or': [DAILY_REPORT_PERMISSION.Edit_Report ] },
  'GET /report/groupinglist'                : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Clone_Report] },
  'GET /report/reportquestion/:id'          : { 'or': [DAILY_REPORT_PERMISSION.Edit_Report ] },
  'PUT /report/updatereportquestion/:id'    : { 'or': [DAILY_REPORT_PERMISSION.Edit_Report ] },
  'POST /report/employeelist'               : { 'and': [DAILY_REPORT_PERMISSION.Submit_Daily_Report] },
  'POST /report/tasklist'                   : { 'and': [DAILY_REPORT_PERMISSION.Submit_Daily_Report] },
  'POST /report/notelist'                   : { 'and': [DAILY_REPORT_PERMISSION.Submit_Daily_Report] },

  'POST /question/add'           : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'PUT /question/edit/:id'       : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'DELETE /question/delete/:id'  : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'POST /question/predefinelist' : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'GET /question/edit/:id'       : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'POST /question/findquestions' : { 'or': [DAILY_REPORT_PERMISSION.Create_Report, DAILY_REPORT_PERMISSION.Edit_Report, DAILY_REPORT_PERMISSION.Clone_Report ] },
  'GET /trigger'                 : { 'and': [DAILY_REPORT_PERMISSION.Receive_Daily_Report_Digest] },
};
