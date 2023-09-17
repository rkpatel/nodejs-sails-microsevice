/* eslint-disable handle-callback-err */
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
const { ALLOWED_IMAGES } = require('../utils/constants/validations');
const { BlobServiceClient } = require('@azure/storage-blob');
const validations = require('../utils/constants/validations');
const localconfig = require('../utils/constants/config');
const { UPLOAD_REQ_FOR } = require('../utils/constants/enums');
const messages = sails.config.globals.messages;
const checkContainerExists = async function (containerName) {
  sails.log('In checkcontainerexists function');
  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  let containers = blobServiceClient.listContainers();
  const allContainer = [];
  for await (const container of containers) {
    allContainer.push(container.name);
  }
  if (allContainer.indexOf(containerName) === -1) {
    let desContainer = blobServiceClient.getContainerClient(containerName);
    await desContainer.create({access: 'blob'});
    sails.log('In container creation block');
  }
};

const getContentType = (fileDetails) => {
  if(!fileDetails) {return undefined;}
  switch(fileDetails.type){
    case 'image/png' : return 'image/png';
    case 'image/jpeg' : return 'image/jpeg';
    case 'image/jpg' : return 'image/jpg';
    case 'video/mp4' : return 'video/mp4';
    case 'application/pdf' : return 'application/pdf';
    default : return undefined;
  }
};

const uploadBlobStorage = async function (uploadPath, fileName, containerName, tmpDir, fileDetails) {
  sails.log('In uploadBlobStorage');
  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const CONTAINER_NAME = containerName ? containerName : process.env.CONTAINER_NAME;
  const IMG_DIR = tmpDir ? tmpDir : process.env.PROFILE_IMAGE_DIR_INSIDE_MASTER_CONTAINER;
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(`${CONTAINER_NAME}/${IMG_DIR}`);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  const uploadBlobResponse = await blockBlobClient.uploadFile(uploadPath, { blobHTTPHeaders: {
    blobContentType: getContentType(fileDetails)
  } });
  return uploadBlobResponse.requestId;
};

const createThumb = async function (fileUID) {
  sails.log('In create thumb function');
  const uploadLocation = process.cwd() + localconfig.UPLOADFILE_BASE_DIR + `/` + fileUID;
  let options = { width: 70, height: 70, jpegOptions: { force: true, quality: 100 } };
  const imageBuffer = fs.createReadStream(uploadLocation);
  const NAME_ARR = fileUID.split('.');
  const thumbName = `${NAME_ARR[0]}_thumbnail.${NAME_ARR[1]}`;
  const thumbUrl = `${process.cwd()}` + localconfig.UPLOADFILE_BASE_DIR + `/${thumbName}`;
  const thumbnail = await imageThumbnail(imageBuffer, options);
  return new Promise((resolve, reject) => {
    fs.writeFile(thumbUrl, thumbnail, (err) => {
      if (err) { reject(err); }
      resolve(thumbName);
    });
  });
};

const removeFiles = function (filePath) {
  sails.log('In removeFiles');
  fs.exists(filePath, (exists) => {
    if (exists) {
      fs.unlink(filePath, err => {
        if (err) {
          sails.log('In remove files reject function=',err);
          throw err; }
      });
    }
  });
};

const validateImageUpload = function (fileArr,{ invalidFileTypeMsg ,fileAllowedTypes, maxUploadSize,tmpDir}) {
  sails.log('In validateImageUpload function');

  let allowedTypes = ALLOWED_IMAGES;
  if(fileAllowedTypes) { allowedTypes = fileAllowedTypes; }

  let MAX_IMAGE_UPLOAD_SIZE = process.env.MAX_IMAGE_UPLOAD_SIZE;
  if(maxUploadSize){ MAX_IMAGE_UPLOAD_SIZE = maxUploadSize; }

  let _invalidFileTypeMsg = messages.INVALID_FILE_TYPE_TASK;
  if(invalidFileTypeMsg) { _invalidFileTypeMsg = invalidFileTypeMsg; }

  let typeError = false;
  let sizeError = false;
  let sizeErrMsg = '';
  let typeErrMsg = '';
  let response = { status: true, message: '', type: '' };
  let typeArr = [];
  fileArr.forEach((fileData) => {
    sails.log('In fileData=',fileData);
    if (tmpDir !== process.env.DAILYREPORT_IMG_UPLOAD_DIR_ON_AZURE && allowedTypes.indexOf(fileData.type) === -1) {
      typeError = true;
      typeErrMsg = _invalidFileTypeMsg;
    }
    typeArr.push(fileData.type);
    if ((fileData.size / 1048576) > MAX_IMAGE_UPLOAD_SIZE) {
      const FILE_SIZE_LIMIT_EXCEEDED = messages.FILE_SIZE_LIMIT_EXCEEDED;
      const ERR_MESSAGE = FILE_SIZE_LIMIT_EXCEEDED.replace(/STR_TO_BE_REPLACE/, MAX_IMAGE_UPLOAD_SIZE);
      sizeError = true;
      sizeErrMsg = ERR_MESSAGE;
    }
  });
  if (sizeError || typeError) {
    let msgArr = [];
    if (typeErrMsg) { msgArr.push(typeErrMsg); }
    if (sizeErrMsg) { msgArr.push(sizeErrMsg); }
    response.status = false;
    response.message = msgArr.join(' and ');
    response.type=typeArr;
  }
  response.type = typeArr;
  sails.log('at validateImageUpload  end function=', response);
  return response;
};

