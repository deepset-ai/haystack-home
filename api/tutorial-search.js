export default async function tutorialSearch(request, response) {
  const DC_API_URL = "https://api.cloud.deepset.ai/api/v1/workspaces"
  const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.DC_API_KEY}`
      },
      body: JSON.stringify({debug: false, queries: [request.query.query]})
    };
  
  try {
    const dcResponse = await fetch(`${DC_API_URL}/${process.env.DC_WORKSPACE_NAME}/pipelines/${process.env.DC_PIPELINE_NAME}/search`, options);
    
    if (dcResponse.status === 200) {
      const result = await dcResponse.text();
      response.status(200).send(result)
    } else { 
      response.status(dcResponse.status).send(dcResponse.statusText)
    }
  } catch (error) {
    console.error("Error:", error);
  }
}