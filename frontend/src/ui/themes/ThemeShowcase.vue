<template>
  <div class="theme-showcase">
    <p class="theme-showcase__hint">
      Switch themes using the toolbar above to see how each color scheme looks.
    </p>

    <section class="theme-showcase__section">
      <h2 class="theme-showcase__heading">Typefaces</h2>
      <div class="theme-showcase__typefaces">
        <div class="theme-showcase__typeface">
          <span class="theme-showcase__typeface-label">Panton</span>
          <p class="theme-showcase__typeface-sample theme-showcase__typeface--panton">The quick brown fox jumps over the lazy dog. 0123456789</p>
        </div>
        <div class="theme-showcase__typeface">
          <span class="theme-showcase__typeface-label">Proxima Soft</span>
          <p class="theme-showcase__typeface-sample theme-showcase__typeface--proxima">The quick brown fox jumps over the lazy dog. 0123456789</p>
        </div>
      </div>
    </section>

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
        <Swatch var-name="--bg" />
        <Swatch var-name="--bg-surface" />
        <Swatch var-name="--bg-surface-alt" />
        <Swatch var-name="--bg-deep" />
      </div>
    </section>

    <section class="theme-showcase__section">
      <h2 class="theme-showcase__heading">Text</h2>
      <div class="theme-showcase__grid">
        <Swatch var-name="--on-bg" />
        <Swatch var-name="--on-faint" />
        <Swatch var-name="--bg-contrast" />
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
  color: var(--on-faint, #888);
  font-size: 0.9rem;
}

.theme-showcase__heading {
  margin: 0 0 1rem;
  color: var(--on-bg, #ccc);
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

.theme-showcase__typefaces {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.theme-showcase__typeface {
  padding: 1rem;
  background: var(--bg-surface, #2a2a3a);
  border-radius: 6px;
}

.theme-showcase__typeface-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--on-faint, #888);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.theme-showcase__typeface-sample {
  margin: 0;
  color: var(--on-bg, #ccc);
  font-size: 1.125rem;
  line-height: 1.5;
}

.theme-showcase__typeface--panton {
  font-family: var(--display-font), Panton, system-ui, sans-serif;
}

.theme-showcase__typeface--proxima {
  font-family: var(--strong-font), 'Proxima Soft', system-ui, sans-serif;
}
</style>
