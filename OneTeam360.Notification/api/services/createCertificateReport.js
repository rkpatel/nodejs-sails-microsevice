const XLSX = require('xlsx');
const fs = require('fs');
require('moment');

const { getDateUTC, getDateTimeSpecificTimeZone } = require('../utils/common/getDateTime');
module.exports = {
  createCertificateReport: async function(req){
    let request = req.allParams();
    let curentTimeUTC = getDateUTC();
    let timezone = request.timezone;
    let userId = request.userId;
    let sheet1 = request.sheet1Data;
    let sheet2 = request.sheet2Data;
    let fileName = '';
    fileName = `CertificateReport_${getDateTimeSpecificTimeZone(curentTimeUTC,timezone,'MM-DD-YYYY_HH_mm_ss')}`;
    !fs.existsSync(`${process.cwd()}/assets/images/`) && fs.mkdirSync(`${process.cwd()}/assets/images/`, { recursive: true });
    var expiringSheet = XLSX.utils.json_to_sheet(sheet1);
    var expiredSheet = XLSX.utils.json_to_sheet(sheet2);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, expiringSheet, 'Expiring Certificates');
    XLSX.utils.book_append_sheet(wb, expiredSheet, 'Expired Certificates');
    XLSX.writeFile(wb, `${process.cwd()}/assets/images/`+fileName+'_'+userId+'.xlsx');
    return {filename: fileName+'_'+userId+'.xlsx'};
  }
};

