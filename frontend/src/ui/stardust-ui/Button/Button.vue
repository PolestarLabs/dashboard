<template lang="pug">
button(:class="classes" type="button" @click="onClick")
  span.btn__ripple(ref="rippleRef" @animationend="onRippleEnd")
  i.btn__icon(v-if="icon" :class="icon" :aria-hidden="true")
  span.btn__label(v-if="label") {{ label }}
  slot
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import './Button.scss';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Font Awesome icon class(es), e.g. "fas fa-check" or "far fa-star" */
  icon?: string;
  label?: string;
  disabled?: boolean;
  iconposition?: 'left' | 'right';
}>();

const rippleRef = ref<HTMLElement | null>(null);
const isRippling = ref(false);

const classes = computed(() => {
  const base = ['btn'];
  const variant = props.variant ?? 'primary';
  const size = props.size ?? 'md';
  base.push(`btn-${variant}`);
  if (size === 'sm') base.push('btn-sm');
  if (size === 'lg') base.push('btn-lg');
  if (isRippling.value) base.push('btn--rippling');
  if (props.disabled) base.push('btn-disabled');
  if (props.iconposition === 'right') base.push('btn-icon-right');
  return base.join(' ');
});

function onClick(e: MouseEvent) {
  if (props.disabled) return;
  isRippling.value = true;
}

function onRippleEnd() {
  isRippling.value = false;
}
</script>
