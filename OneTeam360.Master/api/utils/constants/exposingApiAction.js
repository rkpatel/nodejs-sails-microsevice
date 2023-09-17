const { ROLE_PERMISSION } = require('./enums');

module.exports = {
  'GET /skills' : { 'and': [ROLE_PERMISSION.VIEW_SKILL] },
  'POST /roles' : { 'and': [ROLE_PERMISSION.View_All_Roles] },
};


