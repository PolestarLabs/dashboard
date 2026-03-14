<template lang="pug">
li.st-megastroke-menuitem(:class="{ 'st-megastroke-menuitem--active': active, 'st-megastroke-menuitem--disabled': disabled }")
  button.st-megastroke-menuitem__link(type="button" :disabled="disabled" @click="onClick")
    i(v-if="icon" :class="icon")
    slot
</template>

<script setup lang="ts">
import './MegastrokeMenuItem.scss';

withDefaults(
  defineProps<{
    /** Active/selected state (coloured block + arrow) */
    active?: boolean;
    /** Disabled state (no click, dimmed) */
    disabled?: boolean;
    /** FontAwesome icon class (e.g. "fa fa-store", "fas fa-gift") */
    icon?: string;
  }>(),
  { active: false, disabled: false }
);

const emit = defineEmits<{ click: [e: MouseEvent] }>();

function onClick(e: MouseEvent) {
  emit('click', e);
}
</script>
