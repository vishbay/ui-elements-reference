/**
 * assistant-panel/renderer.js
 * ============================================================
 * The one implementation of the assistant tab's markup and interactions.
 * Everything here is driven by state (block type + status), never by
 * content — the same DOM structure and the same CSS animation fire
 * whether the tool is "query_billing" or "search_inventory", whether
 * the text is a paragraph or an error message. That is what makes this
 * package genuinely reusable: plugging in a new backend only ever means
 * writing an adapter (see adapters/claude.js) that produces Block
 * objects (see schema.js) — this file does not change.
 *
 * Framework note: this is plain DOM, no dependency. The Vue wrapper in
 * vue/AssistantPanel.vue does not reimplement any of this — it mounts
 * this exact module into a ref and forwards prop/event changes to the
 * same controller returned below. So there is only one place the
 * interactions and animations are defined, regardless of stack.
 * ============================================================
 */

const ICONS = { running: '↻', done: '✓', error: '⚠' };

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/** Minimal, safe markdown: paragraphs, **bold**, `code`, and bullet lists.
 *  Escapes everything else. Swap this for a real markdown renderer if you
 *  need more — the block still just needs to end up as text, this
 *  function is not part of the reusable contract. */
function mdLite(text){
  const lines = String(text ?? '').split(/\n{2,}/);
  return lines.map(block => {
    const items = block.split('\n').filter(Boolean);
    if (items.every(l => /^[-*]\s/.test(l)) && items.length){
      return '<ul>' + items.map(l => '<li>' + inline(l.replace(/^[-*]\s/, '')) + '</li>').join('') + '</ul>';
    }
    return '<p>' + inline(block) + '</p>';
  }).join('');
  function inline(s){
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }
}

function citationChips(citations){
  if (!citations || !citations.length) return '';
  return citations.map((_, i) =>
    `<span class="asst-cite" data-cite-idx="${i}" title="${esc(citations[i].title)}">${i + 1}</span>`
  ).join('');
}

function sourcesRow(citations){
  if (!citations || !citations.length) return '';
  return '<div class="asst-srcs">' + citations.map(c =>
    `<a class="asst-src" href="${esc(c.url || '#')}" target="_blank" rel="noopener"><i></i>${esc(c.title)}</a>`
  ).join('') + '</div>';
}

/**
 * Mount an assistant panel into `root`.
 * @param {HTMLElement} root
 * @param {{onSend?:(text:string)=>void, onStop?:()=>void, onRetry?:(blockId:string)=>void, onSuggestion?:(text:string)=>void}} [handlers]
 */
