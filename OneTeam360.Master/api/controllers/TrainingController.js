
/***************************************************************************

  Controller     : Training Category

  **************************************************
  Functions
  **************************************************

  add
  edit
  delete
  find
  findById
  **************************************************

***************************************************************************/

const messages = sails.config.globals.messages;
const TrainingValidations = require('../validations/TrainingValidations');
const { getDateUTC, getDateSpecificTimeZone } = require('../utils/common/getDateTime');
const { setCache, deleteCache, keyExists } = require('../utils/common/redisCacheExtension');
const {  RESPONSE_STATUS, ACCOUNT_STATUS, MASTERINFO_STATUS, ACCOUNT_CONFIG_CODE, TRAINING_VIDEO_TYPE } = require('../utils/constants/enums');
const { copyImageFromTempToOri, deleteReference } = require('../services/azureStorage');
const { escapeSqlSearch } = require('../services/utils');

const sql = `Select training.training_id, training.status, training.name, training.description, training_category.name as training_category, training.last_updated_date, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = training.created_by) as created_by, (select CONCAT(y.first_name, " ", y.last_name) AS name FROM ${process.env.DB_NAME}.user y WHERE y.user_id = training.last_updated_by) as last_updated_by, training.created_date,
(select  GROUP_CONCAT( JT.name SEPARATOR "," ) FROM job_type JT, training_job_type WHERE JT.job_type_id =  training_job_type.job_type_id AND training.training_id = training_job_type.training_id) as job_type
from training join training_category ON training.training_category_id = training_category.training_category_id  ORDER BY training.created_date DESC`;

const photosCountQuery = `SELECT account_configuration_detail.value from account_configuration JOIN account_configuration_detail ON account_configuration.account_configuration_id = account_configuration_detail.account_configuration_id WHERE account_configuration.account_id = $1 AND account_configuration_detail.code = $2`;

const tmpUploadDirOnAzureForTraining = process.env.TMP_IMG_UPLOAD_DIR_ON_AZURE_FOR_TRAINING;
const uploadDirOnAzureForTraining = process.env.IMG_UPLOAD_DIR_ON_AZURE_FOR_TRAINING;

const getImgUrl = function (imgUrlArr, account, trainingId) {
  let mainUrl = `${process.env.PROFILE_PIC_CDN_URL}/${account.account_guid}/${uploadDirOnAzureForTraining}/${trainingId}`;
  const respImgArr = {
    image_url: `${mainUrl}/${imgUrlArr}`,
  };
  return { respImgArr, allUrl: imgUrlArr};
};


// eslint-disable-next-line no-unused-vars
const getTrainingCache = async function (req) {
  const accountDetail = req.account;
  const getKey =`${accountDetail.account_guid}_${MASTERINFO_STATUS.training}`;
  let trainingKeyExists = await keyExists(getKey);
  if(trainingKeyExists === 1)
  {
    await deleteCache(getKey);
  }
  const rawResult = await sails.sendNativeQuery(sql).usingConnection(req.dynamic_connection);
  let results = rawResult.rows;
  const data = {
    'key'   : getKey,
    'value' : results
  };
  await setCache(data);
  return results.map((item)=>({
    training_id       : item.training_id,
    name              : item.name,
    description       : (item.description) ? (item.description) : '',
    status            : item.status,
    job_type          : item.job_type,
    training_category : item.training_category,
    created_by        : (item.created_by) ? (item.created_by) : '',
    created_date      : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by   : (item.last_updated_by) ? (item.last_updated_by) : '',
    last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
  }));
};

const trainingDatas=async(results,req,createdBy,photos,explanation,job_type_id,videos)=>{
  let lastUpdatedBy= '';
  if(results.last_updated_by)
  {
    lastUpdatedBy = await Users.findOne({user_id: results.last_updated_by});
  }
  return {
    training_id          : results.training_id,
    name                 : results.name,
    description          : (results.description) ? (results.description) : '',
    status               : results.status,
    training_category_id : results.training_category_id,
    job_type             : job_type_id,
    explanation          : (explanation.length > 0) ?  explanation[0] : null,
    photos               : photos,
    videos               : videos,
    created_by           : (createdBy.first_name+' '+createdBy.last_name),
    created_date         : (results.created_date) ? getDateSpecificTimeZone(results.created_date, req.timezone, req.dateFormat) : '',
    last_updated_by      : lastUpdatedBy ? (lastUpdatedBy.first_name+' '+lastUpdatedBy.last_name) : '',
    last_updated_date    : (results.last_updated_date) ? getDateSpecificTimeZone(results.last_updated_date, req.timezone, req.dateFormat) : '',
  };
};

