<template lang="pug">
.st-searchable-select(
  ref="rootRef"
  :class="rootClasses"
  :style="rootStyle"
)
  label.st-searchable-select__label(v-if="label" :for="triggerId") {{ label }}
  .st-searchable-select__trigger-wrap(
    :class="{ 'st-searchable-select__trigger-wrap--open': open }"
  )
    template(v-if="!open")
      button.st-searchable-select__trigger(
        type="button"
        :id="triggerId"
        :disabled="disabled"
        :aria-haspopup="'listbox'"
        :aria-expanded="open"
        :aria-label="triggerAriaLabel"
        @click.stop="toggle"
      )
        template(v-if="selectedOption")
          slot(name="selected-option" :option="selectedOption")
            span.st-searchable-select__name {{ getOptionLabel(selectedOption) }}
        span.st-searchable-select__placeholder(v-else) {{ placeholder }}
        span.st-searchable-select__chevron(aria-hidden="true")
    template(v-else)
      .st-searchable-select__trigger.st-searchable-select__trigger--search(@click.stop)
        input.st-searchable-select__search(
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          @click.stop
          @keydown.down.prevent="focusNextOption"
          @keydown.up.prevent="focusPrevOption"
          @keydown.enter.prevent="selectFocused"
          @keydown.escape.prevent="handleEscape"
        )
        span.st-searchable-select__chevron(aria-hidden="true")
  ul.st-searchable-select__list(
    v-show="open"
    role="listbox"
    :aria-labelledby="triggerId"
    :style="{ maxHeight: listMaxHeight }"
    tabindex="-1"
  )
    li.st-searchable-select__list-header(v-if="$slots['list-header']")
      slot(name="list-header")
    li.st-searchable-select__option(
      v-for="(opt, idx) in filteredOptions"
      :key="String(getOptionValue(opt))"
      :ref="(el) => setFocusedRef(el, opt, idx)"
      role="option"
      :aria-selected="isSelected(opt)"
      :class="getOptionClasses(opt, idx)"
      @click="select(opt)"
      @mouseenter="focusedIndex = idx"
    )
      slot(name="option" :option="opt")
        span.st-searchable-select__name {{ getOptionLabel(opt) }}
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { SelectOption } from './Select.vue';
import './SearchableSelect.scss';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: SelectOption[];
    valueKey?: string;
    labelKey?: string;
    filter?: (opts: SelectOption[], query: string) => SelectOption[];
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    variant?: 'solid' | 'ghost';
    size?: 'sm' | 'md';
    listMaxHeight?: string;
    columnLayout?: boolean;
    columns?: number;
    closeOnOutsideClick?: boolean;
    triggerAriaLabel?: string;
  }>(),
  {
    options: () => [],
    valueKey: 'value',
    labelKey: 'label',
    placeholder: 'Type to search...',
    variant: 'ghost',
    size: 'md',
    listMaxHeight: '40vh',
    columnLayout: false,
    columns: undefined,
    closeOnOutsideClick: true,
    triggerAriaLabel: 'Select option',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const triggerId = computed(() => `st-searchable-${Math.random().toString(36).slice(2, 9)}`);
const rootRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const open = ref(false);
const searchQuery = ref('');
const focusedIndex = ref(0);

const resolvedColumns = computed(() => {
  const raw = props.columns ?? (props.columnLayout ? 2 : 1);
  if (!Number.isFinite(raw)) return 1;
  return Math.max(1, Math.min(3, Math.floor(raw)));
});
const hasColumnLayout = computed(() => resolvedColumns.value > 1);

const rootClasses = computed(() => ({
  'st-searchable-select--open': open.value,
  'st-searchable-select--disabled': props.disabled,
  [`st-searchable-select--${props.variant}`]: true,
  [`st-searchable-select--${props.size}`]: true,
  'st-searchable-select--columns': hasColumnLayout.value,
}));
const rootStyle = computed(() => ({
  '--st-searchable-select-columns': String(resolvedColumns.value),
}));

function getOptionValue(opt: SelectOption): string | number {
  const k = props.valueKey;
  const raw = k && opt[k] !== undefined ? opt[k] : opt.value;
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  return '';
}
function getOptionLabel(opt: SelectOption): string {
  const k = props.labelKey;
  return (k && opt[k] !== undefined ? String(opt[k]) : opt.label) ?? '';
}

const currentValue = computed(() => props.modelValue);

function isSelected(opt: SelectOption): boolean {
  return String(getOptionValue(opt)).toLowerCase() === String(currentValue.value ?? '').toLowerCase();
}

function getOptionClasses(opt: SelectOption, idx: number) {
  return {
    'st-searchable-select__option--selected': isSelected(opt),
    'st-searchable-select__option--focused': focusedIndex.value === idx,
  };
}

const defaultFilter = (opts: SelectOption[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return opts;
  return opts.filter((o) =>
    [getOptionLabel(o), String(getOptionValue(o)), (o as Record<string, unknown>).tags, (o as Record<string, unknown>).rarity]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
};

const filteredOptions = computed(() => {
  const filterFn = props.filter || defaultFilter;
  return filterFn([...props.options], searchQuery.value);
});

const selectedOption = computed(() =>
  props.options.find((opt) => isSelected(opt))
);

function setFocusedRef(el: unknown, _opt: SelectOption, idx: number) {
  if (el && focusedIndex.value === idx) {
    (el as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    searchQuery.value = '';
    focusedIndex.value = 0;
    nextTick(() => searchInputRef.value?.focus());
  }
});

watch(focusedIndex, (idx) => {
  if (idx < 0) focusedIndex.value = 0;
  if (idx >= filteredOptions.value.length) focusedIndex.value = filteredOptions.value.length - 1;
});

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function select(opt: SelectOption) {
  emit('update:modelValue', getOptionValue(opt));
  open.value = false;
}

function focusNextOption() {
  focusedIndex.value++;
  if (focusedIndex.value >= filteredOptions.value.length) focusedIndex.value = filteredOptions.value.length - 1;
}

function focusPrevOption() {
  focusedIndex.value--;
  if (focusedIndex.value < 0) focusedIndex.value = 0;
}

function selectFocused() {
  const opts = filteredOptions.value;
  if (opts[focusedIndex.value]) select(opts[focusedIndex.value]);
}

function handleEscape() {
  if (!props.closeOnOutsideClick) return;
  open.value = false;
}

function onDocumentClick(e: MouseEvent) {
  if (!props.closeOnOutsideClick) return;
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === 'Escape') {
    if (!props.closeOnOutsideClick) return;
    open.value = false;
    (e.target as HTMLElement).blur();
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
