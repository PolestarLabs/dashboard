<template lang="pug">
div.s-avatar(:class="[rootClass,(status ? `s-avatar--${status}` : '')]" :style="sizeStyle")
  .s-avatar__img-wrapper
    img.s-avatar__img(
      v-if="src && !imgError"
      :src="src"
      :alt="alt"
      @error="imgError = true"
    )
    .s-avatar__img-wrapper(:style="bgStyle" v-else)
  i.s-avatar__status(
    v-if="status || customStatus"
    :class="customStatus ? [customStatus.iconClass, 's-avatar__status--custom'] : [statusIcon, `s-avatar__status--${status}`]"
    :style="customStatus ? { '--current-color': customStatus.color, fontSize: iconSizeStyle } : { fontSize: iconSizeStyle }"
    aria-hidden="true"
  )
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
    /** Fallback background color (CSS color) or CSS image value e.g. "url(...)" or "linear-gradient(...)" */
    bg?: string;
    /** Status indicator dot */
    status?: 'online' | 'idle' | 'dnd' | 'offline';
    customStatus?: {
      color: string;
      iconClass: string;
    };
    /** Show a colored border matching the status color */
    border?: boolean;
  }>(),
  { alt: '', size: 40, shape: 'circle', bg: '#6b7280' },
);

const imgError = ref(false);

const resolvedPx = computed(() =>
  props.preset ? PRESET_PX[props.preset] : props.size,
);

const rootClass = computed(() => [
  `s-avatar--${props.shape}`,
  props.preset ? `s-avatar--${props.preset}` : '',
]);

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  idle: '#f59e0b',
  dnd: '#ef4444',
  offline: '#6b7280',
};

const statusColor = computed(() => {
  if (props.customStatus) return props.customStatus.color;
  return props.status ? STATUS_COLORS[props.status] : null;
});

const PIP_POS: Record<string, { cx: string; cy: string }> = {
  circle:  { cx: '80%', cy: '80%' },
  rounded: { cx: '87%', cy: '87%' },
  hexagon: { cx: '85%', cy: '74%' },
};

const sizeStyle = computed(() => {
  const px = resolvedPx.value;
  const bw = Math.max(Math.round(px * 0.04), 2);
  const showBorder = props.border && !!statusColor.value;
  const pos = PIP_POS[props.shape ?? 'circle'];
  return {
    width: `${px}px`,
    height: `${px}px`,
    '--status-border-color': showBorder ? statusColor.value : 'transparent',
    '--status-border-width': showBorder ? `${bw}px` : '0px',
    '--pip-cx': pos.cx,
    '--pip-cy': pos.cy,
  };
});

const iconSizeStyle = computed(() => `${Math.min((resolvedPx.value || 1) / 4.8, 32)}px`);

const bgStyle = computed(() => {
  const v = props.bg ?? '#6b7280';
  const isImage = v.startsWith('url(') || v.startsWith('linear-gradient') || v.startsWith('radial-gradient');
  return isImage
    ? { backgroundImage: v, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: v };
});

const statusIcon = computed(() => {
  if (props.customStatus) {
    return props.customStatus.iconClass;
  }
  switch (props.status) {
    case 'online':
      return 'fas fa-circle';
    case 'idle':
      return 'fas fa-moon';
    case 'dnd':
      return 'fas fa-circle-minus';
    case 'offline':
      return 'fas fa-times-circle';
    default:
      return '';
  }
});
</script>

