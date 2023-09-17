const {DAILY_REPORT_PERMISSION} = require('./enums');

module.exports = {
  'POST /report/submittedreporthistorylist': { 'and': [DAILY_REPORT_PERMISSION.View_Report_History] },
};


