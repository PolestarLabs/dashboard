<template lang="pug">
.st-dropdown-select(
  ref="rootRef"
  :class="[rootClasses, attrs.class]"
  v-bind="attrs"
)
  label.st-dropdown-select__label(v-if="label" :for="triggerId") {{ label }}
  button.st-dropdown-select__trigger(
    type="button"
    :id="triggerId"
    :disabled="disabled"
    :aria-haspopup="'listbox'"
    :aria-expanded="open"
    :aria-label="triggerAriaLabel"
    @click="toggle"
  )
    template(v-if="selectedOption")
      img.st-dropdown-select__image(
        v-if="selectedOption.imageUrl"
        :src="selectedOption.imageUrl"
        :alt="''"
        :width="size === 'lg' ? 50 : 32"
        :height="size === 'lg' ? 42 : 24"
      )
      span.st-dropdown-select__text
        span.st-dropdown-select__name {{ selectedOption.label }}
        small.st-dropdown-select__desc(v-if="selectedOption.description") {{ selectedOption.description }}
    span.st-dropdown-select__placeholder(v-else) {{ placeholder }}
    span.st-dropdown-select__chevron(aria-hidden="true")
  ul.st-dropdown-select__list(
    v-show="open"
    role="listbox"
    :aria-labelledby="triggerId"
    :style="{ maxHeight: listMaxHeight }"
    tabindex="-1"
  )
    li.st-dropdown-select__option(
      v-for="opt in options"
      :key="String(opt.value)"
      :ref="(el) => setSelectedOptionRef(el, opt)"
      role="option"
      :aria-selected="isSelected(opt)"
      :class="{ 'st-dropdown-select__option--selected': isSelected(opt) }"
      @click="select(opt)"
    )
      img.st-dropdown-select__image(
        v-if="opt.imageUrl"
        :src="opt.imageUrl"
        :alt="''"
        :width="size === 'lg' ? 32 : 24"
        :height="size === 'lg' ? 32 : 24"
      )
      span.st-dropdown-select__text
        span.st-dropdown-select__name {{ opt.label }}
        small.st-dropdown-select__desc(v-if="opt.description") {{ opt.description }}
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, useAttrs } from 'vue';
import './DropdownSelect.scss';

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

export interface DropdownSelectOption {
  value: string | number;
  label: string;
  description?: string;
  imageUrl?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: DropdownSelectOption[];
    placeholder?: string;
    label?: string;
    variant?: 'solid' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    lightBackground?: boolean;
    disabled?: boolean;
    listMaxHeight?: string;
    triggerAriaLabel?: string;
  }>(),
  {
    options: () => [],
    placeholder: 'Choose...',
    variant: 'solid',
    size: 'md',
    listMaxHeight: '40vh',
    triggerAriaLabel: 'Select option',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const triggerId = computed(() => `st-dropdown-${Math.random().toString(36).slice(2, 9)}`);
const rootRef = ref<HTMLElement | null>(null);
const selectedOptionRef = ref<HTMLElement | null>(null);
const open = ref(false);

const currentValue = computed(() => props.modelValue);

function isSelected(opt: DropdownSelectOption): boolean {
  return String(opt.value).toLowerCase() === String(currentValue.value ?? '').toLowerCase();
}

function setSelectedOptionRef(el: unknown, opt: DropdownSelectOption): void {
  if (el && isSelected(opt)) {
    selectedOptionRef.value = el as HTMLElement;
  }
}

const selectedOption = computed(() =>
  props.options.find((opt) => isSelected(opt))
);

const rootClasses = computed(() => ({
  'st-dropdown-select--open': open.value,
  'st-dropdown-select--disabled': props.disabled,
  [`st-dropdown-select--${props.variant}`]: true,
  [`st-dropdown-select--${props.size}`]: true,
  'st-dropdown-select--light': props.lightBackground,
}));

watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      selectedOptionRef.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }
});

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function select(opt: DropdownSelectOption) {
  emit('update:modelValue', opt.value);
  open.value = false;
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
