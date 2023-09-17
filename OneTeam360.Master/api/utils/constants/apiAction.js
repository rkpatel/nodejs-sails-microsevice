const {ROLE_PERMISSION} = require('./enums');
module.exports = {
  /***************************************************************************
  *                                                                          *
  * Job Type routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /jobtype'                           : { 'and': [ROLE_PERMISSION.Job_types_Management] },
  'PUT /jobtype/:id'                        : { 'and': [ROLE_PERMISSION.Job_types_Management] },
  'PUT /jobtypestatus/:id'                  : { 'and': [ROLE_PERMISSION.Job_types_Management] },
  /***************************************************************************
  *                                                                          *
  * location routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /locations'                         : { 'and': [ROLE_PERMISSION.Location_Management] },
  'PUT /locations/:id'                      : { 'and': [ROLE_PERMISSION.Location_Management] },
  'PUT /locations/activate/:id'             : { 'and': [ROLE_PERMISSION.Location_Management] },
  /***************************************************************************
  *                                                                          *
  * roles routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /roles'                             : { 'and': [ROLE_PERMISSION.View_All_Roles] },
  'POST /roles/add'                         : { 'and': [ROLE_PERMISSION.Add_Role] },
  'PUT /roles/edit/:id'                     : { 'and': [ROLE_PERMISSION.Edit_Role] },
  'PUT /roles/:id'                          : { 'and': [ROLE_PERMISSION.Inactivate_Role] },
  /***************************************************************************
  *                                                                          *
  * level routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /levels'                            : { 'and': [ROLE_PERMISSION.Level_Management] },
  'PUT /levels/:id'                         : { 'and': [ROLE_PERMISSION.Level_Management] },
  'PUT /levels/activate/:id'                : { 'and': [ROLE_PERMISSION.Level_Management] },
  /***************************************************************************
  *                                                                          *
  *         task type routes                                                 *
  *                                                                          *
  ***************************************************************************/
  'POST /tasktype'                          : { 'and': [ROLE_PERMISSION.Task_Type_Management] },
  'PUT /tasktype/:id'                       : { 'and': [ROLE_PERMISSION.Task_Type_Management] },
  'PUT /tasktype/activate/:id'              : { 'and': [ROLE_PERMISSION.Task_Type_Management] },
  /***************************************************************************
  *                                                                          *
  * certificate routes                                            *
  *                                                                          *
  ***************************************************************************/
  'POST /certificatetype'                   : { 'and': [ROLE_PERMISSION.Certificate_Type_Management] },
  'PUT /certificatetype'                    : { 'and': [ROLE_PERMISSION.Certificate_Type_Management] },
  'PUT /certificatetypestatus'              : { 'and': [ROLE_PERMISSION.Certificate_Type_Management] },
  /***************************************************************************
  *                                                                          *
  * notetype routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /notetype'                          : { 'and': [ROLE_PERMISSION.Note_Type_Management] },
  'PUT /notetype/default/:id'               : { 'and': [ROLE_PERMISSION.Note_Type_Management] },
  'PUT /notetype/:id'                       : { 'and': [ROLE_PERMISSION.Note_Type_Management] },
  'PUT /notetype/activate/:id'              : { 'and': [ROLE_PERMISSION.Note_Type_Management] },
  /***************************************************************************
  *                                                                          *
  * training routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /training'                          : { 'and': [ROLE_PERMISSION.Training_Management] },
  'PUT /training/:id'                       : { 'and': [ROLE_PERMISSION.Training_Management] },
  'PUT /trainingstatus/:id'                 : { 'and': [ROLE_PERMISSION.Training_Management] },
  'POST /photo-reference'                   : { 'and': [ROLE_PERMISSION.Training_Management] },
  'POST /video-reference'                   : { 'and': [ROLE_PERMISSION.Training_Management] },
  'DELETE /training/:id'                    : { 'and': [ROLE_PERMISSION.Training_Management] },
  'PUT /training/update-sequence'           : { 'and': [ROLE_PERMISSION.Training_Management] },
  /***************************************************************************
  *                                                                          *
  * training category routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /trainingcategory'                  : { 'and': [ROLE_PERMISSION.Training_Category_Management] },
  'PUT /trainingcategory/:id'               : { 'and': [ROLE_PERMISSION.Training_Category_Management] },
  'PUT /trainingcategorystatus/:id'         : { 'and': [ROLE_PERMISSION.Training_Category_Management] },
  /***************************************************************************
  *                                                                          *
  * interaction factor routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /interaction-factor'                : { 'and': [ROLE_PERMISSION.Interaction_Factor_Management] },
  'PUT /interaction-factor/:id'             : { 'and': [ROLE_PERMISSION.Interaction_Factor_Management] },
  'PUT /interaction-factor/activate/:id'    : { 'and': [ROLE_PERMISSION.Interaction_Factor_Management] },
  /***************************************************************************
  *                                                                          *
  * Dynamic Questions routes                                                              *
  *                                                                          *
  ***************************************************************************/
  'POST /dynamic-question'                  : { 'and': [ROLE_PERMISSION.Dynamic_Questions_Management] },
  'PUT /dynamic-question/update-status/:id' : { 'and': [ROLE_PERMISSION.Dynamic_Questions_Management] },
  'PUT /dynamicquestion/:id'                : { 'and': [ROLE_PERMISSION.Dynamic_Questions_Management] },
};
