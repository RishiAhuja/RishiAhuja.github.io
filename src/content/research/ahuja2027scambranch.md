---
title: "It’s Not What the Scammer Says, It’s How You Reply: Small Scam Detectors Judge Code-Mixed Fraud Calls by the Victim"
short_name: "ScamBranch"
is_new: true
cover: "citron"
blurb: "Testing whether small scam detectors judge the caller’s request or the victim’s reply."
lede: "When a small model flags a phone call as a scam, is it responding to what the caller asks for, or to how the person on the other end reacts? ScamBranch fixes the caller’s request and varies only the reply to find out."
description: "Accepted at AAAI-27 Student Abstract. Code-mixed Hindi, Tamil, and Telugu–English fraud calls that branch into four victim replies, used to test 14 small scam detectors."
tldr: "Across 2,643 code-mixed calls, a single victim reply splits the verdicts of 14 small open models in 30–80% of conversation sets. Fine-tuning Qwen2.5-1.5B raises macro-F1 from 0.73 to 0.86 and roughly halves these splits, but scams where the victim cooperates stay the hardest to catch."
abstract: "Accuracy alone cannot reveal whether a scam-call detector responds to what the caller asks or to how the person called reacts. Accordingly, the proposed work introduces ScamBranch, a collection of Romanized Hindi–English, Tamil–English, and Telugu–English phone calls in which a fixed opening containing the caller’s request branches into four replies: cooperative, clarifying, resistant, and suspicious. Evidence and labels remain identical across all branches; consequently, any change in verdict comes solely from the reply. Subsequently, an evaluation of 14 open models with 270M–1.8B parameters shows that a single reply splits the verdicts in 30–80% of conversation sets. Moreover, fine-tuning Qwen2.5-1.5B raises its macro-F1 from 0.73 to 0.86 and roughly halves these splits; nevertheless, scams in which the victim cooperates remain the hardest to catch."
venue: "AAAI-27 Student Abstract"
proceedings: "AAAI-27 Student Abstract"
status: "accepted"
sort_date: 2026-11-13
authors:
  - name: "Rishi Ahuja"
    email: "rishia.it.24@nitj.ac.in"
    is_me: true
    profile: "https://openreview.net/profile?id=~Rishi_Ahuja1"
    affiliations: [1]
  - name: "Kumar Prateek"
    email: "kumarprateek@nitj.ac.in"
    profile: "https://openreview.net/profile?id=~Kumar_Prateek1"
    affiliations: [1]
  - name: "Simranjit Singh"
    email: "singhsimranjit@nitj.ac.in"
    is_corresponding: true
    profile: "https://openreview.net/profile?id=~Simranjit_Singh4"
    affiliations: [1]
affiliations:
  - id: 1
    name: "Department of Information Technology, National Institute of Technology Jalandhar"
event:
  announcement: "Accepted at AAAI-27 Student Abstract, presented in Montréal on 19 February 2027."
  label: "Accepted at"
  venue: "AAAI-27 Student Abstract"
  location: "Montréal, Canada"
  start_date: "2027-02-19"
  end_date: "2027-02-19"
  url: "https://aaai.org/conference/aaai/aaai-27/student-abstract-and-poster-program-call-for-proposals/"
  verified_links:
    - label: "AAAI-27 Student Abstract"
      url: "https://aaai.org/conference/aaai/aaai-27/student-abstract-and-poster-program-call-for-proposals/"
links:
  - label: "Conference"
    url: "https://aaai.org/conference/aaai/aaai-27/student-abstract-and-poster-program-call-for-proposals/"
    primary: true
bibtex: |
  @inproceedings{ahuja2027scambranch,
    title     = {It's Not What the Scammer Says, It's How You Reply: Small Scam Detectors Judge Code-Mixed Fraud Calls by the Victim},
    author    = {Ahuja, Rishi and Prateek, Kumar and Singh, Simranjit},
    booktitle = {AAAI-27 Student Abstract},
    year      = {2027},
    note      = {Accepted for presentation}
  }
---

## The question

Phone scams in India often mix a local language with English, and small models that read call transcripts are an appealing defence. Datasets such as [ICFD-31k](/pub/ahuja2026icfd31k) generate each call independently, though, so the scam’s content and the callee’s reaction change together.

That leaves a detector free to learn the reaction instead of the request. It could flag careful customers on genuine calls and clear scams whose victims go along with them. ScamBranch asks **whether a detector’s verdict follows what the caller asks for, or how the person called replies.**

## Branching one call four ways

Each call starts from a fixed opening that already contains the caller’s request and all the evidence that decides the label. That opening is frozen and continued four times, with the callee:

- Cooperating.
- Asking for clarification.
- Resisting.
- Voicing suspicion.

The caller can then repeat the request, add urgency, reassure, or give up, but cannot start a new scam. Because evidence and label are shared across the four branches, any change in verdict comes from the reply alone.

## Dataset at a glance

- **2,643 calls** in Romanized Hindi–English, Tamil–English, and Telugu–English, from 2,880 generated.
- **60 scenario families** across banking and payments, jobs and recruitment, and e-commerce and delivery.
- **Every scam has a genuine counterpart** built on the same situation.
- **Family-level splits**, with 12 held-out test families and 540 test calls, half of them fraud.

## What we found

Given only the opening, identical branches receive identical verdicts. Adding the first reply splits them in **30–80% of conversation sets** across 14 open models with 270M–1.8B parameters.

The direction depends on the model. For Qwen2.5-1.5B, the strongest zero-shot model, a suspicious customer doubles false alarms on genuine calls, and a cooperative victim hides scams. Hiding the victim’s lines helps only partly, because the caller’s own turns react to the reply.

Fine-tuning Qwen2.5-1.5B with LoRA raises macro-F1 from 0.73 to 0.86, cuts false alarms, and roughly halves the disagreement between branches. Training on branched calls matches unbranched accuracy with more consistent verdicts. Scams where the victim cooperates still have the lowest recall.

## What this means

Pooled accuracy hides the failure that matters most. After fine-tuning, the people a warning should protect, victims who comply, are still the ones most likely to be missed.

The calls are synthetic and not yet human-validated, the test set covers 12 families, and the evaluation uses a single prompt with three seeds. The dataset and code will be released.
