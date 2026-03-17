<template lang="pug">
ProfileEditPill.st-profile-sticker(
  :accent-color="accentColor"
  :background-image="selectedPack ? packImageUrl(selectedPack) : ''"
  background-size="200%"
)
  .st-profile-sticker__info
    .st-profile-sticker__c1
      .st-profile-sticker__title Featured Sticker
      #select-sticker.st-profile-sticker__selects
        .st-profile-sticker__help Pack
        SearchableSelectPlus.st-profile-sticker__search(
          v-model="innerPackValue"
          :options="selectablePacks"
          value-key="id"
          label-key="name"
          :filter="packFilter"
          :placeholder="'Select pack'"
          @update:modelValue="onPackSelect"
        )
          template(#selected-option="{ option }")
            span.st-profile-sticker__sel-wrap
              RarityIcon(v-if="option.rarity" :v="option.rarity" :size="24")
              | {{ option.name }}
          template(#option="{ option }")
            .st-profile-sticker__opt
              .st-profile-sticker__pack-icon(:style="{ backgroundImage: `url(${packImageUrl(option)})` }")
              span.st-profile-sticker__opt-name
                RarityIcon(v-if="option.rarity" :v="option.rarity" :size="24")
                | {{ option.name }}
        .st-profile-sticker__sticker-row(v-if="selectedPack")
          .st-profile-sticker__help Sticker
          SearchableSelectPlus.st-profile-sticker__search(
            v-model="innerStickerValue"
            :options="stickerOptionsForPack"
            value-key="id"
            label-key="name"
            :filter="stickerFilter"
            placeholder="Select sticker"
            @update:modelValue="onStickerSelect"
          )
            template(#selected-option="{ option }")
              span.st-profile-sticker__sel-wrap(v-if="option")
                RarityIcon(v-if="option.rarity" :v="option.rarity" :size="24")
                | {{ option.name }}
              span(v-else) —
            template(#option="{ option }")
              .st-profile-sticker__opt.st-profile-sticker__opt--sticker
                .st-profile-sticker__sticker-icon(:style="{ backgroundImage: `url(${stickerImageUrl(option)})` }")
                span.st-profile-sticker__opt-name
                  RarityIcon(v-if="option.rarity" :v="option.rarity" :size="24")
                  | {{ option.name }}
    .st-profile-sticker__c2
      .st-profile-sticker__pack-float(
        v-if="selectedPack"
        :style="{ backgroundImage: `url(${packImageUrl(selectedPack)})` }"
      )
      .st-profile-sticker__pak-info.st-profile-sticker__card(v-if="selectedPack")
        .st-profile-sticker__pak-title
          RarityIcon(v-if="selectedPack.rarity" :v="selectedPack.rarity" :size="24")
          | {{ selectedPack.name }}
        .st-profile-sticker__pak-size Pack Size: {{ selectedPack.size ?? stickerOptionsForPack.length }}
        .st-profile-sticker__pak-droppable Found on Lootboxes? {{ selectedPack.droppable ? 'yes' : 'no' }}
      .st-profile-sticker__sticker-thumb(
        v-if="selectedSticker"
        :style="{ backgroundImage: `url(${stickerImageUrl(selectedSticker)})` }"
      )
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import SearchableSelectPlus from '../SearchableSelectPlus/SearchableSelectPlus.vue';
import type { SearchableSelectPlusOption } from '../SearchableSelectPlus/SearchableSelectPlus.vue';
import ProfileEditPill from '../shared/ProfileEditPill.vue';
import RarityIcon from '../../RarityIcon/RarityIcon.vue';
import './StickerSelect.scss';

export interface PackOption extends SearchableSelectPlusOption {
  id: number | string;
  name: string;
  code?: string;
  icon: string;
  rarity?: 'UR' | 'SR' | 'R' | 'U' | 'C' | 'XR';
  size?: number;
  droppable?: boolean;
}

export interface StickerOption extends SearchableSelectPlusOption {
  id: string;
  name: string;
  series_id: string;
  rarity?: 'UR' | 'SR' | 'R' | 'U' | 'C' | 'XR';
}

const props = withDefaults(
  defineProps<{
    packModelValue: string | number;
    stickerModelValue: string;
    packOptions: PackOption[];
    stickerOptions: StickerOption[];
    accentColor?: string;
    /** Base URL for pack images, e.g. '/build/boosters/showcase/' */
    packImageBase?: string;
    /** Base URL for sticker images, e.g. '/stickers/' */
    stickerImageBase?: string;
  }>(),
  {
    accentColor: '#85f',
    packImageBase: 'https://cdn.pollux.gg/build/boosters/showcase/',
    stickerImageBase: 'https://cdn.pollux.gg/stickers/',
  }
);

const emit = defineEmits<{
  'update:packModelValue': [value: string | number];
  'update:stickerModelValue': [value: string];
}>();

const innerPackValue = ref(props.packModelValue);
const innerStickerValue = ref(props.stickerModelValue);

function packImageUrl(pack: PackOption): string {
  return `${props.packImageBase}${pack.icon}.png`;
}
function stickerImageUrl(sticker: StickerOption): string {
  return `${props.stickerImageBase}${sticker.id}.png`;
}

const selectablePacks = computed(() =>
  props.packOptions.filter((p) =>
    props.stickerOptions.some((s) => String(s.series_id) === String(p.icon))
  )
);

const selectedPack = computed(() => {
  if (innerPackValue.value == null || innerPackValue.value === '') return null;
  return selectablePacks.value.find((p) => String(p.id) === String(innerPackValue.value)) ?? null;
});

const stickerOptionsForPack = computed(() => {
  const pack = selectedPack.value;
  if (!pack) return [];
  return props.stickerOptions.filter((s) => String(s.series_id) === String(pack.icon));
});

const selectedSticker = computed(() => {
  if (innerStickerValue.value == null || innerStickerValue.value === '') return null;
  return props.stickerOptions.find((s) => s.id === innerStickerValue.value) ?? null;
});

const packFilter = (opts: PackOption[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return opts;
  return opts.filter((o) =>
    [o.name, o.code, o.rarity].filter(Boolean).join(' ').toLowerCase().includes(q)
  );
};

const stickerFilter = (opts: StickerOption[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return opts;
  return opts.filter((o) =>
    [o.name, o.id, o.rarity].filter(Boolean).join(' ').toLowerCase().includes(q)
  );
};

function onPackSelect(v: string | number) {
  innerPackValue.value = v;
  innerStickerValue.value = '';
  emit('update:packModelValue', v);
  emit('update:stickerModelValue', '');
}

function onStickerSelect(v: string | number) {
  innerStickerValue.value = String(v);
  emit('update:stickerModelValue', String(v));
}

watch(
  () => props.packModelValue,
  (v) => { innerPackValue.value = v; },
  { immediate: true }
);
watch(
  () => props.stickerModelValue,
  (v) => { innerStickerValue.value = v; },
  { immediate: true }
);
</script>
