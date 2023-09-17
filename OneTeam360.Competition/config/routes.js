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
  'POST /add'                : 'CompetitionController.add',
  'POST /history/list'       : 'CompetitionController.competitionHistoryList',
  'GET /history/cards/:flag' : 'CompetitionController.historyCards',
  'GET /dropdown/list'       : 'CompetitionController.competitionDropDownList',
  'GET /edit/:id'            : 'CompetitionController.findById',
  'PUT /update/:id'          : 'CompetitionController.update',
  'DELETE /delete/:id'       : 'CompetitionController.delete',
  'POST /dashboard'          : 'CompetitionController.dashboard',
  'GET /dashboard/cards/:id' : 'CompetitionController.dashboardCards',

  /***************************************************************************
  *                                                                          *
  * Common routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'GET  /trigger-competition': 'CompetitionController.triggerCompetitionCron',

  'GET /swagger.json' : 'CommonController.swagger',
  'GET /health-check' : 'CommonController.healthCheck'

};
