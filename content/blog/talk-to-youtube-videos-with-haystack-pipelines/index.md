---
layout: blog-post
title: "Talk to YouTube Videos with Haystack Pipelines"
description: Use Whisper to provide YouTube videos as context for retrieval augmented generation
featured_image: thumbnail.png
images: ["blog/talk-to-youtube-videos-with-haystack-pipelines/thumbnail.png"]
featured_image_caption: Talk to YouTube Videos with Haystack Pipelines
alt_image: Talk to YouTube Videos with Haystack Pipelines
toc: True
date: 2023-09-08
last_updated:  2023-09-08
authors:
  - Tuana Celik
tags: ["LLM", "Generative AI", "Retrieval"]
---


_You can use this_ [_Colab_](https://colab.research.google.com/drive/1sZM5Y1NkPOy3y8HCsecsmhjImrARIVru?usp=sharing) _for a working example of the application described in this article._

In this article, I’ll be showing an example of how to leverage transcription models like OpenAI’s Whisper, so as to build a retrieval augmented generation (RAG) pipeline that will allow us to effectively search through video content.

The example application I’ll showcase is able to answer questions based on the transcript extracted from the video. I’ll use the [video by Erika Cardenas](https://www.youtube.com/watch?v=h5id4erwD4s) as an example. In the video, she talks about chunking and preprocessing documents for RAG pipelines. Once we’re done, we will be able to query a Haystack pipeline that will respond based on the contents of the video.

## Transcribing and Storing the Video

To get started, we first need to set up an [indexing pipeline](https://docs.haystack.deepset.ai/docs/pipelines#indexing-pipelines). These pipelines in Haystack are designed to be given files of some form (.pdf, .txt, .md and in our case, a YouTube link), and store them in a database. The indexing pipeline is also used to design and define how we would like files to be prepared. This often involves [file conversion](https://docs.haystack.deepset.ai/docs/file_converters) steps, some [preprocessing](https://docs.haystack.deepset.ai/docs/preprocessor), and maybe also some [embedding](https://docs.haystack.deepset.ai/docs/retriever#embedding-retrieval-recommended) creation and so on.

The way we design the components and structure of this pipeline will also be important for another type of pipeline we will create in the next section: The RAG pipeline, also often referred to as the query or LLM pipeline too. While the indexing pipeline defines how we prepare and store data, an LLM pipeline **_uses_** said stored data. A simple example of the impact an indexing pipeline has on the RAG pipeline is that depending on the model we’re using, we may have to chunk our files to be longer or shorter.

### Reusability

The idea behind Haystack pipelines is that once created, they can be re-invoked when needed. This ensures that data is treated the same way each time. In terms of indexing pipelines, this means we have a way to keep our databases for RAG pipelines always up to date. In a practical sense for this example application, when there’s a new video we want to be able to query, we re-use the same indexing pipeline and run the new video through it.

### Creating the Indexing Pipeline

In this example, we’re using Weaviate as our vector database for storage. However, Haystack provides a number of [Document Stores](https://haystack.deepset.ai/integrations?type=Document+Store) which you can pick from.

First, we create our `WeaviateDocumentStore`:
```python
import weaviate  
from weaviate.embedded import EmbeddedOptions  
from haystack.document_stores import WeaviateDocumentStore  
  
client = weaviate.Client(  
  embedded_options=weaviate.embedded.EmbeddedOptions()  
)  
  
document_store = WeaviateDocumentStore(port=6666)
```
Next, we build the indexing pipeline. Here, our aim is to create a pipeline that will create transcripts of YouTube videos. So, we use the [**`WhisperTranscriber`**](https://docs.haystack.deepset.ai/docs/whisper_transcriber) as our first component. This component uses [Whisper](https://openai.com/research/whisper) by OpenAI, an automatic speech recognition (ASR) system which can be used to transcribe audio into text. The component expects audio files, and returns transcripts in [Haystack Document](https://docs.haystack.deepset.ai/docs/documents_answers_labels) form, ready to be used in any Haystack pipeline.

We also include preprocessing, as well as embedding creations in our pipeline. This is because when it’s time to create the RAG pipeline, we would like to do semantic search on the indexed files.
```python
from haystack.nodes import EmbeddingRetriever, PreProcessor  
from haystack.nodes.audio import WhisperTranscriber  
from haystack.pipelines import Pipeline  
  
preprocessor = PreProcessor()  
embedder = EmbeddingRetriever(document_store=document_store,   
                              embedding_model="sentence-transformers/multi-qa-mpnet-base-dot-v1")  
whisper = WhisperTranscriber(api_key='OPENAI_API_KEY')  
  
indexing_pipeline = Pipeline()  
indexing_pipeline.add_node(component=whisper, name="Whisper", inputs=["File"])  
indexing_pipeline.add_node(component=preprocessor, name="Preprocessor", inputs=["Whisper"])  
indexing_pipeline.add_node(component=embedder, name="Embedder", inputs=["Preprocessor"])  
indexing_pipeline.add_node(component=document_store, name="DocumentStore", inputs=["Embedder"])
```
Next, we create a helper function that extracts the audio of YouTube videos, and we can run the pipeline, for this, we install the `pytube` package 👇
```python
from pytube import YouTube  
  
def youtube2audio (url: str):  
    yt = YouTube(url)  
    video = yt.streams.filter(abr='160kbps').last()  
    return video.download()
```
Now, we can run our indexing pipeline with a URL to a YouTube video:
```python
file_path = youtube2audio("https://www.youtube.com/watch?v=h5id4erwD4s")  
indexing_pipeline.run(file_paths=[file_path])
```
## The Retrieval Augmented Generative (RAG) Pipeline

This part is certainly the fun part. We now define our RAG pipeline. This will be the pipeline that defines _how_ we query our videos. Although RAG pipelines often are built for question-answering, they can be designed for a number of other use cases. What the pipeline does in this case, is largely defined by what prompt you provide the LLM. You can find various prompts for different use cases in the [PromptHub](https://prompthub.deepset.ai/).

### The Prompt

For this example, we’ve gone with a commonly used style of question-answering prompts, although you can of course change this prompt to do what you want to achieve. For example, changing it to a prompt that asks for a summary might be interesting. You could also make it more general. Here we’re also informing the model that the transcripts belong to Weaviate videos.
```
You will be provided some transcripts from Weaviate YouTube videos.   
Please answer the query based on what is said in the videos.  
Video Transcripts: {join(documents)}  
Query: {query}  
Answer:
```
In Haystack, these prompts can be included in a pipeline with the [`PromptTemplate`](https://docs.haystack.deepset.ai/docs/prompt_node#prompttemplates) and [`PromptNode`](https://docs.haystack.deepset.ai/docs/prompt_node) components.

While the `PromptTemplate` is where we define the prompt and the variables the prompt expects as inputs (in our case _documents_ and _query_), the `PromptNode` is really the interface with which we interact with LLMs. In this example, we’re using GPT-4 as our model of choice, but you can [change this to use other models from Hugging Face, SageMaker, Azure](https://docs.haystack.deepset.ai/docs/prompt_node#models) and so on.
```python
from haystack.nodes import PromptNode, PromptTemplate, AnswerParser  
  
video_qa_prompt = PromptTemplate(prompt="You will be provided some transcripts from Weaviate YouTube videos. Please answer the query based on what is said in the videos.\n"  
                                        "Video Transcripts: {join(documents)}\n"  
                                        "Query: {query}\n"  
                                        "Answer:", output_parser = AnswerParser())  
  
prompt_node = PromptNode(model_name_or_path="gpt-4", 
                         api_key='OPENAI_KEY', 
                         default_prompt_template=video_qa_prompt)
```
### The Pipeline

Finally, we define our RAG pipeline. The important thing to note here is how the _documents_ input gets provided to the prompt we are using.

Haystack retrievers always return `documents`. Notice below how the first component to get the query is the same `EmbeddingRetriever` that we used in the indexing pipeline above. This allows us to embed the query using the same model that was used for indexing the transcript. The embeddings of the query and indexed transcripts are then used to retrieve the most relevant parts of the transcript. Since these are returned by the retriever as **_documents,_** we are able to fill in the _documents_ parameter of the prompt with whatever the retriever returns:
```python
video_rag_pipeline = Pipeline()  
video_rag_pipeline.add_node(component=embedder, name="Retriever", inputs=["Query"])  
video_rag_pipeline.add_node(component=prompt_node, name="PromptNode", inputs=["Retriever"])
```
We can run the pipeline with a query. The response will be based on what Erika said in the example video we’re using 🤗
```python
result = video_rag_pipeline.run("Why do we do chunking?")
```
The result I got for this was the following:
```
Chunking is done to ensure that the language model is receiving the most   
relevant information and not going over the context window. It involves   
splitting up the text once it hits a certain token limit, depending on   
the model or the chunk size defined. This is especially useful in documents   
where subsequent sentences or sections may not make sense without the   
information from previous ones. Chunking can also help in providing extremely   
relevant information when making queries that are specific to titles or   
sections.
```
## Further Improvements

In this example, we’ve used a transcription model that is able to transcribe audio into text, but it is unable to distinguish between speakers. A follow up step I would like to try is to use a model that allows for speaker distinction. This would allow me to ask questions and in the response from the model, get an understanding of who provided that answer in the video.

Another point I would like to make is that this pipeline, which was for demonstration purposes, uses a light-weight yet quite effective **sentence-transformers** model for retrieval, and the default setting for preprocessing. More could definitely be done to find out what the best embedding model for retrieval would be. And taking inspiration from Erika’s video, chunking and preprocessing of the transcribed documents could be evaluated and improved.

To discover more about the available pipelines and components that would help you build custom LLM applications, check out the [Haystack documentation](https://docs.haystack.deepset.ai/).