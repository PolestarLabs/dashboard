<template lang="pug">
.st-select(
  :class="{ 'st-select--inline': label && inline, 'st-select--block': label && !inline, [`st-select--${size}`]: true, 'st-select--error': !!error }"
)
  .st-select__control
    select.st-select__native(
      :id="inputId"
      :value="modelValue"
      :disabled="disabled"
      :name="name"
      :aria-label="label || undefined"
      :aria-invalid="!!error || undefined"
      v-bind="$attrs"
      @change="onChange"
    )
      option(
        v-if="placeholder"
        value=""
        disabled
      ) {{ placeholder }}
      template(v-if="options?.length")
        option(
          v-for="opt in options"
          :key="String(opt.value)"
          :value="opt.value"
        ) {{ opt.label }}
      slot(v-else)
  label.st-select__label(v-if="label" :for="inputId") {{ label }}
  .st-select__error(v-if="error" role="alert") {{ error }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Select.scss';

defineOptions({ inheritAttrs: false });

export interface SelectOption {
  value: string | number;
  label: string;
}

const props = withDefaults(
  defineProps<{
    /** Bound value (v-model) */
    modelValue?: string | number;
    /** Options when using options prop (otherwise use default slot for option elements) */
    options?: SelectOption[];
    /** Placeholder / empty option label */
    placeholder?: string;
    /** Label shown next to or above the select */
    label?: string;
    inline?: boolean;
    disabled?: boolean;
    name?: string;
    /** Input size — matches Input component */
    size?: 'sm' | 'md';
    /** Error message — when set the control is styled in error state */
    error?: string;
  }>(),
  { inline: true, size: 'md' }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const inputId = computed(() => `st-select-${Math.random().toString(36).slice(2, 9)}`);

function onChange(e: Event) {
  const el = e.target as HTMLSelectElement;
  const val = el.value;
  const num = Number(val);
  emit('update:modelValue', val && !Number.isNaN(num) ? num : val);
}
</script>
