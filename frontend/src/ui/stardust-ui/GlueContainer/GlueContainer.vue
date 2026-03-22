<template lang="pug">
div.s-glue-container-wrapper
  div.s-glue-container(:class="containerClasses" :style="containerStyle")
    SlotRenderer(:nodes="slotContent")
  div.s-glue-container__label(v-if="$slots.label")
    slot(name="label")
</template>

<script setup lang="ts">
import { computed, defineComponent, h, Fragment, useAttrs, useSlots } from 'vue';
import Badge from '../Badge/Badge.vue';
import './GlueContainer.scss';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const containerStyle = computed(() => attrs.style);

const slots = useSlots();

function getSlotNodes() {
  const defaultSlot = slots.default?.();
  if (!defaultSlot) return [];
  return Array.isArray(defaultSlot) ? defaultSlot : [defaultSlot];
}

function slotHasBadge(): boolean {
  return getSlotNodes().some((vnode: any) => vnode?.type === Badge);
}

function badgeCount(): number {
  return getSlotNodes().filter((vnode: any) => vnode?.type === Badge).length;
}

/** Auto-detected: badge when slot has a Badge, segments when 3+ children, else inline. */
const effectiveLayout = computed(() => {
  const nodes = getSlotNodes();
  if (slotHasBadge()) return 'badge';
  if (nodes.length >= 3) return 'segments';
  return 'inline';
});

/** 'single' = one badge (push to end of line), 'pairs' = several badges (couple each with the button before it), null = no badge layout */
const badgeModifier = computed(() => {
  if (effectiveLayout.value !== 'badge') return null;
  const n = badgeCount();
  if (n === 1) return 'single';
  if (n >= 2) return 'pairs';
  return null;
});

/** Wrap each (non-badge, badge) pair in .s-glue-container__pair. */
function processSlotForBadges(nodes: any[]) {
  const result: any[] = [];
  for (const node of nodes) {
    const isBadge = node?.type === Badge;
    if (isBadge && result.length > 0) {
      const last = result.pop();
      result.push(h('div', { class: 's-glue-container__pair' }, [last, node]));
    } else {
      result.push(node);
    }
  }
  return result;
}

/** Processed slot: raw nodes, or pairs when multiple badges. */
const slotContent = computed(() => {
  const nodes = getSlotNodes();
  if (badgeModifier.value !== 'pairs') return nodes;
  return processSlotForBadges(nodes);
});

const SlotRenderer = defineComponent({
  props: { nodes: { type: Array, default: () => [] } },
  render() {
    return h(Fragment, null, (this.nodes as any[]) || []);
  },
});

const containerClasses = computed(() => {
  const base = ['s-glue-container', `s-glue-container--${effectiveLayout.value}`];
  if (effectiveLayout.value === 'badge' && badgeModifier.value) {
    base.push(`s-glue-container--badge-${badgeModifier.value}`);
  }
  return base;
});
</script>
