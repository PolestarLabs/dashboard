<template lang="pug">
Card
  h1.text-xl.font-bold.mb-4 Stickers
  template(v-if="loading")
    span Loading stickers...
  template(v-else-if="error")
    span.text-error {{ error }}
  template(v-else)
    div.grid.gap-3(class="grid-cols-1 md:grid-cols-3")
      div.card.bg-base-100.shadow-sm(v-for="sticker in stickers" :key="sticker.id")
        div.card-body
          h2.card-title.text-sm {{ sticker.name }}
          p.text-xs.text-base-content/70 {{ sticker.type }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { searchCosmetics, type CosmeticItem } from '@/api/cosmetics';
import Card from '@/ui/stardust-ui/Card/Card.vue';

const stickers = ref<CosmeticItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    stickers.value = await searchCosmetics({ type: 'sticker', lim: 24 });
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load stickers';
  } finally {
    loading.value = false;
  }
});
</script>

