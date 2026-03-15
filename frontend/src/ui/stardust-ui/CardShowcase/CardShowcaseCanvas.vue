<template lang="pug">
.card-scene(:style="sceneStyle" aria-label="Card showcase")
  .card-inner(ref="innerRef" :style="innerStyle")
    canvas(ref="frontCanvasRef" :style="faceCanvasStyle" aria-label="Card front face")
    canvas(ref="backCanvasRef" :style="backCanvasStyle" aria-label="Card back face")
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
  /** Stretch the image to fill the canvas, ignoring aspect ratio */
  stretchToFit?: boolean;
}>();

const frontCanvasRef = ref<HTMLCanvasElement | null>(null);
const backCanvasRef = ref<HTMLCanvasElement | null>(null);
const innerRef = ref<HTMLElement | null>(null);

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

/** Gap between the card and the viewport edge on every side (px). */
const MARGIN = 16;

const viewportSize = ref({ width: props.width ?? 200, height: props.height ?? 200 });
const cardSize = ref({ width: 200, height: 280 });

/** Scene: viewport-sized container that provides the perspective frustum. */
const sceneStyle = computed(() => ({
  width: `${viewportSize.value.width}px`,
  height: `${viewportSize.value.height}px`,
  perspective: '600px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

/** Inner card: card-sized, rotates in 3D, hosts both face canvases. */
const innerStyle = computed(() => ({
  width: `${cardSize.value.width}px`,
  height: `${cardSize.value.height}px`,
  position: 'relative' as const,
  transformStyle: 'preserve-3d' as const,
}));

/** Shared style for both face canvases — stacked, backface hidden. */
const faceCanvasStyle = computed(() => ({
  position: 'absolute' as const,
  top: '0',
  left: '0',
  display: 'block',
  backfaceVisibility: 'hidden' as const,
}));

/** Back canvas is pre-rotated 180° so it faces the viewer when the card flips. */
const backCanvasStyle = computed(() => ({
  ...faceCanvasStyle.value,
  transform: 'rotateY(180deg)',
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

/** Draw an image onto a canvas face, applying cover/stretch and border-radius clip. */
const drawFace = (canvas: HTMLCanvasElement | null, img: HTMLImageElement | null) => {
  if (!canvas || !img) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const lw = canvas.width / dpr;
  const lh = canvas.height / dpr;

  ctx.clearRect(0, 0, lw, lh);
  ctx.save();

  const radius = props.borderRadius ?? 0;
  if (radius > 0) {
    const r = Math.min(radius, lw / 2, lh / 2);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(lw, 0, lw, lh, r);
    ctx.arcTo(lw, lh, 0, lh, r);
    ctx.arcTo(0, lh, 0, 0, r);
    ctx.arcTo(0, 0, lw, 0, r);
    ctx.closePath();
    ctx.clip();
  }

  let drawW: number;
  let drawH: number;
  if (props.stretchToFit) {
    drawW = lw;
    drawH = lh;
  } else {
    const s = Math.max(lw / img.width, lh / img.height);
    drawW = img.width * s;
    drawH = img.height * s;
  }

  ctx.drawImage(img, (lw - drawW) / 2, (lh - drawH) / 2, drawW, drawH);
  ctx.restore();
};

const setupCanvasSize = () => {
  const frontCanvas = frontCanvasRef.value;
  const backCanvas = backCanvasRef.value;
  if (!frontCanvas || !backCanvas) return;

  const dpr = window.devicePixelRatio || 1;

  // Card size is driven by the front face's natural dimensions.
  const frontW = faceImg?.naturalWidth ?? 200;
  const frontH = faceImg?.naturalHeight ?? 280;

  // Viewport: explicit props define it; omitted dimension falls back to the card's natural size.
  const vW = props.width ?? frontW;
  const vH = props.height ?? frontH;
  viewportSize.value = { width: vW, height: vH };

  // Scale card to fit within the viewport with MARGIN on every side.
  const maxCardW = vW - MARGIN * 2;
  const maxCardH = vH - MARGIN * 2;
  const cardScale = Math.min(1, maxCardW / frontW, maxCardH / frontH);
  const cW = frontW * cardScale;
  const cH = frontH * cardScale;
  cardSize.value = { width: cW, height: cH };

  for (const canvas of [frontCanvas, backCanvas]) {
    canvas.width = Math.round(cW * dpr);
    canvas.height = Math.round(cH * dpr);
    canvas.style.width = `${cW}px`;
    canvas.style.height = `${cH}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
};

/**
 * Animation loop: only updates the CSS 3D transform on the inner card element.
 * Both face canvases are drawn once on start; CSS backface-visibility handles visibility.
 */
const animate = (timestamp: number) => {
  const inner = innerRef.value;
  if (!inner) return;

  const duration = props.durationMs ?? 5000;
  const rawProgress = (timestamp % duration) / duration;

  const holdStart = 0.45;
  const holdEnd = 0.45;

  let angle: number;
  if (rawProgress < holdStart) {
    angle = easingFn(rawProgress / holdStart) * Math.PI;
  } else if (rawProgress < holdEnd) {
    angle = Math.PI;
  } else {
    angle = Math.PI + easingFn((rawProgress - holdEnd) / (1 - holdEnd)) * Math.PI;
  }

  const angleDeg = (angle * 180) / Math.PI;
  const rx = props.rotateX ?? 0;
  const ry = props.rotateY ?? 0;
  const rz = props.rotateZ ?? 0;

  inner.style.transform = `rotateX(${rx}deg) rotateY(${ry + angleDeg}deg) rotateZ(${rz}deg)`;

  animationFrameId.value = requestAnimationFrame(animate);
};

const start = async () => {
  [faceImg, backImg] = await Promise.all([
    loadImage(props.faceImageUrl),
    loadImage(props.backImageUrl),
  ]);

  setupCanvasSize();
  easingFn = getEasing();

  // Draw each face once; CSS handles which is visible during the flip.
  drawFace(frontCanvasRef.value, faceImg);
  drawFace(backCanvasRef.value, backImg);

  if (animationFrameId.value !== null) cancelAnimationFrame(animationFrameId.value);
  animationFrameId.value = requestAnimationFrame(animate);
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
  () => [props.faceImageUrl, props.backImageUrl, props.width, props.height, props.stretchToFit, props.borderRadius],
  () => {
    start();
  }
);
</script>

