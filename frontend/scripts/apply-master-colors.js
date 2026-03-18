const fs = require('fs');
const path = require('path');

const uiDir = path.resolve(__dirname, '..', 'src', 'ui');
const masterPath = path.join(uiDir, '_master-colors.scss');

function normalizeColor(raw) {
  if (!raw) return raw;
  const s = raw.trim().toLowerCase();
  if (s.startsWith('var(')) return s;
  const hex3 = /^#([0-9a-f]{3})$/i.exec(s);
  if (hex3) return '#' + hex3[1].split('').map(c => c + c).join('');
  const hex4 = /^#([0-9a-f]{4})$/i.exec(s);
  if (hex4) return '#' + hex4[1].split('').map(c => c + c).join('');
  const hex6 = /^#([0-9a-f]{6})$/i.exec(s);
  if (hex6) return '#' + hex6[1];
  const hex8 = /^#([0-9a-f]{8})$/i.exec(s);
  if (hex8) return '#' + hex8[1];
  const rgb = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(s);
  if (rgb) return rgbToHex(+rgb[1], +rgb[2], +rgb[3]);
  const rgba = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/i.exec(s);
  if (rgba) {
    const base = rgbToHex(+rgba[1], +rgba[2], +rgba[3]);
    const alpha = Math.round(Math.min(1, Math.max(0, +rgba[4])) * 255)
      .toString(16)
      .padStart(2, '0');
    return base + alpha;
  }
  const hsl = /^hsl\(\s*([0-9.]+)(?:deg)?\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)%\s*\)$/i.exec(s);
  if (hsl) {
    const h = +hsl[1];
    const st = +hsl[2] / 100;
    const l = +hsl[3] / 100;
    const [r, g, b] = hslToRgb(h, st, l);
    return rgbToHex(r, g, b);
  }
  const hsla = /^hsla\(\s*([0-9.]+)(?:deg)?\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)\s*\)$/i.exec(s);
  if (hsla) {
    const h = +hsla[1];
    const st = +hsla[2] / 100;
    const l = +hsla[3] / 100;
    const a = +hsla[4];
    const [r, g, b] = hslToRgb(h, st, l);
    const base = rgbToHex(r, g, b);
    const alpha = Math.round(Math.min(1, Math.max(0, a)) * 255)
      .toString(16)
      .padStart(2, '0');
    return base + alpha;
  }
  return s;
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map(v => Math.round(v).toString(16).padStart(2, '0'))
      .join('')
  );
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function readMaster() {
  const txt = fs.readFileSync(masterPath, 'utf8');
  const lines = txt.split('\n');
  const palette = new Map();
  const semantic = new Map();

  for (const line of lines) {
    const m = /^\s*\$(color-[^:\s]+):\s*([^;]+);/.exec(line);
    if (m) {
      palette.set(normalizeColor(m[2]), m[1]);
      continue;
    }
    const m2 = /^\s*\$([a-zA-Z0-9_-]+):\s*([^;]+);/.exec(line);
    if (m2) {
      const name = '$' + m2[1];
      if (!name.startsWith('$color-')) {
        semantic.set(name, m2[2].trim());
      }
    }
  }

  return {palette, semantic, lines};
}

const master = readMaster();
const palette = master.palette;
const semantic = master.semantic;

// find new semantic tokens inside UI styles
const semanticToAdd = new Map();

function walk(dir, cb) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'themes') continue;
      walk(p, cb);
    } else {
      if (!['.scss', '.css'].includes(path.extname(name))) continue;
      cb(p);
    }
  }
}

walk(uiDir, file => {
  if (path.resolve(file) === masterPath) return;
  const txt = fs.readFileSync(file, 'utf8');
  const regex = /^\s*\$([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/gm;
  let m;
  while ((m = regex.exec(txt))) {
    const name = '$' + m[1];
    if (semantic.has(name)) continue;
    const val = m[2].trim();
    const norm = normalizeColor(val);
    if (!norm) continue;
    if (norm.startsWith('var(')) {
      // keep existing var usage if it matches existing mapping
      const mv = /^var\(\s*(--[a-zA-Z0-9_-]+)/.exec(norm);
      if (mv) {
        const found = Array.from(semantic.entries()).find(([, v]) => v.includes(mv[1]));
        if (found) {
          semanticToAdd.set(name, found[1]);
          continue;
        }
      }
      semanticToAdd.set(name, norm);
      continue;
    }
    const mapped = palette.get(norm);
    if (mapped) {
      semanticToAdd.set(name, mapped);
      continue;
    }
    // create new palette entry
    const idx = palette.size + 1;
    const newName = `$color-${String(idx).padStart(2, '0')}`;
    palette.set(norm, newName);
    semanticToAdd.set(name, newName);
  }
});

// Inject semantic tokens into master file right after the "Add your own semantic aliases here." line
const out = [];
let inserted = false;
for (const line of master.lines) {
  out.push(line);
  if (!inserted && line.includes('// Add your own semantic aliases here.')) {
    out.push('');
    for (const [name, val] of semanticToAdd) {
      out.push(`${name}: ${val};`);
    }
    out.push('');
    inserted = true;
  }
}
fs.writeFileSync(masterPath, out.join('\n'), 'utf8');

// Replace literal colors in UI styles with palette tokens
const paletteMap = new Map(palette);
walk(uiDir, file => {
  if (path.resolve(file) === masterPath) return;
  let txt = fs.readFileSync(file, 'utf8');

  // protect var() blocks
  const blocks = [];
  txt = txt.replace(/var\([^)]*\)/g, m => {
    const i = blocks.length;
    blocks.push(m);
    return `__VAR${i}__`;
  });

  for (const [col, varName] of paletteMap) {
    if (col.startsWith('var(')) continue;
    const esc = col.replace(/([.*+?^${}()|[\\]\\])/g, '\\$1');
    const re = new RegExp(esc, 'gi');
    txt = txt.replace(re, varName);
  }

  txt = txt.replace(/__VAR(\d+)__/g, (_, i) => blocks[+i] || '');
  fs.writeFileSync(file, txt, 'utf8');
});

console.log('Updated master file with', semanticToAdd.size, 'semantic tokens');
console.log('Replaced literals in UI styles using master palette.');
