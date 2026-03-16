<template lang="pug">
div.st-tooltip-wrapper(
  @mouseenter="show"
  @mouseleave="hide"
  @focusin="show"
  @focusout="hide"
)
  slot
  Teleport(to="body")
    transition(name="st-tooltip-fade")
      div.st-tooltip(
        v-if="visible && hasContent"
        ref="tooltipEl"
        role="tooltip"
        :id="ttId"
        :class="`st-tooltip--${placement}`"
        :style="style"
      )
        slot(name="tooltip")
          | {{ content }}
</template>

<script setup lang="ts">
import { ref, useSlots, computed, nextTick, onBeforeUnmount } from 'vue';
import './Tooltip.scss';

const props = withDefaults(
  defineProps<{
    /** Plain-text tooltip. Ignored when the #tooltip slot is provided. */
    content?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
  }>(),
  { placement: 'top', delay: 120 },
);

const slots = useSlots();
const hasContent = computed(() => !!slots.tooltip || !!props.content);

const visible = ref(false);
const style = ref<Record<string, string>>({});
const tooltipEl = ref<HTMLElement | null>(null);
const ttId = `tt-${Math.random().toString(36).slice(2, 7)}`;

let showTimer: ReturnType<typeof setTimeout> | null = null;

function show(e: MouseEvent | FocusEvent) {
  const target = e.currentTarget as HTMLElement;
  showTimer = setTimeout(async () => {
    visible.value = true;
    await nextTick();
    position(target);
  }, props.delay);
}

function hide() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null; }
  visible.value = false;
}

function position(wrapper: HTMLElement) {
  const el = tooltipEl.value;
  if (!el || !wrapper) return;

  const rect = wrapper.getBoundingClientRect();
  const ttRect = el.getBoundingClientRect();
  const GAP = 8;
  let top = 0;
  let left = 0;

  switch (props.placement) {
    case 'top':
      top  = rect.top  - ttRect.height - GAP + window.scrollY;
      left = rect.left + (rect.width - ttRect.width) / 2 + window.scrollX;
      break;
    case 'bottom':
      top  = rect.bottom + GAP + window.scrollY;
      left = rect.left + (rect.width - ttRect.width) / 2 + window.scrollX;
      break;
    case 'left':
      top  = rect.top + (rect.height - ttRect.height) / 2 + window.scrollY;
      left = rect.left - ttRect.width - GAP + window.scrollX;
      break;
    case 'right':
      top  = rect.top + (rect.height - ttRect.height) / 2 + window.scrollY;
      left = rect.right + GAP + window.scrollX;
      break;
  }

  style.value = { top: `${top}px`, left: `${left}px` };
}

onBeforeUnmount(hide);
</script>
