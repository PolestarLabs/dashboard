<template lang="pug">
div
  h2.text-lg.font-semibold.mb-2 Equipped
  draggable.grid.grid-cols-4.gap-2(
    v-model="innerEquipped"
    item-key="id"
    group="medals"
  )
    template(#item="{ element }")
      div.p-2.bg-base-300.rounded.text-center
        span.text-xs {{ element.name }}

  h2.text-lg.font-semibold.mt-4.mb-2 Inventory
  draggable.flex.flex-wrap.gap-2(
    v-model="innerInventory"
    item-key="id"
    group="medals"
  )
    template(#item="{ element }")
      div.px-2.py-1.bg-base-200.rounded.text-xs
        span {{ element.name }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';

interface Medal {
  id: string;
  name: string;
}

const props = defineProps<{
  equipped: Medal[];
  inventory: Medal[];
}>();

const emit = defineEmits<{
  (e: 'update:equipped', value: Medal[]): void;
  (e: 'update:inventory', value: Medal[]): void;
}>();

const innerEquipped = computed({
  get: () => props.equipped,
  set: (val) => emit('update:equipped', val),
});

const innerInventory = computed({
  get: () => props.inventory,
  set: (val) => emit('update:inventory', val),
});
</script>

