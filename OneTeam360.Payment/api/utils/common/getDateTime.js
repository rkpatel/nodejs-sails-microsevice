const moment = require('moment');
require('moment-timezone');
module.exports = {

  getCurrentDateTime: () => {
    return moment().format('YYYY-MM-DD hh:mm:ss');
  },

  getTimeStampToDate: (date,format) => {
    return moment(date).format(format);
  },
  datetoTimestamp : (strDate) => {    const dt = Date.parse(strDate);    return dt / 1000;  },
  getDate         : (date,format) => {
    let _format = format;
    if(!format){
      _format = process.env.ACCOUNT_DATEFORMAT;
    }
    return moment(date).format(_format);
  },

  getCurrentDate: () => {
    return moment().format('YYYY-MM-DD');
  },

  getDateUTC: () =>{
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  },

  getTomorrowDate: () =>{
    return moment().add(1, 'days').format('YYYY-MM-DD');
  },

  getAutomatedTaskDueDate: (days) =>{
    return moment().add(days, 'days').format('YYYY-MM-DD');
  },
  getYesterdayDate: () =>{
    return moment().subtract(1, 'days').format('YYYY-MM-DD');
  },

  setDateUTC: (convertDate) =>{
    return moment(convertDate).utc().format('YYYY-MM-DD HH:mm:ss');
  },

  getDateTimeSpecificTimeZone: (convertDate, timeZone, dateTimeFormat) =>{
    let timezone; let dateFormat;
    if(typeof (timeZone) === 'undefined' || timeZone === null || timeZone === '')
    {
      timezone = process.env.ACCOUNT_TIMEZONE;
    }
    else{
      timezone = timeZone;
    }
    if(typeof dateTimeFormat === 'undefined' || dateTimeFormat === null || dateTimeFormat === '')
    {
      dateFormat = process.env.ACCOUNT_DATETIMEFORMAT;
    }
    else{
      dateFormat = dateTimeFormat;
    }
    const tempDate = moment(convertDate).format('YYYY-MM-DD HH:mm:ss');
    return moment.utc(tempDate).tz(timezone).format(dateFormat);
  },
  getDateSpecificTimeZone: (convertDate, timeZone, dateFormat) =>{
    let timezone; let _dateFormat;
    if(typeof (timeZone) === 'undefined' || timeZone === null || timeZone === '')
    {
      timezone = process.env.ACCOUNT_TIMEZONE;
    }
    else{
      timezone = timeZone;
    }
    if(typeof (dateFormat) === 'undefined' || dateFormat === null || dateFormat === '')
    {
      _dateFormat = process.env.ACCOUNT_DATEFORMAT;
    }
    else{
      _dateFormat = dateFormat;
    }
    const tempDate = moment(convertDate).format('YYYY-MM-DD HH:mm:ss');
    return moment.utc(tempDate).tz(timezone).format(_dateFormat);
  },
  formatDate: (date,format) => {
    if(format && date) {
      return moment(date).format(format);
    }else{
      return '';
    }
  },
};
