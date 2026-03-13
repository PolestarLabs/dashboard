<template lang="pug">
component(
  :is="tag"
  :class="classes"
  :href="tag === 'a' ? href : undefined"
  :disabled="tag === 'button' && disabled"
  @click="$emit('click', $event)"
)
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './RarityboxButton.scss';

export type RarityButtonVariant =
  | 'default'
  | 'sticker'
  | 'special'
  | 'craft'
  | 'advcraft'
  | 'event'
  | 'sapphires'
  | 'rubines'
  | 'search'
  | 'custom';

const props = withDefaults(
  defineProps<{
    tag?: 'button' | 'a';
    variant?: RarityButtonVariant;
    alt?: boolean;
    limitless?: boolean;
    disabled?: boolean;
    href?: string;
  }>(),
  { tag: 'button', variant: 'default', alt: false, limitless: false, disabled: false }
);

defineEmits<{ (e: 'click', ev: MouseEvent): void }>();

const classes = computed(() => {
  const list = ['s-rarity-btn'];
  if (props.variant && props.variant !== 'default') {
    list.push(`s-rarity-btn--${props.variant}`);
  }
  if (props.alt) list.push('s-rarity-btn--alt');
  if (props.limitless) list.push('s-rarity-btn--limitless');
  if (props.disabled) list.push('s-rarity-btn--disabled');
  return list.join(' ');
});
</script>
