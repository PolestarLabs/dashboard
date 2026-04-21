<template>
  <Teleport to="body" :disabled="mode === 'push'">
    <div class="s-offcanvas" :class="[rootClasses, { 's-offcanvas--visible': isOpen }]" @keydown.esc="onEsc">
      <Transition name="s-offcanvas-fade">
        <div
          v-if="overlay && modelValue"
          class="s-offcanvas__overlay"
          @click="onOverlayClick"
          aria-hidden="true"
        />
      </Transition>

      <!-- slide / reveal: Vue Transition drives enter/leave -->
      <Transition v-if="mode !== 'push'" :name="panelTransitionName" @after-leave="onPanelAfterLeave">
        <div
          v-if="modelValue"
          class="s-offcanvas__panel"
          ref="panelEl"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <button
            v-if="showClose"
            class="s-offcanvas__close"
            type="button"
            aria-label="Close"
            @click="close"
          >
            <i class="fas fa-times" />
          </button>
          <div class="s-offcanvas__body">
            <slot />
          </div>
        </div>
      </Transition>

      <!-- push: always in DOM, parked offscreen at translateX(100%).
           #app transform carries it into view — no panel animation. -->
      <div
        v-else
        class="s-offcanvas__panel"
        ref="panelEl"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :inert="!modelValue || undefined"
      >
        <button
          v-if="showClose"
          class="s-offcanvas__close"
          type="button"
          aria-label="Close"
          @click="close"
        >
          <i class="fas fa-times" />
        </button>
        <div class="s-offcanvas__body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import './Offcanvas.scss';

export interface OffcanvasProps {
  modelValue: boolean;
  mode?: 'slide' | 'reveal' | 'push';
  overlay?: boolean;
  flip?: boolean;
  showClose?: boolean;
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<OffcanvasProps>(), {
  mode: 'slide',
  overlay: true,
  flip: false,
  showClose: true,
  closeOnEsc: true,
  closeOnOverlay: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const panelEl = ref<HTMLElement | null>(null);
const pushContentEl = ref<HTMLElement | null>(null);
const isOpen = ref(props.modelValue);

onMounted(() => {
  pushContentEl.value = document.querySelector('#app') || document.body;
});

const rootClasses = computed(() => [
  `s-offcanvas--${props.mode}`,
  {
    's-offcanvas--flip': props.flip,
    's-offcanvas--overlay': props.overlay,
    's-offcanvas--push': props.mode === 'push',
  },
]);

const panelTransitionName = computed(() =>
  props.mode === 'reveal' ? 's-offcanvas-reveal' : 's-offcanvas-slide',
);

function onPanelAfterLeave() {
  if (!props.modelValue) {
    isOpen.value = false;
  }
}

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onEsc(e: KeyboardEvent) {
  if (props.closeOnEsc) {
    e.stopPropagation();
    close();
  }
}

function onOverlayClick() {
  if (props.closeOnOverlay) close();
}

let previouslyFocused: HTMLElement | null = null;

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      isOpen.value = true;
      previouslyFocused = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      if (props.mode === 'push' && pushContentEl.value) {
        const el = pushContentEl.value;
        el.style.transition = `transform var(--s-offcanvas-duration) var(--s-offcanvas-ease)`;
        void el.offsetHeight;
        el.style.transform = props.flip
          ? `translateX(var(--s-offcanvas-width))`
          : `translateX(calc(-1 * var(--s-offcanvas-width)))`;
      }

      await nextTick();
      panelEl.value?.focus();
    } else {
      document.body.style.overflow = '';
      previouslyFocused?.focus();
      previouslyFocused = null;

      if (props.mode === 'push' && pushContentEl.value) {
        const el = pushContentEl.value;
        el.style.transform = '';
        const onEnd = (e: TransitionEvent) => {
          if (e.propertyName !== 'transform') return;
          el.removeEventListener('transitionend', onEnd);
          el.style.transition = '';
          isOpen.value = false;
        };
        el.addEventListener('transitionend', onEnd);
      }

      await nextTick();
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  if (pushContentEl.value) {
    pushContentEl.value.style.transition = '';
    pushContentEl.value.style.transform = '';
  }
});
</script>
