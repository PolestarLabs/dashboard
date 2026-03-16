<template lang="pug">
  svg(xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24')
    defs
      mask#SVGzptI4dvL
        g(stroke-linecap='round' stroke-linejoin='round' stroke-width='1.8')
          path(fill='#fff' fill-opacity='0' stroke='#fff5' stroke-dasharray='60' d='M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z')
            animate(fill='freeze' attributeName='stroke-dashoffset' dur='0.3s' values='60;0')
            animate(fill='freeze' attributeName='fill-opacity' begin='0.3s' dur='0.2s' to='0')
          g(fill='none' stroke='#FFFF' stroke-dasharray='18' stroke-linecap='round' stroke-linejoin='round' stroke-width='2')
            path(stroke-dashoffset='18' d='M8 8l8 8')
              animate(fill='freeze' attributeName='stroke-dashoffset' begin='0.4s' dur='0.2s' to='0' values='18;0')
            path(stroke-dashoffset='18' d='M16 8l-8 8')
              animate(fill='freeze' attributeName='stroke-dashoffset' begin='0.5s' dur='0.2s' to='0')
    path(:fill='fill' d='M0 0h24v24H0z' mask='url(#SVGzptI4dvL)')
</template>

<script setup lang="ts">
// fill color will be set by <html> through --variables

const fill = getComputedStyle(document.documentElement).getPropertyValue('--plx-danger') || '#ce3030';
</script>