const { COMPETITION_PERMISSION } = require('./enums');

module.exports = {
  'POST /add'                : { 'and': [ COMPETITION_PERMISSION.Create_Competition ] },
  'POST /history/list'       : { 'and': [ COMPETITION_PERMISSION.View_Competition_History ] },
  'GET /history/cards/:flag' : { 'and': [ COMPETITION_PERMISSION.View_Competition_History ] },
  'GET /dropdown/list'       : { 'and': [ COMPETITION_PERMISSION.View_Competition_History ] },
  'GET /edit/:id'            : { 'and': [ COMPETITION_PERMISSION.Edit_Competition ] },
  'PUT /update/:id'          : { 'and': [ COMPETITION_PERMISSION.Edit_Competition ] },
  'DELETE /delete/:id'       : { 'and': [ COMPETITION_PERMISSION.Delete_Competition ] },
  'POST /dashboard'          : { 'and': [ COMPETITION_PERMISSION.View_Competition_Dashboard ] },
  'GET /dashboard/cards/:id' : { 'and': [ COMPETITION_PERMISSION.View_Competition_Dashboard ] },
};

