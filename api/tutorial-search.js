module.exports = async (request, response) => {
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Bearer ${DC_API_KEY}`
        },
        body: JSON.stringify({debug: false, queries: [request.query.query]})
      };
    console.log("Request is made")
    let temp = await fetch('https://api.cloud.deepset.ai/api/v1/workspaces/test/pipelines/KeywordDocumentSearch_without_metadata_with_highlight/search', options);
    console.log(temp.status) 
    console.log(temp.statusText)  
    if (temp.status === 200) {
        const data = await temp.text();
        response.status(200).send(data)
    } else { 
        console.error(data) 
        response.status(temp.status).send(data)
        // TODO: trace this
    }
  }