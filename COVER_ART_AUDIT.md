# Cover Art Audit and Regeneration Brief

## Outcome

The preferred direction is the three latest ChatGPT images in `~/Downloads`: tactile, editorial abstractions that suggest a subject through material, rhythm, density, interruption, and visual tension. They do not explain a technical mechanism.

The first generated batch drifted into **decorative technical diagrams**. It often obeyed the subject matter too literally: inputs became arrows, architecture became nested boxes, networking became braided channels, scheduling became a wheel, and rasterization became a tutorial graphic. These images are polished, but most are too explanatory and icon-like for the intended portfolio.

The next model should treat each article only as semantic inspiration. The cover must remain visually compelling even if the viewer cannot infer the exact article topic without reading the title.

## Gold references from Downloads

Inferred mapping from visual content:

1. `ChatGPT Image Aug 24, 2026, 04_44_27 PM.png` — ICFD-31k: cool horizontal strata interrupted by coral anomalies.
2. `ChatGPT Image Aug 24, 2026, 04_44_23 PM.png` — ScopeBench-PR: two related vertical structures with different visual treatment.
3. `ChatGPT Image Aug 24, 2026, 04_44_12 PM.png` — Temporal Retrieval: a pale information field with selective blue-violet concentration.

These three should replace the generated research covers and serve as the visual standard for the writing covers.

## Asset-format correction

The three gold references are approximately 4:5 full-card compositions (`1122 × 1402`) and already include a quiet outer margin. The final portfolio assets should **not** preserve that margin. The final folder contains only borderless inner artwork, standardized to `1086 × 1448` (3:4).

The website should own the framing deterministically:

- Load each borderless 3:4 artwork inside the 4:5 project-card element.
- Apply the chosen outer mat color in CSS.
- Apply one fixed inset, for example `background-size: 80% auto`, centered and non-repeating.
- Keep borders/mats out of the PNGs so every card has exactly the same thickness.

The gold references were cropped to their inner artwork before being placed in the final folder. Do not add a second baked-in border during future generations.

## Selection decision

| # | Cover | Decision | Reason |
|---|---|---|---|
| 01 | ICFD-31k, generated | REJECT / replace with gold reference | A literal set of conversational waveforms resolving into a detection band; reads as a visualization. |
| 02 | ScopeBench-PR, generated | REJECT / replace with gold reference | Two shells and matching spines reproduce the prompt mechanically; too diagrammatic and clean. |
| 03 | Temporal Retrieval, generated | REJECT / replace with gold reference | Atmospheric, but still explicitly shows selected curves routed by arrows into a forecasting container. |
| 04 | Modern Transformer | REJECT / regenerate | A dense, symmetrical architecture diagram with branches and modules; overly explanatory and visually busy. |
| 05 | WebSockets | REJECT / regenerate | Reads as a neon networking emblem or infographic; packet glyphs and a literal bidirectional loop are too obvious. |
| 06 | FernKit | REJECT / regenerate | A tree made from recognizable UI cards; essentially a component diagram. |
| 07 | Shamir Secret Sharing | SELECT | Elegant and sparse. It suggests splitting and convergence without looking like a generic security icon; sufficiently ambiguous at card scale. |
| 08 | Text Rasterization | REJECT / regenerate | A literal tutorial sequence with Bézier handles, arrow, grid, and a recognizable glyph. |
| 09 | AES | SELECT | Strong abstract pattern, restrained palette, and useful visual rhythm. The matrix is present but does not read as an instructional diagram at card scale. |
| 10 | Perceptron | REJECT / regenerate | Looks like a plotted classification example with a decision boundary and network node. |
| 11 | Clean and BLoC Architecture | SELECT | Organic concentric fields and a continuous path work as editorial abstraction; the technical meaning remains secondary. |
| 12 | BLoC Introduction | REJECT / regenerate | A clear input–transformer–output diagram using a central box and ordered states. |
| 13 | Linux Scheduling | REJECT / regenerate | Resembles a scheduler dashboard, instrument panel, or infographic wheel. |
| 14 | Android Runtime | REJECT / regenerate | A detailed compilation pipeline with many explicit pathways and terminal branches. |
| 15 | Arch Linux Guide | REJECT / regenerate | The mountain, stacked strata, and climbing path communicate the concept too literally. |

