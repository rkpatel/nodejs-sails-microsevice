const moment = require('moment');
require('moment-timezone');

module.exports = {

  getCurrentDateTime: () => {
    return moment().format('YYYY-MM-DD hh:mm:ss');
  },

  getDateUTC: () =>{
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
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
  }
};
