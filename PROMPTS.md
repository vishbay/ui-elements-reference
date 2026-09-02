# Prompt library for the UI reference set

Every prompt assumes the tool can read files. In Claude Code, point at the folder
(`/Users/vishbay/Desktop/Ui-elements-reference/`) or copy the file you need into the
project. For tools that cannot read files (web chat, v0, Cursor without the folder
open), paste the token block from `tokens.css` and the `<section>` you want ported.

Replace anything in `[brackets]`. Prompts are grouped by the moment you use them.

---

## 0. Start of a project — install the system

```
Read /Users/vishbay/Desktop/Ui-elements-reference/DESIGN-BRIEF.md and
/Users/vishbay/Desktop/Ui-elements-reference/tokens.css.

Copy tokens.css into this project at [src/styles/tokens.css] unchanged and import it
once at the root. Add the brief's "Non-negotiables" section to this project's
CLAUDE.md verbatim. From now on every component reads colours, radii, shadows and
easing only from those variables. Confirm by listing the variables you will use and
stop; do not build anything yet.
```

## 1. Pick and apply a theme

```
Open ui-ref-08-theme-cookbook.html, ui-ref-09-theme-cookbook-2.html and
ui-ref-10-theme-cookbook-3.html and read the "Picking one" table in file 10.

This product is [an internal incident console used on 27-inch monitors by on-call
engineers / a customer-facing SaaS admin / a document tool]. Recommend one theme
and say why in two sentences. Then copy that theme's token block over the
[data-t="dark"] block in tokens.css, keep the light block as is unless the theme is
light-only, and show me one KPI card and one table row rendered with it before
touching anything else.
```

## 2. Build a full screen from a composition

```
Read ui-ref-11-console-compositions.html section [01 — Incident console].
Build the equivalent screen for [my domain: e.g. a fleet of Kubernetes clusters]
in [React + CSS modules / plain HTML / Vue] using the project's tokens.css.

Keep the shell exactly as the reference: nav on --bg-2, top bar on --bg-2, content
on --bg, inspector on --bg-2, hairline borders, no shadows on chrome. Keep the
density token so compact mode works. Replace every placeholder with realistic,
uneven data for my domain; no lorem, no round numbers. Do not add anything the
reference does not have: no hero, no illustration, no gradient.
```

## 3. Build one component from a section

```
Read ui-ref-[03-data-display].html, section [06 — People, access & audit], the
[permission matrix] only. Port it to [React + TypeScript] as a component named
[PermissionMatrix] that takes [roles, capabilities, and a state map] as props.

Match the reference pixel for pixel: same tri-state dot, same locked cell, same
row hover tint, same sizes. Read colours from tokens.css variables, never literal
values. Include the light and dark behaviour by relying on the variables, not on
a theme prop. Show me the component and a ten-line usage example.
```

## 4. Filter bar, saved views, date range (the ops-console spine)

```
Read ui-ref-02-buttons-controls.html section 05. Build a [FilterBar] for a list of
[incidents] with: saved-view tabs with counts, removable filter chips, an
add-filter popover that searches fields, and the two-click date-range calendar
with presets. Wire it to [my query state / URL params]. Keep the chip animation
and the popover spring exactly as the reference. No new colours.
```

## 5. Charts

```
Read ui-ref-04-charts.html and the porting notes at the bottom. I need a
[stacked area of runs by outcome over the last 24h]. Use [Recharts / ECharts /
hand-rolled SVG] but reproduce the reference's rules: one accent hue with opacity
for density, semantic colours only for status series, fills at 55% opacity,
tabular axis numerals in --text-faint, no gridlines heavier than --hairline,
no legend colours that are not in tokens.css.
```

## 6. Themes for a marketing-facing surface

```
Read ui-ref-09-theme-cookbook-2.html section 00, the four rules for readable glass,
and ui-ref-01-surfaces.html sections 02 and 04. Build the [login page] using the
Glass Refined tokens. Backdrop must be page content or a two-blob ambient at 20%
opacity, never a multi-hue mesh. Text sits only on opaque or near-opaque cards.
One effect on this screen, and name which one you spent it on.
```

## 7. De-generic pass on an existing screen

```
Read ui-ref-18-signature-restraint.html sections 01, 02 and 07. Take a screenshot
of [this screen / the attached image] and run the twelve checks in section 07
against it. For each failing check, name the element and the exact change. Then
apply the changes. Typical fixes: remove gradient text, remove glow at rest,
remove left accent bars, replace emoji icons, left-align, make card sizes follow
importance, put the accent back to its four uses only.
```

