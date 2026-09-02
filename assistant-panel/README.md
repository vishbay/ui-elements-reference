# Assistant Panel

A reusable, framework-agnostic UI for an "assistant" tab: message bubbles, a
collapsible thinking trace, tool-call rows that animate through running →
done/error, citations, a retryable error row, suggested follow-ups, and a
composer. This is the **UI and interaction layer only** — it has no idea what
backend it's talking to, on purpose.

## Why it's reusable across projects

The package is split into two things that change independently:

- **`schema.js`** — a small set of block shapes (`text`, `thinking`,
  `tool_call`, `error`, `suggestions`) that any assistant turn gets mapped
  into. This is the *contract*.
- **`renderer.js`** (+ `panel.css`) — the one implementation of the markup
  and every animation, driven entirely by block **state**
  (`status: 'running'|'done'|'error'`, `streaming: true/false`), never by
  content. The same interaction plays whether the tool is called
  `query_billing` or `search_inventory`.

Per project, the only new code is turning that project's real assistant
response into objects matching `schema.js`, then calling three methods on the
controller (`startTurn`, `upsertBlock`, `finishTurn`). Nothing in this folder
needs to change to plug into a new backend.

## Files

| File | What it is |
|---|---|
| `schema.js` | JSDoc typedefs for `Turn` and `Block` — the contract. No runtime code. |
| `panel.css` | All styling, ported class-for-class from `ui-ref-07-ai-interface.html`. Reads only CSS variables — load `tokens.css` (or your own token stylesheet with the same names) first. |
| `renderer.js` | The vanilla-JS controller: `mountAssistantPanel(root, handlers)` → `{ startTurn, upsertBlock, finishTurn, setBusy, clear, focus }`. Zero dependencies. |
| `vue/AssistantPanel.vue` | A thin Vue 3 wrapper. Mounts `renderer.js` into a ref and forwards the exact same controller via `defineExpose`. Does not reimplement anything. |
| `demo.js` | **Not reusable** — mock data that plays the role a backend would, so `../ui-ref-20-assistant-panel.html` is a working page with no server. Read it to see the target block shapes. |

## Using it in a plain HTML/JS project

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="assistant-panel/panel.css">
<div id="panel-root"></div>
<script type="module">
  import { mountAssistantPanel } from './assistant-panel/renderer.js';

  const panel = mountAssistantPanel(document.getElementById('panel-root'), {
    onSend: text => sendToAssistant(text),
    onSuggestion: text => sendToAssistant(text),
    onRetry: () => retryLastFailedStep(),
  });

  async function sendToAssistant(text){
    panel.setBusy(true);
    panel.startTurn({ id: crypto.randomUUID(), role: 'user', blocks: [{ type:'text', text }] });

    const turnId = crypto.randomUUID();
    panel.startTurn({ id: turnId, role: 'assistant', blocks: [] });

    // Wire this to your real backend. Every time you have a new or updated
    // block, call upsertBlock — works identically for a single non-streaming
    // response (call it once per block) or a token/event stream (call it on
    // every delta).
    let index = 0;
    for await (const block of yourBackendCall(text)) {
      panel.upsertBlock(turnId, index++, block);
    }
    panel.finishTurn(turnId);
    panel.setBusy(false);
  }
</script>
```

## Using it in Vue

```vue
<script setup>
import { ref } from 'vue';
import AssistantPanel from './assistant-panel/vue/AssistantPanel.vue';
import './assistant-panel/panel.css'; // once, at the app entry, is also fine

const panel = ref(null);
const busy = ref(false);

async function onSend(text){
  busy.value = true;
  panel.value.startTurn({ id: crypto.randomUUID(), role: 'user', blocks: [{ type:'text', text }] });
  const turnId = crypto.randomUUID();
  panel.value.startTurn({ id: turnId, role: 'assistant', blocks: [] });
  let index = 0;
  for await (const block of yourBackendCall(text)) {
    panel.value.upsertBlock(turnId, index++, block);
  }
  panel.value.finishTurn(turnId);
  busy.value = false;
}
</script>

<template>
  <AssistantPanel ref="panel" :busy="busy" @send="onSend" @suggestion="onSend" />
</template>
```

## The point: how a coding agent reuses this

You don't redesign the UI per project. You point a coding agent at this
folder and describe the backend, and its only job is the glue — the loop
above. A prompt that works:

```
Read assistant-panel/README.md and assistant-panel/schema.js in
/Users/vishbay/Desktop/Ui-elements-reference/.

Copy assistant-panel/ into this project unchanged, load tokens.css (or map
its variable names onto our existing theme), and mount it as the assistant
tab at [route/component location].

Our assistant backend is [describe it: an endpoint, a streaming format, a
tool-calling loop, whatever it actually is]. Write ONLY the glue: a function
that calls our backend and produces schema.js-shaped Turn/Block objects,
calling startTurn/upsertBlock/finishTurn as data arrives. Do not modify
renderer.js, panel.css, or AssistantPanel.vue — if the UI can't express
something our backend needs, tell me what block type is missing instead of
improvising markup.
```

That last line matters: it keeps every project's assistant tab visually and
behaviourally identical, and any real new need (a new block type) becomes a
deliberate addition to `schema.js` and `renderer.js` here, not a one-off
built inside a single project.

## What's demonstrated in `demo.js`

Open `../ui-ref-20-assistant-panel.html` (served, not double-clicked — see
its file:// warning) to see, with no backend: a streamed thinking block that
collapses to a summary, three tool calls running in parallel where one
fails, a retryable error row, a streamed answer with citations, and
suggested follow-ups. Every state transition in that page is driven by
plain objects shaped like `schema.js` — that is exactly what a real backend
adapter needs to produce.
