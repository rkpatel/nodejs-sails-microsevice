/***************************************************************************

  Route Mappings
  (sails.config.routes)

  Your routes tell Sails what to do each time it receives a request.

***************************************************************************/

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * All routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /report/list'                       : 'ReportController.find',
  'POST /report/add'                        : 'ReportController.add',
  'POST /report/checkexist'                 : 'ReportController.CheckReportExist',
  'GET /report/list'                        : 'ReportController.findDailyReport',
  'PUT /report/edit/:id'                    : 'ReportController.edit',
  'GET /report/edit/:id'                    : 'ReportController.findById',
  'PUT /report/activate'                    : 'ReportController.activate',
  'POST /report/assignedreportlist'         : 'ReportController.assignedReportList',
  'POST /report/submitreport'               : 'ReportController.submitReport',
  'POST /report/submittedreporthistorylist' : 'ReportController.submittedReportHistoryList',
  'GET /report/editsubmittedreport/:id'     : 'ReportController.findBySubmittedReportId',
  'POST /report/deletequestion'             : 'ReportController.deleteQuestion',
  'GET /report/groupinglist'                : 'ReportController.dailyReportGroupingList',
  'GET /report/reportquestion/:id'          : 'ReportController.getReportQuestionById',
  'PUT /report/updatereportquestion/:id'    : 'ReportController.updateReportQuestion',
  'POST /report/employeelist'               : 'ReportController.employeeList',
  'POST /report/tasklist'                   : 'ReportController.taskList',
  'POST /report/notelist'                   : 'ReportController.noteList',

  'POST /question/add'           : 'QuestionController.add',
  'PUT /question/edit/:id'       : 'QuestionController.edit',
  'DELETE /question/delete/:id'  : 'QuestionController.delete',
  'POST /question/predefinelist' : 'QuestionController.predefinedQuestions',
  'GET /question/edit/:id'       : 'QuestionController.findById',
  'POST /question/findquestions' : 'QuestionController.findByIds',
  'GET /trigger'                 : 'ReportController.trigger',
  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'GET /health-check': 'CommonController.healthCheck'
};
