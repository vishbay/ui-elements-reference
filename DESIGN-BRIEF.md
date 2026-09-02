# Design brief — drop into any project's CLAUDE.md / AGENTS.md

Copy this file (or paste its contents) into the instructions file of a new project.
It tells an AI coding tool how to build UI that matches the reference set at
`/Users/vishbay/Desktop/Ui-elements-reference/` without looking generated.

## Source of truth

- Tokens: `tokens.css` in the reference folder. Copy it into the project unchanged.
  Every colour, radius, shadow and easing comes from a variable; never hard-code a hex.
- Patterns: the numbered `ui-ref-NN-*.html` files. When asked for a component, open
  the matching file and port the pattern; do not invent a new one.
- Rules: `ui-ref-18-signature-restraint.html` section 07 is the acceptance checklist.

## Building an assistant / AI chat tab

Do not design this from scratch. Copy `assistant-panel/` from the reference
repo unchanged and read its README before writing any UI code. It is a
working schema + renderer (vanilla JS and Vue), already built from file 07's
patterns; the only project-specific code is a small adapter that turns your
real backend's responses into the block shapes `assistant-panel/schema.js`
defines, then calls `startTurn` / `upsertBlock` / `finishTurn`. If a real
need can't be expressed in the existing block types, add the block type to
`schema.js` and `renderer.js` — do not improvise one-off markup inside the
project.

## Non-negotiables

1. Ground is obsidian `#0b1215` on dark, `#f5f6f8` on light. Never pure black or pure grey.
2. Three surface levels only: `--bg` (page), `--surface` (cards, tables), `--bg-2` (chrome:
   nav, top bar, inspector). Overlays get the only large shadow (`--e3`/`--e4`).
3. One accent, azure `--accent`, spent on exactly four things: current nav item, selected
   row, primary button, focus. Never on headings, icons or decoration.
4. Status colour (`--good`, `--warn`, `--danger`) appears only where it carries meaning:
   dots, badges, chart marks, deltas. No coloured headers, no coloured card backgrounds.
5. No left-edge accent bars, no glow at rest, no gradient text, no multi-hue gradients,
   no glass over data, no emoji as icons. Effect budget is two per screen; zero on data screens.
6. Tabular numerals on every table and KPI. Mono for identifiers, timestamps, log lines.
7. 8px grid for gaps, padding and control heights; 4px only inside components.
8. Left-aligned everywhere except login and empty states. Cards are not equal-sized unless
   the data is equally important.
9. Density is a token (`--pad`, `--row`, `--fs`), never a second layout.
10. Backgrounds come from file 19 only: solid ground under data, one tonal gradient or ambient
    light under login/empty states, structure at hairline strength under canvases. Never invent one.
11. Copy is operational: what happened, what is safe, what to do next. No adjectives.
    See `ui-ref-17-microcopy.html`.

## Where each pattern lives

| Need | File | Section |
|---|---|---|
| Elevation, glass, grain, ambient light, focus, textures, scrims, bento | 01 | all |
| Buttons, inputs, switches, tags, dropzone, filter bar, date range | 02 | 01–05 |
| Tables, log viewer, JSON/diff, micro-charts, timeline, avatars, permissions, audit log, uptime | 03 | 01–06 |
| Time series, heatmap, Gantt, waterfall, Sankey, grouped bars, scatter | 04 | 01–05 |
| Menus, popovers, command palette, sidebar, breadcrumbs, stepper, sheets, toasts, tabs | 05 | 01–04 |
| Empty/error states, banners, progress, skeletons, freshness, notification centre | 06 | 01–05 |
| AI chat: thinking, tool calls, streaming, citations, composer | 07 | 01–03 |
| Themes (19): Console, Terminal, Swiss, Brutalist, Dense, Glass Refined, Frost, Material, Fluent, Document, Solarized, High Contrast, Print, Studio Light, Midnight, Mono Utility, Warm Paper, Carbon, HUD | 08, 09, 10 | — |
| Full screens: incident console, DAG + logs, fleet table, settings + permissions, status/SLO | 11 | 01–05 |
| Split panes, sticky, scroll-spy, masonry, responsive tables, infinite scroll, kanban | 12 | 01–06 |
| Keyboard, live regions, contrast, focus traps, reduced motion | 13 | 01–04 |
| Tours, checklists, changelogs, progressive disclosure | 14 | 01–03 |
| Print and export | 15 | 01–04 |
| Easing, stagger, orchestration, shared elements | 16 | 01–06 |
| Errors, buttons, empty-state copy, tone, number and date formatting | 17 | 01–07 |
| Fingerprint, effect budget, type pairings, accent, grid, detail signatures, checklist | 18 | 01–07 |
| Page grounds: solids, tonal gradients, ambient light, grids/contours, photo treatment, pairing rules | 19 | 01–06 |
| A reusable assistant-tab UI (schema + vanilla-JS renderer + Vue wrapper) | 20 + `assistant-panel/` | — |

## Before reporting a screen as done

Run the twelve checks in file 18 section 07 against a screenshot of the screen, and
list any that fail. Do not describe a screen as "modern" or "clean"; describe what
the checks found.
