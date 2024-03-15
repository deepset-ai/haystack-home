---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/32_Classifying_Documents_and_Queries_by_Language.ipynb
toc: True
title: "Classifying Documents & Queries by Language"
lastmod: "2024-03-12"
level: "intermediate"
weight: 75
description: Learn how to classify documents and route queries by language, for both indexing and RAG pipelines
category: "QA"
aliases: []
download: "/downloads/32_Classifying_Documents_and_Queries_by_Language.ipynb"
completion_time: 15 min
created_at: 2024-02-06
---
    


- **Level**: Beginner
- **Time to complete**: 15 minutes
- **Components Used**: [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorydocumentstore), [`DocumentLanguageClassifier`](https://docs.haystack.deepset.ai/v2.0/docs/documentlanguageclassifier), [`MetadataRouter`](https://docs.haystack.deepset.ai/v2.0/docs/metadatarouter), [`DocumentWriter`](https://docs.haystack.deepset.ai/v2.0/docs/documentwriter), [`TextLanguageRouter`](https://docs.haystack.deepset.ai/v2.0/docs/textlanguagerouter), [`DocumentJoiner`](https://docs.haystack.deepset.ai/v2.0/docs/documentjoiner), [`InMemoryBM25Retriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemorybm25retriever), [`PromptBuilder`](https://docs.haystack.deepset.ai/v2.0/docs/promptbuilder), [`OpenAIGenerator`](https://docs.haystack.deepset.ai/v2.0/docs/openaigenerator)
- **Goal**: After completing this tutorial, you'll have learned how to build a Haystack pipeline to classify documents based on the (human) language they were written in.
- Optionally, at the end you'll also incorporate language clasification and query routing into a RAG pipeline, so you can query documents based on the language a question was written in.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro).


## Overview

In a gobalized society with over 7,000 human languages spoken worldwide today, handling multilingual input is a common use case for NLP applications.

Good news: Haystack has a [`DocumentLanguageClassifier`](https://docs.haystack.deepset.ai/v2.0/docs/documentlanguageclassifier) built in. This component detects the language a document was written in. This functionality lets you create *branches* in your Haystack pipelines, granting the flexibility to add different processing steps for each language. For example, you could use a LLM that performs better in German to answer German queries. Or, you could fetch only French restaurant reviews for your French users.

In this tutorial, you'll take a text samples from hotel reviews, written in different languages. The text samples will be made into Haystack documents and classified by language. Then each document will be written to a language-specific `DocumentStore`. To validate that the language detection is working correctly, you'll filter the document stores to display their contents.

In the last section, you'll build a multi-lingual RAG pipeline. The language of a question is detected, and only documents in that language are used to generate the answer. For this section, the [`TextLanguageRouter`](https://docs.haystack.deepset.ai/v2.0/docs/textlanguagerouter) will come in handy.


## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/v2.0/docs/enabling-gpu-acceleration)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/v2.0/docs/logging)

# Installing Haystack



```bash
%%bash

pip install haystack-ai
pip install langdetect
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/v2.0/docs/enabling-telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(32)
```

## Write Documents Into `InMemoryDocumentStore`

The following indexing pipeline writes French and English documents into their own `InMemoryDocumentStores` based on language.

Import the modules you'll need. Then instantiate a list of Haystack `Documents` that are snippets of hotel reviews in various languages.


```python
from haystack import Document, Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.classifiers import DocumentLanguageClassifier
from haystack.components.routers import MetadataRouter
from haystack.components.writers import DocumentWriter


documents = [
    Document(
        content="Super appartement. Juste au dessus de plusieurs bars qui ferment très tard. A savoir à l'avance. (Bouchons d'oreilles fournis !)"
    ),
    Document(
        content="El apartamento estaba genial y muy céntrico, todo a mano. Al lado de la librería Lello y De la Torre de los clérigos. Está situado en una zona de marcha, así que si vais en fin de semana , habrá ruido, aunque a nosotros no nos molestaba para dormir"
    ),
    Document(
        content="The keypad with a code is convenient and the location is convenient. Basically everything else, very noisy, wi-fi didn't work, check-in person didn't explain anything about facilities, shower head was broken, there's no cleaning and everything else one may need is charged."
    ),
    Document(
        content="It is very central and appartement has a nice appearance (even though a lot IKEA stuff), *W A R N I N G** the appartement presents itself as a elegant and as a place to relax, very wrong place to relax - you cannot sleep in this appartement, even the beds are vibrating from the bass of the clubs in the same building - you get ear plugs from the hotel -> now I understand why -> I missed a trip as it was so loud and I could not hear the alarm next day due to the ear plugs.- there is a green light indicating 'emergency exit' just above the bed, which shines very bright at night - during the arrival process, you felt the urge of the agent to leave as soon as possible. - try to go to 'RVA clerigos appartements' -> same price, super quiet, beautiful, city center and very nice staff (not an agency)- you are basically sleeping next to the fridge, which makes a lot of noise, when the compressor is running -> had to switch it off - but then had no cool food and drinks. - the bed was somehow broken down - the wooden part behind the bed was almost falling appart and some hooks were broken before- when the neighbour room is cooking you hear the fan very loud. I initially thought that I somehow activated the kitchen fan"
    ),
    Document(content="Un peu salé surtout le sol. Manque de service et de souplesse"),
    Document(
        content="Nous avons passé un séjour formidable. Merci aux personnes , le bonjours à Ricardo notre taxi man, très sympathique. Je pense refaire un séjour parmi vous, après le confinement, tout était parfait, surtout leur gentillesse, aucune chaude négative. Je n'ai rien à redire de négative, Ils étaient a notre écoute, un gentil message tout les matins, pour nous demander si nous avions besoins de renseignement et savoir si tout allait bien pendant notre séjour."
    ),
    Document(
        content="Céntrico. Muy cómodo para moverse y ver Oporto. Edificio con terraza propia en la última planta. Todo reformado y nuevo. Te traen un estupendo desayuno todas las mañanas al apartamento. Solo que se puede escuchar algo de ruido de la calle a primeras horas de la noche. Es un zona de ocio nocturno. Pero respetan los horarios."
    ),
]
```

Each language gets its own `DocumentStore`.


```python
en_document_store = InMemoryDocumentStore()
fr_document_store = InMemoryDocumentStore()
es_document_store = InMemoryDocumentStore()
```

The `DocumentLanguageClassifier` takes a list of languages. The `MetadataRouter` needs a dictionary of rules.  These rules specify which node to route a document to (in this case, which language-specific `DocumentWriter`), based on the document's metadata.

The keys of the dictionary are the names of the output connections, and the values are dictionaries that follow the format of [filtering expressions in Haystack.](https://docs.haystack.deepset.ai/v2.0/docs/metadata-filtering).



```python
language_classifier = DocumentLanguageClassifier(languages=["en", "fr", "es"])
router_rules = {"en": {"language": {"$eq": "en"}}, "fr": {"language": {"$eq": "fr"}}, "es": {"language": {"$eq": "es"}}}
router = MetadataRouter(rules=router_rules)
```


```python
en_writer = DocumentWriter(document_store=en_document_store)
fr_writer = DocumentWriter(document_store=fr_document_store)
es_writer = DocumentWriter(document_store=es_document_store)
```

Now that all the components have been created, instantiate the `Pipeline`. Add the components to the pipeline. Connect the outputs of one component to the input of the following component.


```python
indexing_pipeline = Pipeline()
indexing_pipeline.add_component(instance=language_classifier, name="language_classifier")
indexing_pipeline.add_component(instance=router, name="router")
indexing_pipeline.add_component(instance=en_writer, name="en_writer")
indexing_pipeline.add_component(instance=fr_writer, name="fr_writer")
indexing_pipeline.add_component(instance=es_writer, name="es_writer")


indexing_pipeline.connect("language_classifier", "router")
indexing_pipeline.connect("router.en", "en_writer")
indexing_pipeline.connect("router.fr", "fr_writer")
indexing_pipeline.connect("router.es", "es_writer")
```

Draw a diagram of the pipeline to see what the graph looks like.


```python
indexing_pipeline.draw("indexing_pipeline.png")
```

Run the pipeline and it will tell you how many documents were written in each language. Voila!


```python
indexing_pipeline.run(data={"language_classifier": {"documents": documents}})
```

### Check the Contents of Your Document Stores

You can check the contents of your document stores. Each one should only contain documents in the correct language.


```python
print("English documents: ", en_document_store.filter_documents())
print("French documents: ", fr_document_store.filter_documents())
print("Spanish documents: ", es_document_store.filter_documents())
```

## (Optional) Create a Multi-Lingual RAG pipeline

To build a multi-lingual RAG pipeline, you can use the[`TextLanguageRouter`](https://docs.haystack.deepset.ai/v2.0/docs/textlanguagerouter) to detect the language of the query. Then, fetch documents in that same language from the correct `DocumentStore`.

In order to do this you'll need an [OpenAI access token](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key), although this approach would also work with any other [generator Haystack supports](https://docs.haystack.deepset.ai/v2.0/docs/generators).


```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass("Enter OpenAI API key:")
```

Let's assume that all these reviews we put in our document stores earlier are for the same accommodation. A RAG pipeline will let you query for information about that apartment, in the language you choose.

Import the components you'll need for a RAG pipeline. Write a prompt that will be passed to our LLM, along with the relevant documents.


```python
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.components.joiners import DocumentJoiner
from haystack.components.builders import PromptBuilder
from haystack.components.generators import OpenAIGenerator
from haystack.components.routers import TextLanguageRouter

prompt_template = """
You will be provided with reviews for an accommodation.
Answer the question concisely based solely on the given reviews.
Reviews:
  {% for doc in documents %}
    {{ doc.content }}
  {% endfor %}
Question: {{ query}}
Answer:
"""
```

### Build the Pipeline

Create a new `Pipeline`. Add the following components:
- `TextLanguageRouter`
- `InMemoryBM25Retriever`. You'll need a retriever per language, since each language has its own `DocumentStore`.
- `DocumentJoiner`
- `PromptBuilder`
- `OpenAIGenerator`

> Note: The `BM25Retriever` essentially does keyword matching, which isn't as accurate as other search methods. In order to make the LLM responses more precise, you could refacctor your piplines to use an [`EmbeddingRetriever`](https://docs.haystack.deepset.ai/v2.0/docs/inmemoryembeddingretriever) which performs vector search over the documents.


```python
rag_pipeline = Pipeline()
rag_pipeline.add_component(instance=TextLanguageRouter(["en", "fr", "es"]), name="router")
rag_pipeline.add_component(instance=InMemoryBM25Retriever(document_store=en_document_store), name="en_retriever")
rag_pipeline.add_component(instance=InMemoryBM25Retriever(document_store=fr_document_store), name="fr_retriever")
rag_pipeline.add_component(instance=InMemoryBM25Retriever(document_store=es_document_store), name="es_retriever")
rag_pipeline.add_component(instance=DocumentJoiner(), name="joiner")
rag_pipeline.add_component(instance=PromptBuilder(template=prompt_template), name="prompt_builder")
rag_pipeline.add_component(instance=OpenAIGenerator(), name="llm")


rag_pipeline.connect("router.en", "en_retriever.query")
rag_pipeline.connect("router.fr", "fr_retriever.query")
rag_pipeline.connect("router.es", "es_retriever.query")
rag_pipeline.connect("en_retriever", "joiner")
rag_pipeline.connect("fr_retriever", "joiner")
rag_pipeline.connect("es_retriever", "joiner")
rag_pipeline.connect("joiner.documents", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder", "llm")
```

You can draw this pipeline and compare the architecture to the `indexing_pipeline` diagram we created earlier.


```python
rag_pipeline.draw("rag_pipeline.png")
```

Try it out by asking a question.


```python
en_question = "Is this apartment conveniently located?"

result = rag_pipeline.run({"router": {"text": en_question}, "prompt_builder": {"query": en_question}})
```


```python
print(result["llm"]["replies"][0])
```

How does the pipeline perform en español?


```python
es_question = "¿El desayuno es genial?"

result = rag_pipeline.run({"router": {"text": es_question}, "prompt_builder": {"query": es_question}})
```


```python
print(result["llm"]["replies"][0])
```

## What's next

If you've been following along, now you know how to incorporate language detection into query and indexing Haystack piplines. Go forth and build the international application of your dreams. 🗺️


If you liked this tutorial, there's more to learn about Haystack 2.0:
- [Serializing Haystack Pipelines](https://haystack.deepset.ai/tutorials/29_serializing_pipelines)
-  [Generating Structured Output with Loop-Based Auto-Correction](https://haystack.deepset.ai/tutorials/28_structured_output_with_loop)
- [Preprocessing Different File Types](https://haystack.deepset.ai/tutorials/30_file_type_preprocessing_index_pipeline)

To stay up to date on the latest Haystack developments, you can [sign up for our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=index_documents_based_on_language_tutorial).
