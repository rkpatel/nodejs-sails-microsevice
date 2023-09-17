const { PERMISSION } = require('./enums');

module.exports = {
  'GET /customer/find/:id'   : { 'or': [PERMISSION.MANAGE_COMPANY_ACCOUNT, PERMISSION.MANAGE_CONFIGURATIONS ] },
  'PUT /customer/edit/:id'   : { 'or': [ PERMISSION.MANAGE_COMPANY_ACCOUNT, PERMISSION.MANAGE_CONFIGURATIONS ] },
  'GET /account-detail/:id'  : { 'and': [ PERMISSION.MANAGE_CONFIGURATIONS ] },
  'POST /update-account/:id' : { 'and': [ PERMISSION.MANAGE_CONFIGURATIONS ] },
};

