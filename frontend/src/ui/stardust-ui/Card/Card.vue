<template lang="pug">
div.st-card(:class="cardClasses")
  div.st-card__media(
    v-if="$slots.media"
    :class="{ 'st-card__media--aspect': mediaAspectRatio }"
  )
    slot(name="media")
  header.st-card__header(v-if="$slots.title")
    h2.st-card__title
      SuperShadow(
        variant="slim"
        :style="{ color: 'var(--secondary-color)' }"
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

const props = withDefaults(
  defineProps<{
    border?: boolean;
    /** Card size: sm (compact), md (default), lg */
    size?: 'sm' | 'md' | 'lg';
    /** When true, media slot uses fixed aspect ratio (16/10); when false, natural height, anchored top center */
    mediaAspectRatio?: boolean;
  }>(),
  { border: false, size: 'md', mediaAspectRatio: true }
);

const cardClasses = computed(() => [
  props.size === 'sm' && 'st-card--sm',
  props.size === 'lg' && 'st-card--lg',
  { 'st-card--bordered': props.border },
]);
</script>
