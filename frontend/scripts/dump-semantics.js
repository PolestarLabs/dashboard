const fs = require('fs');
const path = require('path');
const masterPath = path.resolve(__dirname, '..', 'src', 'ui', '_master-colors.scss');
const outPath = path.resolve(__dirname, 'semantics.dump.txt');
const txt = fs.readFileSync(masterPath, 'utf8');
const semantic = [];
for(const line of txt.split('\n')){
  const m = /^\s*\$([a-zA-Z0-9_-]+):\s*([^;]+);/.exec(line);
  if(m){
    const name = '$' + m[1];
    if(!name.startsWith('$color-')) semantic.push(`${name}: ${m[2].trim()}`);
  }
}
fs.writeFileSync(outPath, semantic.join('\n'));
console.log('wrote', outPath, 'with', semantic.length, 'entries');
