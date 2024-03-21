---
layout: blog-post
title: 'Level up Your RAG Application with Speaker Diarization'
description: Leverage speaker labels with AssemblyAI and Haystack
featured_image: thumbnail.png
images: ["blog/level-up-rag-with-speaker-diarization/thumbnail.png"]
alt_image: "'Level up Your RAG Application with Speaker Diarization' text with AssemblyAI and Haystack logos" 
toc: True
date: 2024-03-21
last_updated: 2024-03-21
authors:
  - Misra Turp
  - Bilge Yucel
tags: ["RAG", "Generative AI", "Multimodality"]
cookbook: using-speaker-diarization-with-assemblyai.ipynb
---

LLMs work wonders on text data. Using LLMs, you can get answers to complex questions on long documents without having to read the document or even do a CTRL+F search. But what if you work with audio or video recordings?

The easiest way is to provide the LLM with the transcription of the recording. That way you can capture everything that is uttered in the audio or video. But what about information that was not spoken?

On audio or video recordings with multiple speakers, only transcribing the recording will not provide all there is to know to the LLM. The data on how many people are speaking, what each of them says is lost in written format.

So is it not possible to use LLMs to their full potential with multi-speaker recordings? Of course it is with **Speaker Diarization**!

## Introduction to Speaker Diarization

