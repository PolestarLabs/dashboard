<template lang="pug">
.st-dropdown-select-plus(
  ref="rootRef"
  :class="{ 'st-dropdown-select-plus--open': open, 'st-dropdown-select-plus--disabled': disabled, 'st-dropdown-select-plus--large': size === 'large', 'st-dropdown-select-plus--light': lightBackground }"
)
  label.st-dropdown-select-plus__label(v-if="label" :for="triggerId") {{ label }}
  button.st-dropdown-select-plus__trigger(
    type="button"
    :id="triggerId"
    :disabled="disabled"
    :aria-haspopup="'listbox'"
    :aria-expanded="open"
    :aria-label="triggerAriaLabel"
    @click="toggle"
  )
    template(v-if="selectedOption")
      img.st-dropdown-select-plus__image(
        v-if="selectedOption.imageUrl"
        :src="selectedOption.imageUrl"
        :alt="''"
        :width="size === 'large' ? 50 : 32"
        :height="size === 'large' ? 42 : 24"
      )
      span.st-dropdown-select-plus__text
        span.st-dropdown-select-plus__name {{ selectedOption.label }}
        small.st-dropdown-select-plus__desc(v-if="selectedOption.description") {{ selectedOption.description }}
    span.st-dropdown-select-plus__placeholder(v-else) {{ placeholder }}
    span.st-dropdown-select-plus__chevron(aria-hidden="true")
  ul.st-dropdown-select-plus__list(
    v-show="open"
    role="listbox"
    :aria-labelledby="triggerId"
    :style="{ maxHeight: listMaxHeight }"
    tabindex="-1"
  )
    li.st-dropdown-select-plus__option(
      v-for="opt in options"
      :key="String(opt.value)"
      :ref="(el) => setSelectedOptionRef(el, opt)"
      role="option"
      :aria-selected="isSelected(opt)"
      :class="{ 'st-dropdown-select-plus__option--selected': isSelected(opt) }"
      @click="select(opt)"
    )
      img.st-dropdown-select-plus__image(
        v-if="opt.imageUrl"
        :src="opt.imageUrl"
        :alt="''"
        :width="size === 'large' ? 32 : 24"
        :height="size === 'large' ? 32 : 24"
      )
      span.st-dropdown-select-plus__text
        span.st-dropdown-select-plus__name {{ opt.label }}
        small.st-dropdown-select-plus__desc(v-if="opt.description") {{ opt.description }}
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import './DropdownSelectPlus.scss';

defineOptions({ inheritAttrs: false });

export interface DropdownSelectPlusOption {
  value: string | number;
  label: string;
  description?: string;
  /** URL for optional leading image (icon, flag, etc.) */
  imageUrl?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: DropdownSelectPlusOption[];
    placeholder?: string;
    label?: string;
    size?: 'default' | 'large';
    lightBackground?: boolean;
    disabled?: boolean;
    listMaxHeight?: string;
    /** Aria-label for the trigger button */
    triggerAriaLabel?: string;
  }>(),
  { options: () => [], placeholder: 'Choose...', size: 'default', listMaxHeight: '40vh', triggerAriaLabel: 'Select option' }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const triggerId = computed(() => `st-dropdown-plus-${Math.random().toString(36).slice(2, 9)}`);
const rootRef = ref<HTMLElement | null>(null);
const selectedOptionRef = ref<HTMLElement | null>(null);
const open = ref(false);

const currentValue = computed(() => props.modelValue);

function isSelected(opt: DropdownSelectPlusOption): boolean {
  return String(opt.value).toLowerCase() === String(currentValue.value ?? '').toLowerCase();
}

function setSelectedOptionRef(el: unknown, opt: DropdownSelectPlusOption): void {
  if (el && isSelected(opt)) {
    selectedOptionRef.value = el as HTMLElement;
  }
}

const selectedOption = computed(() =>
  props.options.find((opt) => isSelected(opt))
);

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

function select(opt: DropdownSelectPlusOption) {
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
