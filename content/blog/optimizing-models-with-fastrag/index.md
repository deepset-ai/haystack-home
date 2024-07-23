---
layout: blog-post
title: "Optimizing Embedding Models on CPUs with Haystack and fastRAG"
description: Discover how to use optimized embedding models on CPUs to reduce latency, and improve throughput of retrieval and indexing 
featured_image: thumbnail.png
images: ["blog/optimizing-models-with-fastrag/thumbnail.png"]
toc: True
date: 2024-07-20
last_updated: 2024-07-20
authors:
  - Peter Izsak
  - Bilge Yucel
tags: ["Integration", "Embeddings", "Retrieval"]
---

The main and critical process of a RAG pipeline is the embedding process, which forms the foundation for efficient information retrieval by transforming raw text into machine-readable vector representations. Embedding models encode textual data into dense vectors, capturing semantic and contextual meaning, therefore, optimizing these models could improve our RAG application:

- ***Higher throughput***: useful for reducing the time needed for creating or updating your vectors store.
- ***Lower latency***: improves real-time experience as queries and re-ranking of documents is done online per user input.

This is where specialized frameworks, such as fastRAG by Intel Labs, come into play, offering enhancements tailored to specific hardware and use cases, and with the extensive feature-set offered by Haystack.

## fastRAG: Intel Labs’ Optimized Framework for Efficient RAG

