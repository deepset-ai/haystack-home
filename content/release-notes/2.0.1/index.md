---
layout: blog-post
title: Haystack 2.0.1
description: Release notes for Haystack 2.0.1
featured_image: release_notes.png
images: ["/release-notes/2.0.1/release_notes.png"]
toc: True
date: 2024-04-09
last_updated:  2024-04-09
tags: ["Release Notes"]
link: https://github.com/deepset-ai/haystack/releases/tag/v2.0.1
---	

## ⬆️ Upgrade Notes

-   The `HuggingFaceTGIGenerator` and `HuggingFaceTGIChatGenerator` components have been modified to be compatible with `huggingface_hub>=0.22.0`.

    If you use these components, you may need to upgrade the `huggingface_hub` library. To do this, run the following command in your environment: `pip install "huggingface_hub>=0.22.0"`

## 🚀 New Features

-   Adds `streaming_callback` parameter to `HuggingFaceLocalGenerator`, allowing users to handle streaming responses.
-   Introduce a new `SparseEmbedding` class which can be used to store a sparse vector representation of a Document. It will be instrumental to support Sparse Embedding Retrieval with the subsequent introduction of Sparse Embedders and Sparse Embedding Retrievers.

## ⚡️ Enhancement Notes

-   Set `max_new_tokens` default to 512 in Hugging Face generators.

-   In Jupyter notebooks, the image of the Pipeline will no longer be displayed automatically. The textual representation of the Pipeline will be displayed.

    To display the Pipeline image, use the `show` method of the Pipeline object.

## 🐛 Bug Fixes

-   The `test_comparison_in` test case in the base document store tests used to always pass, no matter how the `in` filtering logic was implemented in document stores. With the fix, the `in` logic is actually tested. Some tests might start to fail for document stores that don't implement the `in` filter correctly.
-   Put `HFTokenStreamingHandler` in a lazy import block in `HuggingFaceLocalGenerator`. This fixed some breaking core-integrations.
-   Fixes `Pipeline.run()` logic so Components that have all their inputs with a default are run in the correct order. This happened we gather a list of Components to run internally when running the Pipeline in the order they are added during creation of the Pipeline. This caused some Components to run before they received all their inputs.
-   Fixes `HuggingFaceTEITextEmbedder` returning an embedding of incorrect shape when used with a Text-Embedding-Inference endpoint deployed using Docker.
-   Add the `@component` decorator to `HuggingFaceTGIChatGenerator`. The lack of this decorator made it impossible to use the `HuggingFaceTGIChatGenerator` in a pipeline.
