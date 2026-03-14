<template lang="pug">
component.st-super-shadow(
  :class="['st-super-shadow--' + variant]"
  :style="lineCol ? { '--line-col': lineCol } : undefined"
)
  slot
</template>

<script setup lang="ts">
import './SuperShadow.scss';
withDefaults(
  defineProps<{
    /** 'title' = heavier shadow, 'text' = lighter shadow */
    variant?: 'title' | 'text' | 'slim';
    /** Override shadow/outline color (e.g. #112, #0b0b1b) */
    lineCol?: string;
  }>(),
  { variant: 'text'}
);
</script>
