# Chat with _Your Own_ Browser

This is a simple implementation that allows you to use ChatGPT browsing in your local environment. The most significant difference between the ChatGPT browsing model and the web version is that it **uses your local browser**. Thus, it can avoid the restrictions faced by crawlers.

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
> Assistant responded: The paper titled "Single-Particle Imaging of Macromolecules by Cryo-Electron Microscopy" discusses using cryo-electron microscopy (cryo-EM) of biological molecules in single-particle form as a new approach to study molecular assemblies. 

These assemblies are often too large and flexible to be studied via X-ray crystallography. Cryo-electron microscopy allows these biological molecules to be observed "trapped" at different stages of their conformational changes and dynamical interactions. 

The paper highlights successful applications of this new technique, especially when combined with traditional structure determination methods like X-ray crystallography and NMR. They specifically use examples of molecular machines involved in the fundamental biological processes of transcription, mRNA splicing, and translation.
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

Following [this article](https://developers.google.com/custom-search/v1/overview) to get Google Search related keys. Please note that it has a free quota. Charges will be applied once it's used up.

### Run

1. You need to install dependencies first by running `npm install`.
2. Make sure you have Node.js v20 installed. Run `node index.mjs`.