module.exports = {
  uploadDocument: async (upload, containerName, tmpDir, {
    invalidFileTypeMsg,
    maxUploadFileCount,
    maxUploadSize,
    fileAllowedTypes,
    isThumbnail,
    requestFor,
  }) => {
    try {
      sails.log('In upload Document service  function=');
      return new Promise((resolve, reject) => {
        try {
          let maxBytes;
          let isThumbnailCreate = isThumbnail;
          if(isThumbnail === undefined) {
            isThumbnailCreate = true;
          }

          if(fileAllowedTypes !== undefined && fileAllowedTypes === validations.ALLOWED_TRAINING_VIDEO)
          {
            maxBytes = localconfig.VIDEOTYPE_MAXBYTES;
          }
          else{
            maxBytes = localconfig.FILETYPE_MAXBYTES;
          }

          let uploadObject =  { maxBytes, dirname: `../..` + localconfig.UPLOADFILE_BASE_DIR };

          upload.upload(uploadObject, async (err, files) => {
            if (err) {
              sails.log('In upload Document service  reject function=', err);
              reject(err);
            }
            let isValid ={status: true,message: '', type: undefined};
            let MAX_UPLOAD_FILES_LIMIT = process.env.MAX_UPLOAD_FILES_LIMIT;
            if(maxUploadFileCount){ MAX_UPLOAD_FILES_LIMIT = maxUploadFileCount; }
            if(files.length > MAX_UPLOAD_FILES_LIMIT){
              isValid.status = false;
              isValid.message= messages.MAX_FILE_UPLOAD_ERR_MSG.replace(/STR_TO_BE_REPLACE/, MAX_UPLOAD_FILES_LIMIT);
            }else{
              isValid = validateImageUpload(files,{invalidFileTypeMsg,fileAllowedTypes,maxUploadSize,tmpDir});
            }
            if (isValid.status) {
              const uploadLocation = `${process.cwd()}` + localconfig.UPLOADFILE_BASE_DIR;
              sails.log('uploadLocation',uploadLocation);
              let filesToBeUploadedOnBlob = [];
              let uploadedFileArr = [];
              let filesToBeRemoved = [];
              let thumbArr = [];

              await checkContainerExists(containerName);

              files.map(fileDetail => {
                let fileUID = fileDetail.fd.replace(/^.*[\\\/]/, '');
                uploadedFileArr.push(fileUID);
                filesToBeUploadedOnBlob.push(uploadBlobStorage(`${uploadLocation}/${fileUID}`, fileUID, containerName, tmpDir, fileDetail));
                if(isValid.type && isValid.type.length && isThumbnailCreate && (fileDetail.type && fileDetail.type.includes('image/jpg') || fileDetail.type.includes('image/png') ||  fileDetail.type.includes('image/jpeg'))){
                  thumbArr.push(createThumb(fileUID));
                }
              });
              filesToBeRemoved = [...uploadedFileArr];
              if(isValid.type && isValid.type.length && isThumbnailCreate && (isValid.type.includes('image/jpg') || isValid.type.includes('image/png') ||  isValid.type.includes('image/jpeg') )){
                // Create Thumbnail images.
                Promise.all(thumbArr).then((result) => {
                  result.map(val => {
                    filesToBeRemoved.push(val);
                    filesToBeUploadedOnBlob.push(uploadBlobStorage(`${uploadLocation}/${val}`, val, containerName, tmpDir, undefined));
                  });
                }).catch(e => {
                  sails.log('In thum img push  reject function=', e);
                  reject(e);
                });
              }

              // Upload files on azure blob storage.
              Promise.all(filesToBeUploadedOnBlob).then(() => {
                filesToBeRemoved.forEach((val1) => {
                  if(requestFor !== UPLOAD_REQ_FOR.bulk_import_employee)
                  {
                    removeFiles(`${uploadLocation}/${val1}`);
                  }
                });
                resolve(uploadedFileArr);
              }).catch(error => {
                sails.log('In filesToBeUploadedOnBlob  reject function=', error);
                reject(error);
              });

            }else{
              files.map(fileDetail => {
                let fileUID = fileDetail.fd.replace(/^.*[\\\/]/, '');
                removeFiles(`${process.cwd()}` + localconfig.UPLOADFILE_BASE_DIR + `/${fileUID}`);
              });
              reject({status: false,message: isValid.message});
            }
          });
        } catch (err) { sails.log('In upload Document promise catch  function=', err); }

      });
    } catch (err) {
      sails.log('In catch of  Document service  function=', err);
    }
  }
};
