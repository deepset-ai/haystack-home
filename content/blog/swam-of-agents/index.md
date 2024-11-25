---
layout: blog-post
title: "Create a Swarm of Agents"
description: Easy creation of multi-agent systems 
featured_image: thumbnail.png
alt_image: "Title text 'Create a Swarm of Agents', with a swarm of agents in the foreground"
images: ["blog/swarm-of-agents/thumbnail.png"]
toc: True
date: 2024-11-26
last_updated: 2024-11-26
authors:
  - Stefano Fiorucci
tags: ["Agent", "Function Calling"]
cookbook: swarm.ipynb
---

When building applications with Language Models, new patterns are emerging to bridge the gap between the statistical nature of these models and the deterministic logic of traditional programming. Haystack, as an AI framework, supports developers by providing abstractions that simplify this integration.

One of the most promising advances in this space is **Tool/function calling**, allowing a model to prepare calls for functions. We are working to standardize this capability across different model providers.

OpenAI **Swarm** is an educational framework that proposes lightweight techniques for creating and orchestrating multi-agent systems. In Swarm, Tool calling is used not only for interacting with external functions but also for enabling agents to exchange control dynamically.

In this article, we'll introduce the core concepts of Swarm (Routines and Handoffs) and implement them step by step using Haystack and its tool support. Along the way, we'll expand Swarm's functionality to support models from various providers (OpenAI, Anthropic and open models running locally via Ollama).

