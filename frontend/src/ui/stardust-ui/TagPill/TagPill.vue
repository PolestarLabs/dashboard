<template lang="pug">
span.s-tag-pill(:class="color ? `s-tag-pill--${color}` : ''")
  slot
</template>

<script setup lang="ts">
import './TagPill.scss';
const props = withDefaults(
  defineProps<{
    color?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  }>(),
  { color: 'default' },
);
</script>

