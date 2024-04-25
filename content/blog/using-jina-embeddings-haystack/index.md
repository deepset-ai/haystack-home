---
layout: blog-post
title: 'Using Jina Embeddings v2 with Haystack 2.0 pipelines to summarize legal documents'
description: Learn how to use the Jina v2 Embedding models in a RAG pipeline with our new Haystack integration.
featured_image: thumbnail.png
images: ["blog/using-jina-embeddings-haystack/thumbnail.png"]
alt_image: The logos for Haystack and Jina AI sit against a blue background with cartoonish art of a man and a woman holding a magnifying glass up to a large clipboard, next to a gavel.
date: 2024-01-10
last_updated: 2024-01-10
toc: True
authors:
  - Tilde Thurium
tags: ["Community", "Embeddings", "Open Source", "Integration"]
cookbook: jina-embeddings-v2-legal-analysis-rag.ipynb
---

[Jina.ai](https://jina.ai/news/jina-ai-launches-worlds-first-open-source-8k-text-embedding-rivaling-openai/) recently upgraded and expanded the capabilities of their previous embedding model in a v2 release. 

With the [Jina Haystack extension](https://haystack.deepset.ai/integrations/jina), you can now take advantage of these new text embedders in your Haystack pipelines! In this post, we'll show what's cool about Jina Embeddings v2 and how to use them.

> You can follow along in the accompanying [Colab notebook of a RAG pipeline that uses the Jina Haystack extension](https://colab.research.google.com/drive/1l8GbQhqxnWXkdktgJfs9Rz4EAtNbHK_L#scrollTo=_coq_qCuItbN).

## Advantages of Jina Embeddings v2

- **Handling long documents.** The large token window, accommodating up to 8192 tokens, allows you to break the embeddings into larger chunks. It's more computationally and memory-efficient to use a few larger vectors than a lot of small ones, so this allows Jina v2 to process large documents efficiently. 
- **Improved semantic understanding.** Larger text chunks also contain more *context* within each chunk, which can help LLMs better understand your documents. Improved understanding means better long document retrieval, semantic textual similarity, text reranking, recommendation, RAG and LLM-based generative search.
- **Short vector length**: Jina Embeddings v2 emits embedding vectors of length 768 (base model) or 512 (small model), which are both significantly less than that of the only other embedding model that supports 8k tokens input length, while not compromising on the quality of retrieval, similarity, reranking or other downstream tasks. A shorter vector length implies cost-savings for the vector database, which typically price based on stored vector dimensions.
- **Fully open source 💙** There are both small and large embedding models available, depending on your computing resources and requirements. To run the embedding models yourself, [check out this documentation on HuggingFace](https://huggingface.co/jinaai/jina-embeddings-v2-base-en).  Alternately, you can use Jina's fully managed embedding service to handle that for you, which we'll be doing for this demo.

## Getting started using Jina Embeddings v2 with Haystack

To use the integration you'll need a free Jina api key - get one [here](https://jina.ai/embeddings/). 

You can use Jina Embedding models with two Haystack components: `JinaTextEmbedder` and `JinaDocumentEmbedder`.

To create semantic embeddings for documents, use [`JinaDocumentEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/jinadocumentembedder) in your indexing pipeline. For generating embeddings for queries, use [`JinaTextEmbedder`](https://docs.haystack.deepset.ai/v2.0/docs/jinatextembedder). 

In the following code we'll demonstrate how to use both components. You can also [see the Haystack docs for some minimum viable code examples.](https://haystack.deepset.ai/integrations/jina)


## Summarizing legal text with a Haystack RAG pipeline

I'm not a lawyer, and neither are large language models. But LLMs are good at analyzing long, complex documents. So let's try using the Jina v2 embedding models for some legal summarization.

In October 2023, I narrowly escaped jury duty. I had slight FOMO since the case sounded interesting (Google v. Sonos). Let's see how it turned out.

To follow along with this demo, in addition to a Jina api key you'll also need a [Hugging Face access token](https://huggingface.co/docs/hub/security-tokens), since we'll use the [Mixtral 8x7b LLM](https://mistral.ai/news/mixtral-of-experts/) for question answering.


First, let's install all the packages we'll need.

```bash
pip install jina-haystack chroma-haystack pypdf
```
Then let's input our credentials. Or you can set them as environment variables instead if you're feeling fancy.

```python
from getpass import getpass
import os

os.environ["JINA_API_KEY"] = getpass("JINA api key:")
os.environ["HF_API_TOKEN"] = getpass("Enter your HuggingFace api token: ")
```

## Building the indexing pipeline

Our indexing pipeline will preprocess the legal document, turn it into vectors, and store them. We'll use the [Chroma DocumentStore](https://docs.trychroma.com/getting-started) to store the vector embeddings, via the [Chroma Document Store Haystack integration](https://haystack.deepset.ai/integrations/chroma-documentstore).

```python
from chroma_haystack.document_store import ChromaDocumentStore
document_store = ChromaDocumentStore()
```

At a high level, the [`LinkContentFetcher`](https://docs.haystack.deepset.ai/v2.0/docs/linkcontentfetcher) pulls this document from its URL. Then we convert it from a PDF into a Document object Haystack can understand.

We preprocess it by removing whitespace and redundant substrings. Then split it into chunks, generate embeddings, and write these embeddings into the `ChromaDocumentStore`.

```python
from haystack import Pipeline

from haystack.components.fetchers import LinkContentFetcher
from haystack.components.converters import PyPDFToDocument
from haystack.components.writers import DocumentWriter
from haystack.components.preprocessors import DocumentCleaner
from haystack.components.preprocessors import DocumentSplitter
from chroma_haystack.retriever import ChromaEmbeddingRetriever
from haystack.document_stores.types import DuplicatePolicy

from jina_haystack.document_embedder import JinaDocumentEmbedder
from jina_haystack.text_embedder import JinaTextEmbedder

fetcher = LinkContentFetcher()
converter = PyPDFToDocument()
# remove repeated substrings to get rid of headers/footers
cleaner = DocumentCleaner(remove_repeated_substrings=True)

# Since jina-v2 can handle 8192 tokens, 500 words seems like a safe chunk size
splitter = DocumentSplitter(split_by="word", split_length=500)

# DuplicatePolicy.SKIP is optional but helps avoid errors if you want to re-run the pipeline
writer = DocumentWriter(document_store=document_store, policy=DuplicatePolicy.SKIP)

retriever = ChromaEmbeddingRetriever(document_store=document_store)

document_embedder = JinaDocumentEmbedder(model="jina-embeddings-v2-base-en")

indexing_pipeline = Pipeline()
indexing_pipeline.add_component(instance=fetcher, name="fetcher")
indexing_pipeline.add_component(instance=converter, name="converter")
indexing_pipeline.add_component(instance=cleaner, name="cleaner")
indexing_pipeline.add_component(instance=splitter, name="splitter")
indexing_pipeline.add_component(instance=document_embedder, name="embedder")
indexing_pipeline.add_component(instance=writer, name="writer")

indexing_pipeline.connect("fetcher.streams", "converter.sources")
indexing_pipeline.connect("converter.documents", "cleaner.documents")
indexing_pipeline.connect("cleaner.documents", "splitter.documents")
indexing_pipeline.connect("splitter.documents", "embedder.documents")
indexing_pipeline.connect("embedder.documents", "writer.documents")

# This case references Google V Sonos, October 2023
urls = ["https://cases.justia.com/federal/district-courts/california/candce/3:2020cv06754/366520/813/0.pdf"]

indexing_pipeline.run(data={"fetcher": {"urls": urls}})
```

## Building the query pipeline

Now the real fun begins. Let's create a query pipeline so we can actually start asking questions. We write a prompt allowing us to pass our documents to the Mixtral-8x7B LLM. Then we initiatialize the LLM via the `HuggingFaceTGIGenerator`.

In Haystack 2.0 `retriever`s are tightly coupled to `DocumentStores`. If we pass the document store in the `retriever` we initialized earlier, this pipeline can access those embeddings we generated, and pass them to the LLM.

```python

from haystack.components.generators import HuggingFaceTGIGenerator
from haystack.components.builders.prompt_builder import PromptBuilder

from jina_haystack.text_embedder import JinaTextEmbedder
prompt = """ Answer the question, based on the
content in the documents. If you can't answer based on the documents, say so.

Documents:
{% for doc in documents %}
  {{doc.content}}
{% endfor %}

question: {{question}}
"""

text_embedder = JinaTextEmbedder(model="jina-embeddings-v2-base-en")
generator = HuggingFaceTGIGenerator("mistralai/Mixtral-8x7B-Instruct-v0.1")
generator.warm_up()

prompt_builder = PromptBuilder(template=prompt)
query_pipeline = Pipeline()
query_pipeline.add_component("text_embedder",text_embedder)
query_pipeline.add_component(instance=prompt_builder, name="prompt_builder")
query_pipeline.add_component("retriever", retriever)
query_pipeline.add_component("generator", generator)

query_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
query_pipeline.connect("retriever.documents", "prompt_builder.documents")
query_pipeline.connect("prompt_builder.prompt", "generator.prompt")
```
Time to ask a question!

```python
question = "Summarize what happened in Google v. Sonos"

result = query_pipeline.run(data={"text_embedder":{"text": question},
                                  "retriever": {"top_k": 3},
                                  "prompt_builder":{"question": question},
                                  "generator": {"generation_kwargs": {"max_new_tokens": 350}}})

print(result['generator']['replies'][0])
```
```
Answer: Google v. Sonos is a patent infringement case in which Sonos sued Google for infringing on two of its patents related to customizing and saving overlapping groups of smart speakers or other zone players according to a common theme..
```

## Exploring more questions and documents

You can swap the `question` variable out and then call `pipeline.run` again:
- What role did If This Then That play in Google v. Sonos?
- What judge presided over Google v. Sonos?
- What should Sonos have done differently?

The indexing pipeline is written so that you can swap in other documents and analyze them. You can try plugging the following URLs (or any PDF written in English) into the indexing pipeline and re-running all the code blocks below it.
- Google v. Oracle: https://supreme.justia.com/cases/federal/us/593/18-956/case.pdf
- JACK DANIEL’S PROPERTIES, INC. v. VIP PRODUCTS
LLC: https://www.supremecourt.gov/opinions/22pdf/22-148_3e04.pdf

Note: if you want to change the prompt template, you'll also need to re-run the code blocks starting where the `DocumentStore` is defined.

## Wrapping it up

Thanks for reading! If you want to stay on top of the latest Haystack developments, you can [subscribe to our newsletter](https://landing.deepset.ai/haystack-community-updates) or [join our Discord community](https://discord.com/invite/haystack).

To learn more about the technologies used here, check out these blog posts:
- [Embeddings in Depth](https://jina.ai/news/embeddings-in-depth/)
- [What is text vectorization in NLP?](https://haystack.deepset.ai/blog/what-is-text-vectorization-in-nlp)
- [The definitive guide to BERT models](https://haystack.deepset.ai/blog/the-definitive-guide-to-bertmodels)
