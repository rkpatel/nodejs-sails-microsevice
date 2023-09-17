module.exports = {
  taskAttachmentFile: async function(task_id, _attachment, conn){
    let response = [];
    const results = await TaskImage.find({ task_id: task_id }).usingConnection(conn);
    if(results && results.length > 0)
    {
      response = results.map((item)=>{
        return {
          'image_url': item.image_url
        };
      });
    }
    return { response };
  }
};
