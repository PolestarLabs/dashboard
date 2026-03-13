<template lang="pug">
span.s-badge(:data-value="value")
  slot {{ value }}
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value?: string | number;
  }>(),
  {
    value: '',
  },
);
</script>

