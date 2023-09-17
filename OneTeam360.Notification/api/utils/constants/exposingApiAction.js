const { PERMISSIONS } = require('./enums');

module.exports = {
  'POST /announcementList'          : { 'and': [PERMISSIONS.VIEW_CONFIGURED_ANNOUNCEMENT] },
  'POST /announcement'              : { 'and': [PERMISSIONS.CREATE_ANNOUNCEMENT] },
  'PUT /announcement/:id'           : { 'and': [PERMISSIONS.EDIT_ANNOUNCEMENT] },
  'PUT /announcement/update-status' : { 'and': [PERMISSIONS.INACTIVE_ANNOUNCEMENT] }
};


