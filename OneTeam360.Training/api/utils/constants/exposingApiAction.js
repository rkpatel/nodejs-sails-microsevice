const { GROUP_ACTIVITY_PERMISSION } = require('./enums');

module.exports = {
  'POST /trainingreportlist'          : { 'and': [GROUP_ACTIVITY_PERMISSION.Training_List] },
  'POST /training-report-list/export' : { 'and': [GROUP_ACTIVITY_PERMISSION.Export_Excel_Training] },
  'POST /skillquiz/add-question'      : { 'and': [GROUP_ACTIVITY_PERMISSION.Add_Quiz_Questions] },

};


