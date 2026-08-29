---
title: "Do LLM Reviewers Respect Scope? ScopeBench-PR: A Benchmark for Scope Fairness in Peer Review"
short_name: "ScopeBench-PR"
cover: "rose"
blurb: "Measuring whether LLM reviewers respect a paper’s stated scope."
lede: "ScopeBench-PR asks whether LLM reviewers evaluate a paper against the claims it actually makes. When research is explicitly regional or low-resource, do reviewers respect that scope, or penalize it for omitting English-language, global, or multilingual evaluation it never promised?"
description: "Presented at GlobalSouthAI @ IJCAI-ECAI 2026, awarded Best Paper Presentation and runner-up in 3MT. A counterfactual benchmark for measuring scope fairness in LLM peer review."
tldr: "ScopeBench-PR audits LLM peer reviewers for scope fairness using counterfactual prestige and language-of-study variants. Regional penalties are model-dependent, scope-aware prompting helps unevenly, and rebuttal often leaves a sticky score penalty."
abstract: "LLMs are increasingly used to draft, summarize, and audit peer reviews, but it remains unclear whether they evaluate papers against the claims those papers actually make. Hence, we study scope fairness, i.e., whether an LLM reviewer respects a paper's stated geographic, linguistic, and empirical scope, rather than penalizing it for not satisfying broader English-language, global, or multilingual defaults. It matters for those venues where many contributions are received covering underrepresented languages, communities, and deployment settings. In view of this, we introduce ScopeBench-PR, a counterfactual benchmark and audit pipeline that preserves each article's scientific spine while varying two axes of framing including institutional prestige and language of study. ScopeBench-PR contains 30 scientific papers, 4,204 LLM review runs, 4,898 matched score-robustness pairs, 25,588 scope-criticism items, 633 rebuttal-repair items, and a 500-item human validation study with four trained annotators requiring 240-250 trained annotator-hours. The observed result reveal three patterns: (i) regional language-of-study penalties are model-dependent rather than universal; (ii) scope-aware prompting reduces some penalties but does not reliably eliminate them; and (iii) rebuttal/meta-review can recognize unfair scope demands while leaving final scores only partially repaired. Furthermore, it suggests that LLM reviewer bias may operate less as explicit hostility and more as unequal standards of generality. Specifically, regional and low-resource work is sometimes judged by English or global expectations it never claimed to satisfy."
venue: "GlobalSouthAI · IJCAI–ECAI 2026"
proceedings: "Presented at GlobalSouthAI (IJCAI-ECAI 2026)"
status: "accepted"
sort_date: 2026-07-21
authors:
  - name: "Rishi Ahuja"
    is_me: true
    profile: "https://openreview.net/profile?id=~Rishi_Ahuja1"
  - name: "Kumar Prateek"
    profile: "https://openreview.net/profile?id=~Kumar_Prateek1"
  - name: "Simranjit Singh"
    is_corresponding: true
    profile: "https://openreview.net/profile?id=~Simranjit_Singh4"
affiliation_note: "Department of Information Technology, Dr. B.R. Ambedkar National Institute of Technology Jalandhar"
awards:
  - label: "Awarded Best Paper Presentation"
  - label: "Three Minute Thesis (3MT)"
    result: "Runner-up"
event:
  announcement: "Presented ScopeBench-PR at GlobalSouthAI @ IJCAI-ECAI 2026 in Bremen, Germany."
  label: "Presented at"
  venue: "GlobalSouthAI @ IJCAI-ECAI 2026"
  location: "Bremen, Germany"
  start_date: "2026-08-17"
  end_date: "2026-08-17"
  url: "https://sites.google.com/view/globalsouthai-ijcai26/home"
  verified_links:
    - label: "GlobalSouthAI workshop"
      url: "https://sites.google.com/view/globalsouthai-ijcai26/home"
links:
  - label: "Workshop site"
    url: "https://sites.google.com/view/globalsouthai-ijcai26/home"
    primary: true
  - label: "GitHub"
    url: "https://github.com/SPELLAILab/ScopeBench-PR"
  - label: "Dataset (HF)"
    url: "https://huggingface.co/datasets/rishia2220/scopebench-pr"
primary_url: "https://sites.google.com/view/globalsouthai-ijcai26/home"
same_as:
  - "https://sites.google.com/view/globalsouthai-ijcai26/home"
  - "https://github.com/SPELLAILab/ScopeBench-PR"
  - "https://huggingface.co/datasets/rishia2220/scopebench-pr"
---

## The question

LLMs are increasingly used to assist with drafting, summarizing, and auditing scientific reviews. Most fairness analyses focus on explicit hostility or direct penalties toward Global South and non-English research.

We examine a subtler failure mode: scope expansion. A reviewer may accept the underlying science while evaluating the work against a broader claim than the paper makes. Research on Hindi dialogue, for example, may be criticized for not including English or multilingual evaluation, while a regional deployment may be treated as incomplete because it is not global.

These are critiques of an expanded scope, not necessarily of the work as written.

## How the benchmark is built

ScopeBench-PR keeps the scientific content of each paper fixed while varying two contextual factors: institutional prestige and language of study.

The benchmark contains 30 papers and 4,204 review runs, enabling paired comparisons of how the same work is evaluated under different framing. A 500-item human audit evaluates the weak-label detector, so its outputs should be interpreted as audit signals rather than definitive ground truth.

## What we found

We observe penalties associated with regional language settings, although their magnitude varies substantially across models. Scope-aware prompting reduces these penalties for some reviewers but has little effect on others.

The most concerning result appears after rebuttal: a meta-review may acknowledge that an extra-scope demand was unfair while the paper’s score still fails to recover fully. We refer to this persistence as a sticky penalty.

I presented ScopeBench-PR at GlobalSouthAI, IJCAI–ECAI 2026. It received the Best Paper Presentation Award, and its Three Minute Thesis presentation placed runner-up.

