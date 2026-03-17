<template lang="pug">
.st-profile-medalpicker
  #equipped.st-profile-medalpicker__equipped
    h3.st-profile-medalpicker__heading Equipped
    .st-profile-medalpicker__eq-container
      draggable.st-profile-medalpicker__slot-inner-wrap(
        v-for="(slotList, idx) in slotLists"
        :key="'slot-' + idx"
        v-model="slotLists[idx]"
        item-key="medalId"
        group="medals"
        @change="syncEquippedFromSlots"
      )
        template(#item="{ element }")
          .st-profile-medalpicker__slot-inner
            Medal(:medal="element.icon || element.id" :rarity="element.rarity")
  #plx-filter.st-profile-medalpicker__filter
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
    #inventory.st-profile-medalpicker__inventory
      draggable.st-profile-medalpicker__inventory-list(
        v-model="innerInventory"
        item-key="medalId"
        group="medals"
        @change="emitInventory"
        class="st-profile-medalpicker__inventory-inner"
      )
        template(#item="{ element }")
          .st-profile-medalpicker__chip(v-show="isVisible(element)")
            Medal(
              :medal="element.icon || element.id"
              :rarity="element.rarity"
            )
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
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
    medalCatalog?: MedalItem[];
  }>(),
  { equipped: () => [], inventory: () => [], medalCatalog: () => [] }
);

const emit = defineEmits<{
  'update:equipped': [value: (MedalItem | null)[]];
  'update:inventory': [value: MedalItem[]];
}>();

const SLOT_COUNT = 9;
const rarityTiers: Array<'C' | 'U' | 'R' | 'SR' | 'UR' | 'XR'> = ['C', 'U', 'R', 'SR', 'UR', 'XR'];

type MedalUi = MedalItem & { medalId: string };

function withUi(m: MedalItem): MedalUi {
  return {
    ...m,
    medalId: `${m.icon || m.id || 'medal'}-${m.name}`,
  };
}

function stripUi(m: MedalUi): MedalItem {
  const { medalId: _discard, ...rest } = m;
  return rest;
}

function normalizeMedal(input: MedalInput): MedalItem | null {
  if (!input) return null;
  if (typeof input === 'object') {
    if (!input.name) {
      const inferred = input.icon || input.id || '';
      return inferred ? { ...input, name: inferred } : null;
    }
    return input;
  }
  const id = input;
  const fromCatalog = props.medalCatalog.find((m) => (m.icon || m.id) === id);
  if (fromCatalog) return fromCatalog;
  const fromInventory = props.inventory.find(
    (m) => m && typeof m === 'object' && (m.icon || m.id) === id
  ) as MedalItem | undefined;
  if (fromInventory) return fromInventory;
  return { id, icon: id, name: id, rarity: 'C', category: 'unknown' };
}

const innerEquipped = ref<(MedalUi | null)[]>([]);
const innerInventory = ref<MedalUi[]>([]);
const slotLists = ref<MedalUi[][]>(Array.from({ length: SLOT_COUNT }, () => []));

const searchQuery = ref('');
const filterRarity = ref<string | null>(null);
const filterCategory = ref<string | null>(null);

function isVisible(m: MedalUi): boolean {
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    if (!(m.name + ' ' + (m.category || '')).toLowerCase().includes(q)) return false;
  }
  if (filterRarity.value && m.rarity !== filterRarity.value) return false;
  if (filterCategory.value && (m.category || '').toLowerCase() !== filterCategory.value) return false;
  return true;
}

function setFilter(rarity: string | null, category: string | null) {
  filterRarity.value = rarity;
  filterCategory.value = category;
}

function emitEquipped() {
  emit('update:equipped', innerEquipped.value.map((m) => (m ? stripUi(m) : null)));
}

function emitInventory() {
  emit('update:inventory', innerInventory.value.map(stripUi));
}

function syncEquippedFromSlots() {
  const overflow: MedalUi[] = [];
  slotLists.value = slotLists.value.map((list) => {
    if (list.length <= 1) return list;
    overflow.push(...list.slice(1));
    return [list[0]];
  });
  if (overflow.length) {
    innerInventory.value = dedupeById([...innerInventory.value, ...overflow]);
    emitInventory();
  }
  innerEquipped.value = slotLists.value.map((list) => list[0] ?? null);
  emitEquipped();
}

function reset() {
  const all = [...innerInventory.value, ...(innerEquipped.value.filter(Boolean) as MedalUi[])];
  innerInventory.value = dedupeById(all);
  innerEquipped.value = Array.from({ length: SLOT_COUNT }, () => null);
  slotLists.value = Array.from({ length: SLOT_COUNT }, () => []);
  emitEquipped();
  emitInventory();
}

function randomFill() {
  const pool = [...innerInventory.value.filter(isVisible)];
  const keep = innerInventory.value.filter((m) => !isVisible(m));
  const next: (MedalUi | null)[] = [];
  const chosenIds = new Set<string>();
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      const picked = pool.splice(idx, 1)[0];
      chosenIds.add(picked.medalId);
      next.push(picked);
    } else {
      next.push(null);
    }
  }
  innerEquipped.value = next;
  slotLists.value = Array.from({ length: SLOT_COUNT }, (_, i) => (next[i] ? [next[i] as MedalUi] : []));
  innerInventory.value = [...keep, ...pool].filter((m) => !chosenIds.has(m.medalId));
  emitEquipped();
  emitInventory();
}

function dedupeById(list: MedalUi[]): MedalUi[] {
  const map = new Map<string, MedalUi>();
  for (const m of list) map.set(m.medalId, m);
  return [...map.values()];
}

function initFromProps() {
  const equipped = Array.from({ length: SLOT_COUNT }, (_, i) => normalizeMedal(props.equipped[i] ?? null)).map((m) => (m ? withUi(m) : null));
  const equippedIds = new Set(equipped.filter(Boolean).map((m) => (m as MedalUi).medalId));
  const inventory = props.inventory
    .map(normalizeMedal)
    .filter((m): m is MedalItem => Boolean(m))
    .map(withUi)
    .filter((m) => !equippedIds.has(m.medalId));
  innerEquipped.value = equipped;
  innerInventory.value = dedupeById(inventory);
  slotLists.value = Array.from({ length: SLOT_COUNT }, (_, i) => (equipped[i] ? [equipped[i] as MedalUi] : []));
}

watch(
  () => [props.equipped, props.inventory] as const,
  initFromProps,
  { deep: true, immediate: true }
);
</script>
