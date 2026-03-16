<template lang="pug">
span.st-spinner(
  :class="[`st-spinner--${size}`, `st-spinner--${variant}`]"
  role="status"
  :aria-label="label"
)
  span.st-spinner__ring
  span.sr-only {{ label }}
</template>

<script setup lang="ts">
import './Spinner.scss';

withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Color source — 'inherit' uses currentColor, presets map to theme tokens */
    variant?: 'inherit' | 'primary' | 'secondary' | 'white';
    label?: string;
  }>(),
  { size: 'md', variant: 'inherit', label: 'Loading…' },
);
</script>
