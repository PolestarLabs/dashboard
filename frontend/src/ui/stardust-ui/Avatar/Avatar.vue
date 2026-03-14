<template lang="pug">
div.s-avatar(:class="shapeClass" :style="styleObject")
  img.s-avatar__img(:src="src" :alt="alt")
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Avatar.scss';

const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    size?: number; // px
    /** Shape: circle, rounded (rounded square), hexagon */
    shape?: 'circle' | 'rounded' | 'hexagon';
  }>(),
  {
    alt: 'Avatar',
    size: 150,
    shape: 'circle',
  },
);

const shapeClass = computed(() => `s-avatar--${props.shape}`);
const styleObject = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));
</script>

