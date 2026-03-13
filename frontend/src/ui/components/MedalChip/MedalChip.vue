<template lang="pug">
div.s-medal-chip
  div.s-medal-chip__rarity
    slot name="rarity"
  div.s-medal-chip__face(:style="faceStyle")
    slot
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  backgroundImage?: string; // URL for medal face background
}>();

const faceStyle = computed(() =>
  props.backgroundImage
    ? {
        backgroundImage: `url('${props.backgroundImage}')`,
      }
    : {},
);
</script>

