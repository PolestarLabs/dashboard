<template lang="pug">
Card
  h1.text-2xl.font-bold.mb-2 Welcome to Pollux Dashboard v2
  p.text-sm.text-base-content/70.mb-4
    | This is the new Vue 3 + Stardust UI dashboard, backed by the Elysia API.
  div.flex.gap-2
    RouterLink(to="/stickers")
      Button(variant="secondary") Stickers
    RouterLink(to="/market")
      Button Market
    RouterLink(to="/login")
      Button(variant="ghost") Sign in
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Card from '@/ui/stardust-ui/Card/Card.vue';
import Button from '@/ui/stardust-ui/Button/Button.vue';
</script>

