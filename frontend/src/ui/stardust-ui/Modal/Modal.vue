<template lang="pug">
dialog.modal(ref="dialogEl")
  div.modal-box
    header.font-semibold.text-lg.mb-2
      slot(name="title")
    section.mb-4
      slot
    footer.modal-action
      slot(name="actions")
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dialogEl = ref<HTMLDialogElement | null>(null);
</script>
