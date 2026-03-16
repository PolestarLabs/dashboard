<template lang="pug">
svg(xmlns="http://www.w3.org/2000/svg", width="24", height="24", viewBox="0 0 24 24")
  g(fill="none", :stroke="fill", stroke-linecap="round", stroke-linejoin="round", stroke-width="1.8")
    path(stroke-dasharray="60", stroke-dashoffset="60", d="M12 3c4.97 0 9 4.03 9 9s-4.03 9 -9 9s-9 -4.03 -9 -9s4.03 -9 9 -9Z")
      animate(fill="freeze", attributeName="stroke-dashoffset", begin="0.3s", dur="0.4s", calcMode="spline", keyTimes="0;1", keySplines="0.5 0 0.5 1", values="60;15;")
      animate(fill="freeze", attributeName="stroke-dashoffset", begin="0.63s", dur="0.3s", calcMode="spline", keyTimes="0;1", keySplines="0.5 0 0.5 1", values="15;-60;")
    path(stroke-dasharray="60", opacity=".2", d="M12 3c4.97 0 9 4.03 9 9s-4.03 9 -9 9s-9 -4.03 -9 -9s4.03 -9 9 -9Z")
    path(stroke-dasharray="18", stroke-dashoffset="18", d="M8 12l3 3l5 -6")
      animate(fill="freeze", attributeName="stroke-dashoffset", begin="0.7s", dur="0.3s", calcMode="spline", keyTimes="0;1", keySplines="0.5 0 0.5 1", to="0")

</template>
<script setup lang="ts">
const fill = getComputedStyle(document.documentElement).getPropertyValue('--plx-green') || '#31e2b4';
</script>
