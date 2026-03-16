<template lang="pug">
div.st-progress(
  :class="[`st-progress--${size}`, `st-progress--${variant}`, { 'st-progress--indeterminate': indeterminate }]"
  role="progressbar"
  :aria-valuenow="indeterminate ? undefined : clampedValue"
  aria-valuemin="0"
  aria-valuemax="100"
  :aria-label="label"
)
  .st-progress__track
    .st-progress__fill(
      v-if="!indeterminate"
      :style="{ width: `${clampedValue}%` }"
    )
    .st-progress__indeterminate-bar(v-else)
  span.st-progress__label(v-if="showLabel && !indeterminate") {{ clampedValue }}%
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Progress.scss';

const props = withDefaults(
  defineProps<{
    value?: number;
    indeterminate?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'danger' | 'warning';
    label?: string;
    showLabel?: boolean;
  }>(),
  { value: 0, indeterminate: false, size: 'md', variant: 'default', showLabel: false },
);

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value ?? 0)));
</script>
