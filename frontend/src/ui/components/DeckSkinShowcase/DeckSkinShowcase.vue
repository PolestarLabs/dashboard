<template lang="pug">
div.deck-skin-showcase
  CardShowcase(
    :faceImageUrl="faceImageUrl"
    :backImageUrl="backImageUrl"
    faceAlt="Deck face"
    backAlt="Deck back"
    :style="showcaseStyle"
  )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CardShowcase from '../../stardust-ui/CardShowcase/CardShowcase.vue';
import './DeckSkinShowcase.scss';

/** Front card image filename (without path): 'HQ' or 'star' (tarot). */
export type DeckSkinFrontCard = string;

const props = withDefaults(
  defineProps<{
    /** Game segment, e.g. 'deck'. */
    game?: 'casino' | 'tarot';
    /** Skin id, e.g. 'casino_yugioh'. */
    skinId: string;
    /** Which front image to show: HQ (default) or star (tarot). */
    frontCard?: DeckSkinFrontCard;
    /** Optional scale; when unset, "casino" game uses 1.3, else 1. */
    scale?: number;
  }>(),
  { game: 'casino', frontCard: 'HQ' }
);

const computedScale = computed(
  () => props.scale ? props.scale : props.game === 'casino' ? 1.3 : 1
);

const showcaseStyle = computed(() => ({
  transform: `scale(${computedScale.value})`,
}));

const faceImageUrl = computed(
  () => `https://cdn.pollux.gg/build/cards/${props.game}/${props.skinId}/${props.frontCard}.png`
);

const backImageUrl = computed(
  () => `https://cdn.pollux.gg/build/cards/${props.game}/${props.skinId}/backface.png`
);
</script>
