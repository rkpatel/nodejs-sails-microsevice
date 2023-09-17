/* eslint-disable handle-callback-err */
const fs = require('fs');
require('image-thumbnail');
const { BlobServiceClient } = require('@azure/storage-blob');

const uploadBlobStorage = async function (uploadPath, fileName) {
  const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const CONTAINER_NAME = process.env.CONTAINER_NAME;
  const IMG_DIR = process.env.PROFILE_IMAGE_DIR_INSIDE_MASTER_CONTAINER;
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(`${CONTAINER_NAME}/${IMG_DIR}`);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  const uploadBlobResponse = await blockBlobClient.uploadFile(uploadPath);
  return uploadBlobResponse.requestId;
};

const removeFiles = function (filePath) {
  fs.exists(filePath, (exists) => {
    if (exists) {
      fs.unlink(filePath, err => {
        if (err) { throw err; }
      });
    }
  });
};


module.exports = {
  uploadDocument: async (upload) => {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        upload.upload({ dirname: '../../assets/images' }, async (err, files) => {
          if (err) { reject(err); }
          const fileUID = files[0].fd.replace(/^.*[\\\/]/, '');
          const uploadLocation = process.cwd() + '/assets/images/' + fileUID;

          // Here we are creating image thumbnail.
          let options = { width: 70, height: 70, jpegOptions: { force: true, quality: 100 } };
          sails.log(options);
          fs.createReadStream(uploadLocation);
          fileUID.split('.');

          // Upload files on azure blob storage
          Promise.all([uploadBlobStorage(uploadLocation, fileUID)])
            .then(() => {
              removeFiles(uploadLocation);
              resolve(fileUID);
            }).catch(error => {
              reject(error);
            });
        });
      });
    });
  },
  deleteReference: async(imagDir, containerName, competitionDir) => {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient1 = blobServiceClient.getContainerClient(`${containerName}/${competitionDir}`);
    const sourceBlob = containerClient1.getBlobClient(imagDir);
    sourceBlob.delete();
  }
};
