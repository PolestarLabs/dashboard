<template lang="pug">
button(:class="classes" type="button")
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}>();

const classes = computed(() => {
  const base = ['btn'];
  const variant = props.variant ?? 'primary';
  const size = props.size ?? 'md';
  base.push(`btn-${variant}`);
  if (size === 'sm') base.push('btn-sm');
  if (size === 'lg') base.push('btn-lg');
  return base.join(' ');
});
</script>

