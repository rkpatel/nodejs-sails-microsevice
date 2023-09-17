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

  getDateTimezone: (timezone) => {
    return moment().utc(this.getDateUTC).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  },

  getAutomatedTaskDueDate: (days) =>{
    return moment().add(days, 'days').format('YYYY-MM-DD');
  },

  getScheduledTaskEndDate: (days) =>{
    return moment().add(days, 'days').format('YYYY-MM-DD');
  },
  getDateUTC: () =>{
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  },

  getTomorrowDate: () =>{
    return moment().add(1, 'days').format('YYYY-MM-DD');
  },

  getTomorrowTimezoneDate: (timezone) =>{
    return moment().utc(this.getDateUTC).tz(timezone).add(1, 'days').format('YYYY-MM-DD');
  },

  getBetweenDate: (startDate, endDate, day) =>{
    let end_date = moment(endDate).format('YYYY-MM-DD');
    let next_date = moment(startDate).add(day, 'days').format('YYYY-MM-DD');
    let dates = [];
    while (next_date <= end_date) {
      dates.push(next_date);
      next_date = moment(next_date).add(day, 'days').format('YYYY-MM-DD');
    }
    return dates;
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