---
layout: tutorial
featured: False
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: False
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/17_Audio.ipynb
toc: True
title: "Make Your QA Pipelines Talk!"
lastmod: "2023-06-29"
level: "intermediate"
weight: 90
description: Convert text Answers into speech.
category: "QA"
aliases: ['/tutorials/audio']
download: "/downloads/17_Audio.ipynb"
completion_time: False
created_at: 2022-06-07
---
    


- **Level**: Intermediate
- **Time to complete**: 15 minutes
- **Nodes Used**: `InMemoryDocumentStore`, `BM25Retriever`, `FARMReader`, `AnswerToSpeech`
- **Goal**: After completing this tutorial, you'll have created a extractive question answering system that can read out the answer.

>**Update:** AnswerToSpeech lives in the [text2speech](https://github.com/deepset-ai/haystack-extras/tree/main/nodes/text2speech) package. Main [Haystack](https://github.com/deepset-ai/haystack) repository doesn't include it anymore.

## Overview

Question answering works primarily on text, but Haystack provides some features for audio files that contain speech as well.

In this tutorial, we're going to see how to use `AnswerToSpeech` to convert answers into audio files.

## Preparing the Colab Environment

- [Enable GPU Runtime in Colab](https://docs.haystack.deepset.ai/docs/enabling-gpu-acceleration#enabling-the-gpu-in-colab)
- [Set logging level to INFO](https://docs.haystack.deepset.ai/docs/log-level)

## Installing Haystack

To start, let's install the latest release of Haystack with `pip`. In this tutorial, we'll use components from [text2speech](https://github.com/deepset-ai/haystack-extras/tree/main/nodes/text2speech) which contains some extra Haystack components, so we'll install `farm-haystack-text2speech`.


```bash
%%bash

pip install --upgrade pip
pip install farm-haystack[colab,preprocessing,inference]
pip install farm-haystack-text2speech
```

### Enabling Telemetry

Knowing you're using this tutorial helps us decide where to invest our efforts to build a better product but you can always opt out by commenting the following line. See [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry) for more details.


```python
from haystack.telemetry import tutorial_running

tutorial_running(17)
```

## Indexing Documents

We will populate the document store with a simple indexing pipeline. See [Tutorial: Build Your First Question Answering System](https://haystack.deepset.ai/tutorials/01_basic_qa_pipeline) for more details about these steps.


```python
from pathlib import Path
from haystack.document_stores import InMemoryDocumentStore
from haystack.utils import fetch_archive_from_http
from haystack.pipelines import Pipeline
from haystack.nodes import FileTypeClassifier, TextConverter, PreProcessor

# Initialize the DocumentStore
document_store = InMemoryDocumentStore(use_bm25=True)

# Get the documents
documents_path = "data/tutorial17"
s3_url = "https://s3.eu-central-1.amazonaws.com/deepset.ai-farm-qa/datasets/documents/wiki_gameofthrones_txt17.zip"
fetch_archive_from_http(url=s3_url, output_dir=documents_path)

# List all the paths
file_paths = [p for p in Path(documents_path).glob("**/*")]

# NOTE: In this example we're going to use only one text file from the wiki
file_paths = [p for p in file_paths if "Stormborn" in p.name]

# Prepare some basic metadata for the files
files_metadata = [{"name": path.name} for path in file_paths]

# Makes sure the file is a TXT file (FileTypeClassifier node)
classifier = FileTypeClassifier()

# Converts a file into text and performs basic cleaning (TextConverter node)
text_converter = TextConverter(remove_numeric_tables=True)

# - Pre-processes the text by performing splits and adding metadata to the text (Preprocessor node)
preprocessor = PreProcessor(clean_header_footer=True, split_length=200, split_overlap=20)

# Here we create a basic indexing pipeline
indexing_pipeline = Pipeline()
indexing_pipeline.add_node(classifier, name="classifier", inputs=["File"])
indexing_pipeline.add_node(text_converter, name="text_converter", inputs=["classifier.output_1"])
indexing_pipeline.add_node(preprocessor, name="preprocessor", inputs=["text_converter"])
indexing_pipeline.add_node(document_store, name="document_store", inputs=["preprocessor"])

# Then we run it with the documents and their metadata as input
indexing_pipeline.run(file_paths=file_paths, meta=files_metadata)
```

## Creating a QA Pipeline with AnswerToSpeech
   
Now we will create a pipeline very similar to the basic `ExtractiveQAPipeline` of [Tutorial: Build Your First Question Answering System](https://haystack.deepset.ai/tutorials/01_basic_qa_pipeline), with the addition of a node that converts our answers into audio files: AnswerToSpeech. Once the answer is retrieved, we can also listen to the audio version of the document where the answer came from.


```python
from haystack.nodes import BM25Retriever, FARMReader
from text2speech import AnswerToSpeech

retriever = BM25Retriever(document_store=document_store)
reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2", use_gpu=True)
answer2speech = AnswerToSpeech(
    model_name_or_path="espnet/kan-bayashi_ljspeech_vits", generated_audio_dir=Path("./audio_answers")
)

audio_pipeline = Pipeline()
audio_pipeline.add_node(retriever, name="Retriever", inputs=["Query"])
audio_pipeline.add_node(reader, name="Reader", inputs=["Retriever"])
audio_pipeline.add_node(answer2speech, name="AnswerToSpeech", inputs=["Reader"])
```

## Asking a question!

Use the pipeline `run()` method to ask a question. The query argument is where you type your question. Additionally, you can set the number of documents you want the Reader and Retriever to return using the `top-k` parameter.


```python
prediction = audio_pipeline.run(
    query="Who is the father of Arya Stark?", params={"Retriever": {"top_k": 10}, "Reader": {"top_k": 5}}
)
```


```python
# Now you can print prediction
from pprint import pprint

pprint(prediction)
```


```python
# The document the first answer was extracted from
original_document = [doc for doc in prediction["documents"] if doc.id == prediction["answers"][0].document_ids[0]][0]
pprint(original_document)
```

## Hear Answers out!

Let's hear the answers and the context they are extracted from.


```python
from IPython.display import display, Audio
import soundfile as sf
```


```python
# The first answer in isolation

print("Answer: ", prediction["answers"][0].meta["answer_text"])

speech, _ = sf.read(prediction["answers"][0].answer)
display(Audio(speech, rate=24000))
```


```python
# The context of the first answer

print("Context: ", prediction["answers"][0].meta["context_text"])

speech, _ = sf.read(prediction["answers"][0].context)
display(Audio(speech, rate=24000))
```

🎉 Congratulations! You've learned how to create a extactive QA system that can read out the answer.
