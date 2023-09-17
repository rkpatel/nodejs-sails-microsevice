/***************************************************************************

  Policy Mappings
  (sails.config.policies)

  Policies are simple functions which run **before** your actions.

  Note:
  Default policy for all controllers and actions, unless overridden.
  * (`true` allows public access)

  **************************************************
  Available Policies
  **************************************************

  isLoggedIn
  permission
  **************************************************

***************************************************************************/

module.exports.policies = {

  /***************************************************************************
   *  EmployeeController Policy                                                  *
   ***************************************************************************/
  EmployeeController: {
    '*'                    : true,
    'add'                  : ['isLoggedIn','permission'],
    'edit'                 : ['isLoggedIn','permission'],
    'findById'             : ['isLoggedIn','permission'],
    'find'                 : ['isLoggedIn','permission'],
    'delete'               : ['isLoggedIn','permission'],
    'deactivate'           : ['isLoggedIn','permission'],
    'activate'             : ['isLoggedIn'],
    'import'               : ['isLoggedIn','permission'],
    'reinvite'             : ['isLoggedIn'],
    'filter'               : ['isLoggedIn'],
    'getfilter'            : ['isLoggedIn'],
    'uploadProfilePicture' : ['isLoggedIn']
    // 'imageUpload'     : ['isLoggedIn'],
  },

  CommonController: {
    '*'             : true,
    'locations'     : ['isLoggedIn'],
    'jobTypes'      : ['isLoggedIn'],
    'getPermission' : ['isLoggedIn'],
  },

  NoteController: {
    '*'      : true,
    'add'    : ['isLoggedIn','permission'],
    'types'  : ['isLoggedIn'],
    'graph'  : ['isLoggedIn','permission'],
    'find'   : ['isLoggedIn','permission'],
    'delete' : ['isLoggedIn','permission']
  },

  CertificateController: {
    '*'                           : true,
    'assign'                      : ['isLoggedIn','permission'],
    'findCertificateTypes'        : ['isLoggedIn'],
    'add'                         : ['isLoggedIn','permission'],
    'uploadCertificate'           : ['isLoggedIn','permission'],
    'find'                        : ['isLoggedIn','permission'],
    'findCertificates'            : ['isLoggedIn','permission'],
    'findCertificatesCount'       : ['isLoggedIn','permission'],
    'findById'                    : ['isLoggedIn','permission'],
    'edit'                        : ['isLoggedIn','permission'],
    'delete'                      : ['isLoggedIn','permission'],
    'alertAbouttoExpire'          : ['isLoggedIn','permission'],
    'review'                      : ['isLoggedIn','permission'],
    'ListAbouttoExpire'           : ['isLoggedIn','permission'],
    'assignMultiple'              : ['isLoggedIn'],
    'assignMultipleCrts'          : ['isLoggedIn'],
    'exportCertificateReportList' : ['isLoggedIn','permission'],
  },


  PointCalculationController: {
    '*'                      : true,
    'pointsAdjustment'       : ['isLoggedIn','permission'],
    'find'                   : ['isLoggedIn','permission'],
    'findInteractionHistory' : ['isLoggedIn','permission']
  },

  InteractionController: {
    '*'     : true,
    'add'   : ['isLoggedIn','permission'],
    'graph' : ['isLoggedIn','permission'],
  },

  DashboardController: {
    '*'                    : true,
    'managerCardSecondTab' : ['isLoggedIn'],
    'managerCardFirstTab'  : ['isLoggedIn'],
    'employeeCard'         : ['isLoggedIn'],
  },

  EmployeeCheckInController: {
    'add'                 : ['isLoggedIn','permission'],
    'findById'            : ['isLoggedIn'],
    'findListById'        : ['isLoggedIn', 'permission'],
    'edit'                : ['isLoggedIn', 'permission'],
    'pendingRequestCount' : ['isLoggedIn', 'permission'],
  },

  EmployeeCheckOutCronController: {
    '*': true
  },

  FeedbackStatasticsController: {
    'viewStatastics'            : ['isLoggedIn'],
    'checkFeedbackAvailability' : ['isLoggedIn']
  },
  FeedbackReportController: {
    'findManagerFeedbackReport'      : ['isLoggedIn','permission'],
    'findLocationFeedbackReport'     : ['isLoggedIn','permission'],
    'findManagerFeedbackReportById'  : ['isLoggedIn','permission'],
    'findLocationFeedbackReportById' : ['isLoggedIn','permission'],
    'exportManagerFeedbackReport'    : ['isLoggedIn','permission'],
    'exportLocationFeedbackReport'   : ['isLoggedIn','permission'],
  },

  EmployeeFeedbackController: {
    'findQuestionList'           : ['isLoggedIn','permission'],
    'submitFeedback'             : ['isLoggedIn','permission'],
    'findManager'                : ['isLoggedIn'],
    'findLocationDetail'         : ['isLoggedIn','permission'],
    'pendingFeedbackCount'       : ['isLoggedIn'],
    'findQuestionListByLocation' : ['isLoggedIn']
  },
};
