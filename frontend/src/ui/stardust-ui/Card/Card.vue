<template lang="pug">
component.st-card(:is="as" :class="cardClasses" @pointerdown="spawnRipple")
  div.st-card__media(
    v-if="$slots.media"
    :class="{ 'st-card__media--aspect': mediaAspectRatio }"
  )
    slot(name="media")
  header.st-card__header(v-if="$slots.title")
    div.st-card__title
      SuperShadow(
        variant="slim"
        :style="{ color: 'var(--color-secondary)' }"
        :lineCol="'var(--bg-main)'"
      )
        slot(name="title")
  div.st-card__body
    slot
  footer.st-card__actions(v-if="$slots.buttons")
    slot(name="buttons")
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SuperShadow from '../SuperShadow/SuperShadow.vue';
import './Card.scss';

function spawnRipple(e: PointerEvent) {
  if (!props.clickable) return;
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const ripple = document.createElement('span');
  ripple.className = 'st-card__ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  card.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

const props = withDefaults(
  defineProps<{
    /** HTML element or component to render as (div, article, section, li…) */
    as?: string;
    border?: boolean;
    /** Card size: sm (compact), md (default), lg */
    size?: 'sm' | 'md' | 'lg';
    /** When true, media slot uses fixed aspect ratio (16/10); when false, natural height, anchored top center */
    mediaAspectRatio?: boolean;
    /** Adds hover lift, pointer cursor and focus-visible ring for interactive cards */
    clickable?: boolean;
    /** Removes body padding for full-bleed content (tables, images, code blocks) */
    flush?: boolean;
  }>(),
  { as: 'div', border: false, size: 'md', mediaAspectRatio: true, clickable: false, flush: false }
);

const cardClasses = computed(() => [
  props.size === 'sm' && 'st-card--sm',
  props.size === 'lg' && 'st-card--lg',
  { 'st-card--bordered': props.border },
  { 'st-card--clickable': props.clickable },
  { 'st-card--flush': props.flush },
]);
</script>
