// Polyfill layer to avoid Dart Sass legacy JS API usage.
// This file is used via Vite aliasing so that tools like Vite/Storybook
// that call the old `sass.render`/`sass.renderSync` APIs instead use
// the modern `sass.compile*` APIs.

const sass = require('sass');

function toLegacyResult(result, options = {}) {
  return {
    css: typeof result.css === 'string' ? Buffer.from(result.css) : result.css,
    map: result.sourceMap ? JSON.stringify(result.sourceMap) : null,
    stats: {
      entry: options.file || null,
      includedFiles: Array.isArray(result.loadedUrls)
        ? result.loadedUrls.map((u) => (typeof u.pathname === 'string' ? u.pathname : u.toString()))
        : [],
    },
  };
}

function render(options, callback) {
  // Legacy API expects callback(error, result)
  if (typeof callback !== 'function') {
    throw new Error('sass.render requires a callback function');
  }

  (async () => {
    try {
      const result = options.file
        ? await sass.compileAsync(options.file, options)
        : await sass.compileStringAsync(options.data || '', options);
      callback(null, toLegacyResult(result, options));
    } catch (error) {
      callback(error);
    }
  })();
}

function renderSync(options) {
  const result = options.file
    ? sass.compile(options.file, options)
    : sass.compileString(options.data || '', options);
  return toLegacyResult(result, options);
}

module.exports = {
  ...sass,
  render,
  renderSync,
};
