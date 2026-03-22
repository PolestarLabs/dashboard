<template lang="pug">
.st-datepicker(
  ref="rootRef"
  :class="rootClasses"
)
  label.st-datepicker__label(v-if="label" :for="triggerId") {{ label }}
  button.st-datepicker__trigger(
    type="button"
    :id="triggerId"
    :disabled="disabled"
    :aria-haspopup="'dialog'"
    :aria-expanded="open"
    :aria-label="triggerAriaLabel"
    @click.stop="toggle"
    @keydown.escape.prevent="close"
  )
    span.st-datepicker__value(v-if="triggerLabel") {{ triggerLabel }}
    span.st-datepicker__placeholder(v-else) {{ placeholder }}
    span.st-datepicker__icon(aria-hidden="true")

  //- Calendar popup
  .st-datepicker__popup(
    v-if="open"
    role="dialog"
    aria-modal="true"
    :aria-label="popupAriaLabel"
  )
    //- Nav row
    .st-datepicker__nav
      button.st-datepicker__nav-btn(
        type="button"
        :aria-label="panel === 'year' ? 'Previous years' : 'Previous month'"
        @click.stop="panelBack"
      )
        i.fas.fa-chevron-left
      button.st-datepicker__nav-title(
        type="button"
        :aria-label="panel === 'month' ? 'Select year' : 'Back to month view'"
        @click.stop="toggleYearPanel"
      )
        | {{ navTitle }}
        i.st-datepicker__nav-caret.fas(:class="panel === 'year' ? 'fa-caret-up' : 'fa-caret-down'")
      button.st-datepicker__nav-btn(
        type="button"
        :aria-label="panel === 'year' ? 'Next years' : 'Next month'"
        @click.stop="panelForward"
      )
        i.fas.fa-chevron-right

    //- Month view
    template(v-if="panel === 'month'")
      .st-datepicker__weekdays
        span.st-datepicker__weekday(v-for="d in weekdays" :key="d") {{ d }}
      .st-datepicker__grid-wrap
        .st-datepicker__grid(
          :key="gridKey"
          :class="slideClass"
          @keydown="onGridKeydown"
        )
          button.st-datepicker__day(
            v-for="cell in calendarCells"
            :key="cell.key"
            type="button"
            :data-date="cell.iso"
            :disabled="cell.disabled"
            :tabindex="cell.iso === focusedDate ? 0 : -1"
            :class="dayClasses(cell)"
            :style="dayAnimationStyle(cell)"
            :ref="(el) => setDayRef(el, cell.iso)"
            :aria-label="cell.ariaLabel"
            :aria-selected="isSelected(cell) || undefined"
            :aria-current="cell.today ? 'date' : undefined"
            @click.stop="selectDate(cell)"
            @focus="focusedDate = cell.iso"
            @mouseover.stop="hoverDate = cell.iso"
            @mouseleave.stop="hoverDate = ''"
          ): span.st-dp-day {{ cell.day }}

    //- Year view
    .st-datepicker__year-grid(v-else-if="panel === 'year'")
      button.st-datepicker__year-cell(
        v-for="y in yearRange"
        :key="y"
        type="button"
        :class="{ 'st-datepicker__year-cell--active': y === viewYear }"
        @click.stop="selectYear(y)"
      ): span.st-dp-year {{ y }}

    //- Footer
    .st-datepicker__footer
      button.st-datepicker__today-btn(
        type="button"
        @click.stop="goToday"
      ) Today

  .st-datepicker__error(v-if="error" role="alert") {{ error }}
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import './DatePicker.scss';

defineOptions({ inheritAttrs: false });

// ── Props / Emits ──

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    /** Range end date (ISO YYYY-MM-DD). Used when mode="range". */
    endValue?: string;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    variant?: 'solid' | 'ghost';
    size?: 'sm' | 'md';
    error?: string;
    /** ISO date string (YYYY-MM-DD) — earliest selectable date */
    min?: string;
    /** ISO date string (YYYY-MM-DD) — latest selectable date */
    max?: string;
    /** 'single' (default) or 'range' — two-date range selection */
    mode?: 'single' | 'range';
    triggerAriaLabel?: string;
  }>(),
  {
    placeholder: 'Pick a date…',
    variant: 'solid',
    size: 'md',
    mode: 'single',
    triggerAriaLabel: 'Choose date',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:endValue': [value: string];
}>();

// ── Internal state ──

const triggerId = `st-dp-${Math.random().toString(36).slice(2, 9)}`;
const rootRef = ref<HTMLElement | null>(null);
const open = ref(false);

