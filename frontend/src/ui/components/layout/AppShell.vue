<template lang="pug">
div.min-h-screen.bg-base-200.flex
  aside(class="hidden md:flex flex-col w-64 bg-base-300")
    div.p-4.text-xl.font-bold Stardust Dashboard
    nav.menu.p-2
      RouterLink.menu-item(to="/")
        span Home
      RouterLink.menu-item(to="/stickers")
        span Stickers
      RouterLink.menu-item(to="/market")
        span Market
      RouterLink.menu-item(v-if="auth.isAuthenticated" to="/profile/edit/medals")
        span Medals (edit)
  div.flex-1.flex.flex-col
    header.navbar.bg-base-100.shadow-md
      div.flex-1.px-4
        span.text-lg.font-semibold Pollux
      div.flex-none.px-4
        template(v-if="auth.isAuthenticated")
          span.mr-3 {{ auth.user?.username }}
          SButton(size="sm" variant="ghost" @click="onLogout") Logout
        template(v-else)
          RouterLink(to="/login")
            SButton(size="sm") Sign in
    main.p-4
      slot
</template>

<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SButton from '@/ui/stardust/SButton.vue';

const auth = useAuthStore();
const router = useRouter();

const onLogout = async () => {
  await auth.logout();
  router.push({ name: 'home' });
};
</script>

