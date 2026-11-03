---
title: "DoubtBench: Does Self-Doubt Help Language Models—or Just Make Them Check?"
short_name: "DoubtBench"
cover: "lavender"
blurb: "Separating the effect of self-doubt wording from direct instructions to check."
lede: "When a prompt asks a language model to doubt itself and check its answer, which instruction changes its performance? DoubtBench holds the task fixed and separates the two components to measure what self-doubt adds beyond checking."
description: "Accepted to Findings of WSDM 2027. A paired benchmark separating self-doubt wording from direct checking across 6,400 tasks and six model checkpoints."
tldr: "Across 423,600 responses, adding self-doubt wording beyond checking changes accuracy by −1.43 to +2.59 percentage points. Its effect depends on the model, task, and instructions already present."
abstract: "Prompts labeled “emotional” or “metacognitive” often mix self-doubt language with ordinary directives such as checking an answer or showing work. A performance change under such a compound prompt therefore does not isolate the cause. We introduce DoubtBench, a paired benchmark for attributing these effects. It contains 6,400 procedurally generated latent tasks spanning eight families and 33 types. Every task is evaluated under a paired 2 × 2 design over self-doubt wording and direct checking, plus a checking-plus-concision control, crossed with two task contexts, yielding ten paired responses per model–task pair. This isolates the effects of self-doubt-only wording, direct checking, their combination, concision, and existing requests for visible intermediate reasoning. The primary endpoint is the Conditional Doubt Effect (CDE)—the incremental accuracy change from adding self-doubt wording after direct checking is already present—together with a scorecard of competence, checking gain, context modulation, and robustness. Across 423,600 responses from six checkpoints, four foundation families, four seeds, and held-out surface forms, CDE ranges from −1.43 to +2.59 percentage points (three positive, three negative). Four of six checkpoints show positive incremental CDE under minimal requests, but only two do when intermediate reasoning is already requested. Thus, under the operationalization studied here, self-doubt wording is not a portable correction policy: its incremental effect beyond direct checking varies across checkpoints, task families, and existing instructions."
venue: "Findings of WSDM 2027"
proceedings: "Findings of WSDM 2027"
status: "accepted"
sort_date: 2026-11-03
authors:
  - name: "Rishi Ahuja"
    is_me: true
    profile: "https://openreview.net/profile?id=~Rishi_Ahuja1"
    affiliations: [1]
  - name: "Rajeev Ranjan Dwivedi"
    profile: "https://rajeev-dw9.github.io/"
    affiliations: [2]
  - name: "Dr. Vinod K. Kurmi"
    is_corresponding: true
    profile: "https://vinodkkurmi.github.io/"
    affiliations: [2]
affiliations:
  - id: 1
    name: "Department of Information Technology, National Institute of Technology Jalandhar"
  - id: 2
    name: "Visual Data Computing Group (VisDom)"
    detail: "Department of Data Science and Engineering, IISER Bhopal"
    url: "https://visdomlab.github.io/"
event:
  announcement: "Accepted to Findings of WSDM 2027, held in Hong Kong on 15–19 February 2027."
  label: "Accepted at"
  venue: "Findings of WSDM 2027"
  location: "Hong Kong"
  start_date: "2027-02-15"
  end_date: "2027-02-19"
  url: "https://www.wsdm-conference.org/2027/"
  verified_links:
    - label: "WSDM 2027"
      url: "https://www.wsdm-conference.org/2027/"
    - label: "Visual Data Computing Group (VisDom)"
      url: "https://visdomlab.github.io/"
links:
  - label: "Conference"
    url: "https://www.wsdm-conference.org/2027/"
    primary: true
  - label: "Lab"
    url: "https://visdomlab.github.io/"
bibtex: |
  @inproceedings{ahuja2027doubtbench,
    title     = {DoubtBench: Does Self-Doubt Help Language Models---or Just Make Them Check?},
    author    = {Ahuja, Rishi and Dwivedi, Rajeev Ranjan and Kurmi, Vinod K.},
    booktitle = {Findings of WSDM 2027},
    year      = {2027},
    note      = {Accepted for publication}
  }
---

## The question

A prompt can combine self-doubt wording with an instruction to check its work. If its answer improves, that comparison alone cannot tell us which part of the instruction helped.

DoubtBench asks a more specific question: **does adding self-doubt wording change performance once a direct checking instruction is already present?** Here, self-doubt refers to the wording of the prompt. The benchmark measures observable task performance and makes no claim that a model experiences doubt or emotion.

## A paired experiment

The same latent task, gold answer, model checkpoint, and decoding setup are held fixed while the prompt changes. Four conditions form the core experiment:

- A neutral prompt.
- Self-doubt wording alone.
- A direct instruction to check.
- Self-doubt wording combined with checking.

A fifth condition combines checking with a request for concision. All five are evaluated in two contexts: a minimal task request and a request that already asks for visible intermediate reasoning. This produces ten paired responses per model–task pair.

The central measure, the **Conditional Doubt Effect (CDE)**, compares doubt plus checking with checking alone. It isolates the incremental accuracy change associated with adding the tested self-doubt wording.

## Benchmark at a glance

- **6,400 latent tasks** across eight task families and 33 task types.
- **Four independently seeded splits**, with exact answers and deterministic scoring.
- **Six model checkpoints** drawn from four foundation-model families, including two additional Tulu checkpoints for a within-lineage post-training comparison.
- **423,600 responses**: 384,000 factorial responses and 39,600 responses in the surface-form audit.
- **330 tasks with 660 answer-preserving variants**, testing whether the effect survives changes in how a task is presented.

The task families cover working memory, inhibition, rule switching, novel-rule learning, error monitoring, planning, relational integration, and goal management.

## What adding doubt changes

Across the evaluated checkpoints, overall CDE ranges from **−1.43 to +2.59 percentage points**. Its direction and magnitude vary across models and task families.

Context also matters. Four of six checkpoints show positive incremental CDE under minimal task requests; only two do when visible intermediate reasoning is already requested. An effect that appears helpful with sparse instructions can weaken or reverse when the task already supplies more guidance.

The paper reports baseline competence, checking gain, context modulation, seed consistency, and surface robustness separately. This keeps distinct behaviours visible rather than collapsing them into a single leaderboard score.

## What this means

The tested self-doubt wording is not a portable correction policy. Its incremental value beyond checking depends on the checkpoint, task family, existing instructions, and surface form. Checking gains are also model-dependent, so the practical recommendation is to validate the instruction on the intended model and task.

These findings concern the fixed prompt wording and procedurally generated task types studied in the paper. Small effect estimates are sensitive to wording, and the Llama result is additionally sensitive to completion quality. The benchmark supports controlled attribution within this setting; it does not establish a universal effect of self-doubt prompting.
