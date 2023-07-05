# Chat with _Your Own_ Browser

This is a simple implementation that allows you to use ChatGPT browsing in your local environment. The most significant difference between the ChatGPT browsing model and the web version is that it **uses your local browser**. Thus, it can avoid the restrictions faced by crawlers.

> **Note**
> An web app made with Next.js is under development.

## Showcase

Here is an example. I asked ChatGPT to search for a article and provide a simple summary.

```
? Please enter your prompt. Find the DOI of paper "Single-particle imaging of macromolecules
by cryo-electron microscopy".
! Waiting for the assistant
$ Assistant called function: search with arguments { "query": "Single-particle imaging of macromolecules by cryo-electron microscopy DOI" }
Top 3 search results for "Single-particle imaging of macromolecules by ..."
• Single-particle imaging of macromolecules by cryo-electron ... (https://pubmed.ncbi.nlm.nih.gov/11988472/)
• Single-Particle Imaging of Macromolecules by Cryo-Electron ... (https://www.annualreviews.org/doi/10.1146/annurev.biophys.31.082901.134202)
• Recent Advances in Single Particle Cryo-electron Microscopy and ... (https://link.springer.com/article/10.1007/s41745-018-0087-z)
! Waiting for the assistant
$ Assistant called function: navigate with arguments { "url": "https://www.annualreviews.org/doi/10.1146/annurev.biophys.31.082901.134202" }
! Waiting for the assistant
$ Assistant called function: read with arguments { "tab": "fzXtJsgZQBy4LaCZVqLzK" }
! Waiting for the assistant
$ Assistant called function: close with arguments { "tab": "fzXtJsgZQBy4LaCZVqLzK" }
! Waiting for the assistant
> Assistant responded: The DOI of the paper "Single-Particle Imaging of Macromolecules by Cryo-Electron Microscopy" is 10.1146/annurev.biophys.31.082901.134202.
i Usage: 2700 send, 44 recv, 2744 total
? Please enter your response. What is the paper about?
! Waiting for the assistant
> Assistant responded: The paper titled "Single-Particle Imaging of
Macromolecules by Cryo-Electron Microscopy" discusses using cryo-electron
microscopy (cryo-EM) of biological molecules in single-particle form as a new
approach to study molecular assemblies.

These assemblies are often too large and flexible to be studied via X-ray
crystallography. Cryo-electron microscopy allows these biological molecules to
be observed "trapped" at different stages of their conformational changes and
dynamical interactions.

The paper highlights successful applications of this new technique, especially
when combined with traditional structure determination methods like X-ray
crystallography and NMR. They specifically use examples of molecular machines
involved in the fundamental biological processes of transcription, mRNA
splicing, and translation.
i Usage: 2757 send, 154 recv, 2911 total
? Please enter your response. Can you elaborate more?
! Waiting for the assistant
$ Assistant called function: search with arguments { "query": "Single-particle imaging of macromolecules by cryo-electron microscopy summary" }
  Top 3 search results for "Single-particle imaging of macromolecules by ..."
  • Single-particle imaging of macromolecules by cryo-electron ... (https://pubmed.ncbi.nlm.nih.gov/11988472/)
  • Single-Particle Imaging of Macromolecules by Cryo-Electron ... (https://www.annualreviews.org/doi/10.1146/annurev.biophys.31.082901.134202)
  • Single-particle cryo-electron microscopy of macromolecular ... (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5895108/)
  ! Waiting for the assistant
$ Assistant called function: navigate with arguments { "url": "https://pubmed.ncbi.nlm.nih.gov/11988472/" }
! Waiting for the assistant
$ Assistant called function: read with arguments { "tab": "YVmbqoqq-qOZj46rn3Se9" }
! Waiting for the assistant
$ Assistant called function: close with arguments { "tab": "YVmbqoqq-qOZj46rn3Se9" }
! Waiting for the assistant
> Assistant responded: Cryo-electron microscopy (cryo-EM) is used to observe
biological molecules in a single-particle state, which means these particles
are non-aggregated and unordered. This method allows the study of molecular
assemblies, which are typically too large and flexible for analysis with X-ray
crystallography.

Importantly, this technique enables researchers to observe these molecular
assemblies during various stages of their conformational changes and dynamic
interactions, effectively "trapping" them in these states for study.

Understanding these processes can provide new insights into biological function
at the molecular level. The technique has been successfully used to analyze
complex molecular machines involved in key biological processes such as
transcription, mRNA splicing, and translation.

This method complements traditional structure determination techniques like
X-ray crystallography and Nuclear Magnetic Resonance (NMR), as it offers a
different approach to structural analysis, especially for larger and more
flexible structures.
i Usage: 4948 send, 184 recv, 5132 total
? Please enter your response.
```

## Get Started

### Environment Variables

Create `.env` file with the following content.

```
OPENAI_API_KEY=sk-************************************************
OPENAI_API_ORG=org-************************
GOOGLE_SEARCH_KEY=*******************-*******************
GOOGLE_SEARCH_CX=*****************
```

Following [this article](https://developers.google.com/custom-search/v1/overview) to get Google Search related keys.

> **Warning**
> The Google Search API has a free quota. Charges will be applied once it's used up

### Run

1. You need to install dependencies first by running `npm install`.
2. Make sure you have Node.js v20 installed. Run `node index.mjs`.
3. Write some prompts, for example: `Find the DOI of paper "Single-particle imaging of macromolecules by cryo-electron microscopy"`.

## How It Works

This program is fundamentally powered by OpenAI's recently launched function calling feature. Simply put, the function calling feature enables users to provide a number of function signatures and annotations when calling the Chat API. The LLM (Language Learning Model) can interrupt the conversation and invoke these functions, the user can perform the functions locally and put the outcome into the conversation, and LLM can continue the conversation based on the results of the functions. So, without this feature, implementing this program would be more challenging.

Essentially, this program simulates a browser. The browser provides the following interfaces: Google search, opening a new tab, reading a certain tab, and closing a certain tab. At the start of the conversation, the program will inform the LLM in the role of the system: you can access the Internet through these functions, and if you are unclear about what the user is saying, you can use the Google search function.

Meanwhile, we have also implemented specialized readers for specific websites (see `readers` folder). These readers can selectively feed meaningful web page content to the LLM. For the remaining websites, we simulate the process of reading a webpage like a human: copying all the text content on the first screen, while also informing the LLM that it can scroll the window to continue reading.

Although this model is very simple, it has proven to be extremely effective in my practice.

## Limitations

- `gpt-4-0613` only supports an 8k token context, and in situations of multiple web page accesses, there might be scarcity of token information. Possible solutions include: Deleting unnecessary web page access history, compressing dialogue context, or using `gpt-3.5-turbo-16k-0613`.
- The current method of summarizing websites is overly simple and blunt (directly conc all text content on the first page). Possible solutions include: Writing specialized content extraction functions for specific websites, or using another LLM to filter out irrelevant information.

## Findings

Sometimes, for extended context, we utilize the GPT-3.5 Turbo model. However, after comparison, we've found that GPT-4 indeed appears more "intelligent". This is reflected in several ways.

1. GPT-4, after browsing, remembers to close the tabs, something that GPT-3.5 often forgets.
2. GPT-3.5 sometimes continues to scroll through a webpage without actually reading it. We're considering disabling the scrolling feature and using only a read function in the hope of potentially reducing GPT-3.5's comprehension cost.
3. GPT-4 knows when to stop reading, while GPT-3.5 either sometimes reads excessively or does not read the entire text at all.
