<template lang="pug">
div.deck-skin-showcase
  div.deck-skin-showcase__scale(:style="showcaseStyle")
    CardShowcaseCanvas(
      :faceImageUrl="faceImageUrl"
      :backImageUrl="backImageUrl"
      :durationMs="5000"
      :easing="[0.68, -0.55, 0.27, 1.55]"
      :width="200"
      :height="280"
      :rotateX="10"
      :rotateY="15"
      :rotateZ="0"
      :borderRadius="16"
    )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CardShowcaseCanvas from '@/ui/stardust-ui/CardShowcase/CardShowcaseCanvas.vue';
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
  () => props.scale ? props.scale : props.game === 'casino' ? 1.2 : 1
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
