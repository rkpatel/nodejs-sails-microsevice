/* eslint-disable handle-callback-err */
const fs = require('fs');
const imageThumbnail = require('image-thumbnail');
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
          const imageBuffer = fs.createReadStream(uploadLocation);
          const NAME_ARR = fileUID.split('.');
          const thumbName = `${process.cwd()}/assets/images/${NAME_ARR[0]}_thumbnail.${NAME_ARR[1]}`;
          const thumbnail = await imageThumbnail(imageBuffer, options);

          fs.writeFile(thumbName, thumbnail, (error) => {
            if (error) { reject(error); }

            // Upload files on azure blob storage
            Promise.all([uploadBlobStorage(uploadLocation, fileUID), uploadBlobStorage(thumbName, `${NAME_ARR[0]}_thumbnail.${NAME_ARR[1]}`)])
              .then(() => {
                removeFiles(uploadLocation);
                removeFiles(thumbName);
                resolve(fileUID);
              }).catch(e => {
                reject(e);
              });
          });
        });
      });
    });
  },

  // uploadOnBlobStorage: async (locationPath, reportFile) => {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       fs.writeFile(locationPath, (err) => {
  //         if (err) { reject(err); }

  //         // Upload files on azure blob storage
  //         Promise.all([uploadOnBlobStoragePath(locationPath, reportFile)])
  //             .then(() => {
  //               removeFiles(locationPath);
  //               resolve(reportFile);
  //             }).catch(err => {
  //               reject(err);
  //             });
  //       });
  //     });
  //   });
  // }
};
