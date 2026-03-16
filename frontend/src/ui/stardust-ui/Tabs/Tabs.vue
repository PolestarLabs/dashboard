<template lang="pug">
div.st-tabs
  div.st-tabs__list(role="tablist" :aria-label="label")
    button.st-tabs__tab(
      v-for="tab in tabs"
      :key="tab.key"
      role="tab"
      :id="`st-tab-${uid}-${tab.key}`"
      :aria-controls="`st-panel-${uid}-${tab.key}`"
      :aria-selected="modelValue === tab.key"
      :disabled="tab.disabled || undefined"
      :class="{ 'st-tabs__tab--active': modelValue === tab.key }"
      :tabindex="modelValue === tab.key ? 0 : -1"
      @click="select(tab.key)"
      @keydown="onKeydown($event, tab.key)"
    )
      span(v-if="tab.icon" :class="tab.icon" aria-hidden="true")
      | {{ tab.label }}

  div.st-tabs__panels
    template(v-for="tab in tabs" :key="tab.key")
      div.st-tabs__panel(
        role="tabpanel"
        :id="`st-panel-${uid}-${tab.key}`"
        :aria-labelledby="`st-tab-${uid}-${tab.key}`"
        v-show="modelValue === tab.key"
        :tabindex="0"
      )
        slot(:name="tab.key" :tab="tab")
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './Tabs.scss';

export interface TabItem {
  key: string | number;
  label: string;
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number;
    tabs: TabItem[];
    label?: string;
  }>(),
  { label: 'Navigation tabs' },
);

const emit = defineEmits<{ 'update:modelValue': [key: string | number] }>();

// Unique ID to avoid collision when multiple Tabs instances are on the same page
const uid = Math.random().toString(36).slice(2, 7);

const enabledKeys = computed(() => props.tabs.filter((t) => !t.disabled).map((t) => t.key));

function select(key: string | number) {
  if (key !== props.modelValue) emit('update:modelValue', key);
}

function onKeydown(e: KeyboardEvent, currentKey: string | number) {
  const idx = enabledKeys.value.indexOf(currentKey);
  if (idx === -1) return;

  let next: number | null = null;
  if (e.key === 'ArrowRight') next = (idx + 1) % enabledKeys.value.length;
  else if (e.key === 'ArrowLeft') next = (idx - 1 + enabledKeys.value.length) % enabledKeys.value.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = enabledKeys.value.length - 1;

  if (next !== null) {
    e.preventDefault();
    const nextKey = enabledKeys.value[next];
    select(nextKey);
    // Move DOM focus to the newly activated tab
    const el = document.getElementById(`st-tab-${uid}-${nextKey}`);
    el?.focus();
  }
}
</script>
