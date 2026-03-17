<template lang="pug">
.st-profile-colorpicker(
  :style="{ '--favcolor-dim': modelHex + '56', '--favcolor': modelHex }"
)
  .st-profile-colorpicker__bg-slot.st-profile-colorpicker__bg-slot--dim
  .st-profile-colorpicker__row
    .st-profile-colorpicker__info
      .st-profile-colorpicker__title {{ title }}
    .st-profile-colorpicker__name(v-if="showColorName") {{ colorName || '…' }}
  .st-profile-colorpicker__expandable(
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  )
    .st-profile-colorpicker__picker-wrap
      .st-profile-colorpicker__picker
        Transition(name="pop")
          .st-profile-colorpicker__chrome(v-show="isOpen")
            .st-profile-colorpicker__saturation-wrap(
              ref="satWrapRef"
              :style="saturationStyle"
              @mousedown="startSatDrag"
              @touchstart="startSatDrag"
            )
              .st-profile-colorpicker__saturation-pointer(
                :style="{ left: satPointerX + 'px', top: satPointerY + 'px' }"
              )
            .st-profile-colorpicker__hue-strip(
              ref="hueRef"
              @mousedown="startHueDrag"
              @touchstart="startHueDrag"
            )
              .st-profile-colorpicker__hue-pointer(:style="{ left: huePointerPercent + '%' }")
        .st-profile-colorpicker__swatch(
          :style="{ background: modelHex }"
          @click="isOpen = !isOpen"
        )
    .st-profile-colorpicker__suggestions(v-if="swatches.length")
      .st-profile-colorpicker__suggestions-title Color Suggestions
      .st-profile-colorpicker__swatches
        button.st-profile-colorpicker__swatch-btn(
          v-for="(c, i) in swatches"
          :key="i"
          type="button"
          :style="{ backgroundColor: typeof c === 'string' ? c : c.hex }"
          :title="typeof c === 'object' && c.name ? c.name : undefined"
          @click="pickSwatch(typeof c === 'string' ? c : c.hex)"
        )
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { hexToHsv, hsvToHex, normalizeHex } from './colorUtils';
import './ColorPicker.scss';

export interface SwatchOption {
  hex: string;
  name?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    title?: string;
    /** Preset colors: hex strings or { hex, name? } */
    swatches?: (string | SwatchOption)[];
    showColorName?: boolean;
    colorNameApiUrl?: string;
  }>(),
  { title: 'Accent Color', swatches: () => [], showColorName: true, colorNameApiUrl: 'https://www.thecolorapi.com/id?hex=' }
);

const emit = defineEmits<{
  'update:modelValue': [hex: string];
}>();

const modelHex = computed({
  get: () => normalizeHex(props.modelValue || '#000000'),
  set: (hex: string) => emit('update:modelValue', hex),
});

const isOpen = ref(false);
const colorName = ref('');
const hsv = ref(hexToHsv(normalizeHex(props.modelValue || '#000000')));
const satWrapRef = ref<HTMLElement | null>(null);
const hueRef = ref<HTMLElement | null>(null);

const saturationStyle = computed(() => {
  const { h } = hsv.value;
  const hueDeg = (h / 360) * 360;
  return {
    background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hueDeg}, 100%, 50%))`,
  };
});

const satPointerX = ref(0);
const satPointerY = ref(0);
const SIZE_SAT = 72;
function updateSatPointer() {
  const s = hsv.value.s;
  const v = hsv.value.v;
  satPointerX.value = s * SIZE_SAT;
  satPointerY.value = (1 - v) * SIZE_SAT;
}
const huePointerPercent = computed(() => (hsv.value.h / 360) * 100);

watch(
  () => props.modelValue,
  (hex) => {
    const norm = normalizeHex(hex || '#000000');
    hsv.value = hexToHsv(norm);
    updateSatPointer();
    if (props.showColorName) fetchColorName(norm);
  },
  { immediate: true }
);

watch(hsv, (newHsv) => {
  const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
  if (normalizeHex(hex) !== normalizeHex(modelHex.value)) modelHex.value = hex;
}, { deep: true });

function fetchColorName(hex: string) {
  const clean = hex.replace('#', '');
  fetch(props.colorNameApiUrl + clean)
    .then((r) => r.json())
    .then((data) => { colorName.value = data?.name?.value ?? ''; })
    .catch(() => { colorName.value = ''; });
}

function pickSwatch(hex: string) {
  const norm = normalizeHex(hex);
  modelHex.value = norm;
  hsv.value = hexToHsv(norm);
  updateSatPointer();
  if (props.showColorName) fetchColorName(norm);
}

let dragging: 'sat' | 'hue' | null = null;
function moveSat(clientX: number, clientY: number) {
  const el = satWrapRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  hsv.value = { ...hsv.value, s: x, v: 1 - y };
  updateSatPointer();
}
function moveHue(clientX: number) {
  const el = hueRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  hsv.value = { ...hsv.value, h: p * 360 };
}

function startSatDrag(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  dragging = 'sat';
  const isTouch = 'touches' in e;
  const x = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
  const y = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
  moveSat(x, y);
}
function startHueDrag(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  dragging = 'hue';
  const isTouch = 'touches' in e;
  const x = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
  moveHue(x);
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  const isTouch = 'touches' in e;
  const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
  const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
  if (dragging === 'sat') moveSat(clientX, clientY);
  else if (dragging === 'hue') moveHue(clientX);
}
function onPointerUp() {
  dragging = null;
}

onMounted(() => {
  updateSatPointer();
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);
});
onUnmounted(() => {
  window.removeEventListener('mousemove', onPointerMove);
  window.removeEventListener('mouseup', onPointerUp);
  window.removeEventListener('touchmove', onPointerMove);
  window.removeEventListener('touchend', onPointerUp);
});
</script>
