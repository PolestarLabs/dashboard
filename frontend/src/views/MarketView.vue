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
        div.card-body.flex.items-center.gap-3
          img.w-12.h-12.rounded-md.object-cover(:src="thumbnailFor(item)" :alt="item.name")
          div.flex-1
            h2.card-title.text-sm {{ item.name }}
            p.text-xs.text-base-content/70.uppercase {{ item.type }}
            p.text-xs.mt-1 {{ item.price }} RBN
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getMarketplaceListings, type MarketplaceListing } from '@/api';
import { cdn } from '@/utils/cdn';
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

const thumbnailFor = (item: MarketplaceListing): string => {
  // Prefer the pre-parsed img path from the API when present.
  if (item.img) {
    // If backend already sent a full URL, just return it.
    if (item.img.startsWith('http://') || item.img.startsWith('https://')) return item.img;
    return cdn(item.img);
  }

  // Fallback: best-effort guess based on type and id.
  const key = item.id;
  const type = item.type?.toLowerCase?.() ?? '';

  if (type === 'background' || type === 'bg') {
    return cdn(`/backdrops/${key}.png`);
  }
  if (type === 'sticker') {
    return cdn(`/stickers/${key}.png`);
  }
  if (type === 'medal') {
    return cdn(`/medals/${key}.png`);
  }

  return cdn(`/items/${key}.png`);
};
</script>

