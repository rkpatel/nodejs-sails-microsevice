const createPassword = require('./Email/createPassword.js');
const resetPassword = require('./Email/resetPassword.js');
const addNote = require('./Email/addNote.js');
const noteAdded = require('./Email/noteAdded.js');
const assignTask = require('./Email/assignTask.js');
const completedTask = require('./Email/completedTask.js');
const completedGroupTask = require('./Email/completedGroupTask.js');
const taskOverdueReminder = require('./Email/taskOverdueReminder.js');
const crtAboutToExpireReminder = require('./Email/crtAboutToExpireReminder');
const employeeLevelUpdate = require('./Email/employeeLevelUpdate');
const completeAllImport = require('./Email/completeAllImport');
const completePartialImport = require('./Email/completePartialImport');
const NotcompleteImport = require('./Email/NotcompleteImport');
const addCompetition = require('./Email/addCompetition');
const customAnnouncement = require('./Email/customAnnouncement');
const employeeReportSubmission = require('./Email/employeeReportSubmission');
const certificateAutoAssign = require('./Email/certificateAutoAssign');
const receiveCertificateReportDigest = require('./Email/receiveCertificateReportDigest');
const feedBackReportDigest = require('./Email/feedBackReportDigest');



const welcome_SMS = require('./SMS/welcome_SMS.js');
const assignTask_SMS = require('./SMS/assignTask_SMS.js');
const addCompetitionToday_PushNoti = require('./PushNotification/addCompetitionToday_PushNoti.js');
const addNote_PushNoti = require('./PushNotification/addNote_PushNoti.js');
const addNote_InApp = require('./InApp/addNote_InApp.js');
const completedTask_PushNoti = require('./PushNotification/completedTask_PushNoti.js');
const completedGroupTask_PushNoti = require('./PushNotification/completedGroupTask_PushNoti.js');
const assignTask_PushNoti = require('./PushNotification/assignTask_PushNoti.js');
const taskOverdueReminder_PushNoti = require('./PushNotification/taskOverdueReminder_PushNoti.js');
const crtAboutToExpireReminder_PushNoti = require('./PushNotification/crtAboutToExpireReminder_PushNoti');
const employeePointUpdate_PushNoti = require('./PushNotification/employeePointUpdate_PushNoti');
const employeefeedbackPointUpdate_PushNoti = require('./PushNotification/employeefeedbackPointUpdate_PushNoti');
const employeeLevelUpdate_PushNoti = require('./PushNotification/employeeLevelUpdate_PushNoti');
const addCompetition_PushNoti = require('./PushNotification/addCompetition_PushNoti');
const endCompetition_PushNoti = require('./PushNotification/endCompetition_PushNoti');
const customAnnouncement_PushNoti = require('./PushNotification/customAnnouncement_PushNoti');
const certificateAutoAssign_PushNoti = require('./PushNotification/certificateAutoAssign_PushNoti');


const assignTask_InApp = require('./InApp/assignTask_InApp');
const completedTask_InApp = require('./InApp/completedTask_InApp');
const completedGroupTask_InApp = require('./InApp/completedGroupTask_InApp');
const modifyTask_PushNoti = require('./PushNotification/modifyTask_PushNoti');
const modifyTask_InApp = require('./InApp/modifyTask_InApp');
const deleteTask_PushNoti = require('./PushNotification/deleteTask_PushNoti');
const deleteTask_InApp = require('./InApp/deleteTask_InApp');
const addCompetition_InApp = require('./InApp/addCompetition_InApp.js');
const certificateReject_PushNoti = require('./PushNotification/certificateReject_PushNoti');
const certificateApprove_PushNoti = require('./PushNotification/certificateApprove_PushNoti');
const certificateReject_InApp = require('./InApp/certificateReject_InApp');
const certificateApprove_InApp = require('./InApp/certificateApprove_InApp');
const taskOverdueReminder_InApp = require('./InApp/taskOverdueReminder_InApp');
const employeeLevelUpdate_InApp = require('./InApp/employeeLevelUpdate_InApp');
const employeePointUpdate_InApp = require('./InApp/employeePointUpdate_InApp');
const employeefeedbackPointUpdate_InApp = require('./InApp/employeefeedbackPointUpdate_InApp');
const crtAboutToExpireReminder_InApp = require('./InApp/crtAboutToExpireReminder_InApp');
const startCompetition_InApp = require('./InApp/startCompetition_InApp');
const endCompetition_InApp = require('./InApp/endCompetition_InApp');
const customAnnouncement_InApp = require('./InApp/customAnnouncement_InApp');
const certificateAutoAssign_InApp = require('./InApp/certificateAutoAssign_InApp');
const birthdayAnnouncement = require('./Email/birthdayAnnouncement');
const birthdayAnnouncement_InApp = require('./InApp/birthdayAnnouncement_InApp');
const birthdayAnnouncement_PushNoti = require('./PushNotification/birthdayAnnouncement_PushNoti');
const birthdayAnnouncement_SMS = require('./SMS/birthdayAnnouncement_SMS');
const checkInRequest_InApp = require('./InApp/checkInRequest_InApp');
const checkInRequest_PushNoti = require('./PushNotification/checkInRequest_PushNoti');

