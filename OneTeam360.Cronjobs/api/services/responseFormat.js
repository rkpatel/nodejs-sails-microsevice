const {logger} = require('../services/utils');
const {RESPONSE_STATUS} = require('../utils/constants/enums');

const productionStack=async(data)=>{
  return process.env.NODE_ENV === 'production' ? undefined : data;
};

const productionStatusCodeToSet=async(res,statusCodeToSet,_status,message,data)=>{
  if (process.env.NODE_ENV === 'production') {
    return res.status(statusCodeToSet).json({
      status  : _status,
      message : message,
    });
  }
  else {
    return res.status(statusCodeToSet).json({
      status  : _status,
      message : message,
      data    : data.stack,
    });
  }
};

const dataDetails=async(data,customErrorResponse)=>{
  if (data.details.length !== 0) {
    data.details.forEach(item => {
      customErrorResponse[`${item.context.key}`] = {
        message : item.message,
        context : item.context.label,
        type    : item.type
      };
      return  customErrorResponse;
    });
  }
};

module.exports = {
  response: async (code,res,req,data,message = '',status = '') => {

    if(req && 'dynamic_connection' in req && req.dynamic_connection){
      await req.dynamic_connection.end();
    }

    // Define the status code to send in the response.
    let statusCodeToSet = 500;
    let _status = status;
    if(code) {
      statusCodeToSet=code;
    }

    if (data === undefined) {

      logger(req,{
        code    : statusCodeToSet,
        message : message,
        status  : _status
      });
      return res.status(statusCodeToSet).json({
        status  : _status,
        message : message
      });
    }else if (_.isError(data)) {
      if (data  && data.name === 'ValidationError') {
        _status = RESPONSE_STATUS.error;
        // we had a joi error, let's return a custom 400 json response
        const customErrorResponse = {};
        await dataDetails(data,customErrorResponse);

        logger(req,{
          code    : statusCodeToSet,
          message : 'Validation Error',
          data    : customErrorResponse,
          status  : _status
        } );

        return res.status(statusCodeToSet).json({
          status  : _status,
          message : 'Validation Error',
          data    : customErrorResponse,
        });
      }
      if (!_.isFunction(data.toJSON)) {
        sails.log.error({
          code   : statusCodeToSet,
          data   : data.stack,
          status : _status
        });
        logger(req,{
          code    : statusCodeToSet,
          message : 'Error',
          data    : data.stack,
          status  : _status
        } );
        await productionStatusCodeToSet(res,statusCodeToSet,_status,message,data);
      }
    }
    else {
      if(data.code === 'E_UNIQUE'){
        _status = RESPONSE_STATUS.error;
        statusCodeToSet = 400;
        sails.log.error({
          message : 'Record Already Exist',
          code    : statusCodeToSet,
          data    : data,
          status  : _status
        });
        logger(req,{
          code    : statusCodeToSet,
          status  : _status,
          message : 'Record Already Exist',
          stack   : await productionStack(data)
        });
        return res.status(statusCodeToSet).json({
          status  : _status,
          message : 'Record Already Exist',
          stack   : await productionStack(data)
        });
      }else if(data.code === 'UsageError'){
        _status = RESPONSE_STATUS.error;
        statusCodeToSet = 500;
        sails.log.error({
          status  : _status,
          message : 'Error in Databse query usage',
          code    : statusCodeToSet,
          data    : data
        });
        logger(req,{
          status  : _status,
          code    : statusCodeToSet,
          message : 'Error in Databse query usage',
          stack   : await productionStack(data)
        });
        return res.status(statusCodeToSet).json({
          status  : _status,
          message : 'Error in Databse query usage',
          stack   : await productionStack(data)
        });
      }else if(data.code === 'AdapterError'){
        _status = RESPONSE_STATUS.error;
        statusCodeToSet = 500;
        sails.log.error({
          status  : _status,
          message : 'Error in Connecting with Database',
          code    : statusCodeToSet,
          data    : data
        });
        logger(req,{
          status  : _status,
          code    : statusCodeToSet,
          message : 'Error in Connecting with Database',
          stack   : await productionStack(data)
        });
        return res.status(statusCodeToSet).json({
          status  : _status,
          message : 'Error in Connecting with Database',
          stack   : await productionStack(data)
        });
      }
      _status = status;
      sails.log.info({
        status  : _status,
        code    : statusCodeToSet,
        data    : data,
        message : message
      });
      logger(req,{
        status  : _status,
        code    : statusCodeToSet,
        message : message,
        data    : data
      });
      return res.status(statusCodeToSet).json({
        status  : _status,
        message : message,
        data    : data,
      });
    }
  }
};
