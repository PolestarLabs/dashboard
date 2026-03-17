<template lang="pug">
label.st-checkbox(:class="{ 'st-checkbox--disabled': disabled }")
  input.st-checkbox__input(
    :id="inputId"
    type="checkbox"
    :checked="modelValue"
    :disabled="disabled"
    :name="name"
    :aria-label="label || undefined"
    v-bind="$attrs"
    @change="onChange"
  )
  span.st-checkbox__control
    span.st-checkbox__check
      i.st-checkbox__icon.fas.fa-check(aria-hidden="true")
  span.st-checkbox__label(v-if="label || $slots.default")
    slot {{ label }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Checkbox.scss';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Bound value (v-model) */
    modelValue?: boolean;
    /** Label shown next to the checkbox */
    label?: string;
    disabled?: boolean;
    name?: string;
  }>(),
  { modelValue: false }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const inputId = computed(() => `st-checkbox-${Math.random().toString(36).slice(2, 9)}`);

function onChange(e: Event) {
  const el = e.target as HTMLInputElement;
  if (props.disabled) return;
  emit('update:modelValue', el.checked);
}
</script>
