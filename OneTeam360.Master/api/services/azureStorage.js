/* eslint-disable handle-callback-err */
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = {
  copyImageFromTempToOri: async (imageArr, containerName, taskId, imgDir) => {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient1 = blobServiceClient.getContainerClient(`${containerName}/${imgDir}`);
    let desContainer = blobServiceClient.getContainerClient(`${containerName}/training/${taskId}`);
    const sourceBlob = containerClient1.getBlobClient(imageArr);
    const desBlob = desContainer.getBlobClient(sourceBlob.name);
    const response = await desBlob.beginCopyFromURL(sourceBlob.url);
    (await response.pollUntilDone());
    sourceBlob.delete();
    // }
  },

  copyImageFromTempToUrl: async (imageArr, containerName, imgPath, taskId, imgDir) => {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient1 = blobServiceClient.getContainerClient(`${containerName}/${imgDir}`);
    let desContainer = blobServiceClient.getContainerClient(`${containerName}/${imgPath}/${taskId}`);
    const sourceBlob = containerClient1.getBlobClient(imageArr);
    const desBlob = desContainer.getBlobClient(sourceBlob.name);
    const response = await desBlob.beginCopyFromURL(sourceBlob.url);
    (await response.pollUntilDone());
    sourceBlob.delete();
    // }
  },

  deleteReference: async(imagDir, containerName, training_resource_id) => {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient1 = blobServiceClient.getContainerClient(`${containerName}/training/${training_resource_id}`);
    const sourceBlob = containerClient1.getBlobClient(imagDir);
    sourceBlob.delete();
  }
};



