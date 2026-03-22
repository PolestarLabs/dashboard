<template lang="pug">
.st-multiselect(
  ref="rootRef"
  :class="[rootClasses, attrs.class]"
  :style="rootStyle"
  v-bind="attrs"
)
  label.st-multiselect__label(v-if="label" :for="triggerId") {{ label }}
  .st-multiselect__trigger-wrap(
    :class="{ 'st-multiselect__trigger-wrap--open': open }"
  )
    button.st-multiselect__trigger(
      type="button"
      :id="triggerId"
      :disabled="disabled"
      :aria-haspopup="'listbox'"
      :aria-expanded="open"
      :aria-label="triggerAriaLabel"
      @click.stop="toggle"
    )
      .st-multiselect__tags(v-if="selectedOptions.length")
        slot(name="tags" :options="selectedOptions" :remove="deselect")
          span.st-multiselect__tag(
            v-for="opt in visibleTags"
            :key="String(getOptionValue(opt))"
          )
            slot(name="tag" :option="opt" :remove="() => deselect(opt)")
              span.st-multiselect__tag-label {{ getOptionLabel(opt) }}
              span.st-multiselect__tag-remove(
                role="button"
                tabindex="-1"
                :aria-label="`Remove ${getOptionLabel(opt)}`"
                @click.stop="deselect(opt)"
              ) &times;
          span.st-multiselect__tag.st-multiselect__tag--overflow(v-if="overflowCount > 0")
            | +{{ overflowCount }}
      span.st-multiselect__placeholder(v-else) {{ placeholder }}
      span.st-multiselect__chevron(aria-hidden="true")

    .st-multiselect__search-wrap(v-if="open" @click.stop)
      input.st-multiselect__search(
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder"
        @click.stop
        @keydown.down.prevent="focusNextOption"
        @keydown.up.prevent="focusPrevOption"
        @keydown.enter.prevent="selectFocused"
        @keydown.escape.prevent="handleEscape"
        @keydown.backspace="onBackspace"
      )

  ul.st-multiselect__list(
    v-show="open"
    role="listbox"
    :aria-multiselectable="true"
    :aria-labelledby="triggerId"
    :style="{ maxHeight: listMaxHeight }"
    tabindex="-1"
  )
    li.st-multiselect__list-header(v-if="$slots['list-header']")
      slot(name="list-header")
    li.st-multiselect__option(
      v-for="(opt, idx) in filteredOptions"
      :key="String(getOptionValue(opt))"
      :ref="(el) => setFocusedRef(el, idx)"
      role="option"
      :aria-selected="isSelected(opt)"
      :class="getOptionClasses(opt, idx)"
      @click.stop="toggleOption(opt)"
      @mouseenter="focusedIndex = idx"
    )
      span.st-multiselect__check(:class="{ 'st-multiselect__check--active': isSelected(opt) }")
      slot(name="option" :option="opt" :selected="isSelected(opt)")
        span.st-multiselect__name {{ getOptionLabel(opt) }}
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, useAttrs } from 'vue';
import type { SelectOption } from './Select.vue';
import './MultiSelect.scss';

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

export type MultiSelectOption = SelectOption;

const props = withDefaults(
  defineProps<{
    modelValue?: (string | number)[];
    options?: SelectOption[];
    valueKey?: string;
    labelKey?: string;
    filter?: (opts: SelectOption[], query: string) => SelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    label?: string;
    disabled?: boolean;
    variant?: 'solid' | 'ghost';
    size?: 'sm' | 'md';
    listMaxHeight?: string;
    columnLayout?: boolean;
    columns?: number;
    closeOnOutsideClick?: boolean;
    triggerAriaLabel?: string;
    maxVisibleTags?: number;
    max?: number;
  }>(),
  {
    modelValue: () => [],
    options: () => [],
    valueKey: 'value',
    labelKey: 'label',
    placeholder: 'Select options...',
    searchPlaceholder: 'Type to search...',
    variant: 'ghost',
    size: 'md',
    listMaxHeight: '40vh',
    columnLayout: false,
    columns: undefined,
    closeOnOutsideClick: true,
    triggerAriaLabel: 'Multi-select options',
    maxVisibleTags: 5,
    max: 0,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]];
}>();

const triggerId = computed(() => `st-multiselect-${Math.random().toString(36).slice(2, 9)}`);
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
  'st-multiselect--open': open.value,
  'st-multiselect--disabled': props.disabled,
  [`st-multiselect--${props.variant}`]: true,
  [`st-multiselect--${props.size}`]: true,
  'st-multiselect--columns': hasColumnLayout.value,
  'st-multiselect--has-value': selectedOptions.value.length > 0,
}));
const rootStyle = computed(() => ({
  '--st-multiselect-columns': String(resolvedColumns.value),
}));

// --- Helpers ---
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

const currentValues = computed(() => props.modelValue ?? []);

function isSelected(opt: SelectOption): boolean {
  const val = String(getOptionValue(opt)).toLowerCase();
  return currentValues.value.some((v) => String(v).toLowerCase() === val);
}

function getOptionClasses(opt: SelectOption, idx: number) {
  return {
    'st-multiselect__option--selected': isSelected(opt),
    'st-multiselect__option--focused': focusedIndex.value === idx,
    'st-multiselect__option--disabled': !isSelected(opt) && props.max > 0 && currentValues.value.length >= props.max,
  };
}

// --- Filtering ---
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

// --- Selected / Tags ---
const selectedOptions = computed(() =>
  currentValues.value
    .map((v) => props.options.find((opt) => String(getOptionValue(opt)).toLowerCase() === String(v).toLowerCase()))
    .filter(Boolean) as SelectOption[]
);

const visibleTags = computed(() =>
  props.maxVisibleTags > 0
    ? selectedOptions.value.slice(0, props.maxVisibleTags)
    : selectedOptions.value
);

const overflowCount = computed(() =>
  props.maxVisibleTags > 0
    ? Math.max(0, selectedOptions.value.length - props.maxVisibleTags)
    : 0
);

// --- Focus management ---
function setFocusedRef(el: unknown, idx: number) {
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

// --- Actions ---
function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function toggleOption(opt: SelectOption) {
  const val = getOptionValue(opt);
  if (isSelected(opt)) {
    emit('update:modelValue', currentValues.value.filter((v) => String(v).toLowerCase() !== String(val).toLowerCase()));
  } else {
    if (props.max > 0 && currentValues.value.length >= props.max) return;
    emit('update:modelValue', [...currentValues.value, val]);
  }
}

function deselect(opt: SelectOption) {
  const val = getOptionValue(opt);
  emit('update:modelValue', currentValues.value.filter((v) => String(v).toLowerCase() !== String(val).toLowerCase()));
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
  if (opts[focusedIndex.value]) toggleOption(opts[focusedIndex.value]);
}

function handleEscape() {
  if (!props.closeOnOutsideClick) return;
  open.value = false;
}

function onBackspace() {
  if (searchQuery.value === '' && selectedOptions.value.length > 0) {
    const last = selectedOptions.value[selectedOptions.value.length - 1];
    deselect(last);
  }
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
