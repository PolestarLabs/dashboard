<template lang="pug">
.st-profile-medalpicker(ref="rootEl" @dragstart.prevent)
  Teleport(to="body")
    .st-profile-medalpicker__drag-preview(
      v-if="dragState.medal"
      :style="dragPreviewStyle"
    )
      Medal(
        :medal="dragState.medal.id || dragState.medal.icon"
        :rarity="dragState.medal.rarity"
      )
  .st-profile-medalpicker__equipped
    h3.st-profile-medalpicker__heading Equipped
    .st-profile-medalpicker__eq-container
      .st-profile-medalpicker__slot-inner-wrap(
        v-for="idx in SLOT_COUNT"
        :key="'slot-' + idx"
        :class="slotClasses(idx - 1)"
        :data-drop-slot="idx - 1"
      )
        .st-profile-medalpicker__slot-inner(
          v-if="equippedState[idx - 1]"
          :class="{ 'st-profile-medalpicker__dragging-source': isDraggingThis('equipped', idx - 1) }"
          :data-drag-source="'equipped'"
          :data-drag-index="idx - 1"
          @pointerdown.prevent="onPointerDown('equipped', idx - 1, $event)"
        )
          Medal(
            :medal="equippedState[idx - 1]?.id || equippedState[idx - 1]?.icon"
            :rarity="equippedState[idx - 1]?.rarity"
          )
  .st-profile-medalpicker__filter
    .st-profile-medalpicker__controls
      .st-profile-medalpicker__panel
        button.st-profile-medalpicker__btn(@click="randomFill" type="button")
          i.fas.fa-dice
          span RANDOM
        button.st-profile-medalpicker__btn.st-profile-medalpicker__btn--danger(@click="reset" type="button")
          i.fas.fa-fire-alt
          span RESET
      .st-profile-medalpicker__tier
        button.st-profile-medalpicker__tier-btn(
          type="button"
          title="ALL"
          :class="{ 'st-profile-medalpicker__tier-btn--active': filterRarity === null && filterCategory === null }"
          @click="setFilter(null, null)"
        )
          span.st-profile-medalpicker__tier-icon.st-profile-medalpicker__tier-icon--all
        button.st-profile-medalpicker__tier-btn(
          type="button"
          title="Achievements"
          :class="{ 'st-profile-medalpicker__tier-btn--active': filterCategory === 'achievements' }"
          @click="setFilter(null, 'achievements')"
        )
          span.st-profile-medalpicker__tier-icon.st-profile-medalpicker__tier-icon--achiev
        span.st-profile-medalpicker__tier-sep |
        button.st-profile-medalpicker__tier-btn(
          v-for="r in rarityTiers"
          :key="r"
          type="button"
          :title="r"
          :class="{ 'st-profile-medalpicker__tier-btn--active': filterRarity === r }"
          @click="setFilter(r, null)"
        )
          RarityIcon(:v="r" :size="24")
    .st-profile-medalpicker__search
      input.st-profile-medalpicker__search-input(
        v-model="searchQuery"
        type="text"
        placeholder="Search medals..."
      )
    .st-profile-medalpicker__inventory
      .st-profile-medalpicker__inventory-list.st-profile-medalpicker__inventory-inner(
        :class="{ 'st-profile-medalpicker__inventory-list--active': dragState.hoverTarget === 'inventory' }"
        data-drop-inventory
      )
        .st-profile-medalpicker__chip(
          v-for="(element, idx) in inventoryState"
          :key="element.medalId"
          v-show="isVisible(element)"
          :class="{ 'st-profile-medalpicker__dragging-source': isDraggingThis('inventory', idx) }"
          :data-drag-source="'inventory'"
          :data-drag-index="idx"
          @pointerdown.prevent="onPointerDown('inventory', idx, $event)"
        )
          Medal(
            :medal="element.id || element.icon"
            :rarity="element.rarity"
          )
      .st-profile-medalpicker__empty(v-if="visibleInventoryCount === 0")
        | No medals found for current filters.
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import Medal from '../../Medal/Medal.vue';
import RarityIcon from '../../RarityIcon/RarityIcon.vue';
import './MedalPicker.scss';

export interface MedalItem {
  id?: string;
  icon?: string;
  name: string;
  rarity?: string;
  category?: string;
}

type MedalInput = MedalItem | string | null;

const props = withDefaults(
  defineProps<{
    equipped: MedalInput[];
    inventory: MedalInput[];
  }>(),
  { equipped: () => [], inventory: () => [] }
);

const emit = defineEmits<{
  'update:equipped': [value: (MedalItem | null)[]];
  'update:inventory': [value: MedalItem[]];
}>();

