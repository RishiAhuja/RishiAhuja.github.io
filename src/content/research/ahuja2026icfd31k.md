---
title: "ICFD-31k: A Large-Scale Dataset and Benchmark for Real-Time Conversational Fraud Detection"
short_name: "ICFD-31k"
cover: "blue"
blurb: "A large-scale benchmark for real-time conversational fraud detection."
lede: "ICFD-31k is a 31,000-call benchmark for catching telephone fraud as the conversation is still happening — in Indian English and Hinglish, with streaming labels and slow-thinking rationales rather than a single end-of-call verdict."
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
award: "IJCAI–AIJ grant"
event:
  announcement: "Accepted to the IJCAI-ECAI 2026 main conference special track. Received an IJCAI–AIJ grant. I will present ICFD-31k in Bremen, Germany."
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

Telephone scams are a live problem in India, and the language they arrive in is rarely clean English. Most public fraud datasets are either too small, too Western, or labelled only after the call is over. That is the wrong shape if you want a system that can interrupt a scam while it is still unfolding.

ICFD-31k is our attempt to build the missing piece: a large Indian Conversational Fraud Dataset that can be used both as a static classification benchmark and as a streaming one.

## What is in the release

The set has a little over 31,000 realistic transcripts across ten fraud umbrellas, from financial impersonation to job scams. Each transcript carries a final verdict, chunk-level streaming labels, and a slow-thinking rationale. A human-in-the-loop pass gives a Cohen’s Kappa of 0.534, which is enough to treat the labels as usable rather than decorative.

## Models

We fine-tune two RoBERTa baselines on top of the set. M1 is the non-streaming model. M2 is trained to decide as chunks arrive. In-domain M1 reaches 99.40 F1; on unseen scam types it still holds 92.97 F1. The point of the paper is not that these numbers are the last word — it is that the dataset is large and labelled enough for those numbers to mean something.

I presented this work at IJCAI–ECAI 2026 in Bremen, with support from an IJCAI–AIJ grant.