export function mountAssistantPanel(root, handlers = {}){
  const { onSend, onStop, onRetry, onSuggestion } = handlers;
  root.classList.add('asst-panel');
  root.innerHTML = `
    <div class="asst-chat" role="log" aria-live="polite" aria-relevant="additions"></div>
    <div class="asst-compose-wrap">
      <div class="asst-composer">
        <textarea class="asst-input" placeholder="Ask about this data..." rows="1"></textarea>
        <button class="asst-send" type="button" aria-label="Send">&#8593;</button>
      </div>
      <div class="asst-hint">Enter to send &middot; Shift+Enter for new line</div>
    </div>`;

  const chatEl = root.querySelector('.asst-chat');
  const inputEl = root.querySelector('.asst-input');
  const sendBtn = root.querySelector('.asst-send');

  function autoGrow(){ inputEl.style.height = 'auto'; inputEl.style.height = inputEl.scrollHeight + 'px'; }
  function trySend(){
    const text = inputEl.value.trim();
    if (!text || sendBtn.disabled) return;
    inputEl.value = ''; autoGrow();
    onSend && onSend(text);
  }
  inputEl.addEventListener('input', autoGrow);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); trySend(); }
  });
  sendBtn.addEventListener('click', trySend);

  /** turnId -> { el, bodyEl, blockEls: Map<index, HTMLElement> } */
  const turns = new Map();

  function turnRow(turn){
    const el = document.createElement('div');
    el.className = 'asst-msg ' + (turn.role === 'user' ? 'u' : 'a');
    el.dataset.turnId = turn.id;
    if (turn.role === 'user'){
      el.innerHTML = `<div class="asst-av uu"></div><div class="asst-bub"></div>`;
    } else {
      el.innerHTML = `<div class="asst-av"></div><div class="asst-turn-body" style="flex:1;min-width:0"></div>`;
    }
    return el;
  }

  function ensureTurn(turn){
    let rec = turns.get(turn.id);
    if (rec) return rec;
    const el = turnRow(turn);
    chatEl.appendChild(el);
    const bodyEl = turn.role === 'user' ? el.querySelector('.asst-bub') : el.querySelector('.asst-turn-body');
    rec = { el, bodyEl, role: turn.role, blockEls: new Map() };
    turns.set(turn.id, rec);
    return rec;
  }

  function makeBlockEl(block){
    if (block.type === 'text'){
      const el = document.createElement('div'); el.className = 'asst-bub';
      return el;
    }
    if (block.type === 'thinking'){
      const wrap = document.createDocumentFragment();
      const head = document.createElement('div'); head.className = 'asst-think';
      head.innerHTML = `<span class="sp"></span><span class="asst-think-summary"></span><span class="cv">&#8250;</span>`;
      head.addEventListener('click', () => head.classList.toggle('open'));
      const body = document.createElement('div'); body.className = 'asst-think-body';
      body.innerHTML = `<div class="asst-think-in"><div class="asst-think-pad"></div></div>`;
      wrap.appendChild(head); wrap.appendChild(body);
      const holder = document.createElement('div');
      holder.appendChild(wrap);
      return holder; // a plain wrapper div so it can live in the blockEls map as one node
    }
    if (block.type === 'tool_call'){
      const el = document.createElement('div'); el.className = 'asst-tool';
      el.innerHTML = `<span class="ic"></span><span class="nm"></span><span class="ar"></span><span class="st"></span>`;
      return el;
    }
    if (block.type === 'error'){
      const el = document.createElement('div'); el.className = 'asst-errow';
      el.innerHTML = `<div style="flex:1">
        <div class="asst-tool" data-status="error"><span class="ic">${ICONS.error}</span>
          <span class="nm">Error</span><span class="ar"></span><span class="st">failed</span></div>
        <div class="asst-errow-acts"></div></div>`;
      return el;
    }
    if (block.type === 'suggestions'){
      const el = document.createElement('div'); el.className = 'asst-follow';
      return el;
    }
    const fallback = document.createElement('div');
    return fallback;
  }

  function syncBlockEl(el, block, index){
    if (block.type === 'text'){
      el.classList.toggle('asst-caret', !!block.streaming);
      el.innerHTML = mdLite(block.text) + citationChips(block.citations) + sourcesRow(block.citations);
      return;
    }
    if (block.type === 'thinking'){
      const head = el.querySelector('.asst-think');
      head.dataset.streaming = String(!!block.streaming);
      head.querySelector('.asst-think-summary').textContent = block.summary || (block.streaming ? 'Thinking…' : 'Thought process');
      el.querySelector('.asst-think-pad').textContent = block.text;
      return;
    }
    if (block.type === 'tool_call'){
      el.dataset.status = block.status;
      el.querySelector('.ic').textContent = ICONS[block.status] || ICONS.running;
      el.querySelector('.nm').textContent = block.name;
      el.querySelector('.ar').textContent = block.input ? Object.entries(block.input).map(([k, v]) => `${k}=${v}`).join(', ') : '';
      el.querySelector('.st').textContent = block.status === 'running' ? 'running' : (block.durationLabel || block.status);
      return;
    }
    if (block.type === 'error'){
      el.querySelector('.ar').textContent = block.message;
      el.querySelector('.st').textContent = block.retryable === false ? 'retrying' : 'failed';
      const acts = el.querySelector('.asst-errow-acts');
      acts.innerHTML = '';
      if (block.retryable){
        const retry = document.createElement('button'); retry.className = 'asst-btn asst-btn-g';
        retry.textContent = '↻ Retry'; retry.onclick = () => onRetry && onRetry(block.id);
        acts.appendChild(retry);
      }
      return;
    }
    if (block.type === 'suggestions'){
      el.innerHTML = '';
      (block.items || []).forEach((text, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'asst-fu';
        b.style.animationDelay = (0.06 * i) + 's';
        b.innerHTML = `<span class="ar">&#8594;</span>${esc(text)}`;
        b.addEventListener('click', () => onSuggestion && onSuggestion(text));
        el.appendChild(b);
      });
    }
  }

  const controller = {
    /** Create the DOM row for a turn. Call once per turn, before upsertBlock. */
    startTurn(turn){
      ensureTurn(turn);
      (turn.blocks || []).forEach((b, i) => controller.upsertBlock(turn.id, i, b));
      controller.scrollToBottom();
    },
    /** Create-or-patch the block at `index` within turn `turnId`. Call this
     *  on every streaming delta, or once per block for a non-streaming
     *  response — same API either way. */
    upsertBlock(turnId, index, block){
      const rec = turns.get(turnId);
      if (!rec) return;
      let el = rec.blockEls.get(index);
      if (!el || el.dataset.blockType !== block.type){
        el = makeBlockEl(block);
        el.dataset.blockType = block.type;
        rec.blockEls.set(index, el);
        rec.bodyEl.appendChild(el);
      }
      syncBlockEl(el, block, index);
      controller.scrollToBottom();
    },
    /** Mark a turn's streaming state finished — clears any lingering
     *  caret/spinner state left on its blocks. */
    finishTurn(turnId){
      const rec = turns.get(turnId);
      if (!rec) return;
      rec.bodyEl.querySelectorAll('.asst-caret').forEach(el => el.classList.remove('asst-caret'));
      rec.bodyEl.querySelectorAll('[data-streaming="true"]').forEach(el => el.dataset.streaming = 'false');
    },
    /** Disable/enable the composer and show a stop-generating affordance. */
    setBusy(busy){
      sendBtn.disabled = busy;
      inputEl.disabled = busy;
    },
    scrollToBottom(){
      chatEl.scrollTop = chatEl.scrollHeight;
    },
    clear(){
      chatEl.innerHTML = '';
      turns.clear();
    },
    focus(){ inputEl.focus(); }
  };
  return controller;
}
