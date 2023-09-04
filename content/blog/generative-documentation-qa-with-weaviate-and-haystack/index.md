---
layout: blog-post
title: Generative Documentation Q&A with Weaviate and Haystack
description: A guide to building a retrieval augmented generative pipeline for referenced documentation search.
featured_image: thumbnail.png
featured_image_caption: Generative Documentation Q&A with Weaviate and Haystack
images: ["blog/generative-documentation-qa-with-weaviate-and-haystack/thumbnail.png"]
toc: True
date: 2023-09-02
last_updated: 2023-09-02
authors:
  - Tuana Celik
tags: ["LLM", "Generative AI", "Retrieval", "Prompting"]
---

_You can use this_ [_Colab_](https://colab.research.google.com/drive/1nO0tBVOAgo-bayfUnIqnWLZby_7zejOz?usp=sharing) _for a working example of the application described in this article._

Retrieval augmented generation is the golden child of LLM applications lately. The idea behind it is simple: LLMs do not know the entire world, least of all your specific world. But, with the use of retrieval techniques, we can provide the most useful pieces of information to an LLM so that it has the context with which to reply to queries that it otherwise would not have been trained to know about or answer.

This technique is now being used to power many search systems. In this article, we show how to build such a system using  [Haystack](https://haystack.deepset.ai/), an open-source LLM framework, and Weaviate, a vector database. Our resulting pipeline will answer queries about Haystack, and provide references to the documentation pages containing the answer.

A few weeks ago, a colleague and I built a custom component for Haystack: the  [**`ReadmeDocsFetcher`**](https://haystack.deepset.ai/integrations/readmedocs-fetcher)_._  Haystack’s design is centered around small units called components. The idea behind the framework is to provide simple building blocks that allow you to create your own custom components beyond the ones provided inherently through the Haystack project. The Haystack documentation is hosted through ReadMe, so we designed this node to fetch requested documentation pages from ReadMe and process them in a way that can be used in a full LLM pipeline.

# The Indexing Pipeline

Now we can get started building our pipeline. First, we create an  [indexing pipeline](https://docs.haystack.deepset.ai/docs/pipelines#indexing-pipelines)  to write all the requested documentation pages on  [https://docs.haystack.deepset.ai](https://haystack.deepseet.ai/)  to our Weaviate database. The nice thing about building indexing pipelines is that they can be reused. If there are any new pages, we can push them through our indexing pipeline to ensure that the dabase that we we use for our RAG pipelines is always up to date.

For this indexing pipeline, we make use of the custom built  **`ReadmeDocsFetcher`**. Eventually we’ll want to do embedding retrieval so that we can get the most relevant documents from the database. So for this demo, we’re using a  **`sentence-transformers`** model to create the vector representations of my documents.

Weaviate has a convenient feature called  [Weaviate Embedded](https://weaviate.io/blog/embedded-local-weaviate)  that we can use here. It allows us to run a Weaviate database within Colab:
```python
import weaviate  
from weaviate.embedded import EmbeddedOptions  
from haystack.document_stores import WeaviateDocumentStore  
  
client = weaviate.Client(  
  embedded_options=weaviate.embedded.EmbeddedOptions()  
)  
  
document_store = WeaviateDocumentStore(port=6666)
```
Once we have that, we initialize all of the components we’ll need for the final indexing pipeline:
```python
from readmedocs_fetcher_haystack import ReadmeDocsFetcher  
from haystack.nodes import EmbeddingRetriever, MarkdownConverter, PreProcessor  
  
converter = MarkdownConverter(remove_code_snippets=False)  
readme_fetcher = ReadmeDocsFetcher(api_key=readme_api_key,   
                                   markdown_converter=converter,   
                                   base_url="https://docs.haystack.deepset.ai")  
embedder = EmbeddingRetriever(document_store=document_store,   
                              embedding_model="sentence-transformers/multi-qa-mpnet-base-dot-v1")  
preprocessor = PreProcessor()
```
And then we simply build and run the pipeline. It will preprocess and create embeddings for all the documentation pages under  [https://docs.haystack.deepset.ai](https://docs.haystack.deepset.ai/):
```python
from haystack import Pipeline  
  
indexing_pipeline = Pipeline()  
indexing_pipeline.add_node(component=readme_fetcher, name="ReadmeFetcher", inputs=["File"])  
indexing_pipeline.add_node(component=preprocessor, name="Preprocessor", inputs=["ReadmeFetcher"])  
indexing_pipeline.add_node(component=embedder, name="Embedder", inputs=["Preprocessor"])  
indexing_pipeline.add_node(component=document_store, name="DocumentStore", inputs=["Embedder"])  
indexing_pipeline.run()
```
# The Retrieval Augmented Generative (RAG) Pipeline

Before we jump into the RAG pipeline itself, I’d like to talk about two key building blocks of the pipeline in isolation: the prompt and the LLM of choice.

As mentioned above, my aim here is to build a pipeline that can reference the documentation pages a reply comes from. Specifically, I want to get a URL for me to click and read in more detail. Whether a RAG pipeline can achieve this depends heavily on the instruction the LLM is provided. It also depends on whether the LLM itself is designed to consume such an instruction.

Here, we can say I ‘splashed out’. While you can use open-source LLMs with Haystack (from Hugging Face, hosted on SageMaker, locally deployed, the choice is really yours) I went with GPT-4. One of the main reasons for my choice is simply because, from experience, GPT-4 has been the most performant with the type of prompt (instruction) I intended to use for this application. That being said, please let me know if you have different observations 🙏

## The Prompt

Here is the prompt we use for this demo. It asks for each retrieved document to be followed by the URL that it comes from. The URL of each document is present in the metadata of the documents that we wrote to the  `WeaviateDocumentStore`  👇
```
You will be provided some conetent from technical documentation,   
where each paragraph is followed by the URL that it appears in.   
Answer the query based on the provided Documentation Content. Your answer   
should reference the URLs that it was generated from.   
Documentation Content: {join(documents,   
                             delimiter=new_line,   
                             pattern='---'+new_line+'$content'+new_line+'URL: $url',   
                             str_replace={new_line: ' ', '[': '(', ']': ')'})}  
Query: {query}  
Answer:
```
Notice how we’re structuring the prompt so that documents (which will be provided by the retriever when we add this to the pipeline) are separated from each other, and the content is always followed by the URL it comes from. We can do this because each document that we wrote into our database has the  `url`  in its  `metadata`.

We use the prompt above to create a  `PromptTemplate`  called the  `**answer_with_references_prompt**`.
```python
from haystack.nodes import PromptTemplate, AnswerParser  
  
answer_with_references_prompt = PromptTemplate(prompt = """You will be provided some conetent from technical documentation, where each paragraph is followed by the URL that it appears in. Answer the query based on the provided Documentation Content. Your answer should reference the URLs that it was generated from. Documentation Content: {join(documents, delimiter=new_line, pattern='---'+new_line+'$content'+new_line+'URL: $url', str_replace={new_line: ' ', '[': '(', ']': ')'})}\nQuery: {query}\nAnswer:""", output_parser=AnswerParser())
```
You can explore other example prompts we’ve made use of, including a similar one for referencing on the  [PromptHub](https://prompthub.deepset.ai/?prompt=deepset%2Fquestion-answering-with-references).

## The Pipeline

Now to simply piece this all together. First, we define a  `PromptNode`, which is the interface for interacting with an LLM.

from haystack.nodes import PromptNode  
 ```python 
prompt_node = PromptNode(model_name_or_path="gpt-4",   
                         api_key='YOUR_OPENAI_KEY',   
                         default_prompt_template=answer_with_references_prompt,   
                         max_length=500)
```
Finally we create our pipeline. It has two components. First, we reuse the same  `EmbeddingRetriever`  from earlier to retrieve relevant documents from the database. Second, we use the  `PromptNode`  to generate an answer based on these retrieved documents.

```python
pipeline = Pipeline()  
pipeline.add_node(component = embedder, name = "Retriever", inputs = ["Query"])  
pipeline.add_node(component = prompt_node, name = "GPT-4", inputs=["Retriever"])
```
When we run it, this final pipeline will: retrieve some relevant documents, add them into the prompt we created, and then send the resulting complete prompt to GPT-4 for an answer.

For example:
```python
pipeline.run("What are the optional installations of Haystack?", params = {"Retriever": {"top_k": 5}})
```
Resulted in the following complete prompt (abridged):
```
You will be provided some conetent from technical documentation, where each paragraph is followed   
by the URL that it appears in. Answer the query based on the provided Documentation Content.   
Your answer should reference the URLs that it was generated from.   
Documentation Content:   
---  
", "1-0": "all-gpu", "1-1": "Install Haystack and all optional dependencies, including developer   
tools with GPU support.", "2-0": "aws", "2-1": "Install Haystack and AWS SageMaker PromptNode support",   
"3-0": "colab", "3-1": "Install Haystack and all dependencies needed to run Haystack in Google Colab.",   
"4-0": "crawler", "4-1": "Install Haystack and all web crawling tools.",  
URL: https://docs.haystack.deepset.ai/docs/installation  
---  
[...]  
URL: https://docs.haystack.deepset.ai/docs/extras  
---  
[...]  
Query: What are the optional installations of Haystack?  
Answer:
```
When we ran this, the reply we got was the following:
```
Haystack offers several optional installations to support different use cases. These include:  
1. "all-gpu" to install Haystack with all optional dependencies, including developer tools with GPU support.  
2. "aws" for AWS SageMaker PromptNode support.  
3. "colab" to install all dependencies needed to run Haystack in Google Colab.  
4. "crawler" for web crawling tools.  
5. "dev" for all development tools needed by contributors.  
6. "ocr" for all OCR tools.  
7. "docstores" for all DocumentStores.  
8. "docstores-gpu" for all DocumentStores with GPU support.  
9. "faiss" for FAISS support for the FAISSDocumentStore.  
10. "faiss-gpu" for FAISS support for the FAISSDocumentStore with GPU.  
11. "inference" for all dependencies for model inference on local machine, including torch.  
12. "opensearch" for OpenSearch support for the OpenSearchDocumentStore.  
13. "elasticsearch", "elasticsearch7", and "elasticsearch8" for Elasticsearch support for the ElasticsearchDocumentStore.  
14. "pdf" for PyMuPDF for PDFToTextConverter.  
15. "pinecone" for Pinecone support for the PineconeDocumentStore.  
16. "preprocessing" for the basic preprocessing tools, such as langdetect for language identification and nltk for precise document splitting.  
17. "file-conversion" for all the dependencies for file conversion and parsing, like python-docx, tika, markdown.  
18. "ray" for Ray support for the RayPipeline.  
19. "weaviate" for Weaviate support for the WeaviateDocumentStore.  
  
Additionally, there are other components like "AnswerToSpeech" and "DocumentToSpeech" which are not installed with Haystack core but can be installed separately.  
  
For the latest release of Haystack and all its dependencies, you can use the command 'pip install farm-haystack(all)' or 'pip install farm-haystack(all-gpu)' for GPU-enabled dependencies.  
  
URLs:   
- https://docs.haystack.deepset.ai/docs/installation  
- https://docs.haystack.deepset.ai/docs/extras
```
# Further Improvements

So far, we have only used a single retrieval technique. This could be considerably improved with a hybrid retrieval approach, which you can also implement with Weaviate and Haystack. This, in my opinion, would provide a healthier system that is intended for documentation search. While I am able to ask fully formed questions in this setup, I may want to provide a way for a user to simply search for ‘EmbeddingRetrievers’ for example.

In this article, we’ve seen how to build a simple RAG setup that uses a clever prompt to get replies with references to documentation. To discover more about the available pipelines and components that would help you build custom LLM applications, check out the  [Haystack documentation](https://docs.haystack.deepset.ai/).