<template lang="pug">
div.st-accordion
  template(v-for="item in items" :key="item.key")
    .st-accordion__item(
      :class="{ 'st-accordion__item--disabled': item.disabled, 'st-accordion__item--open': isOpen(item.key) }"
    )
      h3.st-accordion__header(:id="`st-accordion-header-${uid}-${item.key}`")
        button.st-accordion__trigger(
          type="button"
          :aria-expanded="String(isOpen(item.key))"
          :aria-controls="`st-accordion-panel-${uid}-${item.key}`"
          :disabled="item.disabled"
          @click="toggle(item.key)"
        )
          span.st-accordion__title {{ item.title }}
          span.st-accordion__icon(aria-hidden="true")
      .st-accordion__panel(
        role="region"
        :id="`st-accordion-panel-${uid}-${item.key}`"
        :aria-labelledby="`st-accordion-header-${uid}-${item.key}`"
        :aria-hidden="String(!isOpen(item.key))"
      )
        .st-accordion__panel-inner
          slot(:name="item.key" :item="item")
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Accordion.scss';

export interface AccordionItem {
  key: string | number;
  title: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** Bound value (v-model) */
    modelValue?: string | number | Array<string | number> | null;
    /** List of accordion items */
    items: AccordionItem[];
    /** Allow multiple sections to be open */
    multiple?: boolean;
    /** Allow collapsing an open section by clicking it again */
    collapsible?: boolean;
  }>(),
  { multiple: false, collapsible: true },
);

const emit = defineEmits<{
  'update:modelValue': [string | number | Array<string | number> | null];
}>();

const uid = Math.random().toString(36).slice(2, 7);

const openKeys = computed< Array<string | number> >({
  get() {
    if (props.multiple) {
      if (Array.isArray(props.modelValue)) return props.modelValue;
      if (props.modelValue == null) return [];
      return [props.modelValue];
    }
    if (props.modelValue == null) return [];
    return [props.modelValue];
  },
  set(val) {
    if (props.multiple) {
      emit('update:modelValue', val);
    } else {
      emit('update:modelValue', val.length ? val[0] : null);
    }
  },
});

function isOpen(key: string | number) {
  return openKeys.value.includes(key);
}

function toggle(key: string | number) {
  const item = props.items.find((it) => it.key === key);
  if (item?.disabled) return;

  const currentlyOpen = isOpen(key);
  if (currentlyOpen) {
    if (!props.collapsible) return;
    openKeys.value = openKeys.value.filter((k) => k !== key);
    return;
  }

  if (props.multiple) {
    openKeys.value = [...openKeys.value, key];
  } else {
    openKeys.value = [key];
  }
}
</script>
