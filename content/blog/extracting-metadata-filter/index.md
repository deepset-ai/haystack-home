---
layout: blog-post
title: "Advanced Retrieval: Extract Metadata from Queries to Improve Retrieval"
description: Use LLMs to extract metadata from queries to use as filters that improve retrieval in RAG applications. 
featured_image: thumbnail.png
alt_image: A colorful cartoon-style digital illustration of a V60 coffee filter displayed on a computer screen standing in front of an orange background. There are papers going into the filter.
images: ["blog/extracting-metadata-filter/thumbnail.png"]
toc: True
date: 2024-05-13
last_updated: 2024-05-13
authors:
  - David Batista
  - Bilge Yucel
tags: ["Retrieval", "RAG", "Advanced Use Cases"]
cookbook: extracting_metadata_filters_from_a_user_query.ipynb
---

> This is part one of the **Advanced Use Cases** series:
>
> 1️⃣ Extract Metadata from Queries to Improve Retrieval
>
> 2️⃣ [Query Expansion](/blog/query-expansion)
>
> 3️⃣ Query Decomposition 🔜
>
> 4️⃣ Automatic Metadata Enrichment 🔜


In Retrieval-Augmented Generation (RAG) applications, the retrieval step, which provides relevant context to your large language model (LLM), is vital for generating high-quality responses. There are possible ways of improving retrieval and **metadata filtering** is one of the easiest ways. [Metadata filtering](https://docs.haystack.deepset.ai/docs/metadata-filtering), the approach of limiting the search space based on some concrete metadata,  can really enhance the quality of the retrieved documents. Here are some advantages of using metadata filtering:

1. **Relevance**: Metadata filtering narrows down the information being retrieved. This ensures that the generated responses align with the specific query or topic.
2. **Accuracy**: Filtering based on metadata such as domain, source, date, or topic guarantees that the information used for generation is accurate and trustworthy. This is particularly important for applications where accuracy is paramount. For instance, if you need information about a specific year, using the year as a metadata filter will retrieve only pertinent data.
3. **Efficiency**: Eliminating irrelevant or low-quality information boosts the efficiency of your RAG application, reduces the amount of processing needed, and speeds up retrieval response times.

You have two options for applying the metadata filter: you can either specify it directly when running the pipeline or, you can extract it from the query itself. In this article, we'll focus on extracting  filters from a query to improve the quality of generated responses in RAG applications. Let's get started.

## Introduction to Metadata Filters

First things first, what is metadata? Metadata (or meta tag) is actually data about your data, used to categorize, sort, and filter information based on various attributes such as date, topic, source, or any other information that you find relevant. After incorporating meta information into your data, you can apply filters to queries used with [Retrievers](https://docs.haystack.deepset.ai/docs/retrievers) to limit the scope of your search based on this metadata and ensure that your answers come from a specific slice of your data. 

Imagine that you have following Documents in your document store:

```python
documents = [
    Document(
        content="Some text about revenue increase",
        meta={"year": 2022, "company": "Nvidia", "name":"A"}),
    Document(
        content="Some text about revenue increase",
        meta={"year": 2023, "company": "Nvidia", "name":"B"}),
    Document(
        content="Some text about revenue increase",
        meta={"year": 2022, "company": "BMW", "name":"C"}),
    Document(
        content="Some text about revenue increase",
        meta={"year": 2023, "company": "BMW", "name":"D"}),
    Document(
        content="Some text about revenue increase",
        meta={"year": 2022, "company": "Mercedes", "name":"E"}),
    Document(
        content="Some text about revenue increase",
        meta={"year": 2023, "company": "Mercedes", "name":"F"}),
]
```

When the query is “_Causes of the revenue increase_”, the retriever returns all documents as they all contain some information about revenue. However, the metadata filter below ensures that any returned document by the retriever has a value of `2022` in the `year` metadata field and either `BMW` or `Mercedes` in the `company` metadata field. So, only documents with name “**C**” and “**E**” are retrieved.

```python
pipeline.run(
    data={
        "retriever":{
            "query": "Causes of the revenue increase",
            "filters": {
                "operators": "AND",
                "conditions": [
                    {"field": "meta.year", "operator": "==", "value": "2022"},
                    {"field": "meta.company", "operator": "in", "value": ["BMW", "Mercedes"]}
                ]
            }
        }
    }
)
```

In this example, we pass the filter explicitly, but sometimes, the query itself might contain information that can be used as a metadata filter during the querying process. In this case, we need to *preprocess* the query to extract filters before we use it with a retriever.

## Extracting Metadata Filters from a Query

In LLM-based applications, queries are written in natural language. From time to time, they include valuable hints that can be used as metadata filters to improve the retrieval. We can extract these hints, formulate them as metadata filters and use them with the retriever alongside the query. For instance, when the query is “*What was the revenue of Nvidia in 2022?*”, we can extract `2022` as `years` and `Nvidia` as `companies`. Based on this information, formulated metadata filter to use with a retriever should look like: 

```python
"filters": {
    "operators": "AND",
    "conditions": [
        {"field": "meta.years", "operator": "==", "value": "2022"},
        {"field": "meta.companies", "operator": "==", "value": "Nvidia"}
    ]
}
```

Thankfully, LLMs are highly capable of extracting structured information from unstructured text. Let’s see step-by-step how we can implement a custom component that uses an LLM to extract keywords, phrases, or entities from the query and formulate the metadata filter.

## Implementing `QueryMetadataExtractor`

> 🧑‍🍳 You can find and run all the code in our cookbook [Extrating Metadata Filter from a Query](https://github.com/deepset-ai/haystack-cookbook/blob/main/notebooks/extracting_metadata_filters_from_a_user_query.ipynb)

We start by creating a [custom component](https://docs.haystack.deepset.ai/docs/custom-components), `QueryMetadataExtractor`, which takes `query` and `metadata_fields` as inputs and outputs `filters`. This component encapsulates a generative pipeline, made up of [`PromptBuilder`](https://docs.haystack.deepset.ai/docs/promptbuilder) and [`OpenAIGenerator`](https://docs.haystack.deepset.ai/docs/openaigenerator). The pipeline instructs the LLM to extract keywords, phrases, or entities from a given query which can then be used as metadata filters. In the prompt, we include instructions to ensure the output format is in JSON and provide `metadata_fields` along with the `query` to ensure the correct entities are extracted from the query. 

Once the pipeline is initialized in the `init` method of the component, we post-process the LLM output in the `run` method. This step ensures the extracted metadata is correctly formatted to be used as a metadata filter.

```python
import json
from typing import Dict, List

from haystack import Pipeline, component
from haystack.components.builders import PromptBuilder
from haystack.components.generators import OpenAIGenerator

@component()
class QueryMetadataExtractor:

    def __init__(self):
        prompt = """
        You are part of an information system that processes users queries.
        Given a user query you extract information from it that matches a given list of metadata fields.
        The information to be extracted from the query must match the semantics associated with the given metadata fields.
        The information that you extracted from the query will then be used as filters to narrow down the search space
        when querying an index.
        Just include the value of the extracted metadata without including the name of the metadata field.
        The extracted information in 'Extracted metadata' must be returned as a valid JSON structure.
        ###
        Example 1:
        Query: "What was the revenue of Nvidia in 2022?"
        Metadata fields: {"company", "year"}
        Extracted metadata fields: {"company": "nvidia", "year": 2022}
        ###
        Example 2:
        Query: "What were the most influential publications in 2023 regarding Alzheimer's disease?"
        Metadata fields: {"disease", "year"}
        Extracted metadata fields: {"disease": "Alzheimer", "year": 2023}
        ###
        Example 3:
        Query: "{{query}}"
        Metadata fields: "{{metadata_fields}}"
        Extracted metadata fields:
        """
        self.pipeline = Pipeline()
        self.pipeline.add_component(name="builder", instance=PromptBuilder(prompt))
        self.pipeline.add_component(name="llm", instance=OpenAIGenerator(model="gpt-3.5-turbo"))
        self.pipeline.connect("builder", "llm")

    @component.output_types(filters=Dict[str, str])
    def run(self, query: str, metadata_fields: List[str]):
        result = self.pipeline.run({'builder': {'query': query, 'metadata_fields': metadata_fields}})
        metadata = json.loads(result['llm']['replies'][0])

        # this can be done with specific data structures and in a more sophisticated way
        filters = []
        for key, value in metadata.items():
            field = f"meta.{key}"
            filters.append({f"field": field, "operator": "==", "value": value})

        return {"filters": {"operator": "AND", "conditions": filters}}
```

First, let's test the `QueryMetadataExtractor` in isolation, passing a query and a list of metadata fields.

```python
extractor = QueryMetadataExtractor()

query = "What were the most influential publications in 2022 regarding Parkinson's disease?"
metadata_fields = {"disease", "year"}

result = extractor.run(query, metadata_fields)
print(result)
```

The result should look like this: 

```bash
{'filters': {'operator': 'AND',
  'conditions': [
    {'field': 'meta.disease', 'operator': '==', 'value': 'Alzheimers'},
    {'field': 'meta.year', 'operator': '==', 'value': 2023}
  ]}
}
```

Notice that the `QueryMetadataExtractor` has extracted the metadata fields from the query and returned them in a format that can be used as filters passed directly to a `Retriever`. By default, the `QueryMetadataExtractor` will use all metadata fields as conditions together with an `AND` operator.

## Using `QueryMetadataExtractor` in a Pipeline

Now, let's plug the `QueryMetadataExtractor` into a `Pipeline` with a `Retriever` connected to a `DocumentStore` to see how it works in practice.

We start by creating a [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/docs/inmemorydocumentstore) and adding some documents to it. We include info about “year” and “disease” in the “meta” field of each document. 

```python
from haystack import Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.document_stores.types import DuplicatePolicy

documents = [
    Document(
        content="some publication about Alzheimer prevention research done over 2023 patients study",
        meta={"year": 2022, "disease": "Alzheimer", "author": "Michael Butter"}),
    Document(
        content="some text about investigation and treatment of Alzheimer disease",
        meta={"year": 2023, "disease": "Alzheimer", "author": "John Bread"}),
    Document(
        content="A study on the effectiveness of new therapies for Parkinson's disease",
        meta={"year": 2022, "disease": "Parkinson", "author": "Alice Smith"}
    ),
    Document(
        content="An overview of the latest research on the genetics of Parkinson's disease and its implications for treatment",
        meta={"year": 2023, "disease": "Parkinson", "author": "David Jones"}
    )
]

document_store = InMemoryDocumentStore(bm25_algorithm="BM25Plus")
document_store.write_documents(documents=documents, policy=DuplicatePolicy.OVERWRITE)
```

We then create a pipeline consisting of the `QueryMetadataExtractor` and a [`InMemoryBM25Retriever`](https://docs.haystack.deepset.ai/docs/inmemoryembeddingretriever) connected to the `InMemoryDocumentStore` created above.

> Learn about connecting components and creating pipelines in [Docs: Creating Pipelines](https://docs.haystack.deepset.ai/docs/creating-pipelines).
> 

```python
from haystack import Pipeline, Document
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever

retrieval_pipeline = Pipeline()
metadata_extractor = QueryMetadataExtractor()
retriever = InMemoryBM25Retriever(document_store=document_store)

retrieval_pipeline.add_component(instance=metadata_extractor, name="metadata_extractor")
retrieval_pipeline.add_component(instance=retriever, name="retriever")
retrieval_pipeline.connect("metadata_extractor.filters", "retriever.filters")
```

Now define a query and metadata fields and pass them to the pipeline:

```python
query = "publications 2023 Alzheimer's disease"
metadata_fields = {"year", "author", "disease"}

retrieval_pipeline.run(data={"metadata_extractor": {"query": query, "metadata_fields": metadata_fields}, "retriever":{"query": query}})
```

This returns only documents whose metadata field `year = 2023` and `disease = Alzheimer` 

```python
{'documents': 
 [Document(
     id=e3b0bfd497a9f83397945583e77b293429eb5bdead5680cc8f58dd4337372aa3, 
     content: 'some text about investigation and treatment of Alzheimer disease', 
     meta: {'year': 2023, 'disease': 'Alzheimer', 'author': 'John Bread'}, 
     score: 2.772588722239781)]
     }
```

## Conclusion

Metadata filtering stands out as a powerful technique for improving the relevance and accuracy of retrieved documents, thus enabling the generation of high-quality responses in RAG applications. Using the custom component `QueryMetadataExtractor` we implemented, we can extract filters from user queries and directly use them with Retrievers.

This article was part one of the **Advanced Use Cases** series. If you want to stay on top of the latest Haystack developments, you can [subscribe to our newsletter](https://landing.deepset.ai/haystack-community-updates) or [join our Discord community](https://discord.gg/DzJEUKkuHp) 💙