const SLOT_COUNT = 9;
const rarityTiers: Array<'C' | 'U' | 'R' | 'SR' | 'UR' | 'XR'> = ['C', 'U', 'R', 'SR', 'UR', 'XR'];

type MedalUi = MedalItem & { medalId: string };

function withUi(m: MedalItem): MedalUi {
  const id = m.id || m.icon || `unknown-${m.name}`;
  return { ...m, id, icon: m.icon || id, medalId: id };
}

function stripUi(m: MedalUi): MedalItem {
  const { medalId: _discard, ...rest } = m;
  return rest;
}

function normalizeMedal(input: MedalInput): MedalItem | null {
  if (!input) return null;
  if (typeof input === 'object') {
    const inferred = input.id || input.icon || '';
    if (!inferred) return null;
    return { ...input, id: input.id || inferred, icon: input.icon || inferred, name: input.name || inferred };
  }
  return { id: input, icon: input, name: input, rarity: 'C', category: 'unknown' };
}

// ── State ──
const equippedState = ref<(MedalUi | null)[]>(Array.from({ length: SLOT_COUNT }, () => null));
const inventoryState = ref<MedalUi[]>([]);
const searchQuery = ref('');
const filterRarity = ref<string | null>(null);
const filterCategory = ref<string | null>(null);
const rootEl = ref<HTMLElement | null>(null);

// ── Drag state (reactive object, not scattered refs) ──
const dragState = reactive({
  active: false,
  source: null as 'equipped' | 'inventory' | null,
  index: -1,
  medal: null as MedalUi | null,
  shiftX: 0,
  shiftY: 0,
  clientX: 0,
  clientY: 0,
  hoverTarget: null as 'slot' | 'inventory' | null,
  hoverSlotIndex: -1,
});

const dragPreviewStyle = computed(() => ({
  left: `${dragState.clientX - dragState.shiftX}px`,
  top: `${dragState.clientY - dragState.shiftY}px`,
}));

// ── Filters ──
function isVisible(m: MedalUi): boolean {
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    if (!(m.name + ' ' + (m.category || '')).toLowerCase().includes(q)) return false;
  }
  if (filterRarity.value && m.rarity !== filterRarity.value) return false;
  if (filterCategory.value && (m.category || '').toLowerCase() !== filterCategory.value) return false;
  return true;
}
const visibleInventoryCount = computed(() => inventoryState.value.filter(isVisible).length);

function setFilter(rarity: string | null, category: string | null) {
  filterRarity.value = rarity;
  filterCategory.value = category;
}

// ── Helpers ──
function dedupeById(list: MedalUi[]): MedalUi[] {
  const map = new Map<string, MedalUi>();
  for (const m of list) map.set(m.medalId, m);
  return [...map.values()];
}

function normalizeState() {
  const seen = new Set<string>();
  const normalizedEquipped = equippedState.value.map((m) => {
    if (!m || seen.has(m.medalId)) return null;
    seen.add(m.medalId);
    return m;
  });
  equippedState.value = Array.from({ length: SLOT_COUNT }, (_, i) => normalizedEquipped[i] ?? null);
  inventoryState.value = dedupeById(inventoryState.value.filter((m) => !seen.has(m.medalId)));
}

function emitState() {
  normalizeState();
  emit('update:equipped', equippedState.value.map((m) => (m ? stripUi(m) : null)));
  emit('update:inventory', inventoryState.value.map(stripUi));
}

// ── Template helpers ──
function isDraggingThis(source: string, index: number): boolean {
  return dragState.active && dragState.source === source && dragState.index === index;
}

function slotClasses(slotIndex: number) {
  return {
    'st-profile-medalpicker__slot-inner-wrap--active':
      dragState.active && dragState.hoverTarget === 'slot' && dragState.hoverSlotIndex === slotIndex,
  };
}

// ── Pointer-based drag system ──

function onPointerDown(source: 'equipped' | 'inventory', index: number, event: PointerEvent) {
  const medal = source === 'equipped' ? equippedState.value[index] : inventoryState.value[index];
  if (!medal) return;

  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();

  dragState.active = true;
  dragState.source = source;
  dragState.index = index;
  dragState.medal = medal;
  dragState.shiftX = event.clientX - rect.left;
  dragState.shiftY = event.clientY - rect.top;
  dragState.clientX = event.clientX;
  dragState.clientY = event.clientY;
  dragState.hoverTarget = null;
  dragState.hoverSlotIndex = -1;

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerUp);
}

function onPointerMove(event: PointerEvent) {
  if (!dragState.active) return;

  dragState.clientX = event.clientX;
  dragState.clientY = event.clientY;

  detectDropTarget(event.clientX, event.clientY);
}

