<script setup>
/**
 * assistant-panel/vue/AssistantPanel.vue
 * ============================================================
 * A thin Vue wrapper. It does not reimplement any markup, CSS, or
 * animation — it mounts the exact same controller from renderer.js
 * (the one used directly in the vanilla-JS demo) into a ref and
 * forwards prop/event changes to it. There is exactly one
 * implementation of the assistant tab's interactions; both stacks call it.
 *
 * Usage from a parent:
 *   <AssistantPanel ref="panel" :busy="busy"
 *     @send="onSend" @suggestion="onSend" @retry="onRetry" />
 *
 *   panel.value.startTurn({ id, role, blocks })   // once per turn
 *   panel.value.upsertBlock(turnId, index, block) // once per block, or per streaming delta
 *   panel.value.finishTurn(turnId)                // when the turn is complete
 *
 * See ../schema.js for the Turn/Block shapes and ../README.md for the
 * full wiring example, including what a coding agent needs to produce
 * from a prompt to drive this.
 * ============================================================ */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { mountAssistantPanel } from '../renderer.js';

const props = defineProps({
  busy: { type: Boolean, default: false }
});
const emit = defineEmits(['send', 'suggestion', 'retry']);

const hostEl = ref(null);
let controller = null;

onMounted(() => {
  controller = mountAssistantPanel(hostEl.value, {
    onSend: text => emit('send', text),
    onSuggestion: text => emit('suggestion', text),
    onRetry: blockId => emit('retry', blockId),
  });
  controller.setBusy(props.busy);
});
onBeforeUnmount(() => { controller = null; });
watch(() => props.busy, busy => controller && controller.setBusy(busy));

defineExpose({
  startTurn: turn => controller && controller.startTurn(turn),
  upsertBlock: (turnId, index, block) => controller && controller.upsertBlock(turnId, index, block),
  finishTurn: turnId => controller && controller.finishTurn(turnId),
  clear: () => controller && controller.clear(),
  focus: () => controller && controller.focus(),
});
</script>

<template>
  <div ref="hostEl" class="asst-panel-host" style="height:100%;min-height:0"></div>
</template>

<!--
  Load panel.css once, globally, in your app entry (not scoped per
  component) — it targets plain class names, not Vue's scoped-style
  hashes:
    import '<path-to>/assistant-panel/panel.css';
  and load your token stylesheet (tokens.css or equivalent) before it.
-->
