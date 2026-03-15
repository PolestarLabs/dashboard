<template lang="pug">
.st-input(
  :class="inputClasses"
)
  .st-input__control
    component(
      :is="tag"
      ref="inputRef"
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :name="name"
      :required="required"
      :aria-label="label || undefined"
      :aria-invalid="showError"
      :aria-describedby="showError ? errorId : undefined"
      v-bind="$attrs"
      @input="onInput"
      @blur="onBlur"
      @invalid="onInvalid"
    )
  label.st-input__label(v-if="label" :for="inputId")
    | {{ label }}
    span.st-input__required(v-if="required" aria-hidden="true") *
  span.st-input__error(v-if="showError" :id="errorId" role="alert") {{ error }}
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import './Input.scss';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Bound value (v-model) */
    modelValue?: string | number;
    /** Input type: text, number, email, password, etc. */
    type?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Label shown next to or above the input */
    label?: string;
    /** Use textarea instead of input when true */
    multiline?: boolean;
    /** Inline layout: label and input on same row */
    inline?: boolean;
    /** Size: sm matches Button sm (32px) for GlueContainer, md is default */
    size?: 'sm' | 'md';
    disabled?: boolean;
    name?: string;
    /** Show required indicator (*) and pass required to native input */
    required?: boolean;
    /** Error message shown when validation fails */
    error?: string;
  }>(),
  { type: 'text', inline: true, size: 'md' }
);

const inputClasses = computed(() => ({
  'st-input--inline': props.label && props.inline,
  'st-input--block': props.label && !props.inline,
  'st-input--error': showError.value,
  'st-input--sm': props.size === 'sm',
}));

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const inputId = computed(() => `st-input-${Math.random().toString(36).slice(2, 9)}`);
const errorId = computed(() => `${inputId.value}-error`);
const tag = computed(() => (props.multiline ? 'textarea' : 'input'));
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const shouldShowError = ref(false);

function checkValidity(): boolean {
  const el = inputRef.value;
  return el ? el.validity.valid : true;
}

const showError = computed(() => {
  if (!props.error) return false;
  if (!shouldShowError.value) return false;
  return !checkValidity();
});

function onInput(e: Event) {
  const el = e.target as HTMLInputElement | HTMLTextAreaElement;
  const val = el.type === 'number' && el.value !== '' ? Number(el.value) : el.value;
  emit('update:modelValue', val);
  if (checkValidity()) shouldShowError.value = false;
}

function onBlur() {
  if (!checkValidity()) shouldShowError.value = true;
}

function onInvalid(e: Event) {
  e.preventDefault();
  shouldShowError.value = true;
}

watch(
  () => props.error,
  async (err) => {
    if (!err) return;
    await nextTick();
    if (inputRef.value && !inputRef.value.validity.valid) {
      shouldShowError.value = true;
    }
  }
);
</script>
