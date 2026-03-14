// This file lets TypeScript understand `.vue` imports.
// Without this, TS may say "has no default export" for Vue single-file components.

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
