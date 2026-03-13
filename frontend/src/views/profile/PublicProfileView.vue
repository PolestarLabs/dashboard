<template lang="pug">
SCard
  template(v-if="loading")
    span Loading profile...
  template(v-else-if="error")
    span.text-error {{ error }}
  template(v-else)
    div.flex.items-center.gap-4
      img.w-16.h-16.rounded-full(:src="profile?.meta.avatar || ''", alt="")
      div
        h1.text-xl.font-bold {{ profile?.meta.username }}
        p.text-sm.text-base-content/70 {{ profile?.profile.tagline }}
    div.mt-4.flex.gap-4.text-sm
      div
        span.font-semibold RBN:
        span.ml-1 {{ profile?.currency.RBN }}
      div
        span.font-semibold JDE:
        span.ml-1 {{ profile?.currency.JDE }}
      div
        span.font-semibold SPH:
        span.ml-1 {{ profile?.currency.SPH }}
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getPublicUser, type PublicProfile } from '@/api';
import SCard from '@/ui/stardust/SCard.vue';

const route = useRoute();
const profile = ref<PublicProfile | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const idParam = route.params.id as string | undefined;
    const id = !idParam || idParam === 'me' ? 'me' : idParam;
    profile.value = await getPublicUser(id);
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load profile';
  } finally {
    loading.value = false;
  }
};

onMounted(load);
watch(
  () => route.params.id,
  () => load(),
);
</script>

