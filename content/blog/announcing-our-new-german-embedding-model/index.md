---
layout: blog-post
title: 'Mixedbread  🤝 deepset: Announcing our New German/English Embedding Model'
description: Learn about the new open-source German/English embedding model by deepset and Mixedbread
featured_image: thumbnail.png
images: ["blog/announcing-our-new-german-embedding-model/thumbnail.png"]
toc: True
date: 2024-07-18
last_updated:  2024-07-18
canonical_url: https://huggingface.co/blog/shadeMe/deepset-mixedbread-new-german-embedding-model
authors:
  - Madeesh Kannan
  - Sebastian Husch Lee
tags: ["Embeddings","Retrieval"]
---	

It's 2024 and yet, most models today are still primarily geared towards English speaking markets. Today, [deepset](https://deepset.ai) and [Mixedbread](https://www.mixedbread.ai/) are jointly announcing our latest contribution towards changing that landscape: A new open-source German/English embedding model - [deepset-mxbai-embed-de-large-v1](https://huggingface.co/mixedbread-ai/deepset-mxbai-embed-de-large-v1).

Our model is based on [intfloat/multilingual-e5-large](https://huggingface.co/intfloat/multilingual-e5-large) and was fine-tuned on 30+ million pairs of German data for retrieval tasks. On the [NDCG](https://www.evidentlyai.com/ranking-metrics/ndcg-metric)@10 metric, which compares the list of retrieval results against an ideally ordered list of expected results, our model not only sets a new standard for open-source German embedding models but is also competitive with commercial alternatives.  

|Model|Avg. Performance (NDCG@10)|Binary Support|MRL Support|
|-|-|-|-|
|**deepset-mxbai-embed-de-large-v1**|**51.7**|✅|✅|
|multilingual-e5-large|50.5|❌|❌|
|jina-embeddings-v2-base-de|50.0|✅|✅|
|Commercial Models|
|Cohere Multilingual v3| *52.4* |✅|-|


> To learn more and get a deeper dive into benchmarks on real-world data, [read our full announcement article with Mixedbread](https://www.mixedbread.ai/blog/deepset-mxbai-embed-de-large-v1).

## Storage and Inference Efficiency 

Beyond support for the German language, we also focused on improving the storage and inference efficiency of this new embedding model using the following methods:

**Matryoshka Representation Learning (MRL):** [Matryoshka representation learning](https://huggingface.co/blog/matryoshka) reduces the number of output dimensions in an embedding model without significant accuracy loss. This is done by modifying the loss function to prioritise the representation of important information in the initial dimensions of the embedding vector, enabling the truncation of later dimensions.

**Binary Quantization:** [Binary quantization](https://huggingface.co/blog/embedding-quantization)  reduces the size of each dimension by converting float32 values to binary values, significantly enhancing memory and disk space efficiency while retaining high performance during inference.

## Start Using it With Haystack

You can start using deepset-mxbai-embed-de-large-v1 today with the [SentenceTransformersDocumentEmbedder](https://docs.haystack.deepset.ai/docs/sentencetransformersdocumentembedder) and [SentenceTransformersTextEmbedder](https://docs.haystack.deepset.ai/docs/sentencetransformerstextembedder) components in Haystack, as well as the [Mixedbread integrations](https://haystack.deepset.ai/integrations/mixedbread-ai) of `MixedbreadDocumentEmbedder` and `MixedbreadTextEmbedder`:

### Use it with the Sentence Transformers Embedders

```python
from haystack.components.embedders import SentenceTransformersTextEmbedder, SentenceTransformersDocumentEmbedder

text_embedder = SentenceTransformersTextEmbedder(model="mixedbread-ai/deepset-mxbai-embed-de-large-v1")

document_embedder = SentenceTransformersDocumentEmbedder(model="mixedbread-ai/deepset-mxbai-embed-de-large-v1")
```  

### Use it with the Mixedbread Embedders

To start using this model with the [Mixedbread integration for Haystack](https://haystack.deepset.ai/integrations/mixedbread-ai), install `mixedbread-ai-haystack` and export your Mixedbread API key to `MXBAI_API_KEY`.

```python
from mixedbread_ai_haystack import  MixedbreadAITextEmbedder, MixedbreadAIDocumentEmbedder
from mixedbread_ai import EncodingFormat

text_embedder = MixedbreadAITextEmbedder( model="mixedbread-ai/deepset-mxbai-embed-de-large-v1",
                                          encoding_format=EncodingFormat.BINARY)

document_embedder = MixedbreadAIDocumentEmbedder(model="mixedbread-ai/deepset-mxbai-embed-de-large-v1",
                                                 encoding_format=EncodingFormat.BINARY)
```  

Like our influential [German BERT model](https://www.deepset.ai/german-bert), we hope that this state-of-the-art model will enable the German-speaking AI community to build innovative products in the field of retrieval-augmented generation (RAG) and beyond!

Join our [Discord community](https://discord.com/invite/VBpFzsgRVF) to explore Haystack.
