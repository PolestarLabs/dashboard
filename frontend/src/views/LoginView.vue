<template lang="pug">
SCard.max-w-md.mx-auto
  h1.text-xl.font-bold.mb-4 Sign in with Discord
  p.text-sm.mb-4
    | You will be redirected to the Pollux API for Discord OAuth.
  SButton(@click="onLogin") Continue
</template>

<script setup lang="ts">
import SCard from '@/ui/stardust/SCard.vue';
import SButton from '@/ui/stardust/SButton.vue';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://api-staging.pollux.gg';

const onLogin = () => {
  const redirect = window.location.origin;
  const url = new URL('/auth/discord', API_BASE);
  url.searchParams.set('redirect_uri', redirect);
  window.location.href = url.toString();
};
</script>

