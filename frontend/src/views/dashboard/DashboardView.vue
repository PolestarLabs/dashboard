<template lang="pug">
SCard
  h1.text-2xl.font-bold.mb-4 Dashboard
  p.text-sm.text-base-content/70.mb-4
    | This is the main dashboard shell: servers, favourites, quick actions.
  ul.list-disc.list-inside.text-sm
    li Guild list and status
    li Favourite servers
    li Shortcuts to configuration sections
</template>

<script setup lang="ts">
import SCard from '@/ui/stardust/SCard.vue';
</script>

