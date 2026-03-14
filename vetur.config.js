/**
 * Vetur project configuration: point Vetur at the frontend TS project.
 * This ensures `.vue` imports and `defineProps` resolve correctly.
 */
module.exports = {
  projects: [
    {
      root: './frontend',
      tsconfig: './frontend/tsconfig.json',
      package: './frontend/package.json',
    },
  ],
};
