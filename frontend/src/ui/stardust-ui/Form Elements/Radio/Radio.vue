<template lang="pug">
label.st-radio(:class="{ 'st-radio--disabled': disabled }")
  input.st-radio__input(
    :id="inputId"
    type="radio"
    :checked="modelValue === value"
    :disabled="disabled"
    :name="name"
    :value="value"
    :aria-label="label || undefined"
    v-bind="$attrs"
    @change="onChange"
  )
  span.st-radio__control
    span.st-radio__dot
  span.st-radio__label(v-if="label || $slots.default")
    slot {{ label }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Radio.scss';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Bound value (v-model) */
    modelValue?: string | number | boolean;
    /** This radio's value */
    value?: string | number | boolean;
    /** Label shown next to the radio */
    label?: string;
    disabled?: boolean;
    name?: string;
  }>(),
  { value: true }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean];
}>();

const inputId = computed(() => `st-radio-${Math.random().toString(36).slice(2, 9)}`);

function onChange() {
  if (props.disabled) return;
  emit('update:modelValue', props.value);
}
</script>
