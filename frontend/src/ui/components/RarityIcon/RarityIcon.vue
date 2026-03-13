<template lang="pug">
span.s-rarity-icon(:class="[`s-rarity-icon--${v}`, `s-rarity-icon--${size}`]")
</template>

<script setup lang="ts">
import './RarityIcon.scss';

const props = withDefaults(
  defineProps<{
    v?: 'UR' | 'SR' | 'R' | 'U' | 'C' | 'XR';
    size?: 16 | 24 | 32 | 48 | 64;
  }>(),
  {
    v: 'UR',
    size: 32,
  },
);
</script>

