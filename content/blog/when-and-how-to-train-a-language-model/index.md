---
layout: blog-post
title: When and How to Train Your Own Language Model
description: You’ll almost never have to train a language model from scratch.
featured_image: thumbnail.png
images: ["blog/when-and-how-to-train-a-language-model/thumbnail.png"]
toc: True
date: 2022-08-03
last_updated: 2022-08-03
authors:
  - Andrey A
canonical_url: https://www.deepset.ai/blog/when-and-how-to-train-a-language-model
# opengraph images
# images: [""]
tags: ["Prompting", "Generative AI"]
---


Many people, when considering whether to incorporate natural language processing functionality into their product, shy away from the perceived complexity of the task. Modern-day NLP operates with huge language models that learn from large amounts of data.

What many beginners don’t know, however, is that the vast majority of use cases  _don’t require_  training a new language model from scratch. There are already tens of thousands of pre-trained models freely available online, which can be used out of the box.

Still, there are many use cases that do benefit from fine-tuning or domain adaptation, which means refining a pre-trained language model on a smaller custom dataset. In this article, we’ll guide you through the process of experimenting with different language models and understanding when to train your own models.

## Recap: What Is a Language Model?

A  [language model](https://www.deepset.ai/blog/what-is-a-language-model)  is a computational, data-based representation of a natural language. Natural languages are languages that evolved from human usage (like English or Japanese), as opposed to constructed languages like those used for programming. With the help of language models, computers can process natural language.

A language model is not a knowledge base. Sometimes we can be misled into thinking that language models know things because they answer all our questions so eloquently. But in actuality, most language models are purely geared towards a human-like  _understanding_ of language, not the memorization of facts. Their perceived knowledge comes from the database that they operate on.

With the help of a framework like  [Haystack](https://haystack.deepset.ai/overview/intro), language models may be placed on top of any textual database. That’s why you could deploy any language model out of the box for your own use case, without modifying or training it any further.

## Working with Pre-trained Language Models

The  [Hugging Face model hub](https://huggingface.co/models)  is the go-to location for finding pre-trained language models — that is, models which have already been trained and are ready for use. You’ll find tens of thousands of models on the model hub, which differ in language, use case and size.

## Some Preliminary Considerations

We usually recommend experimenting with  _multiple_  models, to find the one that is best suited to your application, your overall system pipeline and your computing resources. To find the right models for your use case, it’s helpful to think about a couple of questions in advance:

-   Who are the prospective users and what can they expect from your system?
-   How fast does it need to be?
-   How accurate does it need to be?
-   What computing resources do you have?

The last three questions are relevant because they might put some restrictions on the size of the model that you can operate with. High-performing language models are usually very large, which means that they take up space on your hard drive, are slow to train and take longer to make a prediction. In the past years, the NLP field has come up with ingenious techniques for  [knowledge distillation](https://www.deepset.ai/blog/knowledge-distillation-with-haystack)  that make models  _smaller_  while retaining their  _prediction quality_.

Another point to consider is the shape of your data. Is it already neatly stored in some database, like  [Elasticsearch](https://www.deepset.ai/elasticsearch-integration)  or  [Weaviate](https://www.deepset.ai/weaviate-vector-search-engine-integration)? Or does it consist of a collection of documents in some folder on your desktop? In the latter case, you’ll probably want to perform some preprocessing. With just a few lines of code, Haystack lets you extract text from PDF or TXT files, as well as cleaning and splitting it into snippets of uniform length (have a look at  [this tutorial](https://haystack.deepset.ai/tutorials/08_preprocessing)  for details.)

## Experimenting with Different Models

Once you’ve chosen a couple of candidate models, it’s time to plug them into your pipeline and start evaluating them. To assess how suited the models’ capabilities are to your use case, it’s a good idea to prepare a few samples from your own data and  [annotate them](https://www.deepset.ai/blog/labeling-data-with-haystack-annotation-tool).

The importance of  _curating your own datasets_  cannot be overstated. Machine learning models revolve entirely around data. If they’re trained on low-quality data, the models themselves won’t be worth much. Similarly, you can only evaluate the quality of a model’s predictions if you have ground-truth labels against which those predictions can be compared.

Our  [evaluation mode](https://www.deepset.ai/blog/how-to-evaluate-question-answering)  outputs a couple of metrics that quantify a model’s prediction quality. If you’ve never evaluated an NLP model before, the  [F1 score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html)  is a pretty safe bet. It strikes a balance between  _precision_  (how many of the data points that the model assigned to a class actually belong to the class?) and  _recall_  (how many datapoints of a class did the model correctly assign to the class?) by taking their  [harmonic mean](https://en.wikipedia.org/wiki/Harmonic_mean), a mathematical average that works well with ratios. Now you can run your pipeline with different models and compare their F1 scores.

In our experience, out-of-the-box models perform reasonably well for most use cases. When it comes to  [question answering](https://www.deepset.ai/question-answering-use-case)  in English, for example, most of our users are perfectly happy with the prediction quality of  [our RoBERTa-base-SQuAD model](https://huggingface.co/deepset/roberta-base-squad2). But if the scores are too low for your liking, or you’re just feeling experimental, you could go a step further and fine-tune an existing model. In that case, the original score acts as a  [baseline](https://towardsdatascience.com/baseline-models-your-guide-for-model-building-1ec3aa244b8d)  against which you can compare your next generation models.

Sometimes, it’s hard to define what “good” really means. Is an F1 score of .75 good or bad? It depends! The best way to find out is to  _let your users judge_. While we know that involving your users at this early stage might be tricky, they can provide invaluable feedback. For example, you could set up different pipelines in  [deepset Cloud](https://www.deepset.ai/blog/announcing-deepset-cloud)  and let your users provide feedback directly in the interface. That will give you a much clearer idea of what your data can accomplish in combination with a pre-trained language model, and whether you might want to fine-tune it.

## When to Train Your Own Language Model

It will rarely be feasible to train your own Transformer-based language models from scratch. However, if you do have the data and computing resources to train a new BERT model for an  [underrepresented language](https://www.deepset.ai/blog/nlp-resources-beyond-english), be sure to share the model on the model hub, so that others can benefit from it too. You can read about our own experience training several Transformer-based language models for German  [here](https://www.deepset.ai/german-bert).

In most cases, however, you’ll want to look into  [domain adaptation](https://haystack.deepset.ai/guides/domain-adaptation)  and/or fine-tuning. While the industry has come to use the two terms interchangeably, they originally describe two different techniques: fine-tuning means further training a general-purpose, pre-trained model to accomplish a specific task, question answering for example. Domain adaptation, on the other hand, means further training a model to better understand a domain-specific language, like legal or scientific jargon.

If you find that the prediction quality of the existing models is not up to scratch — either because your use case is not captured well, or your documents use a domain-specific language not represented by the likes of FinBERT, LEGAL-BERT and SciBERT — then it’s time to annotate more data and use it to subject your pre-trained models to a few more training steps.

## How to Fine-tune a Language Model

If done correctly, fine-tuning can be a rewarding process. As you tweak your pre-trained model and feed it more use-case-specific data, its prediction quality will increase, at times dramatically.

You can fine-tune your model in Haystack with just a few lines of code. Find out how by following  [our tutorial](https://haystack.deepset.ai/tutorials/02_finetune_a_model_on_your_data). Here’s what else you should know about fine-tuning:

1.  **You’ll need more data.**  Unlike in the process above, where we employed user-specific data to  _evaluate_  a language model, for fine-tuning you’ll also need  _labeled data_  for training. The number of datapoints required depends on your use case, the size of the models and how diverse your overall dataset is. As an alternative (or complement) to annotating data, you could look into  [data augmentation](https://neptune.ai/blog/data-augmentation-nlp).
2.  **Fine-tuning (and model training in general) is an iterative process.** Evaluate your model once it’s been trained, and try to beat that score by  [tweaking some model parameters](https://www.deepset.ai/blog/parameter-tweaking-get-faster-answers-from-your-haystack-pipeline)  and training it again. To identify your ideal model settings, you’ll probably need to go through a few iterations of train-evaluate-tweak-repeat.  [Fine-tuning a model](https://haystack.deepset.ai/guides/domain-adaptation#finetuning)  in Haystack is as simple as calling .train() on an initialized model.
3.  **Pro-tip: experiment with smaller models rather than larger ones.**  To reduce the time consumed by iteratively training your models during fine-tuning, you’ll want to keep the model small. We often fine-tune a smaller version of a given architecture (say, BERT-base instead of BERT-large) to find the optimal  [hyperparameter](https://en.wikipedia.org/wiki/Hyperparameter_(machine_learning))  settings. Once you’ve found the right settings, you can apply them to the larger model.
4.  **Pro-tip: distill your models.**  Most use cases will benefit from smaller, faster models. That’s why we are huge fans of  [model distillation](https://www.deepset.ai/blog/knowledge-distillation-with-haystack). That technique lets you “distill” the knowledge from a larger model into a smaller one. The result is a model that’s  _faster_, more environmentally friendly, and cheaper to use in production. What’s not to like?

## The Case for Data Labeling

Many people underestimate the role data labeling can play in machine learning. It’s boring, monotonous, and can seem disappointingly manual when we expect our models to perform some kind of AI magic. That’s probably why we often see teams spend way too many hours trying to squeeze more out of their language models, when that time would actually be much better spent annotating some data.

What  _really_ makes for good models is annotated data, specifically “difficult” annotations, as they can teach your model to deal with cases that even humans find hard to handle.

While we’ll admit that annotation might not be the most fun work, there are tools to make the process easier for everyone. For example, the  [Haystack annotation tool](https://www.deepset.ai/annotation-tool-for-labeling-datasets)  provides the framework for a more streamlined process. Clear guidelines go a long way toward a well annotated and consistent dataset. It’s also valuable to engage with your own data intimately, as it will increase your understanding of the use case and why certain predictions may be hard for your model.

So to really drive the point home: we recommend investing in  _data annotation_  rather than model creation. Machine learning researchers have worked hard to come up with model architectures that emulate linguistic intuition faithfully, and new techniques are constantly emerging to make existing models smaller and faster. But you and your team’s expertise lies in your own data — and that is precisely the area where you can have the biggest impact on your models’ performance.

## Getting Started

Whether on a hosted platform like deepset Cloud or in your own setup, model training  _doesn’t have to be a burden_; it can actually be kind of fun. Annotate data, tweak some parameters and watch your language model as it becomes smarter and more adapted to your use case.

We have accompanied many different teams on their quest to make NLP work for them. Come talk to us about your project in  [our Discord community](https://haystack.deepset.ai/community), or check out  [the Haystack GitHub repository](https://github.com/deepset-ai/haystack).

If the process of evaluating and fine-tuning manually seems daunting and time-consuming,  [have a look at deepset Cloud](https://www.deepset.ai/deepset-cloud), our end-to-end platform for designing and deploying NLP-based solutions.

Finally, if you’re looking to learn more about modern NLP, make sure to  [download our free ebook](https://landing.deepset.ai/nlp-for-product-managers)  “NLP for Product Managers.”