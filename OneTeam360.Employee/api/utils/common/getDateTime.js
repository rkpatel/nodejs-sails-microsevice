const moment = require('moment');
require('moment-timezone');

module.exports = {

  formatDate: (date,format) => {
    if(format && date) {
      return moment(date).format(format);
    }else{
      return '';
    }
  },
  getDayName: (date,timezone,format) => {
    const tempDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
    return moment.utc(tempDate).tz(timezone).format(format);
  },
  getDateNumber: (date,timezone,format) => {
    const tempDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
    return moment.utc(tempDate).tz(timezone).format(format);
  },
  getDateNumber: (date,timezone,format) => {
    const tempDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
    const dayName = moment.utc(tempDate).tz(timezone).format(format);
    return dayName;
  },
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
  getLastNDays: (n) => {
    return moment().subtract(n,'days').format('YYYY-MM-DD');
  },


  getNextNDaysUTC: (n) => {
    return moment().add(n,'days').utc().format('YYYY-MM-DD');
  },

  getDateUTC: () =>{
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  },

  getDateUTCFormat: (format) =>{
    return moment().utc().format(format);
  },

  convertDateUTC: (date,fromTimeZone,toTimeZone,format) =>{
    return moment.tz(date,fromTimeZone).tz(toTimeZone).format(format);
  },

  getBeforeOneYearDateUTC: () =>{
    return moment().subtract(1, 'year').utc().format('YYYY-MM-DD HH:mm:ss');
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
    if(typeof (dateTimeFormat) === 'undefined' || dateTimeFormat === null || dateTimeFormat === '')
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
  }
};
