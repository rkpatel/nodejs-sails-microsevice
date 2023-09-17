const { PERMISSIONS } = require('./enums');

module.exports = {

  /***************************************************************************
  *                                                                          *
  * Announcement routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /announcementList'     : { 'and': [PERMISSIONS.VIEW_CONFIGURED_ANNOUNCEMENT] },
  'POST /announcement'         : { 'and': [PERMISSIONS.CREATE_ANNOUNCEMENT] },
  'PUT /announcement/:id'      : { 'and': [PERMISSIONS.EDIT_ANNOUNCEMENT] },
  'PUT /announcement/auto/:id' : { 'and': [PERMISSIONS.EDIT_ANNOUNCEMENT] },
  'DELETE /announcement/:id'   : { 'and': [PERMISSIONS.INACTIVE_ANNOUNCEMENT] }


};

