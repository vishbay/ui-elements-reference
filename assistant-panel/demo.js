/**
 * assistant-panel/demo.js
 * ============================================================
 * Not part of the reusable package — schema.js, panel.css and
 * renderer.js are. This file plays the role a real backend would:
 * it produces Turn/Block objects (see schema.js) on a timer, so the
 * page is demonstrably functional with no server. It exists to show,
 * concretely, the exact shape of data the UI expects at every stage
 * (streaming thinking, staggered tool calls, a failed tool with retry,
 * streamed answer text with citations, suggested follow-ups). Read
 * this file to see what a coding agent needs to produce from a prompt
 * in a real project — the block shapes below are the target, not the
 * plumbing.
 * ============================================================ */
import { mountAssistantPanel } from './renderer.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const uid = p => p + '-' + Math.random().toString(36).slice(2, 8);

export function mountDemo(root){
  let activeAId = null;   // turn currently able to retry its failed tool
  let errorIdx = null;    // block index of that turn's error block

  const panel = mountAssistantPanel(root, {
    onSend: text => runTurn(text),
    onSuggestion: text => runTurn(text),
    onRetry: () => retryFailedTool(),
  });

  async function runTurn(userText){
    panel.setBusy(true);

    const uTurn = { id: uid('u'), role: 'user', blocks: [{ type: 'text', text: userText }] };
    panel.startTurn(uTurn);

    const aId = uid('a');
    activeAId = aId; errorIdx = null;
    panel.startTurn({ id: aId, role: 'assistant', blocks: [] });

    // --- block 0: thinking, streamed word by word, then collapsed with a summary ---
    const thinkFull = 'Checking cycle progress by pipeline, then comparing against the '
      + '14-day average completion curve. Cross-referencing open incidents on the same service.';
    let thinkText = '';
    panel.upsertBlock(aId, 0, { type: 'thinking', text: '', streaming: true });
    for (const word of thinkFull.split(' ')) {
      thinkText += (thinkText ? ' ' : '') + word;
      panel.upsertBlock(aId, 0, { type: 'thinking', text: thinkText, streaming: true });
      await sleep(16);
    }
    panel.upsertBlock(aId, 0, {
      type: 'thinking', text: thinkText, streaming: false,
      summary: 'Analysed 707 running pipelines',
    });

    // --- blocks 1-3: tool calls, staggered; the third fails ---
    const tools = [
      { id: uid('t'), name: 'query_metrics_store', input: { project: 'Retail', window: '24h' } },
      { id: uid('t'), name: 'get_pipeline_status', input: { pipeline_ids: 'retail_*' } },
      { id: uid('t'), name: 'fetch_incident_history', input: { service: 'Retail' } },
    ];
    tools.forEach((t, i) => panel.upsertBlock(aId, 1 + i, { ...t, type: 'tool_call', status: 'running' }));
    await sleep(480);
    panel.upsertBlock(aId, 1, { ...tools[0], type: 'tool_call', status: 'done', durationLabel: '1.2s' });
    await sleep(340);
    panel.upsertBlock(aId, 2, { ...tools[1], type: 'tool_call', status: 'done', durationLabel: '840ms' });
    await sleep(820);
    panel.upsertBlock(aId, 3, { ...tools[2], type: 'tool_call', status: 'error', durationLabel: 'failed' });

    // --- block 4: a distinct, retryable error the user can act on ---
    errorIdx = 4;
    panel.upsertBlock(aId, 4, {
      type: 'error', message: 'fetch_incident_history timed out after 30s', retryable: true,
    });
    panel.finishTurn(aId);
    panel.setBusy(false);
    // Demo stops here until the user clicks Retry — see retryFailedTool().
  }

  async function retryFailedTool(){
    if (activeAId === null || errorIdx === null) return;
    const aId = activeAId, idx = errorIdx;
    errorIdx = null;
    panel.setBusy(true);
    panel.upsertBlock(aId, 3, {
      id: uid('t'), name: 'fetch_incident_history', input: { service: 'Retail' },
      type: 'tool_call', status: 'running',
    });
    panel.upsertBlock(aId, idx, { type: 'error', message: 'Retrying…', retryable: false });
    await sleep(650);
    panel.upsertBlock(aId, 3, {
      id: uid('t'), name: 'fetch_incident_history', input: { service: 'Retail' },
      type: 'tool_call', status: 'done', durationLabel: '2.1s',
    });

    // --- streamed answer text with citations, replacing the resolved error slot ---
    const answer = 'The project is behind because of volume, not failure. '
      + '**707 of 823 pipelines** are still executing — none have failed.\n\n'
      + 'Average step duration is `3h 13m` against a 14-day norm of `2h 41m`. '
      + 'No SLA breach yet — there is roughly 90 minutes of margin left.';
    const citations = [
      { title: 'Metrics store · run_history', url: '#' },
      { title: 'Incident tracker · INC-4821', url: '#' },
    ];
    let acc = '';
    panel.upsertBlock(aId, idx, { type: 'text', text: '', streaming: true });
    for (const ch of answer) {
      acc += ch;
      panel.upsertBlock(aId, idx, { type: 'text', text: acc, streaming: true });
      await sleep(7);
    }
    panel.upsertBlock(aId, idx, { type: 'text', text: acc, streaming: false, citations });

    // --- final block: suggested follow-ups ---
    panel.upsertBlock(aId, idx + 1, {
      type: 'suggestions', items: [
        'Show the 90-minute margin calculation',
        'What failed in fetch_incident_history?',
        "Compare against yesterday's cycle",
      ],
    });
    panel.finishTurn(aId);
    panel.setBusy(false);
  }

  // Seed the panel with one completed turn so the pattern is visible on load.
  runTurn('Why did the Retail project fall behind today?');

  return panel;
}
