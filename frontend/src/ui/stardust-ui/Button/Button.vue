<template lang="pug">
button.s-btn(:class="classes" type="button" :disabled="disabled || undefined" :aria-disabled="disabled || undefined" @click="onClick")
  span.s-btn__ripple(ref="rippleRef" @animationend="onRippleEnd")
  span.s-btn__spinner(v-if="loading" aria-hidden="true")
  i.s-btn__icon(v-if="icon && !loading" :class="icon" :aria-hidden="true")
  span.s-btn__label(v-if="label") {{ label }}
  slot
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import './Button.scss';

const props = defineProps<{
  /** Semantic theme (sets color theme) */
  theme?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  /** Visual variant */
  variant?: 'solid' | 'ghost' | 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  /** Font Awesome icon class(es), e.g. "fas fa-check" or "far fa-star" */
  icon?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  iconposition?: 'left' | 'right';
}>();

const rippleRef = ref<HTMLElement | null>(null);
const isRippling = ref(false);

const computedTheme = computed(() => {
  const themeKeys = ['primary', 'secondary', 'danger', 'success', 'warning', 'info'] as const;

  if (props.theme) return props.theme;
  if (props.variant && themeKeys.includes(props.variant as any)) {
    return props.variant as (typeof themeKeys)[number];
  }
  return 'primary';
});

const computedVariant = computed(() => {
  if (props.variant === 'ghost' || props.variant === 'solid') return props.variant;
  return 'solid';
});

const classes = computed(() => {
  const base: string[] = [];
  const theme = computedTheme.value;
  const variant = computedVariant.value;
  const size = props.size ?? 'md';

  base.push(`s-btn--${theme}`);
  base.push(`s-btn--${variant}`);

  if (size === 'sm') base.push('s-btn--sm');
  if (size === 'lg') base.push('s-btn--lg');
  if (isRippling.value) base.push('s-btn--rippling');
  if (props.disabled || props.loading) base.push('s-btn--disabled');
  if (props.loading) base.push('s-btn--loading');
  if (props.iconposition === 'right') base.push('s-btn--icon-right');
  return base.join(' ');
});

function onClick(e: MouseEvent) {
  if (props.disabled || props.loading) return;
  isRippling.value = true;
}

function onRippleEnd() {
  isRippling.value = false;
}
</script>
