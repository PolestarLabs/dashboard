<template lang="pug">
    .st-keyb-key(:color="color" :round="!!round" :styled="!!styled" :class="`st-keyb-key--${size || 'md'} ${styled ? 'st-keyb-key--styled' : ''}`" :text="text")
        span(v-if="text === 'cmd'") 
            .st-keyb-special ⌘
        span(v-else-if="text === 'shift'") 
            i.fas.fa-up-long
            span Shift
        span(v-else-if="text === 'option'")  
            .st-keyb-special ⌥
        span(v-else-if="text === 'winkey'") 
            i.fab.fa-windows.fa-lg
        span(v-else-if="text === 'ctrl:mac'") 
            i.fas.fa-chevron-up.fa-xs
            span Ctrl
        span(v-else-if="text === 'enter'") 
            i.fas.fa-level-down-alt.rotate-90
            span Enter
        span(v-else-if="text === 'backspace'") 
            i.fas.fa-long-arrow-alt-left
            span Bkspc
        span(v-else-if="text === 'tab'") 
            .st-keyb-key--tab
                i.fas.fa-up-down.rotate-90
                span Tab
        span(v-else-if="text === 'space'") 
            .st-keyb-key--spacebar Space

        span(v-else)
            | {{ text.charAt(0).toUpperCase() + text.slice(1) }}
        
</template>

<script setup lang="ts">
import './Key.scss';
import { computed } from 'vue';
const props = defineProps<{
    k: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    styled?: boolean;
    round?: boolean;
    color?: 'primary' | 'secondary' | 'danger' | 'neutral' | 'success' | 'warn' | 'info' | 'other';
}>();

const text = computed(() => {
    switch (props.k.toLowerCase()) {
        case 'meta':
        case 'cmd':
        case 'command':
            return 'cmd';
        case 'shift':
            return 'shift';
        case 'option':
            return 'option';
        case 'win':
        case 'windows':
            return 'winkey';
        case 'ctrl':
        case 'control':
            return 'ctrl';
        case 'ctrl:mac':
        case 'control:mac':
            return 'ctrl:mac';
        case 'enter':
            return 'enter';
        case 'bkspc':
        case 'backspace':
            return 'backspace';
        case 'tab':
            return 'tab';
        case 'space':
            return 'space';
        default:
            return props.k;
    }
});
</script>

