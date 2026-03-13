<template>
  <div class="theme-showcase">
    <p class="theme-showcase__hint">
      Switch themes using the toolbar above to see how each color scheme looks.
    </p>

    <section class="theme-showcase__section">
      <h2 class="theme-showcase__heading">Accent</h2>
      <div class="theme-showcase__grid">
        <Swatch var-name="--accent-color" />
        <Swatch var-name="--accent-color-mid" />
        <Swatch var-name="--accent-color-dark" />
      </div>
    </section>

    <section class="theme-showcase__section">
      <h2 class="theme-showcase__heading">Secondary</h2>
      <div class="theme-showcase__grid">
        <Swatch var-name="--secondary-color" />
        <Swatch var-name="--secondary-color-alt" />
      </div>
    </section>

    <section class="theme-showcase__section">
      <h2 class="theme-showcase__heading">Backgrounds</h2>
      <div class="theme-showcase__grid">
        <Swatch var-name="--bg-main" />
        <Swatch var-name="--bg-dark" />
        <Swatch var-name="--bg-darker" />
        <Swatch var-name="--bg-darkest" />
      </div>
    </section>

    <section class="theme-showcase__section">
      <h2 class="theme-showcase__heading">Text</h2>
      <div class="theme-showcase__grid">
        <Swatch var-name="--text-main" />
        <Swatch var-name="--text-faint" />
        <Swatch var-name="--color-contrast" />
      </div>
    </section>

    <section class="theme-showcase__section">
      <h2 class="theme-showcase__heading">Semantic (plx)</h2>
      <div class="theme-showcase__grid">
        <Swatch var-name="--plx-green" />
        <Swatch var-name="--plx-yellow" />
        <Swatch var-name="--plx-danger" />
        <Swatch var-name="--plx-salmon" />
        <Swatch var-name="--plx-blue" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Swatch from './ThemeSwatch.vue';
</script>

<style scoped>
.theme-showcase {
  padding: 1.5rem;
  font-family: Panton, system-ui, sans-serif;
}

.theme-showcase__hint {
  margin-bottom: 2rem;
  color: var(--text-faint, #888);
  font-size: 0.9rem;
}

.theme-showcase__heading {
  margin: 0 0 1rem;
  color: var(--text-main, #ccc);
  font-size: 1.1rem;
  font-weight: 600;
}

.theme-showcase__section {
  margin-bottom: 2rem;
}

.theme-showcase__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}
</style>
