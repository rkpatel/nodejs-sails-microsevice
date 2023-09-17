/* eslint-disable handle-callback-err */
const fs = require('fs');
const { BlobServiceClient } = require('@azure/storage-blob');

const checkContainerExists = async function (containerName) {
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
  }
};


const uploadBlobStorage = async function (uploadPath, fileName, containerName, tmpDir) {
  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const CONTAINER_NAME = containerName ? containerName : process.env.CONTAINER_NAME;
  const EXL_DIR = tmpDir ? tmpDir : process.env.EXPORTED_EXCEL_REPORT_DIR;
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(`${CONTAINER_NAME}/${EXL_DIR}`);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  const uploadBlobResponse = await blockBlobClient.uploadFile(uploadPath);
  return uploadBlobResponse.requestId;
};


const removeFiles = function (filePath) {
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

module.exports = {
  uploadReport: async (uploadFileLocation, uploadFileName, containerName, tmpDir) => {
    try {
      return new Promise((resolve, reject) => {
        try {
          setTimeout(async() => {
            const uploadLocation = `${process.cwd()}/assets/reports`;

            let filesToBeUploadedOnBlob = [];
            let uploadedFileArr = [];
            let filesToBeRemoved = [];

            await checkContainerExists(containerName);

            uploadedFileArr.push(uploadFileName);

            // Upload files on azure blob storage.
            filesToBeUploadedOnBlob.push(uploadBlobStorage(uploadFileLocation, uploadFileName, containerName, tmpDir)); 
            filesToBeRemoved = [...uploadedFileArr];

            Promise.all(filesToBeUploadedOnBlob).then(() => {
              filesToBeRemoved.forEach((val1) => {
                removeFiles(`${uploadLocation}/${val1}`);
              });
              resolve(uploadedFileArr);
            }).catch(error => {
              sails.log('In filesToBeUploadedOnBlob  reject function=', error);
              reject(error);
            });
          });
        } catch (err) { sails.log('In upload Document promise catch  function=', err); }

      });
    } catch (err) {
      sails.log('In catch of  Document service  function=', err);
    }
  }
};