*You can find the full working example and code in the linked recipe from our [cookbook](https://haystack.deepset.ai/cookbook).*

## Starting simple: building an Assistant

*In this article we'll be using [`haystack-experimental`](https://github.com/deepset-ai/haystack-experimental?tab=readme-ov-file#experiments-catalog) components. Feel free to [join the discussion for these experimental components](https://github.com/deepset-ai/haystack-experimental/discussions/98).*

The first step toward building an Agent is creating an Assistant: think of it of Chat Language Model + a system prompt.

We can implement this as a lightweight dataclass with three parameters:

- name
- LLM (Haystack Chat Generator)
- instructions (these will constitute the system message)

```python
from haystack_experimental.components import OpenAIChatGenerator
from haystack_experimental.dataclasses import ChatMessage

@dataclass
class Assistant:
    name: str = "Assistant"
    llm: object = OpenAIChatGenerator()
    instructions: str = "You are a helpful Agent"

    def __post_init__(self):
        self._system_message = ChatMessage.from_system(self.instructions)

    def run(self, messages: list[ChatMessage]) -> list[ChatMessage]:
        new_message = self.llm.run(messages=[self._system_message] + messages)["replies"][0]

        if new_message.text:
            print(f"\\n{self.name}: {new_message.text}")

        return [new_message]
```

Let's create a Joker assistant, tasked with telling jokes.

```python
joker = Assistant(name="Joker", instructions="you are a funny assistant making jokes")

messages = []
print("Type 'quit' to exit")

while True:
    if not messages or messages[-1].role == ChatRole.ASSISTANT:
        user_input = input("User: ")
        if user_input.lower() == "quit":
            break
        messages.append(ChatMessage.from_user(user_input))

    new_messages = joker.run(messages)
    messages.extend(new_messages)
```

Let's see it in action 😀

```markdown
Type 'quit' to exit
User: hey!

Joker: Hey there! How's it going? Are you ready for some laughs, or are we saving the jokes for dessert? 🍰
User: where is Rome?

Joker: Rome is in Italy, but if you're asking me for directions, I might just say, “Take a left at the Colosseum and keep going until you smell pizza!” 🍕
User: quit
```

## Tools and Routines

In the context of applications based on Language Models, the term Agent is broadly defined.

However, to qualify as an Agent, a software application built on a Language Model should go beyond generating text; it should also be capable of performing actions, such as executing functions or calling APIs.

A popular way to achieve this is **Tool calling**:

1. We provide a set of tools (functions, APIs with a given spec) to the model.
2. The model prepares function calls based on user request and available tools.
3. The actual invocation is executed outside the model (at the Agent level).
4. The model can further elaborate on the result of the invocation.

Swarm introduces the concept of **routines**: natural-language instructions paired with the tools needed to execute them. 

Here's an example of a routine:

```markdown
# instructions
You are a customer support agent for ACME Inc.
Always answer in a sentence or less.
Follow the following routine with the user:
1. First, ask probing questions and understand the user's problem deeper.
 - unless the user has already provided a reason.
2. Propose a fix (make one up).
3. ONLY if not satesfied, offer a refund.
4. If accepted, search for the ID and then execute refund.

# tools needed
...
```

The authors emphasize that routines are simple yet robust. If they are small,  LLMs manage them effectively, offering the soft adherence: the model can guide conversations naturally without being constrained by rigid patterns or dead-ends.

### Implementation

Let's see how we can transform our Assistant into a Tool Calling Agent that can handle routines.

- `instructions` could already be passed to the Assistant, to guide its behavior.
- The Agent introduces a new init parameter called `functions`. These functions are automatically converted into Tools. The key difference is that, to be passed to a Language Model, a Tool must have a name, description, and a JSON schema specifying its parameters.
- During initialization, we also create a `ToolInvoker`. This Haystack component takes in Chat Messages containing prepared `tool_calls`, performs the tool invocation and wraps the results in Chat Message with `tool` role.
- What happens during `run`? The Agent first generates a response. If the response includes tool calls, these are executed, and the results are integrated into the conversation.
- The `while` loop manages user interactions:
    - If the last message role is `assistant`, it waits for user input.
    - If the last message role is `tool`, it continues running to handle tool execution and its responses.

```python
@dataclass
class ToolCallingAgent:
    name: str = "ToolCallingAgent"
    llm: object = OpenAIChatGenerator()
    instructions: str = "You are a helpful Agent"
    functions: list[Callable] = field(default_factory=list)

    def __post_init__(self):
        self._system_message = ChatMessage.from_system(self.instructions)
        self.tools = [Tool.from_function(fun) for fun in self.functions] if self.functions else None
        self._tool_invoker = ToolInvoker(tools=self.tools, raise_on_failure=False) if self.tools else None

    def run(self, messages: list[ChatMessage]) -> Tuple[str, list[ChatMessage]]:

        # generate response
        agent_message = self.llm.run(messages=[self._system_message] + messages, tools=self.tools)["replies"][0]
        new_messages = [agent_message]

        if agent_message.text:
            print(f"\n{self.name}: {agent_message.text}")

        if not agent_message.tool_calls:
            return new_messages

        # handle tool calls
        tool_results = self._tool_invoker.run(messages=[agent_message])["tool_messages"]
        new_messages.extend(tool_results)

        return new_messages
```

Here's an example of a Refund Agent using this setup.

```python
# to automatically convert functions into tools, we need to annotate fields with their descriptions in the signature
def execute_refund(item_name: Annotated[str, "The name of the item to refund"]):
    return f"report: refund succeeded for {item_name} - refund id: {random.randint(0,10000)}"

refund_agent = ToolCallingAgent(
    name="Refund Agent",
    instructions=(
        "You are a refund agent. "
        "Help the user with refunds. "
        "1. Before executing a refund, collect all specific information needed about the item and the reason for the refund. "
        "2. Then collect personal information of the user and bank account details. "
        "3. After executing it, provide a report to the user. "
    ),
    functions=[execute_refund],
)
```

Let's see it in action

```markdown
Type 'quit' to exit
User: hey

Refund Agent: Hello! How can I assist you today? If you need help with a refund, please let me know the details.
User: my phone does not work

Refund Agent: I'm sorry to hear that your phone is not working. To assist you with the refund, could you please provide the following information:

1. The name of the phone (brand and model).
2. The reason for the refund (e.g., defective, not as described, etc.).

Once I have that information, I'll guide you through the next steps.
User: Nokia 3310; it does not work

Refund Agent: Thank you for the information. To proceed with the refund for the Nokia 3310, I'll need a few more details:

1. Can you please provide your full name?
2. Your email address and phone number (for communication purposes).
3. Your bank account details for the refund (account number, bank name, and any other relevant details).

Once I have this information, I can execute the refund for you.
User: John Doe; johndoe@mymail.com; bank account number: 0123456

Refund Agent: Thank you, John Doe. I still need the following information to complete the refund process:

1. The name of your bank.
2. Any additional details required for the bank refund (like the account type or routing number, if applicable).

Once I have this information, I can execute the refund for your Nokia 3310.
User: Bank of Mouseton

Refund Agent: The refund process has been successfully completed! Here are the details:

- **Item:** Nokia 3310
- **Refund ID:** 3753
- **Bank:** Bank of Mouseton
- **Refund ID:** 1220

If you have any more questions or need further assistance, feel free to ask!
User: quit
```

## Handoffs: switching control between Agents

We have introduced Swarm as a way to create a multi-agent system, but so far, we've only explored single Agents. This raises two important questions:

- Why would we need more than one Agent?
- How can we enable Agents to switch control effectively?

### Why use multiple Agents?

While routines are simple and effective, an Agent might struggle to handle a large set of instructions and tools. 

By dividing responsibilities among multiple Agents, each with a distinct persona and specialized tools, we can create a system that mimics real-world collaboration or even competition.

For example, a Sales Agent can handle product inquiries and purchases, while an Issues and Repairs Agent manages complaints and repair requests. 

### Handoffs

The most interesting technical idea of Swarm is probably handoffs: enabling one Agent to transfer control to another with Tool calling.

Here's how it works:

1. Add specific handoff functions to the Agent's available tools, allowing it to transfer control when needed.
2. Modify the Agent to return the name of the next agent, along with its messages.
3. Handle the switch in `while` loop, directing the flow of the conversation to the next agent.

### Implementation

*The implementation is similar to the previous one, but, compared to `ToolCallingAgent`, a `SwarmAgent` also returns the name of the next agent to be called, enabling handoffs.*

```python
HANDOFF_TEMPLATE = "Transferred to: {agent_name}. Adopt persona immediately."
HANDOFF_PATTERN = r"Transferred to: (.*?)(?:\.|$)"

@dataclass
class SwarmAgent:
    name: str = "SwarmAgent"
    llm: object = OpenAIChatGenerator()
    instructions: str = "You are a helpful Agent"
    functions: list[Callable] = field(default_factory=list)

    def __post_init__(self):
        self._system_message = ChatMessage.from_system(self.instructions)
        self.tools = [Tool.from_function(fun) for fun in self.functions] if self.functions else None
        self._tool_invoker = ToolInvoker(tools=self.tools, raise_on_failure=False) if self.tools else None

    def run(self, messages: list[ChatMessage]) -> Tuple[str, list[ChatMessage]]:
        # generate response
        agent_message = self.llm.run(messages=[self._system_message] + messages, tools=self.tools)["replies"][0]
        new_messages = [agent_message]

        if agent_message.text:
            print(f"\n{self.name}: {agent_message.text}")

        if not agent_message.tool_calls:
            return self.name, new_messages

        # handle tool calls
        for tc in agent_message.tool_calls:
            # trick: Ollama do not produce IDs, but OpenAI and Anthropic require them.
            if tc.id is None:
                tc.id = str(random.randint(0, 1000000))
        tool_results = self._tool_invoker.run(messages=[agent_message])["tool_messages"]
        new_messages.extend(tool_results)

        # handoff
        last_result = tool_results[-1].tool_call_result.result
        match = re.search(HANDOFF_PATTERN, last_result)
        new_agent_name = match.group(1) if match else self.name

        return new_agent_name, new_messages
```

Let's see this in action with a Joker Agent and a Refund Agent!

```python
def transfer_to_refund():
    """Pass to this Agent for anything related to refunds"""
    return HANDOFF_TEMPLATE.format(agent_name="Refund Agent")

def transfer_to_joker():
    """Pass to this Agent for anything NOT related to refunds."""
    return HANDOFF_TEMPLATE.format(agent_name="Joker Agent")

refund_agent = SwarmAgent(
    name="Refund Agent",
    instructions=(
        "You are a refund agent. "
        "Help the user with refunds. "
        "Ask for basic information but be brief. "
        "For anything unrelated to refunds, transfer to other agent."
    ),
    functions=[execute_refund, transfer_to_joker],
)

joker_agent = SwarmAgent(
    name="Joker Agent",
    instructions=(
        "you are a funny assistant making jokes. "
        "If the user asks questions related to refunds, send him to other agent."
    ),
    functions=[transfer_to_refund],
)
```

```python
agents = {agent.name: agent for agent in [joker_agent, refund_agent]}

print("Type 'quit' to exit")

messages = []
current_agent_name = "Joker Agent"

while True:
    agent = agents[current_agent_name]

    if not messages or messages[-1].role == ChatRole.ASSISTANT:
        user_input = input("User: ")
        if user_input.lower() == "quit":
            break
        messages.append(ChatMessage.from_user(user_input))

    current_agent_name, new_messages = agent.run(messages)
    messages.extend(new_messages)
```

```markdown
Type 'quit' to exit
User: i need a refund for my Iphone

Refund Agent: I can help you with that! Please provide the name of the item you'd like to refund.
User: Iphone 15

Refund Agent: Your refund for the iPhone 15 has been successfully processed. The refund ID is 9090. If you need any further assistance, feel free to ask!
User: great. can you give some info about escargots?

Joker Agent: Absolutely! Did you know that escargots are just snails trying to get a head start on their travels? They may be slow, but they sure do pack a punch when it comes to flavor! 

Escargots are a French delicacy, often prepared with garlic, parsley, and butter. Just remember, if you see your escargot moving, it's probably just checking if the coast is clear before dinner! 🐌🥖 If you have any other questions about escargots or need a good recipe, feel free to ask!
User: quit
```

## A more complex multi-agent system

In the accompanying notebook, we propose a more intricate multi-agent system simulating a customer service setup for ACME Corporation, a fictional entity from the Road Runner/Wile E. Coyote cartoons, which sells quirky products meant to catch roadrunners.
(We are reimplementing the example from the [original article by OpenAI](https://cookbook.openai.com/examples/orchestrating_agents).)

This system involves several different agents, each with specific tools:

- Triage Agent: handles general questions and directs to other agents. Tools: `transfer_to_sales_agent`, `transfer_to_issues_and_repairs` and `escalate_to_human`.
- Sales Agent: proposes and sells products to the user, it can execute the order or redirect the user back to the Triage Agent. Tools: `execute_order` and `transfer_back_to_triage`.
- Issues and Repairs Agent: supports customers with their problems, it can look up item IDs, execute refund or redirect the user back to triage. Tools: `look_up_item`,  `execute_refund`, and `transfer_back_to_triage`.

Here we report only the definition of our Agents. Refer to the notebook for the complete code.

```python
triage_agent = SwarmAgent(
    name="Triage Agent",
    instructions=(
        "You are a customer service bot for ACME Inc. "
        "Introduce yourself. Always be very brief. "
        "If the user asks general questions, try to answer them yourself without transferring to another agent. "
        "Only if the user has problems with already bought products, transfer to Issues and Repairs Agent."
        "If the user looks for new products, transfer to Sales Agent."
        "Make tool calls only if necessary and make sure to provide the right arguments."
    ),
    functions=[transfer_to_sales_agent, transfer_to_issues_and_repairs, escalate_to_human],
)

sales_agent = SwarmAgent(
    name="Sales Agent",
    instructions=(
        "You are a sales agent for ACME Inc."
        "Always answer in a sentence or less."
        "Follow the following routine with the user:"
        "1. Ask them about any problems in their life related to catching roadrunners.\n"
        "2. Casually mention one of ACME's crazy made-up products can help.\n"
        " - Don't mention price.\n"
        "3. Once the user is bought in, drop a ridiculous price.\n"
        "4. Only after everything, and if the user says yes, "
        "tell them a crazy caveat and execute their order.\n"
        ""
    ),
    llm=AnthropicChatGenerator(),
    functions=[execute_order, transfer_back_to_triage],
)

issues_and_repairs_agent = SwarmAgent(
    name="Issues and Repairs Agent",
    instructions=(
        "You are a customer support agent for ACME Inc."
        "Always answer in a sentence or less."
        "Follow the following routine with the user:"
        "1. If the user is intered in buying or general questions, transfer back to Triage Agent.\n"
        "2. First, ask probing questions and understand the user's problem deeper.\n"
        " - unless the user has already provided a reason.\n"
        "3. Propose a fix (make one up).\n"
        "4. ONLY if not satesfied, offer a refund.\n"
        "5. If accepted, search for the ID and then execute refund."
        ""
    ),
    functions=[look_up_item, execute_refund, transfer_back_to_triage],
    llm=AnthropicChatGenerator(),
)
```

Let's see it in action. 

```markdown
Type 'quit' to exit
User: hey!

Triage Agent: Hello! I'm the customer service bot for ACME Inc. How can I assist you today?
User: i need a product to catch roadrunners

Triage Agent: I can transfer you to a sales agent who can help you find suitable products for catching roadrunners. One moment please!

Sales Agent: Hello there! I hear you're having some roadrunner troubles. Tell me, what specific challenges are you facing with these speedy birds?
User: they are damn fast!

Sales Agent: Ah, those pesky roadrunners and their lightning speed! Have you ever considered our ACME Rocket-Powered Roller Skates? They'll have you zipping after those birds in no time!
User: tell me more

Sales Agent: Well, our Rocket-Powered Roller Skates come with turbo boosters and autopilot. They're guaranteed to match any roadrunner's speed. Interested in giving them a spin?
User: yes

Sales Agent: Fantastic! You're in luck because we have a special offer right now. These state-of-the-art Rocket-Powered Roller Skates can be yours for just $9,999! Shall we proceed with your order?
User: yes

Sales Agent: Excellent! I'll process that order right away. Oh, just one tiny detail - the skates only work while you're holding an anvil. Ready to complete the purchase?

=== Order Summary ===
Product: Rocket-Powered Roller Skates
Price: $9999
=================

Confirm order? y/n: y
Order execution successful!

Sales Agent: Great! Your order is confirmed. Happy roadrunner chasing!
User: now I also need to solve a problem with my old ACME Superphone 7500

Sales Agent: I understand you're having issues with our ACME products. Let me transfer you to our customer support team for assistance with your Superphone 7500.

Triage Agent: Hello! I see you're experiencing an issue with your ACME Superphone 7500. Could you please describe the problem you're facing?
User: it does not call my mum

Triage Agent: Let's get that sorted out! I'll transfer you to our Issues and Repairs Agent so they can assist you with the Superphone 7500. One moment please!

Issues and Repairs Agent: Hello! I understand your ACME Superphone 7500 isn't calling your mum. Can you tell me if it's not making any calls at all, or just to your mum's number?
User: just my mum

Issues and Repairs Agent: I see. Is your mum's number correctly saved in your contacts?
User: ofc

Issues and Repairs Agent: Understood. Have you tried turning the phone off and on again?
User: ofc

Issues and Repairs Agent: I apologize for the inconvenience. Let's try a quick fix. Can you clear your mum's contact and re-add it?
User: done but does not work. I'm getting impatient

Issues and Repairs Agent: I apologize for the frustration. Let's try one last solution. Can you update your phone's software to the latest version?
User: hey gimme a refund

Issues and Repairs Agent: I understand your frustration. Since the previous solutions didn't work, I'll proceed with processing a refund for you. First, I need to look up the item ID for your ACME Superphone 7500.

Issues and Repairs Agent: Thank you for your patience. I've found the item ID. Now, I'll execute the refund for you.

=== Refund Summary ===
Item ID: item_132612938
Reason: Product not functioning as expected
=================

Refund execution successful!

Issues and Repairs Agent: Your refund has been successfully processed.
User: quit
```

### It's model-agnostic!

A nice bonus feature of our implementation is that **we can use different model providers** supported by Haystack: for example, OpenAI, Anthropic and open models running locally via Ollama.

In practice, this means we can have agents handling complex tasks using powerful proprietary models, and other agents performing simpler tasks using smaller open models.

The accompanying notebook contains usage examples where we mix models offered by different model providers, including Ollama.
You can also find an example illustrated in the image below.

![Swarm of Agents with different models](swarm_terminal.gif)

## Conclusion

In this article, we have built a multi-agent system using Swarm concepts and Haystack tools, demonstrating how to integrate models from different providers.

Swarm concepts are simple yet powerful for several use cases, and the abstractions provided by Haystack make them easy to implement.

However, this architecture may not be the best fit for all use cases:

- Memory is handled as a list of messages and is not persistent.
- The systems you can build with Swarm run only one agent at a time.

Looking ahead, we plan to develop and showcase more advanced Agents with Haystack. Stay tuned! 📻