const { TASK_PERMISSION } = require('./enums');

module.exports = {
  'POST /'                           : { 'or': [TASK_PERMISSION.addTask,TASK_PERMISSION.addEmployeeTask] },
  'POST /upload/images'              : { 'or': [TASK_PERMISSION.addTask,TASK_PERMISSION.addEmployeeTask] },
  'PUT /:id'                         : { 'or': [TASK_PERMISSION.editTask,TASK_PERMISSION.editEmployeeTask]},
  //from task menu
  'DELETE /:id'                      : { 'or': [TASK_PERMISSION.deleteTask ]},
  //from employee
  'DELETE /delete-task-for-assignee' : { 'or': [TASK_PERMISSION.deleteEmployeeTask]},
  'PUT /status'                      : { 'or': [TASK_PERMISSION.completeTask,TASK_PERMISSION.completeEmployeeTask]},

  // 'POST /:id'                   : { 'and': [ TASK_PERMISSION.viewAllTasks] },
  'GET /image/:id'        : { 'and': [ TASK_PERMISSION.accessTaskHistory] },
  'POST /task-export/:id' : { 'and': [ TASK_PERMISSION.accessTaskHistory] },
  // 'GET /pending-task-count/:id' : { 'and': [TASK_PERMISSION.accessTaskHistory]}
  'GET /get-task/:id'     : { 'or': [TASK_PERMISSION.viewPrivateTask, TASK_PERMISSION.viewEmployeePrivateTask, TASK_PERMISSION.accessTaskHistory] },
};