/** Which panel is visible: month grid or year grid */
const panel = ref<'month' | 'year'>('month');

/** Currently viewed month (0-indexed) and year */
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());

/** First year on the current year-picker page (12 per page) */
const yearPageStart = ref(Math.floor(new Date().getFullYear() / 12) * 12);

/** ISO string of the keyboard-focused day */
const focusedDate = ref('');

/** Direction for the slide animation: 1 = forward, -1 = back */
const slideDir = ref<1 | -1>(1);

/** Hovered date ISO string — drives range preview */
const hoverDate = ref('');

/** Internal optimistic state for range mode to avoid missed 2nd click when parent sync is delayed */
const rangeDraftStart = ref('');
const rangeDraftEnd = ref('');

function syncRangeDraftFromProps() {
  if (props.mode !== 'range') {
    rangeDraftStart.value = '';
    rangeDraftEnd.value = '';
    return;
  }

  // Only sync from props that are actually controlled by the parent.
  // This preserves internal range state across reopen when `endValue` isn't bound.
  if (props.modelValue !== undefined) {
    rangeDraftStart.value = props.modelValue;
  }

  if (props.endValue !== undefined) {
    rangeDraftEnd.value = props.endValue;
  }
}

// Track day element refs for focus management
const dayRefs = new Map<string, HTMLElement>();
function setDayRef(el: unknown, iso: string) {
  if (el instanceof HTMLElement) dayRefs.set(iso, el);
}

// ── Constants ──

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;
const weekdays = WEEKDAYS;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Derived ──

const monthYearLabel = computed(() =>
  `${MONTH_NAMES[viewMonth.value]} ${viewYear.value}`,
);

const navTitle = computed(() => {
  if (panel.value === 'year') {
    return `${yearPageStart.value} – ${yearPageStart.value + 11}`;
  }
  return `${MONTH_NAMES[viewMonth.value]} ${viewYear.value}`;
});

const popupAriaLabel = computed(() =>
  panel.value === 'year' ? 'Pick a year' : `Calendar — ${monthYearLabel.value}`,
);

const gridKey = computed(() => `${viewYear.value}-${viewMonth.value}`);

const slideClass = computed(() =>
  slideDir.value === 1 ? 'st-datepicker__grid--slide-left' : 'st-datepicker__grid--slide-right',
);

const rootClasses = computed(() => ({
  'st-datepicker--open': open.value,
  'st-datepicker--disabled': props.disabled,
  [`st-datepicker--${props.variant}`]: true,
  [`st-datepicker--${props.size}`]: true,
  'st-datepicker--error': !!props.error,
  'st-datepicker--range': props.mode === 'range',
}));

const effectiveRangeStart = computed(() => {
  if (props.mode !== 'range') return props.modelValue ?? '';
  return props.modelValue !== undefined ? props.modelValue : rangeDraftStart.value;
});

