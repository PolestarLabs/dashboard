<template>
  <component
    :is="computedTag"
    :class="['plx-typography', `plx-typography--${variant}`]"
    v-bind="componentProps"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const variantTable = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  subtitle: 'h5',
  body: 'p',
  caption: 'span',
  small: 'small',
} as const;

const props = withDefaults(defineProps<{ 
    variant?: keyof typeof variantTable;
    align?: 'left' | 'center' | 'right' | 'justify';
    as?: string;
  }>(), {
  variant: 'body',
  align: 'left',
  as: '',
});

const computedTag = computed(() => {
  if (props.as) return props.as;
  return variantTable[props.variant] || 'p';
});

const componentProps = computed(() => ({
  style: {
    textAlign: props.align,
  },
}));
</script>

<style scoped lang="scss">
.plx-typography {
  color: var(--text-main, #f3f3ff);
  margin: 0;
  font-family: var(--main-font, system-ui, sans-serif);

  &--h1 {
    font-family: var(--display-font, 'Panton', system-ui, sans-serif);
    font-size: var(--type-scale-h1, 2.4rem);
    font-weight: 800;
    line-height: 1.15;
  }

  &--h2 {
    font-family: var(--display-font, 'Panton', system-ui, sans-serif);
    font-size: var(--type-scale-h2, 1.8rem);
    font-weight: 700;
    line-height: 1.2;
  }

  &--h3 {
    font-family: var(--strong-font, 'Proxima Soft', system-ui, sans-serif);
    font-size: var(--type-scale-h3, 1.4rem);
    font-weight: 600;
    line-height: 1.28;
  }

  &--h4 {
    font-family: var(--strong-font, 'Proxima Soft', system-ui, sans-serif);
    font-size: var(--type-scale-h4, 1.15rem);
    font-weight: 600;
    line-height: 1.35;
  }

  &--subtitle {
    font-size: var(--type-scale-subtitle, 1rem);
    font-weight: 600;
    color: var(--text-bold, var(--on-main--strong, #fff));
    line-height: 1.4;
  }

  &--body {
    font-size: var(--type-scale-body, 0.95rem);
    font-weight: 400;
    line-height: 1.6;
  }

  &--caption,
  &--small {
    font-size: var(--type-scale-caption, 0.82rem);
    color: var(--text-dim, var(--on-main--dim, #999));
    line-height: 1.4;
  }
}
</style>
