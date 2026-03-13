<template lang="pug">
span.s-rarity-icon(:class="[`s-rarity-icon--${variant}`, `s-rarity-icon--${size}`]")
</template>

<script setup lang="ts">
import './RarityIcon.scss';

const props = withDefaults(
  defineProps<{
    variant?: 'UR' | 'SR' | 'R' | 'U' | 'C' | 'XR';
    size?: 16 | 24 | 32 | 48 | 64;
  }>(),
  {
    variant: 'UR',
    size: 24,
  },
);
</script>

