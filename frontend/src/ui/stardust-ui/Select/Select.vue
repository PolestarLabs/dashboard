<template lang="pug">
.st-select(
  ref="rootRef"
  :class="rootClasses"
)
  label.st-select__label(v-if="label" :for="triggerId") {{ label }}
  button.st-select__trigger(
    type="button"
    :id="triggerId"
    :disabled="disabled"
    :aria-haspopup="'listbox'"
    :aria-expanded="open"
    :aria-label="triggerAriaLabel"
    @click.stop="toggle"
    @keydown.down.prevent="openAndFocusNext"
    @keydown.up.prevent="openAndFocusPrev"
    @keydown.enter.prevent="onEnter"
    @keydown.escape.prevent="close"
  )
    template(v-if="selectedOption")
      slot(name="selected-option" :option="selectedOption")
        span.st-select__name {{ selectedOption.label }}
    span.st-select__placeholder(v-else) {{ placeholder }}
    span.st-select__chevron(aria-hidden="true")
  ul.st-select__list(
    v-show="open"
    role="listbox"
    :aria-labelledby="triggerId"
    :style="{ maxHeight: listMaxHeight }"
    tabindex="-1"
  )
    li.st-select__option(
      v-for="(opt, idx) in options"
      :key="String(opt.value)"
      :ref="(el) => setOptionRef(el, idx)"
      role="option"
      :aria-selected="isSelected(opt)"
      :class="optionClasses(opt, idx)"
      @click="select(opt)"
      @mouseenter="focusedIndex = idx"
    )
      slot(name="option" :option="opt")
        span.st-select__name {{ opt.label }}
  .st-select__error(v-if="error" role="alert") {{ error }}
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import './Select.scss';

defineOptions({ inheritAttrs: false });

export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: unknown;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: SelectOption[];
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    /** solid = accent border always · ghost = muted border, accent on focus/open */
    variant?: 'solid' | 'ghost';
    size?: 'sm' | 'md';
    error?: string;
    listMaxHeight?: string;
    triggerAriaLabel?: string;
  }>(),
  {
    options: () => [],
    placeholder: 'Select...',
    variant: 'solid',
    size: 'md',
    listMaxHeight: '40vh',
    triggerAriaLabel: 'Select option',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const triggerId = computed(() => `st-select-${Math.random().toString(36).slice(2, 9)}`);
const rootRef = ref<HTMLElement | null>(null);
const open = ref(false);
const focusedIndex = ref(-1);

const rootClasses = computed(() => ({
  'st-select--open': open.value,
  'st-select--disabled': props.disabled,
  [`st-select--${props.variant}`]: true,
  [`st-select--${props.size}`]: true,
  'st-select--error': !!props.error,
}));

function isSelected(opt: SelectOption): boolean {
  return String(opt.value).toLowerCase() === String(props.modelValue ?? '').toLowerCase();
}

function optionClasses(opt: SelectOption, idx: number) {
  return {
    'st-select__option--selected': isSelected(opt),
    'st-select__option--focused': focusedIndex.value === idx,
  };
}

const selectedOption = computed(() =>
  props.options.find((opt) => isSelected(opt))
);

function setOptionRef(el: unknown, idx: number) {
  if (el && focusedIndex.value === idx) {
    nextTick(() => (el as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    const selIdx = props.options.findIndex((opt) => isSelected(opt));
    focusedIndex.value = selIdx >= 0 ? selIdx : 0;
  }
});

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function select(opt: SelectOption) {
  emit('update:modelValue', opt.value);
  open.value = false;
}

function openAndFocusNext() {
  if (!open.value) { open.value = true; return; }
  focusedIndex.value = Math.min(focusedIndex.value + 1, props.options.length - 1);
}

function openAndFocusPrev() {
  if (!open.value) { open.value = true; return; }
  focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
}

function onEnter() {
  if (!open.value) { open.value = true; return; }
  const opt = props.options[focusedIndex.value];
  if (opt) select(opt);
}

function onDocumentClick(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === 'Escape') {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeydown);
});
</script>
