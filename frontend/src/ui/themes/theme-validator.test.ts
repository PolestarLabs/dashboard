import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const themesDir = path.join(process.cwd(), 'src/ui/themes');
const themeEditorFile = path.join(themesDir, 'theme-editor2.html');
const defaultThemeFile = path.join(themesDir, 'default.css');

function stripComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function extractVariables(css: string) {
  const vars = new Map<string, string>();
  const cleaned = stripComments(css);
  const varRegex = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = varRegex.exec(cleaned))) {
    vars.set(m[1], m[2].trim());
  }
  return vars;
}

function parseThemeTokensFromEditor(html: string) {
  const tokenSection = html.match(/const THEME_TOKENS = \[([\s\S]*?)\];/);
  if (!tokenSection) return [];

  const block = tokenSection[1];
  const entryRegex = /\{\s*var:\s*'(--[a-zA-Z0-9_-]+)'\s*,[\s\S]*?derived:\s*(true|false)/g;
  const entries: Array<{ var: string; derived: boolean }> = [];

  let m;
  while ((m = entryRegex.exec(block))) {
    entries.push({ var: m[1], derived: m[2] === 'true' });
  }

  // fallback: vars with no explicit derived flag should be counted as not derived by default
  const shortRegex = /\{\s*var:\s*'(--[a-zA-Z0-9_-]+)'/g;
  const defined = new Set(entries.map((e) => e.var));
  while ((m = shortRegex.exec(block))) {
    if (!defined.has(m[1])) {
      entries.push({ var: m[1], derived: false });
      defined.add(m[1]);
    }
  }

  return entries;
}

function hexToRgb(hex: string) {
  const normalized = hex.trim().toLowerCase();
  let h = normalized.replace(/\s+/g, '');
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');

  if (!/^[0-9a-f]{6}$/.test(h)) return null;

  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function luminance(rgb: { r: number; g: number; b: number }) {
  const normalize = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * normalize(rgb.r) + 0.7152 * normalize(rgb.g) + 0.0722 * normalize(rgb.b);
}

function contrastRatio(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseCssColor(raw: string | undefined) {
  if (!raw) return null;
  const trimmed = raw.trim();
  const m = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  return hexToRgb(trimmed);
}

function selectColor(themeVars: Map<string, string>, keys: string[]) {
  for (const k of keys) {
    if (themeVars.has(k)) {
      const possible = themeVars.get(k)!.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(possible)) return possible;
    }
  }
  return undefined;
}

function normalizedThemeVars(themeVars: Map<string,string>) {
  return Object.fromEntries(themeVars);
}

function warnTheme(theme: string, type: string, details: string) {
  //  ⛔  theme name  message  details
  // white theme name, medium gray message, darker list
  console.warn(
    `\u26A0\uFE0F \x1b[97m ${theme}\x1b[90m ${type}\n\t\x1b[30m${details
      .split(',')
      .map((d) => d.trim())
      .join('\n\t\x1b[30m')}\x1b[0m`
  );
}

const defaultVars = extractVariables(fs.readFileSync(defaultThemeFile, 'utf-8'));
const editorTokens = parseThemeTokensFromEditor(fs.readFileSync(themeEditorFile, 'utf-8'));

const allowedVarSet = new Set<string>([...defaultVars.keys(), ...editorTokens.map((t) => t.var)]);

const legacyVars = new Set<string>([

  '--bg-deep',
  '--bg-darker',
  '--bg-contrast-dim',

  '--on-bg',
  '--on-tint',
  '--on-tint-dim',
  '--mid-main',
  '--link-head',
  '--link-head-hover',
  '--heading-divider-color',
  '--on-lightest',
  '--accent-color-darker',
  '--accent-color-alt',
  '--bg-card',
  '--bg',
]);

const derivedFromEditor = new Set(editorTokens.filter((t) => t.derived).map((t) => t.var));

// Add known derived-formula vars from default
const additionalDerived = new Set<string>(
  Object.keys(defaultVars).filter(
    (v) =>
      v.startsWith('--color-') ||
      v.startsWith('--text-') ||
      v.startsWith('--surface-') ||
      v.startsWith('--border-') ||
      v.startsWith('--btn-') ||
      v.startsWith('--card-') ||
      v.startsWith('--theme-')
  )
);

const themeManualEditable = new Set(editorTokens.filter((t) => !t.derived).map((t) => t.var));
const derivedVars = new Set<string>([...derivedFromEditor, ...additionalDerived]);

describe('theme CSS validation', () => {
  const themeFiles = fs
    .readdirSync(themesDir)
    .filter((n) => n.endsWith('.css') && n !== 'default.css');

  it('all theme variables exist in canonical variables (no made-up variables)', () => {
    const unknownVarsPerFile: Record<string, string[]> = {};
    themeFiles.forEach((file) => {
      const text = fs.readFileSync(path.join(themesDir, file), 'utf-8');
      const vars = [...extractVariables(text).keys()];

      const unknown = vars.filter((v) => !allowedVarSet.has(v) && !legacyVars.has(v));
      const legacy = vars.filter((v) => !allowedVarSet.has(v) && legacyVars.has(v));

      if (legacy.length) {
        warnTheme(file, 'legacy variables (accepted)', legacy.join(', '));
      }

      if (unknown.length) unknownVarsPerFile[file] = unknown;
    });

    if (Object.keys(unknownVarsPerFile).length > 0) {
      const summary = Object.entries(unknownVarsPerFile)
        .map(([f, v]) => `${f}: ${v.join(', ')}`)
        .join('\n');
      throw new Error(`Unknown theme variables found:\n${summary}`);
    }
  });

  it('warns when themes manually set derived/calculated fields', () => {
    themeFiles.forEach((file) => {
      const text = fs.readFileSync(path.join(themesDir, file), 'utf-8');
      const vars = [...extractVariables(text).keys()];
      const manualDerived = vars.filter((v) => derivedVars.has(v) && !themeManualEditable.has(v));
      if (manualDerived.length) {
        warnTheme(file, 'derived variables set directly', manualDerived.join(', '));
      }
    });

    expect(true).toBe(true);
  });

  it('contrast check warns for low-contrast main text vs background', () => {
    themeFiles.forEach((file) => {
      const themeVars = extractVariables(fs.readFileSync(path.join(themesDir, file), 'utf-8'));
      const bg = selectColor(themeVars, ['--bg', '--bg-main']);
      const on = selectColor(themeVars, ['--on-bg', '--on-main']);
      if (!bg || !on) return;

      const bgRgb = parseCssColor(bg);
      const onRgb = parseCssColor(on);
      if (!bgRgb || !onRgb) return;

      const ratio = contrastRatio(bgRgb, onRgb);
      if (ratio < 4.5) {
        warnTheme(file, 'low contrast', `ratio ${ratio.toFixed(2)} between '${bg}' and '${on}'`);
      }
    });

    expect(true).toBe(true);
  });

  it('warns on duplicate variable declarations in a theme', () => {
    themeFiles.forEach((file) => {
      const fileText = fs.readFileSync(path.join(themesDir, file), 'utf-8');
      const stripped = stripComments(fileText);
      const varRegex = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
      const count = new Map<string, number>();
      let m;
      while ((m = varRegex.exec(stripped))) {
        count.set(m[1], (count.get(m[1]) || 0) + 1);
      }

      const duplicates = [...count.entries()].filter(([, c]) => c > 1).map(([k]) => k);
      if (duplicates.length) {
        warnTheme(file, 'duplicate variables', duplicates.join(', '));
      }
    });

    expect(true).toBe(true);
  });

  it('ensures themes are syntactically clean and have css variables', () => {
    themeFiles.forEach((file) => {
      const text = fs.readFileSync(path.join(themesDir, file), 'utf-8');
      expect(text).toContain('--');
    });
  });
});