With the [assemblyai-haystack Python package](https://pypi.org/project/assemblyai-haystack/) by [AssemblyAI](https://www.assemblyai.com/), this would take you only 10 minutes to build. The Speaker Diarization model lets you detect multiple speakers in an audio file and what each speaker said. Thanks to the built-in speaker diarization feature, you can get the transcript of your audio or video recording in plain format and also speaker annotated format where each utterance in the recording is attributed to a speaker. Here is what it looks like:

>...
>
> **Speaker B** : _Good morning._
> 
> **Speaker A**: _So what is it about the conditions right now that have caused this round of wildfires to affect so many people so far away?_
> 
> **Speaker B**: _Well, there's a couple of things. The season has been pretty dry already, and then the fact that we're getting hit in the US. Is because there's a couple of weather systems that are essentially channeling the smoke from those Canadian wildfires through Pennsylvania into the Mid Atlantic and the Northeast and kind of just dropping the smoke there._
>
> **Speaker A**: _So what is it in this haze that makes it harmful? And I'm assuming it is._
> 
> ...

Let’s first see the benefits of passing the speaker annotated transcription to the LLM with examples. And later, we will go through the code that you can use to build with speaker labeled transcription. 

For the comparison, we ran two RAG applications, one using the transcription of a recording and another speaker-labeled transcription to compare their responses. We'll call them transcription application and speaker application from now on.

> Here are the YouTube videos used in the examples:
> * Panel discussion on AI example audio: https://www.youtube.com/watch?v=z86LGEFyQpo
> * Netflix earnings call: https://www.youtube.com/watch?v=v5EjcFtq_bc
> * Working from home debate: https://youtu.be/w8aOZ8rBZ-E?si=pVbwDZoDLpBEcPlc


### #1: Using the speaker labels, we can get each person’s opinion separately

In this panel discussion, the speakers are talking about AI technology and how they leverage it in their own organizations. Around the midpoint of this discussion, they answer the moderator’s question on what they think about building AI in-house vs. using third party providers.

The transcription application can only comment on the general thoughts that were conveyed during the panel. It cannot make the distinction between different speakers’ opinions. Whereas the speaker application reports on the opinion of each speaker.

**Audio file: Panel** 👇

**Question: “What are each speakers' opinions on building in-house or using third parties?”**
|Transcription application | Speaker application|
|--------------------------| -------------------|
| "The speakers believe that there is no one-size-fits-all approach to building in-house or using third parties. They take a mixed approach, considering factors such as core IP, feasibility, and value. They emphasize the importance of being clear about how to use time and resources, and of collaboration and partnerships. They also acknowledge that there may be friction between different teams, but this can be mitigated through change management." | "Speaker A is interested in understanding how companies decide between building in-house solutions or using third parties. Speaker C believes that the decision depends on whether the component is part of the company's core IP and that a combination of market standards and in-house solutions is often used. Speaker D takes a mixed approach, using open source and partnering, and emphasizes the importance of embedding AI into the business. Speaker C thinks that the decision should be based on feasibility and value." |


In this other recording, there is a quick exchange of opinions on the matter of working from home versus returning to the office. The presenters in the studio are of the opinion that working from home is just as productive as working in an office but the guest on the phone line disagrees with them.

The transcription application is able to identify opposing views yet can only name the people holding an opinion if they are explicitly named in the recording. By using speaker labels, you can clearly identify all the views in a discussion as well as the speaker who voiced it.

**Audio file: Working from home debate 👇**

**Question: "What are the two opposing opinions and how many people are on each side?"**
|Transcription application | Speaker application |
|--------------------------| --------------------|
| The opposing opinions in the transcription are between those who believe that returning to the office full-time is necessary for collaboration and productivity, and those who believe that remote work can be just as effective and offers more flexibility. The first side, represented by Jim, is skeptical about returning to the office full-time and is concerned about the environmental impact of commuting. The second side, represented by the speaker, acknowledges the importance of collaboration but believes that a hybrid approach of remote and in-office work can be beneficial.| The opposing opinions are about the necessity of returning to the office and the balance of power between employees and managers. **Speaker A and Speaker C seem to be on the side of flexibility and remote work, while Speaker B is more open to the idea of returning to the office but acknowledges the need for flexibility.**|


### #2: Using the speaker labels, we can extract practical information from the file
One of the important things you might want to analyze in recordings with multiple speakers is how many speakers there are or what their role is in this recording.

Unless it is explicitly mentioned in the recording, the transcription application cannot tell the number of speakers. It can, at best, identify that there are multiple people in this recording:

**Audio file: Panel 👇**

**Question: "How many people are speaking in this recording?"**
|Transcription application | Speaker application |
|--------------------------| --------------------|
| There are multiple people speaking in this recording, but the exact number is not provided in the transcription. |There are three people speaking in this recording: Speaker A, Speaker B, and Speaker D. |


**Audio file: Netflix 👇**

**Question: "How many speakers and moderators are in this call?"**
|Transcription application | Speaker application |
|--------------------------| --------------------|
| There are four speakers and one moderator on this call. | There are three speakers in this call: Ted Sorandos, Greg Peters, and Spence Newman. Spencer Wong is the moderator. |



**Audio file: Working from home debate 👇**

**Question: "How many people are speaking in this recording?"**
|Transcription application | Speaker application |
|--------------------------| --------------------|
| The transcription does not provide enough information to determine the exact number of people speaking in this recording. | There are three people speaking in this recording. |

## Code explanation

Let’s now see how to build an application with speaker labels using Haystack and AssemblyAI. In this [Colab notebook](https://colab.research.google.com/github/deepset-ai/haystack-cookbook/blob/main/notebooks/using_speaker_diarization_with_assemblyai.ipynb), you will find the code if you’d like to get started quickly. 

[Haystack](https://github.com/deepset-ai/haystack) is an open-source Python framework for building production-ready LLM applications. It provides the tools needed to implement an end-to-end application and comes with the [AssemblyAI integration](https://haystack.deepset.ai/integrations/assemblyai) that allows you to incorporate transcription, summarization, and speaker labeling for audio data into your pipeline. For more, check out [Haystack documentation](https://docs.haystack.deepset.ai/docs/intro).

We will use haystack as well as [assemblyai-haystack package](https://pypi.org/project/assemblyai-haystack/) for this application. Install all required packages using pip.

```shell
pip install haystack
pip install assemblyai-haystack
pip install "sentence-transformers>=2.2.0"
```

Next, we will set up the pipeline with the `AssemblyAITranscriber` to generate the speaker-labeled transcription of any audio file we pass.

Check out the [documentation](https://www.assemblyai.com/docs/integrations/haystack) to find out more about the assemblyai-haystack Python package. 

To use this piece of code, make sure you create an [AssemblyAI account](https://www.assemblyai.com/) and get your free API key. You need an [access token from Hugging Face](https://huggingface.co/settings/tokens) to access the free Inference API as well. 

First, initialize the required Haystack components to index documents with embeddings:
* [`InMemoryDocumentStore`](https://docs.haystack.deepset.ai/docs/inmemorydocumentstore): to store your documents without external dependencies or extra setup
* [`AssemblyAITranscriber`](https://haystack.deepset.ai/integrations/assemblyai): to create speaker_labels for the given audio file and convert them into documents
* [`DocumentSplitter`](https://docs.haystack.deepset.ai/docs/documentsplitter): to split your documents into smaller chunks
* `SentenceTransformersDocumentEmbedder`: to create embeddings for each document using sentence-transformers models
* [`DocumentWriter`](https://docs.haystack.deepset.ai/docs/documentwriter): to write these documents into your document store

After creating all these components, initialize a Pipeline object, add these components to your pipeline, and `connect()` the components by indicating which component should be connected to which component next.

```python
from haystack.components.writers import DocumentWriter
from haystack.components.preprocessors import DocumentSplitter
from haystack.components.embedders import SentenceTransformersDocumentEmbedder
from haystack import Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from assemblyai_haystack.transcriber import AssemblyAITranscriber
from haystack.document_stores.types import DuplicatePolicy
from haystack.utils import ComponentDevice

speaker_document_store = InMemoryDocumentStore()
transcriber = AssemblyAITranscriber(api_key=ASSEMBLYAI_API_KEY)
speaker_splitter = DocumentSplitter(
    split_by = "sentence",
    split_length = 10,
    split_overlap = 1
)
speaker_embedder = SentenceTransformersDocumentEmbedder(device=ComponentDevice.from_str("cuda:0"))
speaker_writer = DocumentWriter(speaker_document_store, policy=DuplicatePolicy.SKIP)

indexing_pipeline = Pipeline()
indexing_pipeline.add_component(instance=transcriber, name="transcriber")
indexing_pipeline.add_component(instance=speaker_splitter, name="speaker_splitter")
indexing_pipeline.add_component(instance=speaker_embedder, name="speaker_embedder")
indexing_pipeline.add_component(instance=speaker_writer, name="speaker_writer")

indexing_pipeline.connect("transcriber.speaker_labels", "speaker_splitter")
indexing_pipeline.connect("speaker_splitter", "speaker_embedder")
indexing_pipeline.connect("speaker_embedder", "speaker_writer")
```

And then we’re ready to run this pipeline with any audio file. Make sure to set `speaker_labels` to True. It is also possible to get a summary of the contents of the audio file but we will not use it in this tutorial. We can set it to None or False.

```python
indexing_pipeline.run(
    {
        "transcriber": {
            "file_path": "/content/Netflix_Q4_2023_Earnings_Interview.mp3",
            "summarization": None,
            "speaker_labels": True
        },
    }
)
```

Next, it is time to set up the retrieval augmentation (RAG) pipeline for speaker labels. For a RAG pipeline, we need:
* `SentenceTransformersTextEmbedder`: To create an embedding for the user query using sentence-transformers models
* `InMemoryEmbeddingRetriever`: to retrieve `top_k` relevant documents to the user query
* `PromptBuilder`: to provide a RAG prompt template with instructions to be filled with retrieved documents and the user query
* `HuggingFaceTGIGenerator`: to infer models served through Hugging Face free Inference API or Hugging Face TGI

```python
from haystack.components.builders.prompt_builder import PromptBuilder
from haystack.components.generators import HuggingFaceTGIGenerator
from haystack.components.embedders import SentenceTransformersTextEmbedder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.utils import ComponentDevice

open_chat_prompt = """
GPT4 Correct User: You will be provided with a transcription of a recording with each sentence or group of sentences attributed to a Speaker by the word "Speaker" followed by a letter representing the person uttering that sentence. Answer the given question based on the given context.
If you think that given transcription is not enough to answer the question, say so.

Transcription:
{% for doc in documents %}
  {% if doc.meta["speaker"] %} Speaker {{doc.meta["speaker"]}}: {% endif %}{{doc.content}}
{% endfor %}
Question: {{ question }}
<|end_of_turn|>
GPT4 Correct Assistant:
"""

retriever = InMemoryEmbeddingRetriever(speaker_document_store)
text_embedder = SentenceTransformersTextEmbedder(device=ComponentDevice.from_str("cuda:0"))
answer_generator = HuggingFaceTGIGenerator("openchat/openchat-3.5-0106", generation_kwargs={"max_new_tokens":500})
prompt_builder = PromptBuilder(template=open_chat_prompt)
```

After creating all these components, as you did for the first pipeline, initialize a Pipeline object, add these components to your pipeline, and `connect()` the components by indicating which component should be connected to which component next. As you create the connections, sometimes, you need to be more explicit about the output and input names. Explicitly connect the “documents”  output of `retriever` with “documents” input of the `prompt_builder` to make the connection obvious as `prompt_builder` has two inputs (“documents” and “question” variables we defined in the prompt template).

```python
from haystack import Pipeline

speaker_rag_pipe = Pipeline()
speaker_rag_pipe.add_component("text_embedder", text_embedder)
speaker_rag_pipe.add_component("retriever", retriever)
speaker_rag_pipe.add_component("prompt_builder", prompt_builder)
speaker_rag_pipe.add_component("llm", answer_generator)

speaker_rag_pipe.connect("text_embedder.embedding", "retriever.query_embedding")
speaker_rag_pipe.connect("retriever.documents", "prompt_builder.documents")
speaker_rag_pipe.connect("prompt_builder.prompt", "llm.prompt")
```

Once it’s done, you can use the following code to test the results on your own examples. Change the `top_k` value based on how many relevant documents you’d like to provide to your LLM:

```python
question = "Who are the speakers in this recording?"

result = speaker_rag_pipe.run({
    "prompt_builder":{"question": question},
    "text_embedder":{"text": question},
    "retriever":{"top_k": 10}
})
result["llm"]["replies"][0]
```


## Conclusion

Thanks for reading! By combining the transcription capabilities of AssemblyAI with the power of Haystack, you can enhance your RAG systems with speaker labels, ensuring a more comprehensive and accurate understanding of the content. 

If you want to stay on top of the latest Haystack developments, you can [subscribe to our newsletter](https://landing.deepset.ai/haystack-community-updates?utm_campaign=developer-relations&utm_source=assembly-ai&utm_medium=article) or [join our Discord community](https://discord.com/invite/haystack). Don’t forget to [get your free API key](https://www.assemblyai.com/) from AssemblyAI and [subscribe to AssemblyAI’s YouTube channel](https://www.youtube.com/@AssemblyAI) for weekly videos and tutorials on the latest developments in the AI world.


