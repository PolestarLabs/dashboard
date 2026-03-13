<template lang="pug">
div.s-artist-tag
  i.s-artist-tag__icon.fas.fa-paint-brush(aria-hidden="true")
  span.s-artist-tag__label
    slot
</template>

<script setup lang="ts">
// purely presentational; label comes from slot
</script>

