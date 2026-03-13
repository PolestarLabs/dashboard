<template lang="pug">
SCard
  h1.text-xl.font-bold.mb-2 Profile settings
  p.text-sm.text-base-content/70.mb-2
    | This page will collect profile settings such as tagline, colors, backgrounds, medals and stickers.
  ul.list-disc.list-inside.text-sm
    li Tagline & about text
    li Background / flair / sticker
    li Colours and featured marriage
    li Notification and misc switches
</template>

<script setup lang="ts">
import SCard from '@/ui/stardust/SCard.vue';
</script>

