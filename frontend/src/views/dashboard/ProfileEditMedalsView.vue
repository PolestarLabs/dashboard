<template lang="pug">
Card
  h1.text-xl.font-bold.mb-4 Edit Medals (WIP)
  DraggableMedalGrid(
    v-model:equipped="equipped"
    v-model:inventory="inventory"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from '@/ui/stardust-ui/Card/Card.vue';
import DraggableMedalGrid from '@/ui/components/DraggableMedalGrid/DraggableMedalGrid.vue';

interface Medal {
  id: string;
  name: string;
}

const equipped = ref<Medal[]>([
  { id: 'm1', name: 'Medal 1' },
  { id: 'm2', name: 'Medal 2' },
]);

const inventory = ref<Medal[]>([
  { id: 'm3', name: 'Medal 3' },
  { id: 'm4', name: 'Medal 4' },
  { id: 'm5', name: 'Medal 5' },
]);
</script>

