<template lang="pug">
span.s-badge(:data-value="value")
  slot {{ value }}
</template>

<script setup lang="ts">
import './Badge.scss';
const props = withDefaults(
  defineProps<{
    value?: string | number;
  }>(),
  {
    value: '',
  },
);
</script>

