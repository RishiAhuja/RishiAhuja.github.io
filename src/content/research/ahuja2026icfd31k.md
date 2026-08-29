---
title: "ICFD-31k: A Large-Scale Dataset and Benchmark for Real-Time Conversational Fraud Detection"
short_name: "ICFD-31k"
cover: "blue"
blurb: "A large-scale benchmark for real-time conversational fraud detection."
lede: "ICFD-31k is a benchmark of more than 31,000 Indian English and Hinglish conversations for real-time fraud detection. Alongside conversation-level labels, it provides chunk-level streaming annotations and explanatory rationales, enabling systems to be evaluated before a conversation has ended."
description: "Accepted at IJCAI-ECAI 2026 main conference special track. A large-scale Indian bilingual fraud-call benchmark with streaming labels and rationales."
tldr: "ICFD-31k introduces 31,000+ Indian English/Hinglish fraud-call transcripts with chunk-level streaming labels and slow-thinking rationales, plus RoBERTa baselines that reach 99.40 F1 in-domain and 92.97 F1 on unseen scam types."
abstract: "The proliferation of sophisticated telephone scams poses a significant societal and economic threat, impacting diverse linguistic contexts in a country like India. Furthermore, the lack of large-scale, publicly available datasets remains a critical barrier impacting research on robust, real-time countermeasures. In view of this, the proposed work introduces ICFD-31k, the first Indian Conversational Fraud Dataset, representing a new benchmark containing over 31,000 realistic conversational transcripts. ICFD-31k comprises systematically generated content, covering 10 distinct fraud umbrellas spanning from financial impersonation to job scams. ICFD-31k transcripts feature rich annotations comprising a final verdict, chunk-level streaming labels, and detailed slow-thinking rationales. In addition, the human-in-the-loop evaluation validates the ICFD-31k's quality, achieving a Cohen's Kappa of 0.534 that confirms annotation reliability. Furthermore, the proposed work introduces two fine-tuned models based on RoBERTa: M1 for non-streaming data and M2 for streaming data. The comprehensive experiments with strong baselines (M1, M2) further demonstrate the ICFD-31k's utility."
venue: "IJCAI–ECAI 2026 · AI for Social Good Special Track"
proceedings: "Accepted to IJCAI-ECAI 2026"
status: "accepted"
sort_date: 2026-04-30
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
award: "Awarded IJCAI–AIJ grant"
award_amount: "$1,000"
event:
  announcement: "Accepted to the IJCAI-ECAI 2026 main conference special track. Awarded an IJCAI–AIJ grant. I will present ICFD-31k in Bremen, Germany."
  label: "To be presented at"
  venue: "IJCAI-ECAI 2026"
  location: "Bremen, Germany"
  start_date: "2026-08-15"
  end_date: "2026-08-21"
  url: "https://2026.ijcai.org/"
  verified_links:
    - label: "IJCAI-ECAI 2026 venue"
      url: "https://2026.ijcai.org/"
links:
  - label: "Conference site"
    url: "https://2026.ijcai.org/"
    primary: true
primary_url: "https://2026.ijcai.org/"
same_as:
  - "https://2026.ijcai.org/"
---

## Why this dataset

Most public conversational fraud datasets are small, concentrated in non-Indian settings, or labelled only at the conversation level. They can support retrospective classification, but they are not designed to study when a system can first identify a scam as it unfolds.

ICFD-31k addresses this gap by supporting both full-conversation classification and streaming evaluation across diverse fraud scenarios.

## What is in the release

The dataset contains more than 31,000 scenario-grounded synthetic transcripts spanning ten fraud categories, including financial impersonation, job scams, and other common forms of conversational fraud.

Each transcript includes a final verdict, chunk-level streaming labels, and an explanatory rationale. Human evaluation reports κ = 0.534, indicating moderate inter-annotator agreement.

## Models and evaluation

We fine-tune two RoBERTa baselines. M1 evaluates complete conversations, while M2 makes incremental predictions as new chunks arrive.

On the in-domain evaluation, M1 reaches 99.40% F1 and retains 92.97% F1 on held-out fraud types. These results provide reference baselines for the dataset; they should not be interpreted as evidence that real-time conversational fraud detection is solved.

I presented this work at IJCAI–ECAI 2026 in Bremen.

