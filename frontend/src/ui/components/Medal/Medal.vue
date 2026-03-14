<template lang="pug">
div.s-medal-chip
  div.s-medal-chip__rarity(:class="rarityIconPosition" v-if="rarity")
    RarityIcon :rarity="rarity"
  div.s-medal-chip__face(:style="faceStyle")
    img(:src="`https://cdn.pollux.gg/medals/${medal}.png`")
</template>

<script setup lang="ts">
import RarityIcon from '../RarityIcon/RarityIcon.vue';
import { computed } from 'vue';
import './Medal.scss';

const props = defineProps<{
  medal?: string; // URL for medal face background
  rarity?: "UR" | "XR" | "SR" | "R" | "U"| "C";
  iconPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}>();
const rarityIconPosition = computed(() =>
  props.iconPosition
    ? props.iconPosition
    : 'top-left',
);
const faceStyle = computed(() =>
  props.medal
    ? { backgroundImage: `url(https://cdn.pollux.gg/medals/${props.medal}.png)` }
    : {}
);

</script>