[fastRAG](https://github.com/IntelLabs/fastRAG/tree/main) is a research framework developed by Intel Labs for efficient and optimized retrieval augmented generative pipelines. It incorporates state-of-the-art large language models (LLMs) and information retrieval capabilities. fastRAG is fully compatible with Haystack and includes 
novel and efficient retrieval augmented generation (RAG) modules designed for efficient deployment on Intel hardware, including client and server CPUs (Xeon) and the Intel Gaudi AI accelerator.

The fastRAG GitHub repository provides extensive documentation on each component available in the framework, comprehensive examples, and easy installation instructions for optimized backends. The framework utilizes optimized extensions to popular deep learning frameworks such as PyTorch.

One such extension is [Optimum Intel](https://github.com/huggingface/optimum-intel), an open-source library that extends the Hugging Face Transformers library and takes advantage of Intel® Advanced Vector Extensions 512 (Intel® AVX-512), Vector Neural Network Instructions (VNNI), and Intel® Advanced Matrix Extensions (Intel® AMX) on Intel CPUs to accelerate models. AMX accelerated inference is introduced in PyTorch 2.0 and the [Intel Extension for PyTorch (IPEX)](https://github.com/intel/intel-extension-for-pytorch).

## Optimization Process

The optimization process involves quantizing the model using a quantization method with a calibration dataset, and using an optimized backend like IPEX for Intel Xeon CPUs. A guide is provided for quantizing a model from scratch. Additionally, three quantized [BGE embedding models](https://huggingface.co/collections/Intel/bge-65e0910105caf76026a64cc9) are available on Intel's Hugging Face Model Hub.

## Components

fastRAG includes several unique components and has Bi-Encoder embedder components that use optimized models through Optimum-Intel:

- [IPEXSentenceTransformersDocumentEmbedder](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/embedders/ipex_embedder.py#L97) and [IPEXSentenceTransformersTextEmbedder](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/embedders/ipex_embedder.py#L109) - Embedder components that use an `int8` quantized embedding model and can embed `Document` and text inputs.
- [BiEncoderSimilarityRanker](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/rankers/bi_encoder_ranker.py#L11) - A bi-encoder similarity ranker that re-orders a list of documents given a query and an embedder. Bi-encoder models are used to encode documents and queries independently and are more efficient that cross-encoders.
- [IPEXBiEncoderSimilarityRanker](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/rankers/ipex_bi_encoder_ranker.py#L5) - An IPEX-based [BiEncoderSimilarityRanker](https://github.com/IntelLabs/fastRAG/blob/main/fastrag/rankers/bi_encoder_ranker.py#L11) to be used with an `int8` quantized embedding model.

## Accuracy and Performance

Retrieval accuracy is important in RAG pipelines. We evaluated the impact of optimization (quantization and calibration) on performance using the Rerank and Retrieval sub-tasks of **MTEB** with **3 BGE bi-encoder** embedding models. For the [BGE-large](https://huggingface.co/Intel/bge-large-en-v1.5-rag-int8-static) model, the optimization process marginally altered performance compared to the original model, as shown in the table.

|  | int8 | FP32 | %diff |
| --- | --- | --- | --- |
| Reranking | 0.5997 | 0.6003 | -0.108% |
| Retrieval | 0.5346 | 0.5429 | -1.53% |

Results for other BGE models can be found [here](https://huggingface.co/blog/intel-fast-embedding).

Let's compare encoding a large set of Wikipedia passages using two different models: 

- `BAAI/bge-large-en-v1.5` with Haystack's `SentenceTransformersDocumentEmbedder`
- `Intel/bge-large-en-v1.5-rag-int8-static` with fastRAG's IPEXSentenceTransformersDocumentEmbedder

The script below loads a dataset of Wikipedia passages, each around 100 tokens, and encodes 10,000 passages using the same model in both `fp32` and `int8` variants.

```python
import time
from datasets import load_dataset
from haystack import Document
from fastrag.embedders import IPEXSentenceTransformersDocumentEmbedder
from haystack.components.embedders import SentenceTransformersDocumentEmbedder

dataset = load_dataset("Tevatron/wikipedia-nq", split="train")
docs = [Document(content=doc["positive_passages"][0]["text"], meta={"title": doc["positive_passages"][0]["title"]}) for doc in dataset]

BATCH_SIZE_LIST = [4, 8, 16, 32, 64, 128, 256]

for BATCH_SIZE in BATCH_SIZE_LIST:
    print("Running with BATCH_SIZE:", BATCH_SIZE)
    ipex_doc_embedder = IPEXSentenceTransformersDocumentEmbedder(model="Intel/bge-large-en-v1.5-rag-int8-static", batch_size=BATCH_SIZE, max_seq_length=256, padding="max_length")
    haystack_doc_embedder = SentenceTransformersDocumentEmbedder(model="BAAI/bge-large-en-v1.5", batch_size=BATCH_SIZE)

    ipex_doc_embedder.warm_up()
    haystack_doc_embedder.warm_up()

    # Measure runtime for SentenceTransformersDocumentEmbedder
    start_time = time.time()
    documents_with_embeddings = haystack_doc_embedder.run(docs[:10000])
    end_time = time.time()
    haystack_doc_embedder_runtime = end_time - start_time

    # Measure runtime for IPEXSentenceTransformersDocumentEmbedder
    start_time = time.time()
    documents_with_embeddings = ipex_doc_embedder.run(docs[:10000])
    end_time = time.time()
    ipex_doc_embedder_runtime = end_time - start_time

    print("Runtime for SentenceTransformersDocumentEmbedder:", haystack_doc_embedder_runtime)
    print("Runtime for IPEXSentenceTransformersDocumentEmbedder:", ipex_doc_embedder_runtime)

```

The runtime results indicate that using the setup of fastRAG’s components, as demonstrated in the script above, leads to **x4.64 to** **x6.32** **speed-ups** in the embedding process when running on a single socket of a **Gen 4 Xeon CPU**, as shown in the table below:

| samples per batch | SentenceTransformersDocumentEmbedder | IPEXSentenceTransformersDocumentEmbedder | Speed-up |
| --- | --- | --- | --- |
| 4 | 417.09 | 89.92 | x4.64 |
| 8 | 290.80 | 62.54 | x4.65 |
| 16 | 233.21 | 48.90 | x4.77 |
| 32 | 217.49 | 38.87 | x5.60 |
| 64 | 205.91 | 35.71 | x5.77 |
| 128 | 216.12 | 34.21 | x6.32 |
| 256 | 221.29 | 35.26 | x6.27 |

> 💡 The performance of the quantized `int8` model highly depends on the structure of the data. For best performance, it is advised to use static shapes, meaning, and tokenized sequences of the same length. In addition, batching is highly effective when using CPU backends and it could also be combined with dynamic shapes. It's a matter of tuning the setup according to the data and hardware.


> 💡 We followed the instructions available [here](https://github.com/IntelLabs/fastRAG/tree/main/scripts/optimizations/embedders#running-instructions) when running the experiments, which includes using `numactl` and TCMalloc and used a single socket CPU.


Read the Intel fastRAG team’s [blog](https://huggingface.co/blog/intel-fast-embedding) with additional evaluations and performance benchmarking for more information.

## RAG with Optimized Embedding Models

In this section, we will explore how to utilize optimized models within a RAG pipeline. We will use embedder models to create the initial index more quickly than the standard `fp32` Hugging Face models. Additionally, we will demonstrate a simple Q&A pipeline that employs an optimized bi-encoder ranker. This ranker re-orders the retrieved documents to enhance the list of documents used in the LLM prompt, thereby improving the overall performance of the retrieval process.

### Installation

First, install fastRAG, Optimum Intel and Haystack via fastRAG:

```bash
pip install fastrag[intel]
```

### Indexing Data

We will start with initializing an in-memory data store and loading document embedder component from fastRAG. The `IPEXSentenceTransformersDocumentEmbedder` can be used just like any other document embedder in Haystack.

```python
from haystack import Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from fastrag.embedders import IPEXSentenceTransformersDocumentEmbedder, IPEXSentenceTransformersTextEmbedder

document_store = InMemoryDocumentStore()
doc_embedder = IPEXSentenceTransformersDocumentEmbedder(model="Intel/bge-large-en-v1.5-rag-int8-static")
doc_embedder.warm_up()
```

Now, let's load a dataset. We’ll use [bilgeyucel/seven-wonders](https://huggingface.co/datasets/bilgeyucel/seven-wonders) dataset that don’t need any further processing:

```python
from datasets import load_dataset
from haystack import Document

dataset = load_dataset("bilgeyucel/seven-wonders", split="train")
docs = [Document(content=doc["content"], meta=doc["meta"]) for doc in dataset]
```

Next, we embed the documents and write them to the index:

```python
documents_with_embeddings = doc_embedder.run(docs)
document_store.write_documents(documents_with_embeddings["documents"])
```

### RAG Pipeline

We continue to initialize components required to build a pipeline that represents a simple Q&A RAG example using an embedder, a retriever, a reranker, a prompt template, and a generator. Notably, the `IPEXSentenceTransformersTextEmbedder` and `IPEXBiEncoderSimilarityRanker` can be seamlessly integrated into a Haystack pipeline alongside other components.

> Learn how to create a basic RAG pipeline with Haystack [in this tutorial](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline).
> 

```python
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from fastrag.rankers import IPEXBiEncoderSimilarityRanker

query_embedder = IPEXSentenceTransformersTextEmbedder(model="Intel/bge-large-en-v1.5-rag-int8-static")
retriever = InMemoryEmbeddingRetriever(document_store)
reranker = IPEXBiEncoderSimilarityRanker("Intel/bge-small-en-v1.5-rag-int8-static")
```

We create a simple RAG prompt template:

```python
from haystack.components.builders import PromptBuilder

template = """
Given the following information, answer the question.

Context:
{% for document in documents %}
    {{ document.content }}
{% endfor %}

Question: {{question}}
Answer:
"""

prompt_builder = PromptBuilder(template=template)
```

Initialize a [HuggingFaceLocalGenerator](https://docs.haystack.deepset.ai/docs/huggingfacelocalgenerator) with [microsoft/Phi-3-mini-128k-instruct](https://huggingface.co/microsoft/Phi-3-mini-128k-instruct) model (`Phi-3` using a local Hugging Face model) to generate answers: 

```python
from haystack.components.generators import HuggingFaceLocalGenerator

generator = HuggingFaceLocalGenerator(model="microsoft/Phi-3-mini-128k-instruct",
                                      task="text-generation",
                                      generation_kwargs={
                                        "max_new_tokens": 100,
                                        "temperature": 0.2,
                                        })
```

Finally, we create the pipeline:

```python
from haystack import Pipeline

pipe = Pipeline()
pipe.add_component("retriever", retriever)
pipe.add_component("embedder", query_embedder)
pipe.add_component("reranker", reranker)
pipe.add_component("prompt_builder", prompt_builder)
pipe.add_component("llm", generator)

pipe.connect("embedder", "retriever")
pipe.connect("retriever", "reranker.documents")
pipe.connect("reranker", "prompt_builder.documents")
pipe.connect("prompt_builder", "llm")
```

### Try the Pipeline

Let’s try the pipeline with a real question:

```python
question = "What does Rhodes Statue look like?"

response = pipe.run({"text_embedder": {"text": question}, "prompt_builder": {"question": question}})

print(response["llm"]["replies"][0])

>>> [ENTER ANSWER]
```

## Summary

In conclusion, we've highlighted the significant advantages of CPU-optimized embedding models in terms of accuracy and performance, demonstrating how seamlessly these components can be incorporated into your Haystack pipeline. At the forefront of these advancements is `fastRAG`, a research library dedicated to integrating Intel-based optimizations into Haystack.

The `fastRAG` team provides in-depth information on the quantization process and extensive benchmarking conducted on 4th Gen Xeon processors. To dive deep into the optimizations, read this detailed [blog post](https://huggingface.co/blog/intel-fast-embedding).