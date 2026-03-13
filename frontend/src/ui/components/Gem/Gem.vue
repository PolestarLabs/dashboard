<template lang="pug">
Icon(:size="size" class="s-gem" :class="[`s-gem--${v}`]")
  slot
</template>

<script setup lang="ts">
import Icon from '@/ui/stardust-ui/Icon/Icon.vue';
import './Gem.scss';

const props = withDefaults(
  defineProps<{
    v?: 'rubine' | 'sapphire' | 'jade' | 'token' | 'prism';
    size?: 24 | 32 | 48 | 64;
  }>(),
  {
    v: 'rubine',
    size: 24,
  },
);
</script>

