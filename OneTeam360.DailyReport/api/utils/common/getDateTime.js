const moment = require('moment');
require('moment-timezone');
module.exports = {

  getCurrentDateTime: () => {
    return moment().format('YYYY-MM-DD hh:mm:ss');
  },

  getDate: (date,format) => {
    let _format = format;
    if(!format){
      _format = process.env.ACCOUNT_DATEFORMAT;
    }
    return moment(date).format(_format);
  },

  getCurrentDate: () => {
    return moment().format('YYYY-MM-DD');
  },

  getCurrentTimezoneDate: (timezone) => {
    return moment().tz(timezone).format('YYYY-MM-DD');
  },

  getDateUTC: () =>{
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  },

  getTomorrowDate: () =>{
    return moment().add(1, 'days').format('YYYY-MM-DD');
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
  convertDateUTC: (date,fromTimeZone,toTimeZone,format) =>{
    return moment.tz(date,fromTimeZone).tz(toTimeZone).format(format);
  },
  formatDate: (date,format) => {
    if(format && date) {
      return moment(date).format(format);
    }else{
      return '';
    }
  },
  checkTodaysDate: async (date1,date2) => {
    // date 1 and date 2 will be a  string with same date format
    return date1===date2 ? true : false;
  }
};
