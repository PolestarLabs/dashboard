<template lang="pug">
div(:class="classes")
  .s-raritybox-card__inner
    header.s-raritybox-card__header(v-if="$slots.header")
      slot(name="header")
    .s-raritybox-card__content
      div.s-raritybox-card__image(
        v-if="$slots.image || imageUrl"
        :style="imageUrl && !$slots.image ? { backgroundImage: `url(${imageUrl})` } : undefined"
      )
        slot(name="image")
      .s-raritybox-card__body
        slot
      header.s-raritybox-card__sub-header(v-if="$slots['sub-header']")
        slot(name="sub-header")
      footer.s-raritybox-card__footer(v-if="$slots.footer")
        slot(name="footer")
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './RarityboxCard.scss';

export type RarityboxCardRarity = 'C' | 'U' | 'R' | 'SR' | 'UR' | 'XR';

const props = withDefaults(
  defineProps<{
    /** Rarity tier (C, U, R, SR, UR, XR) for card gradient and border */
    rarity?: RarityboxCardRarity;
    /** Optional image URL for the card background/image area (used when image slot is empty) */
    imageUrl?: string;
    /** Greyed-out “obtained” state */
    obtained?: boolean;
    /** Greyed-out disabled/unavailable state */
    disabled?: boolean;
  }>(),
  { rarity: 'C', imageUrl: '', obtained: false, disabled: false }
);

const classes = computed(() => {
  const list = ['s-raritybox-card'];
  if (props.rarity) {
    list.push(`s-raritybox-card--${props.rarity}`);
  }
  if (props.obtained) list.push('s-raritybox-card--obtained');
  if (props.disabled) list.push('s-raritybox-card--unavailable');
  return list.join(' ');
});
</script>
