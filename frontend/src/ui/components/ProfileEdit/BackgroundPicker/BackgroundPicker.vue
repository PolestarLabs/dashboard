<template lang="pug">
ProfileEditPill.st-profile-bgpicker(
  :accent-color="accentColor"
  :background-image="selectedBg ? getBackgroundImage(selectedBg) : ''"
)
  .st-profile-bgpicker__info
    .st-profile-bgpicker__c1
      .st-profile-bgpicker__title Background
      .st-profile-bgpicker__name.sel {{ selectedBg?.name ?? '—' }}
      .st-profile-bgpicker__bgcode
        code.mistyblue {{ selectedBg?.code ?? '—' }}
    .st-profile-bgpicker__thumb(
      v-if="selectedBg"
      :style="{ backgroundImage: `url(${getBackgroundImage(selectedBg)})` }"
    )
  .st-profile-bgpicker__bottom
    .st-profile-bgpicker__controls
      span Sort by:
      button.st-profile-bgpicker__sort-btn(
        v-for="s in sortOptions"
        :key="s.value"
        type="button"
        :class="{ 'st-profile-bgpicker__sort-btn--active': sortBy === s.value }"
        @click="emit('sort', s.value)"
      ) {{ s.label }}
    #select-bg.st-profile-bgpicker__select
      SearchableSelectPlus.st-profile-bgpicker__searchable(
        v-model="innerValue"
        :options="sortedOptions"
        value-key="code"
        label-key="name"
        :filter="filterFn"
        placeholder="Search by name, tags, or rarity..."
        list-max-height="350px"
        :column-layout="true"
        @update:modelValue="onSelect"
      )
        template(#list-header)
          p Choose a background. Type in the box above to search by name, tags, or rarity!
        template(#selected-option="{ option }")
          span.st-profile-bgpicker__sel-wrap
            RarityIcon(v-if="option.rarity" :v="option.rarity" :size="24")
            | {{ option.name }}
        template(#option="{ option }")
          .st-profile-bgpicker__opt(:title="option.name")
            .st-profile-bgpicker__opt-face(:style="{ backgroundImage: `url(${getBackgroundImage(option)})` }")
            .st-profile-bgpicker__rarity
              RarityIcon(v-if="option.rarity" :v="option.rarity" :size="24")
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import SearchableSelectPlus from '../SearchableSelectPlus/SearchableSelectPlus.vue';
import type { SearchableSelectPlusOption } from '../SearchableSelectPlus/SearchableSelectPlus.vue';
import ProfileEditPill from '../shared/ProfileEditPill.vue';
import RarityIcon from '../../RarityIcon/RarityIcon.vue';
import './BackgroundPicker.scss';

export interface BackgroundOption extends SearchableSelectPlusOption {
  code: string;
  name: string;
  img: string;
  rarity?: 'UR' | 'SR' | 'R' | 'U' | 'C' | 'XR';
  tags?: string;
  ownedIndex?: number;
  releaseIndex?: number;
  rarIndex?: number;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: BackgroundOption[];
    accentColor?: string;
    backgroundImageBase?: string;
    /** 'name' | 'release' | 'obtained' | 'rarity' */
    sortBy?: string;
  }>(),
  { accentColor: '#85f', backgroundImageBase: 'https://cdn.pollux.gg/backdrops/', sortBy: 'obtained' }
);

const emit = defineEmits<{
  'update:modelValue': [code: string];
  sort: [type: string];
}>();

const innerValue = ref(props.modelValue);

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'release', label: 'Release Date' },
  { value: 'obtained', label: 'Obtained Order' },
  { value: 'rarity', label: 'Rarity' },
];

const sortedOptions = computed(() => {
  const list = [...props.options];
  const by = props.sortBy;
  if (by === 'name') return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  if (by === 'release') return list.sort((a, b) => (b.releaseIndex ?? 0) - (a.releaseIndex ?? 0));
  if (by === 'obtained') return list.sort((a, b) => (b.ownedIndex ?? 0) - (a.ownedIndex ?? 0));
  if (by === 'rarity') return list.sort((a, b) => (b.rarIndex ?? 0) - (a.rarIndex ?? 0));
  return list;
});

const selectedBg = computed(() =>
  props.options.find((o) => o.code === innerValue.value)
);

const filterFn = (opts: BackgroundOption[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return opts;
  return opts.filter((o) =>
    [o.name, o.code, o.tags, o.rarity].filter(Boolean).join(' ').toLowerCase().includes(q)
  );
};

function onSelect(code: string | number) {
  emit('update:modelValue', String(code));
}

function getBackgroundImage(bg: BackgroundOption): string {
  return bg.img || `${props.backgroundImageBase}${bg.code}.png`;
}

watch(
  () => props.modelValue,
  (v) => { innerValue.value = v; },
  { immediate: true }
);
</script>
