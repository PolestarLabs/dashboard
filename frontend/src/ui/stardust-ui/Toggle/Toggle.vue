<template lang="pug">
.st-toggle(
  :class="{ 'st-toggle--disabled': disabled }"
)
  input.st-toggle__input(
    :id="inputId"
    type="checkbox"
    :checked="modelValue"
    :disabled="disabled"
    :name="name"
    :aria-label="label || undefined"
    v-bind="$attrs"
    @change="onChange"
  )
  label.st-toggle__track(:for="inputId")
  span.st-toggle__label(v-if="label || $slots.default")
    slot {{ label }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Toggle.scss';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Bound value (v-model) */
    modelValue?: boolean;
    /** Label or description shown next to the toggle */
    label?: string;
    disabled?: boolean;
    name?: string;
  }>(),
  { modelValue: false }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const inputId = computed(() => `st-toggle-${Math.random().toString(36).slice(2, 9)}`);

function onChange(e: Event) {
  const el = e.target as HTMLInputElement;
  emit('update:modelValue', el.checked);
}
</script>
