<template>
  <div class="theme-swatch">
    <div
      ref="colorEl"
      class="theme-swatch__color"
      :style="{ background: `var(${varName})` }"
    />
    <div class="theme-swatch__label">
      <code>{{ varName }}</code>
      <span v-if="computedValue" class="theme-swatch__value">{{ computedValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  varName: string;
}>();

const colorEl = ref<HTMLElement | null>(null);
const computedValue = ref<string>('');

function resolveColor() {
  if (!colorEl.value) return;
  try {
    const bg = getComputedStyle(colorEl.value).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      computedValue.value = bg;
    } else {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(props.varName).trim();
      if (raw) computedValue.value = raw;
    }
  } catch {
    // ignore
  }
}

let observer: MutationObserver | null = null;

onMounted(() => {
  resolveColor();
  observer = new MutationObserver(resolveColor);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.theme-swatch {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.theme-swatch__color {
  height: 64px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-swatch__label {
  font-size: 0.75rem;
  color: var(--on-faint, #888);
}

.theme-swatch__label code {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.7rem;
}

.theme-swatch__value {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.65rem;
  opacity: 0.8;
}
</style>
