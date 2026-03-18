const fs = require('fs');
const path = require('path');

const logPath = path.resolve(__dirname, 'apply-master-colors.log');
function log(...args){
  fs.appendFileSync(logPath, args.join(' ') + '\n');
}
fs.writeFileSync(logPath, '--- apply-master-colors run ---\n');

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
    const h = rgbToHex(+rgba[1], +rgba[2], +rgba[3]);
    const a = Math.round(Math.min(1, Math.max(0, +rgba[4])) * 255)
      .toString(16)
      .padStart(2, '0');
    return h + a;
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
    const hex = rgbToHex(r, g, b);
    const aa = Math.round(Math.min(1, Math.max(0, a)) * 255)
      .toString(16)
      .padStart(2, '0');
    return hex + aa;
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

log('master semantic size', semantic.size);
log('master palette size', palette.size);

// gather all SCSS variable definitions from UI styles
const uiSemantic = new Map();

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
    const val = m[2].trim();
    if (semantic.has(name)) continue;
    uiSemantic.set(name, val);
  }
});

log('found UI semantic definitions', uiSemantic.size);

// build mapping from raw color to palette token
const paletteMap = new Map(palette);

for (const [name, val] of uiSemantic) {
  const norm = normalizeColor(val);
  if (!norm) continue;
  if (norm.startsWith('var(')) {
    // map var(--) to existing semantic mapping if possible
    const mv = /^var\(\s*(--[a-zA-Z0-9_-]+)/.exec(norm);
    if (mv) {
      const key = mv[1];
      for (const [sname, sval] of semantic.entries()) {
        if (sval.includes(key)) {
          semantic.set(name, sval);
          break;
        }
      }
      if (semantic.has(name)) continue;
    }
    semantic.set(name, norm);
    continue;
  }
  if (paletteMap.has(norm)) {
    semantic.set(name, paletteMap.get(norm));
    continue;
  }
  // add new palette entry
  const idx = paletteMap.size + 1;
  const newName = `$color-${String(idx).padStart(2, '0')}`;
  paletteMap.set(norm, newName);
  semantic.set(name, newName);
}

log('after mapping, semantic size', semantic.size);
log('after mapping, palette size', paletteMap.size);

// rewrite master file with new semantics + palette
const outLines = [];
let inserted = false;
for (const line of master.lines) {
  outLines.push(line);
  if (!inserted && line.includes('// Add your own semantic aliases here.')) {
    outLines.push('');
    for (const [name, val] of semantic) {
      // skip palette vars, keep only usage tokens
      if (name.startsWith('$color-')) continue;
      outLines.push(`${name}: ${val};`);
    }
    outLines.push('');
    inserted = true;
  }
}

// replace palette block with updated palette
const paletteStart = outLines.findIndex(l => l.includes('// Literal values')); 
if (paletteStart !== -1) {
  const before = outLines.slice(0, paletteStart + 1);
  const afterIndex = outLines.findIndex((l, i) => i > paletteStart && l.startsWith('// End of master'));
  const after = afterIndex !== -1 ? outLines.slice(afterIndex) : [];
  const paletteLines = [];
  for (const [col, varName] of Array.from(paletteMap.entries()).sort()) {
    paletteLines.push(`${varName}: ${col};`);
  }
  outLines.length = 0;
  outLines.push(...before);
  outLines.push(...paletteLines);
  outLines.push('');
  outLines.push(...after);
}

fs.writeFileSync(masterPath, outLines.join('\n'), 'utf8');
log('wrote master file');

// Replace color literals in UI styles with palette variable names
walk(uiDir, file => {
  if (path.resolve(file) === masterPath) return;
  let txt = fs.readFileSync(file, 'utf8');
  const varBlocks = [];
  txt = txt.replace(/var\([^)]*\)/g, m => {
    const i = varBlocks.length;
    varBlocks.push(m);
    return `__VAR${i}__`;
  });

  for (const [col, varName] of paletteMap) {
    if (col.startsWith('var(')) continue;
    const esc = col.replace(/([.*+?^${}()|[\\]\\])/g, '\\$1');
    const re = new RegExp(esc, 'gi');
    txt = txt.replace(re, varName);
  }

  txt = txt.replace(/__VAR(\d+)__/g, (_, i) => varBlocks[+i] || '');
  fs.writeFileSync(file, txt, 'utf8');
  log('updated file', file);
});

log('done');