Final tally: **3 generated writing covers selected, 9 generated writing covers rejected, and all 3 generated research covers replaced by the user-made gold references.**

## Replacement shared prompt

Use this prefix for every replacement image:

> Create one original borderless 3:4 portrait inner artwork for a research and technology portfolio, exported as an opaque PNG at approximately 1086×1448. The visual language must match the supplied gold references: sophisticated tactile abstraction, layered collage, screen-print or monoprint grain, translucent overlaps, scraped or rolled pigment, irregular repetition, subtle misregistration, and confident negative space. The article topic is semantic inspiration only; do not illustrate or explain its mechanism. Abstraction level 8.5/10: the image should remain compelling if the viewer cannot identify the topic without reading the title. Use one dominant visual gesture, a restrained palette of four or five colors, and enough large-scale contrast to read at approximately 220 × 295 px when inset by the website. Do not add any outer mat, border, frame, or quiet margin; let the artwork reach the canvas edges. No text, letters, numbers, formulas, logos, watermarks, photorealism, 3D rendering, glossy CGI, pixel art, stock iconography, or interface imagery.
>
> Forbidden diagram grammar: no arrows, connectors, flowcharts, pipelines, input/output layouts, boxes linked by lines, node graphs, process stages, dashboards, charts, timelines, explicit grids, device silhouettes, central hubs with branches, or literal visualizations of the article’s mechanism. Avoid crisp vector-infographic perfection. Prefer ambiguous material relationships, texture, rhythm, density, interruption, compression, diffusion, layering, and asymmetry.

Always provide the gold-reference images to the generation model alongside the prompt.

## Improvement prompts for rejected writing covers

### 04 — Towards the Modern Transformer Architecture

> Create a layered architectural palimpsest in warm cream, dusty coral, aubergine, faded plum, and one restrained cobalt accent. Broad translucent slabs, narrow vertical traces, and partially erased repeated forms should gradually shift from dense and rigid in the lower-left toward lighter, more coherent rhythm in the upper-right. Suggest refinement through subtraction, spacing, and increasingly confident structure—not through modules or a technical progression. Use tactile paper grain, screen-printed overlaps, imperfect edges, and a few hidden recurring motifs. No neural blocks, attention branches, circuits, arrows, diagrams, columns of components, or symmetrical machine-like centerpiece.

### 05 — You Don’t Know WebSockets. Yet.

> Create an abstract woven field on deep indigo using turquoise, cobalt, coral, and small off-white interruptions. Two color currents should repeatedly pass through, around, and behind one another, creating a persistent reciprocal rhythm across the canvas. The relationship should feel continuous and alive, like a textile or layered print, without forming an infinity symbol or obvious loop. Add subtle misregistration and grain so the currents feel printed rather than digitally diagrammed. No terminals, endpoints, packets, arrows, sockets, browser shapes, network symbols, or communication icons.

### 06 — Go Beneath the Abstraction: Building Interactive UIs with FernKit

> Create an organic modular collage in mint, forest green, muted teal, cream, and one small apricot accent. Repeated cut-paper forms should grow through scale changes and overlaps, producing a loose botanical rhythm without depicting a tree, fern, screen, or component hierarchy. Some pieces should be clipped, nested, or partially occluded, suggesting hidden structure beneath a calm surface. Use paper texture, imperfect registration, and asymmetric negative space. No UI cards, browser windows, panels, buttons, layout diagrams, scene graphs, stems with attached boxes, or recognizable interface elements.

### 08 — Your Hardest “Hello World!”: Text Rasterization

> Create an abstract transition from fluid continuity to granular order. Begin with one broad, ambiguous calligraphic gesture made of translucent navy and powder-blue layers; let it gradually fragment into a field of small tonal units and dry-brush marks toward the opposite side. The transition should feel like matter changing state, not like a tutorial. Use pale gray, cobalt, navy, cream, and a tiny burnt-orange accent, with tactile print grain and substantial quiet space. No readable glyph, letterform, Bézier handles, control points, sampling grid, pixels arranged as a character, arrows, or before-and-after layout.

