export default async function tutorialSearch(request, response) {
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Bearer ${process.env.DC_API_KEY}`
        },
        body: JSON.stringify({debug: false, queries: [request.query.query]})
      };
    console.log(process.version)
    console.log("Request is made")
    const dcResponse = await fetch('https://api.cloud.deepset.ai/api/v1/workspaces/test/pipelines/KeywordDocumentSearch_without_metadata_with_highlight/search', options);
    console.log(dcResponse.status) 
    console.log(dcResponse.statusText)  
    if (dcResponse.status === 200) {
        const data = await dcResponse.text();
        response.status(200).send(data)
    } else { 
        console.error(dcResponse) 
        response.status(dcResponse.status).send(dcResponse)
        // TODO: trace this
    }
  }