function onPointerUp(_event: PointerEvent) {
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);
  document.removeEventListener('pointercancel', onPointerUp);

  if (!dragState.active || !dragState.medal || !dragState.source) {
    resetDragState();
    return;
  }

  if (dragState.hoverTarget === 'slot' && dragState.hoverSlotIndex >= 0) {
    performDropOnSlot(dragState.hoverSlotIndex);
  } else if (dragState.hoverTarget === 'inventory' && dragState.source === 'equipped') {
    performDropOnInventory();
  }

  resetDragState();
}

function detectDropTarget(clientX: number, clientY: number) {
  if (!rootEl.value) return;

  // check equipped slots
  const slots = Array.from(rootEl.value.querySelectorAll<HTMLElement>('[data-drop-slot]'));
  for (const slot of slots) {
    const rect = slot.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      dragState.hoverTarget = 'slot';
      dragState.hoverSlotIndex = Number(slot.dataset.dropSlot);
      return;
    }
  }

  // check inventory area
  const inv = rootEl.value.querySelector<HTMLElement>('[data-drop-inventory]');
  if (inv) {
    const rect = inv.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      dragState.hoverTarget = 'inventory';
      dragState.hoverSlotIndex = -1;
      return;
    }
  }

  dragState.hoverTarget = null;
  dragState.hoverSlotIndex = -1;
}

function performDropOnSlot(slotIndex: number) {
  const src = dragState.source!;
  const srcIdx = dragState.index;
  if (src === 'equipped' && srcIdx === slotIndex) return;

  const moved = takeFromSource(src, srcIdx);
  if (!moved) return;

  const existing = equippedState.value[slotIndex] || null;
  equippedState.value[slotIndex] = moved;

  if (existing) {
    if (src === 'equipped') {
      equippedState.value[srcIdx] = existing;
    } else {
      inventoryState.value.push(existing);
    }
  }
  emitState();
}

function performDropOnInventory() {
  const moved = takeFromSource('equipped', dragState.index);
  if (!moved) return;
  inventoryState.value.push(moved);
  emitState();
}

function takeFromSource(source: 'equipped' | 'inventory', index: number): MedalUi | null {
  if (source === 'equipped') {
    const medal = equippedState.value[index] || null;
    equippedState.value[index] = null;
    return medal;
  }
  if (index < 0 || index >= inventoryState.value.length) return null;
  const [medal] = inventoryState.value.splice(index, 1);
  return medal || null;
}

function resetDragState() {
  dragState.active = false;
  dragState.source = null;
  dragState.index = -1;
  dragState.medal = null;
  dragState.shiftX = 0;
  dragState.shiftY = 0;
  dragState.clientX = 0;
  dragState.clientY = 0;
  dragState.hoverTarget = null;
  dragState.hoverSlotIndex = -1;
}

onBeforeUnmount(() => {
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);
  document.removeEventListener('pointercancel', onPointerUp);
});

// ── Actions ──
function reset() {
  resetDragState();
  const all = dedupeById([
    ...inventoryState.value,
    ...equippedState.value.filter((m): m is MedalUi => Boolean(m)),
  ]);
  equippedState.value = Array.from({ length: SLOT_COUNT }, () => null);
  inventoryState.value = all;
  emitState();
}

function randomFill() {
  resetDragState();
  const allOwned = dedupeById([
    ...inventoryState.value,
    ...equippedState.value.filter((m): m is MedalUi => Boolean(m)),
  ]);
  const visiblePool = allOwned.filter(isVisible);
  const hiddenPool = allOwned.filter((m) => !isVisible(m));
  const pool = [...visiblePool];
  const next = Array.from({ length: SLOT_COUNT }, () => null as MedalUi | null);

  for (let i = 0; i < SLOT_COUNT; i++) {
    if (!pool.length) break;
    const idx = Math.floor(Math.random() * pool.length);
    next[i] = pool.splice(idx, 1)[0];
  }
  equippedState.value = next;
  inventoryState.value = dedupeById([...hiddenPool, ...pool]);
  emitState();
}

// ── Init from props ──
function initFromProps() {
  const equipped = Array.from({ length: SLOT_COUNT }, (_, i) =>
    normalizeMedal(props.equipped[i] ?? null)
  ).map((m) => (m ? withUi(m) : null));
  const equippedIds = new Set(equipped.filter(Boolean).map((m) => (m as MedalUi).medalId));
  const inventory = props.inventory
    .map(normalizeMedal)
    .filter((m): m is MedalItem => Boolean(m))
    .map(withUi)
    .filter((m) => !equippedIds.has(m.medalId));

  equippedState.value = equipped;
  inventoryState.value = dedupeById(inventory);
}

watch(
  () => [props.equipped, props.inventory] as const,
  initFromProps,
  { deep: true, immediate: true }
);
</script>
