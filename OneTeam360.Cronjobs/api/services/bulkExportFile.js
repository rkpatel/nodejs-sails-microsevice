const json2xls  = require('json2xls');
const fs = require('fs');
const moment = require('moment');
module.exports = {
  bulkExportFile: async function(attachment, conn){

    const bulkLog = await BulkImportLog.findOne({file_name: attachment}).usingConnection(conn);
    let fileName = ''; let type ='';
    if(bulkLog)
    {
      let successFlag = false;
      const completedRecord = await BulkImportLog.find({
        error_count        : 0,
        bulk_import_log_id : bulkLog.bulk_import_log_id
      }).usingConnection(conn);
      if(completedRecord.length > 0)
      {
        successFlag = true;
      }
      const result = await BulkImportTemp.find({ bulk_import_log_id: bulkLog.bulk_import_log_id }).usingConnection(conn);
      const response = result.map((item)=>{
        if(successFlag === true)
        {
          return {
            'First Name'             : item.first_name,
            'Last Name'              : item.last_name,
            'Email'                  : item.email,
            'Contact Number'         : item.phone,
            'Date Of Birth'          : moment(item.date_of_birth, 'YYYY-MM-DD').format('MM/DD/YYYY') ,
            'Date Of Hire'           : moment(item.date_of_joining,'YYYY-MM-DD').format('MM/DD/YYYY'),
            'Location'               : item.locations,
            'Job Type'               : item.job_types,
            //'Role'                   : item.role,
            'Emergency Contact Name' : item.emergency_contact_name,
            'Relation'               : item.emergency_contact_relation,
            'Phone Number'           : item.emergency_contact_number,
            'Address'                : item.emergency_contact_address,
            'Country'                : item.emergency_contact_country,
            'State'                  : item.emergency_contact_state,
            'City'                   : item.emergency_contact_city,
            'Zip'                    : item.emergency_contact_zip,
            'ID'                     : item.team_member_id,
          };
        }
        else{
          return {
            'First Name'             : item.first_name,
            'Last Name'              : item.last_name,
            'Email'                  : item.email,
            'Contact Number'         : item.phone,
            'Date Of Birth'          : moment(item.date_of_birth, 'YYYY-MM-DD').format('MM/DD/YYYY') ,
            'Date Of Hire'           : moment(item.date_of_joining,'YYYY-MM-DD').format('MM/DD/YYYY'),
            'Location'               : item.locations,
            'Job Type'               : item.job_types,
            //'Role'                   : item.role,
            'Emergency Contact Name' : item.emergency_contact_name,
            'Relation'               : item.emergency_contact_relation,
            'Phone Number'           : item.emergency_contact_number,
            'Address'                : item.emergency_contact_address,
            'Country'                : item.emergency_contact_country,
            'State'                  : item.emergency_contact_state,
            'City'                   : item.emergency_contact_city,
            'Zip'                    : item.emergency_contact_zip,
            'ID'                     : item.team_member_id,
            'Error Message'          : item.error_log,
          };
        }

      });
      if(response.length> 0)
      {
        var xls = json2xls(response);
        !fs.existsSync(`${process.cwd()}/assets/images/`) && fs.mkdirSync(`${process.cwd()}/assets/images/`, { recursive: true });
        await fs.writeFileSync(`${process.cwd()}/assets/images/OUTPUT-${bulkLog.uploaded_file_name}`, xls, 'binary', (err) => {
          if (err) {
            sails.log('writeFileSync :', err);
          }
        });

        fileName= `OUTPUT-${bulkLog.uploaded_file_name}`;
        type= 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
    }
    return { fileName, type };
  }
};

