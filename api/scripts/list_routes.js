#!/usr/bin/env node
// Simple script to enumerate Elysia route endpoints under api/src/routes

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.ts')) {
      results.push(full);
    }
  });
  return results;
}

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  // ignore drafts: if first nonempty line starts with //DRAFT, treat as empty
  for (const l of lines) {
    const t = l.trim();
    if (t === '') continue;
    if (t.startsWith('//DRAFT')) return { entries: [] };
    break;
  }

  // we may have multiple routers per file, so track current prefix as we scan
  let currentPrefix = '';
  const entries = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // update prefix when a new Elysia instance is created
    const preMatch = line.match(/new\s+Elysia\s*\(\s*\{[^}]*prefix\s*:\s*['\"]([^'\"]+)['\"]/);
    if (preMatch) {
      currentPrefix = preMatch[1] || '';
    }

    // ignore commented-out lines
    if (line.trim().startsWith('//')) continue;
    const routeMatch = line.match(/\.(get|post|delete|patch|put)\(\s*['\"]([^'\"]+)['\"]/);
    if (routeMatch) {
      const method = routeMatch[1].toUpperCase();
      const route = routeMatch[2];

      // look for comment description above or on same line
      let desc = '';
      const inline = line.split('//')[1];
      if (inline) {
        desc = inline.trim();
      } else {
        for (let j = i - 1; j >= 0 && j > i - 3; j--) {
          const prev = lines[j].trim();
          if (prev.startsWith('//')) {
            desc = prev.replace(/^\/\//, '').trim();
            break;
          }
          if (prev !== '') break;
        }
      }

      // clean description: if comment begins with
      //   METHOD <path> — text
      // or
      //   METHOD <path> --> text
      // strip the leading verb and path so only the prose remains.
      desc = desc.replace(/^[A-Z]+\s+\S+\s*(?:—|-->)\s*/, '');
      entries.push({ method, route, desc, prefix: currentPrefix });
    }
  }

  return { entries };
}

function format() {
  const files = walk(routesDir);
  let out = '';
  files.forEach((file) => {
    const rel = path.relative(path.join(__dirname, '../src'), file);
    const base = path.basename(file, '.ts');
    const title = base.charAt(0).toUpperCase() + base.slice(1);
    const { entries } = parseFile(file);
    if (entries.length === 0) return;
    out += `---------\n## ${title}\n`;
    out += `**source:** /src/${rel}\n\n`;
    // group by method
    const byMethod = {};
    entries.forEach(e => {
      byMethod[e.method] = byMethod[e.method] || [];
      byMethod[e.method].push(e);
    });
    Object.keys(byMethod).sort().forEach(method => {
      out += `#### ${method}\n`;
      byMethod[method].forEach(e => {
        // combine prefix and route, avoiding duplicate slashes
        let full = '';
        const pref = e.prefix || '';
        if (pref === '/') {
          full = e.route;
        } else {
          full = pref + e.route;
        }
        // collapse any repeated slashes (e.g. prefix '/' + route '/x')
        full = full.replace(/\/{2,}/g, '/');
        const desc = e.desc ? ` - ${e.desc}` : '';
        out += ` - \`${method}\` \`${full}\` ${desc}\n`;
      });
      out += '\n';
    });
    out += '\n';
  });
  return out;
}

if (require.main === module) {
  const result = format();
  process.stdout.write(result);

  // also write markdown summary to routes.md for convenience
  try {
    fs.writeFileSync(path.join(__dirname, 'routes.md'), result, 'utf8');
  } catch (e) {
    console.error('failed to write routes.md', e);
  }
}

// const fs=require('fs'); const cp=require('child_process'); cp.exec('node list_routes.js', (e,o)=>{ if(e) throw e; fs.writeFileSync('routes.md', o); });