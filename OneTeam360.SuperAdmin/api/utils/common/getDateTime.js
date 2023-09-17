const moment = require('moment');
require('moment-timezone');
module.exports = {

  getCurrentDateTime: () => {
    return moment().format('YYYY-MM-DD hh:mm:ss');
  },

  getDateUTC: () =>{
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
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
  }
};
