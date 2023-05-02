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
    const dcResponse = await fetch(`https://api.cloud.deepset.ai/api/v1/workspaces/${process.env.DC_WORKSPACE_NAME}/pipelines/${process.env.DC_PIPELINE_NAME}/search`, options);
    console.log(dcResponse.status) 
    console.log(dcResponse.statusText)  
    if (dcResponse.status === 200) {
        const data = await dcResponse.text();
        response.status(200).send(data)
    } else { 
        const error = await dcResponse.text();
        console.error(error) 
        response.status(error.status).send(error)
        // TODO: trace this 
    }
  }