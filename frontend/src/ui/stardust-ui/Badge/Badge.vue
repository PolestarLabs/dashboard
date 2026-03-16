<template lang="pug">
span.s-badge(
  :class="[`s-badge--${variant}`, { 's-badge--dot': dot }]"
  :aria-label="dot ? String(value) : undefined"
)
  template(v-if="!dot")
    slot {{ value }}
</template>

<script setup lang="ts">
import './Badge.scss';
const props = withDefaults(
  defineProps<{
    value?: string | number;
    /** Semantic color variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    /** Renders as a small indicator dot — no text, just a colored pip */
    dot?: boolean;
  }>(),
  { value: '', variant: 'default', dot: false },
);
</script>

