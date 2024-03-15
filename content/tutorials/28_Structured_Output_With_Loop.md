---
layout: tutorial
featured: True
featured_image: /images/tutorials.png
images: ["/images/tutorials.png"]
haystack_version: "latest"
haystack_2: True
hidden: False
sitemap_exclude: False
colab: https://colab.research.google.com/github/deepset-ai/haystack-tutorials/blob/main/tutorials/28_Structured_Output_With_Loop.ipynb
toc: True
title: "Generating Structured Output with Loop-Based Auto-Correction"
lastmod: "2024-03-12"
level: "intermediate"
weight: 71
description: Learn how to extract structured data using an LLM, and to validate the generated output against a predefined schema.
category: "QA"
aliases: []
download: "/downloads/28_Structured_Output_With_Loop.ipynb"
completion_time: 15 min
created_at: 2023-11-30
---
    


- **Level**: Intermediate
- **Time to complete**: 15 minutes
- **Prerequisites**: You must have an API key from an active OpenAI account as this tutorial is using the gpt-3.5-turbo model by OpenAI.
- **Components Used**: `PromptBuilder`, `OpenAIGenerator`, `OutputValidator` (Custom component)
- **Goal**: After completing this tutorial, you will have built a system that extracts unstructured data, puts it in a JSON schema, and automatically corrects errors in the JSON output from a large language model (LLM) to make sure it follows the specified structure.