### 10 — Building Rosenblatt’s Perceptron From Scratch in Flutter

> Create two atmospheric populations of coral and cyan marks suspended in a pale blush field. They should begin entangled and gradually find separation through one oblique region of contrast created by layered paper, scraped pigment, and overlapping translucent veils. The dividing gesture should be implied by a shift in texture and density, not drawn as a line. Include a few residual marks crossing the boundary to preserve tension and learning-in-progress. No scatter plot, circular data points, axes, node network, activation unit, decision boundary line, arrows, or chart-like composition.

### 12 — Getting Started at BLoC Architecture

> Create a soft abstract study of irregular rhythm becoming compositional calm. On one side, use loosely scattered rose and pink fragments with varied edges; through the middle, let repeated translucent blue and charcoal layers compress and reorder the field; on the other side, allow mint and rose forms to settle into a quieter cadence. Keep the transformation implicit through texture and spacing, with no identifiable machine or central object. Use monoprint grain, cut-paper overlap, and generous cream negative space. No input/output sequence, transformer box, arrows, lanes, ordered UI blocks, or process diagram.

### 13 — Resource Management with Probabilistic Scheduling in Linux

> Create a restrained abstract composition about uneven allocation and recurring chance using slate, cool gray, muted blue, sage, mustard, and one small red accent. Build partial arcs, staggered bands, and repeated capsule-like marks into a shifting off-center rhythm; some marks should cluster, some should disappear, and others should re-enter elsewhere through visual repetition. Use worn screen-print texture and layered transparency so the system feels probabilistic rather than mechanical. No wheel, clock, queue, lanes, tokens moving along paths, dashboard, scheduler diagram, radial instrument panel, or central target.

### 14 — State of the Art: Android Runtime

> Create a tactile many-to-one-to-many abstraction in sage, charcoal, pale cream, muted cyan, and warm amber. A varied field of strokes and fragments should become densely compressed through a narrow central zone, then reopen below into several distinct material textures and directional rhythms. Keep the compression and release ambiguous, like folded paper, transferred pigment, and layered print plates rather than a technical process. No pipeline, source fragments feeding a chamber, chip, runtime core, ports, processor branches, arrows, connectors, code, or machine architecture.

### 15 — Comprehensive Arch Linux Guide

> Create a stratified abstract field inspired by patient assembly and increasing coherence. Use angular torn-paper strata, mineral textures, and offset bands in sand, charcoal, muted cyan, desaturated navy, and pale cream. A subtle pale seam may wander through several layers, sometimes disappearing and returning, but it must feel geological or painterly rather than like a route. The upper region should become slightly lighter and more ordered without forming a destination. No mountain, pyramid, staircase, road, installation path, stacked system diagram, hardware, terminal, or Arch-shaped silhouette.

## Selected-cover guardrails

The selected covers should be retained without regeneration for now:

- `writing-shamir-secret-sharing.png`
- `writing-aes.png`
- `writing-clean-bloc.png`

If the whole collection is later pushed toward an even more tactile style, use these only as compositional references and add surface grain or collage texture in a controlled revision. Do not replace them during the first regeneration pass; first compare them beside the nine new candidates and the three research gold references.

## Review checklist for the next model

Reject any candidate if one or more of these are true:

- The subject can be explained by tracing visible arrows or connectors.
- The cover looks like an infographic, dashboard, architecture diagram, tutorial graphic, or app icon.
- It contains a recognizable technical object such as a terminal, component card, network packet, plot, scheduler wheel, chip, or device.
- It follows the individual prompt so literally that the prompt could be reconstructed from the image.
- It uses clean vector symmetry without material texture or irregularity.
- It becomes visually empty or illegible at card scale.
- It includes its own margin while the website also adds a second outer mat.

Select a candidate when it communicates primarily through visual mood and formal relationships, has one memorable large-scale gesture, remains ambiguous without the title, and belongs naturally beside the three gold references.
