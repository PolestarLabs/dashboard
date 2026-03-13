<template lang="pug">
div.s-avatar(:style="styleObject")
  img.s-avatar__img(:src="src" :alt="alt")
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    size?: number; // px
  }>(),
  {
    alt: 'Avatar',
    size: 150,
  },
);

const styleObject = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));
</script>

