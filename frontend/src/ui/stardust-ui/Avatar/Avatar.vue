<template lang="pug">
div.s-avatar(:class="rootClass" :style="sizeStyle")
  img.s-avatar__img(
    v-if="src && !imgError"
    :src="src"
    :alt="alt"
    @error="imgError = true"
  )
  span.s-avatar__initials(v-else aria-hidden="true") {{ resolvedInitials }}
  span.s-avatar__status(v-if="status" :class="`s-avatar__status--${status}`")
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import './Avatar.scss';

const PRESET_PX: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    /** Explicit pixel size — ignored when `preset` is set */
    size?: number;
    /** Semantic size preset (overrides `size`) */
    preset?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Shape: circle, rounded (rounded square), hexagon */
    shape?: 'circle' | 'rounded' | 'hexagon';
    /** Initials to show as fallback when src is absent or broken */
    initials?: string;
    /** Status indicator dot */
    status?: 'online' | 'idle' | 'dnd' | 'offline';
  }>(),
  { alt: '', size: 40, shape: 'circle' },
);

const imgError = ref(false);

const resolvedPx = computed(() =>
  props.preset ? PRESET_PX[props.preset] : props.size,
);

const rootClass = computed(() => [
  `s-avatar--${props.shape}`,
  props.preset ? `s-avatar--${props.preset}` : '',
]);

const sizeStyle = computed(() => ({
  width: `${resolvedPx.value}px`,
  height: `${resolvedPx.value}px`,
}));

// Derive initials from explicit prop → alt text → fallback '?'
const resolvedInitials = computed(() => {
  if (props.initials) return props.initials.slice(0, 2).toUpperCase();
  if (props.alt) {
    return props.alt
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return '?';
});
</script>