> This tutorial uses Haystack 2.0. To learn more, read the [Haystack 2.0 announcement](https://haystack.deepset.ai/blog/haystack-2-release) or visit the [Haystack 2.0 Documentation](https://docs.haystack.deepset.ai/docs/intro)..

## Overview
This tutorial demonstrates how to use Haystack 2.0's advanced [looping pipelines](https://docs.haystack.deepset.ai/v2.0/docs/pipelines#loops) with LLMs for more dynamic and flexible data processing. You'll learn how to extract structured data from unstructured data using an LLM, and to validate the generated output against a predefined schema.

This tutorial uses `gpt-3.5-turbo` to change unstructured passages into JSON outputs that follow the [Pydantic](https://github.com/pydantic/pydantic) schema. It uses a custom OutputValidator component to validate the JSON and loop back to make corrections, if necessary.

## Preparing the Colab Environment

Enable the debug mode of logging:


```python
import logging

logging.basicConfig()
logging.getLogger("canals.pipeline.pipeline").setLevel(logging.DEBUG)
```

## Installing Dependencies
Install Haystack 2.0 and [colorama](https://pypi.org/project/colorama/) with pip:


```bash
%%bash

pip install haystack-ai
pip install colorama
```

### Enabling Telemetry

Enable telemetry to let us know you're using this tutorial. (You can always opt out by commenting out this line). For details, see [Telemetry](https://docs.haystack.deepset.ai/docs/telemetry).


```python
from haystack.telemetry import tutorial_running

tutorial_running(28)
```

## Defining a Schema to Parse the JSON Object

Define a simple JSON schema for the data you want to extract from a text passsage using the LLM. As the first step, define two [Pydantic models](https://docs.pydantic.dev/1.10/usage/models/), `City` and `CitiesData`, with suitable fields and types.


```python
from typing import List
from pydantic import BaseModel


class City(BaseModel):
    name: str
    country: str
    population: int


class CitiesData(BaseModel):
    cities: List[City]
```

> You can change these models according to the format you wish to extract from the text.

Then, generate a JSON schema from Pydantic models using `schema_json()`. You will later on use this schema in the prompt to instruct the LLM.

To learn more about the JSON schemas, visit [Pydantic Schema](https://docs.pydantic.dev/1.10/usage/schema/).  


```python
json_schema = CitiesData.schema_json(indent=2)
```

## Creating a Custom Component: OutputValidator

`OutputValidator` is a custom component that validates if the JSON object the LLM generates complies with the provided [Pydantic model](https://docs.pydantic.dev/1.10/usage/models/). If it doesn't, OutputValidator returns an error message along with the incorrect JSON object to get it fixed in the next loop.

For more details about custom components, see [Creating Custom Components](https://docs.haystack.deepset.ai/v2.0/docs/custom-components).


```python
import json
import random
import pydantic
from pydantic import ValidationError
from typing import Optional, List
from colorama import Fore
from haystack import component

# Define the component input parameters
@component
class OutputValidator:
    def __init__(self, pydantic_model: pydantic.BaseModel):
        self.pydantic_model = pydantic_model
        self.iteration_counter = 0

    # Define the component output
    @component.output_types(valid_replies=List[str], invalid_replies=Optional[List[str]], error_message=Optional[str])
    def run(self, replies: List[str]):

        self.iteration_counter += 1

        ## Try to parse the LLM's reply ##
        # If the LLM's reply is a valid object, return `"valid_replies"`
        try:
            output_dict = json.loads(replies[0])
            self.pydantic_model.parse_obj(output_dict)
            print(
                Fore.GREEN
                + f"OutputValidator at Iteration {self.iteration_counter}: Valid JSON from LLM - No need for looping: {replies[0]}"
            )
            return {"valid_replies": replies}

        # If the LLM's reply is corrupted or not valid, return "invalid_replies" and the "error_message" for LLM to try again
        except (ValueError, ValidationError) as e:
            print(
                Fore.RED
                + f"OutputValidator at Iteration {self.iteration_counter}: Invalid JSON from LLM - Let's try again.\n"
                f"Output from LLM:\n {replies[0]} \n"
                f"Error from OutputValidator: {e}"
            )
            return {"invalid_replies": replies, "error_message": str(e)}
```

Then, create an OutputValidator instance with `CitiesData` that you have created before.


```python
output_validator = OutputValidator(pydantic_model=CitiesData)
```

## Creating the Prompt

Write instructions for the LLM for converting a passage into a JSON format. Ensure the instructions explain how to identify and correct errors if the JSON doesn't match the required schema. Once you create the prompt, initialize PromptBuilder to use it.  

For information about Jinja2 template and PromptBuilder, see [PromptBuilder](https://docs.haystack.deepset.ai/v2.0/docs/promptbuilder).


```python
from haystack.components.builders import PromptBuilder

prompt_template = """
Create a JSON object from the information present in this passage: {{passage}}.
Only use information that is present in the passage. Follow this JSON schema, but only return the actual instances without any additional schema definition:
{{schema}}
Make sure your response is a dict and not a list.
{% if invalid_replies and error_message %}
  You already created the following output in a previous attempt: {{invalid_replies}}
  However, this doesn't comply with the format requirements from above and triggered this Python exception: {{error_message}}
  Correct the output and try again. Just return the corrected output without any extra explanations.
{% endif %}
"""
prompt_builder = PromptBuilder(template=prompt_template)
```

## Initalizing the Generator

[OpenAIGenerator](https://docs.haystack.deepset.ai/v2.0/docs/openaigenerator) generates
text using OpenAI's `gpt-3.5-turbo` model by default. Set the `OPENAI_API_KEY` variable and provide a model name to the Generator.


```python
import os
from getpass import getpass

from haystack.components.generators import OpenAIGenerator

os.environ["OPENAI_API_KEY"] = getpass("Enter OpenAI API key: ")
generator = OpenAIGenerator()
```

## Building the Pipeline

Add all components to your pipeline and connect them. Add connections from `output_validator` back to the `prompt_builder` for cases where the produced JSON doesn't comply with the JSON schema. Set `max_loops_allowed` to avoid infinite looping.


```python
from haystack import Pipeline

pipeline = Pipeline(max_loops_allowed=5)

# Add components to your pipeline
pipeline.add_component(instance=prompt_builder, name="prompt_builder")
pipeline.add_component(instance=generator, name="llm")
pipeline.add_component(instance=output_validator, name="output_validator")

# Now, connect the components to each other
pipeline.connect("prompt_builder", "llm")
pipeline.connect("llm", "output_validator")
# If a component has more than one output or input, explicitly specify the connections:
pipeline.connect("output_validator.invalid_replies", "prompt_builder.invalid_replies")
pipeline.connect("output_validator.error_message", "prompt_builder.error_message")
```

### Visualize the Pipeline

Draw the pipeline with the [`draw()`](https://docs.haystack.deepset.ai/v2.0/docs/drawing-pipeline-graphs) method to confirm the connections are correct. You can find the diagram in the Files section of this Colab.


```python
pipeline.draw("auto-correct-pipeline.png")
```

## Testing the Pipeline

Run the pipeline with an example passage that you want to convert into a JSON format and the `json_schema` you have created for `CitiesData`. For the given example passage, the generated JSON object should be like:
```json
{
  "cities": [
    {
      "name": "Berlin",
      "country": "Germany",
      "population": 3850809
    },
    {
      "name": "Paris",
      "country": "France",
      "population": 2161000
    },
    {
      "name": "Lisbon",
      "country": "Portugal",
      "population": 504718
    }
  ]
}
```
The output of the LLM should be compliant with the `json_schema`. If the LLM doesn't generate the correct JSON object, it will loop back and try again.


```python
passage = "Berlin is the capital of Germany. It has a population of 3,850,809. Paris, France's capital, has 2.161 million residents. Lisbon is the capital and the largest city of Portugal with the population of 504,718."
result = pipeline.run({"prompt_builder": {"passage": passage, "schema": json_schema}})
```

> If you encounter `PipelineMaxLoops: Maximum loops count (5) exceeded for component 'prompt_builder'.` error, consider increasing the maximum loop count or simply rerun the pipeline.

### Print the Correct JSON
If you didn't get any error, you can now print the corrected JSON.


```python
valid_reply = result["output_validator"]["valid_replies"][0]
valid_json = json.loads(valid_reply)
print(valid_json)
```

🎉 Congratulations! You've built a system that generates structured JSON out of unstructured text passages, and auto-corrects it by using the looping functionality of Haystack pipelines.
