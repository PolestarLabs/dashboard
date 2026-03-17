<template lang="pug">
.st-select-button(:class="[classes, { 'st-select-button--disabled': disabled }]" )
  label.st-select-button__label(v-if="label") {{ label }}
  .st-select-button__options
    button.st-select-button__option(
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      :class="{ 'st-select-button__option--selected': isSelected(opt) }"
      :disabled="disabled"
      @click="select(opt)"
    )
      span.st-select-button__option-label {{ opt.label }}
  span.st-select-button__error(v-if="error") {{ error }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './SelectButton.scss';

defineOptions({ inheritAttrs: false });

export interface SelectButtonOption {
  value: string | number;
  label: string;
}

const props = withDefaults(
  defineProps<{
    /** Bound value (v-model) */
    modelValue?: string | number;
    /** Options to render */
    options?: SelectButtonOption[];
    /** Label shown above the control */
    label?: string;
    /** Error message shown below the control */
    error?: string;
    /** Disable all options */
    disabled?: boolean;
    name?: string;
    /** Size variants, matching Input sizes */
    size?: 'sm' | 'md';
  }>(),
  { options: () => [], size: 'md' }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const classes = computed(() => ({
  'st-select-button--sm': props.size === 'sm',
}));

function isSelected(opt: SelectButtonOption) {
  return String(opt.value) === String(props.modelValue ?? '');
}

function select(opt: SelectButtonOption) {
  if (props.disabled) return;
  emit('update:modelValue', opt.value);
}
</script>