const effectiveRangeEnd = computed(() => {
  if (props.mode !== 'range') return '';
  return props.endValue !== undefined ? props.endValue : rangeDraftEnd.value;
});

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`;
}

/** Formatted trigger label — handles single and range modes */
const triggerLabel = computed(() => {
  if (props.mode === 'range') {
    const start = effectiveRangeStart.value;
    const end = effectiveRangeEnd.value;

    if (start && end) {
      const [s, e] =
        start <= end
          ? [start, end]
          : [end, start];
      return `${formatDate(s)} – ${formatDate(e)}`;
    }
    if (start) return `${formatDate(start)} – …`;
    return '';
  }
  return formatDate(props.modelValue ?? '');
});

/** 12 years per page for the year picker */
const yearRange = computed<number[]>(() =>
  Array.from({ length: 12 }, (_, i) => yearPageStart.value + i),
);

const todayISO = computed(() => toISO(new Date()));

// ── Calendar cell generation ──

interface CalendarCell {
  key: string;
  iso: string;
  day: number;
  outside: boolean;
  today: boolean;
  selected: boolean;
  disabled: boolean;
  ariaLabel: string;
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = viewYear.value;
  const month = viewMonth.value;

  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    cells.push(makeCell(new Date(year, month - 1, daysInPrev - i), true));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(makeCell(new Date(year, month, d), false));
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push(makeCell(new Date(year, month + 1, d), true));
  }

  return cells;
});

function makeCell(date: Date, outside: boolean): CalendarCell {
  const iso = toISO(date);
  const day = date.getDate();
  const today = iso === todayISO.value;
  const selected =
    props.mode === 'single'
      ? iso === props.modelValue
      : iso === effectiveRangeStart.value || iso === effectiveRangeEnd.value;
  const disabled = isDateDisabled(iso);
  const ariaLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return { key: iso, iso, day, outside, today, selected, disabled, ariaLabel };
}

function isSelected(cell: CalendarCell): boolean {
  if (props.mode === 'range') {
    return cell.iso === effectiveRangeStart.value || cell.iso === effectiveRangeEnd.value;
  }
  return cell.iso === props.modelValue;
}

function dayClasses(cell: CalendarCell) {
  const cls: Record<string, boolean> = {
    'st-datepicker__day--outside': cell.outside,
    'st-datepicker__day--today': cell.today,
    'st-datepicker__day--selected': cell.iso === props.modelValue && props.mode === 'single',
    'st-datepicker__day--disabled': cell.disabled,
  };

  if (props.mode === 'range') {
    const start = effectiveRangeStart.value;
    const end = effectiveRangeEnd.value;

    if (start && end) {
      const [s, e] = start <= end ? [start, end] : [end, start];
      cls['st-datepicker__day--range-start'] = cell.iso === s && !cell.outside;
      cls['st-datepicker__day--range-end'] = cell.iso === e && !cell.outside;
      cls['st-datepicker__day--in-range'] = cell.iso > s && cell.iso < e && !cell.outside;
    } else if (start && hoverDate.value && hoverDate.value !== start) {
      const [s, e] = start <= hoverDate.value ? [start, hoverDate.value] : [hoverDate.value, start];
      cls['st-datepicker__day--range-start'] = cell.iso === s && !cell.outside;
      cls['st-datepicker__day--range-end'] = cell.iso === e && !cell.outside;
      cls['st-datepicker__day--in-range-hover'] = cell.iso > s && cell.iso < e && !cell.outside;
    } else if (start) {
      cls['st-datepicker__day--range-start'] = cell.iso === start && !cell.outside;
    }
  }

  return cls;
}

function dayAnimationStyle(cell: CalendarCell): Record<string, string> {
  if (props.mode !== 'range' || cell.outside) return {};

  const start = effectiveRangeStart.value;
  const committedEnd = effectiveRangeEnd.value;
  const previewEnd = hoverDate.value;

  let s = '';
  let e = '';

  if (start && committedEnd) {
    [s, e] = start <= committedEnd ? [start, committedEnd] : [committedEnd, start];
  } else if (start && previewEnd && previewEnd !== start) {
    [s, e] = start <= previewEnd ? [start, previewEnd] : [previewEnd, start];
  } else {
    return {};
  }

  if (cell.iso < s || cell.iso > e) return {};

  const delayStepMs = 16;
  const offsetDays = Math.max(0, dayDiffISO(s, cell.iso));
  return {
    '--dp-range-delay': `${offsetDays * delayStepMs}ms`,
  };
}

// ── Helpers ──

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isDateDisabled(iso: string): boolean {
  if (props.min && iso < props.min) return true;
  if (props.max && iso > props.max) return true;
  return false;
}

function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

function dayDiffISO(fromISO: string, toISO: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const from = parseISO(fromISO).getTime();
  const to = parseISO(toISO).getTime();
  return Math.round((to - from) / msPerDay);
}

// ── Actions ──

function toggle() {
  if (props.disabled) return;
  if (open.value) close();
  else openCalendar();
}

function openCalendar() {
  syncRangeDraftFromProps();
  const anchor = props.mode === 'range'
    ? effectiveRangeEnd.value || effectiveRangeStart.value
    : props.modelValue ?? '';
  if (anchor) {
    const d = parseISO(anchor);
    viewYear.value = d.getFullYear();
    viewMonth.value = d.getMonth();
    focusedDate.value = anchor;
  } else {
    const now = new Date();
    viewYear.value = now.getFullYear();
    viewMonth.value = now.getMonth();
    focusedDate.value = todayISO.value;
  }
  yearPageStart.value = Math.floor(viewYear.value / 12) * 12;
  panel.value = 'month';
  open.value = true;
  nextTick(() => focusDayEl(focusedDate.value));
}

function close() {
  open.value = false;
  hoverDate.value = '';
}

function selectDate(cell: CalendarCell) {
  if (cell.disabled) return;

  if (props.mode === 'range') {
    const start = effectiveRangeStart.value;
    const end = effectiveRangeEnd.value;

    if (!start || (start && end)) {
      // No start or range complete → start fresh
      rangeDraftStart.value = cell.iso;
      rangeDraftEnd.value = '';
      emit('update:modelValue', cell.iso);
      emit('update:endValue', '');
    } else {
      // Start set, pick end
      if (cell.iso < start) {
        // Clicked before start → swap
        rangeDraftStart.value = cell.iso;
        rangeDraftEnd.value = start;
        emit('update:endValue', start);
        emit('update:modelValue', cell.iso);
      } else if (cell.iso === start) {
        // Clicked same day → clear range
        rangeDraftStart.value = '';
        rangeDraftEnd.value = '';
        emit('update:modelValue', '');
        emit('update:endValue', '');
      } else {
        rangeDraftEnd.value = cell.iso;
        emit('update:endValue', cell.iso);
      }
    }
  } else {
    emit('update:modelValue', cell.iso);
    // Calendar stays open — user closes manually
  }
}

function prevMonth() {
  slideDir.value = -1;
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
  clampFocusToView();
}

function nextMonth() {
  slideDir.value = 1;
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
  clampFocusToView();
}

function goToday() {
  const now = new Date();
  viewYear.value = now.getFullYear();
  viewMonth.value = now.getMonth();
  yearPageStart.value = Math.floor(now.getFullYear() / 12) * 12;
  panel.value = 'month';
  const iso = todayISO.value;
  focusedDate.value = iso;
  if (props.mode === 'single' && !isDateDisabled(iso)) {
    emit('update:modelValue', iso);
  }
  // Range mode: just navigate, don't auto-select
}

// ── Year panel ──

function toggleYearPanel() {
  if (panel.value === 'year') {
    panel.value = 'month';
  } else {
    yearPageStart.value = Math.floor(viewYear.value / 12) * 12;
    panel.value = 'year';
  }
}

function selectYear(y: number) {
  viewYear.value = y;
  yearPageStart.value = Math.floor(y / 12) * 12;
  panel.value = 'month';
  nextTick(() => focusDayEl(focusedDate.value || toISO(new Date(y, viewMonth.value, 1))));
}

function panelBack() {
  if (panel.value === 'year') {
    yearPageStart.value -= 12;
  } else {
    prevMonth();
  }
}

function panelForward() {
  if (panel.value === 'year') {
    yearPageStart.value += 12;
  } else {
    nextMonth();
  }
}

// ── Focus management ──

function focusDayEl(iso: string) {
  nextTick(() => dayRefs.get(iso)?.focus());
}

function clampFocusToView() {
  const iso = toISO(new Date(viewYear.value, viewMonth.value, 1));
  focusedDate.value = iso;
  nextTick(() => focusDayEl(iso));
}

function moveFocus(offset: number) {
  if (!focusedDate.value) return;
  const next = addDays(focusedDate.value, offset);
  const nextDate = parseISO(next);

  if (nextDate.getMonth() !== viewMonth.value || nextDate.getFullYear() !== viewYear.value) {
    slideDir.value = offset > 0 ? 1 : -1;
    viewYear.value = nextDate.getFullYear();
    viewMonth.value = nextDate.getMonth();
  }

  focusedDate.value = next;
  focusDayEl(next);
}

function onGridKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowRight': e.preventDefault(); moveFocus(1); break;
    case 'ArrowLeft':  e.preventDefault(); moveFocus(-1); break;
    case 'ArrowDown':  e.preventDefault(); moveFocus(7); break;
    case 'ArrowUp':    e.preventDefault(); moveFocus(-7); break;
    case 'Home':
      e.preventDefault();
      focusedDate.value = toISO(new Date(viewYear.value, viewMonth.value, 1));
      focusDayEl(focusedDate.value);
      break;
    case 'End': {
      e.preventDefault();
      const last = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
      focusedDate.value = toISO(new Date(viewYear.value, viewMonth.value, last));
      focusDayEl(focusedDate.value);
      break;
    }
    case 'PageDown': e.preventDefault(); nextMonth(); break;
    case 'PageUp':   e.preventDefault(); prevMonth(); break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (focusedDate.value && !isDateDisabled(focusedDate.value)) {
        const cell = calendarCells.value.find(c => c.iso === focusedDate.value);
        if (cell) selectDate(cell);
      }
      break;
    case 'Escape':
      e.preventDefault();
      close();
      break;
  }
}

// ── Outside click ──

function onDocumentClick(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) close();
}

// ── Lifecycle ──

watch(open, (isOpen) => {
  if (!isOpen) dayRefs.clear();
});

watch(
  [() => props.modelValue, () => props.endValue, () => props.mode],
  () => {
    // Keep drafts in sync whenever parent updates (or mode changes).
    // This preserves compatibility for controlled usage while still allowing optimistic range behavior.
    syncRangeDraftFromProps();
  },
  { immediate: true },
);

onMounted(() => document.addEventListener('click', onDocumentClick));
onUnmounted(() => document.removeEventListener('click', onDocumentClick));
</script>
