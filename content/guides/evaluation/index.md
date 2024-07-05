---
layout: guide
# featured_image: /images/tutorials.png
# images: ["/images/tutorials.png"]
toc: True
title: "Evaluation"
description: A guided walkthrough to learn everything about evaluation in Haystack
date: 2024-07-04
---

Evaluation is crucial for developing and deploying LLM-based systems such as RAG applications and Agents, ensuring they are accurate, reliable, and effective. It ensures the information retrieved and generated is accurate, reducing the risk of irrelevant answers. 

Evaluation measures performance using metrics like precision, recall, and relevancy, providing a clear picture of your pipeline's strengths and weaknesses using LLMs or ground-truth labels.

Evaluating RAG systems can help understand performance bottlenecks and optimize one component at a time, for example, a Retriever or a prompt used with a Generator.

Here’s a step-by-step guide explaining what you need to evaluate, how you evaluate, and how you can improve your application after evaluation using Haystack!

## 1. Building your pipeline

Choose the required components based on your use case and create your Haystack pipeline. If you’re a beginner, start with [📚 Tutorial: Creating Your First QA Pipeline with Retrieval-Augmentation](https://haystack.deepset.ai/tutorials/27_first_rag_pipeline). If you’d like to explore different model providers, vector databases, retrieval techniques, and more with Haystack, pick an example from🧑‍🍳 [Haystack Cookbooks](https://github.com/deepset-ai/haystack-cookbook).

## 2. Human Evaluation

As the first step, perform **manual evaluation**. Test a few queries (5-10 queries) and manually assess the accuracy, relevance, coherence, format, and overall quality of your pipeline’s output. This will provide an initial understanding of how well your system performs and highlight any obvious issues.

To trace the data through each pipeline step, debug the intermediate components using the [include_outputs_from](https://docs.haystack.deepset.ai/reference/pipeline-api#pipelinerun) parameter. This feature is particularly useful for observing the retrieved documents or verifying the rendered prompt. By examining these intermediate outputs, you can pinpoint where issues may arise and identify specific areas for improvement, such as tweaking the prompt or trying out different models.

## 3. Deciding on Metrics

Evaluation metrics are crucial for measuring the effectiveness of your pipeline. Common metrics are:

- **Semantic Answer Similarity**: Evaluates the semantic similarity of the generated answer and the ground truth rather than their lexical overlap.
- **Context Relevancy**: Assesses the relevance of the retrieved documents to the query.
- **Faithfulness:** Evaluates to what extent a generated answer is based on retrieved documents
- **Context Precision**: Measures the accuracy of the retrieved documents.
- **Context Recall**: Measures the ability to retrieve all relevant documents.

Some metrics might require labeled data, while others can be evaluated using LLMs without needing labeled data. As you evaluate your pipeline, explore various types of metrics, such as [statistical](https://docs.haystack.deepset.ai/docs/statistical-evaluation) and [model-based](https://docs.haystack.deepset.ai/docs/model-based-evaluation) metrics, or incorporate custom metrics using LLMs with the [LLMEvaluator](https://docs.haystack.deepset.ai/docs/llmevaluator). 

|  | Retrieval Evaluation | Generation Evaluation | End-to-end Evaluation |
| --- | :---: | --- | :---: |
| Labeled data | [DocumentMAPEvaluator](https://docs.haystack.deepset.ai/docs/documentmapevaluator), [DocumentMRREvaluator](https://docs.haystack.deepset.ai/docs/documentmrrevaluator), [DocumentRecallEvaluator](https://docs.haystack.deepset.ai/docs/documentrecallevaluator) | - | [AnswerExactMatchEvaluator](https://docs.haystack.deepset.ai/docs/answerexactmatchevaluator), [SASEvaluator](https://docs.haystack.deepset.ai/docs/sasevaluator) |
| Unlabeled data (LLM-based) | [ContextRelevanceEvaluator](https://docs.haystack.deepset.ai/docs/contextrelevanceevaluator) | [FaithfulnessEvaluator](https://docs.haystack.deepset.ai/docs/faithfulnessevaluator)| [LLMEvaluator](https://docs.haystack.deepset.ai/docs/llmevaluator)** |

<p style="font-size: 1rem; font-style: italic; margin-top: -1rem;">** You need to provide the instruction and the examples to the LLM to evaluate your system.</p>
<figcaption>List of evaluation metrics that Haystack has built-in support</figcaption>

In addition to Haystack’s built-in evaluators, you can use metrics from other evaluation frameworks like [ragas](https://haystack.deepset.ai/integrations/ragas) and [DeepEval](https://haystack.deepset.ai/integrations/deepeval). For more detailed information on evaluation metrics, refer to 📖 [Docs: Evaluation](https://docs.haystack.deepset.ai/docs/evaluation). 

## 4. Building an Evaluation Pipeline

Build a pipeline with your evaluators. To learn about evaluating with Haystack’s evaluators, you can follow 📚 [Tutorial: Evaluating RAG Pipelines](https://haystack.deepset.ai/tutorials/35_evaluating_rag_pipelines). 

> 🧑‍🍳 As well as Haystack’s own evaluation metrics, you can also integrate a Haystack pipeline with many evaluation frameworks. See the integrations and examples below 👇
> 
> - [Evaluate with DeepEval](https://colab.research.google.com/github/deepset-ai/haystack-cookbook/blob/main/notebooks/rag_eval_deep_eval.ipynb)
> - [Evaluate with ragas](https://colab.research.google.com/github/deepset-ai/haystack-cookbook/blob/main/notebooks/rag_eval_ragas.ipynb)
> - [Evaluate with UpTrain](https://colab.research.google.com/github/deepset-ai/haystack-cookbook/blob/main/notebooks/rag_eval_uptrain.ipynb)

For step-by-step instructions, watch [our video walkthrough](https://youtu.be/5PrzXaZ0-qk?feature=shared) 🎥 👇

<iframe
  width="640"
  height="480"
  src="https://www.youtube.com/embed/5PrzXaZ0-qk"
  frameborder="0"
  allow="autoplay; encrypted-media"
  allowfullscreen
>
</iframe>

For a comprehensive evaluation, make sure to evaluate specific steps in the pipeline (e.g., retrieval or generation) and the performance of the entire pipeline. To get inspiration on evaluating your pipeline, have a look at 🧑🏼‍🍳 [Cookbook: Prompt Optimization with DSPy](https://github.com/deepset-ai/haystack-cookbook/blob/main/notebooks/prompt_optimization_with_dspy.ipynb), which explains the details of prompt optimization and evaluation, or read 📚 [Article: RAG Evaluation with Prometheus 2](https://haystack.deepset.ai/blog/rag-evaluation-with-prometheus-2), which explores using open LMs to evaluate with custom metrics.

## 5. Running Evaluation

Evaluate your pipeline with different parameters, change the `top_k` value, and try a different embedding model, play with the `temperature` to find what works best for your use case. If you need labeled data for evaluation, you can use some datasets that come with ground-truth documents and ground-truth answers. You can find some datasets on [Hugging Face datasets](https://huggingface.co/datasets) or in the [haystack-evaluation](https://github.com/deepset-ai/haystack-evaluation/tree/main/datasets) repository. 

Make sure to set up your evaluation environment so that it’s easy to evaluate using different parameters without much hassle. The [haystack-evaluation](https://github.com/deepset-ai/haystack-evaluation) repository provides examples with different architectures against various datasets. 

Read more about how you can optimize your pipeline by trying different parameter combinations in 📚 [Article: Benchmarking Haystack Pipelines for Optimal Performance](https://haystack.deepset.ai/blog/benchmarking-haystack-pipelines)

## 6. Analyzing Results

Visualize your data and your results to have a general understanding of your pipeline’s performance.

- Create a report using [EvaluationRunResult.score_report()](https://docs.haystack.deepset.ai/reference/evaluation-api#evaluationrunresult) and transform the evaluation results into a Pandas DataFrame with the aggregated scores for each metric:

![A table showing the aggregated Document MRR, Faithfulness and Semantic Answer Similarity scores](score-report.png#small)

- Use Pandas to analyze the results for different parameters (`top_k`, `batch_size`, `embedding_model`) in a comprehensive view
- Use libraries like Matplotlib or Seaborn to visually represent your evaluation results.
    
![Using box-plots makes sense when comparing different models](box-plot.png#medium "Using box-plots makes sense when comparing different models")

> Refer to 📚 [Benchmarking Haystack Pipelines for Optimal Performance: Results Analysis](https://haystack.deepset.ai/blog/benchmarking-haystack-pipelines#results-analysis) or 💻 [Notebook: Analyze ARAGOG Parameter Search](https://github.com/deepset-ai/haystack-evaluation/blob/main/evaluations/analyze_aragog_parameter_search.ipynb) to visualize evaluation results.
> 

## 7. Improving Your Pipeline

After evaluation, analyze the results to identify areas of improvement. Here are some methods:

### Methods to Improve Retrieval:

- **Data Cleaning**: Ensure your data is clean and well-structured before indexing using [DocumentCleaner](https://docs.haystack.deepset.ai/docs/documentcleaner) and [DocumentSplitter](https://docs.haystack.deepset.ai/docs/documentsplitter).
- **Data Quality:** Enrich the semantics of your documents by [embedding meaningful metadata](https://haystack.deepset.ai/tutorials/39_embedding_metadata_for_improved_retrieval) alongside the document's contents.
- **Metadata Filtering**: Limit the search space by using [metadata filters](https://docs.haystack.deepset.ai/docs/metadata-filtering) or extracting metadata from queries to use as filters. For more details, read 📚 [Article: Extract Metadata from Queries to Improve Retrieval](https://haystack.deepset.ai/blog/extracting-metadata-filter).
- **Different Embedding Models:** Compare different embedding models from different model providers. See the full list of supported embedding providers in [Embedders](https://docs.haystack.deepset.ai/docs/embedders).
- **Advanced Retrieval Techniques**: Leverage techniques like [hybrid retrieval](https://haystack.deepset.ai/tutorials/33_hybrid_retrieval), [sparse embeddings](https://docs.haystack.deepset.ai/docs/retrievers#sparse-embedding-based-retrievers), or [Hypothetical Document Embeddings (HYDE)](https://docs.haystack.deepset.ai/docs/hypothetical-document-embeddings-hyde).

### Methods to Improve Generation:

- **Ranking**: Incorporate a ranking mechanism into your retrieved documents before providing the context to your prompt
    - **Order by similarity**: Reorder your retrieved documents by similarity using cross-encoder models from Hugging Face with [TransformersSimilarityRanker](https://docs.haystack.deepset.ai/docs/transformerssimilarityranker), Rerank models from Cohere with [CohereRanker](https://docs.haystack.deepset.ai/docs/cohereranker), or Rerankers from Jina with [JinaRanker](https://docs.haystack.deepset.ai/docs/jinaranker)
    - **Increase diversity by ranking**: Maximize the overall diversity among your context using sentence-transformers models with [SentenceTransformersDiversityRanker](https://docs.haystack.deepset.ai/docs/sentencetransformersdiversityranker) to help increase the semantic answer similarity (SAS) in LFQA applications.
    - **Address the "Lost in the Middle" problem by reordering**: Position the most relevant documents at the beginning and end of the context using [LostInTheMiddleRanker](https://docs.haystack.deepset.ai/docs/lostinthemiddleranker) to increase faithfulness.
- **Different Generators**: Try different large language models and benchmark the results. The full list of model providers is in [Generators](https://docs.haystack.deepset.ai/docs/generators).
- **Prompt Engineering**: Use few-shot prompts or provide more instructions to enable the exact match.

## 8. Monitoring:

Implement strategies for [tracing](https://docs.haystack.deepset.ai/docs/tracing) the application post-deployment. By integrating [LangfuseConnector](https://docs.haystack.deepset.ai/docs/langfuseconnector) into your pipeline, you can collect the queries, documents, and answers and use them to continuously evaluate your application. Learn more about pipeline monitoring in 📚 [Article: Monitor and trace your Haystack pipelines with Langfuse](https://haystack.deepset.ai/blog/langfuse-integration).
