<template lang="pug">
SCard
  h1.text-2xl.font-bold.mb-2 Welcome to Pollux Dashboard v2
  p.text-sm.text-base-content/70.mb-4
    | This is the new Vue 3 + Stardust UI dashboard, backed by the Elysia API.
  div.flex.gap-2
    RouterLink(to="/stickers")
      SButton(variant="secondary") Stickers
    RouterLink(to="/market")
      SButton Market
    RouterLink(to="/login")
      SButton(variant="ghost") Sign in
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import SCard from '@/ui/stardust/SCard.vue';
import SButton from '@/ui/stardust/SButton.vue';
</script>

