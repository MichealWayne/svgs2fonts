const fs = require('fs');
const path = require('path');
for (const file of [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/types/OptionType.d.ts',
  'bin/index.js',
]) {
  if (!fs.existsSync(path.join(__dirname, '..', file)))
    throw new Error(`Missing package file: ${file}`);
}
console.error('Package entries and public types are present.');
