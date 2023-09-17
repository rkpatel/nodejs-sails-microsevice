const moment = require('moment');

module.exports = {

  getCurrentDateTime: () => {
    return moment().format('YYYY-MM-DD hh:mm:ss');
  },

  getDateUTC: () =>{
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  },
  formatDate: (date,format) => {
    if(format && date) {
      return moment(date).format(format);
    }else{
      return '';
    }
  },
};
