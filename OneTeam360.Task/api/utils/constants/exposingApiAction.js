const { TASK_PERMISSION } = require('./enums');

module.exports = {
  'POST /add'           : { 'and': [TASK_PERMISSION.addTask] },
  'POST /upload/images' : { 'and': [TASK_PERMISSION.addTask] },
  'PUT /status'         : { 'and': [TASK_PERMISSION.completeTask] },
  'GET /get-task/:id'   : { 'or': [TASK_PERMISSION.viewPrivateTask, TASK_PERMISSION.viewEmployeePrivateTask, TASK_PERMISSION.accessTaskHistory] },
};


