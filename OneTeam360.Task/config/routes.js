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

  'POST /'                           : 'TaskController.add',
  'POST /add'                        : 'TaskController.add',
  'GET /get-task/:id'                : 'TaskController.findById',
  'POST /:id'                        : 'TaskController.findWithFilter',
  'GET /image/:id'                   : 'TaskController.findTaskImage',
  'PUT /:id'                         : 'TaskController.edit',
  'GET /get-assignee-by-creator/:id' : 'TaskController.getAssigneeByCreatorId',
  'GET /assignee'                    : 'TaskController.findAssignee',
  'POST /task-export/:id'            : 'TaskController.taskExportToCSV',
  'DELETE /:id'                      : 'TaskController.deleteTask',
  'DELETE /deletemultiple'           : 'TaskController.deleteMultipleTask',
  'DELETE /delete-task-for-assignee' : 'TaskController.deleteTaskForAssignee',
  'PUT /status'                      : 'TaskController.updateTaskStatus',
  'GET /assignees-by-task/:id'       : 'TaskController.findTaskAssignee',
  'GET /pending-task-count/:id'      : 'TaskController.getPendingTaskCount',
  'POST /addMultiSkillTask'          : 'TaskController.addMultiSkillTask',
  'POST /upload/images'              : 'TaskController.uploadTaskImages',

  'GET /trigger-overduetask'   : 'TaskController.trigger',
  'GET /trigger-scheduledtask' : 'TaskController.scheduledTrigger',


  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/

  'GET /swagger.json' : 'CommonController.swagger',
  'GET /health-check' : 'CommonController.healthCheck'

};
