/**
 * assistant-panel/schema.js
 * ============================================================
 * The one data shape every renderer (vanilla or Vue) and every backend
 * adapter agrees on. Adding a new backend means writing a function that
 * returns this shape (see adapters/claude.js) — it never means touching
 * the renderer, its CSS, or its animations. That separation is the whole
 * point of this package: the UI is data-driven state, not backend-specific
 * markup, so it is genuinely the same file every time you plug in a new
 * project.
 *
 * These are JSDoc typedefs only — there is nothing to import at runtime.
 * They exist so editors give you autocomplete/checking on plain objects,
 * in both a vanilla-JS project and a Vue project (Vue's <script setup>
 * understands JSDoc typedefs the same way).
 * ============================================================
 *
 * @typedef {Object} Turn
 * @property {string} id
 * @property {'user'|'assistant'} role
 * @property {Block[]} blocks
 *
 * @typedef {TextBlock|ThinkingBlock|ToolCallBlock|ErrorBlock|SuggestionsBlock} Block
 *
 * @typedef {Object} TextBlock
 * @property {'text'} type
 * @property {string} text                 - plain text; the renderer escapes it
 * @property {boolean} [streaming]          - shows the blinking cursor while true
 * @property {Citation[]} [citations]
 *
 * @typedef {Object} Citation
 * @property {string} title
 * @property {string} [url]
 * @property {string} [snippet]             - the cited passage, shown on hover
 *
 * @typedef {Object} ThinkingBlock
 * @property {'thinking'} type
 * @property {string} text
 * @property {boolean} [streaming]
 * @property {string} [summary]             - short label shown collapsed, e.g. "Analysing 707 pipelines"
 *
 * @typedef {Object} ToolCallBlock
 * @property {'tool_call'} type
 * @property {string} id                    - matches the backend's tool_use id, for pairing a later result
 * @property {string} name
 * @property {Object} [input]
 * @property {'running'|'done'|'error'} status
 * @property {string} [durationLabel]       - e.g. "1.2s"; formatted by the caller, not the renderer
 * @property {string} [errorMessage]
 *
 * @typedef {Object} ErrorBlock
 * @property {'error'} type
 * @property {string} message
 * @property {boolean} [retryable]
 *
 * @typedef {Object} SuggestionsBlock
 * @property {'suggestions'} type
 * @property {string[]} items
 */
export {};