## 8. Microcopy pass

```
Read ui-ref-17-microcopy.html. Rewrite every user-facing string in [this file /
this screen] to the reference's register: errors say what failed, what is safe,
and what to do next; buttons name their outcome; empty states distinguish
nothing-yet from nothing-matches; numbers, dates and identifiers follow section 05.
Return a two-column table of before and after, then apply.
```

## 9. Accessibility pass

```
Read ui-ref-13-accessibility.html. Audit [this component / screen] for: visible
focus rings on every interactive element, keyboard order, roving tabindex on
composite widgets, live regions for status changes, non-colour status indicators,
contrast of every text/background pair in both themes, focus trap and Escape on
overlays, and reduced-motion handling. List failures with line references, then fix.
```

## 10. Motion pass

```
Read ui-ref-16-motion-choreography.html and the "Duration and easing by interaction"
reference. Review every transition and animation in [this screen]. Enforce: enter
and exit use different curves, lists stagger at 50–70ms, nothing overshoots except
toggles and toasts, nothing animates at rest except live indicators, and everything
respects prefers-reduced-motion. Show a table of element, current, corrected.
```

## 11. Port a pattern to a framework

```
Read ui-ref-[05-overlays-nav].html section [04 — Tabs]. Convert the [underline tabs
with sliding indicator] to [a Tailwind + React component]. Map every CSS variable
to a Tailwind theme token that reads the same CSS variable (do not replace
variables with literal colours). Preserve: the indicator is one absolutely
positioned element moved with the spring easing, closable tabs promote a
neighbour, overflow scrolls with fade masks. Include the keyboard behaviour.
```

## 12. Critique a design or screenshot

```
Read ui-ref-18-signature-restraint.html. Here is [a screenshot / a Figma export /
a competitor's screen]. Identify which of the fingerprint tells from section 01 are
present, what the effect budget spend is, whether the accent is doing more than
four jobs, and whether the type has a decision behind it. Then propose the
smallest set of changes that would pass the section 07 checklist. No praise.
```

## 13. Add a new pattern to the reference itself

```
Open /Users/vishbay/Desktop/Ui-elements-reference/ui-ref-[NN]-*.html. Add a section
"[NN — Name]" following the file's conventions exactly: the same sec-head markup,
a .tile with a light pane and a dark pane containing identical markup, CSS with a
unique class prefix appended before </style>, and any JS appended before
</script>. It must read only from the token block. No left accent bars, no glow at
rest, no gradients with more than one hue. Then add the section to index.html's
card for that file, and verify by rendering the file headless in Chrome.
```

## 14. Choose a background

```
Read ui-ref-19-backgrounds.html. This screen is a [login page / empty dashboard /
DAG canvas / pricing hero / settings page]. Using the pairing table in section 06,
pick one background from sections 01–05 and paste its CSS verbatim; do not invent
a gradient. If the screen carries any table or chart, the answer is the solid
ground. If it needs a real photograph, apply the four-step recipe in section 05
and put every piece of text on an opaque card.
```

## 15. Build or wire the assistant tab

```
Read /Users/vishbay/Desktop/Ui-elements-reference/assistant-panel/README.md
and schema.js. Copy the assistant-panel/ folder into this project unchanged
(vanilla JS: use renderer.js directly; Vue: use vue/AssistantPanel.vue).
Load tokens.css or map its variable names onto our existing theme.

Our assistant backend is [describe it precisely: endpoint, streaming
format, tool-calling shape, whatever it actually is]. Write ONLY the glue:
a function that calls it and produces schema.js-shaped Turn/Block objects,
calling startTurn/upsertBlock/finishTurn as data arrives. Do not modify
renderer.js, panel.css, or AssistantPanel.vue. If our backend needs
something no block type covers, tell me what's missing instead of
inventing markup.
```

---

## Habits that make these work

- **Name the file and section.** "Like the reference" produces guesses; "file 03
  section 06, the audit log" produces a port.
- **Give real data.** Placeholder text is the second biggest reason screens look
  generated. Paste ten real rows before asking for a table.
- **Ask for the checklist result, not an opinion.** "Run section 07 and list
  failures" gets you something to act on. "Does this look good?" gets you praise.
- **One theme per product, chosen up front.** Changing themes later is a
  token-block swap only if the components stayed on variables from the start,
  which is why prompt 0 runs first.
- **Keep effects at zero on data screens.** If a screen still looks generic after
  the checklist passes, the problem is the content, not the styling.
