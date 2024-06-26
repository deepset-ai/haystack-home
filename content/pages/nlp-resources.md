---
title: NLP Resources
description: Some resources to get going with NLP.
header: dark
footer: dark
toc: true
layout: single
aliases: [/overview/nlp-resources]
---

Here are some links to resources about the core concepts of Natural Language Processing (NLP)
that will help you get started with Haystack.

## What is NLP?

Learn about what is possible when we apply computational power to language processing.

<div class="styled-table">

| Title                                                                                                                                                           | Type           | Author            | Description                                                                                                                              | Level        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| [Natural Language Processing (NLP)](https://www.ibm.com/cloud/learn/natural-language-processing#toc-nlp-tasks-K4EAXccS)                                         | Blog           | IBM               | High level introduction to the tasks, tools, and use cases of NLP.                                                                       | Beginner     |
| [Introduction to NLP](https://www.youtube.com/watch?v=s5zuplW8ua8)                                                                                              | Video          | Data Science Dojo | Covers many of the different tasks from part-of-speech tagging to the creation of word embeddings. Contains some probabilistic notation. | Intermediate |
| [Text Classification with NLP: Tf-Idf vs Word2Vec vs BERT](https://towardsdatascience.com/text-classification-with-nlp-tf-idf-vs-word2vec-vs-bert-41ff868d1794) | Blog with Code | Mauro Di Pietro   | Hands-on and in depth dive into text classification using TF-IDF, Word2Vec and BERT.                                                     | Intermediate |

</div>

## Search and Question Answering

There are many different flavors of search.
Learn the differences between them and understand how the task of question answering can improve the search experience.

<div class="styled-table">

| Title                                                                                                                  | Type | Author                 | Description                                                                                                                   | Level    |
| ---------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| [Question Answering at Scale With Haystack](https://www.deepset.ai/blog/haystack-question-answering-at-scale)          | Blog | Branden Chan (deepset) | High level description of the Retriever-Reader pipeline that gives some intuition about how it works, how it can be deployed. | Beginner |
| [Understanding Semantic Search](https://www.deepset.ai/blog/understanding-semantic-search)                             | Blog | Branden Chan (deepset) | Disambiguates search jargon and explains the differences between various styles of search.                                    | Beginner |
| [Haystack: The State of Search in 2021](https://www.deepset.ai/blog/haystack-the-state-of-search-in-2021)              | Blog | Branden Chan (deepset) | Description of the Retriever-Reader pipeline and an introduction to some complementary tasks.                                 | Beginner |
| [Modern Question Answering Systems Explained](https://www.deepset.ai/blog/modern-question-answering-systems-explained) | Blog | Branden Chan (deepset) | Illustrated deeper dive into the inner workings of the Reader model.                                                          | Beginner |
| [How to Build an Open-Domain Question Answering System?](https://lilianweng.github.io/posts/2020-10-29-odqa/)          | Blog | Lilian Weng            | Comprehensive look into the inner workings of a Question Answering system. Contains a lot of mathematical notation.           | Advanced |

</div>

## Text Vectorization and Embeddings

In NLP, text is often converted into a sequence of numbers called an embedding.
Learn how they are generated and why they are useful.

<div class="styled-table">

| Title                                                                                                                                  | Type | Author                 | Description                                                                                                | Level        |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------ |
| [What Is Text Vectorization? Everything You Need to Know](https://www.deepset.ai/blog/what-is-text-vectorization-in-nlp)               | Blog | Branden Chan (deepset) | High-level overview of text vectorization starting from TF-IDF to Transformers.                            | Beginner     |
| [Word Embeddings for NLP](https://towardsdatascience.com/word-embeddings-for-nlp-5b72991e01d4)                                         | Blog | Renu Khandelwal        | Gives good intuition of what word embeddings are and how we use them. Contains some helpful illustrations. | Intermediate |
| [Introduction to Word Embedding and Word2Vec](https://towardsdatascience.com/introduction-to-word-embedding-and-word2vec-652d0c2060fa) | Blog | Dhruvil Karani         | A deeper dive into the CBOW and Skip Gram versions of Word2Vec.                                            | Advanced     |

</div>

## BERT and Transformers

The majority of the latest NLP systems use a machine learning architecture called the Transformer.
BERT is one of the first models of this kind.
Learn why these were so revolutionary and how they work.

<div class="styled-table">

| Title                                                                                                                                                                             | Type          | Author          | Description                                                                                              | Level        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------- | -------------------------------------------------------------------------------------------------------- | ------------ |
| [From Language Model to Haystack Reader](/pipeline_nodes/reader#deeper-dive-from-language-model-to-haystack-reader)                                                               | Documentation | deepset         | High level overview of how language models, Readers and prediction heads are all related                 | Beginner     |
| [Intuitive Explanation of BERT- Bidirectional Transformers for NLP](https://towardsdatascience.com/intuitive-explanation-of-bert-bidirectional-transformers-for-nlp-cdc1efc69c1e) | Blog          | Renu Khandelwal | Touches upon many of the concepts that are essential to understanding how Transformers work.             | Beginner     |
| [A dummy’s guide to BERT](https://medium.com/swlh/bert-139acce0592d)                                                                                                              | Blog          | Nicole Nair     | A good high-level summary of the BERT paper.                                                             | Beginner     |
| [Learn About Transformers: A Recipe](https://elvissaravia.substack.com/p/learn-about-transformers-a-recipe?s=r)                                                                   | Blog          | Elvis Saravia   | Links to many other resources that give explanations or implementations of the Transformer architecture. | Intermediate |
| [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)                                                                                                | Blog          | Jay Alammar     | Excellent visualization of the inner workings of transformer models. Gets quite deep into details.       | Advanced     |
| [The Illustrated BERT, ELMo, and co. (How NLP Cracked Transfer Learning)](https://jalammar.github.io/illustrated-bert/)                                                           | Blog          | Jay Alammar     | Excellent visualization of the inner workings of language models. Gets quite deep into details.          | Advanced     |

</div>
