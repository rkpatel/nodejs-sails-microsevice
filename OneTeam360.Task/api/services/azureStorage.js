/* eslint-disable handle-callback-err */
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = {
  copyImageFromTempToOri: async (imageArr, containerName, taskId, imgDir) => {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient1 = blobServiceClient.getContainerClient(`${containerName}/${imgDir}`);
    let desContainer = blobServiceClient.getContainerClient(`${containerName}/task/${taskId}`);
    for await (const blobName of imageArr) {
      const sourceBlob = containerClient1.getBlobClient(blobName);
      const desBlob = desContainer.getBlobClient(sourceBlob.name);
      const response = await desBlob.beginCopyFromURL(sourceBlob.url);
      (await response.pollUntilDone());
      sourceBlob.delete();
    }
  }
};



