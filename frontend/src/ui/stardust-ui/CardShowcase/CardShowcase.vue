<template lang="pug">
div.card-showcase
  div.card-showcase__container
    div.card-showcase__flip
      div.card-showcase__face
        img(
          v-if="faceImageUrl"
          :src="faceImageUrl"
          :alt="faceAlt"
          loading="lazy"
        )
      div.card-showcase__back
        img(
          v-if="backImageUrl"
          :src="backImageUrl"
          :alt="backAlt"
          loading="lazy"
        )
</template>

<script setup lang="ts">
import './CardShowcase.scss';

defineProps<{
  /** URL for the front/face image */
  faceImageUrl?: string;
  /** URL for the back image */
  backImageUrl?: string;
  /** Alt text for the face image */
  faceAlt?: string;
  /** Alt text for the back image */
  backAlt?: string;
}>();
</script>
