<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<g fill="none" :stroke="fill" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5">
			<path stroke-dasharray="60" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
				<animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="60;0" />
			</path>
			<path stroke-dasharray="18" stroke-dashoffset="18" d="M9 10c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 0.98 -0.47 1.85 -1.2 2.4c-0.73 0.55 -1.3 0.6 -1.8 1.6">
				<animate fill="freeze" attributeName="stroke-dashoffset" begin="0.35s" dur="0.15s" to="0" />
			</path>
			<path stroke-dasharray="4" stroke-dashoffset="4" d="M12 17v0.01">
				<animate fill="freeze" attributeName="stroke-dashoffset" begin="0.35s" dur="0.1s" to="0" />
			</path>
		</g>
	</svg>
</template>
<script setup lang="ts">
const fill = getComputedStyle(document.documentElement).getPropertyValue('--plx-info') || '#3082ce';
</script>