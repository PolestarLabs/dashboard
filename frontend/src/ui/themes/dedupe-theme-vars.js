#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const themesDir = path.join(__dirname);
const themeFiles = fs.readdirSync(themesDir).filter((f) => f.endsWith('.css'));

function stripCssCommentsPreserveLength(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
}

function dedupeFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const stripped = stripCssCommentsPreserveLength(text);

  const declRegex = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  const lines = text.split(/\r?\n/);
  const strippedLines = stripped.split(/\r?\n/);

  const declarations = []; // {name, line, start, end}
  const lastPosition = new Map();

  strippedLines.forEach((line, lineIndex) => {
    let match;
    while ((match = declRegex.exec(line)) !== null) {
      const [full, name] = match;
      const start = match.index;
      const end = match.index + full.length;
      declarations.push({ name, lineIndex, start, end });
      lastPosition.set(name, { lineIndex, start, end });
    }
  });

  if (!declarations.length) {
    return { changed: false, removed: 0 };
  }

  const groupedByLine = new Map();
  for (const decl of declarations) {
    const last = lastPosition.get(decl.name);
    if (last && last.lineIndex === decl.lineIndex && last.start === decl.start) {
      continue; // keep the bottom-most occurrence
    }
    // duplicate candidate
    if (!groupedByLine.has(decl.lineIndex)) groupedByLine.set(decl.lineIndex, []);
    groupedByLine.get(decl.lineIndex).push(decl);
  }

  if (groupedByLine.size === 0) {
    return { changed: false, removed: 0 };
  }

  let removed = 0;
  for (const [lineIndex, lineDecls] of groupedByLine.entries()) {
    const pieces = [];
    let cursor = 0;
    const sortedDecls = [...lineDecls].sort((a, b) => a.start - b.start);

    for (const decl of sortedDecls) {
      pieces.push(lines[lineIndex].slice(cursor, decl.start));
      cursor = decl.end;
      removed += 1;
    }
    pieces.push(lines[lineIndex].slice(cursor));
    lines[lineIndex] = pieces.join('');
  }

  fs.writeFileSync(filePath, lines.join('\n'));
  return { changed: true, removed };
}

let totalRemoved = 0;
let totalFixed = 0;

for (const themeFile of themeFiles) {
  const filePath = path.join(themesDir, themeFile);
  const result = dedupeFile(filePath);

  if (result.changed) {
    console.log(`✅ deduped ${themeFile}: removed ${result.removed} stale declaration(s)`);
    totalFixed += 1;
    totalRemoved += result.removed;
  } else {
    console.log(`⏺ no duplicates in ${themeFile}`);
  }
}

console.log(`\nDone. ${totalFixed} files changed, ${totalRemoved} declarations removed.`);
process.exit(0);
