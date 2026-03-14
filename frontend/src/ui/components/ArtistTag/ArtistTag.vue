<template lang="pug">
a.s-artist-tag(
  v-if="href"
  :href="href"
  :class="{ 's-artist-tag--no-background': noBackground }"
)
  i.s-artist-tag__icon.fas.fa-paint-brush(aria-hidden="true")
  span.s-artist-tag__label
    slot
div.s-artist-tag(
  v-else
  :class="{ 's-artist-tag--no-background': noBackground }"
)
  i.s-artist-tag__icon.fas.fa-paint-brush(aria-hidden="true")
  span.s-artist-tag__label
    slot
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** When set, the tag becomes a link (renders as anchor) */
    href?: string;
    /** Hide the ribbon background and tail */
    noBackground?: boolean;
  }>(),
  {}
);
</script>

