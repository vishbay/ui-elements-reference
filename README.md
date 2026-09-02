# UI Elements Reference

A personal reference library of zero-dependency HTML files for building operations
consoles and modern SaaS UI without the generic AI-generated look. Open `index.html`
to browse everything, or jump straight to `PROMPTS.md`.

## Start here

- **[PROMPTS.md](PROMPTS.md)** — fifteen copy-paste prompts for Claude Code and
  similar tools: install the system, pick a theme, build a screen or component,
  de-generic an existing design, run the acceptance checklist.
- **[DESIGN-BRIEF.md](DESIGN-BRIEF.md)** — drop-in section for a project's
  `CLAUDE.md`/`AGENTS.md`: ten non-negotiables plus a map of which file holds
  which pattern.
- **[tokens.css](tokens.css)** — the house dark/light design tokens as a
  standalone stylesheet. Copy into any project unchanged.

## The reference files

Eighteen numbered files (`ui-ref-01` … `ui-ref-19`) plus two motion-library
files, each self-contained with a light/dark toggle:

| # | File | Covers |
|---|---|---|
| 01 | Surfaces & Materials | Elevation, glass, grain, ambient light, focus/edges, textures, scrims, bento |
| 02 | Buttons & Controls | Buttons, inputs, switches, tags, dropzone, filter bar, date range |
| 03 | Data Display | Tables, log viewer, JSON/diff, micro-charts, timeline, avatars, permissions, audit log, uptime |
| 04 | Charts & Visualisation | Time series, heatmap, Gantt, waterfall, Sankey, grouped bars, scatter |
| 05 | Overlays & Navigation | Menus, popovers, command palette, sidebar, breadcrumbs, stepper, sheets, toasts, tabs |
| 06 | States & Feedback | Empty/error states, banners, progress, skeletons, freshness, notification centre |
| 07 | AI Interface Patterns | Thinking, tool calls, citations, streaming, composer |
| 08 | Theme Cookbook | Console, Terminal, Swiss Editorial, Neo-Brutalist, Dense Desk |
| 09 | Theme Cookbook II | Glass Refined, Frost, Material 3, Fluent 2, Document, Solarized, High Contrast, Print |
| 10 | Theme Cookbook III | Studio Light, Midnight, Mono Utility, Warm Paper, Carbon Industrial, HUD |
| 11 | Console Compositions | Full screens: incident console, pipeline DAG + logs, fleet table, settings, status/SLO |
| 12 | Layout & Responsive | Split panes, sticky headers, scroll-spy, masonry, responsive tables, kanban |
| 13 | Accessibility | Focus, live regions, contrast, focus traps, reduced motion |
| 14 | Onboarding & Adoption | Coach marks, checklists, changelogs, progressive disclosure |
| 15 | Print & Export | Report layout, export UI, print stylesheet |
| 16 | Motion Choreography | Easing, stagger, orchestration, shared elements |
| 17 | Content & Microcopy | Errors, buttons, empty states, tone, formatting |
| 18 | Signature & Restraint | Effect budget, type pairings, accent, grid, detail signatures, checklist |
| 19 | Backgrounds | Solid grounds, tonal gradients, ambient light, structure, photo treatment |
| 20 | Assistant Panel | Live demo of the reusable `assistant-panel/` package |

Plus `ui-motion-reference.html` / `-compat.html`, a zero-dependency motion
pattern library (count-ups, gauges, staggered reveals, table row flash, etc).

## Reusable code

Unlike the numbered reference files, **`assistant-panel/`** is a real, drop-in
package, not a copy-paste pattern: a backend-agnostic data schema
(`schema.js`), a vanilla-JS renderer (`renderer.js` + `panel.css`), and a Vue
wrapper (`vue/AssistantPanel.vue`) that mounts the exact same renderer, so
there is one implementation of the interactions across both stacks. See
`assistant-panel/README.md` and the live demo at
`ui-ref-20-assistant-panel.html`. Point a coding agent at the folder and it
only has to write the glue between your actual backend and the schema —
see the prompt in that README.

## Conventions

- Every file shares the same design tokens under `[data-t="dark"]` /
  `[data-t="light"]`; components read only from those variables.
- Ground colour is obsidian `#0b1215` on dark, never pure black.
- One accent (azure), spent only on current nav, selected row, primary button,
  and focus — see `ui-ref-18-signature-restraint.html` for the full rule set.
- No left-edge accent bars, no glow at rest, no multi-hue gradients, no
  gradient text, no emoji as icons.

No build step, no dependencies. Open any `.html` file directly in a browser.
