<template lang="pug">
span.s-icon(:class="sizeClass")
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Icon.scss';

const props = withDefaults(
  defineProps<{
    size?: 16 | 24 | 32 | 48 | 64;
  }>(),
  {
    size: 24,
  },
);

const sizeClass = computed(() => `s-icon--${props.size}`);
</script>