const anniversaryAnnouncement = require('./Email/anniversaryAnnouncement');
const anniversaryAnnouncement_InApp = require('./InApp/anniversaryAnnouncement_InApp');
const anniversaryAnnouncement_PushNoti = require('./PushNotification/anniversaryAnnouncement_PushNoti');
const anniversaryAnnouncement_SMS = require('./SMS/anniversaryAnnouncement_SMS');

const onboardAnnouncement = require('./Email/onboardAnnouncement');
const onboardAnnouncement_InApp = require('./InApp/onboardAnnouncement_InApp');
const onboardAnnouncement_PushNoti = require('./PushNotification/onboardAnnouncement_PushNoti');
const onboardAnnouncement_SMS = require('./SMS/onboardAnnouncement_SMS');
const customAnnouncement_SMS = require('./SMS/customAnnouncement_SMS');

module.exports = {
  createPassword,
  resetPassword,
  addNote,
  noteAdded,
  assignTask,
  assignTask_SMS,
  completedTask,
  completedGroupTask,
  employeeLevelUpdate,
  taskOverdueReminder,
  crtAboutToExpireReminder,
  welcome_SMS,
  addNote_PushNoti,
  assignTask_PushNoti,
  completedTask_PushNoti,
  completedGroupTask_PushNoti,
  taskOverdueReminder_PushNoti,
  crtAboutToExpireReminder_PushNoti,
  employeePointUpdate_PushNoti,
  employeeLevelUpdate_PushNoti,
  addCompetition_PushNoti,
  endCompetition_PushNoti,
  completeAllImport,
  NotcompleteImport,
  completePartialImport,
  employeeReportSubmission,
  assignTask_InApp,
  completedTask_InApp,
  completedGroupTask_InApp,
  modifyTask_PushNoti,
  modifyTask_InApp,
  deleteTask_PushNoti,
  deleteTask_InApp,
  addCompetition,
  addCompetition_InApp,
  addCompetitionToday_PushNoti,
  certificateReject_PushNoti,
  certificateApprove_InApp,
  certificateApprove_PushNoti,
  certificateReject_InApp,
  addNote_InApp,
  taskOverdueReminder_InApp,
  employeeLevelUpdate_InApp,
  employeePointUpdate_InApp,
  employeefeedbackPointUpdate_PushNoti,
  employeefeedbackPointUpdate_InApp,
  crtAboutToExpireReminder_InApp,
  startCompetition_InApp,
  endCompetition_InApp,
  customAnnouncement,
  customAnnouncement_InApp,
  customAnnouncement_PushNoti,
  certificateAutoAssign,
  certificateAutoAssign_InApp,
  certificateAutoAssign_PushNoti,
  receiveCertificateReportDigest,
  feedBackReportDigest,
  checkInRequest_InApp,
  checkInRequest_PushNoti,
  birthdayAnnouncement,
  birthdayAnnouncement_InApp,
  birthdayAnnouncement_PushNoti,
  anniversaryAnnouncement,
  anniversaryAnnouncement_InApp,
  anniversaryAnnouncement_PushNoti,
  onboardAnnouncement,
  onboardAnnouncement_InApp,
  onboardAnnouncement_PushNoti,
  birthdayAnnouncement_SMS,
  anniversaryAnnouncement_SMS,
  onboardAnnouncement_SMS,
  customAnnouncement_SMS,
};
