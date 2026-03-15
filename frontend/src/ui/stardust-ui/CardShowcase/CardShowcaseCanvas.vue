<template lang="pug">
canvas(ref="canvasRef" :style="canvasStyle" aria-label="Card showcase canvas")
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps<{
  /** URL for the front/face image */
  faceImageUrl?: string;
  /** URL for the back image */
  backImageUrl?: string;
  /** Animation duration in milliseconds */
  durationMs?: number;
  /** Easing curve (cubic-bezier) for the flip animation */
  easing?: [number, number, number, number];
  /** Width of the canvas in pixels */
  width?: number;
  /** Height of the canvas in pixels */
  height?: number;
  /** Rotate the canvas around X axis (degrees) */
  rotateX?: number;
  /** Rotate the canvas around Y axis (degrees) */
  rotateY?: number;
  /** Rotate the canvas around Z axis (degrees) */
  rotateZ?: number;
  /** Border radius applied to the canvas */
  borderRadius?: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Adapted from https://github.com/gre/bezier-easing
const makeCubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveCurveX = (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const x2 = sampleCurveX(t) - x;
      if (Math.abs(x2) < 1e-6) return t;
      const d2 = sampleCurveDerivativeX(t);
      if (Math.abs(d2) < 1e-6) break;
      t -= x2 / d2;
    }

    // Fallback to bisection method if Newton-Raphson fails.
    let t0 = 0;
    let t1 = 1;
    t = x;
    while (t0 < t1) {
      const x2 = sampleCurveX(t);
      if (Math.abs(x2 - x) < 1e-6) return t;
      if (x > x2) t0 = t;
      else t1 = t;
      t = (t1 - t0) * 0.5 + t0;
    }

    return t;
  };

  return (t: number): number => {
    if (x1 === y1 && x2 === y2) return t; // linear
    return sampleCurveY(solveCurveX(t));
  };
};

const getEasing = () => {
  const [x1, y1, x2, y2] = props.easing ?? [0.68, -0.55, 0.27, 1.55];
  return makeCubicBezier(x1, y1, x2, y2);
};

const animationFrameId = ref<number | null>(null);

let faceImg: HTMLImageElement | null = null;
let backImg: HTMLImageElement | null = null;
let easingFn = (t: number) => t;

const canvasStyle = computed(() => ({
  width: `${props.width ?? 200}px`,
  height: `${props.height ?? 220}px`,
  display: 'block',
  transformStyle: 'preserve-3d',
  borderRadius: props.borderRadius != null ? `${props.borderRadius}px` : undefined,
}));


const loadImage = (url?: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const setupCanvasSize = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const w = props.width ?? 200;
  const h = props.height ?? 220;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const drawFrame = (timestamp: number) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (!faceImg || !backImg) {
    animationFrameId.value = requestAnimationFrame(drawFrame);
    return;
  }

  const duration = props.durationMs ?? 5000;
  const rawProgress = (timestamp % duration) / duration;

  // short hold
  const holdStart = 0.45;
  const holdEnd = 0.45;

  let angle: number;
  if (rawProgress < holdStart) {
    const p = rawProgress / holdStart;
    angle = easingFn(p) * Math.PI;
  } else if (rawProgress < holdEnd) {
    angle = Math.PI;
  } else {
    const p = (rawProgress - holdEnd) / (1 - holdEnd);
    angle = Math.PI + easingFn(p) * Math.PI;
  }

  const cos = Math.cos(angle);
  const showingBack = cos < 0;

  const img = showingBack ? backImg : faceImg;

  const targetW = w * 0.9;
  const targetH = h * 0.9;

  const radius = props.borderRadius ?? 0;

  // 3D rotation to the canvas element itself
  const angleDeg = (angle * 180) / Math.PI;
  const rotateX = props.rotateX ?? 0;
  const rotateY = props.rotateY ?? 0;
  const rotateZ = props.rotateZ ?? 0;

  canvas.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY + angleDeg}deg) rotateZ(${rotateZ}deg)`;

  ctx.save();
  ctx.translate(w / 2, h / 2);

  // Roundrect
  if (radius > 0) {
    const rw = targetW;
    const rh = targetH;
    const r = Math.min(radius, rw / 2, rh / 2);
    ctx.beginPath();
    ctx.moveTo(-rw / 2 + r, -rh / 2);
    ctx.lineTo(rw / 2 - r, -rh / 2);
    ctx.quadraticCurveTo(rw / 2, -rh / 2, rw / 2, -rh / 2 + r);
    ctx.lineTo(rw / 2, rh / 2 - r);
    ctx.quadraticCurveTo(rw / 2, rh / 2, rw / 2 - r, rh / 2);
    ctx.lineTo(-rw / 2 + r, rh / 2);
    ctx.quadraticCurveTo(-rw / 2, rh / 2, -rw / 2, rh / 2 - r);
    ctx.lineTo(-rw / 2, -rh / 2 + r);
    ctx.quadraticCurveTo(-rw / 2, -rh / 2, -rw / 2 + r, -rh / 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();

  animationFrameId.value = requestAnimationFrame(drawFrame);
};

const start = async () => {
  faceImg = await loadImage(props.faceImageUrl);
  backImg = await loadImage(props.backImageUrl);
  setupCanvasSize();
  easingFn = getEasing();

  if (animationFrameId.value !== null) {
    cancelAnimationFrame(animationFrameId.value);
  }
  animationFrameId.value = requestAnimationFrame(drawFrame);
};

const stop = () => {
  if (animationFrameId.value !== null) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
};

onMounted(() => {
  start();
});

onBeforeUnmount(() => {
  stop();
});

watch(
  () => [props.faceImageUrl, props.backImageUrl, props.width, props.height],
  () => {
    start();
  }
);
</script>