const trainingKeyExistsData=async(trainingKeyExists,getKey)=>{
  if (trainingKeyExists) {
    return deleteCache(getKey);
  }
};

const jobTypeArrData=async(jobType_arr,req)=>{
  if (jobType_arr.length > 0) {
    return TrainingJobType.createEach(jobType_arr).usingConnection(req.dynamic_connection);
  }
};

const resourceTypeDatas=async(resource_type)=>{
  return resource_type ? resource_type : 'PDF';
};

const locationPathDatas=async(location_path)=>{
  return location_path ? location_path : '';
};

const CompletionData=async(explanation,removed_resource_id,req)=>{
  if(((explanation === '') || (explanation === undefined)) && (removed_resource_id))
  {
    const resourceId = await TrainingResource.findOne({
      training_resource_id: removed_resource_id
    }).usingConnection(req.dynamic_connection);
    return Resource.update({ resource_id: resourceId.resource_id },
              {
                resource_type : 'PDF',
                location_path : ''
              }).usingConnection(req.dynamic_connection);
  }
};

module.exports = {
  add: async (req, res) => {
    let request = req.allParams();
    const isValid = await TrainingValidations.add.validate(request);
    if (!isValid.error) {
      const { name, description, training_category_id, job_type_id, explanation } = request;
      const trainingDetails = await Training.findOne({name}).usingConnection(req.dynamic_connection);
      if(!trainingDetails){
        const accountDetail = req.account;
        const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingGrouping}`;
        let trainingKeyExists = await keyExists(getKey);
        if (trainingKeyExists) {
          await deleteCache(getKey);
        }
        const result = await Training.create({
          name,
          description,
          training_category_id,
          job_type_id,
          explanation,
          status          : ACCOUNT_STATUS.active,
          created_by      : req.user.user_id,
          created_date    : getDateUTC(),
          last_updated_by : null
        }).fetch().usingConnection(req.dynamic_connection);
        const jobType_arr = job_type_id.map((jobType) => {
          return {
            training_id  : result.training_id,
            job_type_id  : jobType,
            created_by   : req.user.user_id,
            created_date : getDateUTC()
          };
        });
        let resource_type;
        let location_path;
        if (jobType_arr.length > 0) { await TrainingJobType.createEach(jobType_arr).usingConnection(req.dynamic_connection); }
        if((explanation !== '') && (explanation !== undefined))
        {
          const account = req.account;
          const trainingImg = getImgUrl(explanation, account, result.training_id);
          resource_type = (trainingImg.allUrl).split('.')[1];
          location_path = trainingImg.respImgArr.image_url;
          // Move images to respective training directory on azure
          await copyImageFromTempToOri(trainingImg.allUrl, account.account_guid, result.training_id, tmpUploadDirOnAzureForTraining);
        }
        const resource = await Resource.create({
          resource_type : await resourceTypeDatas(resource_type),
          location_path : await locationPathDatas(location_path),
          status        : ACCOUNT_STATUS.active,
          source        : null,
          created_by    : req.user.user_id,
          created_date  : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        await TrainingResource.create({
          resource_id  : resource.resource_id,
          training_id  : result.training_id,
          created_by   : req.user.user_id,
          created_date : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);
        return res.ok({
          training_id: result.training_id
        }, messages.TRAINING_ADD_SUCCESS,RESPONSE_STATUS.success);
      }else{
        return res.ok(undefined, messages.TRAINING_ALREADY_EXISTS,RESPONSE_STATUS.warning);
      }
    } else {
      return res.ok(isValid.error, messages.TRAINING_ADD_FAIL,RESPONSE_STATUS.error);
    }
  },

  find: async (req, res) =>{
    let results;
    const rawResult = await sails.sendNativeQuery(escapeSqlSearch(sql)).usingConnection(req.dynamic_connection);
    results = rawResult.rows;
    const trainingDetails = results.map((item)=>({
      training_id       : item.training_id,
      name              : item.name,
      description       : (item.description) ? (item.description) : '',
      status            : item.status,
      job_type          : (item.job_type) ? (item.job_type).split(',') : '',
      training_category : item.training_category,
      created_by        : (item.created_by) ? (item.created_by) : '',
      created_date      : (item.created_date) ? getDateSpecificTimeZone(item.created_date, req.timezone, req.dateFormat) : '',
      last_updated_by   : (item.last_updated_by) ? (item.last_updated_by) : '',
      last_updated_date : (item.last_updated_date) ? getDateSpecificTimeZone(item.last_updated_date, req.timezone, req.dateFormat) : '',
    }));
    let data = {
      totalCount : trainingDetails.length,
      results    : trainingDetails
    };
    if(trainingDetails.length > 0){
      return res.ok(data, messages.GET_RECORD, RESPONSE_STATUS.success);
    }else{
      return res.ok(trainingDetails, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
    }
  },

  findById: async function (req, res) {
    try{
      const training_id = parseInt(req.params.id);
      const results = await Training.findOne({ training_id }).usingConnection(req.dynamic_connection);
      if(results)
      {
        const job_type_id = await TrainingJobType.find({ training_id }).usingConnection(req.dynamic_connection);
        const referenceSql = `SELECT training_resource.training_resource_id, training_resource.training_id, resource.title, resource.sequence, resource.description,location_path,resource.source, resource.resource_type from training_resource join resource ON training_resource.resource_id = resource.resource_id where training_resource.training_id = ${results.training_id} ORDER BY resource.sequence ASC`;
        const referenceResult = await sails.sendNativeQuery(referenceSql).usingConnection(req.dynamic_connection);
        const referenceresponse = referenceResult.rows;
        sails.log(referenceresponse);
        const explanation = await referenceresponse.filter(data => data.resource_type === 'PDF');
        const photos = await referenceresponse.filter(data => data.resource_type === 'JPG' ||  data.resource_type === 'PNG');
        let videos = await referenceresponse.filter(data => data.resource_type === 'MP4');
        for(const item of videos){
          let typeReference;
          if((item.resource_type === 'MP4') && (item.source !== null))
          {
            typeReference =  TRAINING_VIDEO_TYPE.training_type_link;
          }
          else{
            typeReference =  TRAINING_VIDEO_TYPE.training_type_upload;
          }
          Object.assign(item,{type: typeReference } );
        }
        const createdBy = await Users.findOne({user_id: results.created_by});

        let trainingList =await trainingDatas(results,req,createdBy,photos,explanation,job_type_id,videos);
        return res.ok(trainingList, messages.GET_RECORD, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND, RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.GET_FAILURE, RESPONSE_STATUS.error);
    }
  },

  updateStatus: async (req, res) => {
    const isValidate = TrainingValidations.updateStatus.validate(req.allParams());
    if (!isValidate.error) {
      const trainingId = req.params.id;
      const { status } = req.allParams();
      let resMessage;
      if(status === ACCOUNT_STATUS.active)
      {
        resMessage = messages.TRAINING_ACTIVATE_SUCEESS;
      }
      else
      {
        resMessage = messages.TRAINING_INACTIVATE_SUCEESS;
      }
      await Training.update({ training_id: trainingId },{
        status,
        last_updated_by   : req.user.user_id,
        last_updated_date : getDateUTC()
      }).usingConnection(req.dynamic_connection);
      return res.ok(undefined, resMessage, RESPONSE_STATUS.success);
    } else {
      return res.ok(isValidate.error, messages.TRAINING_ACTIVATE_FAIL,RESPONSE_STATUS.error);
    }
  },

  addPhotoReference: async (req, res) => {
    try{
      let request = req.allParams();
      const isValid = await TrainingValidations.addPhoto.validate(request);
      if (!isValid.error) {
        let trainingId = request.training_id;
        let resMessage;
        let trainingResource;
        let resource;
        let trainingPhoto;
        let extensionName1;
        const { images, title, description, sequence, removed_resource_id, training_resource_id } = request;
        const account = req.account;
        if((training_resource_id === '') || (training_resource_id === undefined))
        {
          const countsql = `SELECT training_resource.training_resource_id, training_resource.training_id, resource.title, resource.sequence, resource.description,location_path, resource.resource_type from training_resource join resource ON training_resource.resource_id = resource.resource_id where training_resource.training_id = ${trainingId} AND resource.resource_type IN ('JPG', 'PNG')`;
          const rawResult = await sails.sendNativeQuery(countsql).usingConnection(req.dynamic_connection);
          let results = rawResult.rows;
          const photosCountResult = await sails.sendNativeQuery(photosCountQuery, [parseInt(req.account.account_id), ACCOUNT_CONFIG_CODE.training_master_photos_count]);
          let allowedPhotoCount = photosCountResult.rows[0];
          let trainingImg;
          if((results.length) >= allowedPhotoCount.value)
          {
            const respMessage = messages.TRAINING_PHOTO_COUNT_EXCEED.replace(/STR_TO_BE_REPLACE/, allowedPhotoCount.value);
            return res.ok(undefined, respMessage,RESPONSE_STATUS.error);
          }
          else{
            if((images !== '') && (images !== undefined)){
              trainingImg = getImgUrl(images, account, trainingId);
              // Move images to respective training directory on azure
              await copyImageFromTempToOri(trainingImg.allUrl, account.account_guid, trainingId, tmpUploadDirOnAzureForTraining);
              extensionName1 = (trainingImg.allUrl).split('.');
            }
            resource = await Resource.create({
              title         : (title) ? (title) : '',
              description   : (description) ? (description) : '',
              resource_type : (extensionName1 && extensionName1[1].toString().toLowerCase() !== 'jpeg') ? extensionName1[1] : 'JPG',
              sequence      : (sequence) ? (sequence) : 0,
              source        : null,
              location_path : (trainingImg) ? (trainingImg.respImgArr.image_url) : '',
              status        : ACCOUNT_STATUS.active,
              created_by    : req.user.user_id,
              created_date  : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
            trainingResource = await TrainingResource.create({
              resource_id  : resource.resource_id,
              training_id  : trainingId,
              created_by   : req.user.user_id,
              created_date : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
            trainingPhoto = {
              training_resource_id : trainingResource.training_resource_id,
              training_id          : resource.training_id,
              title                : resource.title,
              description          : resource.description,
              location_path        : resource.location_path,
              sequence             : resource.sequence
            };
            resMessage = messages.PHOTO_ADD_SUCCESS;
          }
        }
        else{
          if((images !== '') && (images !== undefined)){
            const resourceId = await TrainingResource.findOne({
              training_resource_id
            }).usingConnection(req.dynamic_connection);
            if(removed_resource_id)
            {
              await Resource.update({ resource_id: resourceId.resource_id },
                {
                  resource_type : 'JPG',
                  location_path : ''
                }).usingConnection(req.dynamic_connection);
            }
            if((images !== '') && (images !== undefined)){
              let  trainingImg = getImgUrl(images, account, trainingId);
              // Move images to respective training directory on azure
              await copyImageFromTempToOri(trainingImg.allUrl, account.account_guid, trainingId, tmpUploadDirOnAzureForTraining);
              extensionName1 = (trainingImg.allUrl).split('.');
            }
            resource = await Resource.update({resource_id: resourceId.resource_id},{
              title         : (title) ? (title) : '',
              description   : (description) ? (description) : '',
              resource_type : (extensionName1 && extensionName1[1].toString().toLowerCase() !== 'jpeg') ? extensionName1[1] : 'JPG',
              sequence      : (sequence) ? (sequence) : 0,
              location_path : (trainingImg) ? (trainingImg.respImgArr.image_url) : '',
            }).fetch().usingConnection(req.dynamic_connection);
            trainingPhoto = {
              training_resource_id : training_resource_id,
              training_id          : resourceId.training_id,
              title                : resource[0].title,
              description          : resource[0].description,
              location_path        : resource[0].location_path,
              sequence             : resource[0].sequence
            };
          }
          else if(((images === '') || (images === undefined)) && (removed_resource_id)){
            const resourceId = await TrainingResource.findOne({
              training_resource_id: removed_resource_id
            }).usingConnection(req.dynamic_connection);
            await Resource.update({ resource_id: resourceId.resource_id },
                {
                  resource_type : 'JPG',
                  location_path : ''
                }).usingConnection(req.dynamic_connection);
          }
          else if(((images === '') || images === undefined) && (removed_resource_id === undefined) )
          {
            const resourceId = await TrainingResource.findOne({
              training_resource_id
            }).usingConnection(req.dynamic_connection);
            const resource1 = await Resource.update({resource_id: resourceId.resource_id},{
              title       : (title) ? (title) : '',
              description : (description) ? (description) : '',
              sequence    : (sequence) ? (sequence) : 0,
            }).fetch().usingConnection(req.dynamic_connection);
            trainingPhoto = {
              training_resource_id : training_resource_id,
              training_id          : resourceId.training_id,
              title                : resource1[0].title,
              description          : resource1[0].description,
              location_path        : resource1[0].location_path,
              sequence             : resource1[0].sequence
            };
          }
          resMessage = messages.PHOTO_UPDATE_SUCCESS;
        }

        await Training.update({ training_id: trainingId }, {
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        return res.ok(trainingPhoto, resMessage, RESPONSE_STATUS.success);
      }
      else{
        return res.ok(isValid.error, messages.TRAINING_UPDATE_ERROR, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.error, RESPONSE_STATUS.error);
    }
  },

  addVideoReference: async (req, res) => {
    try{
      let request = req.allParams();
      const isValid = await TrainingValidations.addVideo.validate(request);
      if (!isValid.error) {
        let trainingId = request.training_id;
        let resMessage;
        const { training_id, type, video, source, link, title, description, sequence,removed_resource_id, training_resource_id } = request;
        const account = req.account;
        let resource;
        let trainingResource;
        let trainingVideoList;
        let extensionName;
        let locationPath;
        let sourceFile;
        if((training_resource_id === '') || (training_resource_id === undefined))
        {
          const countSql = `SELECT training_resource.training_resource_id, training_resource.training_id, resource.sequence, resource.title, resource.description,location_path,resource.source, resource.resource_type from training_resource join resource ON training_resource.resource_id = resource.resource_id where training_resource.training_id = ${trainingId} AND resource.resource_type IN ('MP4') `;
          const rawResult = await sails.sendNativeQuery(countSql).usingConnection(req.dynamic_connection);
          let  results = rawResult.rows;

          const photosCountResult = await sails.sendNativeQuery(photosCountQuery, [parseInt(req.account.account_id), ACCOUNT_CONFIG_CODE.training_master_video_count]);
          let  allowedPhotoCount = photosCountResult.rows[0];
          if((results.length) >= allowedPhotoCount.value)
          {
            const respMessage = messages.TRAINING_VIDEO_COUNT_EXCEED.replace(/STR_TO_BE_REPLACE/, allowedPhotoCount.value);
            return res.ok(undefined, respMessage,RESPONSE_STATUS.error);
          }
          else{
            if(type === TRAINING_VIDEO_TYPE.training_type_upload)
            {
              const validVideo = await TrainingValidations.uploadVideo.validate({video: request.video});
              if(!validVideo.error)
              {
                const trainingImg = getImgUrl(video, account, trainingId);
                // Move images to respective training directory on azure
                await copyImageFromTempToOri(trainingImg.allUrl, account.account_guid, trainingId, tmpUploadDirOnAzureForTraining);
                extensionName = (trainingImg.allUrl).split('.')[1];
                locationPath = trainingImg.respImgArr.image_url;
              }
              else{
                return res.ok(validVideo.error, messages.error, RESPONSE_STATUS.error);
              }
            }
            else if(type === TRAINING_VIDEO_TYPE.training_type_link)
            {
              const validVideo = await TrainingValidations.linkVideo.validate({source: request.source, link: request.link});
              if(!validVideo.error)
              {
                extensionName = 'MP4';
                locationPath = link;
                sourceFile = request.source;
              }
              else{
                return res.ok(validVideo.error, messages.error, RESPONSE_STATUS.error);
              }
            }
            resource = await Resource.create({
              title,
              description,
              source        : sourceFile,
              resource_type : extensionName,
              sequence      : (sequence) ? (sequence) : 0,
              location_path : locationPath,
              status        : ACCOUNT_STATUS.active,
              created_by    : req.user.user_id,
              created_date  : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
            trainingResource = await TrainingResource.create({
              resource_id  : resource.resource_id,
              training_id  : trainingId,
              created_by   : req.user.user_id,
              created_date : getDateUTC()
            }).fetch().usingConnection(req.dynamic_connection);
            let typeReference;
            if(resource.resource_type === 'MP4' && (resource.source !== null))
            {
              typeReference =  TRAINING_VIDEO_TYPE.training_type_link;
            }
            else{
              typeReference =  TRAINING_VIDEO_TYPE.training_type_upload;
            }
            trainingVideoList = {
              training_resource_id : trainingResource.training_resource_id,
              training_id          : training_id,
              title                : resource.title,
              source               : (resource.source) ? (resource.source):'',
              type                 : typeReference,
              description          : resource.description,
              location_path        : resource.location_path,
              sequence             : resource.sequence
            };
            resMessage = messages.VIDEO_ADD_SUCCESS;
          }
        }
        else{
          if(type === TRAINING_VIDEO_TYPE.training_type_upload)
          {
            if((video === '') || (video === undefined) && (removed_resource_id))
            {
              const resourceId = await TrainingResource.findOne({
                training_resource_id
              }).usingConnection(req.dynamic_connection);
              await Resource.update({ resource_id: resourceId.resource_id },
                  {
                    resource_type : 'MP4',
                    location_path : ''
                  }).usingConnection(req.dynamic_connection);
            }
            else if((video === '') || (video === undefined) && (removed_resource_id === undefined))
            {
              const resourceId = await TrainingResource.findOne({
                training_resource_id
              }).usingConnection(req.dynamic_connection);
              const resource2 = await Resource.update({resource_id: resourceId.resource_id},{
                title       : (title) ? (title) : '',
                source,
                description : (description) ? (description) : '',
                sequence    : (sequence) ? (sequence) : 0,
              }).fetch().usingConnection(req.dynamic_connection);
              let typeReference;
              if(resource2[0].resource_type === 'MP4' && (resource2[0].source !== null))
              {
                typeReference =  TRAINING_VIDEO_TYPE.training_type_link;
              }
              else{
                typeReference =  TRAINING_VIDEO_TYPE.training_type_upload;
              }
              trainingVideoList = {
                training_resource_id : training_resource_id,
                training_id          : training_id,
                title                : resource2[0].title,
                source               : (resource2[0].source) ? (resource2[0].source):'',
                description          : resource2[0].description,
                location_path        : resource2[0].location_path,
                sequence             : resource2[0].sequence,
                type                 : typeReference
              };
            }
            else if((video !== '') && (video !== undefined))
            {
              const validVideo = await TrainingValidations.uploadVideo.validate({video: request.video});
              if(!validVideo.error)
              {
                const trainingImg = getImgUrl(video, account, trainingId);
                // Move images to respective training directory on azure
                await copyImageFromTempToOri(trainingImg.allUrl, account.account_guid, trainingId, tmpUploadDirOnAzureForTraining);
                extensionName = (trainingImg.allUrl).split('.')[1];
                locationPath = trainingImg.respImgArr.image_url;
              }
              else{
                return res.ok(validVideo.error, messages.error, RESPONSE_STATUS.error);
              }
              const resourceId = await TrainingResource.findOne({
                training_resource_id
              }).usingConnection(req.dynamic_connection);
              if(removed_resource_id)
              {
                await Resource.update({ resource_id: resourceId.resource_id },
                    {
                      resource_type : 'MP4',
                      location_path : '',
                      source        : null,
                    }).usingConnection(req.dynamic_connection);
              }
              resource = await Resource.update({resource_id: resourceId.resource_id},{
                title,
                description,
                source        : null,
                resource_type : extensionName,
                sequence      : (sequence) ? (sequence) : 0,
                location_path : locationPath,
              }).fetch().usingConnection(req.dynamic_connection);
              let typeReference;
              if(resource[0].resource_type === 'MP4' && (resource[0].source !== null))
              {
                typeReference =  TRAINING_VIDEO_TYPE.training_type_link;
              }
              else{
                typeReference =  TRAINING_VIDEO_TYPE.training_type_upload;
              }
              trainingVideoList = {
                training_resource_id : training_resource_id,
                training_id          : resourceId.training_id,
                title                : resource[0].title,
                source               : (resource[0].source) ? (resource[0].source):'',
                description          : resource[0].description,
                location_path        : resource[0].location_path,
                sequence             : resource[0].sequence,
                type                 : typeReference
              };
            }
          }
          else if(type === TRAINING_VIDEO_TYPE.training_type_link)
          {
            const validVideo = await TrainingValidations.linkVideo.validate({source: request.source, link: request.link});
            if(!validVideo.error)
            {
              locationPath = link;
              sourceFile = request.source;
            }
            else{
              return res.ok(validVideo.error, messages.error, RESPONSE_STATUS.error);
            }
            const resourceId = await TrainingResource.findOne({
              training_resource_id: training_resource_id
            }).usingConnection(req.dynamic_connection);
            const resource3 = await Resource.update({resource_id: resourceId.resource_id},{
              title         : (title) ? (title) : '',
              source        : sourceFile,
              description   : (description) ? (description) : '',
              sequence      : (sequence) ? (sequence) : 0,
              location_path : (locationPath)
            }).fetch().usingConnection(req.dynamic_connection);
            let typeReference;
            if(resource3[0].resource_type === 'MP4' && (resource3[0].source !== null))
            {
              typeReference =  TRAINING_VIDEO_TYPE.training_type_link;
            }
            else{
              typeReference =  TRAINING_VIDEO_TYPE.training_type_upload;
            }
            trainingVideoList = {
              training_resource_id : training_resource_id,
              training_id          : training_id,
              title                : resource3[0].title,
              source               : (resource3[0].source) ? (resource3[0].source):'',
              description          : resource3[0].description,
              location_path        : resource3[0].location_path,
              sequence             : resource3[0].sequence,
              type                 : typeReference
            };
          }
          resMessage = messages.VIDEO_UPDATE_SUCCESS;
        }

        await Training.update({ training_id: training_id }, {
          last_updated_by   : req.user.user_id,
          last_updated_date : getDateUTC()
        }).fetch().usingConnection(req.dynamic_connection);

        return res.ok(trainingVideoList, resMessage ,RESPONSE_STATUS.success);

      }
      else{
        return res.ok(isValid.error, messages.error, RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.error, RESPONSE_STATUS.error);
    }
  },

  getEmployeeTraining: async (req, res) => {
    try{
      const training_employee_id = req.params.id;
      let results= await TrainingEmployee.findOne({ training_employee_id }).usingConnection(req.dynamic_connection);
      sails.log(results);
      if(results)
      {
        const training = await Training.findOne({training_id: results.training_id }).usingConnection(req.dynamic_connection);
        const trainingCategory = await TrainingCategory.findOne({training_category_id: training.training_category_id }).usingConnection(req.dynamic_connection);
        const jobType = (results.job_type_id !== null) ? await JobType.findOne({job_type_id: results.job_type_id }).usingConnection(req.dynamic_connection) : { name: ''};
        const referenceSql = `SELECT training_resource.training_resource_id, training_resource.training_id, resource.title, resource.source, resource.sequence, resource.description,location_path, resource.resource_type from training_resource join resource ON training_resource.resource_id = resource.resource_id where training_resource.training_id = ${results.training_id}  ORDER BY resource.sequence ASC`;
        const referenceResult = await sails.sendNativeQuery(referenceSql).usingConnection(req.dynamic_connection);
        const referenceresponse = referenceResult.rows;
        const explanation = await referenceresponse.filter(data => data.resource_type === 'PDF');
        const photos = await referenceresponse.filter(data => data.resource_type === 'JPG' ||  data.resource_type === 'PNG');
        const videos = await referenceresponse.filter(data => data.resource_type === 'MP4');
        let employeeTrainingData = {
          training_id            : results.training_id,
          training_name          : training.name,
          grade_id               : results.grade_id,
          notes                  : results.notes,
          training_category_id   : training.training_category_id,
          training_category_name : trainingCategory.name,
          description            : (training.description) ? (training.description) : '',
          job_type_id            : (results.job_type_id !== null) ? (results.job_type_id) : '',
          job_type_name          : jobType.name,
          explanation            : (explanation.length > 0) ? (explanation[0]) : {},
          videos                 : videos,
          photos                 : photos
        };
        return res.ok(employeeTrainingData, messages.GET_RECORD ,RESPONSE_STATUS.success);
      }
      else{
        return res.ok(undefined, messages.DATA_NOT_FOUND,RESPONSE_STATUS.success);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.error, RESPONSE_STATUS.error);
    }
  },

  edit: async (req, res) => {
    try{
      let request = req.allParams();
      const isValid = await TrainingValidations.edit.validate(request);
      if (!isValid.error) {
        const { name, description, training_category_id, job_type_id, explanation, removed_resource_id, training_resource_id } = request;
        const training = await Training.findOne({
          name,
          training_id: { '!=': req.params.id }
        }).usingConnection(req.dynamic_connection);
        if (training) {
          return res.ok(undefined, messages.TRAINING_ALREADY_EXISTS, RESPONSE_STATUS.warning);
        }
        else{
          const accountDetail = req.account;
          const getKey = `${accountDetail.account_guid}_${MASTERINFO_STATUS.trainingGrouping}`;
          let  trainingKeyExists = await keyExists(getKey);
          await trainingKeyExistsData(trainingKeyExists,getKey);
          await Training.update({ training_id: req.params.id }, {
            name,
            description,
            training_category_id,
            last_updated_by   : req.user.user_id,
            last_updated_date : getDateUTC()
          }).fetch().usingConnection(req.dynamic_connection);

          await TrainingJobType.destroy({ training_id: req.params.id }).usingConnection(req.dynamic_connection);

          const jobType_arr = job_type_id.map((jobType) => {
            return {
              training_id  : req.params.id,
              job_type_id  : jobType,
              created_by   : req.user.user_id,
              created_date : getDateUTC()
            };
          });
          await jobTypeArrData(jobType_arr,req);
          let resource_type;
          let location_path;
          if((explanation !== '') && (explanation !== undefined))
          {
            const resourceId = await TrainingResource.findOne({
              training_resource_id
            }).usingConnection(req.dynamic_connection);
            if(removed_resource_id)
            {
              await Resource.update({ resource_id: resourceId.resource_id },
                {
                  resource_type : 'PDF',
                  location_path : ''
                }).usingConnection(req.dynamic_connection);
            }
            const account = req.account;
            const trainingImg = getImgUrl(explanation, account, req.params.id);
            resource_type = (trainingImg.allUrl).split('.')[1];
            location_path = trainingImg.respImgArr.image_url;
            // Move images to respective training directory on azure
            await copyImageFromTempToOri(trainingImg.allUrl, account.account_guid, req.params.id, tmpUploadDirOnAzureForTraining);
            await Resource.update({resource_id: resourceId.resource_id},
              {
                resource_type : await resourceTypeDatas(resource_type),
                location_path : await locationPathDatas(location_path)
              }).fetch().usingConnection(req.dynamic_connection);
          }
          await CompletionData(explanation,removed_resource_id,req);
        }
        return res.ok(undefined, messages.TRAINING_UPDATE_SUCCESS,RESPONSE_STATUS.success);
      }

      else{
        return res.ok(isValid.error, messages.TRAINING_ADD_FAIL,RESPONSE_STATUS.error);
      }
    }
    catch(error){
      sails.log(error);
      return res.ok(undefined, messages.error, RESPONSE_STATUS.error);
    }
  },

  delete: async (req, res) => {
    try{
      const account = req.account;
      const training_resource_id = req.params.id;
      const resourceId = await TrainingResource.findOne({
        training_resource_id
      }).usingConnection(req.dynamic_connection);
      const resourceType =  await Resource.findOne({
        resource_id: resourceId.resource_id
      }).usingConnection(req.dynamic_connection);
      let resMessage;
      if(resourceType.resource_type === 'MP4')
      {
        resMessage = messages.VIDEO_DELETE_SUCCESS;
      }
      if((resourceType.resource_type === 'PNG') || (resourceType.resource_type === 'JPG'))
      {
        resMessage = messages.PHOTO_DELETE_SUCCESS;
      }
      const location = (resourceType.location_path);
      if(location !== '')
      {
        const trainingId = resourceId.training_id;
        const imageDir = location.split('/training/'+trainingId+'/');
        await deleteReference( imageDir[1], account.account_guid, resourceId.training_id);
      }
      await Resource.destroy({ resource_id: resourceId.resource_id }).usingConnection(req.dynamic_connection);
      await TrainingResource.destroy({ training_resource_id }).usingConnection(req.dynamic_connection);
      return res.ok(undefined, resMessage, RESPONSE_STATUS.success);
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.error, RESPONSE_STATUS.error);
    }
  },

  updateResourceSequence: async (req, res) => {
    try{
      let request = req.allParams();
      const isValid = await TrainingValidations.updateResourceSequence.validate(request);
      if (!isValid.error) {
        const { training_sequence } = request;
        for(const property of training_sequence) {
          const resource = await TrainingResource.findOne({ training_resource_id: property.training_resource_id}).usingConnection(req.dynamic_connection);
          sails.log(resource);
          await Resource.update({ resource_id: resource.resource_id},
            {sequence: property.sequence }
          ).fetch().usingConnection(req.dynamic_connection);
        }
        return res.ok(undefined, messages.TRAINING_UPDATE_SUCCESS,RESPONSE_STATUS.success);
      }
      else{
        return res.ok(isValid.error, messages.TRAINING_UPDATE_ERROR,RESPONSE_STATUS.error);
      }
    }
    catch(error)
    {
      sails.log(error);
      return res.ok(undefined, messages.error, RESPONSE_STATUS.error);
    }
  }
};

