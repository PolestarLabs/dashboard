<template lang="pug">
SCard
  h1.text-xl.font-bold.mb-4 Market
  template(v-if="loading")
    span Loading listings...
  template(v-else-if="error")
    span.text-error {{ error }}
  template(v-else)
    div.grid.gap-3(class="grid-cols-1 md:grid-cols-2")
      div.card.bg-base-100.shadow-sm(v-for="item in listings" :key="item.id")
        div.card-body
          h2.card-title.text-sm {{ item.name }}
          p.text-xs.text-base-content/70 {{ item.type }}
          p.text-xs.mt-1 {{ item.price }} RBN
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getMarketplaceListings, type MarketplaceListing } from '@/api';
import SCard from '@/ui/stardust/SCard.vue';

const listings = ref<MarketplaceListing[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    listings.value = await getMarketplaceListings({ lim: 20 });
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load market';
  } finally {
    loading.value = false;
  }
});
</script>

