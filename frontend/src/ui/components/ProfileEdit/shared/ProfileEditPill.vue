<template lang="pug">
.st-profile-pill(:style="rootStyle")
  .st-profile-pill__bg-slot(
    v-if="backgroundImage"
    :style="{ backgroundImage: `url(${backgroundImage})`, backgroundSize: backgroundSize }"
  )
  .st-profile-pill__backblur(:style="{ opacity: String(blurOpacity) }")
  .st-profile-pill__content
    slot
</template>

<script setup lang="ts">
import { computed } from 'vue';
import './ProfileEditPill.scss';

const props = withDefaults(
  defineProps<{
    accentColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    blurOpacity?: number;
  }>(),
  {
    accentColor: '#85f',
    backgroundImage: '',
    backgroundSize: 'cover',
    blurOpacity: 0.9,
  }
);

const rootStyle = computed(() => ({
  borderColor: props.accentColor,
}));
</script>
