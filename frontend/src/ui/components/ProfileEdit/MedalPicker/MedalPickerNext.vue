<template lang="pug">
GravityProvider
  .st-profile-medalpicker
    .st-profile-medalpicker__equipped
      .st-profile-medalpicker__section-header
        h3.st-profile-medalpicker__heading Equipped
        span.st-profile-medalpicker__count {{ equippedCount }}/{{ SLOT_COUNT }}
      .st-profile-medalpicker__grid
        GravitySlot(
          v-for="idx in SLOT_COUNT"
          :key="`slot-${idx}`"
          :slot-id="`slot-${idx}`"
          :item="equippedState[idx - 1]"
          onDropCollision="swap"
          @drop="onSlotDrop"
          v-slot="{ hovering, accepting }"
        )
          .st-profile-medalpicker__slot(:class="{ 'st-profile-medalpicker__slot--drop-target': hovering && accepting }")
            template(v-if="equippedState[idx - 1]")
              GravityDraggable(
                :draggable-id="`medal-${equippedState[idx - 1].medalId}`"
                :item="equippedState[idx - 1]"
                source-id="equipped"
                source-kind="custom"
                :source-index="idx - 1"
              )
                template(#default="{ dragging, isPreview }")
                  .st-profile-medalpicker__slot-medal(
                    :class="{ 'st-profile-medalpicker__dragging-source': dragging && !isPreview }"
                    :style="{ opacity: isPreview ? 1 : (dragging ? .9 : 1) }"
                  )
                    Medal(:medal="equippedState[idx - 1].id || equippedState[idx - 1].icon" :rarity="equippedState[idx - 1].rarity")
            template(v-else)
              .st-profile-medalpicker__slot-empty

    .st-profile-medalpicker__sidebar
      .st-profile-medalpicker__toolbar
        .st-profile-medalpicker__actions
          button.st-profile-medalpicker__action-btn(@click="randomFill" type="button")
            i.fas.fa-dice
            span Random
          button.st-profile-medalpicker__action-btn.st-profile-medalpicker__action-btn--danger(@click="reset" type="button")
            i.fas.fa-fire-alt
            span Reset
        .st-profile-medalpicker__filters
          button.st-profile-medalpicker__filter-btn(
            type="button"
            title="All"
            :class="{ 'st-profile-medalpicker__filter-btn--active': filterRarity === null && filterCategory === null }"
            @click="setFilter(null, null)"
          )
            Tooltip(star="top" :content="'Show all medals'")
              span.st-profile-medalpicker__tier-icon.st-profile-medalpicker__tier-icon--all All
          button.st-profile-medalpicker__filter-btn(
            type="button"
            title="Achievements"
            :class="{ 'st-profile-medalpicker__filter-btn--active': filterCategory === 'achievements' }"
            @click="setFilter(null, 'achievements')"
          )
            Tooltip(star="top" :content="'Show achievement medals'")
              span.st-profile-medalpicker__tier-icon.st-profile-medalpicker__tier-icon--achiev ⭐
          span.st-profile-medalpicker__filter-sep
          button.st-profile-medalpicker__filter-btn(
            v-for="r in rarityTiers"
            :key="r"
            type="button"
            :title="r"
            :class="{ 'st-profile-medalpicker__filter-btn--active': filterRarity === r }"
            @click="setFilter(r, null)"
          )
            RarityIcon(:v="r" :size="32")

      .st-profile-medalpicker__search
        i.fas.fa-search.st-profile-medalpicker__search-icon
        input.st-profile-medalpicker__search-input(
          v-model="searchQuery"
          type="text"
          placeholder="Search medals..."
        )
        MultiSelect.st-profile-medalpicker__tag-select(
          v-model="selectedTags"
          :options="tagOptionsSelect"
          placeholder="Filter tags..."
          :maxVisibleTags="1"
          listMaxHeight="18vh"
          triggerAriaLabel="Filter tags"
          :closeOnOutsideClick="true"
          :disabled="tagOptions.length === 0"
          size="sm"
        )

      .st-profile-medalpicker__section-header.st-profile-medalpicker__section-header--inventory
        span.st-profile-medalpicker__heading Inventory
        span.st-profile-medalpicker__count {{ visibleInventoryCount }}

      .st-profile-medalpicker__inventory
        GravityPool(
          pool-id="inventory"
          :items="filteredInventory"
          :item-key="medalItemKey"
          @reorder="onPoolReorder"
          @receive="onPoolReceive"
        )
          template(#item="{ item, index }")
            GravityDraggable(
              :draggable-id="`medal-inv-${item.medalId}`"
              :item="item"
              source-id="inventory"
              source-kind="pool"
              :source-index="index"
            )
              template(#default="{ dragging, isPreview }")
                .st-profile-medalpicker__chip(
                  :class="{ 'st-profile-medalpicker__dragging-source': dragging && !isPreview }"
                  :style="{ opacity: isPreview ? 1 : (dragging ? 0.9 : 1) }"
                )
                  Medal(:medal="item.icon || item.id" :rarity="item.rarity" position="bottom-right" size="sm")
          template(#empty)
            .st-profile-medalpicker__empty
              i.fas.fa-search
              span No medals match the current filters.
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  GravityProvider,
  GravityDraggable,
  GravityPool,
  GravitySlot,
  type GravityPoolReceiveEvent,
  type GravityPoolReorderEvent,
  type GravitySlotDropEvent,
} from 'gravity-dnd';
import Medal from '../../Medal/Medal.vue';
import RarityIcon from '../../RarityIcon/RarityIcon.vue';
import MultiSelect from '@/ui/stardust-ui/Select/MultiSelect.vue';
import Tooltip from '@/ui/stardust-ui/Tooltip/Tooltip.vue';
import './MedalPicker.scss';

export interface MedalItem {
  id?: string;
  icon?: string;
  name: string;
  rarity?: string;
  category?: string;
  tags?: string | string[];
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

interface MedalUi extends MedalItem {
  medalId: string;
}

function withUi(m: MedalItem): MedalUi {
  const id =  m.icon || m.id|| `unknown-${m.name}`;
  return { ...m, id, icon: m.icon || id, name: m.name || id, medalId: id };
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
    return {
      ...input,
      id: input.id || inferred,
      icon: input.icon || inferred,
      name: input.name || inferred,
      rarity: input.rarity || 'C',
      category: input.category || 'unknown',
    };
  }
  return { id: input, icon: input, name: input, rarity: 'C', category: 'unknown' };
}

const equippedState = ref<(MedalUi | null)[]>(Array.from({ length: SLOT_COUNT }, () => null));
const inventoryState = ref<MedalUi[]>([]);
const searchQuery = ref('');
const debouncedSearch = ref('');
let _searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (val) => {
  if (_searchDebounceTimer) clearTimeout(_searchDebounceTimer);
  _searchDebounceTimer = setTimeout(() => { debouncedSearch.value = val; }, 150);
});
const filterRarity = ref<string | null>(null);
const filterCategory = ref<string | null>(null);
const selectedTags = ref<string[]>([]);

const equippedCount = computed(() => equippedState.value.filter(Boolean).length);

const tagOptions = computed(() => {
  const tags = new Set<string>();
  const sourceMedals = [
    ...inventoryState.value,
    ...equippedState.value.filter((m): m is MedalUi => Boolean(m)),
  ];

  for (const m of sourceMedals) {
    const raw = m.tags;
    if (!raw) continue;
    const list = Array.isArray(raw) ? raw : `${raw}`.split(/\s+/);
    for (const t of list) {
      const clean = t.trim();
      if (clean) tags.add(clean);
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
});

const tagOptionsSelect = computed(() =>
  tagOptions.value.map((tag) => ({ value: tag, label: tag }))
);

function isVisible(m: MedalUi): boolean {
  if (debouncedSearch.value.trim()) {
    const q = debouncedSearch.value.trim().toLowerCase();
    if (!(m.name + ' ' + (m.category || '')).toLowerCase().includes(q)) return false;
  }
  if (filterRarity.value && m.rarity !== filterRarity.value) return false;
  if (filterCategory.value && (m.category || '').toLowerCase() !== filterCategory.value) return false;

  if (selectedTags.value.length > 0) {
    const raw = m.tags;
    const tags = Array.isArray(raw) ? raw : `${raw}`.split(/\s+/);
    const normalizedTagSet = new Set(tags.map((t) => t.trim().toLowerCase()));
    const selectedNormalized = selectedTags.value
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!s);
    if (selectedNormalized.length > 0 && !selectedNormalized.some((sel) => normalizedTagSet.has(sel))) {
      return false;
    }
  }
  return true;
}

const filteredInventory = computed(() => inventoryState.value.filter(isVisible));
const visibleInventoryCount = computed(() => filteredInventory.value.length);

// Cache medalId -> index mapping for O(1) lookups instead of O(n) searches
const inventoryIndexMap = computed(() => {
  const map = new Map<string, number>();
  inventoryState.value.forEach((m, idx) => map.set(m.medalId, idx));
  return map;
});

function findInventoryIndexByMedalId(medalId: string) {
  const index = inventoryIndexMap.value.get(medalId);
  return index !== undefined ? index : -1;
}

function getInventoryInsertIndexFromFilteredIndex(filteredIndex: number) {
  const visible = filteredInventory.value;
  if (filteredIndex >= visible.length) return inventoryState.value.length;
  const targetId = visible[filteredIndex].medalId;
  const targetIndex = findInventoryIndexByMedalId(targetId);
  return targetIndex === -1 ? inventoryState.value.length : targetIndex;
}

function setFilter(rarity: string | null, category: string | null) {
  filterRarity.value = rarity;
  filterCategory.value = category;
}

function medalItemKey(item: unknown) {
  return (item as MedalUi).medalId;
}

function dedupeById(list: MedalUi[]): MedalUi[] {
  const map = new Map<string, MedalUi>();
  for (const m of list) map.set(m.medalId, m);
  return [...map.values()];
}

function normalizeState() {
  const seen = new Set<string>();
  const normalizedEquipped = equippedState.value.map((m: MedalUi | null) => {
    if (!m || seen.has(m.medalId)) return null;
    seen.add(m.medalId);
    return m;
  });
  equippedState.value = Array.from({ length: SLOT_COUNT }, (_, i) => normalizedEquipped[i] ?? null);
  inventoryState.value = dedupeById(inventoryState.value.filter((m: MedalUi) => !seen.has(m.medalId)));
}

function emitState() {
  normalizeState();
  emit('update:equipped', equippedState.value.map((m: MedalUi | null) => (m ? stripUi(m) : null)));
  emit('update:inventory', inventoryState.value.map(stripUi));
}

function takeFromSource(sourceId: string, index: number): MedalUi | null {
  if (sourceId === 'equipped') {
    const medal = equippedState.value[index] || null;
    equippedState.value[index] = null;
    return medal;
  }
  if (sourceId === 'inventory') {
    const visible = filteredInventory.value;
    if (index < 0 || index >= visible.length) return null;
    const item = visible[index];
    const actualIndex = findInventoryIndexByMedalId(item.medalId);
    if (actualIndex === -1) return null;
    const [medal] = inventoryState.value.splice(actualIndex, 1);
    return medal || null;
  }
  return null;
}

function putIntoSource(sourceId: string, index: number, item: MedalUi) {
  if (sourceId === 'equipped') {
    equippedState.value[index] = item;
    return;
  }
  if (sourceId === 'inventory') {
    const insertIndex = getInventoryInsertIndexFromFilteredIndex(Math.min(index, filteredInventory.value.length));
    inventoryState.value.splice(insertIndex, 0, item);
  }
}

function onSlotDrop(event: GravitySlotDropEvent<unknown>) {
  const moved = takeFromSource(event.source.containerId, event.source.index);
  if (!moved) return;

  if (event.collision === 'reject') {
    putIntoSource(event.source.containerId, event.source.index, moved);
    return;
  }

  const slotIndex = Math.max(0, Number(event.slotId.replace(/^slot-/, '')) - 1);
  const existing = equippedState.value[slotIndex] || null;
  equippedState.value[slotIndex] = moved;

  if (event.collision === 'swap' && existing) {
    putIntoSource(event.source.containerId, event.source.index, existing);
  }

  emitState();
}

function onPoolReorder(event: GravityPoolReorderEvent<unknown>) {
  if (event.fromIndex === event.toIndex) return;
  const movedItem = filteredInventory.value[event.fromIndex];
  if (!movedItem) return;

  const actualFromIndex = findInventoryIndexByMedalId(movedItem.medalId);
  if (actualFromIndex === -1) return;

  const [moved] = inventoryState.value.splice(actualFromIndex, 1);
  if (!moved) return;

  // The drag library provides indexes relative to the filtered list; when moving downwards,
  // the index is based on the list before removal, so we adjust similarly to the previous logic.
  const targetFilteredIndex = event.fromIndex < event.toIndex ? event.toIndex - 1 : event.toIndex;
  const insertIndex = getInventoryInsertIndexFromFilteredIndex(targetFilteredIndex);

  inventoryState.value.splice(insertIndex, 0, moved);
  emitState();
}

function onPoolReceive(event: GravityPoolReceiveEvent<unknown>) {
  const moved = takeFromSource(event.source.containerId, event.source.index);
  if (!moved) return;

  const insertIndex = getInventoryInsertIndexFromFilteredIndex(event.insertIndex);
  inventoryState.value.splice(insertIndex, 0, moved);
  emitState();
}

function reset() {
  const all = dedupeById([
    ...inventoryState.value,
    ...equippedState.value.filter((m: MedalUi | null): m is MedalUi => Boolean(m)),
  ]);
  equippedState.value = Array.from({ length: SLOT_COUNT }, () => null);
  inventoryState.value = all;
  emitState();
}

function randomFill() {
  const allOwned = dedupeById([
    ...inventoryState.value,
    ...equippedState.value.filter((m: MedalUi | null): m is MedalUi => Boolean(m)),
  ]);
  const visiblePool = allOwned.filter(isVisible);
  const hiddenPool = allOwned.filter((m: MedalUi) => !isVisible(m));
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
  { immediate: true }
);
</script>
