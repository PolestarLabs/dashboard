<template lang="pug">
svg(xmlns="http://www.w3.org/2000/svg", width="24", height="24", viewBox="0 0 24 24")
  g(:stroke="fill", stroke-linecap="round", stroke-linejoin="round", stroke-width="2.5")
    path(:fill="fill", fill-opacity="0", stroke-dasharray="60", d="M12 3l9 17h-18l9 -17Z")
      animate(fill="freeze", attributeName="stroke-dashoffset", dur="0.3s", values="60;0")
      animate(fill="freeze", attributeName="fill-opacity", begin="0.3s", dur="0.075s", to="1")
    g(fill="none")
      path(stroke-dasharray="6", stroke-dashoffset="6", d="M12 9v4", :stroke="darken")
        animate(attributeName="stroke-width", begin="0.35s", dur="1.5s", keyTimes="0;0.1;0.2;0.3;1", repeatCount="indefinite", values="2.5;3;3;2.5;2.5")
        animate(fill="freeze", attributeName="stroke-dashoffset", begin="0.35s", dur="0.1s", to="0")
      path(stroke-dasharray="4", stroke-dashoffset="4", d="M12 17v0.01", :stroke="darken")
        animate(fill="freeze", attributeName="stroke-dashoffset", begin="0.35s", dur="0.1s", to="0")
        animate(attributeName="stroke-width", begin="0.5s", dur="1.5s", keyTimes="0;0.1;0.2;0.3;1", repeatCount="indefinite", values="2.5;3;3;2.5;2.5")

</template>


<script setup lang="ts">
// fill color will be set by <html> through --variables

const fill = getComputedStyle(document.documentElement).getPropertyValue('--plx-warning') || '#Fece30';
const darken =" #000A";
</script>